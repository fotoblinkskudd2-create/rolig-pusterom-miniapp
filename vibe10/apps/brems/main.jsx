import { useEffect, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast } from '../../shared/store.js'
import { Shell, Sheet, Field, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { kr, num, fmtDate } from '../../shared/format.js'
import { downloadICS } from '../../shared/ics.js'

const APP = 'brems'
const COOLDOWNS = [[24, '24 t'], [72, '3 dager'], [168, '1 uke'], [720, '30 dager']]
const TRIGGERS = ['Kjedelig', 'Stressa', 'Trist', 'Sliten', 'Feiring', 'Så en annonse', 'Klarna fristet', 'Vet ikke']

function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t) }, [ms])
  return now
}

const left = (until, now) => {
  const s = Math.max(0, until - now) / 1000
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  return d ? `${d}d ${h}t` : h ? `${h}t ${m}m` : `${m}m`
}

function App() {
  const [items, setItems] = useLocal(APP, 'items', [])
  const [wage, setWage] = useLocal(APP, 'wage', 250)
  const [tab, setTab] = useState('freezer')
  const [adding, setAdding] = useState(false)
  const [toast, showToast] = useToast()
  const now = useNow()

  const frozen = items.filter((i) => !i.decision)
  const saved = items.filter((i) => i.decision === 'skip')
  const bought = items.filter((i) => i.decision === 'buy')
  const savedSum = saved.reduce((t, i) => t + num(i.price), 0)
  const resistRate = saved.length + bought.length ? Math.round((saved.length / (saved.length + bought.length)) * 100) : 0

  const decide = (item, decision) => {
    setItems((xs) => xs.map((x) => (x.id === item.id ? { ...x, decision, decidedAt: Date.now() } : x)))
    showToast(decision === 'skip' ? `🧊 ${kr(item.price)} reddet. Lommeboka takker.` : 'OK – kjøpt med kaldt hode. Det er lov.')
  }

  return (
    <Shell
      title="Kjøpebrems" glyph="🧊" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'freezer', icon: '🧊', label: 'Fryseren' }, { id: 'history', icon: '📊', label: 'Resultat' }, { id: 'set', icon: '⚙️', label: 'Innst.' }]}
      action={<button className="btn sm" onClick={() => setAdding(true)}>+ Frys</button>}
    >
      {tab === 'freezer' && (
        <>
          <div className="stats">
            <Stat hero value={kr(savedSum)} label={`reddet · ${saved.length} kjøp droppet`} />
            <Stat value={kr(frozen.reduce((t, i) => t + num(i.price), 0))} label={`ligger i fryseren nå`} />
          </div>
          {frozen.length === 0 ? (
            <Empty icon="🧊" title="Fryseren er tom">Får du lyst på noe? Ikke kjøp. Frys det her først. Lysten smelter oftere enn du tror.</Empty>
          ) : frozen.sort((a, b) => a.until - b.until).map((i) => {
            const ready = now >= i.until
            const pct = Math.min(100, ((now - i.created) / (i.until - i.created)) * 100)
            return (
              <div key={i.id} className="card">
                <div className="row">
                  <span className="grow"><b>{i.name}</b><br /><span className="muted small">{i.trigger && `Følte meg: ${i.trigger} · `}fryst {fmtDate(i.created)}</span></span>
                  <span className="right"><b>{kr(i.price)}</b><br /><span className="muted small">{Math.round(num(i.price) / num(wage) * 10) / 10 || 0} arbeidstimer</span></span>
                </div>
                {i.why && <p className="small" style={{ margin: '8px 0 0' }}>«{i.why}»</p>}
                {!ready ? (
                  <>
                    <div className="bar" style={{ margin: '12px 0 6px' }}><i style={{ width: pct + '%' }} /></div>
                    <div className="row small muted"><span className="grow">🔒 Tiner om {left(i.until, now)}</span>
                      <button className="chip off" onClick={() => decide(i, 'skip')}>Vil ikke ha den likevel</button>
                    </div>
                  </>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ margin: '0 0 10px' }}><b>Tint. Vil du fortsatt ha den?</b></p>
                    <div className="row">
                      <button className="btn grow" onClick={() => decide(i, 'skip')}>Nei, dropp</button>
                      <button className="btn ghost grow" onClick={() => decide(i, 'buy')}>Ja, kjøper</button>
                    </div>
                    {i.url && <a className="small" href={i.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8 }}>Åpne lenka ↗︎</a>}
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="stats">
            <Stat hero value={`${resistRate} %`} label="av fryste kjøp droppet" />
            <Stat value={kr(bought.reduce((t, i) => t + num(i.price), 0))} label="kjøpt etter nedkjøling" />
          </div>
          <TriggerStats items={items.filter((i) => i.decision)} />
          {items.filter((i) => i.decision).length === 0 ? <Empty icon="📊" title="Ingen avgjørelser ennå">Når tingene tiner, havner valget ditt her.</Empty> : (
            <div className="card"><ul className="list">
              {items.filter((i) => i.decision).sort((a, b) => b.decidedAt - a.decidedAt).map((i) => (
                <li key={i.id} className="row">
                  <span>{i.decision === 'skip' ? '🧊' : '🛍'}</span>
                  <span className="grow">{i.name}<br /><span className="muted small">{fmtDate(i.decidedAt)}</span></span>
                  <b style={{ color: i.decision === 'skip' ? 'var(--ok)' : undefined }}>{i.decision === 'skip' ? '+' : ''}{kr(i.price)}</b>
                </li>
              ))}
            </ul></div>
          )}
        </>
      )}

      {tab === 'set' && (
        <>
          <div className="card">
            <Field label="Timelønn etter skatt (kr)"><input className="input" inputMode="decimal" value={wage} onChange={(e) => setWage(e.target.value)} /></Field>
            <p className="muted small" style={{ margin: 0 }}>Prisen vises som arbeidstimer. 1 800 kr Lego = en hel arbeidsdag.</p>
          </div>
          <BackupCard app={APP} toast={showToast} />
        </>
      )}

      <Sheet open={adding} title="Frys et kjøp" onClose={() => setAdding(false)}>
        {adding && <AddForm wage={wage} onAdd={(i) => { setItems((xs) => [...xs, i]); setAdding(false); showToast('🧊 Fryst. Gå og gjør noe annet.') }} />}
      </Sheet>
    </Shell>
  )
}

function TriggerStats({ items }) {
  const counts = {}
  for (const i of items) if (i.trigger) counts[i.trigger] = (counts[i.trigger] || 0) + 1
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!top.length) return null
  const max = top[0][1]
  return (
    <div className="card">
      <h2>Hva trigger lysten?</h2>
      {top.map(([t, n]) => (
        <div key={t} className="row small" style={{ margin: '6px 0' }}>
          <span style={{ width: 110 }}>{t}</span><div className="bar grow"><i style={{ width: (n / max) * 100 + '%' }} /></div><span>{n}</span>
        </div>
      ))}
    </div>
  )
}

