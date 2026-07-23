const DAY_MS = 24 * 60 * 60 * 1000
const iso = (d: Date): string => d.toISOString().slice(0, 10)

export function computeStreak(activityDates: string[], today: Date): number {
  const days = new Set(activityDates)
  if (days.size === 0) return 0

  let cursor = new Date(today.getTime())
  if (!days.has(iso(cursor))) {
    cursor = new Date(cursor.getTime() - DAY_MS) // grace: allow streak ending yesterday
    if (!days.has(iso(cursor))) return 0
  }

  let streak = 0
  while (days.has(iso(cursor))) {
    streak++
    cursor = new Date(cursor.getTime() - DAY_MS)
  }
  return streak
}
