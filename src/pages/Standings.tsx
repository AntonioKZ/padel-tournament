import React from 'react'
import { useTournament } from '../store/useTournament'
import StandingsTable from '../components/StandingsTable'
import type { GroupId } from '../data/types'

export default function StandingsPage() {
  const { state, dispatch } = useTournament()
  const { tournament: t, matches } = state
  const groups: GroupId[] = ['A','B','C','D']

  // 🎲 Simulazione fase a gironi: un solo dispatch atomico
  const simulateGroups = React.useCallback(() => {
    const groupMatches = matches.filter(m => m.phase === 'GROUP' && m.group)
    const items = groupMatches.map(m => {
      const max = 6
      let a = Math.floor(Math.random() * (max + 1))
      let b = Math.floor(Math.random() * (max + 1))
      if (a === b) b = (b + 1) % (max + 1) // evita pareggi
      return { id: m.id, gamesA: a, gamesB: b }
    })
    dispatch({ type: 'BULK_SET_RESULTS', items } as any)
  }, [matches, dispatch])

  return (
    <div className="container">      <div className="mb-4 flex items-center gap-3">
        <button className="btn btn-primary" onClick={simulateGroups}>
          🎲 Simula fase a gironi
        </button>
        <span className="text-sm opacity-70">
          Imposta punteggi casuali, aggiorna classifiche e sblocca Gold/Silver
        </span>
      </div>

      <h1 className="mb-4">Classifiche Gironi</h1>
      <div className="grid grid-cols-1 gap-4">
        {groups.map(gid => (
          <StandingsTable
            key={gid}
            groupId={gid}
            pairs={t.groups[gid]}
            matches={matches.filter(m => m.group === gid)}
          />
        ))}
      </div>
    </div>
  )
}
