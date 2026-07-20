import { createHmac } from 'crypto'

export interface TgInitUser {
  id: number
  first_name: string
  username?: string
}

export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86_400,
): TgInitUser | null {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .map(([k, v]) => `${k}=${v}`)
    .sort()
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const computed = createHmac('sha256', secret).update(dataCheckString).digest('hex')
  if (computed !== hash) return null

  const authDate = Number(params.get('auth_date') ?? 0)
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSeconds) return null

  const userJson = params.get('user')
  if (!userJson) return null
  try {
    const u = JSON.parse(userJson) as { id?: number; first_name?: string; username?: string }
    if (typeof u.id !== 'number' || typeof u.first_name !== 'string') return null
    return { id: u.id, first_name: u.first_name, username: u.username }
  } catch {
    return null
  }
}
