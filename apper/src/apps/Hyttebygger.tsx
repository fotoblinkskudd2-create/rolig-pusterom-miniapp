import { useEffect, useRef, useState } from 'react'
import { Bars, Btn, Ring, Row, Screen, Section, Seg, TabBar, dayKey, fmtDur, fromDayKey, haptic, toast, useNow, useStore } from '../kit'

type Session = { date: number; min: number; ok: boolean }
const PER_STAGE = 4, STAGES = 12

function Cabin({ stage, size = 260, broken }: { stage: number; size?: number; broken?: boolean }) {
  const s = (n: number) => stage >= n
  const wallRows = Math.max(0, Math.min(4, stage - 1))
  return (
    <svg viewBox="0 0 200 170" width={size} height={size * 0.85} style={{ display: 'block', margin: '0 auto' }}>
      <ellipse cx="100" cy="150" rx="92" ry="12" fill="#e6efe8" />
      <path d="M8 150 L40 105 L60 125 L85 92 L110 150 Z" fill="#c9d6cc" opacity=".6" />
      {stage < STAGES && (
        <g opacity=".09" fill="var(--label)">
          <rect x="36" y="86" width="128" height="54" rx="3" /><path d="M26 74 L100 32 L174 74 Z" /><rect x="128" y="38" width="14" height="26" />
        </g>
      )}
      {s(1) && [30, 60, 90, 120, 150].map((x) => <rect key={x} x={x} y="138" width="22" height="8" rx="2" fill="#8e8e93" />)}
      {Array.from({ length: wallRows }, (_, i) => <rect key={i} x="36" y={128 - i * 14} width="128" height="12" rx="3" fill={i % 2 ? '#a33b2f' : '#b8473a'} />)}
      {s(6) && <path d="M28 76 L100 36 L100 50 L40 82 Z" fill="#5c4326" />}
      {s(7) && <path d="M172 76 L100 36 L100 50 L160 82 Z" fill="#4b361e" />}
      {s(8) && <path d="M26 74 L100 32 L174 74 L168 70 L100 30 L32 70 Z" fill="#4c8c3a" stroke="#3d7a2e" strokeWidth="4" strokeLinejoin="round" />}
      {s(9) && <rect x="88" y="104" width="24" height="38" rx="2" fill="#f2e3c6" stroke="#5c4326" strokeWidth="2" />}
      {s(10) && [50, 128].map((x) => <rect key={x} x={x} y="96" width="22" height="18" rx="2" fill={s(12) ? '#ffd60a' : '#d4e4f0'} stroke="#f2f2f7" strokeWidth="3" />)}
      {s(11) && <rect x="128" y="38" width="14" height="26" fill="#6e6e73" />}
      {s(12) && <g fill="#c7c7cc" opacity=".8"><circle cx="136" cy="28" r="6"><animate attributeName="cy" values="30;10;30" dur="4s" repeatCount="indefinite" /></circle><circle cx="142" cy="16" r="8" opacity=".6"><animate attributeName="cy" values="18;0;18" dur="5s" repeatCount="indefinite" /></circle></g>}
      {broken && <g transform="translate(70 12) rotate(12)"><rect width="60" height="10" rx="2" fill="#b8473a" /><path d="M28 -2 L33 6 L27 8 L32 14" stroke="var(--bg2)" strokeWidth="3" fill="none" /></g>}
    </svg>
  )
}

