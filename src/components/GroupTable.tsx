import React from 'react'
import type { GroupId, Match, Pair } from '../data/types'
import { computeStandings } from '../logic/tieBreakers'
import { useTournament } from '../store/useTournament'

export default function GroupTable({ groupId, pairs, matches }:{
  groupId: GroupId, pairs: Pair[], matches: Match[]
}) {
  const { dispatch } = useTournament()
  const pairIds = pairs.map(p => p.id)
  const standings = computeStandings(pairIds, matches)

  const handleChange = (pair: Pair, idx: 0|1, value: string) => {
    const players: [string,string] = [...pair.players] as any
    players[idx] = value
    dispatch({ type: 'UPDATE_PAIR_PLAYERS', pairId: pair.id, players })
  }

  return (
    <div className="card">
      <h3>Girone {groupId}</h3>

      <div className="mt-3 space-y-3">
        {pairs.map(pair => (
          <div key={pair.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-2 text-xs opacity-70">{pair.id}</div>
            <input type="text" className="col-span-4" value={pair.players[0]} onChange={e=>handleChange(pair,0,e.target.value)} />
            <span className="col-span-1 text-center opacity-70">/</span>
            <input type="text" className="col-span-4" value={pair.players[1]} onChange={e=>handleChange(pair,1,e.target.value)} />
            <div className="col-span-1 text-right text-xs opacity-70">✎</div>
          </div>
        ))}
      </div>

      <h3 className="mt-5">Classifica</h3>
      <table className="table">
        <thead><tr><th>#</th><th>Coppia</th><th>GF</th><th>GS</th><th>Diff</th></tr></thead>
        <tbody>
          {standings.map((s,i) => (
            <tr key={s.pairId} className="bg-white/5">
              <td>{i+1}</td>
              <td>{pairs.find(p=>p.id===s.pairId)?.players.join(' / ')}</td>
              <td>{s.GF}</td><td>{s.GS}</td><td>{s.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
