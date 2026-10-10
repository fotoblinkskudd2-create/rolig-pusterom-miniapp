import { useState } from 'react'
import { InputRow, Row, Screen, Section, Seg, Sheet, TabBar, dayKey, fmtDate, fromDayKey, pad2, useNow, useStore } from '../kit'

type Kind = 'dag' | 'kveld' | 'natt' | 'fri'
type Shift = { kind: Kind; start: string; end: string }
const DEF: Record<Kind, Shift> = {
  dag: { kind: 'dag', start: '07:00', end: '15:00' },
  kveld: { kind: 'kveld', start: '15:00', end: '23:00' },
  natt: { kind: 'natt', start: '23:00', end: '07:00' },
  fri: { kind: 'fri', start: '', end: '' },
}
const COL: Record<Kind, string> = { dag: '#ff9f0a', kveld: '#bf5af2', natt: '#5e5ce6', fri: '#34c759' }
const NAME: Record<Kind, string> = { dag: 'Dag', kveld: 'Kveld', natt: 'Natt', fri: 'Fri' }

const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return (h || 0) * 60 + (m || 0) }
const fmtMin = (m: number) => { const x = ((Math.round(m) % 1440) + 1440) % 1440; return `${pad2(Math.floor(x / 60))}:${pad2(x % 60)}` }

type Plan = { sleep?: [number, number]; nap?: [number, number]; caffeine?: number; light: string; headline: string }

/** Søvnråd for én dag basert på vakta i dag, i går og i morgen. Tider i minutter fra midnatt (kan gå over 1440). */
export function planFor(today: Shift, prev: Shift, next: Shift): Plan {
  if (today.kind === 'dag') {
    const s = toMin(today.start)
    const sleep: [number, number] = [s - 525, s - 75]
    return { sleep, caffeine: s - 525 - 360 + 1440, headline: `Legg deg ${fmtMin(sleep[0])} kvelden før`, light: 'Dagslys rett etter at du står opp. Dempet lys de siste to timene før leggetid.' }
  }
  if (today.kind === 'kveld') {
    const e = toMin(today.end)
    const sleep: [number, number] = [e + 90, e + 570]
    return { sleep, caffeine: e - 270, headline: `Sov ${fmtMin(sleep[0])}–${fmtMin(sleep[1])}`, light: 'Ta lyset om formiddagen. Unngå skjerm i full styrke etter vakta.' }
  }
  if (today.kind === 'natt') {
    const st = toMin(today.start), e = toMin(today.end) + (toMin(today.end) < st ? 1440 : 0)
    const sleep: [number, number] = [e + 45, e + 465]
    const nap: [number, number] | undefined = prev.kind !== 'natt' ? [st - 210, st - 120] : undefined
    return {
      sleep, nap, caffeine: e + 45 - 360,
      headline: nap ? `Ta en lur ${fmtMin(nap[0])}–${fmtMin(nap[1])} før første natt` : `Sov ${fmtMin(sleep[0])}–${fmtMin(sleep[1])} etter vakta`,
      light: 'Sterkt lys første halvdel av natta. Solbriller på vei hjem. Mørkt, kjølig soverom.',
    }
  }
  if (prev.kind === 'natt') return { sleep: [480, 720], headline: 'Kort søvn etter natta (maks 4 t), så legg deg 22:30', caffeine: 720, light: 'Gå ut i dagslys etter lurven. Det setter klokka tilbake.' }
  if (next.kind === 'natt') return { sleep: [120, 600], headline: 'Forskyv: legg deg sent (02–10) før nattevakter', caffeine: 1200, light: 'Hold deg oppe i lys kveld. Sov lenge.' }
  return { sleep: [1380, 1860], caffeine: 900, headline: 'Vanlig rytme: 23:00–07:00', light: 'Morgenlys. Faste tider, også på fridager.' }
}

