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

const inputClass =
  'w-full rounded-lg border border-tg-hint/50 bg-tg-bg p-2.5 text-tg-text placeholder:text-tg-hint'
const primaryClass =
  'mt-2 w-full rounded-lg bg-tg-button p-3 text-[15px] font-semibold text-tg-button-text'

export default function QaScreen() {
  const [items, setItems] = useState<CommunityQuestion[] | null>(null)
  const [draft, setDraft] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Answer[]>>({})
  const [answerDraft, setAnswerDraft] = useState('')
  const [reported, setReported] = useState<Set<string>>(new Set())

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

  const report = async (targetType: 'question' | 'answer', targetId: string) => {
    setReported((s) => new Set(s).add(targetId))
    await api('/api/report', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId }),
    }).catch(() => undefined)
  }

  return (
    <div className="px-3 py-2">
      <textarea
        className={inputClass}
        placeholder="Savolingizni yozing…"
        value={draft}
        rows={2}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className={primaryClass} onClick={ask}>
        Yuborish
      </button>

      {items === null ? (
        <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
      ) : items.length === 0 ? (
        <div className="px-4 py-8 text-center text-tg-hint">Birinchi savolni siz bering!</div>
      ) : (
        items.map((q) => (
          <div className="mt-3 rounded-xl bg-tg-secondary p-3" key={q.id}>
            <div onClick={() => open(q.id)}>{q.body}</div>
            <div className="mt-1.5 text-xs text-tg-hint">
              {new Date(q.created_at).toLocaleString()}
              <button
                className="ml-2 text-xs text-tg-hint underline"
                disabled={reported.has(q.id)}
                onClick={() => report('question', q.id)}
              >
                {reported.has(q.id) ? 'Shikoyat yuborildi' : 'Shikoyat'}
              </button>
            </div>
            {openId === q.id && (
              <div className="mt-2">
                {(answers[q.id] ?? []).map((a) => (
                  <div className="mb-2 rounded-xl bg-tg-bg p-3" key={a.id}>
                    <div>{a.body}</div>
                    <div className="mt-1.5 text-xs text-tg-hint">
                      {new Date(a.created_at).toLocaleString()}
                      <button
                        className="ml-2 text-xs text-tg-hint underline"
                        disabled={reported.has(a.id)}
                        onClick={() => report('answer', a.id)}
                      >
                        {reported.has(a.id) ? 'Shikoyat yuborildi' : 'Shikoyat'}
                      </button>
                    </div>
                  </div>
                ))}
                <input
                  className={inputClass}
                  placeholder="Javob yozing…"
                  value={answerDraft}
                  onChange={(e) => setAnswerDraft(e.target.value)}
                />
                <button className={primaryClass} onClick={() => reply(q.id)}>
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
