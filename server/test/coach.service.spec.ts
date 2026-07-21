import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common'
import { CoachService } from '../src/coach/coach.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'eq', 'limit']) chain[m] = jest.fn(() => chain)
    chain.single = jest.fn(async () => result)
    chain.maybeSingle = jest.fn(async () => result)
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

describe('CoachService', () => {
  it('goldWithoutCoach filters out already-assigned learners', async () => {
    const rows = [
      { id: 'u1', first_name: 'A', coach_assignments: null },
      { id: 'u2', first_name: 'B', coach_assignments: { id: 'ca1' } },
      { id: 'u3', first_name: 'C', coach_assignments: [] },
    ]
    const { db } = mockDb({ data: rows, error: null })
    const svc = new CoachService(db)
    const result = await svc.goldWithoutCoach()
    expect(result.map((u: { id: string }) => u.id)).toEqual(['u1', 'u3'])
  })

  it('assign: unknown coach username → 404', async () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new CoachService(db)
    await expect(svc.assign('u1', 'ghost')).rejects.toThrow(NotFoundException)
  })

  it('assign: coach cannot be the learner', async () => {
    const coach = { id: 'u1', username: 'same' }
    const { db } = mockDb({ data: coach, error: null })
    const svc = new CoachService(db)
    await expect(svc.assign('u1', 'same')).rejects.toThrow(BadRequestException)
  })

  it('assign: duplicate assignment → 409', async () => {
    const coach = { id: 'c1', username: 'coach' }
    const learner = { id: 'u1', first_name: 'A' }
    const { db } = mockDb(
      { data: coach, error: null },
      { data: learner, error: null },
      { data: null, error: { code: '23505' } },
    )
    const svc = new CoachService(db)
    await expect(svc.assign('u1', 'coach')).rejects.toThrow(ConflictException)
  })
})
