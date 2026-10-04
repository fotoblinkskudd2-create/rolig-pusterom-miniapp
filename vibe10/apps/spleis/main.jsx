import { useEffect, useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast, copyText } from '../../shared/store.js'
import { Shell, Sheet, Field, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { kr, kr2, num, fmtDate, todayISO } from '../../shared/format.js'

// Smutthullet: ingen server, ingen konto – hele regnskapet komprimeres inn i selve lenka (#g=…).
// Send lenka på Messenger/SMS, mottakeren åpner den og har samme oversikt.
const APP = 'spleis'

async function pack(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let out = bytes
  if ('CompressionStream' in window) {
    const s = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    out = new Uint8Array(await new Response(s).arrayBuffer())
  }
  let bin = ''; out.forEach((b) => { bin += String.fromCharCode(b) })
  return ('CompressionStream' in window ? 'z' : 'j') + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function unpack(str) {
  const kind = str[0]
  const b64 = str.slice(1).replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  if (kind === 'j') return JSON.parse(new TextDecoder().decode(bytes))
  const s = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  return JSON.parse(await new Response(s).text())
}

// Hvem skylder hvem: saldo per person, så grådig matching av største skyldner mot største kreditor.
export function settle(group) {
  const bal = Object.fromEntries(group.people.map((p) => [p, 0]))
  for (const e of group.expenses) {
    const share = num(e.amount) / (e.split.length || 1)
    bal[e.paidBy] = (bal[e.paidBy] || 0) + num(e.amount)
    for (const p of e.split) bal[p] = (bal[p] || 0) - share
  }
  const debt = Object.entries(bal).filter(([, v]) => v < -0.5).map(([p, v]) => [p, -v]).sort((a, b) => b[1] - a[1])
  const cred = Object.entries(bal).filter(([, v]) => v > 0.5).sort((a, b) => b[1] - a[1])
  const moves = []
  let i = 0, j = 0
  while (i < debt.length && j < cred.length) {
    const amt = Math.min(debt[i][1], cred[j][1])
    moves.push({ from: debt[i][0], to: cred[j][0], amount: Math.round(amt) })
    debt[i][1] -= amt; cred[j][1] -= amt
    if (debt[i][1] < 0.5) i++
    if (cred[j][1] < 0.5) j++
  }
  return { bal, moves }
}

function App() {
  const [groups, setGroups] = useLocal(APP, 'groups', [])
  const [openId, setOpenId] = useState(null)
  const [incoming, setIncoming] = useState(null)
  const [newGroup, setNewGroup] = useState(false)
  const [tab, setTab] = useState('groups')
  const [toast, showToast] = useToast()

  useEffect(() => {
    const m = location.hash.match(/#g=(.+)/)
    if (m) unpack(m[1]).then(setIncoming).catch(() => showToast('Ugyldig spleiselenke'))
  }, [showToast])

  const group = groups.find((g) => g.id === openId)
  const upsert = (g) => setGroups((xs) => (xs.some((x) => x.id === g.id) ? xs.map((x) => (x.id === g.id ? g : x)) : [g, ...xs]))
  const acceptIncoming = () => {
    upsert({ ...incoming, updated: Date.now() }); setOpenId(incoming.id); setIncoming(null)
    history.replaceState(null, '', location.pathname)
  }

  if (group) return <GroupView g={group} onChange={upsert} onBack={() => setOpenId(null)} onDelete={() => { setGroups((xs) => xs.filter((x) => x.id !== group.id)); setOpenId(null) }} />

  return (
    <Shell
      title="Spleiselapp" glyph="🍕" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'groups', icon: '🍕', label: 'Spleiser' }, { id: 'data', icon: '💾', label: 'Data' }]}
      action={<button className="btn sm" onClick={() => setNewGroup(true)}>+ Ny</button>}
    >
      {tab === 'groups' && (groups.length === 0 ? (
        <Empty icon="🍕" title="Ingen spleiser">Hyttetur, middag, felles husleie. Lag en, legg inn utlegg, send lenka. Ingen trenger appen eller konto.</Empty>
      ) : (
        <div className="card"><ul className="list">
          {groups.map((g) => {
            const total = g.expenses.reduce((t, e) => t + num(e.amount), 0)
            return (
              <li key={g.id} className="row" onClick={() => setOpenId(g.id)} style={{ cursor: 'pointer' }}>
                <span className="grow"><b>{g.title}</b><br /><span className="muted small">{g.people.join(', ')}</span></span>
                <b>{kr(total)}</b>
              </li>
            )
          })}
        </ul></div>
      ))}
      {tab === 'data' && <BackupCard app={APP} toast={showToast} />}

      <Sheet open={newGroup} title="Ny spleis" onClose={() => setNewGroup(false)}>
        {newGroup && <NewGroup onCreate={(g) => { upsert(g); setNewGroup(false); setOpenId(g.id) }} />}
      </Sheet>
      <Sheet open={!!incoming} title="Spleis delt med deg" onClose={() => setIncoming(null)}>
        {incoming && (
          <>
            <p><b>{incoming.title}</b> · {incoming.people.join(', ')} · {incoming.expenses.length} utlegg</p>
            {groups.some((g) => g.id === incoming.id) && <p className="muted small">Du har denne fra før. Versjonen i lenka erstatter din.</p>}
            <button className="btn block" onClick={acceptIncoming}>Åpne og lagre</button>
          </>
        )}
      </Sheet>
    </Shell>
  )
}

