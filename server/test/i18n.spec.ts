import { t, tf } from '../src/i18n/i18n'

describe('t', () => {
  it('returns uzbek text', () => {
    expect(t('uz', 'ask_level')).toContain('darajangiz')
  })
  it('returns english text', () => {
    expect(t('en', 'ask_level')).toContain('English level')
  })
  it('tf substitutes variables', () => {
    expect(tf('en', 'match_request_received', { name: 'Ali' })).toContain('Ali')
    expect(tf('uz', 'match_accepted', { name: 'Bek', contact: '@bek' })).toContain('@bek')
  })
  it('has a non-empty string for every key in both languages', () => {
    const keys = ['welcome', 'ask_level', 'ask_goal', 'ask_availability', 'done', 'invalid_choice', 'open_app', 'match_request_received', 'match_accepted'] as const
    for (const k of keys) {
      expect(t('uz', k).length).toBeGreaterThan(0)
      expect(t('en', k).length).toBeGreaterThan(0)
    }
  })
})