function AddForm({ onAdd, wage }) {
  const [f, set] = useState({ name: '', price: '', url: '', why: '', trigger: '', hours: 72 })
  const up = (k) => (e) => set({ ...f, [k]: e.target.value })
  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return
    const created = Date.now()
    const item = { ...f, id: uid(), created, until: created + f.hours * 3600000 }
    onAdd(item)
    if (f.calendar) downloadICS(`kjopebrems-${f.name}`, [{ uid: item.id, title: `🧊 Tint: ${f.name} – vil du fortsatt ha den?`, date: new Date(item.until), alarmsDaysBefore: [0] }], 'Kjøpebrems')
  }
  return (
    <form onSubmit={submit}>
      <Field label="Hva vil du kjøpe?"><input className="input" value={f.name} onChange={up('name')} autoFocus placeholder="F.eks. LEGO Technic 42171" /></Field>
      <Field label="Pris (kr)"><input className="input" inputMode="decimal" value={f.price} onChange={up('price')} /></Field>
      {num(f.price) > 0 && <p className="small" style={{ marginTop: -4 }}>= <b>{Math.round(num(f.price) / num(wage) * 10) / 10} arbeidstimer</b>. Er den verdt det?</p>}
      <Field label="Hvorfor vil du ha den? (leses opp igjen når den tiner)"><input className="input" value={f.why} onChange={up('why')} /></Field>
      <Field label="Hvordan har du det akkurat nå?">
        <div className="row wrap">{TRIGGERS.map((t) => <button type="button" key={t} className={'chip' + (f.trigger === t ? '' : ' off')} onClick={() => set({ ...f, trigger: f.trigger === t ? '' : t })}>{t}</button>)}</div>
      </Field>
      <Field label="Fryses i">
        <div className="seg">{COOLDOWNS.map(([h, l]) => <button type="button" key={h} aria-pressed={f.hours === h} onClick={() => set({ ...f, hours: h })}>{l}</button>)}</div>
      </Field>
      <Field label="Lenke (valgfritt)"><input className="input" type="url" value={f.url} onChange={up('url')} /></Field>
      <label className="row small" style={{ marginBottom: 14 }}><input type="checkbox" checked={!!f.calendar} onChange={(e) => set({ ...f, calendar: e.target.checked })} /> Varsle meg i Kalender når den tiner</label>
      <button className="btn block">🧊 Frys</button>
    </form>
  )
}

boot(App)
