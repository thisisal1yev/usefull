import { loadConfig } from '../src/config/configuration'

const base = {
  BOT_TOKEN: 't',
  SUPABASE_URL: 'https://x.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'k',
}

describe('loadConfig', () => {
  it('throws when a required var is missing', () => {
    expect(() => loadConfig({})).toThrow(/BOT_TOKEN/)
  })

  it('applies defaults: polling mode, port 3000', () => {
    const c = loadConfig(base)
    expect(c.botMode).toBe('polling')
    expect(c.port).toBe(3000)
  })

  it('reads webhook mode and port', () => {
    const c = loadConfig({ ...base, BOT_MODE: 'webhook', PORT: '8080' })
    expect(c.botMode).toBe('webhook')
    expect(c.port).toBe(8080)
  })
})
