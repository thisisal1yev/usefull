import { useState } from 'react'
import BankScreen from './screens/BankScreen'
import QaScreen from './screens/QaScreen'

export default function App() {
  const [tab, setTab] = useState<'bank' | 'qa'>('bank')
  return (
    <div>
      <div className="tabs">
        <button className={tab === 'bank' ? 'active' : ''} onClick={() => setTab('bank')}>
          Savollar
        </button>
        <button className={tab === 'qa' ? 'active' : ''} onClick={() => setTab('qa')}>
          Q&A
        </button>
      </div>
      {tab === 'bank' ? <BankScreen /> : <QaScreen />}
    </div>
  )
}
