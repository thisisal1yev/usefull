import { initialState, applyInput, LEVELS, OnboardingState } from '../src/onboarding/machine'

describe('onboarding machine', () => {
  it('starts at lang step', () => {
    expect(initialState.step).toBe('lang')
  })

  it('walks the happy path lang → level → goal → availability → done', () => {
    let s: OnboardingState = initialState
    const path = [
      ['uz', 'level'],
      ['B1', 'goal'],
      ['ielts', 'availability'],
      ['evening', 'done'],
    ] as const
    for (const [input, expectedStep] of path) {
      const r = applyInput(s, input)
      expect(r.ok).toBe(true)
      if (r.ok) s = r.state
      expect(s.step).toBe(expectedStep)
    }
    expect(s).toEqual({ step: 'done', uiLang: 'uz', level: 'B1', goal: 'ielts', availability: 'evening' })
  })

  it('rejects invalid input without changing state', () => {
    expect(applyInput(initialState, 'fr')).toEqual({ ok: false, error: 'invalid_choice' })
  })

  it('rejects a level not in LEVELS', () => {
    const atLevel: OnboardingState = { step: 'level', uiLang: 'en' }
    expect(applyInput(atLevel, 'Z9').ok).toBe(false)
    expect(LEVELS).not.toContain('Z9')
  })

  it('is a no-op after done', () => {
    const done: OnboardingState = { step: 'done', uiLang: 'uz', level: 'B1', goal: 'ielts', availability: 'evening' }
    expect(applyInput(done, 'anything')).toEqual({ ok: true, state: done })
  })
})
