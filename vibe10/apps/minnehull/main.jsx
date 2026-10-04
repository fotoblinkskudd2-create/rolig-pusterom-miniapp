import { useCallback, useRef, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { uid, useToast } from '../../shared/store.js'
import { Shell, Sheet, Field, Empty, BackupCard } from '../../shared/ui.jsx'
import { fmtTime, fmtDate, todayISO, toISODate } from '../../shared/format.js'

// Logg for systemer (DID/OSDD) og alle som mister tid til dissosiasjon.
// Valgfri PIN = ekte kryptering (AES-GCM, nøkkel fra PBKDF2) – ikke bare en skjerm-lås.
const APP = 'minnehull'
const KEY = `${APP}:vault`
const COLORS = ['#d6409f', '#8e4ec6', '#3e63dd', '#0090ff', '#12a594', '#30a46c', '#ffb224', '#f76b15', '#e5484d', '#687076']
const EMPTY = { parts: [{ id: 'meg', name: 'Meg', color: COLORS[0], emoji: '🫧' }], fronts: [], gaps: [], board: [] }

const b64 = (u8) => btoa(String.fromCharCode(...u8))
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
async function deriveKey(pin, salt) {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 250000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}
async function encrypt(data, key, salt) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))))
  return { enc: { salt: b64(salt), iv: b64(iv), ct: b64(ct) } }
}
async function decrypt(enc, key) {
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(enc.iv) }, key, unb64(enc.ct))
  return JSON.parse(new TextDecoder().decode(pt))
}
const readRaw = () => { try { return JSON.parse(localStorage.getItem(KEY)) } catch { return null } }

function useVault() {
  const raw = useRef(readRaw())
  const [data, setData] = useState(raw.current?.enc ? null : raw.current?.data || EMPTY)
  const crypt = useRef(null) // { key, salt }
  const locked = data === null

  const persist = useCallback(async (d) => {
    const payload = crypt.current ? await encrypt(d, crypt.current.key, crypt.current.salt) : { data: d }
    localStorage.setItem(KEY, JSON.stringify(payload))
  }, [])
  const update = useCallback((fn) => setData((d) => { const n = fn(d); persist(n); return n }), [persist])
  const unlock = async (pin) => {
    const enc = readRaw().enc
    const salt = unb64(enc.salt)
    const key = await deriveKey(pin, salt)
    const d = await decrypt(enc, key) // kaster ved feil PIN
    crypt.current = { key, salt }
    setData(d)
  }
  const setPin = async (pin) => {
    if (pin) { const salt = crypto.getRandomValues(new Uint8Array(16)); crypt.current = { key: await deriveKey(pin, salt), salt } } else crypt.current = null
    await persist(data)
  }
  const lock = () => { if (crypt.current) { crypt.current = null; setData(null) } }
  return { data, locked, update, unlock, setPin, lock, hasPin: () => !!crypt.current || !!readRaw()?.enc }
}

function App() {
  const v = useVault()
  const [tab, setTab] = useState('now')
  const [toast, showToast] = useToast()
  if (v.locked) return <Lock onUnlock={v.unlock} />
  const d = v.data
  const part = (id) => d.parts.find((p) => p.id === id) || { name: 'Ukjent', color: '#888', emoji: '❔' }
  const current = d.fronts[0]

  return (
    <Shell
      title="Minnehull" glyph="🫧" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'now', icon: '🫧', label: 'Hvem er her' }, { id: 'gaps', icon: '🕳', label: 'Hull' }, { id: 'board', icon: '📌', label: 'Tavle' }, { id: 'set', icon: '⚙️', label: 'Innst.' }]}
      action={v.hasPin() && <button className="iconbtn" onClick={v.lock} aria-label="Lås">🔒</button>}
    >
      {tab === 'now' && <Now d={d} part={part} current={current} onFront={(pid, note) => { v.update((x) => ({ ...x, fronts: [{ id: uid(), partId: pid, at: Date.now(), note }, ...x.fronts] })); showToast(`${part(pid).emoji} ${part(pid).name} er logget`) }} />}
      {tab === 'gaps' && <Gaps d={d} update={v.update} showToast={showToast} />}
      {tab === 'board' && <Board d={d} part={part} update={v.update} current={current} />}
      {tab === 'set' && <Settings d={d} update={v.update} v={v} showToast={showToast} />}
    </Shell>
  )
}

function Lock({ onUnlock }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <form style={{ width: '100%', maxWidth: 320, textAlign: 'center' }} onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr('')
        try { await onUnlock(pin) } catch { setErr('Feil PIN'); setPin('') } finally { setBusy(false) }
      }}>
        <div style={{ fontSize: 56 }}>🫧</div>
        <h1 style={{ fontSize: 24 }}>Minnehull er låst</h1>
        <input className="input" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN" autoFocus style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }} />
        {err && <p style={{ color: 'var(--danger)' }}>{err}</p>}
        <button className="btn block" style={{ marginTop: 12 }} disabled={busy || !pin}>{busy ? 'Låser opp …' : 'Lås opp'}</button>
      </form>
    </div>
  )
}

