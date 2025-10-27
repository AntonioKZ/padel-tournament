import React from 'react'
import type { GroupId, Pair } from '../data/types'
import { useTournament } from '../store/useTournament'

export default function GroupEditor({ groupId, pairs }:{ groupId: GroupId, pairs: Pair[] }) {
  const { dispatch } = useTournament()
  const onChange = (pair: Pair, idx: 0|1, val: string) => {
    const players: [string,string] = [...pair.players] as any
    players[idx] = val
    dispatch({ type: 'UPDATE_PAIR_PLAYERS', pairId: pair.id, players })
  }
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">Girone {groupId} — Modifica nomi</h3>
      <div className="mt-3 space-y-3">
        {pairs.map(p => (
          <div key={p.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 text-xs opacity-70">{p.id}</div>
            <input className="col-span-4 name-input" value={p.players[0]} onChange={e=>onChange(p,0,e.target.value)} />
            <span className="col-span-1 text-center opacity-70">/</span>
            <input className="col-span-4 name-input" value={p.players[1]} onChange={e=>onChange(p,1,e.target.value)} />
            <div className="col-span-1 text-right text-xs opacity-70">✎</div>
          </div>
        ))}
      </div>
    </div>
  )
}
