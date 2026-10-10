import { useEffect, useRef, useState } from 'react'
import { Btn, Row, Screen, Section, Seg, TabBar, ToggleRow, dayKey, haptic, toast, useStore } from '../kit'

type Prog = { id: string; name: string; hold: number; rest: number; reps: number; sets: number }
const PROGS: Prog[] = [
  { id: 'start', name: 'Nybegynner', hold: 3, rest: 3, reps: 10, sets: 2 },
  { id: 'endur', name: 'Utholdenhet', hold: 8, rest: 6, reps: 10, sets: 2 },
  { id: 'quick', name: 'Hurtig', hold: 1, rest: 1, reps: 15, sets: 3 },
]

export default function Bekkenbunn() {
  const [tab, setTab] = useState<'train' | 'cal' | 'set'>('train')
  const [progId, setProgId] = useStore('bekken:prog', 'start')
  const [days, setDays] = useStore<string[]>('bekken:days', [])
  const [discreet, setDiscreet] = useStore('bekken:discreet', false)
  const [vib, setVib] = useStore('bekken:vib', true)
  const prog = PROGS.find((p) => p.id === progId) ?? PROGS[0]
  const [run, setRun] = useState<{ phase: 'in' | 'out' | 'pause'; rep: number; set: number; left: number } | null>(null)
  const tick = useRef<number | undefined>(undefined)

  const words = discreet ? { in: 'Inn', out: 'Ut' } : { in: 'Knip', out: 'Slipp' }

  useEffect(() => {
    if (!run) return
    tick.current = window.setTimeout(() => {
      setRun((r) => {
        if (!r) return r
        if (r.left > 1) return { ...r, left: r.left - 1 }
        if (r.phase === 'in') { vib && haptic(40); return { ...r, phase: 'out', left: prog.rest } }
        if (r.phase === 'pause') { vib && haptic([20, 40, 20]); return { phase: 'in', rep: 1, set: r.set + 1, left: prog.hold } }
        // slutt på slipp
        if (r.rep < prog.reps) { vib && haptic([15, 30, 15]); return { ...r, phase: 'in', rep: r.rep + 1, left: prog.hold } }
        if (r.set < prog.sets) return { ...r, phase: 'pause', left: 20 }
        return null
      })
    }, 1000)
    return () => clearTimeout(tick.current)
  }, [run, prog, vib])

  const finished = useRef(false)
  useEffect(() => {
    if (run) { finished.current = true; return }
    if (finished.current) {
      finished.current = false
      const k = dayKey()
      if (!days.includes(k)) setDays([...days, k])
      haptic([30, 60, 30, 60, 60]); toast('Økt fullført 🌸')
    }
  }, [run])

  const start = () => { haptic(30); setRun({ phase: 'in', rep: 1, set: 1, left: prog.hold }) }
  const stop = () => { finished.current = false; setRun(null) }

  // Streak og kalender
  const set = new Set(days)
  let streak = 0
  for (let i = set.has(dayKey()) ? 0 : 1; i < 3650; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (set.has(dayKey(d))) streak++; else break }
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate()

  const scale = run ? (run.phase === 'in' ? 0.62 : run.phase === 'out' ? 1 : 0.85) : 0.85
  const dur = run ? (run.phase === 'in' ? Math.min(prog.hold, 1.2) : Math.min(prog.rest, 1.2)) : 0.4

  return (
    <>
      {tab === 'train' && (
        <Screen title={discreet ? 'Pust' : 'Trening'}>
          {!run && <Seg value={progId} onChange={setProgId} options={PROGS.map((p) => ({ value: p.id, label: p.name }))} />}
          <div className="card center" style={{ padding: '28px 16px' }}>
            <div style={{ width: 240, height: 240, margin: '0 auto', display: 'grid', placeItems: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'color-mix(in srgb, var(--tint) 12%, transparent)' }} />
              <div style={{ width: 240, height: 240, borderRadius: '50%', background: 'linear-gradient(160deg,#ff8fa8,#b8335a)', transform: `scale(${scale})`, transition: `transform ${dur}s cubic-bezier(.4,0,.2,1)`, display: 'grid', placeItems: 'center', color: '#fff' }}>
                <div>
                  <div style={{ fontSize: 30, fontWeight: 700 }}>{run ? (run.phase === 'in' ? words.in : run.phase === 'out' ? words.out : 'Pause') : '🌸'}</div>
                  {run && <div className="big-num" style={{ fontSize: 44 }}>{run.left}</div>}
                </div>
              </div>
            </div>
            <div className="muted" style={{ marginTop: 16 }}>
              {run ? `Rep ${run.rep} / ${prog.reps} · Sett ${run.set} / ${prog.sets}` : `${prog.hold} s ${words.in.toLowerCase()}, ${prog.rest} s ${words.out.toLowerCase()} · ${prog.reps} × ${prog.sets}`}
            </div>
          </div>
          <div className="btn-row">{run ? <Btn kind="gray" onClick={stop}>Avslutt</Btn> : <Btn onClick={start}>Start</Btn>}</div>
          {!discreet && !run && <p className="pad small muted">Knip som om du holder igjen tiss og luft, og løft innover. Ikke hold pusten, og ikke stram rumpe eller lår. Slipp helt mellom hver gang.</p>}
        </Screen>
      )}

      {tab === 'cal' && (
        <Screen title="Kalender">
          <div className="grid2">
            <div className="card"><div className="stat-l">Streak</div><div className="mid-num">{streak} dager</div></div>
            <div className="card"><div className="stat-l">Totalt</div><div className="mid-num">{days.length} økter</div></div>
          </div>
          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 10, textTransform: 'capitalize' }}>{now.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, textAlign: 'center' }}>
              {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => <div key={i} className="small muted">{d}</div>)}
              {Array.from({ length: first }, (_, i) => <div key={'e' + i} />)}
              {Array.from({ length: dim }, (_, i) => {
                const k = dayKey(new Date(y, m, i + 1)), on = set.has(k), isToday = i + 1 === now.getDate()
                return <div key={k} style={{ aspectRatio: '1', borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 14, background: on ? 'var(--tint)' : 'transparent', color: on ? '#fff' : undefined, border: isToday && !on ? '1.5px solid var(--tint)' : undefined }}>{i + 1}</div>
              })}
            </div>
          </div>
        </Screen>
      )}

      {tab === 'set' && (
        <Screen title="Innstillinger">
          <Section footer="Diskré modus endrer tittel og ord til «Pust», «Inn» og «Ut», så ingen skjønner hva du trener.">
            <ToggleRow label="Diskré modus" checked={discreet} onChange={setDiscreet} />
            <ToggleRow label="Vibrasjon" detail="Støttes på Android. iOS Safari mangler vibrasjon." checked={vib} onChange={setVib} />
          </Section>
          <Section header="Programmer">
            {PROGS.map((p) => <Row key={p.id} label={p.name} detail={`${p.hold} s hold · ${p.rest} s hvile · ${p.reps} reps × ${p.sets} sett`} value={p.id === progId ? '✓' : ''} onClick={() => setProgId(p.id)} />)}
          </Section>
          <p className="pad small muted">Har du smerter, lekkasje som ikke bedres eller er usikker på teknikken: en fysioterapeut med bekkenbunnskompetanse kan sjekke at du gjør det riktig.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'train', label: discreet ? 'Pust' : 'Trening', icon: '🌸' }, { id: 'cal', label: 'Kalender', icon: '📅' }, { id: 'set', label: 'Innstillinger', icon: '⚙️' }]} />
    </>
  )
}
