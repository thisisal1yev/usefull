import { useEffect, useState } from 'react'
import { api } from '../api'

export interface Candidate {
  id: string
  first_name: string
  username: string | null
  level: string | null
  goal: string | null
  availability: string | null
}

const LEVELS = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'] as const

export default function PartnersScreen() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('All')
  const [items, setItems] = useState<Candidate[] | null>(null)
  const [sent, setSent] = useState<Set<string>>(new Set())

  useEffect(() => {
    setItems(null)
    const qs = level === 'All' ? '' : `?level=${level}`
    api<Candidate[]>(`/api/partners${qs}`)
      .then(setItems)
      .catch(() => setItems([]))
  }, [level])

  const request = async (id: string) => {
    try {
      await api('/api/matches', { method: 'POST', body: JSON.stringify({ toUserId: id }) })
    } catch {
      // 409 = already requested — treat as sent
    }
    setSent((s) => new Set(s).add(id))
  }

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto p-3">
        {LEVELS.map((l) => (
          <button
            key={l}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] ${
              l === level ? 'bg-tg-button text-tg-button-text' : 'border border-tg-hint/50 text-tg-text'
            }`}
            onClick={() => setLevel(l)}
          >
            {l}
          </button>
        ))}
      </div>
      {items === null ? (
        <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-tg-hint">Hozircha sheriklar yo'q</div>
      ) : (
        <div className="px-3 py-2">
          {items.map((c) => (
            <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={c.id}>
              <div className="font-semibold">{c.first_name}</div>
              <div className="mt-1 text-xs text-tg-hint">
                {[c.level, c.goal === 'ielts' ? 'IELTS' : c.goal, c.availability]
                  .filter(Boolean)
                  .join(' · ')}
              </div>
              <button
                className={`mt-2 w-full rounded-lg p-2.5 text-sm font-semibold ${
                  sent.has(c.id)
                    ? 'bg-tg-secondary text-tg-hint border border-tg-hint/40'
                    : 'bg-tg-button text-tg-button-text'
                }`}
                disabled={sent.has(c.id)}
                onClick={() => request(c.id)}
              >
                {sent.has(c.id) ? 'Yuborildi ✓' : "So'rov yuborish"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
