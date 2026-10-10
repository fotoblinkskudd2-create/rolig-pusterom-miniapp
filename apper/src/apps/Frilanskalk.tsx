import { useState } from 'react'
import { NumRow, Row, Screen, Section, StepperRow, TabBar, ToggleRow, kr, num, useStore } from '../kit'

type In = { net: number; tax: number; pension: number; expMonth: number; vacation: number; holidays: number; sick: number; hours: number; billable: number }

/** Fra ønsket netto til nødvendig timepris for et enkeltpersonforetak. Forenklet: én samlet sats for skatt og trygdeavgift. */
export function rateFor(v: In) {
  const profit = v.net / (1 - v.tax / 100)
  const pension = profit * (v.pension / 100)
  const expenses = v.expMonth * 12
  const revenue = profit + pension + expenses
  const weeks = Math.max(0, 52 - v.vacation - v.holidays / 5 - v.sick / 5)
  const hours = weeks * v.hours * (v.billable / 100)
  return { profit, pension, expenses, revenue, hours, weeks, rate: hours > 0 ? revenue / hours : 0, taxAmt: profit - v.net }
}

export default function Frilanskalk() {
  const [tab, setTab] = useState<'rate' | 'invoice'>('rate')
  const [v, setV] = useStore<In>('frilans:input', { net: 520000, tax: 33, pension: 5, expMonth: 4000, vacation: 5, holidays: 10, sick: 10, hours: 37.5, billable: 65 })
  const [inv, setInv] = useStore('frilans:invoice', { amount: 25000, mva: true })
  const set = (p: Partial<In>) => setV({ ...v, ...p })
  const r = rateFor(v)
  const parts = [
    { l: 'Deg (netto)', n: v.net, c: 'var(--tint)' },
    { l: 'Skatt + trygd', n: r.taxAmt, c: '#ff9f0a' },
    { l: 'Pensjon', n: r.pension, c: '#5e5ce6' },
    { l: 'Utgifter', n: r.expenses, c: '#8e8e93' },
  ]
  const mva = inv.mva ? inv.amount * 0.25 : 0
  const taxSet = inv.amount * (v.tax / 100)

  return (
    <>
      {tab === 'rate' && (
        <Screen title="Timepris">
          <div className="card center">
            <div className="stat-l">Du må ta</div>
            <div className="big-num">{kr(Math.ceil(r.rate / 10) * 10)}</div>
            <div className="muted">per time, eks. mva</div>
            <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', margin: '16px 0 8px' }}>
              {parts.map((p) => <div key={p.l} style={{ width: `${(p.n / r.revenue) * 100}%`, background: p.c }} />)}
            </div>
            <div className="small" style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
              {parts.map((p) => <span key={p.l}><b style={{ color: p.c }}>■</b> {p.l} {num((p.n / r.revenue) * 100)} %</span>)}
            </div>
          </div>
          <div className="grid2">
            <div className="card"><div className="stat-l">Omsetning/år</div><div className="mid-num" style={{ fontSize: 22 }}>{kr(r.revenue)}</div></div>
            <div className="card"><div className="stat-l">Fakturerbare timer</div><div className="mid-num" style={{ fontSize: 22 }}>{num(r.hours)}</div></div>
          </div>
          <Section header="Mål">
            <NumRow label="Ønsket netto per år" value={v.net} onChange={(n) => set({ net: n })} suffix="kr" />
            <NumRow label="Skatt + trygdeavgift" value={v.tax} onChange={(n) => set({ tax: n })} suffix="%" />
            <NumRow label="Pensjon (av overskudd)" value={v.pension} onChange={(n) => set({ pension: n })} suffix="%" />
            <NumRow label="Utgifter per måned" value={v.expMonth} onChange={(n) => set({ expMonth: n })} suffix="kr" />
          </Section>
          <Section header="Tid" footer={`${num(r.weeks, 1)} arbeidsuker i året etter ferie, helligdager og sykdom.`}>
            <StepperRow label="Ferieuker" value={v.vacation} onChange={(n) => set({ vacation: n })} min={0} max={12} />
            <StepperRow label="Helligdager" value={v.holidays} onChange={(n) => set({ holidays: n })} min={0} max={20} fmt={(n) => `${n} d`} />
            <StepperRow label="Sykedager" value={v.sick} onChange={(n) => set({ sick: n })} min={0} max={60} fmt={(n) => `${n} d`} />
            <StepperRow label="Timer per uke" value={v.hours} onChange={(n) => set({ hours: n })} step={2.5} min={5} max={60} fmt={(n) => num(n, 1)} />
          </Section>
          <Section header="Fakturerbar andel" footer="Salg, admin, regnskap og venting er ikke fakturerbart. 60–70 % er realistisk for mange.">
            <div className="row" style={{ display: 'block' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Andel</span><b>{v.billable} %</b></div>
              <input type="range" min={20} max={100} step={5} value={v.billable} onChange={(e) => set({ billable: +e.target.value })} aria-label="Fakturerbar andel" />
            </div>
          </Section>
          <p className="pad small muted">Forenklet. Skatt og trygdeavgift for enkeltpersonforetak avhenger av inntekt, fradrag og årets satser. Snakk med en regnskapsfører før du setter prisen.</p>
        </Screen>
      )}

      {tab === 'invoice' && (
        <Screen title="Faktura" subtitle="Hvor mye av hver faktura er egentlig ditt?">
          <Section>
            <NumRow label="Beløp eks. mva" value={inv.amount} onChange={(n) => setInv({ ...inv, amount: n })} suffix="kr" />
            <ToggleRow label="MVA-registrert (25 %)" detail="Påkrevd når omsetningen passerer 50 000 kr på 12 måneder" checked={inv.mva} onChange={(b) => setInv({ ...inv, mva: b })} />
          </Section>
          <div className="card center"><div className="stat-l">Kunden betaler</div><div className="big-num" style={{ fontSize: 44 }}>{kr(inv.amount + mva)}</div></div>
          <div style={{ display: 'grid', gridTemplateColumns: inv.mva ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, margin: '0 16px 16px' }}>
            {inv.mva && <div className="card" style={{ margin: 0 }}><div className="stat-l">MVA</div><div className="mid-num" style={{ fontSize: 20 }}>{kr(mva)}</div></div>}
            <div className="card" style={{ margin: 0 }}><div className="stat-l">Skatt</div><div className="mid-num" style={{ fontSize: 20, color: 'var(--orange)' }}>{kr(taxSet)}</div></div>
            <div className="card" style={{ margin: 0 }}><div className="stat-l">Til deg</div><div className="mid-num" style={{ fontSize: 20, color: 'var(--tint)' }}>{kr(inv.amount - taxSet)}</div></div>
          </div>
          <Section footer={`Sett av ${kr(mva + taxSet)} på en egen konto med en gang betalingen kommer. Skattesatsen (${v.tax} %) endrer du under Timepris.`}>
            <Row label="Sett av totalt" value={<b style={{ color: 'var(--label)' }}>{kr(mva + taxSet)}</b>} />
          </Section>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'rate', label: 'Timepris', icon: '⏱️' }, { id: 'invoice', label: 'Faktura', icon: '🧾' }]} />
    </>
  )
}
