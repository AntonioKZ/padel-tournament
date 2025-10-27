import React from 'react'
import { useTournament } from '../store/useTournament'

export default function Setup() {
  const { state } = useTournament()
  const { tournament: t } = state
  return (
    <div className="container">
      <h1 className="mb-4">Setup Torneo</h1>
      <div className="card">
        <p><b>{t.name}</b> • {t.date} • {t.timeWindow[0]}–{t.timeWindow[1]} • {t.courts} campi</p>
        <p className="mt-2 text-sm text-white/60">Numeri mancanti: {t.missingPhones.join(', ')}</p>
      </div>
    </div>
  )
}
