import { useEffect, useState } from 'react'
import { api } from '../api'
import { tg } from '../telegram'

interface Summary {
  code: string
  link: string
  invitedCount: number
  daysEarned: number
  nextMilestone: { friends: number; days: number; remaining: number } | null
  invited: Array<{ first_name: string; created_at: string }>
}

const TIERS = [
  { friends: 2, days: 1 },
  { friends: 5, days: 7 },
  { friends: 10, days: 30 },
  { friends: 20, days: 90 },
]

export default function InviteScreen() {
  const [s, setS] = useState<Summary | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    api<Summary>('/api/referrals/me').then(setS).catch(() => setS(null))
  }, [])

  if (s === null) {
    return <div className="px-4 py-8 text-center text-tg-hint">Yuklanmoqda…</div>
  }

  const copy = () => {
    navigator.clipboard?.writeText(s.link).catch(() => undefined)
    setCopied(true)
  }

  const share = () => {
    const text = "Let's practice IELTS speaking on usfull!"
    tg.openTelegramLink?.(`https://t.me/share/url?url=${encodeURIComponent(s.link)}&text=${encodeURIComponent(text)}`)
  }

  const pct = s.nextMilestone
    ? Math.min(100, Math.round((s.invitedCount / s.nextMilestone.friends) * 100))
    : 100

  return (
    <div className="px-4 py-5">
      <div className="text-2xl font-bold">Invite friends</div>
      <div className="mt-1.5 text-sm text-tg-hint">
        The more friends who join, the more Premium you earn. Rewards keep growing.
      </div>

      <div className="mt-4 rounded-2xl bg-tg-secondary p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-tg-bg text-lg">🎁</div>
          <div>
            <div className="font-bold">{s.daysEarned} days of Premium earned</div>
            <div className="text-xs text-tg-hint">{s.invitedCount} friends joined</div>
          </div>
        </div>
        {s.nextMilestone && (
          <div className="mt-3.5 font-mono text-xs text-tg-link">
            <span className="text-tg-text">{s.nextMilestone.remaining} more</span> to unlock +
            {s.nextMilestone.days} day
          </div>
        )}
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-tg-bg">
          <div className="h-full bg-tg-button" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 mb-2 font-mono text-xs uppercase tracking-wider text-tg-hint">Rewards</div>
      {TIERS.map((t) => {
        const active = s.nextMilestone?.friends === t.friends
        const done = s.invitedCount >= t.friends
        return (
          <div
            key={t.friends}
            className={`mb-2.5 flex items-center gap-3 rounded-2xl border p-3.5 ${
              active ? 'border-tg-link bg-tg-link/5' : 'border-tg-hint/25'
            }`}
          >
            <div
              className={`grid h-8 w-8 place-items-center rounded-full font-mono text-sm font-bold ${
                done || active ? 'bg-tg-button text-tg-button-text' : 'bg-tg-bg text-tg-hint'
              }`}
            >
              {t.friends}
            </div>
            <div className="flex-1 text-[15px]">{t.friends} friends</div>
            <div className={`font-mono text-sm ${active ? 'text-tg-link' : 'text-tg-hint'}`}>
              {t.days} {t.days === 1 ? 'day' : 'days'}
            </div>
          </div>
        )
      })}

      <div className="mt-1 mb-3 flex items-center gap-2.5 rounded-xl border border-tg-hint/25 bg-tg-bg p-3">
        <code className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-tg-hint">
          {s.link.replace('https://', '')}
        </code>
        <button className="font-mono text-xs font-bold text-tg-link" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <button
        className="w-full rounded-xl bg-tg-button p-3.5 text-[15px] font-semibold text-tg-button-text"
        onClick={share}
      >
        ↗ Share invite link
      </button>

      <div className="mt-5 mb-2 font-mono text-xs uppercase tracking-wider text-tg-hint">
        Invited ({s.invitedCount})
      </div>
      {s.invited.length === 0 ? (
        <div className="text-sm text-tg-hint">No invites yet. Share your link to get started.</div>
      ) : (
        s.invited.map((f, i) => (
          <div className="mb-2 flex items-center justify-between rounded-xl bg-tg-secondary p-3" key={i}>
            <span className="text-sm">{f.first_name}</span>
            <span className="font-mono text-xs text-tg-hint">{f.created_at.slice(0, 10)}</span>
          </div>
        ))
      )}
    </div>
  )
}
