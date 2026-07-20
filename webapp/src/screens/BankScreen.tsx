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
      <div className="chips">
        {PARTS.map((p) => (
          <button key={p} className={p === part ? 'active' : ''} onClick={() => setPart(p)}>
            {p}
          </button>
        ))}
      </div>
      {items === null ? (
        <div className="empty">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="empty">Hozircha savollar yo'q</div>
      ) : (
        <div className="list">
          {items.map((q) => (
            <div className="card" key={q.id}>
              <div>{q.question}</div>
              <div className="meta">
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
