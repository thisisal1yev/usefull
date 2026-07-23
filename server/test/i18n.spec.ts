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
  it('booking texts substitute name and time', () => {
    expect(tf('en', 'booking_confirmed', { name: 'T', time: '2026-07-22 18:00' })).toContain('18:00')
    expect(tf('uz', 'reminder', { name: 'T', time: '18:00' })).toContain('18:00')
  })
  it('payment texts substitute variables', () => {
    expect(tf('en', 'payment_success_premium', { until: '2026-08-20' })).toContain('2026-08-20')
    expect(tf('uz', 'coach_assigned_learner', { name: 'K', contact: '@k' })).toContain('@k')
  })
  it('referral texts substitute variables', () => {
    expect(tf('en', 'referral_joined', { name: 'Bek' })).toContain('Bek')
    expect(tf('uz', 'referral_reward', { days: '7' })).toContain('7')
  })
  it('has a non-empty string for every key in both languages', () => {
    const keys = ['welcome', 'ask_level', 'ask_goal', 'ask_availability', 'done', 'invalid_choice', 'open_app', 'match_request_received', 'match_accepted', 'teacher_ask_bio', 'teacher_ask_experience', 'teacher_ask_certificates', 'teacher_bio_too_short', 'teacher_submitted', 'teacher_already_pending', 'teacher_already_approved', 'teacher_approved', 'teacher_rejected', 'admin_new_teacher', 'booking_confirmed', 'booking_new_for_teacher', 'booking_cancelled', 'reminder', 'upgrade_intro', 'payment_success_premium', 'payment_success_gold', 'plan_expired', 'admin_new_gold', 'coach_assigned_learner', 'coach_assigned_coach', 'referral_joined', 'referral_reward'] as const
    for (const k of keys) {
      expect(t('uz', k).length).toBeGreaterThan(0)
      expect(t('en', k).length).toBeGreaterThan(0)
    }
  })
})
