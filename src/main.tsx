import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { TournamentProvider } from './store/useTournament'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TournamentProvider>
      <App />
    </TournamentProvider>
  </React.StrictMode>
)
