import { ProfileService } from '../src/profile/profile.service'

type ChainResult = { data: unknown; error: unknown; count?: number | null }

function mockDb(results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'eq', 'or', 'order', 'limit']) chain[m] = jest.fn(() => chain)
    return Object.assign(chain, { then: (res: (r: ChainResult) => void) => res(result) })
  }
  const db = {
    from: jest.fn(() => {
      const c = make(results[Math.min(call, results.length - 1)])
      call++
      return c
    }),
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { db: db as any }
}

describe('ProfileService', () => {
  it('progress counts lessons and accepted partners', async () => {
    const { db } = mockDb([
      { data: null, error: null, count: 3 }, // bookings count
      { data: null, error: null, count: 2 }, // accepted matches count
    ])
    const svc = new ProfileService(db)
    const p = await svc.progress('u1')
    expect(p).toEqual({ lessons: 3, partners: 2 })
  })

  it('history returns only past lessons, newest first', async () => {
    const past = '2020-01-01T10:00:00.000Z'
    const future = '2999-01-01T10:00:00.000Z'
    const rows = [
      { slot: { starts_at: future, teacher: { user: { first_name: 'Future' } } } },
      { slot: { starts_at: past, teacher: { user: { first_name: 'Aziz' } } } },
    ]
    const { db } = mockDb([{ data: rows, error: null }])
    const svc = new ProfileService(db)
    const h = await svc.history('u1')
    expect(h).toEqual([{ teacher: 'Aziz', starts_at: past }])
  })
})
