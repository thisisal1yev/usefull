import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { BookingsService } from '../src/lessons/bookings.service'

type ChainResult = { data: unknown; error: unknown; count?: number | null }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gte', 'lte', 'order', 'limit']) {
      chain[m] = jest.fn(() => chain)
    }
    chain.single = jest.fn(async () => result)
    chain.maybeSingle = jest.fn(async () => result)
    return Object.assign(chain, {
      then: (res: (r: ChainResult) => void) => res(result),
    })
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

const futureSlot = (teacherId = 't1') => ({
  id: 's1',
  teacher_id: teacherId,
  starts_at: new Date(Date.now() + 86_400_000).toISOString(),
  teacher: { user: { first_name: 'T', tg_id: 1, ui_lang: 'uz' } },
})

describe('BookingsService', () => {
  it('freeLimitFor: free=1, premium=3', () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new BookingsService(db)
    expect(svc.freeLimitFor('free')).toBe(1)
    expect(svc.freeLimitFor('premium')).toBe(3)
    expect(svc.freeLimitFor('gold')).toBe(3)
  })

  it('book: happy path inserts a free booking', async () => {
    const { db, chains } = mockDb(
      { data: futureSlot(), error: null },            // slot fetch
      { data: [], error: null },                      // recent bookings (limit check)
      { data: { id: 'b1', slot_id: 's1' }, error: null }, // insert
    )
    const svc = new BookingsService(db)
    const result = await svc.book({ id: 'u1', plan: 'free' }, 's1')
    expect(chains[2].insert).toHaveBeenCalledWith({ slot_id: 's1', learner_id: 'u1', type: 'free' })
    expect(result.booking).toEqual({ id: 'b1', slot_id: 's1' })
  })

  it('book: enforces weekly free limit', async () => {
    const { db } = mockDb(
      { data: futureSlot(), error: null },
      { data: [{ id: 'b0' }], error: null }, // already one booking this week
    )
    const svc = new BookingsService(db)
    await expect(svc.book({ id: 'u1', plan: 'free' }, 's1')).rejects.toThrow(ForbiddenException)
  })

  it('book: rejects own slot', async () => {
    const { db } = mockDb({ data: futureSlot('u1'), error: null })
    const svc = new BookingsService(db)
    await expect(svc.book({ id: 'u1', plan: 'free' }, 's1')).rejects.toThrow(BadRequestException)
  })

  it('book: maps busy slot to 409', async () => {
    const { db } = mockDb(
      { data: futureSlot(), error: null },
      { data: [], error: null },
      { data: null, error: { code: '23505' } },
    )
    const svc = new BookingsService(db)
    await expect(svc.book({ id: 'u1', plan: 'free' }, 's1')).rejects.toThrow(ConflictException)
  })

  it('cancel: only participants may cancel', async () => {
    const booking = {
      id: 'b1', learner_id: 'u1',
      slot: { id: 's1', teacher_id: 't1', starts_at: new Date().toISOString(), teacher: { user: {} } },
      learner: {},
    }
    const { db } = mockDb({ data: booking, error: null })
    const svc = new BookingsService(db)
    await expect(svc.cancel('stranger', 'b1')).rejects.toThrow(ForbiddenException)
  })
})
