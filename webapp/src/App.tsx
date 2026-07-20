import { useState } from 'react'

export function Placeholder({ name }: { name: string }) {
  return <div className="empty">{name} — coming soon</div>
}

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
      {tab === 'bank' ? <Placeholder name="Savollar banki" /> : <Placeholder name="Q&A" />}
    </div>
  )
}
