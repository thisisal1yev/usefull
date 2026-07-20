import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

describe('api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ hello: 'world' }),
    })))
    window.Telegram = { WebApp: { initData: 'signed-init-data', ready: () => {}, expand: () => {} } }
    import.meta.env.VITE_API_URL = 'http://api.test'
  })

  it('attaches initData header and prefixes base url', async () => {
    const result = await api<{ hello: string }>('/api/me')
    expect(result).toEqual({ hello: 'world' })
    const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[0]).toBe('http://api.test/api/me')
    expect(call[1].headers['x-telegram-init-data']).toBe('signed-init-data')
  })

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) })))
    await expect(api('/api/me')).rejects.toThrow('401')
  })
})
