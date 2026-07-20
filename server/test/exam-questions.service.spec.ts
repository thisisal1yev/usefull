import { ForbiddenException } from '@nestjs/common'
import { ExamQuestionsService } from '../src/exam-questions/exam-questions.service'

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

describe('ExamQuestionsService', () => {
  it('list returns newest questions, filters by part', async () => {
    const rows = [{ id: 'q1', part: 'Part 1' }]
    const { db, chain } = mockDb({ data: rows, error: null })
    const svc = new ExamQuestionsService(db)
    const result = await svc.list('Part 1')
    expect(db.from).toHaveBeenCalledWith('exam_questions')
    expect(chain.order).toHaveBeenCalledWith('published_at', { ascending: false })
    expect(chain.eq).toHaveBeenCalledWith('part', 'Part 1')
    expect(result).toEqual(rows)
  })

  it('create inserts with author id for teacher role', async () => {
    const { db, chain } = mockDb({ data: { id: 'q2' }, error: null })
    const svc = new ExamQuestionsService(db)
    await svc.create(
      { part: 'Part 2', topic: 'Travel', question: 'Describe a trip' },
      { id: 'u1', role: 'teacher' },
    )
    expect(chain.insert).toHaveBeenCalledWith({
      part: 'Part 2', topic: 'Travel', question: 'Describe a trip', author_id: 'u1',
    })
  })

  it('create throws Forbidden for learner role', async () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new ExamQuestionsService(db)
    await expect(
      svc.create({ part: 'Part 1', question: 'x' }, { id: 'u1', role: 'learner' }),
    ).rejects.toThrow(ForbiddenException)
  })
})