function Now({ d, part, current, onFront }) {
  const [note, setNote] = useState('')
  const today = d.fronts.filter((f) => toISODate(f.at) === todayISO())
  return (
    <>
      <div className="card" style={current ? { borderColor: part(current.partId).color, borderWidth: 2 } : null}>
        <p className="muted small" style={{ margin: 0 }}>Sist logget</p>
        {current ? <h2 style={{ fontSize: 22, margin: '4px 0 0' }}>{part(current.partId).emoji} {part(current.partId).name} <span className="muted small">siden {fmtTime(current.at)}{toISODate(current.at) !== todayISO() && `, ${fmtDate(current.at)}`}</span></h2>
          : <h2 style={{ margin: '4px 0 0' }}>Ingen logget ennå</h2>}
      </div>
      <div className="card">
        <h2>Hvem er her nå?</h2>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Valgfritt: hvordan er det? hvor er du?" style={{ marginBottom: 10 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
          {d.parts.map((p) => (
            <button key={p.id} className="btn" style={{ background: p.color, flexDirection: 'column', gap: 2, minHeight: 74 }} onClick={() => { onFront(p.id, note); setNote('') }}>
              <span style={{ fontSize: 24 }}>{p.emoji}</span><span className="small">{p.name}</span>
            </button>
          ))}
          <button className="btn ghost" style={{ flexDirection: 'column', minHeight: 74 }} onClick={() => { onFront('?', note); setNote('') }}><span style={{ fontSize: 24 }}>❔</span><span className="small">Vet ikke</span></button>
        </div>
      </div>
      <div className="card">
        <h2>I dag</h2>
        {today.length === 0 ? <p className="muted small">Ingen logg i dag.</p> : (
          <ul className="list">{today.map((f) => (
            <li key={f.id} className="row"><span style={{ width: 10, height: 10, borderRadius: 5, background: part(f.partId).color }} />
              <span className="muted small" style={{ width: 44 }}>{fmtTime(f.at)}</span><span className="grow">{part(f.partId).emoji} {part(f.partId).name}{f.note && <span className="muted small"> · {f.note}</span>}</span></li>
          ))}</ul>
        )}
      </div>
    </>
  )
}

function Gaps({ d, update, showToast }) {
  const [adding, setAdding] = useState(false)
  return (
    <>
      <button className="btn block" style={{ marginBottom: 12 }} onClick={() => setAdding(true)}>🕳 Jeg mangler tid</button>
      {d.gaps.length === 0 ? <Empty icon="🕳" title="Ingen hull logget">Kom du til deg selv og klokka hadde hoppet? Logg det – og sporene du fant (kjøp, meldinger, ting som er flyttet).</Empty> : (
        <div className="card"><ul className="list">{d.gaps.map((g) => (
          <li key={g.id}>
            <div className="row"><b className="grow">{fmtDate(g.from)} · {g.fromT}–{g.toT}</b>
              <button className="iconbtn" aria-label="Slett" onClick={() => update((x) => ({ ...x, gaps: x.gaps.filter((y) => y.id !== g.id) }))}>🗑</button></div>
            {g.found && <p className="small" style={{ margin: '6px 0 0' }}>🔎 <b>Spor:</b> {g.found}</p>}
            {g.note && <p className="small muted" style={{ margin: '4px 0 0' }}>{g.note}</p>}
          </li>
        ))}</ul></div>
      )}
      <Sheet open={adding} title="Logg et hull" onClose={() => setAdding(false)}>
        {adding && <GapForm onSave={(g) => { update((x) => ({ ...x, gaps: [g, ...x.gaps] })); setAdding(false); showToast('Logget. Det er ikke din feil.') }} />}
      </Sheet>
    </>
  )
}

function GapForm({ onSave }) {
  const now = new Date()
  const hhmm = (dt) => `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`
  const [g, set] = useState({ from: todayISO(), fromT: hhmm(new Date(now - 3600000)), toT: hhmm(now), found: '', note: '' })
  const up = (k) => (e) => set({ ...g, [k]: e.target.value })
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ ...g, id: uid() }) }}>
      <Field label="Dato"><input className="input" type="date" value={g.from} onChange={up('from')} /></Field>
      <div className="row">
        <Field label="Sist jeg husker"><input className="input" type="time" value={g.fromT} onChange={up('fromT')} /></Field>
        <Field label="Kom tilbake"><input className="input" type="time" value={g.toT} onChange={up('toT')} /></Field>
      </div>
      <Field label="Spor jeg fant (kjøp i bank-appen, meldinger, pakker, notater …)"><textarea className="input" value={g.found} onChange={up('found')} /></Field>
      <Field label="Hvordan har jeg det nå?"><input className="input" value={g.note} onChange={up('note')} /></Field>
      <button className="btn block">Lagre</button>
    </form>
  )
}

