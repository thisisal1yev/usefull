import { computeStreak } from '../src/profile/streak'

const today = new Date('2026-07-23T10:00:00Z')
const d = (s: string) => s // 'YYYY-MM-DD'

describe('computeStreak', () => {
  it('is 0 with no activity', () => {
    expect(computeStreak([], today)).toBe(0)
  })

  it('counts a single active day today', () => {
    expect(computeStreak([d('2026-07-23')], today)).toBe(1)
  })

  it('counts consecutive days ending today', () => {
    expect(computeStreak(['2026-07-23', '2026-07-22', '2026-07-21'], today)).toBe(3)
  })

  it('dedupes multiple activities on the same day', () => {
    expect(computeStreak(['2026-07-23', '2026-07-23', '2026-07-22'], today)).toBe(2)
  })

  it('allows the streak to end yesterday (grace)', () => {
    expect(computeStreak(['2026-07-22', '2026-07-21'], today)).toBe(2)
  })

  it('breaks on a gap', () => {
    expect(computeStreak(['2026-07-23', '2026-07-21', '2026-07-20'], today)).toBe(1)
  })

  it('is 0 when the last active day is older than yesterday', () => {
    expect(computeStreak(['2026-07-20', '2026-07-19'], today)).toBe(0)
  })
})
