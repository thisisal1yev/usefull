import { useEffect, useState } from 'react'
import SpeakingScreen from './screens/SpeakingScreen'
import BankScreen from './screens/BankScreen'
import InviteScreen from './screens/InviteScreen'
import ProfileScreen from './screens/ProfileScreen'
import AdminScreen from './screens/AdminScreen'
import LessonsScreen from './screens/LessonsScreen'
import { api } from './api'

// Founder direction: four primary tabs + an admin tab only admins see.
// Lessons live behind Profile, reachable without cluttering the bar.
type Screen = 'speaking' | 'bank' | 'invite' | 'profile' | 'admin' | 'lessons'

const TABS = [
  { id: 'speaking', label: 'speaking' },
  { id: 'bank', label: 'bank' },
  { id: 'invite', label: 'invite' },
  { id: 'profile', label: 'profile' },
] as const

export default function App() {
  const [screen, setScreen] = useState<Screen>('speaking')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    api<{ role?: string }>('/api/me')
      .then((me) => setIsAdmin(me.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }, [])

  const tabs: Array<{ id: Screen; label: string }> = [
    ...TABS,
    ...(isAdmin ? [{ id: 'admin' as const, label: 'admin' }] : []),
  ]
  const activeTab = screen === 'lessons' ? 'profile' : screen

  const renderScreen = () => {
    switch (screen) {
      case 'speaking':
        return <SpeakingScreen />
      case 'bank':
        return <BankScreen />
      case 'invite':
        return <InviteScreen />
      case 'profile':
        return <ProfileScreen onOpenLessons={() => setScreen('lessons')} />
      case 'admin':
        return <AdminScreen />
      case 'lessons':
        return <LessonsScreen />
    }
  }

  return (
    <div className="min-h-screen pb-16">
      {screen === 'lessons' && (
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-tg-hint/25 bg-tg-bg px-3 py-3">
          <button className="text-tg-link" onClick={() => setScreen('profile')}>
            ‹ Orqaga
          </button>
          <span className="font-semibold">Ustozlar</span>
        </div>
      )}

      {renderScreen()}

      <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-tg-hint/25 bg-tg-bg pt-2 pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            className={`text-[13px] ${
              activeTab === t.id ? 'font-semibold text-tg-text' : 'text-tg-hint'
            }`}
          >
            <span
              className={`mx-auto mb-1 block h-1 w-1 rounded-full ${
                activeTab === t.id ? 'bg-tg-link' : 'bg-transparent'
              }`}
            />
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
