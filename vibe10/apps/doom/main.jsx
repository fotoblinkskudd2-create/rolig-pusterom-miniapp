import { useEffect, useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast, copyText } from '../../shared/store.js'
import { Shell, Empty, Stat, Field, BackupCard } from '../../shared/ui.jsx'
import { todayISO, toISODate, addDays, fmtTime } from '../../shared/format.js'

// Smutthullet: iOS Snarveier har automasjonen «Når app åpnes». Den kan åpne en URL –
// denne siden – før TikTok rekker å suge deg inn. Ingen App Store, ingen Screen Time-API.
const APP = 'doom'
const DEFAULT_APPS = [
  { name: 'TikTok', scheme: 'snssdk1233://' },
  { name: 'Instagram', scheme: 'instagram://' },
  { name: 'Snapchat', scheme: 'snapchat://' },
  { name: 'YouTube', scheme: 'youtube://' },
  { name: 'X', scheme: 'twitter://' },
  { name: 'Reddit', scheme: 'reddit://' },
  { name: 'Facebook', scheme: 'fb://' },
]
const REASONS = ['Kjedelig', 'Unngår noe', 'Ren vane', 'Ensom', 'Stressa', 'Skal sjekke én ting']
const INSTEAD = ['Drikk et glass vann', 'Gå 20 skritt', 'Se ut av vinduet i 30 sek', 'Send en melding til et menneske', 'Gjør én ting fra Startknappen', '5 dype pust']
const GATE_SECONDS = 6

function App() {
  const params = new URLSearchParams(location.search)
  const fra = params.get('fra')
  const [log, setLog] = useLocal(APP, 'log', [])
  const [apps, setApps] = useLocal(APP, 'apps', DEFAULT_APPS)
  const [tab, setTab] = useState('stats')
  const [toast, showToast] = useToast()

  if (fra) return <Gate app={fra} apps={apps} log={log} onLog={(e) => setLog((l) => [e, ...l].slice(0, 5000))} />

  return (
    <Shell
      title="Doombrems" glyph="🛑" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'stats', icon: '📊', label: 'Statistikk' }, { id: 'setup', icon: '🔧', label: 'Oppsett' }, { id: 'data', icon: '💾', label: 'Data' }]}
    >
      {tab === 'stats' && <Stats log={log} />}
      {tab === 'setup' && <Setup apps={apps} setApps={setApps} showToast={showToast} />}
      {tab === 'data' && <BackupCard app={APP} toast={showToast} />}
    </Shell>
  )
}

function Gate({ app, apps, log, onLog }) {
  const [left, setLeft] = useState(GATE_SECONDS)
  const [reason, setReason] = useState('')
  const [closed, setClosed] = useState(null)
  const todayN = log.filter((e) => e.app === app && e.date === todayISO()).length + 1
  const scheme = apps.find((a) => a.name.toLowerCase() === app.toLowerCase())?.scheme

  useEffect(() => { if (left <= 0) return; const t = setTimeout(() => setLeft(left - 1), 1000); return () => clearTimeout(t) }, [left])

  const record = (choice) => onLog({ id: uid(), app, choice, reason, date: todayISO(), at: Date.now() })
  const goOn = () => { record('went'); if (scheme) location.href = scheme }
  const stop = () => { record('stopped'); setClosed(INSTEAD[Math.floor(Math.random() * INSTEAD.length)]) }

  if (closed) {
    return (
      <div className="gate">
        <div className="big">💪</div>
        <h1>Bremset.</h1>
        <p>Du valgte deg selv framfor feeden. Gjør dette i stedet:</p>
        <div className="card" style={{ fontSize: 20, fontWeight: 600 }}>{closed}</div>
        <p className="muted small">Du kan lukke denne fanen nå.</p>
        <GateStyle />
      </div>
    )
  }
  return (
    <div className="gate">
      <div className="breath" style={{ animationPlayState: left > 0 ? 'running' : 'paused' }}>{left > 0 ? left : '🛑'}</div>
      <h1>Du åpnet {app}.</h1>
      <p>{todayN === 1 ? 'Første gang i dag.' : `${todayN}. gang i dag.`} {left > 0 ? 'Pust inn … og ut.' : 'Hva skal du der egentlig?'}</p>
      {left <= 0 && (
        <>
          <div className="row wrap" style={{ justifyContent: 'center', margin: '8px 0 20px' }}>
            {REASONS.map((r) => <button key={r} className={'chip' + (reason === r ? '' : ' off')} onClick={() => setReason(r)}>{r}</button>)}
          </div>
          <button className="btn block" onClick={stop}>Nei. Jeg lar det være.</button>
          <button className="btn ghost block" style={{ marginTop: 10 }} onClick={goOn} disabled={!reason}>
            {reason ? `Gå videre til ${app}` : 'Velg en grunn for å gå videre'}
          </button>
          <p className="muted small" style={{ marginTop: 14 }}>Snarveien gir deg 5 minutter før den bremser igjen.</p>
        </>
      )}
      <GateStyle />
    </div>
  )
}

