import { MeController } from '../src/users/me.controller'

describe('MeController', () => {
  it('returns req.user as-is', () => {
    const ctrl = new MeController()
    const user = { id: 'u1', tg_id: 42, plan: 'free' }
    expect(ctrl.me({ user })).toEqual(user)
  })
})