function NewGroup({ onCreate }) {
  const [title, setTitle] = useState('')
  const [people, setPeople] = useState('')
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const ps = [...new Set(people.split(/[,\n]/).map((p) => p.trim()).filter(Boolean))]
      if (!title.trim() || ps.length < 2) return
      onCreate({ id: uid(), title: title.trim(), people: ps, expenses: [], updated: Date.now() })
    }}>
      <Field label="Navn på spleisen"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hyttetur Hemsedal" autoFocus /></Field>
      <Field label="Hvem er med? (skill med komma)"><input className="input" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Meg, Ola, Kari, Ali" /></Field>
      <button className="btn block">Lag spleis</button>
    </form>
  )
}

function GroupView({ g, onChange, onBack, onDelete }) {
  const [tab, setTab] = useState('exp')
  const [adding, setAdding] = useState(false)
  const [toast, showToast] = useToast()
  const { bal, moves } = useMemo(() => settle(g), [g])
  const total = g.expenses.reduce((t, e) => t + num(e.amount), 0)

  const share = async () => {
    const url = `${location.origin}${location.pathname}#g=${await pack(g)}`
    const text = `${g.title}: åpne for å se hvem som skylder hva`
    if (navigator.share) { try { await navigator.share({ title: g.title, text, url }); return } catch (e) { if (e.name === 'AbortError') return } }
    await copyText(url); showToast('Lenke kopiert – lim inn i chatten')
  }
  const addExpense = (e) => { onChange({ ...g, expenses: [e, ...g.expenses], updated: Date.now() }); setAdding(false) }

  return (
    <Shell
      title={g.title} glyph="🍕" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'exp', icon: '🧾', label: 'Utlegg' }, { id: 'settle', icon: '🤝', label: 'Gjør opp' }, { id: 'more', icon: '⋯', label: 'Mer' }]}
      action={<><button className="iconbtn" onClick={onBack} aria-label="Tilbake">‹</button><button className="btn sm" onClick={() => setAdding(true)}>+ Utlegg</button></>}
    >
      {tab === 'exp' && (
        <>
          <div className="stats"><Stat hero value={kr(total)} label={`totalt · ${kr(total / g.people.length)} per person`} /><Stat value={moves.length} label="overføringer for å gjøre opp" /></div>
          <button className="btn ghost block" style={{ marginBottom: 12 }} onClick={share}>🔗 Del med gruppa</button>
          {g.expenses.length === 0 ? <Empty icon="🧾" title="Ingen utlegg ennå">Hvem betalte maten? Legg det inn.</Empty> : (
            <div className="card"><ul className="list">
              {g.expenses.map((e) => (
                <li key={e.id} className="row">
                  <span className="grow"><b>{e.desc}</b><br /><span className="muted small">{e.paidBy} betalte · delt på {e.split.length === g.people.length ? 'alle' : e.split.join(', ')} · {fmtDate(e.date)}</span></span>
                  <b>{kr(e.amount)}</b>
                  <button className="iconbtn" aria-label="Slett" onClick={() => onChange({ ...g, expenses: g.expenses.filter((x) => x.id !== e.id), updated: Date.now() })}>🗑</button>
                </li>
              ))}
            </ul></div>
          )}
        </>
      )}
      {tab === 'settle' && (
        <>
          <div className="card"><h2>Slik gjør dere opp</h2>
            {moves.length === 0 ? <p className="muted">Alle er skuls. 🎉</p> : (
              <ul className="list">{moves.map((m, i) => (
                <li key={i} className="row">
                  <span className="grow"><b>{m.from}</b> → <b>{m.to}</b></span><b>{kr(m.amount)}</b>
                  <button className="btn sm ghost" onClick={async () => { await copyText(`Hei ${m.from}! Du skylder ${m.to} ${m.amount} kr for «${g.title}». Vipps meg gjerne 🙏`); showToast('Melding kopiert') }}>💬</button>
                </li>
              ))}</ul>
            )}
          </div>
          <div className="card"><h2>Saldo</h2>
            <ul className="list">{Object.entries(bal).map(([p, v]) => (
              <li key={p} className="row"><span className="grow">{p}</span><b style={{ color: v > 0.5 ? 'var(--ok)' : v < -0.5 ? 'var(--danger)' : undefined }}>{v > 0 ? '+' : ''}{kr2(v)}</b></li>
            ))}</ul>
          </div>
          <button className="btn block" onClick={() => {
            if (!moves.length) return
            const exps = moves.map((m) => ({ id: uid(), desc: `Oppgjør ${m.from} → ${m.to}`, amount: m.amount, paidBy: m.from, split: [m.to], date: todayISO() }))
            onChange({ ...g, expenses: [...exps, ...g.expenses], updated: Date.now() }); showToast('Registrert som betalt')
          }} disabled={!moves.length}>✅ Marker alt som oppgjort</button>
        </>
      )}
      {tab === 'more' && (
        <>
          <div className="card"><h2>Deltakere</h2><p>{g.people.join(', ')}</p>
            <AddPerson onAdd={(p) => onChange({ ...g, people: [...g.people, p], updated: Date.now() })} existing={g.people} />
          </div>
          <button className="btn ghost block" onClick={onDelete}>Slett spleisen</button>
        </>
      )}
      <Sheet open={adding} title="Nytt utlegg" onClose={() => setAdding(false)}>{adding && <ExpenseForm people={g.people} onAdd={addExpense} />}</Sheet>
    </Shell>
  )
}

