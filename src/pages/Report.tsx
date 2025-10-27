import React from 'react'
import { useTournament } from '../store/useTournament'
import StandingsTable from '../components/StandingsTable'

/**
 * Report finale stilizzato (versione React) — pronto per stampa/PDF.
 * Usa dati già presenti nello stato + window.__goldData / __silverData calcolati nelle pagine Gold/Silver.
 */
export default function ReportPage() {
  const { state } = useTournament()
  const { tournament: t, matches } = state

  // KPI
  const teamsCount = Object.values(t.groups).flat().length
  const matchesPlayed = matches.filter(m => ((m.gamesA ?? 0) + (m.gamesB ?? 0)) > 0).length
  const matchesDisplay = 31
  const courts = 8

  // Helpers
  const pairsList = React.useMemo(() => {
  const fromPairs = (t as any)?.pairs
  if (Array.isArray(fromPairs)) return fromPairs
  const fromGroups = Object.values((t as any)?.groups || {}).flat() as any[]
  return fromGroups
}, [t])

const pairName = (id: string) => {
  if (!id) return '—'
  const p = (pairsList || []).find((pp:any) => pp && pp.id === id)
  return p && Array.isArray(p.players) ? p.players.join(' / ') : id
}

const wrapWinner = (name: any, isWinner: boolean) => {
  if (!name) return name
  return isWinner ? <strong>🏆 {name}</strong> : name
}

  // Standings per girone
  type Row = { pairId: string; GF:number; GS:number; diff:number; pts:number }
  const compute = (ids: string[], ms: any[]): Row[] => {
    const map: Record<string, Row> = {}
    ids.forEach(id => map[id] = { pairId:id, GF:0, GS:0, diff:0, pts:0 })
    ms.forEach((m:any) => {
      const a = m.gamesA ?? 0, b = m.gamesB ?? 0
      map[m.pairA].GF += a; map[m.pairA].GS += b
      map[m.pairB].GF += b; map[m.pairB].GS += a
      if(a!==b){
        if(a>b){ map[m.pairA].pts += 3 } else { map[m.pairB].pts += 3 }
      }else{
        map[m.pairA].pts += 1; map[m.pairB].pts += 1
      }
    })
    Object.values(map).forEach(r => r.diff = r.GF - r.GS)
    return Object.values(map).sort((x,y)=> y.pts-x.pts || y.diff-x.diff || y.GF-x.GF)
  }

  const safeGroups = (t && (t as any).groups) ? ['A','B','C','D'] as const : ([] as any)
  const groups: Array<{name:string, rows:Row[]}> = (safeGroups as any).map((g:any)=>{
    const ids = t.groups[g].map(p=>p.id)
    const ms = matches.filter(m=>m.group===g)
    return { name: `Girone ${g}`, rows: compute(ids, ms) }
  })

  // Vincitori (da finestre Gold/Silver)
  const gold = (window as any).__goldData || { finalWinner: '', finalScore: '' }
  const silver = (window as any).__silverData || { finalWinner: '', finalScore: '' }

  // Torneo date
  const todayIso = new Date().toISOString().slice(0,10)
  const info = (window as any).__tournamentInfo || { name: t?.name || 'Torneo', date: t?.date || todayIso }
  const torneoDate = info.date || todayIso

  // Brackets snapshot (se disponibili dalle pagine)
  const goldRounds = (window as any).__goldRounds || (function(){ try{ const x=localStorage.getItem('padel-ko-GOLD'); return x? (JSON.parse(x).rounds||[]) : [] }catch(e){ return [] } })()
  const silverRounds = (window as any).__silverRounds || (function(){ try{ const x=localStorage.getItem('padel-ko-SILVER'); return x? (JSON.parse(x).rounds||[]) : [] }catch(e){ return [] } })()

  const css = `
  :root{
    --bg:#0b0d12; --panel:#121621; --muted:#96a0b5; --ink:#e8ecf3; --accent:#4cc9f0;
    --gold:#f4c430; --silver:#c0c6d9; --success:#5bd8a6; --brand:#8e98ff;
  }
  *{box-sizing:border-box}
  .wrap{max-width:1100px;margin:24px auto;padding:0 20px;color:var(--ink);font:14px/1.45 Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
  .header{display:flex;align-items:center;gap:18px;margin:8px 0 20px}
  .logo{width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--accent));display:grid;place-items:center;color:#fff;font-weight:900}
  .h1{margin:0;font-size:28px}
  .muted{color:var(--muted)}
  .grid{display:grid;gap:16px}
  .g3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .g2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .card{background:var(--panel);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:16px}
  .kpi{display:flex;align-items:baseline;gap:10px}
  .kpi .v{font-size:26px;font-weight:800}
  .badge{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:6px 10px;font-size:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04)}
  .gold{color:var(--gold);border-color:rgba(244,196,48,.5);background:rgba(244,196,48,.08)}
  .silver{color:var(--silver);border-color:rgba(192,198,217,.5);background:rgba(192,198,217,.08)}
  .section{margin:24px 0}
  .title{margin:0 0 12px;font-size:20px}
  table{width:100%;border-collapse:separate;border-spacing:0}
  th,td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.08);text-align:left}
  th{font-size:12px;text-transform:uppercase;letter-spacing:.8px;color:var(--muted)}
  tr:hover td{background:rgba(255,255,255,.02)}
  .num{text-align:center}
  .hilite{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent)}
  .h1l{outline:2px solid rgba(91,216,166,.35)}
  .h2l{outline:2px solid rgba(140,171,255,.35)}
  .winner{display:flex;align-items:center;gap:14px;padding:14px;border-radius:14px;background:linear-gradient(135deg,rgba(91,216,166,.12),rgba(76,201,240,.09));border:1px dashed rgba(140,171,255,.5)}
  .cup{font-size:28px}
  .bracket{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .round h4{margin:0 0 8px;color:var(--muted);font-weight:600;letter-spacing:.6px;text-transform:uppercase;font-size:12px}
  .match{background:var(--panel);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:10px}
  .team{display:flex;justify-content:space-between;gap:10px;padding:6px 8px;border-radius:8px}
  .win{background:rgba(91,216,166,.08)}
  .footer{margin:26px 0 10px;display:flex;justify-content:space-between;color:var(--muted);font-size:12px}
  .actions{display:flex;gap:8px}
  @media print{
  /* separator line */
  .sep{border:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);margin:18px 0}

    body{background:#fff;color:#000}
    .card,.match,.winner{break-inside:avoid;box-shadow:none;border-color:#ddd}
    .wrap{max-width:none;margin:0;padding:0}
    .page-break{page-break-before:always}
    .footer{position:fixed;bottom:10px;left:0;right:0;padding:0 28px}
    .actions{display:none}
  }`

  const RoundCol = ({ title, items }:{title:string, items:any[]}) => (
    <div className="round">
      <h4>{title}</h4>
      {items?.map((m:any,idx:number)=>(
        <div className="match" key={idx}>
          <div className={"team " + ((m.sa>m.sb)?"win":"")}>
            <span className="name">{(m.sa>m.sb) ? <strong>🏆 {pairName(m.a) || m.a}</strong> : (pairName(m.a) || m.a)}</span>
            <span className="score">{m.sa}</span>
          </div>
          <div className={"team " + ((m.sb>m.sa)?"win":"")}>
            <span className="name">{(m.sb>m.sa) ? <strong>🏆 {pairName(m.b) || m.b}</strong> : (pairName(m.b) || m.b)}</span>
            <span className="score">{m.sb}</span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="wrap">
      <style>{css}</style>
      <header className="header">
        <div>
          <h1>Report Torneo</h1>
          <div className="muted">Direttore Torneo: Vincenzo Viaggio</div>
          <div className="muted">Web App by AATech -antonio.astuti@gmail.com</div>
        </div>
        <div style={{marginLeft:'auto'}} className="actions">
          <button onClick={()=>window.print()} className="badge">🖨️ Stampa / PDF</button>
        </div>
      </header>

<section className="section">
        <h2 className="title">Vincitori</h2>
      <div className="grid g2">
          <div className="card winner">
            <div className="cup">🏆</div>
            <div>
              <div className="badge gold">Torneo Gold</div>
              <div style={{fontSize:18, fontWeight:800, marginTop:4}}>{pairName(gold.finalWinner) || gold.finalWinner || '—'}</div>
              </div>
          </div>
          <div className="card winner">
            <div className="cup">🏆</div>
            <div>
              <div className="badge silver">Torneo Silver</div>
              <div style={{fontSize:18, fontWeight:800, marginTop:4}}>{pairName(silver.finalWinner) || silver.finalWinner || '—'}</div>
              </div>
          </div>
        </div>
      </section>
<hr className="sep"/>

      
<hr className="sep"/>
<section className="section">
  <h1 className="mb-4">Classifiche Gironi</h1>
  <div className="grid grid-cols-1 gap-4">
    {(['A','B','C','D'] as const).map(gid => (
      <StandingsTable
        key={gid}
        groupId={gid}
        pairs={t.groups[gid]}
        matches={matches.filter(m => m.group === gid)}
      />
    ))}
  </div>
</section>
<div className="page-break" />
<section className="section"><h2 className="title">Quarti — Dettaglio</h2>
        <div className="grid g2">
          <div className="card">
            <h3>Quarti Gold</h3>
            {Array.isArray(goldRounds) && goldRounds.find((r:any)=>r.round==='Quarti') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {goldRounds.find((r:any)=>r.round==='Quarti').matches.map((m:any, i:number)=>{
                    const leftWin = (m.sa ?? 0) > (m.sb ?? 0)
                    const rightWin = (m.sb ?? 0) > (m.sa ?? 0)
                    return (
                      <tr key={i}>
                        <td>{leftWin ? <strong>🏆 {pairName(m.a) || m.a}</strong> : (pairName(m.a) || m.a)}</td>
                        <td className="num">{m.sa}</td>
                        <td className="num">–</td>
                        <td className="num">{m.sb}</td>
                        <td>{rightWin ? <strong>🏆 {pairName(m.b) || m.b}</strong> : (pairName(m.b) || m.b)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <div className="muted">Quarti non disponibili.</div>}
          </div>

          <div className="card">
            <h3>Quarti Silver</h3>
            {Array.isArray(silverRounds) && silverRounds.find((r:any)=>r.round==='Quarti') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {silverRounds.find((r:any)=>r.round==='Quarti').matches.map((m:any, i:number)=>{
                    const leftWin = (m.sa ?? 0) > (m.sb ?? 0)
                    const rightWin = (m.sb ?? 0) > (m.sa ?? 0)
                    return (
                      <tr key={i}>
                        <td>{leftWin ? <strong>🏆 {pairName(m.a) || m.a}</strong> : (pairName(m.a) || m.a)}</td>
                        <td className="num">{m.sa}</td>
                        <td className="num">–</td>
                        <td className="num">{m.sb}</td>
                        <td>{rightWin ? <strong>🏆 {pairName(m.b) || m.b}</strong> : (pairName(m.b) || m.b)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <div className="muted">Quarti non disponibili.</div>}
          </div>
        </div>
      </section>
<div className="page-break" />
<section className="section"><h2 className="title">Semifinali — Dettaglio</h2>
        <div className="grid g2">
          <div className="card">
            <h3>Semifinali Gold</h3>
            {Array.isArray(goldRounds) && goldRounds.find((r:any)=>r.round==='Semifinali') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {goldRounds.find((r:any)=>r.round==='Semifinali').matches.map((m:any, i:number)=>(
                    <tr key={i}>
                      <td>{wrapWinner(pairName(m.a) || m.a, (m.sa ?? 0) > (m.sb ?? 0))}</td>
                      <td className="num">{m.sa}</td>
                      <td className="num">–</td>
                      <td className="num">{m.sb}</td>
                      <td>{wrapWinner(pairName(m.b) || m.b, (m.sb ?? 0) > (m.sa ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="muted">Semifinali non disponibili.</div>}
          </div>

          <div className="card">
            <h3>Semifinali Silver</h3>
            {Array.isArray(silverRounds) && silverRounds.find((r:any)=>r.round==='Semifinali') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {silverRounds.find((r:any)=>r.round==='Semifinali').matches.map((m:any, i:number)=>(
                    <tr key={i}>
                      <td>{wrapWinner(pairName(m.a) || m.a, (m.sa ?? 0) > (m.sb ?? 0))}</td>
                      <td className="num">{m.sa}</td>
                      <td className="num">–</td>
                      <td className="num">{m.sb}</td>
                      <td>{wrapWinner(pairName(m.b) || m.b, (m.sb ?? 0) > (m.sa ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="muted">Semifinali non disponibili.</div>}
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="title">Finale — Dettaglio</h2>
        <div className="grid g2">
          <div className="card">
            <h3>Finale Gold</h3>
            {Array.isArray(goldRounds) && goldRounds.find((r:any)=>r.round==='Finale') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {goldRounds.find((r:any)=>r.round==='Finale').matches.map((m:any, i:number)=>{
                    const leftWin = (m.sa ?? 0) > (m.sb ?? 0)
                    const rightWin = (m.sb ?? 0) > (m.sa ?? 0)
                    return (
                      <tr key={i}>
                        <td>{leftWin ? <strong>🏆 {pairName(m.a) || m.a}</strong> : (pairName(m.a) || m.a)}</td>
                        <td className="num">{m.sa}</td>
                        <td className="num">–</td>
                        <td className="num">{m.sb}</td>
                        <td>{rightWin ? <strong>🏆 {pairName(m.b) || m.b}</strong> : (pairName(m.b) || m.b)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <div className="muted">Finale non disponibile.</div>}
          </div>

          <div className="card">
            <h3>Finale Silver</h3>
            {Array.isArray(silverRounds) && silverRounds.find((r:any)=>r.round==='Finale') ? (
              <table>
                <thead><tr><th>Squadra A</th><th className="num">GF</th><th className="num"></th><th className="num">GF</th><th>Squadra B</th></tr></thead>
                <tbody>
                  {silverRounds.find((r:any)=>r.round==='Finale').matches.map((m:any, i:number)=>{
                    const leftWin = (m.sa ?? 0) > (m.sb ?? 0)
                    const rightWin = (m.sb ?? 0) > (m.sa ?? 0)
                    return (
                      <tr key={i}>
                        <td>{leftWin ? <strong>🏆 {pairName(m.a) || m.a}</strong> : (pairName(m.a) || m.a)}</td>
                        <td className="num">{m.sa}</td>
                        <td className="num">–</td>
                        <td className="num">{m.sb}</td>
                        <td>{rightWin ? <strong>🏆 {pairName(m.b) || m.b}</strong> : (pairName(m.b) || m.b)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : <div className="muted">Finale non disponibile.</div>}
          </div>
        </div>
      </section>
<div className="page-break" />
<section className="section">
        <h2 className="title">Tabellone Gold</h2>
        <div className="bracket">
          {(goldRounds||[]).map((r:any,idx:number)=>(
            <RoundCol key={idx} title={r.round} items={r.matches}/>
          ))}
        </div>
      
        {gold?.finalWinner ? (
          <div className="mt-6 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-5 text-center shadow">
            <div className="text-3xl leading-none mb-1">🏆</div>
            <div className="text-xl font-extrabold tracking-wide">VINCITORE GOLD</div>
            <div className="mt-1 text-base opacity-90">{pairName(gold.finalWinner) || gold.finalWinner}</div>
          </div>
        ) : null}
</section>

      <section className="section page-break">
        <h2 className="title">Tabellone Silver</h2>
        <div className="bracket">
          {(silverRounds||[]).map((r:any,idx:number)=>(
            <RoundCol key={idx} title={r.round} items={r.matches}/>
          ))}
        </div>
      
        {silver?.finalWinner ? (
          <div className="mt-6 rounded-2xl border border-yellow-400/40 bg-yellow-400/10 p-5 text-center shadow">
            <div className="text-3xl leading-none mb-1">🏆</div>
            <div className="text-xl font-extrabold tracking-wide">VINCITORE SILVER</div>
            <div className="mt-1 text-base opacity-90">{pairName(silver.finalWinner) || silver.finalWinner}</div>
          </div>
        ) : null}
</section>

      
    </div>
  )
}