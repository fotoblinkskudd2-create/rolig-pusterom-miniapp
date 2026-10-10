import { useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, NumRow, Ring, Row, Screen, Section, Seg, Sheet, Spark, StepperRow, TabBar,
  fmtDate, fmtDur, fmtTime, num, toast, uid, useNow, useStore,
} from '../kit'

type Child = { id: string; name: string; kg: number }
type Med = 'paracetamol' | 'ibuprofen'
type Entry = { id: string; childId: string; date: number; kind: 'temp' | 'dose'; temp?: number; med?: Med; mg?: number }

/** Veiledende referanse, ikke medisinsk råd. Følg alltid pakningsvedlegg og lege. */
const MEDS: Record<Med, { name: string; mgPerKg: number; minHours: number; maxPerDay: number; mgPerMl: number; mixName: string }> = {
  paracetamol: { name: 'Paracetamol', mgPerKg: 15, minHours: 4, maxPerDay: 4, mgPerMl: 24, mixName: 'mikstur 24 mg/ml' },
  ibuprofen: { name: 'Ibuprofen', mgPerKg: 7.5, minHours: 6, maxPerDay: 3, mgPerMl: 20, mixName: 'mikstur 20 mg/ml' },
}
const COLORS = ['#ff5e3a', '#5e5ce6', '#30b0c7', '#34c759']

