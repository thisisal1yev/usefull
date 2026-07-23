import { useState } from 'react'
import PartnersScreen from './PartnersScreen'
import MatchesScreen from './MatchesScreen'

type View = 'partners' | 'requests'

export default function SpeakingScreen() {
  const [view, setView] = useState<View>('partners')

  return (
    <div>
      <div className="flex gap-1.5 px-3 pt-3">
        {(['partners', 'requests'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-xl py-2.5 font-mono text-[13px] capitalize ${
              view === v
                ? 'bg-tg-button font-bold text-tg-button-text'
                : 'border border-tg-hint/30 text-tg-hint'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      {view === 'partners' ? <PartnersScreen /> : <MatchesScreen />}
    </div>
  )
}
