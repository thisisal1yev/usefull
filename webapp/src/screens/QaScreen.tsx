import { useEffect, useState } from 'react'
import { api } from '../api'

export interface CommunityQuestion {
  id: string
  body: string
  created_at: string
}

export interface Answer {
  id: string
  body: string
  created_at: string
}

export default function QaScreen() {
  const [items, setItems] = useState<CommunityQuestion[] | null>(null)
  const [draft, setDraft] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({})
  const [answerDraft, setAnswerDraft] = useState('')

  const load = () => {
    api<CommunityQuestion[]>('/api/questions')
      .then(setItems)
      .catch(() => setItems([]))
  }

  useEffect(load, [])

  const ask = async () => {
    if (draft.trim().length < 5) return
    await api('/api/questions', { method: 'POST', body: JSON.stringify({ body: draft.trim() }) })
    setDraft('')
    load()
  }

  const open = async (id: string) => {
    if (openId === id) {
      setOpenId(null)
      return
    }
    setOpenId(id)
    setAnswerDraft('')
    const list = await api<Answer[]>(`/api/questions/${id}/answers`).catch(() => [])
    setAnswers((a) => ({ ...a, [id]: list }))
  }

  const reply = async (id: string) => {
    if (!answerDraft.trim()) return
    await api(`/api/questions/${id}/answers`, {
      method: 'POST',
      body: JSON.stringify({ body: answerDraft.trim() }),
    })
    setAnswerDraft('')
    const list = await api<Answer[]>(`/api/questions/${id}/answers`).catch(() => [])
    setAnswers((a) => ({ ...a, [id]: list }))
  }

  return (
    <div className="list">
      <textarea
        placeholder="Savolingizni yozing…"
        value={draft}
        rows={2}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className="primary" onClick={ask}>
        Yuborish
      </button>

      {items === null ? (
        <div className="empty">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="empty">Birinchi savolni siz bering!</div>
      ) : (
        items.map((q) => (
          <div className="card" key={q.id} style={{ marginTop: 12 }}>
            <div onClick={() => open(q.id)}>{q.body}</div>
            <div className="meta">{new Date(q.created_at).toLocaleString()}</div>
            {openId === q.id && (
              <div style={{ marginTop: 8 }}>
                {(answers[q.id] ?? []).map((a) => (
                  <div className="card" key={a.id}>
                    <div>{a.body}</div>
                    <div className="meta">{new Date(a.created_at).toLocaleString()}</div>
                  </div>
                ))}
                <input
                  placeholder="Javob yozing…"
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                />
                <button className="primary" onClick={() => reply(q.id)}>
                  Javob berish
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
