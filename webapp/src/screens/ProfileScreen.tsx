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
  gold: "Haftasiga 3 ta dars + shaxsiy murabbiy",
}

export default function ProfileScreen() {
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

  return (
    <div className="px-3 py-2">
      <div className="mt-2 rounded-xl bg-tg-secondary p-4">
        <div className="text-lg font-semibold">{me.first_name}</div>
        <div className="mt-2 inline-block rounded-full bg-tg-button px-3 py-1 text-sm font-semibold text-tg-button-text">
          {PLAN_LABEL[me.plan]}
        </div>
        <div className="mt-2 text-sm text-tg-hint">{BENEFITS[me.plan]}</div>
        {me.plan_expires_at && (
          <div className="mt-1 text-xs text-tg-hint">
            Amal qiladi: {me.plan_expires_at.slice(0, 10)}
          </div>
        )}
      </div>

      {me.plan === 'free' && (
        <>
          <button
            className="mt-3 w-full rounded-lg bg-tg-button p-3 text-[15px] font-semibold text-tg-button-text"
            onClick={() => buy('premium')}
          >
            Premium olish ⭐ — haftasiga 3 ta dars
          </button>
          <button
            className="mt-2 w-full rounded-lg bg-tg-button p-3 text-[15px] font-semibold text-tg-button-text"
            onClick={() => buy('gold')}
          >
            Gold olish 👑 — Premium + murabbiy
          </button>
        </>
      )}
      {me.plan === 'premium' && (
        <button
          className="mt-3 w-full rounded-lg bg-tg-button p-3 text-[15px] font-semibold text-tg-button-text"
          onClick={() => buy('gold')}
        >
          Gold olish 👑 — shaxsiy murabbiy
        </button>
      )}
      {me.plan === 'gold' && (
        <div className="mt-3 rounded-xl bg-tg-secondary p-3 text-center text-sm">Gold aktiv 👑</div>
      )}
    </div>
  )
}
