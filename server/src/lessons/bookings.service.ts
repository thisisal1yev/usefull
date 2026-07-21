import {
  BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException,
} from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const TEACHER_USER = 'teacher:teachers!teacher_slots_teacher_id_fkey(user:users!teachers_user_id_fkey(id, first_name, username, tg_id, ui_lang))'
const SLOT_EMBED = `*, ${TEACHER_USER}`
const BOOKING_EMBED = `*, slot:teacher_slots!bookings_slot_id_fkey(id, teacher_id, starts_at, ends_at, ${TEACHER_USER}), learner:users!bookings_learner_id_fkey(id, first_name, username, tg_id, ui_lang)`

@Injectable()
export class BookingsService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  freeLimitFor(plan: string): number {
    return plan === 'free' ? 1 : 3
  }

  async book(learner: { id: string; plan: string }, slotId: string) {
    const { data: slot, error } = await this.db
      .from('teacher_slots')
      .select(SLOT_EMBED)
      .eq('id', slotId)
      .maybeSingle()
    if (error) throw error
    if (!slot) throw new NotFoundException('Slot not found')
    if (new Date(slot.starts_at).getTime() <= Date.now()) {
      throw new BadRequestException('Slot is in the past')
    }
    if (slot.teacher_id === learner.id) throw new BadRequestException('Cannot book your own slot')

    const since = new Date(Date.now() - WEEK_MS).toISOString()
    const recent = await this.db
      .from('bookings')
      .select('id')
      .eq('learner_id', learner.id)
      .eq('type', 'free')
      .gte('created_at', since)
      .limit(10)
    if (recent.error) throw recent.error
    if ((recent.data ?? []).length >= this.freeLimitFor(learner.plan)) {
      throw new ForbiddenException('weekly_limit')
    }

    const { data: booking, error: insError } = await this.db
      .from('bookings')
      .insert({ slot_id: slotId, learner_id: learner.id, type: 'free' })
      .select()
      .single()
    if (insError) {
      if ((insError as { code?: string }).code === '23505') {
        throw new ConflictException('Slot already booked')
      }
      throw insError
    }
    return { booking, slot }
  }

  async myBookings(userId: string) {
    const { data, error } = await this.db
      .from('bookings')
      .select(BOOKING_EMBED)
      .eq('learner_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return data
  }

  async cancel(userId: string, bookingId: string) {
    const { data: booking, error } = await this.db
      .from('bookings')
      .select(BOOKING_EMBED)
      .eq('id', bookingId)
      .maybeSingle()
    if (error) throw error
    if (!booking) throw new NotFoundException('Booking not found')
    const isLearner = booking.learner_id === userId
    const isTeacher = booking.slot?.teacher_id === userId
    if (!isLearner && !isTeacher) throw new ForbiddenException('Not your booking')

    const { error: delError } = await this.db.from('bookings').delete().eq('id', bookingId)
    if (delError) throw delError
    return { booking, slot: booking.slot, cancelledBy: isLearner ? ('learner' as const) : ('teacher' as const) }
  }

  async dueReminders(hours: 24 | 1) {
    const flag = hours === 24 ? 'reminded_24h' : 'reminded_1h'
    const now = new Date().toISOString()
    const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
    const { data, error } = await this.db
      .from('bookings')
      .select(BOOKING_EMBED)
      .eq('status', 'booked')
      .eq(flag, false)
      .limit(100)
    if (error) throw error
    // окно фильтруется в JS: PostgREST-фильтры по вложенным таблицам требуют !inner-join
    return (data ?? []).filter(
      (b: { slot: { starts_at: string } | null }) =>
        b.slot && b.slot.starts_at >= now && b.slot.starts_at <= until,
    )
  }

  async markReminded(bookingId: string, hours: 24 | 1) {
    const patch = hours === 24 ? { reminded_24h: true } : { reminded_1h: true }
    const { error } = await this.db.from('bookings').update(patch).eq('id', bookingId)
    if (error) throw error
  }
}
