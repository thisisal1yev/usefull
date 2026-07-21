import {
  BadRequestException, ConflictException, Inject, Injectable, NotFoundException,
} from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

const hasCoach = (v: unknown): boolean => (Array.isArray(v) ? v.length > 0 : v != null)

@Injectable()
export class CoachService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async goldWithoutCoach() {
    const { data, error } = await this.db
      .from('users')
      .select('id, first_name, username, tg_id, ui_lang, plan_expires_at, coach_assignments!coach_assignments_learner_id_fkey(id)')
      .eq('plan', 'gold')
      .limit(50)
    if (error) throw error
    return (data ?? []).filter((u: { coach_assignments: unknown }) => !hasCoach(u.coach_assignments))
  }

  async assign(learnerId: string, coachUsername: string) {
    const { data: coach, error } = await this.db
      .from('users')
      .select()
      .eq('username', coachUsername.replace(/^@/, ''))
      .maybeSingle()
    if (error) throw error
    if (!coach) throw new NotFoundException('Coach not found')
    if (coach.id === learnerId) throw new BadRequestException('Coach cannot be the learner')

    const { data: learner, error: learnerError } = await this.db
      .from('users')
      .select()
      .eq('id', learnerId)
      .maybeSingle()
    if (learnerError) throw learnerError
    if (!learner) throw new NotFoundException('Learner not found')

    const { error: insError } = await this.db
      .from('coach_assignments')
      .insert({ learner_id: learnerId, coach_id: coach.id })
      .select()
      .single()
    if (insError) {
      if ((insError as { code?: string }).code === '23505') {
        throw new ConflictException('Learner already has a coach')
      }
      throw insError
    }
    return { learner, coach }
  }
}
