export interface TeacherApplyState {
  step: 'bio' | 'experience' | 'certificates' | 'done'
  bio?: string
  experience?: string
  certificatesUrl?: string
}

export const applyInitial: TeacherApplyState = { step: 'bio' }

export interface ApplyResult {
  state: TeacherApplyState
  error?: 'too_short'
}

const skipped = (text: string): string | undefined => (text.trim() === '-' ? undefined : text.trim())

export function applyTeacherInput(state: TeacherApplyState, text: string): ApplyResult {
  switch (state.step) {
    case 'bio': {
      const bio = text.trim()
      if (bio.length < 10) return { state, error: 'too_short' }
      return { state: { ...state, bio, step: 'experience' } }
    }
    case 'experience':
      return { state: { ...state, experience: skipped(text), step: 'certificates' } }
    case 'certificates':
      return { state: { ...state, certificatesUrl: skipped(text), step: 'done' } }
    case 'done':
      return { state }
  }
}
