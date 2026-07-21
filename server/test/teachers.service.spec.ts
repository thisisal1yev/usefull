import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { TeachersService } from '../src/teachers/teachers.service'

type ChainResult = { data: unknown; error: unknown }

function mockDb(...results: ChainResult[]) {
  let call = 0
  const make = (result: ChainResult) => {
    const chain: Record<string, jest.Mock> = {}
    for (const m of ['select', 'insert', 'update', 'upsert', 'delete', 'eq', 'gte', 'order', 'limit']) {
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

const future = () => new Date(Date.now() + 86_400_000)

describe('TeachersService', () => {
  it('apply upserts a pending application', async () => {
    const { db, chains } = mockDb({ data: { user_id: 'u1', status: 'pending' }, error: null })
    const svc = new TeachersService(db)
    await svc.apply('u1', { bio: 'IELTS coach with long experience' })
    expect(db.from).toHaveBeenCalledWith('teachers')
    expect(chains[0].upsert).toHaveBeenCalledWith(
      { user_id: 'u1', bio: 'IELTS coach with long experience', experience: null, certificates_url: null, status: 'pending' },
      { onConflict: 'user_id' },
    )
  })

  it('setStatus(approved) promotes the user role', async () => {
    const { db, chains } = mockDb(
      { data: { user_id: 'u1', status: 'approved' }, error: null },
      { data: null, error: null },
    )
    const svc = new TeachersService(db)
    await svc.setStatus('u1', 'approved')
    expect(chains[0].update).toHaveBeenCalledWith({ status: 'approved' })
    expect(db.from).toHaveBeenCalledWith('users')
    expect(chains[1].update).toHaveBeenCalledWith({ role: 'teacher' })
    expect(chains[1].eq).toHaveBeenCalledWith('role', 'learner')
  })

  it('createSlot rejects past dates', async () => {
    const { db } = mockDb({ data: null, error: null })
    const svc = new TeachersService(db)
    await expect(svc.createSlot('u1', new Date(Date.now() - 1000))).rejects.toThrow(BadRequestException)
  })

  it('createSlot maps duplicate to conflict', async () => {
    const { db } = mockDb({ data: null, error: { code: '23505' } })
    const svc = new TeachersService(db)
    await expect(svc.createSlot('u1', future())).rejects.toThrow(ConflictException)
  })

  it('deleteSlot refuses a booked slot', async () => {
    const { db } = mockDb({
      data: { id: 's1', teacher_id: 'u1', bookings: [{ id: 'b1' }] },
      error: null,
    })
    const svc = new TeachersService(db)
    await expect(svc.deleteSlot('u1', 's1')).rejects.toThrow(ConflictException)
  })

  it('deleteSlot refuses a foreign slot', async () => {
    const { db } = mockDb({ data: { id: 's1', teacher_id: 'u2', bookings: [] }, error: null })
    const svc = new TeachersService(db)
    await expect(svc.deleteSlot('u1', 's1')).rejects.toThrow(ForbiddenException)
  })
})
