import type { GroupId, Standing, Match } from '../data/types'

export type SeedMap = {
  GOLD: [string,string][],
  SILVER: [string,string][]
}

export function deriveSeedsByRule(standings: Record<GroupId, Standing[]>): SeedMap {
  const g = standings
  const pick = (gid: GroupId, rank: number) => {
    const f = g[gid].find(s => s.rank === rank)
    if (!f) throw new Error(`Missing standing ${gid}${rank}`)
    return f.pairId
  }

  const GOLD: [string,string][] = [
    [ pick('A',1), pick('D',2) ],
    [ pick('B',1), pick('C',2) ],
    [ pick('C',1), pick('B',2) ],
    [ pick('D',1), pick('A',2) ],
  ]
  const SILVER: [string,string][] = [
    [ pick('A',3), pick('D',4) ],
    [ pick('B',3), pick('C',4) ],
    [ pick('C',3), pick('B',4) ],
    [ pick('D',3), pick('A',4) ],
  ]
  return { GOLD, SILVER }
}

export function buildQuarters(seeds: [string,string][], phase: 'GOLD'|'SILVER', slotIndex: number): Match[] {
  return seeds.map((p, i) => ({
    id: `${phase}-Q${i+1}`,
    phase,
    pairA: p[0],
    pairB: p[1],
    gamesA: 0,
    gamesB: 0,
    status: 'scheduled',
    slotIndex,
  }))
}

export function buildSemis(phase: 'GOLD'|'SILVER', slotIndex: number): Match[] {
  return [1,2].map(i => ({
    id: `${phase}-S${i}`,
    phase,
    pairA: `${phase}-WQ${(i-1)*2+1}`,
    pairB: `${phase}-WQ${(i-1)*2+2}`,
    labelA: `Winner Q${(i-1)*2+1}`,
    labelB: `Winner Q${(i-1)*2+2}`,
    gamesA: 0, gamesB: 0, status: 'scheduled', slotIndex
  }))
}

export function buildFinals(phase: 'GOLD'|'SILVER', slotIndex: number): Match[] {
  return [
    { id: `${phase}-F`, phase, pairA: `${phase}-WS1`, pairB: `${phase}-WS2`, labelA: 'Winner S1', labelB: 'Winner S2', gamesA:0, gamesB:0, status:'scheduled', slotIndex },
    { id: `${phase}-P3`, phase, pairA: `${phase}-LS1`, pairB: `${phase}-LS2`, labelA: 'Loser S1', labelB: 'Loser S2', gamesA:0, gamesB:0, status:'scheduled', slotIndex },
  ]
}
