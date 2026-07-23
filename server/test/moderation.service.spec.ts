import { ModerationService } from '../src/moderation/moderation.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'eq', 'in']) chain[m] = jest.fn(() => chain)
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

describe('ModerationService', () => {
  it('report inserts a report row', async () => {
    const { db, chains } = mockDb({ data: { id: 'r1' }, error: null })
    const svc = new ModerationService(db)
    const result = await svc.report('u1', 'question', 'q1')
    expect(db.from).toHaveBeenCalledWith('reports')
    expect(chains[0].insert).toHaveBeenCalledWith({
      reporter_id: 'u1', target_type: 'question', target_id: 'q1',
    })
    expect(result.result).toBe('reported')
  })

  it('report treats duplicate as a no-op', async () => {
    const { db } = mockDb({ data: null, error: { code: '23505' } })
    const svc = new ModerationService(db)
    expect((await svc.report('u1', 'question', 'q1')).result).toBe('duplicate')
  })

  it('remove sets is_removed on the question table', async () => {
    const { db, chains } = mockDb({ data: null, error: null })
    const svc = new ModerationService(db)
    await svc.remove('question', 'q1')
    expect(db.from).toHaveBeenCalledWith('community_questions')
    expect(chains[0].update).toHaveBeenCalledWith({ is_removed: true })
    expect(chains[0].eq).toHaveBeenCalledWith('id', 'q1')
  })

  it('remove sets is_removed on the answers table', async () => {
    const { db, chains } = mockDb({ data: null, error: null })
    const svc = new ModerationService(db)
    await svc.remove('answer', 'a1')
    expect(db.from).toHaveBeenCalledWith('answers')
    expect(chains[0].update).toHaveBeenCalledWith({ is_removed: true })
  })
})
