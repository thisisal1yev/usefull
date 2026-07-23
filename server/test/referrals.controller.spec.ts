import { ReferralsController } from '../src/referrals/referrals.controller'

describe('ReferralsController', () => {
  it('returns the summary for the current user with the configured bot username', async () => {
    const service = { summary: jest.fn(async () => ({ code: 'abc123', invitedCount: 0 })) }
    const config = { botUsername: 'usefull_bot' }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctrl = new ReferralsController(service as any, config as any)
    const result = await ctrl.me({ user: { id: 'u1' } })
    expect(service.summary).toHaveBeenCalledWith('u1', 'usefull_bot')
    expect(result).toEqual({ code: 'abc123', invitedCount: 0 })
  })
})
