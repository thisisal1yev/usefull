import { useEffect, useState } from 'react'
import { api } from '../api'

export interface PendingTeacher {
  user_id: string
  bio: string
  experience: string | null
  certificates_url: string | null
  user: { first_name: string; username: string | null }
}

export interface GoldLearner {
  id: string
  first_name: string
  username: string | null
}

export default function AdminScreen() {
  const [items, setItems] = useState<PendingTeacher[] | null>(null)
  const [gold, setGold] = useState<GoldLearner[] | null>(null)
  const [coachDrafts, setCoachDrafts] = useState<Record<string, string>>({})

  const load = () => {
    api<PendingTeacher[]>('/api/admin/teachers?status=pending')
      .then(setItems)
      .catch(() => setItems([]))
    api<GoldLearner[]>('/api/admin/gold')
      .then(setGold)
      .catch(() => setGold([]))
  }

  useEffect(load, [])

  const decide = async (userId: string, status: 'approved' | 'rejected') => {
    await api(`/api/admin/teachers/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }).catch(() => undefined)
    setItems((list) => (list ?? []).filter((t) => t.user_id !== userId))
  }

  const assignCoach = async (learnerId: string) => {
    const coachUsername = (coachDrafts[learnerId] ?? '').trim()
    if (!coachUsername) return
    await api('/api/admin/coach', {
      method: 'POST',
      body: JSON.stringify({ learnerId, coachUsername }),
    }).catch(() => undefined)
    setGold((list) => (list ?? []).filter((g) => g.id !== learnerId))
  }

  if (items === null) {
    return <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
  }

  return (
    <div className="px-3 py-2">
      <h2 className="mt-2 mb-1 text-sm font-semibold text-tg-hint">O'qituvchi arizalari</h2>
      {items.length === 0 ? (
        <div className="py-4 text-center text-tg-hint">Yangi arizalar yo'q</div>
      ) : (
        items.map((a) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={a.user_id}>
            <div className="font-semibold">
              <span>{a.user.first_name}</span>
              {a.user.username ? <span>{` · @${a.user.username}`}</span> : null}
            </div>
            <div className="mt-1 text-sm">{a.bio}</div>
            {a.experience && <div className="mt-1 text-xs text-tg-hint">Tajriba: {a.experience}</div>}
            {a.certificates_url && (
              <a className="mt-1 block text-xs text-tg-link" href={a.certificates_url}>
                Sertifikat
              </a>
            )}
            <div className="mt-2 flex gap-2">
              <button
                className="flex-1 rounded-lg bg-tg-button p-2.5 text-sm font-semibold text-tg-button-text"
                onClick={() => decide(a.user_id, 'approved')}
              >
                Tasdiqlash
              </button>
              <button
                className="flex-1 rounded-lg border border-tg-hint/50 p-2.5 text-sm text-tg-text"
                onClick={() => decide(a.user_id, 'rejected')}
              >
                Rad etish
              </button>
            </div>
          </div>
        ))
      )}

      <h2 className="mt-4 mb-1 text-sm font-semibold text-tg-hint">Gold: murabbiy kerak</h2>
      {(gold ?? []).length === 0 ? (
        <div className="py-4 text-center text-tg-hint">Hammaga murabbiy biriktirilgan</div>
      ) : (
        (gold ?? []).map((g) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={g.id}>
            <div className="font-semibold">
              <span>{g.first_name}</span>
              {g.username && <span className="text-tg-hint"> · @{g.username}</span>}
            </div>
            <input
              className="mt-2 w-full rounded-lg border border-tg-hint/50 bg-tg-bg p-2.5 text-tg-text placeholder:text-tg-hint"
              placeholder="murabbiy @username"
              value={coachDrafts[g.id] ?? ''}
              onChange={(e) => setCoachDrafts((d) => ({ ...d, [g.id]: e.target.value }))}
            />
            <button
              className="mt-2 w-full rounded-lg bg-tg-button p-2.5 text-sm font-semibold text-tg-button-text"
              onClick={() => assignCoach(g.id)}
            >
              Biriktirish
            </button>
          </div>
        ))
      )}
    </div>
  )
}
