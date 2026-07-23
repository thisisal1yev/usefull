import { randomBytes } from 'crypto'
import { Inject, Injectable } from '@nestjs/common'
import { SUPABASE, Db } from '../db/db.module'

export const REFERRAL_TIERS = [
  { friends: 2, days: 1 },
  { friends: 5, days: 7 },
  { friends: 10, days: 30 },
  { friends: 20, days: 90 },
] as const

const DAY_MS = 24 * 60 * 60 * 1000

export interface ReferralSummary {
  code: string
  link: string
  invitedCount: number
  daysEarned: number
  nextMilestone: { friends: number; days: number; remaining: number } | null
  invited: Array<{ first_name: string; created_at: string }>
}

interface Referrer {
  id: string
  tg_id: number
  ui_lang: string
}

@Injectable()
export class ReferralsService {
  constructor(@Inject(SUPABASE) private readonly db: Db) {}

  private genCode(): string {
    return randomBytes(4).toString('hex').slice(0, 6)
  }

  async ensureCode(userId: string): Promise<string> {
    const { data: user, error } = await this.db
      .from('users')
      .select('ref_code')
      .eq('id', userId)
      .maybeSingle()
    if (error) throw error
    if (user?.ref_code) return user.ref_code
    for (let i = 0; i < 5; i++) {
      const code = this.genCode()
      const { error: setError } = await this.db.from('users').update({ ref_code: code }).eq('id', userId)
      if (!setError) return code
      if ((setError as { code?: string }).code !== '23505') throw setError
    }
    throw new Error('could not allocate referral code')
  }

  private async applyRewards(referrerId: string): Promise<number> {
    const { count, error } = await this.db
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', referrerId)
    if (error) throw error
    const total = count ?? 0

    const { data: u, error: uError } = await this.db
      .from('users')
      .select('plan, plan_expires_at, ref_rewarded_count')
      .eq('id', referrerId)
      .maybeSingle()
    if (uError) throw uError
    if (!u) return 0

    const already = u.ref_rewarded_count ?? 0
    const newly = REFERRAL_TIERS.filter((t) => t.friends > already && t.friends <= total)
    if (newly.length === 0) return 0

    const grantDays = newly.reduce((sum, t) => sum + t.days, 0)
    const highest = Math.max(...newly.map((t) => t.friends))
    const base =
      u.plan_expires_at && new Date(u.plan_expires_at).getTime() > Date.now()
        ? new Date(u.plan_expires_at)
        : new Date()
    const expiresAt = new Date(base.getTime() + grantDays * DAY_MS).toISOString()
    const plan = u.plan === 'free' ? 'premium' : u.plan

    const { error: updError } = await this.db
      .from('users')
      .update({ plan, plan_expires_at: expiresAt, ref_rewarded_count: highest })
      .eq('id', referrerId)
    if (updError) throw updError
    return grantDays
  }

  async recordReferral(referrerCode: string, invitedUserId: string) {
    const { data: referrer, error } = await this.db
      .from('users')
      .select('id, tg_id, ui_lang')
      .eq('ref_code', referrerCode)
      .maybeSingle()
    if (error) throw error
    if (!referrer || referrer.id === invitedUserId) return { credited: false as const }

    const { error: insError } = await this.db
      .from('referrals')
      .insert({ referrer_id: referrer.id, invited_id: invitedUserId })
      .select()
      .single()
    if (insError) {
      if ((insError as { code?: string }).code === '23505') return { credited: false as const }
      throw insError
    }

    const rewardDays = await this.applyRewards(referrer.id)
    return { credited: true as const, rewardDays, referrer: referrer as Referrer }
  }

  async summary(userId: string, botUsername: string): Promise<ReferralSummary> {
    const code = await this.ensureCode(userId)

    const { count, error: countError } = await this.db
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId)
    if (countError) throw countError
    const total = count ?? 0

    const { data: invited, error: invError } = await this.db
      .from('referrals')
      .select('created_at, invited:users!referrals_invited_id_fkey(first_name)')
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (invError) throw invError

    const daysEarned = REFERRAL_TIERS.filter((t) => t.friends <= total).reduce((s, t) => s + t.days, 0)
    const next = REFERRAL_TIERS.find((t) => t.friends > total) ?? null

    return {
      code,
      link: `https://t.me/${botUsername}?start=ref_${code}`,
      invitedCount: total,
      daysEarned,
      nextMilestone: next ? { friends: next.friends, days: next.days, remaining: next.friends - total } : null,
      invited: ((invited ?? []) as Array<{ created_at: string; invited: { first_name: string } | null }>).map(
        (r) => ({ first_name: r.invited?.first_name ?? '?', created_at: r.created_at }),
      ),
    }
  }
}
