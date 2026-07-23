import { useEffect, useState } from 'react'
import { Mic, BookOpen, Gift, User, Shield, type LucideIcon } from 'lucide-react'
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

interface Tab {
  id: Screen
  label: string
  Icon: LucideIcon
}

const TABS: readonly Tab[] = [
  { id: 'speaking', label: 'speaking', Icon: Mic },
  { id: 'bank', label: 'bank', Icon: BookOpen },
  { id: 'invite', label: 'invite', Icon: Gift },
  { id: 'profile', label: 'profile', Icon: User },
] as const

export default function App() {
  const [screen, setScreen] = useState<Screen>('speaking')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    api<{ role?: string }>('/api/me')
      .then((me) => setIsAdmin(me.role === 'admin'))
      .catch(() => setIsAdmin(false))
  }, [])

  const tabs: Tab[] = [
    ...TABS,
    ...(isAdmin ? [{ id: 'admin' as const, label: 'admin', Icon: Shield }] : []),
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
        {tabs.map((t) => {
          const active = activeTab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setScreen(t.id)}
              className={`flex flex-col items-center gap-1 text-[11px] ${
                active ? 'font-semibold text-tg-link' : 'text-tg-hint'
              }`}
            >
              <t.Icon size={21} strokeWidth={active ? 2.4 : 1.8} />
              {t.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
