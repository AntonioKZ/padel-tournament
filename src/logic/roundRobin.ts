import type { Pair, Match, GroupId } from '../data/types'

export function generateRoundRobinFor4Teams(groupId: GroupId, pairs: Pair[]): { rounds: Match[][] } {
  if (pairs.length !== 4) throw new Error('Group must have exactly 4 pairs')
  const [p1,p2,p3,p4] = pairs.map(p => p.id)
  const rounds: [ [string,string], [string,string] ][] = [
    [ [p1,p2], [p3,p4] ],
    [ [p1,p3], [p2,p4] ],
    [ [p1,p4], [p2,p3] ],
  ]
  const matchesByRound: Match[][] = rounds.map((r, ri) => r.map((pair, i) => ({
    id: `${groupId}-G-R${ri+1}-${i+1}`,
    phase: 'GROUP',
    group: groupId,
    pairA: pair[0],
    pairB: pair[1],
    gamesA: 0,
    gamesB: 0,
    status: 'scheduled'
  })))
  return { rounds: matchesByRound }
}
