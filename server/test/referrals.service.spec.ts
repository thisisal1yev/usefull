import { ReferralsService, REFERRAL_TIERS } from '../src/referrals/referrals.service'

type ChainResult = { data: unknown; error: unknown; count?: number | null }

function mockDb(results: ChainResult[]) {
  let call = 0
  const chains: Record<string, jest.Mock>[] = []
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'eq', 'order', 'limit']) chain[m] = jest.fn(() => chain)
    chain.single = jest.fn(async () => result)
    chain.maybeSingle = jest.fn(async () => result)
    return Object.assign(chain, { then: (res: (r: ChainResult) => void) => res(result) })
  }
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

describe('ReferralsService', () => {
  it('tiers are ascending and cumulative-friendly', () => {
    expect(REFERRAL_TIERS.map((t) => t.friends)).toEqual([2, 5, 10, 20])
  })

  it('ensureCode returns an existing code without writing', async () => {
    const { db, chains } = mockDb([{ data: { ref_code: 'abc123' }, error: null }])
    const svc = new ReferralsService(db)
    expect(await svc.ensureCode('u1')).toBe('abc123')
    expect(chains[0].update).not.toHaveBeenCalled()
  })

  it('recordReferral rejects an unknown code', async () => {
    const { db } = mockDb([{ data: null, error: null }])
    const svc = new ReferralsService(db)
    expect((await svc.recordReferral('nope', 'u2')).credited).toBe(false)
  })

  it('recordReferral rejects self-referral', async () => {
    const { db } = mockDb([{ data: { id: 'u1', tg_id: 1, ui_lang: 'uz' }, error: null }])
    const svc = new ReferralsService(db)
    expect((await svc.recordReferral('code', 'u1')).credited).toBe(false)
  })

  it('recordReferral treats duplicate invited as not credited', async () => {
    const { db } = mockDb([
      { data: { id: 'r1', tg_id: 1, ui_lang: 'uz' }, error: null }, // referrer lookup
      { data: null, error: { code: '23505' } }, // insert duplicate
    ])
    const svc = new ReferralsService(db)
    expect((await svc.recordReferral('code', 'u2')).credited).toBe(false)
  })

  it('recordReferral credits, grants the 2-friend milestone once', async () => {
    const { db, chains } = mockDb([
      { data: { id: 'r1', tg_id: 100, ui_lang: 'en' }, error: null }, // referrer lookup
      { data: { id: 'ref1' }, error: null }, // insert referral
      { data: null, error: null, count: 2 }, // count referrals
      { data: { plan: 'free', plan_expires_at: null, ref_rewarded_count: 0 }, error: null }, // referrer state
      { data: null, error: null }, // update grant
    ])
    const svc = new ReferralsService(db)
    const r = await svc.recordReferral('code', 'u2')
    expect(r.credited).toBe(true)
    expect(r.rewardDays).toBe(1)
    // grant update: plan promoted, rewarded_count set to 2
    const grant = chains[4].update.mock.calls[0][0]
    expect(grant.plan).toBe('premium')
    expect(grant.ref_rewarded_count).toBe(2)
  })

  it('recordReferral credits without reward before the first milestone', async () => {
    const { db } = mockDb([
      { data: { id: 'r1', tg_id: 100, ui_lang: 'en' }, error: null },
      { data: { id: 'ref1' }, error: null },
      { data: null, error: null, count: 1 }, // only 1 friend, below tier 2
      { data: { plan: 'free', plan_expires_at: null, ref_rewarded_count: 0 }, error: null },
    ])
    const svc = new ReferralsService(db)
    const r = await svc.recordReferral('code', 'u2')
    expect(r.credited).toBe(true)
    expect(r.rewardDays).toBe(0)
  })
})
