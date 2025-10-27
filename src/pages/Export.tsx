import React from 'react'
import { useTournament } from '../store/useTournament'

export default function ExportPage() {
  const { state } = useTournament()
  const download = () => {
    const blob = new Blob([JSON.stringify(state,null,2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tournament-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div className="container">
      <h1 className="mb-4">Esporta / Importa</h1>
      <div className="card flex items-center gap-3">
        <button className="btn btn-primary" onClick={download}>Esporta JSON</button>
        <p className="text-sm text-white/60">Scarica lo stato completo (config, match, punteggi).</p>
      </div>
    </div>
  )
}
