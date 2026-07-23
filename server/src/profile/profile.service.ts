import { Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'
import { computeStreak } from './streak'

export interface ProfileOverview {
  streak: number
  progress: { lessons: number; partners: number }
  history: Array<{ teacher: string; starts_at: string }>
}

const SLOT_EMBED =
  'slot:teacher_slots!bookings_slot_id_fkey(starts_at, teacher:teachers!teacher_slots_teacher_id_fkey(user:users!teachers_user_id_fkey(first_name)))'

@Injectable()
export class ProfileService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  private async activityDates(userId: string): Promise<string[]> {
    const bookings = await this.db
      .from('bookings')
      .select('created_at')
      .eq('learner_id', userId)
      .limit(500)
    if (bookings.error) throw bookings.error

    const matches = await this.db
      .from('match_requests')
      .select('created_at')
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .eq('status', 'accepted')
      .limit(500)
    if (matches.error) throw matches.error

    return [
      ...((bookings.data ?? []) as Array<{ created_at: string }>).map((b) => b.created_at.slice(0, 10)),
      ...((matches.data ?? []) as Array<{ created_at: string }>).map((m) => m.created_at.slice(0, 10)),
    ]
  }

  async progress(userId: string): Promise<{ lessons: number; partners: number }> {
    const lessons = await this.db
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('learner_id', userId)
    if (lessons.error) throw lessons.error

    const partners = await this.db
      .from('match_requests')
      .select('id', { count: 'exact', head: true })
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .eq('status', 'accepted')
    if (partners.error) throw partners.error

    return { lessons: lessons.count ?? 0, partners: partners.count ?? 0 }
  }

  async history(userId: string): Promise<Array<{ teacher: string; starts_at: string }>> {
    const { data, error } = await this.db
      .from('bookings')
      .select(SLOT_EMBED)
      .eq('learner_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    const now = new Date().toISOString()
    return ((data ?? []) as Array<{
      slot: { starts_at: string; teacher: { user: { first_name: string } | null } | null } | null
    }>)
      .filter((b) => b.slot && b.slot.starts_at < now)
      .map((b) => ({
        teacher: b.slot!.teacher?.user?.first_name ?? '?',
        starts_at: b.slot!.starts_at,
      }))
  }

  async overview(userId: string): Promise<ProfileOverview> {
    const [dates, progress, history] = await Promise.all([
      this.activityDates(userId),
      this.progress(userId),
      this.history(userId),
    ])
    return { streak: computeStreak(dates, new Date()), progress, history }
  }
}
