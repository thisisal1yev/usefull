import { useEffect, useState } from 'react'
import { api } from '../api'

export interface ExamQuestion {
  id: string
  part: string
  topic: string | null
  question: string
  published_at: string
}

const PARTS = ['All', 'Part 1', 'Part 2', 'Part 3'] as const

export default function BankScreen() {
  const [part, setPart] = useState<(typeof PARTS)[number]>('All')
  const [items, setItems] = useState<ExamQuestion[] | null>(null)

  useEffect(() => {
    setItems(null)
    const qs = part === 'All' ? '' : `?part=${encodeURIComponent(part)}`
    api<ExamQuestion[]>(`/api/exam-questions${qs}`)
      .then(setItems)
      .catch(() => setItems([]))
  }, [part])

  return (
    <div>
      <div className="flex gap-2 p-3">
        {PARTS.map((p) => (
          <button
            key={p}
            className={`rounded-full px-3 py-1.5 text-[13px] ${
              p === part
                ? 'bg-tg-button text-tg-button-text'
                : 'border border-tg-hint/50 text-tg-text'
            }`}
            onClick={() => setPart(p)}
          >
            {p}
          </button>
        ))}
      </div>
      {items === null ? (
        <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-tg-hint">Hozircha savollar yo'q</div>
      ) : (
        <div className="px-3 py-2">
          {items.map((q) => (
            <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={q.id}>
              <div>{q.question}</div>
              <div className="mt-1.5 text-xs text-tg-hint">
                {q.part}
                {q.topic ? ` · ${q.topic}` : ''} ·{' '}
                {new Date(q.published_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
