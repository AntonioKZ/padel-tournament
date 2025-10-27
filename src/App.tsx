import React from 'react'
import Groups from './pages/Groups'
import Standings from './pages/Standings'
import Schedule from './pages/Schedule'
import Live from './pages/Live'
import Gold from './pages/Gold'
import Silver from './pages/Silver'
import AppHeader from './components/AppHeader'
import Stats from './pages/Stats'
import Report from './pages/Report'

type Tab = 'groups'|'standings'|'schedule'|'live'|'gold'|'silver'|'stats'|'report'


export default function App() {
  // expose matches globally for PDF report
  const [_, __] = React.useState(0)

  const [tab, setTab] = React.useState<Tab>('groups')
  return (
    <div className="container py-6">
      <header className="container py-2 print-hidden">
        <AppHeader />
      </header>
      <nav className="nav flex items-center justify-between">
        <div>
        {([
          ['groups','Gironi'],
          ['schedule','Programma'],
          ['live','Live'],
          ['standings','Classifiche'],
          ['gold','Torneo Gold'],
          ['silver','Torneo Silver'],
          ['report','Report'],
        ] as [Tab,string][]).map(([k,label]) => (
          <button key={k} onClick={()=>setTab(k)} className={`tab ${tab===k?'tab-active':''}`}>{label}</button>
        ))}
              </div>
      </nav>

      {tab==='groups' && <Groups/>}
      {tab==='schedule' && <Schedule/>}
      {tab==='live' && <Live/>}
      {tab==='standings' && <Standings/>}
      {tab==='gold' && <Gold/>}
      {tab==='silver' && <Silver/>}
      {tab==='stats' && <Stats/>}
      {tab==='report' && <Report/>}
    </div>
  )
}