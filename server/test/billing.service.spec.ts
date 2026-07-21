import { NotFoundException } from '@nestjs/common'
import { BillingService } from '../src/billing/billing.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'eq', 'neq', 'lt', 'limit']) {
      chain[m] = jest.fn(() => chain)
    }
    chain.single = jest.fn(async () => result)
    chain.maybeSingle = jest.fn(async () => result)
    return Object.assign(chain, { then: (res: (r: ChainResult) => void) => res(result) })
  }
  const chains: Record<string, jest.Mock>[] = []
  const db = {
    from: jest.fn(() => {
      const c = make(results[Math.min(call, results.length - 1)])
      chains.push(c)
      call++
      return c
    }),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { db: db as any, chains }
}

describe('BillingService', () => {
  it('computeNewExpiry: +30 days from now when no current expiry', () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new BillingService(db)
    const now = new Date('2026-07-21T00:00:00Z')
    expect(svc.computeNewExpiry(null, now)).toBe('2026-08-20T00:00:00.000Z')
  })

  it('computeNewExpiry: stacks on top of a future expiry', () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new BillingService(db)
    const now = new Date('2026-07-21T00:00:00Z')
    expect(svc.computeNewExpiry('2026-07-25T00:00:00.000Z', now)).toBe('2026-08-24T00:00:00.000Z')
  })

  it('recordPayment: inserts subscription and upgrades the user', async () => {
    const user = { id: 'u1', tg_id: 42, plan: 'free', plan_expires_at: null, ui_lang: 'uz', first_name: 'A' }
    const { db, chains } = mockDb(
      { data: user, error: null },                     // user fetch
      { data: { id: 'sub1' }, error: null },           // subscription insert
      { data: { ...user, plan: 'premium' }, error: null }, // user update
    )
    const svc = new BillingService(db)
    const result = await svc.recordPayment(42, 'premium', 'tx_1')
    expect(result.result).toBe('recorded')
    expect(chains[1].insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'u1', tier: 'premium', stars_tx_id: 'tx_1' }),
    )
    expect(chains[2].update).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'premium' }),
    )
  })

  it('recordPayment: duplicate tx is a no-op', async () => {
    const user = { id: 'u1', tg_id: 42, plan: 'premium', plan_expires_at: null }
    const { db, chains } = mockDb(
      { data: user, error: null },
      { data: null, error: { code: '23505' } },
    )
    const svc = new BillingService(db)
    const result = await svc.recordPayment(42, 'premium', 'tx_1')
    expect(result.result).toBe('duplicate')
    expect(chains.length).toBe(2) // no user update happened
  })

  it('recordPayment: unknown user throws', async () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new BillingService(db)
    await expect(svc.recordPayment(999, 'gold', 'tx')).rejects.toThrow(NotFoundException)
  })

  it('expireOverdue downgrades and returns expired users', async () => {
    const expired = [{ id: 'u2', tg_id: 77, ui_lang: 'en' }]
    const { db, chains } = mockDb(
      { data: expired, error: null }, // select overdue
      { data: null, error: null },    // update
    )
    const svc = new BillingService(db)
    const result = await svc.expireOverdue()
    expect(result).toEqual(expired)
    expect(chains[1].update).toHaveBeenCalledWith({ plan: 'free', plan_expires_at: null })
  })
})
