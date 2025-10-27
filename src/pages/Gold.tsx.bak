import React from 'react'
import AppHeader from '../components/AppHeader'
import Bracket from '../components/Bracket'
import { useTournament } from '../store/useTournament'
import type { GroupId, Match } from '../data/types'

function computeStandings(pairIds: string[], matches: Match[]) {
  const map: Record<string, {GF:number;GS:number;diff:number}> = {}
  pairIds.forEach(id=>map[id]={GF:0,GS:0,diff:0})
  matches.forEach(m=>{
    map[m.pairA].GF += m.gamesA; map[m.pairA].GS += m.gamesB
    map[m.pairB].GF += m.gamesB; map[m.pairB].GS += m.gamesA
  })
  return Object.entries(map).map(([pairId,{GF,GS}])=>({pairId,GF,GS,diff:GF-GS})).sort((a,b)=> b.diff-a.diff || b.GF-a.GF)
}

export default function GoldPage() {
  const { state } = useTournament()
  const { tournament: t, matches } = state
  const groups: GroupId[] = ['A','B','C','D']

  const selection: Record<string,string> = {}
  groups.forEach(g => {
    const ms = matches.filter(x => x.group===g)
    const st = computeStandings(t.groups[g].map(p=>p.id), ms)
    selection[`${g}1`] = st[0]?.pairId
    selection[`${g}2`] = st[1]?.pairId
  })

  return <Bracket title="Torneo GOLD" koKey="GOLD" selection={selection} />
}
