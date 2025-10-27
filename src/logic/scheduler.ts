import type { Match, GroupId } from '../data/types'

export function scheduleGroupRounds(roundsByGroup: Record<GroupId, Match[][]>): Match[] {
  const slots: Match[][] = [ [], [], [] ]
  ;(['A','B','C','D'] as GroupId[]).forEach(g => {
    roundsByGroup[g].forEach((round, idx) => { slots[idx].push(...round) })
  })
  const scheduled: Match[] = []
  slots.forEach((slotMatches, slotIndex) => {
    slotMatches.forEach((m, i) => {
      scheduled.push({ ...m, slotIndex, court: (i % 8) + 1 })
    })
  })
  return scheduled
}