function arcPath(a: number, b: number, r: number, c: number) {
  const ang = (m: number) => ((m % 1440) / 1440) * 2 * Math.PI - Math.PI / 2
  let span = b - a; while (span <= 0) span += 1440
  const p = (m: number) => [c + r * Math.cos(ang(m)), c + r * Math.sin(ang(m))]
  const [x1, y1] = p(a), [x2, y2] = p(a + span)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${span > 720 ? 1 : 0} 1 ${x2} ${y2}`
}

function Dial({ shift, plan, nowMin }: { shift: Shift; plan: Plan; nowMin: number }) {
  const S = 260, c = S / 2
  const ang = (m: number) => (m / 1440) * 2 * Math.PI - Math.PI / 2
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={S} height={S} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={c} cy={c} r={110} fill="none" stroke="var(--fill)" strokeWidth={16} />
      <circle cx={c} cy={c} r={86} fill="none" stroke="var(--fill)" strokeWidth={12} />
      {shift.kind !== 'fri' && <path d={arcPath(toMin(shift.start), toMin(shift.end), 110, c)} stroke={COL[shift.kind]} strokeWidth={16} fill="none" strokeLinecap="round" />}
      {plan.sleep && <path d={arcPath(plan.sleep[0], plan.sleep[1], 86, c)} stroke="#7d7aff" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.85} />}
      {plan.nap && <path d={arcPath(plan.nap[0], plan.nap[1], 86, c)} stroke="#64d2ff" strokeWidth={12} fill="none" strokeLinecap="round" />}
      {plan.caffeine != null && (() => { const a = ang(plan.caffeine % 1440); return <text x={c + 62 * Math.cos(a)} y={c + 62 * Math.sin(a) + 6} textAnchor="middle" fontSize={16}>☕</text> })()}
      {[0, 6, 12, 18].map((h) => { const a = ang(h * 60); return <text key={h} x={c + 132 * Math.cos(a) * 0.93} y={c + 132 * Math.sin(a) * 0.93 + 4} textAnchor="middle" fontSize={11} fill="var(--label2)">{pad2(h)}</text> })}
      {(() => { const a = ang(nowMin); return <line x1={c} y1={c} x2={c + 100 * Math.cos(a)} y2={c + 100 * Math.sin(a)} stroke="var(--red)" strokeWidth={2.5} strokeLinecap="round" /> })()}
      <circle cx={c} cy={c} r={4} fill="var(--red)" />
    </svg>
  )
}

const CHECK = ['Mørkleggingsgardiner er på plass', 'Mobil på «Ikke forstyrr» fra du legger deg', 'Mat klar til natta (lett, proteinrik)', 'Lur på 60–90 min tatt', 'Solbriller i jakka til hjemturen', 'Ørepropper eller hvit støy klar']

export default function Skiftsovn() {
  const [tab, setTab] = useState<'today' | 'week' | 'check'>('today')
  const [shifts, setShifts] = useStore<Record<string, Shift>>('skift:shifts', {})
  const [checks, setChecks] = useStore<Record<string, string[]>>('skift:checks', {})
  const [edit, setEdit] = useState<string | null>(null)
  const now = useNow(60000)
  const get = (k: string) => shifts[k] ?? DEF.fri
  const offset = (k: string, d: number) => { const x = fromDayKey(k); x.setDate(x.getDate() + d); return dayKey(x) }
  const today = dayKey(now)
  const plan = planFor(get(today), get(offset(today, -1)), get(offset(today, 1)))
  const nd = new Date(now)
  const days = Array.from({ length: 14 }, (_, i) => offset(today, i))
  const todayChecks = checks[today] ?? []

  return (
    <>
      {tab === 'today' && (
        <Screen title="I dag" subtitle={`${fmtDate(now, { weekday: 'long', day: 'numeric', month: 'long' })} · ${NAME[get(today).kind]}${get(today).kind !== 'fri' ? ` ${get(today).start}–${get(today).end}` : ''}`}>
          <div className="card">
            <Dial shift={get(today)} plan={plan} nowMin={nd.getHours() * 60 + nd.getMinutes()} />
            <div className="center" style={{ marginTop: 8 }}>
              <div className="mid-num" style={{ fontSize: 22 }}>{plan.headline}</div>
            </div>
            <div className="small muted center" style={{ marginTop: 10, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <span><b style={{ color: COL[get(today).kind] }}>●</b> vakt</span><span><b style={{ color: '#7d7aff' }}>●</b> søvn</span><span><b style={{ color: '#64d2ff' }}>●</b> lur</span><span>☕ kaffestopp</span>
            </div>
          </div>
          <Section header="Plan">
            {plan.sleep && <Row icon="😴" iconBg="#5e5ce6" label="Søvn" value={`${fmtMin(plan.sleep[0])}–${fmtMin(plan.sleep[1])}`} />}
            {plan.nap && <Row icon="💤" iconBg="#64d2ff" label="Lur" value={`${fmtMin(plan.nap[0])}–${fmtMin(plan.nap[1])}`} />}
            {plan.caffeine != null && <Row icon="☕" iconBg="#a2845e" label="Siste kaffe" value={fmtMin(plan.caffeine)} />}
            <Row icon="☀️" iconBg="#ff9f0a" label="Lys" detail={plan.light} />
          </Section>
          <Section><Row label="Endre dagens vakt" chevron onClick={() => setEdit(today)} className="action" /></Section>
        </Screen>
      )}

      {tab === 'week' && (
        <Screen title="Turnus" subtitle="Trykk en dag for å sette vakt.">
          <Section>
            {days.map((k) => {
              const s = get(k), p = planFor(s, get(offset(k, -1)), get(offset(k, 1)))
              return (
                <button key={k} className="row" onClick={() => setEdit(k)} style={{ display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontWeight: k === today ? 700 : 400 }}>{fmtDate(fromDayKey(k), { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                    <span className="tag" style={{ background: COL[s.kind] + '22', color: COL[s.kind] }}>{NAME[s.kind]}{s.kind !== 'fri' ? ` ${s.start}–${s.end}` : ''}</span>
                  </div>
                  <div style={{ position: 'relative', height: 10, background: 'var(--fill)', borderRadius: 5, overflow: 'hidden' }}>
                    {s.kind !== 'fri' && <Seg24 a={toMin(s.start)} b={toMin(s.end)} color={COL[s.kind]} />}
                    {p.sleep && <Seg24 a={p.sleep[0]} b={p.sleep[1]} color="#7d7aff" op={0.55} />}
                  </div>
                </button>
              )
            })}
          </Section>
        </Screen>
      )}

      {tab === 'check' && (
        <Screen title="Før natta" subtitle="Sjekkliste før nattevakt. Nullstilles hver dag.">
          <Section>
            {CHECK.map((c) => {
              const on = todayChecks.includes(c)
              return <Row key={c} label={c} onClick={() => setChecks({ ...checks, [today]: on ? todayChecks.filter((x) => x !== c) : [...todayChecks, c] })}
                value={<span style={{ fontSize: 22, color: on ? 'var(--green)' : 'var(--label3)' }}>{on ? '●' : '○'}</span>} />
            })}
          </Section>
          <p className="pad small muted">Rådene er generelle søvnhygiene-prinsipper for skiftarbeid. Har du søvnproblemer over tid, snakk med fastlegen.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'today', label: 'I dag', icon: '🌗' }, { id: 'week', label: 'Turnus', icon: '📅' }, { id: 'check', label: 'Før natta', icon: '✅' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={fmtDate(fromDayKey(edit), { weekday: 'long', day: 'numeric', month: 'short' })} action={{ label: 'Ferdig', onClick: () => setEdit(null) }}>
          <Seg value={get(edit).kind} onChange={(k) => setShifts({ ...shifts, [edit]: { ...DEF[k] } })} options={(['dag', 'kveld', 'natt', 'fri'] as Kind[]).map((k) => ({ value: k, label: NAME[k] }))} />
          {get(edit).kind !== 'fri' && (
            <Section>
              <InputRow label="Start" type="time" value={get(edit).start} onChange={(v) => setShifts({ ...shifts, [edit]: { ...get(edit), start: v } })} />
              <InputRow label="Slutt" type="time" value={get(edit).end} onChange={(v) => setShifts({ ...shifts, [edit]: { ...get(edit), end: v } })} />
            </Section>
          )}
        </Sheet>
      )}
    </>
  )
}

function Seg24({ a, b, color, op = 1 }: { a: number; b: number; color: string; op?: number }) {
  const A = ((a % 1440) + 1440) % 1440
  let span = b - a; while (span <= 0) span += 1440
  const first = Math.min(span, 1440 - A)
  return (
    <>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${(A / 1440) * 100}%`, width: `${(first / 1440) * 100}%`, background: color, opacity: op }} />
      {span > first && <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${((span - first) / 1440) * 100}%`, background: color, opacity: op }} />}
    </>
  )
}
