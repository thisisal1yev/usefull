import { useEffect, useState } from 'react'
import { api } from '../api'

export interface MatchProfile {
  id: string
  first_name: string
  username: string | null
  level: string | null
}

export interface MatchRow {
  id: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  from: MatchProfile
  to: MatchProfile
}

interface MatchesData {
  incoming: MatchRow[]
  outgoing: MatchRow[]
}

const STATUS_LABEL: Record<MatchRow['status'], string> = {
  pending: '⏳ Kutilmoqda',
  accepted: '✅ Qabul qilindi',
  declined: '❌ Rad etildi',
}

const contactHref = (contact: string) =>
  contact.startsWith('@') ? `https://t.me/${contact.slice(1)}` : contact

export default function MatchesScreen() {
  const [data, setData] = useState<MatchesData | null>(null)
  const [contacts, setContacts] = useState<Record<string, string>>({})

  const load = () => {
    api<MatchesData>('/api/matches')
      .then(setData)
      .catch(() => setData({ incoming: [], outgoing: [] }))
  }

  useEffect(load, [])

  const respond = async (id: string, accept: boolean) => {
    const result = await api<{ status: string; contact?: string }>(`/api/matches/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ accept }),
    }).catch(() => null)
    if (result?.contact) setContacts((c) => ({ ...c, [id]: result.contact! }))
    load()
  }

  if (data === null) {
    return <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
  }

  return (
    <div className="px-3 py-2">
      <h2 className="mt-2 mb-1 text-sm font-semibold text-tg-hint">Kelgan so'rovlar</h2>
      {data.incoming.length === 0 ? (
        <div className="py-4 text-center text-tg-hint">So'rovlar yo'q</div>
      ) : (
        data.incoming.map((m) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={m.id}>
            <div className="font-semibold">{m.from.first_name}</div>
            <div className="mt-1 text-xs text-tg-hint">{m.from.level ?? ''}</div>
            {m.status === 'pending' ? (
              <div className="mt-2 flex gap-2">
                <button
                  className="flex-1 rounded-lg bg-tg-button p-2.5 text-sm font-semibold text-tg-button-text"
                  onClick={() => respond(m.id, true)}
                >
                  Qabul qilish
                </button>
                <button
                  className="flex-1 rounded-lg border border-tg-hint/50 p-2.5 text-sm text-tg-text"
                  onClick={() => respond(m.id, false)}
                >
                  Rad etish
                </button>
              </div>
            ) : (
              <div className="mt-1 text-xs text-tg-hint">{STATUS_LABEL[m.status]}</div>
            )}
            {contacts[m.id] && (
              <a className="mt-2 block text-tg-link" href={contactHref(contacts[m.id])}>
                {contacts[m.id]}
              </a>
            )}
          </div>
        ))
      )}

      <h2 className="mt-4 mb-1 text-sm font-semibold text-tg-hint">Yuborilgan</h2>
      {data.outgoing.length === 0 ? (
        <div className="py-4 text-center text-tg-hint">Yuborilgan so'rovlar yo'q</div>
      ) : (
        data.outgoing.map((m) => (
          <div className="mb-2 rounded-xl bg-tg-secondary p-3" key={m.id}>
            <div className="font-semibold">{m.to.first_name}</div>
            <div className="mt-1 text-xs text-tg-hint">{STATUS_LABEL[m.status]}</div>
            {m.status === 'accepted' && m.to.username && (
              <a className="mt-1 block text-tg-link" href={`https://t.me/${m.to.username}`}>
                @{m.to.username}
              </a>
            )}
          </div>
        ))
      )}
    </div>
  )
}
