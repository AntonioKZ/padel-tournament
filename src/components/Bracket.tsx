import React from 'react'
import type { Pair } from '../data/types'
import { useTournament } from '../store/useTournament'

// --- KO debug (global, hoisted) --------------------------------------------
declare global {
  interface Window {
    __koDebug?: { logs: Array<{ t: string; payload?: any; ts: string; koKey: string }> }
  }
}
function koPushLog(koKey: string, t: string, payload?: any) {
  try {
    const w = window as any as Window
    if (!w.__koDebug) w.__koDebug = { logs: [] }
    w.__koDebug.logs.push({ t, payload, ts: new Date().toISOString(), koKey })
    console.koDebug(koKey,`[KO:${koKey}] ${t}`, payload ?? '')
  } catch {}
}
function koDebug(koKey: string, msg: string, extra?: any) {
  try { console.koDebug(koKey,`[KO:${koKey}] ${msg}`, extra ?? '') } catch {}
}
// ---------------------------------------------------------------------------


type KOKey = 'GOLD'|'SILVER'
type KOSeed = Record<string,string|undefined>

function nameOf(pairsById: Record<string, Pair>, id?: string) {
  if (!id) return '—'
  const p = pairsById[id]
  return p ? p.players.join(' / ') : id
}

function WinnerName({aName, bName, a, b}:{aName:string, bName:string, a?:number, b?:number}){
  const A = a ?? -1, B = b ?? -1;
  const aWin = A>B; const bWin = B>A;
  return (<>
    {aWin ? <strong className="winner">🏆 {aName}</strong> : <span>{aName}</span>}
    <span className="score mx-1"> {a??'—'}-{b??'—'} </span>
    {bWin ? <strong className="winner">🏆 {bName}</strong> : <span>{bName}</span>}
  </>)}

function addMinutes(hhmm: string, minutes: number) {
  const [h,m] = hhmm.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m+minutes, 0, 0)
  const H = String(d.getHours()).padStart(2,'0')
  const M = String(d.getMinutes()).padStart(2,'0')
  return `${H}:${M}`
}

