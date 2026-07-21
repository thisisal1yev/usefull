import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

const MONTH_MS = 30 * 24 * 60 * 60 * 1000

export type Tier = 'premium' | 'gold'

@Injectable()
export class BillingService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  computeNewExpiry(current: string | null, now: Date = new Date()): string {
    const base = current && new Date(current).getTime() > now.getTime() ? new Date(current) : now
    return new Date(base.getTime() + MONTH_MS).toISOString()
  }

  async recordPayment(tgId: number, tier: Tier, txId: string) {
    const { data: user, error } = await this.db
      .from('users')
      .select()
      .eq('tg_id', tgId)
      .maybeSingle()
    if (error) throw error
    if (!user) throw new NotFoundException('User not found')

    const expiresAt = this.computeNewExpiry(user.plan_expires_at)
    const { error: insError } = await this.db
      .from('subscriptions')
      .insert({ user_id: user.id, tier, stars_tx_id: txId, expires_at: expiresAt })
      .select()
      .single()
    if (insError) {
      if ((insError as { code?: string }).code === '23505') return { result: 'duplicate' as const }
      throw insError
    }

    const { data: updated, error: updError } = await this.db
      .from('users')
      .update({ plan: tier, plan_expires_at: expiresAt })
      .eq('id', user.id)
      .select()
      .single()
    if (updError) throw updError
    return { result: 'recorded' as const, user: updated }
  }

  async expireOverdue() {
    const now = new Date().toISOString()
    const { data: overdue, error } = await this.db
      .from('users')
      .select('id, tg_id, ui_lang')
      .neq('plan', 'free')
      .lt('plan_expires_at', now)
      .limit(100)
    if (error) throw error
    if (!overdue || overdue.length === 0) return []
    const { error: updError } = await this.db
      .from('users')
      .update({ plan: 'free', plan_expires_at: null })
      .neq('plan', 'free')
      .lt('plan_expires_at', now)
    if (updError) throw updError
    return overdue
  }
}
