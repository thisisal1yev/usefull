import { useState } from 'react'
import type { ComponentType } from 'react'
import BankScreen from './screens/BankScreen'
import QaScreen from './screens/QaScreen'
import PartnersScreen from './screens/PartnersScreen'
import MatchesScreen from './screens/MatchesScreen'

const TABS = [
  { id: 'partners', label: 'Sheriklar' },
  { id: 'matches', label: "So'rovlar" },
  { id: 'bank', label: 'Savollar' },
  { id: 'qa', label: 'Q&A' },
] as const

type TabId = (typeof TABS)[number]['id']

const SCREENS: Record<TabId, ComponentType> = {
  partners: PartnersScreen,
  matches: MatchesScreen,
  bank: BankScreen,
  qa: QaScreen,
}

export default function App() {
  const [tab, setTab] = useState<TabId>('partners')
  const Screen = SCREENS[tab]
  return (
    <div>
      <div className="sticky top-0 flex border-b border-tg-hint/30 bg-tg-bg">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`flex-1 py-3 text-[14px] ${
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
