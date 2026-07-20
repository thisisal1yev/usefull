import { UiLang } from '../i18n/i18n'

export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const
export const GOALS = ['ielts', 'general'] as const
export const AVAILABILITIES = ['morning', 'day', 'evening', 'flexible'] as const

export type OnboardingStep = 'lang' | 'level' | 'goal' | 'availability' | 'done'

export interface OnboardingState {
  step: OnboardingStep
  uiLang?: UiLang
  level?: string
  goal?: string
  availability?: string
}

export const initialState: OnboardingState = { step: 'lang' }

export type StepResult =
  | { ok: true; state: OnboardingState }
  | { ok: false; error: 'invalid_choice' }

const includes = (arr: readonly string[], v: string) => arr.includes(v)

export function applyInput(state: OnboardingState, input: string): StepResult {
  switch (state.step) {
    case 'lang':
      if (input !== 'uz' && input !== 'en') return { ok: false, error: 'invalid_choice' }
      return { ok: true, state: { ...state, uiLang: input, step: 'level' } }
    case 'level':
      if (!includes(LEVELS, input)) return { ok: false, error: 'invalid_choice' }
      return { ok: true, state: { ...state, level: input, step: 'goal' } }
    case 'goal':
      if (!includes(GOALS, input)) return { ok: false, error: 'invalid_choice' }
      return { ok: true, state: { ...state, goal: input, step: 'availability' } }
    case 'availability':
      if (!includes(AVAILABILITIES, input)) return { ok: false, error: 'invalid_choice' }
      return { ok: true, state: { ...state, availability: input, step: 'done' } }
    case 'done':
      return { ok: true, state }
  }
}
