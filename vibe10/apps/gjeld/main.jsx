import { useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast } from '../../shared/store.js'
import { Shell, Sheet, Field, Seg, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { kr, num, fmtMonth, fmtDate, addMonths, todayISO } from '../../shared/format.js'

const APP = 'gjeld'
const TYPES = ['Klarna / delbetaling', 'Kredittkort', 'Forbrukslån', 'Inkasso', 'Billån', 'Studielån', 'Privat', 'Annet']

// Måned-for-måned simulering. Fast månedlig budsjett = sum minstebeløp + ekstra.
// Minstebeløp betales på alt; resten går til målgjelda (snøball: minst saldo, skred: høyest rente).
// Når en gjeld er nedbetalt, ruller minstebeløpet videre i budsjettet.
export function simulate(debts, extra, strategy) {
  let list = debts.filter((d) => num(d.balance) > 0).map((d) => ({ id: d.id, name: d.name, bal: num(d.balance), rate: num(d.rate), min: num(d.min) }))
  const budget = list.reduce((t, d) => t + d.min, 0) + num(extra)
  const order = []
  const curve = [list.reduce((t, d) => t + d.bal, 0)]
  let interest = 0
  let month = 0
  while (list.length && month < 600) {
    month++
    for (const d of list) { const i = d.bal * (d.rate / 100 / 12); d.bal += i; interest += i }
    let pool = budget
    for (const d of list) { const p = Math.min(d.min, d.bal); d.bal -= p; pool -= p }
    const sorted = [...list].sort(strategy === 'snowball' ? (a, b) => a.bal - b.bal : (a, b) => b.rate - a.rate || a.bal - b.bal)
    for (const d of sorted) { if (pool <= 0) break; const p = Math.min(pool, d.bal); d.bal -= p; pool -= p }
    for (const d of list) if (d.bal < 0.5) order.push({ ...d, month })
    list = list.filter((d) => d.bal >= 0.5)
    curve.push(list.reduce((t, d) => t + d.bal, 0))
    if (month > 24 && curve[month] >= curve[month - 12]) return { never: true, budget, curve }
  }
  return { never: list.length > 0, months: month, interest, order, budget, curve }
}

function App() {
  const [debts, setDebts] = useLocal(APP, 'debts', [])
  const [extra, setExtra] = useLocal(APP, 'extra', 500)
  const [strategy, setStrategy] = useLocal(APP, 'strategy', 'snowball')
  const [log, setLog] = useLocal(APP, 'log', [])
  const [tab, setTab] = useState('plan')
  const [edit, setEdit] = useState(null)
  const [pay, setPay] = useState(null)
  const [toast, showToast] = useToast()

  const total = debts.reduce((t, d) => t + num(d.balance), 0)
  const plan = useMemo(() => simulate(debts, extra, strategy), [debts, extra, strategy])
  const other = useMemo(() => simulate(debts, extra, strategy === 'snowball' ? 'avalanche' : 'snowball'), [debts, extra, strategy])
  const zero = useMemo(() => simulate(debts, 0, strategy), [debts, strategy])
  const paidTotal = log.reduce((t, l) => t + num(l.amount), 0)

  const save = (d) => { setDebts((xs) => (xs.some((x) => x.id === d.id) ? xs.map((x) => (x.id === d.id ? d : x)) : [...xs, d])); setEdit(null) }
  const registerPayment = (d, amount) => {
    const a = num(amount)
    if (a <= 0) return
    setDebts((xs) => xs.map((x) => (x.id === d.id ? { ...x, balance: Math.max(0, num(x.balance) - a) } : x)))
    setLog((l) => [{ id: uid(), debt: d.name, amount: a, date: todayISO() }, ...l])
    setPay(null)
    showToast(num(d.balance) - a <= 0 ? `🎉 ${d.name} er NEDBETALT` : `−${kr(a)} på ${d.name}`)
  }

  return (
    <Shell
      title="Gjeldsradar" glyph="📉" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'plan', icon: '🎯', label: 'Plan' }, { id: 'debts', icon: '📋', label: 'Gjeld' }, { id: 'log', icon: '✅', label: 'Betalt' }, { id: 'set', icon: '⚙️', label: 'Data' }]}
      action={<button className="btn sm" onClick={() => setEdit({ id: uid(), name: '', type: TYPES[0], balance: '', rate: '', min: '' })}>+ Gjeld</button>}
    >
      {tab === 'plan' && (debts.length === 0 ? (
        <Empty icon="📉" title="Legg inn første gjeld">Klarna-kjøpet, kredittkortet, inkassosaken. Ærlige tall gir ærlig dato.</Empty>
      ) : (
        <>
          <div className="stats">
            <Stat hero value={plan.never ? 'Aldri 😬' : fmtMonth(addMonths(new Date(), plan.months))} label={plan.never ? 'renta spiser betalingen – øk beløpet' : `gjeldsfri om ${plan.months} mnd`} />
            <Stat value={kr(total)} label="total gjeld nå" />
            <Stat value={plan.never ? '∞' : kr(plan.interest)} label="renter du betaler totalt" />
            <Stat value={kr(plan.budget)} label="betaler per måned" />
          </div>

          <div className="card">
            <h2>Ekstra per måned utover minstebeløp</h2>
            <input type="range" min="0" max="10000" step="100" value={num(extra)} onChange={(e) => setExtra(e.target.value)} style={{ width: '100%', accentColor: 'var(--accent)' }} />
            <div className="row"><b className="grow">{kr(extra)}</b>
              {!zero.never && !plan.never && zero.months > plan.months && (
                <span className="chip ok">{zero.months - plan.months} mnd raskere · {kr(zero.interest - plan.interest)} spart</span>
              )}
            </div>
          </div>

          <div className="card">
            <h2>Strategi</h2>
            <Seg value={strategy} onChange={setStrategy} options={[['snowball', '⛄ Snøball'], ['avalanche', '🏔 Skred']]} />
            <p className="muted small">
              {strategy === 'snowball' ? 'Minst saldo først. Raske seire, mer motivasjon.' : 'Høyest rente først. Matematisk billigst.'}{' '}
              {!other.never && !plan.never && Math.abs(other.interest - plan.interest) > 1 && (
                <>Den andre strategien {other.interest < plan.interest ? 'sparer' : 'koster'} <b>{kr(Math.abs(other.interest - plan.interest))}</b> {other.interest < plan.interest ? 'mer' : 'ekstra'}.</>
              )}
            </p>
          </div>

          {!plan.never && <Curve curve={plan.curve} />}

          {!plan.never && (
            <div className="card">
              <h2>Rekkefølge</h2>
              <ol className="list">
                {plan.order.map((d, i) => (
                  <li key={d.id} className="row">
                    <span className="chip">{i + 1}</span>
                    <span className="grow">{d.name}</span>
                    <span className="muted small">{fmtMonth(addMonths(new Date(), d.month))}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="card small muted">
            Trenger du hjelp? NAV har gratis økonomisk rådgivning: <a href="tel:55553339">55 55 33 39</a>. Se også
            hele gjelda di samlet i <a href="https://www.gjeldsregisteret.com" target="_blank" rel="noreferrer">Gjeldsregisteret</a> (usikret gjeld).
          </div>
        </>
      ))}

      {tab === 'debts' && (debts.length === 0 ? <Empty icon="📋" title="Ingen gjeld lagt inn">Trykk «+ Gjeld» oppe til høyre.</Empty> : (
        <div className="card"><ul className="list">
          {debts.map((d) => {
            const pct = d.start ? Math.min(100, (1 - num(d.balance) / num(d.start)) * 100) : 0
            return (
              <li key={d.id}>
                <div className="row">
                  <span className="grow" onClick={() => setEdit(d)} style={{ cursor: 'pointer' }}>
                    <b>{d.name}</b> {num(d.balance) <= 0 && <span className="chip ok">ferdig</span>}<br />
                    <span className="muted small">{d.type} · {num(d.rate)} % · min {kr(d.min)}/mnd</span>
                  </span>
                  <b>{kr(d.balance)}</b>
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <div className="bar grow"><i style={{ width: pct + '%' }} /></div>
                  {num(d.balance) > 0 && <button className="btn sm" onClick={() => setPay(d)}>Betal</button>}
                </div>
              </li>
            )
          })}
        </ul></div>
      ))}

      {tab === 'log' && (
        <>
          <div className="stats"><Stat hero value={kr(paidTotal)} label="nedbetalt så langt" /><Stat value={log.length} label="innbetalinger logget" /></div>
          {log.length === 0 ? <Empty icon="✅" title="Ingen innbetalinger ennå">Trykk «Betal» på en gjeld hver gang du betaler. Se saldoen krympe.</Empty> : (
            <div className="card"><ul className="list">
              {log.map((l) => <li key={l.id} className="row"><span className="grow">{l.debt}<br /><span className="muted small">{fmtDate(l.date)}</span></span><b>−{kr(l.amount)}</b></li>)}
            </ul></div>
          )}
        </>
      )}

      {tab === 'set' && <BackupCard app={APP} toast={showToast} />}

      <Sheet open={!!edit} title="Gjeld" onClose={() => setEdit(null)}>
        {edit && <DebtForm d={edit} onSave={save} onDelete={(d) => { setDebts((xs) => xs.filter((x) => x.id !== d.id)); setEdit(null) }} exists={debts.some((x) => x.id === edit.id)} />}
      </Sheet>
      <Sheet open={!!pay} title={pay ? `Betal på ${pay.name}` : ''} onClose={() => setPay(null)}>
        {pay && <PayForm d={pay} onPay={registerPayment} />}
      </Sheet>
    </Shell>
  )
}

function Curve({ curve }) {
  const max = curve[0] || 1
  const w = 300, h = 90
  const pts = curve.map((v, i) => `${(i / (curve.length - 1 || 1)) * w},${h - (v / max) * h}`).join(' ')
  return (
    <div className="card">
      <h2>Saldo over tid</h2>
      <svg viewBox={`0 0 ${w} ${h + 2}`} width="100%" height="100" preserveAspectRatio="none" role="img" aria-label="Gjeldskurve">
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill="var(--accent)" opacity="0.18" />
        <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="row muted small"><span className="grow">I dag · {kr(max)}</span><span>0 kr</span></div>
    </div>
  )
}

function DebtForm({ d: init, onSave, onDelete, exists }) {
  const [d, set] = useState(init)
  const up = (k) => (e) => set({ ...d, [k]: e.target.value })
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (d.name.trim()) onSave({ ...d, start: d.start || d.balance }) }}>
      <Field label="Navn"><input className="input" value={d.name} onChange={up('name')} placeholder="F.eks. Klarna – Lego" /></Field>
      <Field label="Type"><select className="input" value={d.type} onChange={up('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
      <div className="row">
        <Field label="Saldo (kr)"><input className="input" inputMode="decimal" value={d.balance} onChange={up('balance')} /></Field>
        <Field label="Effektiv rente %"><input className="input" inputMode="decimal" value={d.rate} onChange={up('rate')} /></Field>
      </div>
      <Field label="Minstebeløp per måned (kr)"><input className="input" inputMode="decimal" value={d.min} onChange={up('min')} /></Field>
      <p className="muted small">Tips: Kredittkort ligger ofte på 20–30 % effektiv rente. Står det i avtalen eller nettbanken.</p>
      <div className="stack">
        <button className="btn block">Lagre</button>
        {exists && <button type="button" className="btn ghost block" onClick={() => onDelete(d)}>Slett</button>}
      </div>
    </form>
  )
}

function PayForm({ d, onPay }) {
  const [a, setA] = useState(String(num(d.min) || ''))
  return (
    <form onSubmit={(e) => { e.preventDefault(); onPay(d, a) }}>
      <Field label={`Beløp (saldo ${kr(d.balance)})`}><input className="input" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} autoFocus /></Field>
      <button className="btn block">Registrer betaling</button>
    </form>
  )
}

boot(App)
