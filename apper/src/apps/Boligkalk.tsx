import { useMemo, useState } from 'react'
import { NumRow, Row, Screen, Section, Seg, TabBar, ToggleRow, kr, num, useStore } from '../kit'

type Type = 'annuitet' | 'serie'
type In = { price: number; equity: number; rate: number; years: number; type: Type; income: number; otherDebt: number; netMonth: number; living: number; stress: number; eqReq: number; incMult: number; selveier: boolean; fees: number }

/** Månedlig nedbetalingsplan. Returnerer per måned [rente, avdrag]. */
export function schedule(loan: number, ratePct: number, years: number, type: Type) {
  const n = Math.max(1, Math.round(years * 12)), r = ratePct / 1200
  const rows: [number, number][] = []
  let bal = loan
  const ann = r === 0 ? loan / n : (loan * r) / (1 - Math.pow(1 + r, -n))
  for (let i = 0; i < n && bal > 0.01; i++) {
    const interest = bal * r
    const principal = type === 'annuitet' ? Math.min(bal, ann - interest) : Math.min(bal, loan / n)
    rows.push([interest, principal]); bal -= principal
  }
  return rows
}
const ok = (b: boolean) => <span className="tag" style={b ? { background: 'color-mix(in srgb, var(--green) 18%, transparent)', color: 'var(--green)' } : { background: 'color-mix(in srgb, var(--red) 15%, transparent)', color: 'var(--red)' }}>{b ? 'OK' : 'Ikke OK'}</span>

