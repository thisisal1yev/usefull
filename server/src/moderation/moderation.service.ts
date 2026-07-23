import { Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

export type ReportTarget = 'question' | 'answer'

export interface ReportedItem {
  id: string
  body: string
  reports: number
}

const TABLE: Record<ReportTarget, 'community_questions' | 'answers'> = {
  question: 'community_questions',
  answer: 'answers',
}

@Injectable()
export class ModerationService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async report(reporterId: string, targetType: ReportTarget, targetId: string) {
    const { error } = await this.db
      .from('reports')
      .insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId })
      .select()
      .single()
    if (error) {
      if ((error as { code?: string }).code === '23505') return { result: 'duplicate' as const }
      throw error
    }
    return { result: 'reported' as const }
  }

  private async collect(targetType: ReportTarget): Promise<ReportedItem[]> {
    const { data: reports, error } = await this.db
      .from('reports')
      .select('target_id')
      .eq('target_type', targetType)
    if (error) throw error
    const counts = new Map<string, number>()
    for (const r of (reports ?? []) as Array<{ target_id: string }>) {
      counts.set(r.target_id, (counts.get(r.target_id) ?? 0) + 1)
    }
    const ids = [...counts.keys()]
    if (ids.length === 0) return []
    const { data: rows, error: rowsError } = await this.db
      .from(TABLE[targetType])
      .select('id, body')
      .in('id', ids)
      .eq('is_removed', false)
    if (rowsError) throw rowsError
    return ((rows ?? []) as Array<{ id: string; body: string }>).map((row) => ({
      id: row.id,
      body: row.body,
      reports: counts.get(row.id) ?? 0,
    }))
  }

  async listReported() {
    const [questions, answers] = await Promise.all([this.collect('question'), this.collect('answer')])
    return { questions, answers }
  }

  async remove(targetType: ReportTarget, targetId: string) {
    const { error } = await this.db.from(TABLE[targetType]).update({ is_removed: true }).eq('id', targetId)
    if (error) throw error
    return { removed: true as const }
  }
}
