import { CommunityService } from '../src/community/community.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(result: ChainResult) {
  const chain: Record<string, jest.Mock> = {}
  for (const m of ['select', 'insert', 'eq', 'order', 'limit']) chain[m] = jest.fn(() => chain)
  chain.single = jest.fn(async () => result)
  const awaited = Object.assign(chain, {
    then: (resolve: (r: ChainResult) => void) => resolve(result),
  })
  const db = { from: jest.fn(() => awaited) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { db: db as any, chain }
}

describe('CommunityService', () => {
  it('listQuestions excludes removed, newest first', async () => {
    const rows = [{ id: 'c1', body: 'How to use articles?' }]
    const { db, chain } = mockDb({ data: rows, error: null })
    const svc = new CommunityService(db)
    const result = await svc.listQuestions()
    expect(db.from).toHaveBeenCalledWith('community_questions')
    expect(chain.eq).toHaveBeenCalledWith('is_removed', false)
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
    expect(result).toEqual(rows)
  })

  it('createQuestion inserts with user id', async () => {
    const { db, chain } = mockDb({ data: { id: 'c2' }, error: null })
    const svc = new CommunityService(db)
    await svc.createQuestion('Difference between a and the?', 'u1')
    expect(chain.insert).toHaveBeenCalledWith({ body: 'Difference between a and the?', user_id: 'u1' })
  })

  it('listAnswers filters by question and excludes removed', async () => {
    const { db, chain } = mockDb({ data: [], error: null })
    const svc = new CommunityService(db)
    await svc.listAnswers('c1')
    expect(db.from).toHaveBeenCalledWith('answers')
    expect(chain.eq).toHaveBeenCalledWith('question_id', 'c1')
    expect(chain.eq).toHaveBeenCalledWith('is_removed', false)
  })

  it('createAnswer inserts with question and user ids', async () => {
    const { db, chain } = mockDb({ data: { id: 'a1' }, error: null })
    const svc = new CommunityService(db)
    await svc.createAnswer('c1', 'Use "the" for specific things', 'u2')
    expect(chain.insert).toHaveBeenCalledWith({ question_id: 'c1', body: 'Use "the" for specific things', user_id: 'u2' })
  })
})
