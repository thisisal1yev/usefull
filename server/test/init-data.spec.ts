import { createHmac } from 'crypto'
import { validateInitData } from '../src/auth/init-data'

const BOT_TOKEN = '42:TEST'

function sign(params: Record<string, string>, botToken = BOT_TOKEN): string {
  const p = new URLSearchParams(params)
  const dataCheckString = [...p.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const hash = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  p.append('hash', hash)
  return p.toString()
}

const freshAuthDate = () => String(Math.floor(Date.now() / 1000) - 60)

describe('validateInitData', () => {
  it('accepts a correctly signed payload and returns the user', () => {
    const initData = sign({
      auth_date: freshAuthDate(),
      user: JSON.stringify({ id: 42, first_name: 'Ali', username: 'ali' }),
    })
    const user = validateInitData(initData, BOT_TOKEN)
    expect(user).toEqual({ id: 42, first_name: 'Ali', username: 'ali' })
  })

  it('rejects a tampered payload', () => {
    const initData = sign({
      auth_date: freshAuthDate(),
      user: JSON.stringify({ id: 42, first_name: 'Ali' }),
    })
    const tampered = initData.replace('42', '43')
    expect(validateInitData(tampered, BOT_TOKEN)).toBeNull()
  })

  it('rejects a payload signed with another bot token', () => {
    const initData = sign({ auth_date: freshAuthDate(), user: '{"id":1,"first_name":"x"}' }, 'other:token')
    expect(validateInitData(initData, BOT_TOKEN)).toBeNull()
  })

  it('rejects a stale auth_date', () => {
    const initData = sign({
      auth_date: String(Math.floor(Date.now() / 1000) - 100_000),
      user: '{"id":1,"first_name":"x"}',
    })
    expect(validateInitData(initData, BOT_TOKEN)).toBeNull()
  })

  it('rejects when hash is missing', () => {
    expect(validateInitData('auth_date=1&user=%7B%7D', BOT_TOKEN)).toBeNull()
  })
})
