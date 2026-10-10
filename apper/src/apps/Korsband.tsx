import { useState } from 'react'
import { Btn, Empty, InputRow, Progress, Row, Screen, Section, Seg, Spark, StepperRow, TabBar, dayKey, daysBetween, fmtDate, fromDayKey, toast, useStore } from '../kit'

type Rom = { date: number; flex: number; ext: number }
type Pain = { date: number; pain: number; swelling: string }
type Phase = { name: string; from: number; to: number; flexGoal: number; ex: string[] }

const PHASES: Phase[] = [
  { name: 'Beskytt', from: 0, to: 14, flexGoal: 90, ex: ['Quadsett 3×10 (stram lårmuskel, hold 5 s)', 'Hælskli 3×10', 'Rett beinløft 3×10', 'Ankelpumpe 3×20', 'Is og kompresjon 3× daglig'] },
  { name: 'Kontroll', from: 14, to: 42, flexGoal: 120, ex: ['Mini-knebøy 3×10', 'Ergometersykkel 10 min', 'Tåhev 3×15', 'Balanse ett bein 3×30 s', 'Seteløft (bro) 3×12'] },
  { name: 'Styrke', from: 42, to: 84, flexGoal: 135, ex: ['Beinpress 3×10', 'Utfall 3×8 per bein', 'Step-up 3×10', 'Hamstringcurl 3×10', 'Sykkel 20 min'] },
  { name: 'Løp', from: 84, to: 180, flexGoal: 140, ex: ['Joggeprogram (gå/jogg-intervaller)', 'Ettbeins knebøy 3×8', 'Hopp på to bein 3×10', 'Sidehopp 3×20 s', 'Nordisk hamstring 3×5'] },
  { name: 'Sport', from: 180, to: 365, flexGoal: 140, ex: ['Plyometri (boks, dybdehopp)', 'Retningsendring / finter', 'Sportsspesifikk trening', 'Hopptester mot friskt bein'] },
]
const SWELL = ['Ingen', 'Litt', 'Moderat', 'Mye']

function Protractor({ flex, goal }: { flex: number; goal: number }) {
  const R = 100, c = 120
  const pt = (deg: number, r = R) => { const a = Math.PI - (Math.min(160, deg) / 180) * Math.PI; return [c + r * Math.cos(a), 115 - r * Math.sin(a)] }
  const [x, y] = pt(flex), [gx, gy] = pt(goal, R + 8), [gx2, gy2] = pt(goal, R - 8)
  return (
    <svg viewBox="0 0 240 130" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}>
      <path d={`M ${c - R} 115 A ${R} ${R} 0 0 1 ${c + R} 115`} fill="none" stroke="var(--fill)" strokeWidth="14" strokeLinecap="round" />
      <path d={`M ${c - R} 115 A ${R} ${R} 0 0 1 ${x} ${y}`} fill="none" stroke="var(--tint)" strokeWidth="14" strokeLinecap="round" />
      <line x1={gx} y1={gy} x2={gx2} y2={gy2} stroke="var(--green)" strokeWidth="3" />
      <line x1={c} y1={115} x2={x} y2={y} stroke="var(--label)" strokeWidth="3" strokeLinecap="round" />
      <circle cx={c} cy={115} r="5" fill="var(--label)" />
      {[0, 90, 135].map((d) => { const [tx, ty] = pt(d, R + 20); return <text key={d} x={tx} y={ty + 4} fontSize="10" textAnchor="middle" fill="var(--label2)">{d}°</text> })}
    </svg>
  )
}

