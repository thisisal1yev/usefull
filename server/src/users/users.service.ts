import { Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

export interface TgProfile {
  id: number
  first_name: string
  username?: string
}

export interface OnboardingData {
  ui_lang: 'uz' | 'en'
  level: string
  goal: string
  availability: string
}

@Injectable()
export class UsersService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  async upsertFromTelegram(tg: TgProfile) {
    const { data, error } = await this.db
      .from('users')
      .upsert({ tg_id: tg.id, first_name: tg.first_name, username: tg.username ?? null }, { onConflict: 'tg_id' })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async completeOnboarding(tgId: number, d: OnboardingData) {
    const { data, error } = await this.db
      .from('users')
      .update({ ...d, onboarded: true })
      .eq('tg_id', tgId)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async getById(id: string) {
    const { data, error } = await this.db.from('users').select().eq('id', id).maybeSingle()
    if (error) throw error
    return data
  }

  async getByTgId(tgId: number) {
    const { data, error } = await this.db.from('users').select().eq('tg_id', tgId).maybeSingle()
    if (error) throw error
    return data
  }
}
