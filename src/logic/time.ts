export function addMinutes(hhmm: string, delta: number): string {
  const [hh, mm] = hhmm.split(':').map(Number)
  const d = new Date(2000,0,1,hh,mm,0)
  d.setMinutes(d.getMinutes() + delta)
  const h = String(d.getHours()).padStart(2,'0')
  const m = String(d.getMinutes()).padStart(2,'0')
  return `${h}:${m}`
}
export function buildSlotsWithBreaks(start: string, count: number, matchMin: number, breakMin: number): string[] {
  const out: string[] = []
  let cur = start
  for (let i=0;i<count;i++) {
    const end = addMinutes(cur, matchMin)
    out.push(`${cur}-${end}`)
    cur = addMinutes(end, breakMin)
  }
  return out
}
