import React from 'react'
import { useTournament } from '../store/useTournament'
import Dashboard from '../components/Dashboard'
import type { Match, Pair } from '../data/types'

function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = React.useState(initialSeconds)
  const [running, setRunning] = React.useState(false)
  const start = React.useCallback(()=>setRunning(true),[])
  const pause = React.useCallback(()=>setRunning(false),[])
  const reset = React.useCallback(()=>{ setRunning(false); setSeconds(initialSeconds) },[initialSeconds])
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(()=>setSeconds(s => s>0 ? s-1 : 0), 1000)
    return ()=>clearInterval(id)
  }, [running])
  return { seconds, running, start, pause, reset }
}

export default function Live() {
  const { state, dispatch } = useTournament()
  const { tournament: t, matches, currentSlot, displaySlots } = state

  const pairsById: Record<string, Pair> = Object.fromEntries(
    (['A','B','C','D'] as const).flatMap(g => t.groups[g].map(p => [p.id, p]))
  )

  const currentMatches = matches.filter(m => (m.slotIndex ?? 0) === currentSlot)

  const onUpdate = (mm: Match) => {
    let a = mm.gamesA ?? 0, b = mm.gamesB ?? 0
    if (a === b && (a > 0 || b > 0)) {
      if (a < 6) a += 1; else b = Math.max(0, b-1)
    }
    dispatch({ type: 'SET_MATCH_RESULT', id: mm.id, gamesA: a, gamesB: b })
  }
  const onConfirm = (id: string) => {
    const mm = matches.find(m => m.id === id)
    if (mm) {
      let a = mm.gamesA ?? 0, b = mm.gamesB ?? 0
      if (a === b && (a > 0 || b > 0)) {
        if (a < 6) a += 1; else b = Math.max(0, b-1)
        dispatch({ type: 'SET_MATCH_RESULT', id, gamesA: a, gamesB: b })
      }
    }
    dispatch({ type: 'CONFIRM_MATCH', id })
  }

  const { seconds, running, start, pause, reset } = useCountdown(25*60)
  const mm = String(Math.floor(seconds/60)).padStart(2,'0')
  const ss = String(seconds%60).padStart(2,'0')

  return (
    <div className="container">      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm text-white/60">City Catania Sports Club</div>
          <h1>Live • Slot {currentSlot+1} ({displaySlots[currentSlot]})</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-6xl md:text-7xl font-black tracking-tight px-4 py-1 rounded-2xl bg-white/10 border border-white/10 shadow-glow">{mm}:{ss}</div>
          {!running
            ? <button className="btn btn-primary" onClick={()=>{ start(); dispatch({ type:'SET_LIVE_FOR_SLOT', slot: currentSlot }) }}>Start</button>
            : <button className="btn" onClick={pause}>Pausa</button>}
          <button className="btn" onClick={reset}>Reset 25:00</button>
          <span>Vai a slot:</span>
          <select className="select" value={currentSlot} onChange={e=>dispatch({ type: 'SET_SLOT', slot: Number(e.target.value) })}>
            {displaySlots.map((s, i) => <option value={i} key={i}>{i+1} • {s}</option>)}
          </select>
        </div>
      </div>

      <Dashboard tournament={t} pairsById={pairsById} matches={currentMatches} seconds={seconds} onUpdate={onUpdate} onConfirm={onConfirm} />
    </div>
  )
}