export default function Bracket({ title, koKey, selection }:{ title: string, koKey: KOKey, selection: KOSeed }) {
  const { state } = useTournament()
  const { tournament: t } = state

  const pairsById: Record<string, Pair> = Object.fromEntries(
    (['A','B','C','D'] as const).flatMap(g => t.groups[g].map(p => [p.id, p]))
  )

  const courtsQF = koKey === 'SILVER' ? [1,2,3,4] : [5,6,7,8]
  const courtsSF = koKey === 'SILVER' ? [1,2]     : [5,6]
  const courtF   = koKey === 'SILVER' ? 1         : 5

  const start = '20:00'
  const qfStart = start
  const sfStart = addMinutes(start, t.matchDurationMin + 5)
  const fStart  = addMinutes(sfStart, t.matchDurationMin + 5)

  const QF: [string,string|undefined,string|undefined][] = [
    ['QF1', selection['A1'], selection['D2']],
    ['QF2', selection['B1'], selection['C2']],
    ['QF3', selection['C1'], selection['B2']],
    ['QF4', selection['D1'], selection['A2']],
  ]

  type Score = { a?: number; b?: number }
  const [qf, setQf] = React.useState<Record<string,Score>>({})
  const [sf, setSf] = React.useState<Record<string,Score>>({})
  const [fin, setFin] = React.useState<Score>({})
  /* hydrate from window to persist across tabs */
  React.useEffect(()=>{
const store = (window as any)[koKey === 'GOLD' ? '__goldData' : '__silverData']
    if (store){ if(store.qf) setQf(store.qf); if(store.sf) setSf(store.sf); if(store.fin) setFin(store.fin) }
    try {
      const raw = localStorage.getItem('padel-ko-' + koKey)
      if (raw) {
        const obj = JSON.parse(raw)
        if (obj.qf) setQf(obj.qf)
        if (obj.sf) setSf(obj.sf)
        if (obj.fin) setFin(obj.fin)
      }
    } catch {}
  }, [])

  const qfWinners: (string|undefined)[] = QF.map((q, idx) => {
    const s = qf[`QF${idx+1}`]
    if (!s || s.a===undefined || s.b===undefined) return undefined
    return (s.a > s.b) ? q[1] : q[2]
  }, [])

  const SF: [string,string|undefined,string|undefined][] = [
    ['SF1', qfWinners[0], qfWinners[1]],
    ['SF2', qfWinners[2], qfWinners[3]],
  ]

  const sfWinners: (string|undefined)[] = SF.map((sff, idx) => {
    const sres = sf[`SF${idx+1}`]
    if (!sres || sres.a===undefined || sres.b===undefined) return undefined
    return (sres.a > sres.b) ? sff[1] : sff[2]
  })

  const F: [string,string|undefined,string|undefined] = ['F', sfWinners[0], sfWinners[1]]
  const finalWinner = (fin['F']?.a !== undefined && fin['F']?.b !== undefined)
    ? ((fin['F']!.a! > fin['F']!.b!) ? F[1] : F[2])
    : undefined

  const onScore = (setFn: any, key: string, side: 'a'|'b', val: number|string) => {
    let num = Number(val)
    setFn((prev: Record<string,any>) => {
      const otherSide = side === 'a' ? 'b' : 'a'
      const other = prev[key]?.[otherSide]
      if (!isNaN(num) && other !== undefined && num === other) {
        // nudge to avoid tie
        num = (num < 6) ? num + 1 : Math.max(0, num - 1)
      }
      return { ...prev, [key]: { ...prev[key], [side]: isNaN(num)? undefined : num } }
    })
  }

  React.useEffect(()=>{
    (window as any).__tournamentMatches = state.matches
    ;(window as any).__tournamentInfo = state.tournament
    ;(window as any).__pairs = (['A','B','C','D'] as const).flatMap(g => state.tournament.groups[g])
    ;(window as any).__pairsByGroup = { A: state.tournament.groups.A, B: state.tournament.groups.B, C: state.tournament.groups.C, D: state.tournament.groups.D }
  }, [state.matches, state.tournament])

  React.useEffect(()=>{
    const finalScore = (fin['F'] && fin['F'].a!==undefined && fin['F'].b!==undefined) ? `${fin['F'].a}–${fin['F'].b}` : '';
    const rounds = [
      { round: 'Quarti', matches: QF.map((q,idx)=>({ a:q[1], b:q[2], sa:qf[`QF${idx+1}`]?.a??'', sb:qf[`QF${idx+1}`]?.b??'' })) },
      { round: 'Semifinali', matches: SF.map((s,idx)=>({ a:s[1], b:s[2], sa:sf[`SF${idx+1}`]?.a??'', sb:sf[`SF${idx+1}`]?.b??'' })) },
      { round: 'Finale', matches: [{ a:F[1], b:F[2], sa:fin['F']?.a??'', sb:fin['F']?.b??'' }] }
    ];
    const data = { QF, SF, F, qf, sf, fin, finalWinner, finalScore, rounds, courtsQF, courtsSF, courtF, qfStart, sfStart, fStart }
    if (koKey === 'GOLD') { (window as any).__goldDone = !!finalWinner; (window as any).__goldData = data; (window as any).__goldRounds = rounds; koPushLog(koKey,'expose', { which:'gold', data }) }
else { (window as any).__silverDone = !!finalWinner; (window as any).__silverData = data; (window as any).__silverRounds = rounds; koPushLog(koKey,'expose', { which:'silver', data }) }
  }, [qf, sf, fin, finalWinner, koKey])

  React.useEffect(()=>{
    try {
      const finalScore = (fin['F'] && fin['F'].a!==undefined && fin['F'].b!==undefined) ? `${fin['F'].a}–${fin['F'].b}` : '';
    const toSave = { qf, sf, fin, rounds, finalScore };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave)); koDebug(koKey,'Saved to storage', toSave); koPushLog(koKey,'save', toSave)
    } catch {}
  }, [qf, sf, fin, koKey])

  const simulateAll = React.useCallback(() => {
    const sim = (setFn: any, keys: string[]) => {
      keys.forEach(k => {
        let a = Math.floor(Math.random() * 7)
        let b = Math.floor(Math.random() * 7)
        if (a === b) { if (a < 6) a += 1; else b = Math.max(0, b - 1) }
        setFn((prev: any) => ({ ...prev, [k]: { a, b } }))
      })
    }
    sim(setQf, ['QF1','QF2','QF3','QF4'])
    setTimeout(() => sim(setSf, ['SF1','SF2']), 0)
    setTimeout(() => { let a=Math.floor(Math.random()*7), b=Math.floor(Math.random()*7); if(a===b){ if(a<6)a+=1; else b=Math.max(0,b-1)}; setFin((prev:any)=>({...prev, F:{a,b}})) }, 0)
    // Best-effort immediate persist
    setTimeout(() => {
      try { localStorage.setItem('padel-ko-' + koKey, JSON.stringify({ qf: (qf as any), sf: (sf as any), fin })) } catch {}
    }, 10)
  }, [koKey, qf, sf, fin])

  return (
    <div className="container">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="mb-0">{title}</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={simulateAll}>🎲 Simula torneo (QF→SF→F)</button>
          <button className="btn" onClick={()=>{ setQf({}); setSf({}); setFin({}); try{ localStorage.removeItem('padel-ko-' + koKey) }catch{} }}>🗑️ Annulla simulazioni</button>
        </div>
      </div>

      {/* Quarti */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-center">Quarti • {qfStart}</h2>
          <div className="text-sm opacity-70 text-center">Campi: {courtsQF.join(', ')}</div>
        </div>
        <div className="grid mb-10 md:grid-cols-2 gap-4">
          {QF.map((q, i) => (
            <div key={q[0]} className="card p-5 text-base">
              <div className="text-sm opacity-70 mb-1">{q[0]} • Campo {courtsQF[i]}</div>
              <div className="font-medium text-lg">{nameOf(pairsById, q[1])}</div>
              <div className="font-medium text-lg mb-3">{nameOf(pairsById, q[2])}</div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF A" value={qf[q[0]]?.a ?? ""} onChange={e=>onScore(setQf, q[0], 'a', e.target.value)} />
                <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF B" value={qf[q[0]]?.b ?? ""} onChange={e=>onScore(setQf, q[0], 'b', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        
<div className="divider" />
<div className="mt-8 text-base font-semibold">Risultati Partite — Quarti</div>
<table className="table-auto w-full mt-2 mb-8 border border-white/10 rounded-lg overflow-hidden">
  <thead className="text-white/70">
    <tr>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 1</th>
      <th className="py-2 text-center border-b border-white/10 bg-white/5">Risultato</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 2</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Info</th>
    </tr>
  </thead>
  <tbody>
    {QF.map((q,i)=>{
      const s = qf['QF'+(i+1)] || {}
      const a = s?.a, b = s?.b
      const aWin = (a ?? -1) > (b ?? -1)
      const bWin = (b ?? -1) > (a ?? -1)
      const info = `Campo ${courtsQF[i]} • Ore ${qfStart}`
      return (
        <tr key={'QFtbl'+i} className="text-sm border-t border-white/10">
          <td className="py-2 text-left">{aWin ? <strong className="winner">🏆 {nameOf(pairsById, q[1])}</strong> : <span>{nameOf(pairsById, q[1])}</span>}</td>
          <td className="py-2 text-center"><span className="score">{(a ?? '—')}-{(b ?? '—')}</span></td>
          <td className="py-2 text-left">{bWin ? <strong className="winner">🏆 {nameOf(pairsById, q[2])}</strong> : <span>{nameOf(pairsById, q[2])}</span>}</td>
          <td className="py-2 text-left">{info}</td>
        </tr>
      )
    })}
  </tbody>
</table>

      </div>

      {/* Semifinali */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-center mt-12">Semifinali • {sfStart}</h2>
          <div className="text-sm opacity-70">Campi: {courtsSF.join(', ')}</div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {SF.map((s, i) => (
            <div key={s[0]} className="card p-5 text-base">
              <div className="text-sm opacity-70 mb-1">{s[0]} • Campo {courtsSF[i]}</div>
              <div className="font-medium text-lg">{nameOf(pairsById, s[1])}</div>
              <div className="font-medium text-lg mb-3">{nameOf(pairsById, s[2])}</div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF A" value={sf[s[0]]?.a ?? ""} onChange={e=>onScore(setSf, s[0], 'a', e.target.value)} />
                <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF B" value={sf[s[0]]?.b ?? ""} onChange={e=>onScore(setSf, s[0], 'b', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />
<div className="mt-8 text-base font-semibold">Risultati Partite — Semifinali</div>
<ul className="hidden"></ul>
<table className="table-auto w-full mt-2 mb-8 border border-white/10 rounded-lg overflow-hidden">
  <thead className="text-white/70">
    <tr>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 1</th>
      <th className="py-2 text-center border-b border-white/10 bg-white/5">Risultato</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 2</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Info</th>
    </tr>
  </thead>
  <tbody>
    {SF.map((s,i)=>{
      const r = sf['SF'+(i+1)] || {}
      const a = r?.a, b = r?.b
      const aWin = (a ?? -1) > (b ?? -1)
      const bWin = (b ?? -1) > (a ?? -1)
      const info = `Campo ${courtsSF[i]} • Ore ${sfStart}`
      return (
        <tr key={'SFtbl'+i} className="text-sm border-t border-white/10">
          <td className="py-2 text-left">{aWin ? <strong className="winner">🏆 {nameOf(pairsById, s[1])}</strong> : <span>{nameOf(pairsById, s[1])}</span>}</td>
          <td className="py-2 text-center"><span className="score">{(a ?? '—')}-{(b ?? '—')}</span></td>
          <td className="py-2 text-left">{bWin ? <strong className="winner">🏆 {nameOf(pairsById, s[2])}</strong> : <span>{nameOf(pairsById, s[2])}</span>}</td>
          <td className="py-2 text-left">{info}</td>
        </tr>
      )
    })}
  </tbody>
</table>
      </div>

      {/* Finale */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2>Finale • {fStart}</h2>
          <div className="text-sm opacity-70 text-center">Campo: {courtF}</div>
        </div>
        <div className="card p-5 text-base">
          <div className="text-sm opacity-70 mb-1">Finale</div>
          <div className="font-medium text-lg">{nameOf(pairsById, F[1])}</div>
          <div className="font-medium text-lg mb-3">{nameOf(pairsById, F[2])}</div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF A" value={fin['F']?.a ?? ""} onChange={e=>onScore(setFin, 'F', 'a', e.target.value)} />
            <input type="number" min={0} className="input ko-input h-10 text-base" placeholder="GF B" value={fin['F']?.b ?? ""} onChange={e=>onScore(setFin, 'F', 'b', e.target.value)} />
          </div>
          <div className="text-sm">Vincitore: <strong>{nameOf(pairsById, finalWinner)}</strong></div>
        </div>

        <div className="divider" />
<div className="mt-8 text-base font-semibold">Risultati Partite — Finale</div>
<ul className="hidden"></ul>
<table className="table-auto w-full mt-2 mb-8 border border-white/10 rounded-lg overflow-hidden">
  <thead className="text-white/70">
    <tr>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 1</th>
      <th className="py-2 text-center border-b border-white/10 bg-white/5">Risultato</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Squadra 2</th>
      <th className="py-2 text-left border-b border-white/10 bg-white/5">Info</th>
    </tr>
  </thead>
  <tbody>
    <tr className="text-sm border-t border-white/10">
      <td className="py-2 text-left">{(fin['F']?.a ?? -1) > (fin['F']?.b ?? -1) ? <strong className="winner">🏆 {nameOf(pairsById, F[1])}</strong> : <span>{nameOf(pairsById, F[1])}</span>}</td>
      <td className="py-2 text-center"><span className="score">{(fin['F']?.a ?? '—')}-{(fin['F']?.b ?? '—')}</span></td>
      <td className="py-2 text-left">{(fin['F']?.b ?? -1) > (fin['F']?.a ?? -1) ? <strong className="winner">🏆 {nameOf(pairsById, F[2])}</strong> : <span>{nameOf(pairsById, F[2])}</span>}</td>
      <td className="py-2 text-left">{`Campo ${courtF} • Ore ${fStart}`}</td>
    </tr>
  </tbody>
</table>
      </div>
    
      {finalWinner && (
        <div className="mt-8 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-6 text-center shadow-lg">
          <div className="text-5xl leading-none mb-2">🏆</div>
          <div className="text-2xl font-extrabold tracking-wide">CAMPIONI {koKey === 'GOLD' ? 'GOLD' : 'SILVER'}</div>
          <div className="mt-1 text-lg opacity-90">{nameOf(pairsById, finalWinner)}</div>
        </div>
      )}
</div>
  )
}