function Board({ d, part, update, current }) {
  const [text, setText] = useState('')
  const [from, setFrom] = useState(current?.partId && current.partId !== '?' ? current.partId : d.parts[0].id)
  return (
    <>
      <form className="card" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; update((x) => ({ ...x, board: [{ id: uid(), partId: from, text: text.trim(), at: Date.now() }, ...x.board] })); setText('') }}>
        <h2>Beskjed til de andre</h2>
        <div className="row wrap" style={{ marginBottom: 8 }}>{d.parts.map((p) => <button type="button" key={p.id} className={'chip' + (from === p.id ? '' : ' off')} onClick={() => setFrom(p.id)}>{p.emoji} {p.name}</button>)}</div>
        <textarea className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="«Ikke kjøp mer Lego denne måneden ❤️» · «Legetime torsdag kl 10»" />
        <button className="btn block" style={{ marginTop: 10 }}>📌 Fest på tavla</button>
      </form>
      {d.board.map((m) => (
        <div key={m.id} className="card" style={{ borderLeft: `5px solid ${part(m.partId).color}` }}>
          <div className="row small muted"><span className="grow">{part(m.partId).emoji} {part(m.partId).name} · {fmtDate(m.at)} {fmtTime(m.at)}</span>
            <button className="iconbtn" aria-label="Fjern" onClick={() => update((x) => ({ ...x, board: x.board.filter((y) => y.id !== m.id) }))}>✓</button></div>
          <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{m.text}</p>
        </div>
      ))}
    </>
  )
}

function Settings({ d, update, v, showToast }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [pin, setPin] = useState('')
  return (
    <>
      <div className="card">
        <h2>Deler / alters</h2>
        <ul className="list">{d.parts.map((p) => (
          <li key={p.id} className="row">
            <span style={{ fontSize: 22 }}>{p.emoji}</span>
            <input className="input grow" value={p.name} onChange={(e) => update((x) => ({ ...x, parts: x.parts.map((y) => (y.id === p.id ? { ...y, name: e.target.value } : y)) }))} />
            <input type="color" value={p.color} onChange={(e) => update((x) => ({ ...x, parts: x.parts.map((y) => (y.id === p.id ? { ...y, color: e.target.value } : y)) }))} style={{ width: 40, height: 40, border: 0, background: 'none' }} />
            {d.parts.length > 1 && <button className="iconbtn" aria-label="Fjern" onClick={() => update((x) => ({ ...x, parts: x.parts.filter((y) => y.id !== p.id) }))}>✕</button>}
          </li>
        ))}</ul>
        <form className="row" style={{ marginTop: 10 }} onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; update((x) => ({ ...x, parts: [...x.parts, { id: uid(), name: name.trim(), emoji: emoji || '🙂', color: COLORS[x.parts.length % COLORS.length] }] })); setName(''); setEmoji('') }}>
          <input className="input" style={{ width: 64, textAlign: 'center' }} value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🙂" />
          <input className="input grow" value={name} onChange={(e) => setName(e.target.value)} placeholder="Navn (eller «Lille», «Beskytter» …)" />
          <button className="btn ghost">+</button>
        </form>
      </div>
      <div className="card">
        <h2>PIN-lås med kryptering</h2>
        <p className="muted small" style={{ marginTop: 0 }}>{v.hasPin() ? 'Dataene er kryptert. Glemmer du PIN-en kan ingen – heller ikke vi – få dem tilbake.' : 'Uten PIN ligger loggen i klartekst på telefonen.'}</p>
        <form className="row" onSubmit={async (e) => { e.preventDefault(); if (pin.length < 4) return showToast('Minst 4 tegn'); await v.setPin(pin); setPin(''); showToast('🔒 Kryptert') }}>
          <input className="input grow" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder={v.hasPin() ? 'Ny PIN' : 'Velg PIN'} />
          <button className="btn">{v.hasPin() ? 'Bytt' : 'Sett'}</button>
        </form>
        {v.hasPin() && <button className="btn ghost block" style={{ marginTop: 10 }} onClick={async () => { await v.setPin(null); showToast('PIN fjernet') }}>Fjern PIN</button>}
      </div>
      <BackupCard app={APP} toast={showToast} />
      <div className="card small">
        <h2>Når det blir for mye</h2>
        <p style={{ margin: 0 }}>Mental Helse hjelpetelefon: <a href="tel:116123">116 123</a> (døgnåpen) · Legevakt: <a href="tel:116117">116 117</a> · Akutt fare: <a href="tel:113">113</a></p>
      </div>
    </>
  )
}

boot(App)
