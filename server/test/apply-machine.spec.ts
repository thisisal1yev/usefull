import { applyInitial, applyTeacherInput, TeacherApplyState } from '../src/teachers/apply-machine'

describe('teacher apply machine', () => {
  it('walks bio → experience → certificates → done', () => {
    let s: TeacherApplyState = applyInitial
    s = applyTeacherInput(s, 'I have taught IELTS for 5 years').state
    expect(s.step).toBe('experience')
    s = applyTeacherInput(s, '5 years, band 8.0').state
    expect(s.step).toBe('certificates')
    s = applyTeacherInput(s, 'https://example.com/cert.pdf').state
    expect(s).toEqual({
      step: 'done',
      bio: 'I have taught IELTS for 5 years',
      experience: '5 years, band 8.0',
      certificatesUrl: 'https://example.com/cert.pdf',
    })
  })

  it('skips optional steps with "-"', () => {
    let s: TeacherApplyState = applyInitial
    s = applyTeacherInput(s, 'Experienced IELTS speaking coach').state
    s = applyTeacherInput(s, '-').state
    s = applyTeacherInput(s, '-').state
    expect(s.step).toBe('done')
    expect(s.experience).toBeUndefined()
    expect(s.certificatesUrl).toBeUndefined()
  })

  it('rejects a too-short bio and stays on the step', () => {
    const r = applyTeacherInput(applyInitial, 'hi')
    expect(r.error).toBe('too_short')
    expect(r.state.step).toBe('bio')
  })
})
