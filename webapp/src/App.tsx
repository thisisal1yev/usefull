import { useState } from 'react'
import BankScreen from './screens/BankScreen'
import QaScreen from './screens/QaScreen'

const TABS = [
  { id: 'bank', label: 'Savollar' },
  { id: 'qa', label: 'Q&A' },
] as const

export default function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('bank')
  return (
    <div>
      <div className="sticky top-0 flex border-b border-tg-hint/30 bg-tg-bg">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`flex-1 py-3 text-[15px] ${
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
      {tab === 'bank' ? <BankScreen /> : <QaScreen />}
    </div>
  )
}
