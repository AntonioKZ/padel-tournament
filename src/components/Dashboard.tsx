import React from 'react'
import type { Match, Pair, Tournament } from '../data/types'
import MatchCard from './MatchCard'

export default function Dashboard({ tournament, pairsById, matches, seconds, onUpdate, onConfirm }:
  { tournament: Tournament, pairsById: Record<string, Pair>, matches: Match[], seconds: number, onUpdate: (m: Match)=>void, onConfirm: (id: string)=>void }) {
  const pairs = Object.values(pairsById)
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {matches.map(m => (
        <MatchCard key={m.id} match={m} pairs={pairs} seconds={seconds} onUpdate={onUpdate} onConfirm={onConfirm} />
      ))}
    </div>
  )
}
