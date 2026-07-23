import { useEffect, useState } from 'react'
import { api } from '../api'
import { tg } from '../telegram'

interface Me {
  first_name: string
  plan: 'free' | 'premium' | 'gold'
  plan_expires_at: string | null
  role: string
}

const PLAN_LABEL: Record<Me['plan'], string> = { free: 'Free', premium: 'Premium ⭐', gold: 'Gold 👑' }

const BENEFITS: Record<Me['plan'], string> = {
  free: 'Haftasiga 1 ta bepul dars',
  premium: 'Haftasiga 3 ta dars',
  gold: 'Haftasiga 3 ta dars + shaxsiy murabbiy',
}

export default function ProfileScreen({ onOpenLessons }: { onOpenLessons?: () => void }) {
  const [me, setMe] = useState<Me | null>(null)

  const load = () => {
    api<Me>('/api/me').then(setMe).catch(() => setMe(null))
  }

  useEffect(load, [])

  const buy = async (tier: 'premium' | 'gold') => {
    const { link } = await api<{ link: string }>('/api/billing/invoice', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    }).catch(() => ({ link: '' }))
    if (!link) return
    tg.openInvoice?.(link, (status) => {
      if (status === 'paid') load()
    })
  }

  if (me === null) {
    return <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
  }

  const initial = me.first_name.trim().charAt(0).toUpperCase() || '🎙'

  return (
    <div className="px-4 py-6">
      {/* header — centered avatar, name, plan badge */}
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-tg-button text-3xl font-bold text-tg-button-text">
          {initial}
        </div>
        <div className="text-xl font-bold">{me.first_name}</div>
        <div
          className={`rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wide ${
            me.plan === 'free'
              ? 'border border-tg-hint/40 text-tg-hint'
              : 'bg-tg-button text-tg-button-text'
          }`}
        >
          {PLAN_LABEL[me.plan]}
        </div>
      </div>

      {/* plan card */}
      <div className="mt-6 rounded-2xl bg-tg-secondary p-4">
        <div className="text-sm text-tg-hint">Sizning tarifingiz</div>
        <div className="mt-1 text-[15px]">{BENEFITS[me.plan]}</div>
        {me.plan_expires_at && (
          <div className="mt-2 font-mono text-xs text-tg-hint">
            Amal qiladi: {me.plan_expires_at.slice(0, 10)}
          </div>
        )}
      </div>

      {/* upgrade actions */}
      {me.plan === 'free' && (
        <>
          <button
            className="mt-3 w-full rounded-xl bg-tg-button p-3.5 text-[15px] font-semibold text-tg-button-text"
            onClick={() => buy('premium')}
          >
            Premium olish ⭐ — haftasiga 3 ta dars
          </button>
          <button
            className="mt-2 w-full rounded-xl bg-tg-button p-3.5 text-[15px] font-semibold text-tg-button-text"
            onClick={() => buy('gold')}
          >
            Gold olish 👑 — Premium + murabbiy
          </button>
        </>
      )}
      {me.plan === 'premium' && (
        <button
          className="mt-3 w-full rounded-xl bg-tg-button p-3.5 text-[15px] font-semibold text-tg-button-text"
          onClick={() => buy('gold')}
        >
          Gold olish 👑 — shaxsiy murabbiy
        </button>
      )}
      {me.plan === 'gold' && (
        <div className="mt-3 rounded-2xl bg-tg-secondary p-4 text-center text-sm">
          Gold aktiv 👑 — rahmat!
        </div>
      )}

      {/* navigation rows — founder list style */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-tg-secondary">
        <button
          className="flex w-full items-center gap-3 border-b border-tg-hint/15 p-4 text-left"
          onClick={onOpenLessons}
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-tg-bg text-base">📚</span>
          <span className="flex-1 text-[15px]">Ustozlar bilan darslar</span>
          <span className="text-tg-hint">›</span>
        </button>
        <a
          className="flex w-full items-center gap-3 p-4"
          href="https://t.me/usefull_bot"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-tg-bg text-base">🛟</span>
          <span className="flex-1 text-[15px]">Yordam</span>
          <span className="text-tg-hint">›</span>
        </a>
      </div>
    </div>
  )
}
