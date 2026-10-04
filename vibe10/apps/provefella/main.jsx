import { useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast } from '../../shared/store.js'
import { Shell, Sheet, Field, Seg, Empty, Stat, BackupCard, InstallHint } from '../../shared/ui.jsx'
import { kr, num, fmtDate, daysUntil, relDays, todayISO, toISODate, addMonths, addDays, plural } from '../../shared/format.js'
import { downloadICS } from '../../shared/ics.js'

const APP = 'provefella'
const CYCLES = { week: ['Uke', 52 / 12], month: ['Måned', 1], year: ['År', 1 / 12] }
const PRESETS = [
  ['Netflix', 159], ['Spotify', 139], ['Viaplay', 149], ['TV 2 Play', 129], ['HBO Max', 129], ['Disney+', 119],
  ['iCloud+', 39], ['YouTube Premium', 149], ['ChatGPT Plus', 240], ['Storytel', 229], ['Strava', 89], ['Adobe', 289],
]

const monthly = (s) => num(s.price) * CYCLES[s.cycle][1]

// Ruller "neste trekk" fram til i dag eller senere, slik at lista aldri viser gamle datoer.
function nextCharge(s) {
  let d = new Date(s.next)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  let guard = 0
  while (d < today && guard++ < 600) {
    d = s.cycle === 'week' ? addDays(d, 7) : s.cycle === 'year' ? addMonths(d, 12) : addMonths(d, 1)
  }
  return toISODate(d)
}

function App() {
  const [subs, setSubs] = useLocal(APP, 'subs', [])
  const [wage, setWage] = useLocal(APP, 'wage', 250)
  const [tab, setTab] = useState('list')
  const [edit, setEdit] = useState(null)
  const [toast, showToast] = useToast()

  const active = useMemo(
    () => subs.filter((s) => !s.cancelled).map((s) => ({ ...s, nextAt: s.trial ? s.next : nextCharge(s) }))
      .sort((a, b) => a.nextAt.localeCompare(b.nextAt)),
    [subs],
  )
  const cancelled = subs.filter((s) => s.cancelled)
  const perMonth = active.filter((s) => !s.trial).reduce((t, s) => t + monthly(s), 0)
  const trialsAtRisk = active.filter((s) => s.trial).reduce((t, s) => t + monthly(s), 0)
  const saved = cancelled.reduce((t, s) => t + monthly(s) * Math.max(1, monthsSince(s.cancelledAt)), 0)

  const save = (s) => {
    setSubs((xs) => (xs.some((x) => x.id === s.id) ? xs.map((x) => (x.id === s.id ? s : x)) : [...xs, s]))
    setEdit(null)
    showToast('Lagret')
  }
  const cancel = (s) => {
    setSubs((xs) => xs.map((x) => (x.id === s.id ? { ...x, cancelled: true, cancelledAt: todayISO() } : x)))
    setEdit(null)
    showToast(`💀 ${s.name} er død. ${kr(monthly(s) * 12)} spart i året.`)
  }
  const remove = (s) => { setSubs((xs) => xs.filter((x) => x.id !== s.id)); setEdit(null) }

  const calendar = (list) => downloadICS(
    list.length === 1 ? `provefella-${list[0].name}` : 'provefella-alle',
    list.map((s) => ({
      uid: `${s.id}-${s.nextAt}`,
      title: s.trial ? `⏳ Prøveperiode slutter: ${s.name}` : `💸 Trekk: ${s.name} ${kr(s.price)}`,
      date: s.nextAt,
      description: s.trial
        ? `Si opp ${s.name} FØR i dag, ellers trekkes ${kr(s.price)}.${s.url ? ' Oppsigelse: ' + s.url : ''}`
        : `${s.name} trekker ${kr(s.price)}. Bruker du den faktisk?`,
      url: s.url,
      alarmsDaysBefore: s.trial ? [3, 1, 0] : [2],
    })),
    'Prøvefella',
  )

  return (
    <Shell
      title="Prøvefella" glyph="⏳" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'list', icon: '📋', label: 'Aktive' }, { id: 'dead', icon: '💀', label: 'Kirkegård' }, { id: 'set', icon: '⚙️', label: 'Innstillinger' }]}
      action={<button className="btn sm" onClick={() => setEdit(blank())}>+ Ny</button>}
    >
      {tab === 'list' && (
        <>
          <div className="stats">
            <Stat hero value={kr(perMonth)} label={`i måneden · ${kr(perMonth * 12)} i året`} />
            <Stat value={`${Math.round((perMonth * 12) / num(wage) || 0)} t`} label="arbeidstimer i året på abonnement" />
          </div>
          {trialsAtRisk > 0 && (
            <div className="card notice small">
              <b>{plural(active.filter((s) => s.trial).length, 'prøveperiode', 'prøveperioder')} tikker.</b> Glemmer du dem: {kr(trialsAtRisk)} i måneden.
            </div>
          )}
          {active.length === 0 ? (
            <Empty icon="⏳" title="Ingen abonnementer ennå">Legg inn alt som trekker penger – også de gratis prøveperiodene du «bare skulle teste».</Empty>
          ) : (
            <>
              <div className="card">
                <ul className="list">
                  {active.map((s) => <SubRow key={s.id} s={s} onClick={() => setEdit(s)} />)}
                </ul>
              </div>
              <button className="btn ghost block" onClick={() => calendar(active)}>📅 Legg alle varsler i Kalender</button>
              <p className="muted small">Kalender-varsler virker selv om appen er lukket og telefonen er offline. Ingen push-server som kan svikte.</p>
            </>
          )}
          <InstallHint />
        </>
      )}

      {tab === 'dead' && (
        <>
          <div className="stats">
            <Stat hero value={kr(saved)} label="spart siden oppsigelse" />
            <Stat value={kr(cancelled.reduce((t, s) => t + monthly(s), 0) * 12)} label="spart per år framover" />
          </div>
          {cancelled.length === 0 ? (
            <Empty icon="🪦" title="Kirkegården er tom">Hver gang du sier opp noe havner det her, med summen du sparer.</Empty>
          ) : (
            <div className="card"><ul className="list">
              {cancelled.map((s) => (
                <li key={s.id} className="row">
                  <span className="grow"><b>🪦 {s.name}</b><br /><span className="muted small">Sagt opp {fmtDate(s.cancelledAt)}</span></span>
                  <span className="right"><b>{kr(monthly(s))}</b><br /><span className="muted small">/mnd</span></span>
                  <button className="iconbtn" aria-label="Slett" onClick={() => remove(s)}>🗑</button>
                </li>
              ))}
            </ul></div>
          )}
        </>
      )}

      {tab === 'set' && (
        <>
          <div className="card">
            <Field label="Timelønn etter skatt (kr) – brukes til «arbeidstimer»">
              <input className="input" inputMode="decimal" value={wage} onChange={(e) => setWage(e.target.value)} />
            </Field>
          </div>
          <BackupCard app={APP} toast={showToast} />
        </>
      )}

      <Sheet open={!!edit} title={edit && subs.some((x) => x.id === edit.id) ? 'Endre' : 'Nytt abonnement'} onClose={() => setEdit(null)}>
        {edit && <Editor s={edit} onSave={save} onCancel={cancel} onDelete={remove} onCal={(s) => calendar([{ ...s, nextAt: s.trial ? s.next : nextCharge(s) }])} exists={subs.some((x) => x.id === edit.id)} />}
      </Sheet>
    </Shell>
  )
}