export default function Feberlogg() {
  const [tab, setTab] = useState<'now' | 'log' | 'dose'>('now')
  const [kids, setKids] = useStore<Child[]>('feber:kids', [])
  const [log, setLog] = useStore<Entry[]>('feber:log', [])
  const [activeId, setActiveId] = useStore('feber:active', '')
  const [sheet, setSheet] = useState<'temp' | 'dose' | 'kid' | null>(null)
  const [temp, setTemp] = useState(38.5)
  const [med, setMed] = useState<Med>('paracetamol')
  const [mg, setMg] = useState(0)
  const [kid, setKid] = useState<Child>({ id: '', name: '', kg: 15 })
  const now = useNow(15000)

  const child = kids.find((k) => k.id === activeId) ?? kids[0]
  const mine = log.filter((e) => e.childId === child?.id).sort((a, b) => b.date - a.date)
  const lastTemp = mine.find((e) => e.kind === 'temp')
  const nextDose = (m: Med) => {
    const doses = mine.filter((e) => e.kind === 'dose' && e.med === m)
    const last = doses[0]
    const in24 = doses.filter((e) => now - e.date < 864e5)
    const byInterval = last ? last.date + MEDS[m].minHours * 36e5 : 0
    // Maks antall doser per døgn: neste tillatt når den eldste av de siste falle ut av 24-timersvinduet
    const byMax = in24.length >= MEDS[m].maxPerDay ? in24[in24.length - 1].date + 864e5 : 0
    return { last, at: Math.max(byInterval, byMax), count24: in24.length }
  }
  const suggested = (m: Med) => child ? Math.round(child.kg * MEDS[m].mgPerKg) : 0

  const openDose = (m: Med) => { setMed(m); setMg(suggested(m)); setSheet('dose') }

  return (
    <>
      {tab === 'now' && (
        <Screen title="Nå" right={<button className="navbtn" onClick={() => { setKid({ id: uid(), name: '', kg: 15 }); setSheet('kid') }} aria-label="Legg til barn">＋</button>}>
          {!child ? (
            <Empty icon="🌡️" title="Legg til barnet" text="Navn og vekt. Vekten brukes til veiledende dose.">
              <Btn onClick={() => { setKid({ id: uid(), name: '', kg: 15 }); setSheet('kid') }}>Legg til barn</Btn>
            </Empty>
          ) : (
            <>
              {kids.length > 1 && (
                <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px', overflowX: 'auto' }}>
                  {kids.map((k, i) => (
                    <button key={k.id} onClick={() => setActiveId(k.id)} className={'chip' + (k.id === child.id ? ' on' : '')} style={k.id === child.id ? { background: COLORS[i % 4] } : undefined}>{k.name}</button>
                  ))}
                </div>
              )}
              {(['paracetamol', 'ibuprofen'] as Med[]).map((m) => {
                const nd = nextDose(m)
                if (!nd.last) return null
                const left = nd.at - now, ok = left <= 0
                return (
                  <div key={m} className="card" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <Ring value={ok ? 1 : 1 - left / (MEDS[m].minHours * 36e5)} size={74} stroke={8} color={ok ? 'var(--green)' : 'var(--tint)'}>
                      <span style={{ fontSize: 22 }}>{ok ? '✓' : '💊'}</span>
                    </Ring>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{MEDS[m].name}</div>
                      <div className="mid-num" style={{ fontSize: 22 }}>{ok ? 'Kan gis nå' : `Tidligst ${fmtTime(nd.at)}`}</div>
                      <div className="small muted">{ok ? `Sist ${fmtTime(nd.last.date)}` : `om ${fmtDur(left).replace(/:\d\d$/, '')} t`} · {nd.count24}/{MEDS[m].maxPerDay} siste døgn</div>
                    </div>
                  </div>
                )
              })}
              <div className="card center">
                <div className="stat-l">Siste temperatur – {child.name}</div>
                {lastTemp ? (
                  <>
                    <div className="big-num" style={{ color: (lastTemp.temp ?? 0) >= 38 ? 'var(--tint)' : 'var(--green)' }}>{num(lastTemp.temp ?? 0, 1)} °C</div>
                    <div className="muted small">{fmtDate(lastTemp.date, { weekday: 'short' })} kl {fmtTime(lastTemp.date)}</div>
                  </>
                ) : <div className="muted" style={{ padding: 8 }}>Ikke målt ennå</div>}
              </div>
              <div className="btn-row">
                <Btn kind="tinted" onClick={() => { setTemp(lastTemp?.temp ?? 38.5); setSheet('temp') }}>🌡️ Mål temp</Btn>
                <Btn onClick={() => openDose('paracetamol')}>💊 Gi medisin</Btn>
              </div>
              <p className="pad small muted">Ring legevakt (116 117) ved slapphet, pustebesvær, utslett som ikke blekner, nakkestivhet, dårlig væskeinntak, eller feber hos barn under 3 måneder. Ved akutt fare: 113.</p>
            </>
          )}
        </Screen>
      )}

      {tab === 'log' && (
        <Screen title="Logg" subtitle={child?.name}>
          {mine.length === 0 ? <Empty icon="📋" title="Tom logg" /> : (
            <>
              <div className="card">
                <div className="stat-l">Temperatur</div>
                <Spark values={mine.filter((e) => e.kind === 'temp').reverse().map((e) => e.temp ?? 0)} min={36} max={41} height={80} color="var(--tint)" />
              </div>
              <Section>
                {mine.map((e) => (
                  <Row key={e.id} icon={e.kind === 'temp' ? '🌡️' : '💊'} iconBg={e.kind === 'temp' ? 'var(--tint)' : '#5e5ce6'}
                    label={e.kind === 'temp' ? `${num(e.temp ?? 0, 1)} °C` : `${MEDS[e.med!].name} ${e.mg} mg`}
                    detail={`${fmtDate(e.date, { weekday: 'short', day: 'numeric', month: 'short' })} kl ${fmtTime(e.date)}`}
                    value={<button className="navbtn small" onClick={() => setLog(log.filter((x) => x.id !== e.id))}>Slett</button>} />
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'dose' && (
        <Screen title="Dose" subtitle="Veiledende. Følg pakningsvedlegg og lege.">
          {child ? (
            <>
              <Section header={child.name}>
                <StepperRow label="Vekt" value={child.kg} onChange={(n) => setKids(kids.map((k) => k.id === child.id ? { ...k, kg: n } : k))} step={0.5} min={3} max={80} fmt={(n) => `${num(n, 1)} kg`} />
              </Section>
              {(['paracetamol', 'ibuprofen'] as Med[]).map((m) => (
                <Section key={m} header={MEDS[m].name} footer={`${MEDS[m].mgPerKg} mg/kg per dose · minst ${MEDS[m].minHours} t mellom · maks ${MEDS[m].maxPerDay} doser per døgn`}>
                  <Row label="Per dose" value={<b style={{ color: 'var(--label)' }}>{suggested(m)} mg</b>} />
                  <Row label={MEDS[m].mixName} value={<b style={{ color: 'var(--label)' }}>{num(suggested(m) / MEDS[m].mgPerMl, 1)} ml</b>} />
                  <Row className="action" label={`Logg ${MEDS[m].name.toLowerCase()} nå`} onClick={() => openDose(m)} />
                </Section>
              ))}
              <p className="pad small muted">Ibuprofen anbefales vanligvis ikke til barn under 3 måneder eller ved dehydrering. Sjekk alltid styrken på flasken du har. Den kan avvike fra tallene over.</p>
            </>
          ) : <Empty icon="⚖️" title="Legg til barn først" />}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'now', label: 'Nå', icon: '🌙' }, { id: 'log', label: 'Logg', icon: '📋' }, { id: 'dose', label: 'Dose', icon: '⚖️' }]} />

      <Sheet open={sheet === 'temp'} onClose={() => setSheet(null)} title="Temperatur" action={{ label: 'Lagre', onClick: () => { setLog([{ id: uid(), childId: child!.id, date: Date.now(), kind: 'temp', temp }, ...log]); setSheet(null); toast('Lagret') } }}>
        <div className="card center"><div className="big-num" style={{ color: temp >= 38 ? 'var(--tint)' : 'var(--green)' }}>{num(temp, 1)} °C</div></div>
        <Section><StepperRow label="Temperatur" value={temp} onChange={setTemp} step={0.1} min={34} max={43} fmt={(n) => num(n, 1)} /></Section>
      </Sheet>

      <Sheet open={sheet === 'dose'} onClose={() => setSheet(null)} title="Gi medisin" action={{ label: 'Logg', disabled: mg <= 0, onClick: () => { setLog([{ id: uid(), childId: child!.id, date: Date.now(), kind: 'dose', med, mg }, ...log]); setSheet(null); toast(`${MEDS[med].name} logget`) } }}>
        <Seg value={med} onChange={(m) => { setMed(m); setMg(suggested(m)) }} options={[{ value: 'paracetamol', label: 'Paracetamol' }, { value: 'ibuprofen', label: 'Ibuprofen' }]} />
        {child && nextDose(med).at > now && (
          <div className="card" style={{ color: 'var(--red)' }}>⚠️ For tidlig. Tidligst {fmtTime(nextDose(med).at)} etter anbefalt intervall og maks per døgn.</div>
        )}
        <Section footer={`Veiledende for ${child?.kg ?? 0} kg: ${suggested(med)} mg ≈ ${num(suggested(med) / MEDS[med].mgPerMl, 1)} ml ${MEDS[med].mixName}`}>
          <NumRow label="Dose" value={mg} onChange={setMg} suffix="mg" />
        </Section>
      </Sheet>

      <Sheet open={sheet === 'kid'} onClose={() => setSheet(null)} title={kids.some((k) => k.id === kid.id) ? kid.name : 'Nytt barn'}
        action={{ label: 'Lagre', disabled: !kid.name, onClick: () => { setKids(kids.some((k) => k.id === kid.id) ? kids.map((k) => k.id === kid.id ? kid : k) : [...kids, kid]); setActiveId(kid.id); setSheet(null) } }}>
        <Section>
          <InputRow label="Navn" value={kid.name} onChange={(v) => setKid({ ...kid, name: v })} />
          <StepperRow label="Vekt" value={kid.kg} onChange={(n) => setKid({ ...kid, kg: n })} step={0.5} min={3} max={80} fmt={(n) => `${num(n, 1)} kg`} />
        </Section>
        {kids.some((k) => k.id === kid.id) && <Section><ConfirmRow label="Fjern barn" onConfirm={() => { setKids(kids.filter((k) => k.id !== kid.id)); setSheet(null) }} /></Section>}
      </Sheet>
    </>
  )
}
