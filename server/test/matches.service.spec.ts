import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { MatchesService } from '../src/matches/matches.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'eq', 'neq', 'order', 'limit']) {
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

describe('MatchesService', () => {
  it('listCandidates: onboarded, excludes self, filters by level', async () => {
    const rows = [{ id: 'u2', first_name: 'Bek', username: null, level: 'B1', goal: 'ielts', availability: 'evening' }]
    const { db, chains } = mockDb({ data: rows, error: null })
    const svc = new MatchesService(db)
    const result = await svc.listCandidates('u1', 'B1')
    expect(db.from).toHaveBeenCalledWith('users')
    expect(chains[0].select).toHaveBeenCalledWith('id, first_name, username, level, goal, availability')
    expect(chains[0].eq).toHaveBeenCalledWith('onboarded', true)
    expect(chains[0].eq).toHaveBeenCalledWith('level', 'B1')
    expect(chains[0].neq).toHaveBeenCalledWith('id', 'u1')
    expect(result).toEqual(rows)
  })

  it('createRequest: rejects self-request', async () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new MatchesService(db)
    await expect(svc.createRequest('u1', 'u1')).rejects.toThrow(BadRequestException)
  })

  it('createRequest: maps unique violation to Conflict', async () => {
    const { db } = mockDb({ data: null, error: { code: '23505', message: 'duplicate' } })
    const svc = new MatchesService(db)
    await expect(svc.createRequest('u1', 'u2')).rejects.toThrow(ConflictException)
  })

  it('respond: only the recipient may respond', async () => {
    const request = { id: 'm1', from_user: 'u1', to_user: 'u2', status: 'pending' }
    const { db } = mockDb({ data: request, error: null })
    const svc = new MatchesService(db)
    await expect(svc.respond('u3', 'm1', true)).rejects.toThrow(ForbiddenException)
  })

  it('respond: accepts a pending request', async () => {
    const request = { id: 'm1', from_user: 'u1', to_user: 'u2', status: 'pending' }
    const updated = { ...request, status: 'accepted' }
    const { db } = mockDb({ data: request, error: null }, { data: updated, error: null })
    const svc = new MatchesService(db)
    const result = await svc.respond('u2', 'm1', true)
    expect(result.accepted).toBe(true)
    expect(result.request).toEqual(updated)
  })

  it('respond: rejects non-pending request', async () => {
    const request = { id: 'm1', from_user: 'u1', to_user: 'u2', status: 'accepted' }
    const { db } = mockDb({ data: request, error: null })
    const svc = new MatchesService(db)
    await expect(svc.respond('u2', 'm1', true)).rejects.toThrow(ConflictException)
  })
})
