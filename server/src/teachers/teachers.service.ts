import {
  BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException,
} from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

const SLOT_MINUTES = 60

// PostgREST returns the bookings embed as an array or, for the one-to-one
// relation (unique index on bookings.slot_id), as an object/null.
const hasBooking = (bookings: unknown): boolean =>
  Array.isArray(bookings) ? bookings.length > 0 : bookings != null

@Injectable()
export class TeachersService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async apply(userId: string, data: { bio: string; experience?: string; certificatesUrl?: string }) {
    const { data: row, error } = await this.db
      .from('teachers')
      .upsert(
        {
          user_id: userId,
          bio: data.bio,
          experience: data.experience ?? null,
          certificates_url: data.certificatesUrl ?? null,
          status: 'pending',
        },
        { onConflict: 'user_id' },
      )
      .select()
      .single()
    if (error) throw error
    return row
  }

  async myProfile(userId: string) {
    const { data, error } = await this.db.from('teachers').select().eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data
  }

  async listApproved() {
    const { data, error } = await this.db
      .from('teachers')
      .select('*, user:users!teachers_user_id_fkey(id, first_name, username)')
      .eq('status', 'approved')
      .order('created_at', { ascending: true })
      .limit(50)
    if (error) throw error
    return data
  }

  async listByStatus(status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await this.db
      .from('teachers')
      .select('*, user:users!teachers_user_id_fkey(id, first_name, username)')
      .eq('status', status)
      .order('created_at', { ascending: true })
      .limit(50)
    if (error) throw error
    return data
  }

  async setStatus(userId: string, status: 'approved' | 'rejected') {
    const { data, error } = await this.db
      .from('teachers')
      .update({ status })
      .eq('user_id', userId)
      .select()
      .single()
    if (error) throw error
    if (status === 'approved') {
      const { error: roleError } = await this.db
        .from('users')
        .update({ role: 'teacher' })
        .eq('id', userId)
        .eq('role', 'learner')
      if (roleError) throw roleError
    }
    return data
  }

  async createSlot(teacherId: string, startsAt: Date) {
    if (startsAt.getTime() <= Date.now()) throw new BadRequestException('Slot must be in the future')
    const endsAt = new Date(startsAt.getTime() + SLOT_MINUTES * 60_000)
    const { data, error } = await this.db
      .from('teacher_slots')
      .insert({ teacher_id: teacherId, starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
      .select()
      .single()
    if (error) {
      if ((error as { code?: string }).code === '23505') throw new ConflictException('Slot already exists')
      throw error
    }
    return data
  }

  async mySlots(teacherId: string) {
    const { data, error } = await this.db
      .from('teacher_slots')
      .select('*, bookings(id, learner:users!bookings_learner_id_fkey(first_name, username))')
      .eq('teacher_id', teacherId)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(50)
    if (error) throw error
    return data
  }

  async availableSlots(teacherId: string) {
    const { data, error } = await this.db
      .from('teacher_slots')
      .select('id, teacher_id, starts_at, ends_at, bookings(id)')
      .eq('teacher_id', teacherId)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(50)
    if (error) throw error
    return (data as Array<{ bookings: unknown }>).filter((s) => !hasBooking(s.bookings))
  }

  async deleteSlot(teacherId: string, slotId: string) {
    const { data: slot, error } = await this.db
      .from('teacher_slots')
      .select('id, teacher_id, bookings(id)')
      .eq('id', slotId)
      .maybeSingle()
    if (error) throw error
    if (!slot) throw new NotFoundException('Slot not found')
    if (slot.teacher_id !== teacherId) throw new ForbiddenException('Not your slot')
    if (hasBooking(slot.bookings)) throw new ConflictException('Slot is booked')
    const { error: delError } = await this.db.from('teacher_slots').delete().eq('id', slotId)
    if (delError) throw delError
    return { deleted: true }
  }
}