function AddPerson({ onAdd, existing }) {
  const [p, setP] = useState('')
  return (
    <form className="row" onSubmit={(e) => { e.preventDefault(); const n = p.trim(); if (n && !existing.includes(n)) { onAdd(n); setP('') } }}>
      <input className="input grow" value={p} onChange={(e) => setP(e.target.value)} placeholder="Legg til person" /><button className="btn ghost">+</button>
    </form>
  )
}

function ExpenseForm({ people, onAdd }) {
  const [f, set] = useState({ desc: '', amount: '', paidBy: people[0], split: people, date: todayISO() })
  const toggle = (p) => set({ ...f, split: f.split.includes(p) ? f.split.filter((x) => x !== p) : [...f.split, p] })
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!f.desc.trim() || num(f.amount) <= 0 || !f.split.length) return; onAdd({ ...f, id: uid(), amount: num(f.amount) }) }}>
      <Field label="Hva?"><input className="input" value={f.desc} onChange={(e) => set({ ...f, desc: e.target.value })} placeholder="Taco, bensin, Rema …" autoFocus /></Field>
      <Field label="Beløp (kr)"><input className="input" inputMode="decimal" value={f.amount} onChange={(e) => set({ ...f, amount: e.target.value })} /></Field>
      <Field label="Hvem betalte?"><div className="row wrap">{people.map((p) => <button type="button" key={p} className={'chip' + (f.paidBy === p ? '' : ' off')} onClick={() => set({ ...f, paidBy: p })}>{p}</button>)}</div></Field>
      <Field label={`Delt på (${f.split.length}) · ${f.split.length ? kr2(num(f.amount) / f.split.length) : '–'} hver`}>
        <div className="row wrap">{people.map((p) => <button type="button" key={p} className={'chip' + (f.split.includes(p) ? '' : ' off')} onClick={() => toggle(p)}>{p}</button>)}</div>
      </Field>
      <button className="btn block">Legg til</button>
    </form>
  )
}

boot(App)