const GateStyle = () => (
  <style>{`
  .gate{min-height:100dvh;display:flex;flex-direction:column;justify-content:center;text-align:center;
    padding:calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 24px);max-width:460px;margin:0 auto}
  .gate h1{font-size:30px;margin:18px 0 6px;letter-spacing:-.02em}.gate p{font-size:17px}.gate .big{font-size:64px}
  .breath{width:150px;height:150px;border-radius:50%;margin:0 auto;display:grid;place-items:center;font-size:44px;font-weight:700;
    color:#fff;background:var(--accent);animation:b 6s ease-in-out infinite}
  @keyframes b{0%,100%{transform:scale(.8);opacity:.75}50%{transform:scale(1.08);opacity:1}}`}</style>
)

function Stats({ log }) {
  const today = log.filter((e) => e.date === todayISO())
  const stopped = log.filter((e) => e.choice === 'stopped').length
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = toISODate(addDays(new Date(), i - 6))
    const day = log.filter((e) => e.date === d)
    return { d, total: day.length, stopped: day.filter((e) => e.choice === 'stopped').length }
  }), [log])
  const max = Math.max(1, ...week.map((w) => w.total))
  const byApp = {}
  for (const e of log) byApp[e.app] = (byApp[e.app] || 0) + 1
  const reasons = {}
  for (const e of log) if (e.reason) reasons[e.reason] = (reasons[e.reason] || 0) + 1

  if (!log.length) return (
    <>
      <Empty icon="🛑" title="Ingen bremsinger ennå">Sett opp snarveien under «Oppsett». Statistikken samles der brems-siden åpnes (i Safari).</Empty>
      <div className="card small muted">Bruker du Hjem-skjerm-versjonen? iOS gir den egen lagring. Åpne <b>denne siden i Safari</b> for å se loggen som snarveien fyller.</div>
    </>
  )
  return (
    <>
      <div className="stats">
        <Stat hero value={stopped} label="ganger du lot være" />
        <Stat value={`${Math.round((stopped / log.length) * 100)} %`} label="bremsrate totalt" />
        <Stat value={today.length} label="forsøk i dag" />
        <Stat value={today.filter((e) => e.choice === 'stopped').length} label="bremset i dag" />
      </div>
      <div className="card">
        <h2>Siste 7 dager</h2>
        <div className="row" style={{ alignItems: 'flex-end', height: 110, gap: 6 }}>
          {week.map((w) => (
            <div key={w.d} className="grow" style={{ textAlign: 'center' }}>
              <div style={{ height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                <div style={{ height: ((w.total - w.stopped) / max) * 80, background: 'var(--surface-2)', borderRadius: '6px 6px 0 0' }} />
                <div style={{ height: (w.stopped / max) * 80, background: 'var(--accent)', borderRadius: w.total === w.stopped ? '6px 6px 0 0' : 0 }} />
              </div>
              <span className="muted small">{new Date(w.d).toLocaleDateString('nb-NO', { weekday: 'narrow' })}</span>
            </div>
          ))}
        </div>
        <p className="muted small" style={{ marginBottom: 0 }}>Farget = bremset. Grått = gikk videre.</p>
      </div>
      <div className="card"><h2>Per app</h2>
        <ul className="list">{Object.entries(byApp).sort((a, b) => b[1] - a[1]).map(([a, n]) => <li key={a} className="row"><span className="grow">{a}</span><b>{n}</b></li>)}</ul>
      </div>
      {Object.keys(reasons).length > 0 && (
        <div className="card"><h2>Hvorfor du griper etter telefonen</h2>
          <div className="row wrap">{Object.entries(reasons).sort((a, b) => b[1] - a[1]).map(([r, n]) => <span key={r} className="chip">{r} · {n}</span>)}</div>
        </div>
      )}
      <div className="card"><h2>Siste</h2>
        <ul className="list">{log.slice(0, 10).map((e) => <li key={e.id} className="row small"><span>{e.choice === 'stopped' ? '🛑' : '➡️'}</span><span className="grow">{e.app}{e.reason && ` · ${e.reason}`}</span><span className="muted">{e.date.slice(5)} {fmtTime(e.at)}</span></li>)}</ul>
      </div>
    </>
  )
}

function Setup({ apps, setApps, showToast }) {
  const [sel, setSel] = useState(apps[0]?.name || 'TikTok')
  const base = location.origin + location.pathname
  const url = `${base}?fra=${encodeURIComponent(sel)}`
  const a = apps.find((x) => x.name === sel)
  return (
    <>
      <div className="card">
        <h2>1. Velg appen du vil bremse</h2>
        <div className="row wrap">{apps.map((x) => <button key={x.name} className={'chip' + (sel === x.name ? '' : ' off')} onClick={() => setSel(x.name)}>{x.name}</button>)}</div>
        {a && (
          <Field label="URL-skjema for «Gå videre» (endre hvis appen ikke åpner)">
            <input className="input" value={a.scheme} onChange={(e) => setApps(apps.map((x) => (x.name === sel ? { ...x, scheme: e.target.value } : x)))} />
          </Field>
        )}
      </div>
      <div className="card">
        <h2>2. Kopier brems-lenka</h2>
        <pre className="letter" style={{ wordBreak: 'break-all' }}>{url}</pre>
        <button className="btn block" style={{ marginTop: 10 }} onClick={async () => { await copyText(url); showToast('Kopiert') }}>📋 Kopier</button>
      </div>
      <div className="card">
        <h2>3. Lag automasjonen i Snarveier</h2>
        <ol className="small" style={{ paddingLeft: 18, margin: 0 }}>
          <li>Åpne <b>Snarveier</b> → <b>Automatisering</b> → <b>+</b> → <b>App</b>.</li>
          <li>Velg <b>{sel}</b>, kryss av <b>Åpnes</b>, velg <b>Kjør umiddelbart</b>. Neste.</li>
          <li>Legg til handlingene (5-minutters pause hindrer evig løkke):
            <ol>
              <li><b>Hent fil</b> fra Snarveier-mappen, sti <code>doombrems.txt</code>, slå av «Feil hvis ikke funnet».</li>
              <li><b>Hent tid mellom datoer</b>: fra <i>Fil</i> til <i>Gjeldende dato</i> i <b>minutter</b>.</li>
              <li><b>Hvis</b> Tid mellom er <b>mindre enn 5</b> → <b>Stopp denne snarveien</b>. Slutt hvis.</li>
              <li><b>Tekst</b>: <i>Gjeldende dato</i> → <b>Arkiver fil</b> til <code>doombrems.txt</code> (overskriv).</li>
              <li><b>Åpne URL-er</b>: lim inn lenka fra steg 2.</li>
            </ol>
          </li>
          <li>Ferdig. Neste gang du åpner {sel} stopper brems-siden deg først.</li>
        </ol>
        <p className="muted small" style={{ marginBottom: 0 }}>Enklere variant: bare «Åpne URL-er». Da bremser den hver gang – også når du trykker «Gå videre».</p>
      </div>
      <button className="btn ghost block" onClick={() => window.open(url, '_blank')}>👀 Test brems-siden</button>
    </>
  )
}

boot(App)
