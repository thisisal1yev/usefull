import { createHmac } from 'crypto'
import { loadConfig } from '../src/config/configuration'

const config = loadConfig()
const BASE = process.env.SMOKE_BASE ?? `http://localhost:${config.port}`

function initData(): string {
  const user = { id: 777000001, first_name: 'Smoke', username: 'smoke_test' }
  const p = new URLSearchParams({
    auth_date: String(Math.floor(Date.now() / 1000) - 30),
    user: JSON.stringify(user),
  })
  const dcs = [...p.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(config.botToken).digest()
  p.append('hash', createHmac('sha256', secret).update(dcs).digest('hex'))
  return p.toString()
}

const headers = { 'content-type': 'application/json', 'x-telegram-init-data': initData() }

interface Check {
  name: string
  path: string
  auth: boolean
  expect: number
}

const checks: Check[] = [
  { name: 'health', path: '/health', auth: false, expect: 200 },
  { name: 'me', path: '/api/me', auth: true, expect: 200 },
  { name: 'partners', path: '/api/partners', auth: true, expect: 200 },
  { name: 'exam-questions', path: '/api/exam-questions', auth: true, expect: 200 },
  { name: 'questions', path: '/api/questions', auth: true, expect: 200 },
  { name: 'teachers', path: '/api/teachers', auth: true, expect: 200 },
  { name: 'bookings', path: '/api/bookings', auth: true, expect: 200 },
  { name: 'me-without-auth', path: '/api/me', auth: false, expect: 401 },
]

let failed = 0
for (const c of checks) {
  const res = await fetch(`${BASE}${c.path}`, c.auth ? { headers } : {})
  const ok = res.status === c.expect
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✗'} ${c.name}: ${res.status} (expected ${c.expect})`)
}
console.log(failed === 0 ? '\nAll smoke checks passed.' : `\n${failed} check(s) failed.`)
process.exit(failed === 0 ? 0 : 1)
