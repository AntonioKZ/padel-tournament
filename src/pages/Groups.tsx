import React from 'react'
import { useTournament } from '../store/useTournament'
import GroupEditor from '../components/GroupEditor'
import type { GroupId } from '../data/types'

export default function Groups() {
  const { state } = useTournament()
  const { tournament: t } = state
  const groups: GroupId[] = ['A','B','C','D']

  return (
    <div className="container">      <h1 className="mb-4">Gironi — Modifica nomi coppie</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {groups.map(gid => (
          <GroupEditor key={gid} groupId={gid} pairs={t.groups[gid]} />
        ))}
      </div>
    </div>
  )
}
