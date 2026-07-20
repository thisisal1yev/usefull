import { UsersService } from '../src/users/users.service'

function mockDb(result: { data: unknown; error: unknown }) {
  const chain: Record<string, jest.Mock> = {}
  for (const m of ['upsert', 'update', 'select', 'eq']) chain[m] = jest.fn(() => chain)
  chain.single = jest.fn(async () => result)
  chain.maybeSingle = jest.fn(async () => result)
  const db = { from: jest.fn(() => chain) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { db: db as any, chain }
}

describe('UsersService', () => {
  it('upsertFromTelegram upserts by tg_id and returns the row', async () => {
    const row = { id: 'u1', tg_id: 42 }
    const { db, chain } = mockDb({ data: row, error: null })
    const svc = new UsersService(db)
    const result = await svc.upsertFromTelegram({ id: 42, first_name: 'Ali', username: 'ali' })
    expect(db.from).toHaveBeenCalledWith('users')
    expect(chain.upsert).toHaveBeenCalledWith(
      { tg_id: 42, first_name: 'Ali', username: 'ali' },
      { onConflict: 'tg_id' },
    )
    expect(result).toEqual(row)
  })

  it('completeOnboarding updates profile and sets onboarded=true', async () => {
    const { db, chain } = mockDb({ data: { id: 'u1', onboarded: true }, error: null })
    const svc = new UsersService(db)
    await svc.completeOnboarding(42, { ui_lang: 'uz', level: 'B1', goal: 'ielts', availability: 'evening' })
    expect(chain.update).toHaveBeenCalledWith({
      ui_lang: 'uz', level: 'B1', goal: 'ielts', availability: 'evening', onboarded: true,
    })
    expect(chain.eq).toHaveBeenCalledWith('tg_id', 42)
  })

  it('throws when supabase returns an error', async () => {
    const { db } = mockDb({ data: null, error: new Error('db down') })
    const svc = new UsersService(db)
    await expect(svc.getByTgId(42)).rejects.toThrow('db down')
  })
})
