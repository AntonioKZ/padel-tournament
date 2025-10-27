import type { Match, Tournament } from '../data/types'

export function buildWhatsAppMessage(t: Tournament, matches: Match[]): string {
  const header = `Torneo ${t.name}\n${t.date} • ${t.timeWindow[0]}–${t.timeWindow[1]}\nCampi: ${t.courts}\nDurata match: ${t.matchDurationMin} min`
  const bySlot: Record<number, Match[]> = {}
  matches.forEach(m => {
    const s = m.slotIndex ?? 0
    bySlot[s] = bySlot[s] || []
    bySlot[s].push(m)
  })
  const lines: string[] = [header, '']
  Object.entries(bySlot).sort(([a],[b])=>Number(a)-Number(b)).forEach(([slot, ms]) => {
    lines.push(`Slot ${Number(slot)+1} (${t.slots[Number(slot)]})`)
    ms.sort((a,b)=>(a.court??0)-(b.court??0)).forEach(m => {
      lines.push(`Campo ${m.court}: ${m.pairA} vs ${m.pairB}`)
    })
    lines.push('')
  })
  return lines.join('\n')
}

export function buildWhatsAppLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function buildWhatsAppStandings(t: Tournament, standingsByGroup: Record<string, any>, pairsById: Record<string, {players: [string,string]}>): string {
  const lines: string[] = []
  lines.push(`Classifiche Gironi • ${t.name} (${t.date})`)
  ;(['A','B','C','D'] as const).forEach(g => {
    lines.push(`\nGirone ${g}:`)
    const arr = standingsByGroup[g] || []
    arr.forEach((s: any, idx: number) => {
      const p = pairsById[s.pairId]
      const name = p ? p.players.join(' / ') : s.pairId
      lines.push(`${idx+1}. ${name} — GF ${s.GF} • GS ${s.GS} • Diff ${s.diff}`)
    })
  })
  return lines.join('\n')
}

export function buildWhatsAppFinalResults(t: Tournament, matches: Match[], pairsById: Record<string, {players: [string,string]}>): string {
  const fGold = matches.find(m => m.id==='GOLD-F')
  const fSilver = matches.find(m => m.id==='SILVER-F')
  const toName = (id?: string) => id && pairsById[id] ? pairsById[id].players.join(' / ') : (id ?? '—')
  const lines: string[] = []
  lines.push(`Risultati Finali • ${t.name} (${t.date})`)
  if (fGold) lines.push(`\nGOLD: ${toName(fGold.pairA)} ${fGold.gamesA}-${fGold.gamesB} ${toName(fGold.pairB)}`)
  if (fSilver) lines.push(`SILVER: ${toName(fSilver.pairA)} ${fSilver.gamesA}-${fSilver.gamesB} ${toName(fSilver.pairB)}`)
  return lines.join('\n')
}
