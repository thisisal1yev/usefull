import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import BankScreen from './screens/BankScreen'
import QaScreen from './screens/QaScreen'
import PartnersScreen from './screens/PartnersScreen'
import MatchesScreen from './screens/MatchesScreen'
import LessonsScreen from './screens/LessonsScreen'
import AdminScreen from './screens/AdminScreen'
import { api } from './api'

const BASE_TABS = [
  { id: 'partners', label: 'Sheriklar' },
  { id: 'matches', label: "So'rovlar" },
  { id: 'lessons', label: 'Darslar' },
  { id: 'bank', label: 'Savollar' },
  { id: 'qa', label: 'Q&A' },
] as const

type TabId = (typeof BASE_TABS)[number]['id'] | 'admin'

const SCREENS: Record<TabId, ComponentType> = {
  partners: PartnersScreen,
  matches: MatchesScreen,
  lessons: LessonsScreen,
  bank: BankScreen,
  qa: QaScreen,
  admin: AdminScreen,
}

export default function App() {
  const [tab, setTab] = useState<TabId>('partners')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    api<{ role?: string }>('/api/me')
      .then((me) => setIsAdmin(me.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }, [])

  const tabs: Array<{ id: TabId; label: string }> = [
    ...BASE_TABS,
    ...(isAdmin ? [{ id: 'admin' as const, label: 'Admin' }] : []),
  ]
  const Screen = SCREENS[tab]

  return (
    <div>
      <div className="sticky top-0 flex overflow-x-auto border-b border-tg-hint/30 bg-tg-bg">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`shrink-0 px-3 py-3 text-[14px] ${
              tab === t.id
                ? '-mb-px border-b-2 border-tg-link font-semibold text-tg-link'
                : 'text-tg-hint'
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Screen />
    </div>
  )
}