const blank = () => ({ id: uid(), name: '', price: '', cycle: 'month', next: toISODate(addDays(new Date(), 7)), trial: true, url: '' })
const monthsSince = (d) => (d ? Math.floor((Date.now() - new Date(d)) / (30.44 * 86400000)) : 0)

function SubRow({ s, onClick }) {
  const d = daysUntil(s.nextAt)
  const urgent = s.trial && d <= 3
  return (
    <li className="row" onClick={onClick} style={{ cursor: 'pointer' }}>
      <span className="grow">
        <b>{s.name}</b> {s.trial && <span className={'chip' + (urgent ? ' danger' : '')}>prøve</span>}
        <br />
        <span className={'small ' + (urgent ? '' : 'muted')} style={urgent ? { color: 'var(--danger)', fontWeight: 600 } : null}>
          {s.trial ? 'Slutter' : 'Trekk'} {relDays(d)} · {fmtDate(s.nextAt)}
        </span>
      </span>
      <span className="right"><b>{kr(s.price)}</b><br /><span className="muted small">/{CYCLES[s.cycle][0].toLowerCase()}</span></span>
    </li>
  )
}

function Editor({ s: init, onSave, onCancel, onDelete, onCal, exists }) {
  const [s, set] = useState(init)
  const up = (k) => (e) => set({ ...s, [k]: e.target ? e.target.value : e })
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (s.name.trim()) onSave({ ...s, name: s.name.trim() }) }}>
      {!exists && (
        <div className="row wrap" style={{ marginBottom: 12 }}>
          {PRESETS.map(([n, p]) => <button type="button" key={n} className="chip" onClick={() => set({ ...s, name: n, price: p })}>{n}</button>)}
        </div>
      )}
      <Field label="Navn"><input className="input" value={s.name} onChange={up('name')} placeholder="F.eks. Viaplay" autoFocus={!exists} /></Field>
      <div className="row">
        <Field label="Pris (kr)"><input className="input" inputMode="decimal" value={s.price} onChange={up('price')} /></Field>
        <Field label="Per"><select className="input" value={s.cycle} onChange={up('cycle')}>
          {Object.entries(CYCLES).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}
        </select></Field>
      </div>
      <Field label="Type"><Seg value={s.trial} onChange={(v) => set({ ...s, trial: v })} options={[[true, '⏳ Gratis prøve'], [false, '💸 Betaler']]} /></Field>
      <Field label={s.trial ? 'Prøveperioden slutter' : 'Neste trekk'}><input className="input" type="date" value={s.next} onChange={up('next')} /></Field>
      <Field label="Lenke til oppsigelse (valgfritt)"><input className="input" type="url" value={s.url} onChange={up('url')} placeholder="https://…" /></Field>
      <div className="stack">
        <button className="btn block" type="submit">Lagre</button>
        {exists && <>
          <button className="btn ghost block" type="button" onClick={() => onCal(s)}>📅 Legg varsel i Kalender</button>
          {s.url && <a className="btn ghost block" href={s.url} target="_blank" rel="noreferrer">↗︎ Åpne oppsigelsessiden</a>}
          <button className="btn danger block" type="button" onClick={() => onCancel(s)}>💀 Jeg har sagt opp</button>
          <button className="btn ghost block" type="button" onClick={() => onDelete(s)}>Slett uten å telle som spart</button>
        </>}
      </div>
    </form>
  )
}

boot(App)
