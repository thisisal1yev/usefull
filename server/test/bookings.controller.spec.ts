import { BookingsController } from '../src/lessons/bookings.controller'

const me = { id: 'u1', first_name: 'Ali', tg_id: 100, ui_lang: 'en', plan: 'free' }
const slot = {
  id: 's1', teacher_id: 't1',
  starts_at: '2026-08-01T18:00:00.000Z',
  teacher: { user: { id: 't1', first_name: 'Teacher', tg_id: 200, ui_lang: 'uz' } },
}

function makeController() {
  const bookings = {
    book: jest.fn(async () => ({ booking: { id: 'b1' }, slot })),
    myBookings: jest.fn(async () => []),
    cancel: jest.fn(async () => ({
      booking: { id: 'b1', learner: { first_name: 'Ali', tg_id: 100, ui_lang: 'en' } },
      slot, cancelledBy: 'learner' as const,
    })),
  }
  const bot = { notify: jest.fn(async (_tgId: number, _text: string) => undefined) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl = new BookingsController(bookings as any, bot as any)
  return { ctrl, bookings, bot }
}

describe('BookingsController', () => {
  it('create books and notifies both sides', async () => {
    const { ctrl, bot } = makeController()
    await ctrl.create({ slotId: 's1' }, { user: me })
    expect(bot.notify).toHaveBeenCalledTimes(2)
    const tgIds = bot.notify.mock.calls.map((c) => c[0])
    expect(tgIds).toContain(100) // learner confirmation
    expect(tgIds).toContain(200) // teacher notification
  })

  it('cancel notifies the other party (teacher when learner cancels)', async () => {
    const { ctrl, bot } = makeController()
    await ctrl.remove('b1', { user: me })
    expect(bot.notify).toHaveBeenCalledTimes(1)
    expect(bot.notify.mock.calls[0][0]).toBe(200)
  })
})
