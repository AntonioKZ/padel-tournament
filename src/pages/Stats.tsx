
import React from 'react'
import { useTournament } from '../store/useTournament'

export default function Stats() {
  const { state } = useTournament()
  const { tournament: t, matches } = state

  // Basic aggregates
  const finished = matches.filter(m => ((m.gamesA ?? 0) + (m.gamesB ?? 0)) > 0)
  const totalGames = finished.reduce((acc, m) => acc + (m.gamesA ?? 0) + (m.gamesB ?? 0), 0)
  const avgGamesPerMatch = finished.length ? (totalGames / finished.length) : 0
  const remaining = matches.length - finished.length

  type Agg = Record<string, { GF:number, GS:number, W:number, L:number }>
  const agg: Agg = {}

  // Init per pair
  ;(['A','B','C','D'] as const).forEach(g => {
    const ids = t.groups[g].map(p => p.id)
    ids.forEach(id => { agg[id] = agg[id] || { GF:0, GS:0, W:0, L:0 } })
  })

  // Compute GF/GS/W/L
  finished.forEach(m => {
    agg[m.pairA].GF += (m.gamesA ?? 0)
    agg[m.pairA].GS += (m.gamesB ?? 0)
    agg[m.pairB].GF += (m.gamesB ?? 0)
    agg[m.pairB].GS += (m.gamesA ?? 0)
    if ((m.gamesA ?? 0) > (m.gamesB ?? 0)) { agg[m.pairA].W++; agg[m.pairB].L++; }
    else if ((m.gamesB ?? 0) > (m.gamesA ?? 0)) { agg[m.pairB].W++; agg[m.pairA].L++; }
  })

  const entries = Object.entries(agg)

  const bestAttack = entries.length ? entries.reduce((a,b)=> (b[1].GF > a[1].GF ? b : a)) : null
  const bestDefense = entries.length ? entries.reduce((a,b)=> ((b[1].GS < a[1].GS) ? b : a)) : null
  const unbeaten = entries.filter(([_,v]) => v.L === 0 && (v.W+v.L)>0)
  const struggling = entries.filter(([_,v]) => v.W === 0 && (v.W+v.L)>0)

  const nameOf = (id: string) => {
    const all = [...t.groups.A, ...t.groups.B, ...t.groups.C, ...t.groups.D]
    const p = all.find(p => p.id === id)
    return p ? p.players.join(' / ') : id
  }

  const fmt = (x:number) => (Math.round(x*10)/10).toFixed(1)

  return (
    <div className="container">
      <h1 className="mb-4">Statistiche</h1>

      {/* KPI */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">Partecipanti</div>
          <div className="text-3xl font-bold">{Object.values(t.groups).flat().length}</div>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">Incontri disputati</div>
          <div className="text-3xl font-bold">{finished.length}</div>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">Campi utilizzati</div>
          <div className="text-3xl font-bold">{t.courts}</div>
        </div></div>
      </div>

      {/* Spaziatura verticale richiesta */}
      <div className="mt-10"></div>

      {/* Panoramica + altri indicatori */}
      <div className="card"><div className="card-body">
        <div className="text-sm opacity-70">Panoramica</div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-sm opacity-70">Game totali</div>
            <div className="text-2xl font-semibold">{totalGames}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Media Game/Partita</div>
            <div className="text-2xl font-semibold">{fmt(avgGamesPerMatch)}</div>
          </div>
          <div>
            <div className="text-sm opacity-70">Partite Rimanenti</div>
            <div className="text-2xl font-semibold">{remaining}</div>
          </div>
        </div>
      </div></div>

      {/* Spaziatura */}
      <div className="mt-10"></div>

      {/* Miglior attacco / miglior difesa */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">Squadra Migliore Attacco</div>
          {bestAttack ? (
            <div>
              <div className="text-xl font-semibold">{nameOf(bestAttack[0])}</div>
              <div>{bestAttack[1].GF} game vinti in {bestAttack[1].W+bestAttack[1].L} partite</div>
              <div className="text-sm opacity-70">Media: {fmt((bestAttack[1].W+bestAttack[1].L) ? bestAttack[1].GF/(bestAttack[1].W+bestAttack[1].L) : 0)} game/partita</div>
            </div>
          ) : <div>N/D</div>}
        </div></div>

        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">Squadra Miglior Difesa</div>
          {bestDefense ? (
            <div>
              <div className="text-xl font-semibold">{nameOf(bestDefense[0])}</div>
              <div>{bestDefense[1].GS} game subiti in {bestDefense[1].W+bestDefense[1].L} partite</div>
              <div className="text-sm opacity-70">Media: {fmt((bestDefense[1].W+bestDefense[1].L) ? bestDefense[1].GS/(bestDefense[1].W+bestDefense[1].L) : 0)} game/partita</div>
            </div>
          ) : <div>N/D</div>}
        </div></div>
      </div>

      {/* Spaziatura */}
      <div className="mt-10"></div>

      {/* Liste extra */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">✨ Squadre Imbattute</div>
          <ul className="list-disc ml-6">
            {unbeaten.length ? unbeaten.map(([id,v]) => (
              <li key={'ub'+id}><strong>{nameOf(id)}</strong> {v.W}V - {v.L}P</li>
            )) : <li>Nessuna</li>}
          </ul>
        </div></div>

        <div className="card"><div className="card-body">
          <div className="text-sm opacity-70">⚠️ Squadre In Difficoltà</div>
          <ul className="list-disc ml-6">
            {struggling.length ? struggling.map(([id,v]) => (
              <li key={'sd'+id}><strong>{nameOf(id)}</strong> {v.W}V - {v.L}P</li>
            )) : <li>Nessuna</li>}
          </ul>
        </div></div>
      </div>
    </div>
  )
}
