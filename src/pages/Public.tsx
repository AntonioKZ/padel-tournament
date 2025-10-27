import React from 'react'
import { useTournament } from '../store/useTournament'

export default function PublicView() {
  const { state } = useTournament()
  const { tournament: t, matches, displaySlots } = state

  const bySlot: Record<number, typeof matches> = {}
  matches.forEach(m => {
    const s = m.slotIndex ?? 0
    bySlot[s] = bySlot[s] || []
    bySlot[s].push(m)
  })

  const pairsById: Record<string, {players:[string,string]}> = Object.fromEntries(
    (['A','B','C','D'] as const).flatMap(g => t.groups[g].map(p => [p.id, { players: p.players }]))
  )
  const name = (id: string) => pairsById[id]?.players.join(' / ') ?? id

  return (
    <div className="container">
      <h1 className="mb-2">{t.name}</h1>
      <p className="text-sm text-white/60 mb-4">
        {t.date} • Durata {t.matchDurationMin}’ + pausa {t.breakMin}’ • {t.courts} campi
      </p>

      {Object.entries(bySlot).map(([slot, ms]) => (
        <div key={slot} className="card mb-3">
          <h2>Slot {Number(slot)+1} • {displaySlots[Number(slot)]}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mt-2">
            {ms.sort((a,b)=>(a.court??0)-(b.court??0)).map(m => (
              <div key={m.id} className={`badge ${m.phase==='GOLD' ? 'pill-gold' : (m.phase==='SILVER' ? 'pill-silver' : 'pill-live')}`}>
                Campo {m.court} • {name(m.pairA)} vs {name(m.pairB)} • {m.gamesA}-{m.gamesB}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
