import { RemindersService } from '../src/lessons/reminders.service'

const booking = {
  id: 'b1',
  learner: { first_name: 'Ali', tg_id: 100, ui_lang: 'en' },
  slot: {
    starts_at: '2026-08-01T18:00:00.000Z',
    teacher: { user: { first_name: 'Teacher', tg_id: 200, ui_lang: 'uz' } },
  },
}

describe('RemindersService', () => {
  it('sends both reminders and marks the booking', async () => {
    const bookings = {
      dueReminders: jest.fn(async (h: 24 | 1) => (h === 24 ? [booking] : [])),
      markReminded: jest.fn(async () => undefined),
    }
    const bot = { notify: jest.fn(async (_t: number, _x: string) => undefined) }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = new RemindersService(bookings as any, bot as any)
    await svc.tick()
    expect(bot.notify).toHaveBeenCalledTimes(2) // learner + teacher for the 24h batch
    expect(bookings.markReminded).toHaveBeenCalledWith('b1', 24)
  })
})