export default function Hyttebygger() {
  const [tab, setTab] = useState<'focus' | 'cabin' | 'stats'>('focus')
  const [planks, setPlanks] = useStore('hytte:planks', 0)
  const [sessions, setSessions] = useStore<Session[]>('hytte:sessions', [])
  const [running, setRunning] = useStore<{ start: number; min: number } | null>('hytte:running', null)
  const [dur, setDur] = useStore('hytte:dur', 25)
  const [broke, setBroke] = useState(false)
  const now = useNow(500)
  const runRef = useRef(running); runRef.current = running

  const fail = () => {
    const r = runRef.current; if (!r) return
    runRef.current = null
    setSessions((s) => [...s, { date: Date.now(), min: Math.round((Date.now() - r.start) / 60000), ok: false }])
    setRunning(null); setBroke(true); haptic([30, 60, 30])
  }
  // Forlater du appen eller fanen midt i en økt, knekker planken.
  useEffect(() => {
    if (running) fail() // åpnet med en økt som ble forlatt
    const vis = () => { if (document.hidden) fail() }
    document.addEventListener('visibilitychange', vis)
    return () => { document.removeEventListener('visibilitychange', vis); fail() }
  }, [])
  useEffect(() => {
    if (running && now >= running.start + running.min * 60000) {
      setSessions((s) => [...s, { date: Date.now(), min: running.min, ok: true }])
      setPlanks((p) => p + 1); setRunning(null); haptic([20, 50, 20, 50, 40]); toast('🪵 Ny planke på hytta!')
    }
  }, [now])

  const total = planks, cabins = Math.floor(total / (PER_STAGE * STAGES)), inCabin = total % (PER_STAGE * STAGES)
  const stage = Math.floor(inCabin / PER_STAGE)
  const ok = sessions.filter((s) => s.ok), brokenN = sessions.length - ok.length
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return dayKey(d) })
  const today = dayKey()
  // Sammenhengende dager med minst én fullført økt. I dag teller ikke mot deg før dagen er over.
  const okDays = new Set(ok.map((s) => dayKey(s.date)))
  let streak = 0
  for (let i = okDays.has(today) ? 0 : 1; i < 3650; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (okDays.has(dayKey(d))) streak++; else break }

  return (
    <>
      {tab === 'focus' && (
        <Screen title="Fokus">
          <div className="card">
            <Cabin stage={stage} broken={broke && !running} />
            {running ? (
              <>
                <Ring value={(now - running.start) / (running.min * 60000)} size={190} stroke={12} color="#28a745">
                  <div><div className="big-num" style={{ fontSize: 44 }}>{fmtDur(running.start + running.min * 60000 - now)}</div><div className="small muted">Ikke forlat hytta</div></div>
                </Ring>
                <div style={{ marginTop: 14 }}><Btn kind="danger" onClick={fail}>Gi opp (planken knekker)</Btn></div>
              </>
            ) : (
              <>
                <div className="center" style={{ margin: '4px 0 14px' }}>
                  {broke ? <span style={{ color: 'var(--red)' }}>Du forlot hytta. Planken knakk.</span> : <span className="muted">Trinn {stage + 1} av {STAGES} · {inCabin % PER_STAGE}/{PER_STAGE} planker</span>}
                </div>
                <Seg value={dur} onChange={setDur} options={[{ value: 15, label: '15 min' }, { value: 25, label: '25 min' }, { value: 50, label: '50 min' }]} style={{ margin: '0 0 14px' }} />
                <Btn onClick={() => { setBroke(false); setRunning({ start: Date.now(), min: dur }) }}>Start</Btn>
              </>
            )}
          </div>
          <p className="pad small muted">Bytter du app eller fane under økta, knekker planken. Det er hele poenget.</p>
        </Screen>
      )}

      {tab === 'cabin' && (
        <Screen title="Hytta">
          <div className="card"><Cabin stage={stage} /></div>
          <div className="grid2">
            <div className="card"><div className="stat-l">Planker totalt</div><div className="mid-num">{total}</div></div>
            <div className="card"><div className="stat-l">Hytter ferdig</div><div className="mid-num">{cabins} 🛖</div></div>
          </div>
          <Section header="Byggetrinn">
            {['Grunnmur', 'Første stokk', 'Andre stokk', 'Tredje stokk', 'Fjerde stokk', 'Takside vest', 'Takside øst', 'Torvtak', 'Dør', 'Vinduer', 'Pipe', 'Røyk og lys i vinduene'].map((n, i) => (
              <Row key={n} label={n} value={i < stage ? '✓' : i === stage ? `${inCabin % PER_STAGE}/${PER_STAGE}` : ''} style={{ opacity: i <= stage ? 1 : 0.45 }} />
            ))}
          </Section>
        </Screen>
      )}

      {tab === 'stats' && (
        <Screen title="Statistikk">
          <div className="grid2">
            <div className="card"><div className="stat-l">Streak</div><div className="mid-num">{streak} d</div></div>
            <div className="card"><div className="stat-l">Fokustimer</div><div className="mid-num">{(ok.reduce((s, x) => s + x.min, 0) / 60).toFixed(1).replace('.', ',')}</div></div>
          </div>
          <div className="card">
            <div className="stat-l">Fokusminutter siste 7 dager</div>
            <Bars data={week.map((k) => ({ label: fromDayKey(k).toLocaleDateString('nb-NO', { weekday: 'narrow' }), value: ok.filter((s) => dayKey(s.date) === k).reduce((a, s) => a + s.min, 0) }))} />
          </div>
          <Section>
            <Row label="Fullførte økter" value={ok.length} />
            <Row label="Knekte planker" value={brokenN} />
            <Row label="Fullføringsgrad" value={sessions.length ? `${Math.round((ok.length / sessions.length) * 100)} %` : '–'} />
          </Section>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'focus', label: 'Fokus', icon: '⏱️' }, { id: 'cabin', label: 'Hytta', icon: '🛖' }, { id: 'stats', label: 'Statistikk', icon: '📊' }]} />
    </>
  )
}
