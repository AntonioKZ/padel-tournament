import React from 'react'
import { useTournament } from '../store/useTournament'

export default function Schedule() {
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

  const printMode = (mode: 'slots' | 'courts') => {
    const html = document.documentElement
    const cls = mode === 'slots' ? 'print-switch-slots' : 'print-switch-courts'
    const other = mode === 'slots' ? 'print-switch-courts' : 'print-switch-slots'
    html.classList.add(cls); html.classList.remove(other)
    setTimeout(()=>{ window.print(); setTimeout(()=>html.classList.remove(cls), 50) }, 10)
  }

  return (
    <div className="container">      <div className="flex items-center justify-between mb-4 screen-only">
        <h1 className="text-3xl md:text-4xl">Programmazione</h1>
        <div className="flex gap-2">
          <button className="btn" onClick={()=>printMode('slots')}>Stampa Programmazione (1 pagina per slot)</button>
          <button className="btn btn-primary" onClick={()=>printMode('courts')}>Stampa 8 pagine (per campo)</button>
        </div>
      </div>

      {/* Schermata normale per consultazione */}
      {Object.entries(bySlot).map(([slot, ms]) => (
        <div key={slot} className="card mb-6 screen-only">
          <h2>Slot {Number(slot)+1} • {displaySlots[Number(slot)]}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {ms.sort((a,b)=>(a.court??0)-(b.court??0)).map(m => (
              <div key={m.id} className="rounded-2xl p-4 bg-white/10 border border-white/10">
                <div className="text-xs opacity-70 mb-1">Campo</div>
                <div className="text-3xl font-extrabold mb-3">{m.court}</div>
                <div className="text-base md:text-lg">{name(m.pairA)}</div>
                <div className="text-sm opacity-60 mb-1">vs</div>
                <div className="text-base md:text-lg">{name(m.pairB)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* PRINT: 1 page per slot */}
      <div className="print-slots">
        {Object.entries(bySlot).map(([slot, ms]) => (
          <div key={slot} className="page-break">
            <div className="print-h1">Programmazione • Slot {Number(slot)+1} — {displaySlots[Number(slot)]}</div>
            {ms.sort((a,b)=>(a.court??0)-(b.court??0)).map(m => (
              <div key={m.id} className="print-card">
                <div className="print-row">
                  <div className="print-time">Campo {m.court}</div>
                  <div className="print-match">{name(m.pairA)} vs {name(m.pairB)}</div>
                  <div></div><div></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* PRINT: 8 pages per court with GV/GP boxes */}
      <div className="print-courts">
        {Array.from({length: t.courts}).map((_, idx) => {
          const court = idx+1
          const ms = matches.filter(m => (m.court??0)===court).sort((a,b)=>(a.slotIndex??0)-(b.slotIndex??0))
          return (
            <div key={court} className="page-break">
              <div className="print-h1">Campo {court}</div>
              {ms.map(m => (
                <div key={m.id} className="print-card">
                  <div className="print-h2">{displaySlots[m.slotIndex??0]}</div>
                  <div className="print-row">
                    <div className="print-time">Slot {(m.slotIndex??0)+1}</div>
                    <div className="print-match">{name(m.pairA)} vs {name(m.pairB)}</div>
                    <div className="print-box">GV</div>
                    <div className="print-box">GP</div>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
