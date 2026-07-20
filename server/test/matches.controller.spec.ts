import { MatchesController } from '../src/matches/matches.controller'

const me = { id: 'u2', first_name: 'Bek', username: 'bek', tg_id: 200, ui_lang: 'uz' as const }
const requester = { id: 'u1', first_name: 'Ali', username: null, tg_id: 100, ui_lang: 'en' as const }

function makeController() {
  const service = {
    listCandidates: jest.fn(async () => []),
    createRequest: jest.fn(async () => ({ id: 'm1', from_user: 'u2', to_user: 'u1' })),
    listRequests: jest.fn(async () => ({ incoming: [], outgoing: [] })),
    respond: jest.fn(async () => ({
      request: { id: 'm1', from_user: 'u1', to_user: 'u2', status: 'accepted' },
      accepted: true,
    })),
  }
  const users = { getById: jest.fn(async () => requester) }
  const bot = { notify: jest.fn(async (_tgId: number, _text: string) => undefined) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrl = new MatchesController(service as any, users as any, bot as any)
  return { ctrl, service, users, bot }
}

describe('MatchesController', () => {
  it('create notifies the target in their language', async () => {
    const { ctrl, bot, users } = makeController()
    await ctrl.create({ toUserId: 'u1' }, { user: me })
    expect(users.getById).toHaveBeenCalledWith('u1')
    expect(bot.notify).toHaveBeenCalledTimes(1)
    const [tgId, text] = bot.notify.mock.calls[0]
    expect(tgId).toBe(100)
    expect(text).toContain('Bek')
  })

  it('respond(accept) notifies the requester with contact and returns requester contact', async () => {
    const { ctrl, bot } = makeController()
    const result = await ctrl.respond('m1', { accept: true }, { user: me })
    expect(result.status).toBe('accepted')
    expect(result.contact).toBe('tg://user?id=100') // requester has no username
    const [tgId, text] = bot.notify.mock.calls[0]
    expect(tgId).toBe(100)
    expect(text).toContain('@bek')
  })
})
