import React from 'react'
import type { Tournament, Match } from '../data/types'

export default function WhatsAppShare({ tournament, matches }:{ tournament: Tournament, matches: Match[] }) {
  const bySlot: Record<number, Match[]> = {}
  matches.forEach(m => {
    const s = m.slotIndex ?? 0
    bySlot[s] = bySlot[s] || []
    bySlot[s].push(m)
  })
  const nameOf = (id: string) => {
    const p = (['A','B','C','D'] as const).flatMap(g => tournament.groups[g]).find(pp => pp.id===id)
    return p ? p.players.join(' / ') : id
  }
  const lines: string[] = [
    `Torneo ${tournament.name}`,
    `${tournament.date} • ${tournament.timeWindow[0]}–${tournament.timeWindow[1]}`,
    `Campi: ${tournament.courts} • Durata match: ${tournament.matchDurationMin} min (+${tournament.breakMin}’ pausa)`,
    ``
  ]
  Object.entries(bySlot).forEach(([slot, ms]) => {
    lines.push(`Slot ${Number(slot)+1}`)
    ms.sort((a,b)=>(a.court??0)-(b.court??0)).forEach(m => {
      lines.push(`Campo ${m.court}: ${nameOf(m.pairA)} vs ${nameOf(m.pairB)}`)
    })
    lines.push('')
  })
  const text = encodeURIComponent(lines.join('\n'))
  const link = `https://wa.me/?text=${text}`
  return <a className="btn btn-primary" href={link} target="_blank" rel="noreferrer">Condividi su WhatsApp</a>
}
