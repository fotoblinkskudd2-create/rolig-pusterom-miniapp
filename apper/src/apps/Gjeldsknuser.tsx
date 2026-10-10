import { useMemo, useRef, useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, NumRow, Row, Screen, Section, Seg, SelectRow, Sheet, TabBar,
  downloadText, fmtDate, kr, num, toast, uid, useNow, useStore,
} from '../kit'

type Debt = { id: string; name: string; type: string; balance: number; apr: number; minPay: number; fee: number }
type Payment = { id: string; debtId: string; amount: number; date: number }
type Strategy = 'snowball' | 'avalanche'

const TYPES = ['BNPL', 'Kredittkort', 'Forbrukslån', 'Inkasso', 'Billån', 'Studielån', 'Annet'].map((v) => ({ value: v, label: v }))

/** Daglig kostnad: rente + månedlige gebyrer fordelt per dag. */
const dailyCost = (d: Debt) => (d.balance * d.apr) / 100 / 365 + (d.fee * 12) / 365

/** Måned-for-måned simulering. Ekstra + frigjorte minimumsbeløp går til mål-gjelden. */
export function simulate(debts: Debt[], extra: number, strategy: Strategy) {
  const ds = debts.filter((d) => d.balance > 0).map((d) => ({ ...d }))
  const order: { id: string; name: string; month: number }[] = []
  let month = 0, totalInterest = 0
  const budget = ds.reduce((s, d) => s + d.minPay, 0) + extra
  while (ds.some((d) => d.balance > 0.5) && month < 600) {
    month++
    for (const d of ds) if (d.balance > 0) { const i = (d.balance * d.apr) / 1200 + d.fee; d.balance += i; totalInterest += i }
    let left = budget
    for (const d of ds) if (d.balance > 0) { const p = Math.min(d.minPay, d.balance, left); d.balance -= p; left -= p }
    const targets = ds.filter((d) => d.balance > 0).sort((a, b) => strategy === 'snowball' ? a.balance - b.balance : b.apr - a.apr)
    for (const t of targets) { if (left <= 0) break; const p = Math.min(left, t.balance); t.balance -= p; left -= p }
    for (const d of ds) if (d.balance <= 0.5 && !order.find((o) => o.id === d.id)) { d.balance = 0; order.push({ id: d.id, name: d.name, month }) }
  }
  return { months: month, totalInterest, order, never: month >= 600 }
}

function Taximeter({ perDay }: { perDay: number }) {
  const start = useRef(Date.now())
  const now = useNow(100)
  const spent = ((now - start.current) / 1000) * (perDay / 86400)
  return (
    <div className="card center" style={{ background: 'linear-gradient(160deg,#2a0d0d,#16181d)', color: '#fff' }}>
      <div className="small" style={{ opacity: .7, marginBottom: 6 }}>Renter siden du åpnet appen</div>
      <div className="big-num" style={{ color: '#ff6259', fontFamily: 'var(--mono)', fontSize: 40 }}>{spent.toFixed(4).replace('.', ',')} kr</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16 }}>
        <div><div className="mid-num" style={{ fontSize: 22 }}>{kr(perDay)}</div><div className="small" style={{ opacity: .7 }}>per døgn</div></div>
        <div><div className="mid-num" style={{ fontSize: 22 }}>{kr(perDay * 30.4)}</div><div className="small" style={{ opacity: .7 }}>per måned</div></div>
        <div><div className="mid-num" style={{ fontSize: 22 }}>{kr(perDay * 365)}</div><div className="small" style={{ opacity: .7 }}>per år</div></div>
      </div>
    </div>
  )
}