export default function Boligkalk() {
  const [tab, setTab] = useState<'loan' | 'req' | 'buy'>('loan')
  const [v, setV] = useStore<In>('bolig:input', { price: 4200000, equity: 600000, rate: 5.2, years: 30, type: 'annuitet', income: 750000, otherDebt: 0, netMonth: 46000, living: 16000, stress: 3, eqReq: 10, incMult: 5, selveier: true, fees: 1170 })
  const set = (p: Partial<In>) => setV({ ...v, ...p })
  const loan = Math.max(0, v.price - v.equity)
  const rows = useMemo(() => schedule(loan, v.rate, v.years, v.type), [loan, v.rate, v.years, v.type])
  const stressRows = useMemo(() => schedule(loan, v.rate + v.stress, v.years, v.type), [loan, v.rate, v.stress, v.years, v.type])
  const first = rows[0] ?? [0, 0], firstPay = first[0] + first[1]
  const totalInterest = rows.reduce((s, r) => s + r[0], 0)
  const stressPay = (stressRows[0]?.[0] ?? 0) + (stressRows[0]?.[1] ?? 0)
  const years = Array.from({ length: Math.ceil(rows.length / 12) }, (_, y) => rows.slice(y * 12, y * 12 + 12).reduce((a, r) => [a[0] + r[0], a[1] + r[1]], [0, 0]))
  const maxY = Math.max(1, ...years.map((y) => y[0] + y[1]))

  const eqPct = v.price ? (v.equity / v.price) * 100 : 0
  const debtRatio = v.income ? (loan + v.otherDebt) / v.income : 0
  const leftAfterStress = v.netMonth - v.living - stressPay
  const docFee = v.selveier ? v.price * 0.025 : 0
  const cash = v.equity + docFee + v.fees

  return (
    <>
      {tab === 'loan' && (
        <Screen title="Lån">
          <Section>
            <NumRow label="Kjøpesum" value={v.price} onChange={(n) => set({ price: n })} suffix="kr" />
            <NumRow label="Egenkapital" value={v.equity} onChange={(n) => set({ equity: n })} suffix="kr" />
            <NumRow label="Nominell rente" value={v.rate} onChange={(n) => set({ rate: n })} suffix="%" />
            <NumRow label="Løpetid" value={v.years} onChange={(n) => set({ years: n })} suffix="år" />
          </Section>
          <Seg value={v.type} onChange={(t) => set({ type: t })} options={[{ value: 'annuitet', label: 'Annuitet' }, { value: 'serie', label: 'Serie' }]} />
          <div className="card center">
            <div className="stat-l">{v.type === 'annuitet' ? 'Per måned (fast)' : 'Første måned (synker)'}</div>
            <div className="big-num" style={{ fontSize: 46 }}>{kr(firstPay)}</div>
            <div className="muted small">Lån {kr(loan)} · totalt {kr(totalInterest)} i renter</div>
          </div>
          <div className="card">
            <div className="stat-l">Renter og avdrag per år</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
              {years.map((y, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }} title={`År ${i + 1}: renter ${kr(y[0])}, avdrag ${kr(y[1])}`}>
                  <div style={{ height: `${(y[0] / maxY) * 100}%`, background: 'var(--orange)', borderRadius: '2px 2px 0 0' }} />
                  <div style={{ height: `${(y[1] / maxY) * 100}%`, background: 'var(--tint)' }} />
                </div>
              ))}
            </div>
            <div className="small muted" style={{ display: 'flex', gap: 14, marginTop: 8 }}><span><b style={{ color: 'var(--orange)' }}>■</b> renter</span><span><b style={{ color: 'var(--tint)' }}>■</b> avdrag</span><span style={{ marginLeft: 'auto' }}>{years.length} år</span></div>
          </div>
          {v.type === 'annuitet' && (
            <Section footer="Serielån gir høyere beløp i starten, men lavere totale renter.">
              <Row label="Totale renter med serielån" value={kr(schedule(loan, v.rate, v.years, 'serie').reduce((s, r) => s + r[0], 0))} />
            </Section>
          )}
        </Screen>
      )}

      {tab === 'req' && (
        <Screen title="Krav" subtitle="Sjekk mot utlånsforskriften. Satsene kan endres hvis reglene endres.">
          <Section header="Din økonomi">
            <NumRow label="Brutto årsinntekt" value={v.income} onChange={(n) => set({ income: n })} suffix="kr" />
            <NumRow label="Annen gjeld" value={v.otherDebt} onChange={(n) => set({ otherDebt: n })} suffix="kr" />
            <NumRow label="Netto per måned" value={v.netMonth} onChange={(n) => set({ netMonth: n })} suffix="kr" />
            <NumRow label="Levekostnader per mnd" value={v.living} onChange={(n) => set({ living: n })} suffix="kr" />
          </Section>
          <Section header="Egenkapital" footer={`Krav: minst ${v.eqReq} % av kjøpesum = ${kr((v.price * v.eqReq) / 100)}`}>
            <Row label={`${num(eqPct, 1)} % egenkapital`} value={ok(eqPct >= v.eqReq)} />
          </Section>
          <Section header="Gjeldsgrad" footer={`All gjeld ≤ ${v.incMult} × brutto årsinntekt = ${kr(v.income * v.incMult)}`}>
            <Row label={`${num(debtRatio, 2)} × inntekt`} value={ok(debtRatio <= v.incMult)} />
          </Section>
          <Section header="Stresstest" footer={`Tåler du en renteøkning på ${v.stress} prosentpoeng? Ved ${num(v.rate + v.stress, 1)} % blir første termin ${kr(stressPay)}.`}>
            <Row label={`Igjen per måned: ${kr(leftAfterStress)}`} value={ok(leftAfterStress >= 0)} />
          </Section>
          <Section header="Regelverdier">
            <NumRow label="Egenkapitalkrav" value={v.eqReq} onChange={(n) => set({ eqReq: n })} suffix="%" />
            <NumRow label="Maks gjeldsgrad" value={v.incMult} onChange={(n) => set({ incMult: n })} suffix="×" />
            <NumRow label="Stresstest" value={v.stress} onChange={(n) => set({ stress: n })} suffix="pp" />
          </Section>
          <p className="pad small muted">Standardverdiene følger utlånsforskriften slik den var fra 2025 (10 % egenkapital, 5 × inntekt, +3 pp). Bankene kan gjøre unntak og bruke egne budsjetter. Dette er et anslag, ikke et lånetilbud.</p>
        </Screen>
      )}

      {tab === 'buy' && (
        <Screen title="Kjøp">
          <Section>
            <ToggleRow label="Selveier" detail="Dokumentavgift 2,5 % gjelder selveier, ikke borettslag" checked={v.selveier} onChange={(b) => set({ selveier: b })} />
            <Row label="Dokumentavgift" value={kr(docFee)} />
            <NumRow label="Tinglysingsgebyrer" value={v.fees} onChange={(n) => set({ fees: n })} suffix="kr" />
          </Section>
          <div className="card center">
            <div className="stat-l">Kontanter du trenger</div>
            <div className="big-num" style={{ fontSize: 44 }}>{kr(cash)}</div>
            <div className="muted small">egenkapital + dokumentavgift + gebyrer</div>
          </div>
          <Section header="Sammendrag">
            <Row label="Kjøpesum" value={kr(v.price)} />
            <Row label="Lån" value={kr(loan)} />
            <Row label="Belåningsgrad" value={`${num(v.price ? (loan / v.price) * 100 : 0, 1)} %`} />
            <Row label="Totalkostnad (kjøp + renter + avgifter)" value={kr(v.price + totalInterest + docFee + v.fees)} />
          </Section>
          <p className="pad small muted">Tinglysingsgebyrer (skjøte og pantedokument) settes av Kartverket og endres. Sjekk gjeldende sats. Borettslag kan ha fellesgjeld som kommer i tillegg.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'loan', label: 'Lån', icon: '🏠' }, { id: 'req', label: 'Krav', icon: '✅' }, { id: 'buy', label: 'Kjøp', icon: '🧾' }]} />
    </>
  )
}
