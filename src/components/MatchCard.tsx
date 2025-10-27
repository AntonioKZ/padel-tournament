import React from 'react'
import type { Match, Pair } from '../data/types'

export default function MatchCard({ match, pairs, seconds, onUpdate, onConfirm }:{
  match: Match; pairs: Pair[]; seconds: number; onUpdate:(m:Match)=>void; onConfirm:(id:string)=>void;
}) {
  const nameOf = (id?: string) => {
    if (!id) return '—'
    const p = pairs.find(x => x.id === id)
    return p ? p.players.join(' / ') : id
  }
  const progress = (seconds/(25*60))*100

  return (
    <div className="card relative">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm opacity-80">
          Campo <b>{match.court}</b> • Slot <b>{(match.slotIndex??0)+1}</b> • {match.phase} {match.group?`(${match.group})`:''}
        </div>
        <div className={`badge ${match.status==='live'?'badge-live':''}`}>{match.status}</div>
      </div>

      <div className="timer-bar"><div className="timer-fill" style={{width:`${progress}%`}}/></div>

      <div className="mt-4 grid grid-cols-3 gap-2 items-center">
        <div className="text-right text-sm md:text-base">{nameOf(match.pairA)}</div>
        <div className="text-center score text-3xl md:text-4xl">
          <span className="score-a">{match.gamesA}</span> - <span className="score-b">{match.gamesB}</span>
        </div>
        <div className="text-left text-sm md:text-base">{nameOf(match.pairB)}</div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        <button className="btn col-span-1" onClick={()=>onUpdate({ ...match, gamesA: Math.max(0,match.gamesA-1) })}>-A</button>
        <button className="btn btn-accent col-span-1" onClick={()=>onUpdate({ ...match, gamesA: match.gamesA+1 })}>+A</button>
        <div className="col-span-1"></div>
        <button className="btn btn-accent col-span-1" onClick={()=>onUpdate({ ...match, gamesB: match.gamesB+1 })}>+B</button>
        <button className="btn col-span-1" onClick={()=>onUpdate({ ...match, gamesB: Math.max(0,match.gamesB-1) })}>-B</button>
      </div>

      <div className="mt-4 flex justify-center">
        <button className="btn btn-primary" onClick={()=>onConfirm(match.id)}>Conferma</button>
      </div>
      <span className="ribbon ribbon-group">{match.phase}</span>
    </div>
  )
}