export default function Gjeldsknuser() {
  const [tab, setTab] = useState<'over' | 'plan' | 'logg'>('over')
  const [debts, setDebts] = useStore<Debt[]>('gjeld:debts', [])
  const [pays, setPays] = useStore<Payment[]>('gjeld:payments', [])
  const [extra, setExtra] = useStore('gjeld:extra', 500)
  const [strategy, setStrategy] = useStore<Strategy>('gjeld:strategy', 'snowball')
  const [edit, setEdit] = useState<Debt | null>(null)
  const [payFor, setPayFor] = useState<Debt | null>(null)
  const [payAmt, setPayAmt] = useState(0)

  const total = debts.reduce((s, d) => s + d.balance, 0)
  const perDay = debts.reduce((s, d) => s + dailyCost(d), 0)
  const plan = useMemo(() => simulate(debts, extra, strategy), [debts, extra, strategy])
  const other = useMemo(() => simulate(debts, extra, strategy === 'snowball' ? 'avalanche' : 'snowball'), [debts, extra, strategy])
  const freeDate = new Date(); freeDate.setMonth(freeDate.getMonth() + plan.months)
  const paid = pays.reduce((s, p) => s + p.amount, 0)

  const save = (d: Debt) => {
    setDebts((all) => all.some((x) => x.id === d.id) ? all.map((x) => x.id === d.id ? d : x) : [...all, d])
    setEdit(null); toast('Lagret')
  }
  const pay = () => {
    if (!payFor || payAmt <= 0) return
    setDebts((all) => all.map((d) => d.id === payFor.id ? { ...d, balance: Math.max(0, d.balance - payAmt) } : d))
    setPays((p) => [{ id: uid(), debtId: payFor.id, amount: payAmt, date: Date.now() }, ...p])
    toast(payFor.balance - payAmt <= 0 ? `💥 ${payFor.name} er knust!` : `Betalt ${kr(payAmt)}`)
    setPayFor(null)
  }
  const exportTxt = () => {
    const lines = ['GJELDSKNUSER – eksport ' + new Date().toLocaleString('nb-NO'), '', ...debts.map((d) => `${d.name} (${d.type}): ${kr(d.balance)} @ ${d.apr} %, min ${kr(d.minPay)}/mnd, gebyr ${kr(d.fee)}`),
      '', `Total: ${kr(total)} · Koster ${kr(perDay)} per døgn`, `Plan (${strategy === 'snowball' ? 'snøball' : 'skred'}, +${kr(extra)}/mnd): gjeldfri om ${plan.months} mnd`, '', 'Betalinger:',
      ...pays.map((p) => `${fmtDate(p.date, { dateStyle: 'short' })}  ${kr(p.amount)}  ${debts.find((d) => d.id === p.debtId)?.name ?? '(slettet)'}`)]
    downloadText('gjeldsknuser.txt', lines.join('\n'))
  }
  const blank = (): Debt => ({ id: uid(), name: '', type: 'BNPL', balance: 0, apr: 20, minPay: 300, fee: 0 })

  return (
    <>
      {tab === 'over' && (
        <Screen title="Gjeldsknuser" right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Legg til gjeld">＋</button>}>
          {debts.length === 0 ? (
            <Empty icon="🔨" title="Ingen gjeld registrert" text="Legg inn hver kreditor: Klarna, kortet, inkassoen. Alt blir på denne enheten.">
              <Btn onClick={() => setEdit(blank())}>Legg til første gjeld</Btn>
            </Empty>
          ) : (
            <>
              <Taximeter perDay={perDay} />
              <div className="grid2">
                <div className="card"><div className="stat-l">Total gjeld</div><div className="mid-num">{kr(total)}</div></div>
                <div className="card"><div className="stat-l">Nedbetalt</div><div className="mid-num" style={{ color: 'var(--green)' }}>{kr(paid)}</div></div>
              </div>
              <Section header="Kreditorer" footer="Trykk for å endre. «Betal» trekker fra saldoen og logger betalingen.">
                {[...debts].sort((a, b) => dailyCost(b) - dailyCost(a)).map((d) => (
                  <div className="row" key={d.id}>
                    <button className="row-main" style={{ background: 'none', border: 0, textAlign: 'left', padding: 0 }} onClick={() => setEdit(d)}>
                      <span className="row-label" style={{ textDecoration: d.balance <= 0 ? 'line-through' : undefined }}>{d.name || 'Uten navn'} <span className="tag">{d.type}</span></span>
                      <span className="row-detail">{kr(d.balance)} · {num(d.apr, 1)} % · {kr(dailyCost(d))}/døgn</span>
                    </button>
                    {d.balance > 0 ? <Btn small kind="tinted" onClick={() => { setPayFor(d); setPayAmt(d.minPay) }}>Betal</Btn> : <span>💥</span>}
                  </div>
                ))}
              </Section>
              <div className="btn-row"><Btn kind="gray" onClick={exportTxt}>Eksporter .txt</Btn></div>
            </>
          )}
        </Screen>
      )}

      {tab === 'plan' && (
        <Screen title="Plan">
          <Seg value={strategy} onChange={setStrategy} options={[{ value: 'snowball', label: 'Snøball (minst først)' }, { value: 'avalanche', label: 'Skred (høyest rente)' }]} />
          <Section header="Budsjett">
            <NumRow label="Ekstra per måned" value={extra} onChange={setExtra} suffix="kr" />
            <Row label="Sum minimum" value={kr(debts.reduce((s, d) => s + d.minPay, 0))} />
          </Section>
          {debts.length === 0 ? <Empty icon="🗓️" title="Ingen plan uten gjeld" text="Legg inn gjeld under Oversikt." /> : plan.never ? (
            <div className="card" style={{ color: 'var(--red)' }}><b>Gjelden blir aldri nedbetalt med dette budsjettet.</b> Rentene spiser minimumsbeløpet. Øk ekstrabeløpet eller forhandle renten.</div>
          ) : (
            <>
              <div className="card center">
                <div className="stat-l">Gjeldfri</div>
                <div className="big-num" style={{ fontSize: 44 }}>{fmtDate(freeDate, { month: 'long', year: 'numeric' })}</div>
                <div className="muted" style={{ marginTop: 6 }}>{plan.months} måneder · {kr(plan.totalInterest)} i renter og gebyrer</div>
                {Math.abs(other.totalInterest - plan.totalInterest) > 1 && (
                  <div className="small" style={{ marginTop: 10 }}>
                    {other.totalInterest < plan.totalInterest
                      ? <>Den andre metoden sparer deg <b>{kr(plan.totalInterest - other.totalInterest)}</b>.</>
                      : <>Denne metoden sparer <b>{kr(other.totalInterest - plan.totalInterest)}</b> mot den andre.</>}
                  </div>
                )}
              </div>
              <Section header="Rekkefølge">
                {plan.order.map((o, i) => {
                  const dt = new Date(); dt.setMonth(dt.getMonth() + o.month)
                  return <Row key={o.id} icon={String(i + 1)} label={o.name || 'Uten navn'} value={fmtDate(dt, { month: 'short', year: 'numeric' })} />
                })}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'logg' && (
        <Screen title="Betalinger">
          {pays.length === 0 ? <Empty icon="🧾" title="Ingen betalinger ennå" text="Trykk «Betal» på en kreditor." /> : (
            <Section header={`${pays.length} betalinger · ${kr(paid)}`}>
              {pays.map((p) => (
                <Row key={p.id} label={debts.find((d) => d.id === p.debtId)?.name ?? '(slettet)'} detail={fmtDate(p.date, { dateStyle: 'medium' })} value={kr(p.amount)} />
              ))}
            </Section>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'over', label: 'Oversikt', icon: '📊' }, { id: 'plan', label: 'Plan', icon: '🗓️' }, { id: 'logg', label: 'Logg', icon: '🧾' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={debts.some((d) => d.id === edit.id) ? 'Endre gjeld' : 'Ny gjeld'} action={{ label: 'Lagre', onClick: () => save(edit), disabled: !edit.name }}>
          <Section>
            <InputRow label="Navn" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} placeholder="Klarna, Visa …" />
            <SelectRow label="Type" value={edit.type} options={TYPES} onChange={(v) => setEdit({ ...edit, type: v })} />
          </Section>
          <Section footer="Effektiv rente står i avtalen eller i appen til kreditoren. Inkasso: bruk forsinkelsesrenten.">
            <NumRow label="Saldo" value={edit.balance} onChange={(n) => setEdit({ ...edit, balance: n })} suffix="kr" />
            <NumRow label="Rente (effektiv)" value={edit.apr} onChange={(n) => setEdit({ ...edit, apr: n })} suffix="%" />
            <NumRow label="Minimum per mnd" value={edit.minPay} onChange={(n) => setEdit({ ...edit, minPay: n })} suffix="kr" />
            <NumRow label="Gebyr per mnd" value={edit.fee} onChange={(n) => setEdit({ ...edit, fee: n })} suffix="kr" />
          </Section>
          {debts.some((d) => d.id === edit.id) && (
            <Section><ConfirmRow label="Slett gjeld" onConfirm={() => { setDebts((a) => a.filter((d) => d.id !== edit.id)); setEdit(null) }} /></Section>
          )}
        </Sheet>
      )}
      {payFor && (
        <Sheet open onClose={() => setPayFor(null)} title={`Betal ${payFor.name}`} action={{ label: 'Betal', onClick: pay, disabled: payAmt <= 0 }}>
          <Section footer={`Saldo etter: ${kr(Math.max(0, payFor.balance - payAmt))}`}>
            <NumRow label="Beløp" value={payAmt} onChange={setPayAmt} suffix="kr" />
          </Section>
          <div className="btn-row"><Btn kind="tinted" onClick={() => setPayAmt(payFor.balance)}>Betal alt ({kr(payFor.balance)})</Btn></div>
        </Sheet>
      )}
    </>
  )
}