export default function Korsband() {
  const [tab, setTab] = useState<'today' | 'rom' | 'pain'>('today')
  const [surgery, setSurgery] = useStore('acl:surgery', '')
  const [checks, setChecks] = useStore<Record<string, string[]>>('acl:checks', {})
  const [rom, setRom] = useStore<Rom[]>('acl:rom', [])
  const [pain, setPain] = useStore<Pain[]>('acl:pain', [])
  const lastRom = rom[rom.length - 1]
  const [flex, setFlex] = useState(lastRom?.flex ?? 90)
  const [ext, setExt] = useState(lastRom?.ext ?? 0)
  const [p, setP] = useState(3)
  const [sw, setSw] = useState('Litt')

  const day = surgery ? daysBetween(fromDayKey(surgery), new Date()) : 0
  const idx = PHASES.findIndex((ph) => day < ph.to)
  const pi = idx === -1 ? PHASES.length - 1 : idx, phase = PHASES[pi]
  const today = dayKey(), done = checks[today] ?? []

  return (
    <>
      {tab === 'today' && (
        <Screen title="I dag" subtitle={surgery ? `Dag ${day} etter operasjon · Fase ${pi + 1}: ${phase.name}` : undefined}>
          {!surgery ? (
            <>
              <Empty icon="🦵" title="Når ble du operert?" text="Faseplanen regnes fra operasjonsdatoen." />
              <Section><InputRow label="Operasjonsdato" type="date" value={surgery} onChange={setSurgery} /></Section>
            </>
          ) : (
            <>
              <div className="card">
                <div style={{ display: 'flex', gap: 4 }}>
                  {PHASES.map((ph, i) => (
                    <div key={ph.name} style={{ flex: 1 }}>
                      <Progress value={i < pi ? 1 : i === pi ? (day - ph.from) / (ph.to - ph.from) : 0} color={i < pi ? 'var(--green)' : undefined} />
                      <div className="small" style={{ marginTop: 4, color: i === pi ? 'var(--tint)' : 'var(--label2)', fontWeight: i === pi ? 600 : 400 }}>{ph.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              <Section header={`Dagens øvelser · ${done.length}/${phase.ex.length}`}>
                {phase.ex.map((e) => {
                  const on = done.includes(e)
                  return <Row key={e} label={e} onClick={() => setChecks({ ...checks, [today]: on ? done.filter((x) => x !== e) : [...done, e] })}
                    value={<span style={{ fontSize: 22, color: on ? 'var(--green)' : 'var(--label3)' }}>{on ? '●' : '○'}</span>} />
                })}
              </Section>
              <Section header="Mål i denne fasen">
                <Row label="Bøy" value={`${phase.flexGoal}°`} />
                <Row label="Strekk" value="0°" />
              </Section>
              <Section footer="Programmet er et generelt eksempel. Følg planen fra fysioterapeuten og kirurgen din."><InputRow label="Operasjonsdato" type="date" value={surgery} onChange={setSurgery} /></Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'rom' && (
        <Screen title="Bevegelighet">
          <div className="card center">
            <Protractor flex={flex} goal={phase.flexGoal} />
            <div className="big-num">{flex}°</div>
            <div className="muted">bøy · strekk {ext > 0 ? '+' : ''}{ext}° · mål {phase.flexGoal}°</div>
          </div>
          <Section footer="Strekk: 0° er helt rett. Negativt tall betyr at kneet ikke strekkes helt ut.">
            <StepperRow label="Bøy (fleksjon)" value={flex} onChange={setFlex} min={0} max={160} step={1} fmt={(n) => `${n}°`} />
            <StepperRow label="Strekk" value={ext} onChange={setExt} min={-30} max={15} step={1} fmt={(n) => `${n}°`} />
          </Section>
          <div className="btn-row"><Btn onClick={() => { setRom([...rom, { date: Date.now(), flex, ext }]); toast('Måling lagret') }}>Lagre måling</Btn></div>
          {rom.length > 0 && (
            <>
              <div className="card"><div className="stat-l">Bøy over tid</div><Spark values={rom.map((r) => r.flex)} height={90} min={0} max={150} /></div>
              <Section header="Målinger">
                {[...rom].reverse().slice(0, 15).map((r) => <Row key={r.date} label={fmtDate(r.date, { dateStyle: 'medium' })} detail={surgery ? `Dag ${daysBetween(fromDayKey(surgery), r.date)}` : undefined} value={`${r.flex}° / ${r.ext}°`} />)}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'pain' && (
        <Screen title="Smerte">
          <div className="card center">
            <div className="big-num" style={{ color: `hsl(${120 - p * 12} 70% 45%)` }}>{p}</div>
            <div className="muted">av 10</div>
            <input type="range" min={0} max={10} value={p} onChange={(e) => setP(+e.target.value)} style={{ marginTop: 16, accentColor: `hsl(${120 - p * 12} 70% 45%)` }} aria-label="Smerte" />
          </div>
          <Section header="Hevelse"><div className="row"><Seg style={{ flex: 1 }} value={sw} onChange={setSw} options={SWELL.map((s) => ({ value: s, label: s }))} /></div></Section>
          <div className="btn-row"><Btn onClick={() => { setPain([...pain, { date: Date.now(), pain: p, swelling: sw }]); toast('Lagret') }}>Lagre</Btn></div>
          {pain.length > 0 && (
            <>
              <div className="card"><div className="stat-l">Smerte over tid</div><Spark values={pain.map((x) => x.pain)} min={0} max={10} height={70} color="var(--orange)" /></div>
              <Section>{[...pain].reverse().slice(0, 15).map((x) => <Row key={x.date} label={fmtDate(x.date, { dateStyle: 'medium' })} detail={`Hevelse: ${x.swelling}`} value={`${x.pain}/10`} />)}</Section>
            </>
          )}
          <p className="pad small muted">Plutselig økt hevelse, varme, feber eller smerte i leggen: kontakt lege.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'today', label: 'I dag', icon: '📋' }, { id: 'rom', label: 'Mål', icon: '📐' }, { id: 'pain', label: 'Smerte', icon: '🌡️' }]} />
    </>
  )
}
