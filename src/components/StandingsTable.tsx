import React from 'react'
import type { GroupId, Match, Pair } from '../data/types'

function compute(pairIds: string[], matches: Match[]) {
  const map: Record<string, {GF:number;GS:number;diff:number}> = {}
  pairIds.forEach(id => (map[id] = { GF: 0, GS: 0, diff: 0 }))
  matches.forEach(m => {
    if (m.group) {
      map[m.pairA].GF += m.gamesA ?? 0; map[m.pairA].GS += m.gamesB ?? 0
      map[m.pairB].GF += m.gamesB ?? 0; map[m.pairB].GS += m.gamesA ?? 0
    }
  })
  return Object.entries(map)
    .map(([pairId, {GF,GS}]) => ({ pairId, GF, GS, diff: GF - GS }))
    .sort((a,b) => (b.diff - a.diff) || (b.GF - a.GF))
}

export default function StandingsTable({ groupId, pairs, matches }:{ groupId: GroupId, pairs: Pair[], matches: Match[] }) {
  const st = compute(pairs.map(p=>p.id), matches)
  const nameOf = (id:string) => pairs.find(p=>p.id===id)?.players.join(' / ') || id
  const medalForPosition = (pos:number) => pos<=2 ? '🥇 ' : (pos<=4 ? '🥈 ' : '')
  const slotTime = (m: any) => {
    const idx = (m.slotIndex ?? 0)
    const globalSlots = (window as any).__slotTimes as string[] | undefined
    return (m.time) ?? (globalSlots ? globalSlots[idx] : undefined)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">Girone {groupId}</h2>
      </div>

      {/* CLASSIFICA GIRONE */}
      <table className="w-full text-sm table-auto border border-white/10 rounded-lg overflow-hidden">
        <thead className="text-white/70">
          <tr>
            <th className="text-left py-2">#</th>
            <th className="text-left py-2">Coppia</th>
            <th className="text-center py-2">Game Fatti</th>
            <th className="text-center py-2">Game Subiti</th>
            <th className="text-center py-2">Differenza</th>
          </tr>
        </thead>
        <tbody>
          {st.map((r, i) => (
            <tr key={r.pairId} className="border-t border-white/10">
              <td className="py-2 text-left">{i+1}</td>
              <td className="py-2 text-left font-medium">{(medalForPosition(i+1))}{nameOf(r.pairId)}</td>
              <td className="py-2 text-center">{r.GF}</td>
              <td className="py-2 text-center">{r.GS}</td>
              <td className="py-2 text-center">{r.diff}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* RISULTATI PARTITE CONCLUSE */}
      <div className="mt-8 text-base font-semibold">Risultati partite concluse</div>
      <table className="table-auto w-full mt-2 border border-white/10 rounded-lg overflow-hidden">
        <thead className="text-white/70">
          <tr>
            <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 1</th>
            <th className="py-2 text-center border-b border-white/10 bg-white/5">Risultato</th>
            <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 2</th>
            <th className="py-2 text-left border-b border-white/10 bg-white/5">Info</th>
          </tr>
        </thead>
        <tbody>
          {matches.filter(m => ((m.gamesA ?? 0) + (m.gamesB ?? 0)) > 0).map(m => {
            const aWin = (m.gamesA ?? 0) > (m.gamesB ?? 0)
            const bWin = (m.gamesB ?? 0) > (m.gamesA ?? 0)
            const info = `Campo ${m.court ?? '—'} • Slot ${(m.slotIndex ?? 0)+1}` + (slotTime(m) ? ` • Ore ${slotTime(m)}` : '')
            return (
              <tr key={m.id} className="text-sm border-t border-white/10">
                <td className="py-2 text-left">{aWin ? <strong className="winner">🏆 {nameOf(m.pairA)}</strong> : <span>{nameOf(m.pairA)}</span>}</td>
                <td className="py-2 text-center"><span className="score">{(m.gamesA ?? '—')}-{(m.gamesB ?? '—')}</span></td>
                <td className="py-2 text-left">{bWin ? <strong className="winner">🏆 {nameOf(m.pairB)}</strong> : <span>{nameOf(m.pairB)}</span>}</td>
                <td className="py-2 text-left">{info}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
