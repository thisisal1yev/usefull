import { useEffect, useState } from 'react'
import { api } from '../api'

export interface PendingTeacher {
  user_id: string
  bio: string
  experience: string | null
  certificates_url: string | null
  user: { first_name: string; username: string | null }
}

export default function AdminScreen() {
  const [items, setItems] = useState<PendingTeacher[] | null>(null)

  const load = () => {
    api<PendingTeacher[]>('/api/admin/teachers?status=pending')
      .then(setItems)
      .catch(() => setItems([]))
  }

  useEffect(load, [])

  const decide = async (userId: string, status: 'approved' | 'rejected') => {
    await api(`/api/admin/teachers/${userId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }).catch(() => undefined)
    setItems((list) => (list ?? []).filter((t) => t.user_id !== userId))
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
    </div>
  )
}
