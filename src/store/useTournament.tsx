
import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { Tournament, Match, GroupId } from '../data/types'
import { seed } from '../data/seed'
import { generateRoundRobinFor4Teams } from '../logic/roundRobin'
import { scheduleGroupRounds } from '../logic/scheduler'
import { buildSlotsWithBreaks } from '../logic/time'

type State = {
  tournament: Tournament
  matches: Match[]
  currentSlot: number
  displaySlots: string[]
}

type Action =
  | { type: 'INIT_FROM_SEED' }
  | { type: 'SET_SLOT'; slot: number }
  | { type: 'SET_MATCH_RESULT'; id: string; gamesA: number; gamesB: number }
  | { type: 'CONFIRM_MATCH'; id: string }
  | { type: 'BULK_SET_RESULTS'; items: { id: string; gamesA: number; gamesB: number }[] }
  | { type: 'SET_LIVE_FOR_SLOT'; slot: number }
  | { type: 'UPDATE_PAIR_PLAYERS'; pairId: string; players: [string,string] }

function reducer(state: State, action: Action): State {
  switch(action.type) {
    case 'INIT_FROM_SEED': {
      // Normalize players order: male first, female second (heuristic, best-effort)
      const femaleNames = new Set([
        'Angela','Silvia','Tiziana','Emilia','Francesca','Lisa','Anna','Carmela','Sonia','Maria','Lidia','Gresi','Emma','Marina','Tiziana'
      ])
      const isFemaleName = (full: string) => {
        if (!full) return false
        const first = (full.split(' ')[0] || '').replace(/[^A-Za-zÀ-ÖØ-öø-ÿ’']/g,'')
        if (femaleNames.has(first)) return true
        const ch = first.slice(-1).toLowerCase()
        return ch === 'a' || ch === 'e'
      }
      const t0: Tournament = JSON.parse(JSON.stringify(seed))
      ;(['A','B','C','D'] as const).forEach(g => {
        t0.groups[g] = t0.groups[g].map(p => {
          const [p1,p2] = p.players
          const femaleFirst = isFemaleName(p1) && !isFemaleName(p2)
          const maleSecond = !isFemaleName(p1) && isFemaleName(p2)
          if (femaleFirst && maleSecond) {
            return { ...p, players: [p2, p1] }
          }
          return p
        })
      })
      const roundsByGroup = {
        A: generateRoundRobinFor4Teams('A', t0.groups.A).rounds,
        B: generateRoundRobinFor4Teams('B', t0.groups.B).rounds,
        C: generateRoundRobinFor4Teams('C', t0.groups.C).rounds,
        D: generateRoundRobinFor4Teams('D', t0.groups.D).rounds,
      } as any
      const scheduled = scheduleGroupRounds(roundsByGroup)
      const count = Math.max(...scheduled.map(m => (m.slotIndex ?? 0))) + 1
      const displaySlots = buildSlotsWithBreaks(t0.timeWindow[0], count, t0.matchDurationMin, t0.breakMin)
      return { tournament: t0, matches: scheduled, currentSlot: 0, displaySlots }
    }
    case 'SET_SLOT':
      return { ...state, currentSlot: action.slot }
    case 'SET_MATCH_RESULT':
      return { ...state, matches: state.matches.map(m => m.id===action.id ? { ...m, gamesA: action.gamesA, gamesB: action.gamesB } : m) }
    case 'CONFIRM_MATCH':
      return { ...state, matches: state.matches.map(m => m.id===action.id ? { ...m, status: 'finished' } : m) }
    case 'BULK_SET_RESULTS':
      return { ...state, matches: state.matches.map(m => {
        const it = action.items.find(x => x.id === m.id)
        return it ? { ...m, gamesA: it.gamesA, gamesB: it.gamesB } : m
      }) }
    case 'SET_LIVE_FOR_SLOT':
      return { ...state, matches: state.matches.map(m => (m.slotIndex ?? 0) === action.slot ? { ...m, status: 'live' } : m) }
    case 'UPDATE_PAIR_PLAYERS': {
      const t = { ...state.tournament, groups: { ...state.tournament.groups } }
      ;(['A','B','C','D'] as GroupId[]).forEach((g) => {
        t.groups[g] = t.groups[g].map(p => p.id === action.pairId ? { ...p, players: action.players } : p)
      })
      return { ...state, tournament: t }
    }
    default:
      return state
  }
}

const TournamentContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function TournamentProvider({ children }:{ children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    tournament: seed,
    matches: [],
    currentSlot: 0,
    displaySlots: [],
  })
  useEffect(() => {
    dispatch({ type: 'INIT_FROM_SEED' })
  }, [])
  return (
    <TournamentContext.Provider value={{ state, dispatch }}>{children}</TournamentContext.Provider>
  )
}

export function useTournament() {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider')
  return ctx
}
