import { useEffect, useRef, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast } from '../../shared/store.js'
import { Shell, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { todayISO, toISODate, addDays } from '../../shared/format.js'

const APP = 'start'
const TEMPLATES = {
  'Åpne posten / regninger': ['Hent brevene og legg dem på bordet', 'Åpne ett brev', 'Les bare beløp og frist', 'Ta bilde av det', 'Legg det i én bunke'],
  'Rydde rommet': ['Plukk opp 5 ting fra gulvet', 'Alt søppel i en pose', 'Klær i én haug', 'Tøm én flate', 'Bær posen ut'],
  'Oppvask': ['Fyll vann i vasken', 'Vask bare glassene', 'Vask bestikket', 'Resten i bløt'],
  'Dusje': ['Gå inn på badet', 'Skru på vannet', 'Stå under i 1 minutt', 'Resten kommer av seg selv'],
  'Svare på en melding': ['Åpne meldingen', 'Skriv én setning', 'Send – den trenger ikke være perfekt'],
  'Ringe noen': ['Finn nummeret', 'Skriv ned det du skal si (3 ord)', 'Trykk ring'],
}

// Brun støy via WebAudio – en lavmælt "kropp i rommet". Lages på trykk (iOS krever brukerhandling).
function makeNoise() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const len = ctx.sampleRate * 2
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5 }
  const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
  const gain = ctx.createGain(); gain.gain.value = 0.25
  src.connect(gain).connect(ctx.destination); src.start()
  return { ctx, stop: () => ctx.close() }
}
function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[660, 880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain()
      o.frequency.value = f; o.type = 'sine'
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.18)
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.9)
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.18); o.stop(ctx.currentTime + i * 0.18 + 1)
    })
    setTimeout(() => ctx.close(), 2000)
  } catch { /* lydløs */ }
}

function App() {
  const [tasks, setTasks] = useLocal(APP, 'tasks', [])
  const [done, setDone] = useLocal(APP, 'done', [])
  const [currentId, setCurrentId] = useLocal(APP, 'current', null)
  const [tab, setTab] = useState('now')
  const [toast, showToast] = useToast()
  const [draft, setDraft] = useState('')

  const current = tasks.find((t) => t.id === currentId)
  const todayCount = done.filter((d) => d.date === todayISO()).length
  const streak = (() => { let n = 0; const days = new Set(done.map((d) => d.date)); for (let d = new Date(); days.has(toISODate(d)); d = addDays(d, -1)) n++; return n })()

  const add = (title) => {
    const t = title.trim(); if (!t) return
    const task = { id: uid(), title: t, steps: (TEMPLATES[t] || []).map((s) => ({ id: uid(), text: s, done: false })) }
    setTasks((xs) => [task, ...xs]); setDraft('')
    return task
  }
  const update = (task) => setTasks((xs) => xs.map((x) => (x.id === task.id ? task : x)))
  const finish = (task) => {
    setTasks((xs) => xs.filter((x) => x.id !== task.id))
    setDone((d) => [{ id: task.id, title: task.title, date: todayISO() }, ...d].slice(0, 500))
    setCurrentId(null)
    chime()
    showToast('🎉 STARTET OG FERDIG. Hjernen din fikk akkurat dopamin på ærlig vis.')
  }
  const pickRandom = () => { if (tasks.length) setCurrentId(tasks[Math.floor(Math.random() * tasks.length)].id) }

  return (
    <Shell
      title="Startknappen" glyph="▶️" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'now', icon: '▶️', label: 'Nå' }, { id: 'dump', icon: '🧠', label: 'Hjernedump' }, { id: 'stats', icon: '🔥', label: 'Rekke' }]}
    >
      {tab === 'now' && (current ? (
        <Focus task={current} onUpdate={update} onFinish={finish} onDrop={() => setCurrentId(null)} />
      ) : (
        <>
          <div className="card">
            <h2>Hva er det du unngår?</h2>
            <form onSubmit={(e) => { e.preventDefault(); const t = add(draft); if (t) setCurrentId(t.id) }} className="row">
              <input className="input grow" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Skriv det. Bare skriv det." />
              <button className="btn">Start</button>
            </form>
            <div className="row wrap" style={{ marginTop: 10 }}>
              {Object.keys(TEMPLATES).map((t) => <button key={t} className="chip" onClick={() => setCurrentId(add(t).id)}>{t}</button>)}
            </div>
          </div>
          {tasks.length > 0 && (
            <div className="card">
              <h2>Eller velg fra hjernedumpen</h2>
              <ul className="list">
                {tasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="row" onClick={() => setCurrentId(t.id)} style={{ cursor: 'pointer' }}><span className="grow">{t.title}</span><span className="muted">▶︎</span></li>
                ))}
              </ul>
              <button className="btn ghost block" onClick={pickRandom}>🎲 Velg for meg</button>
            </div>
          )}
          <p className="muted small">Regelen: du skal ikke gjøre oppgaven. Du skal bare gjøre første steg i 2 minutter. Å stoppe etterpå er lov.</p>
        </>
      ))}

      {tab === 'dump' && (
        <>
          <form className="card row" onSubmit={(e) => { e.preventDefault(); add(draft) }}>
            <input className="input grow" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tøm hodet. Én ting om gangen." />
            <button className="btn">+</button>
          </form>
          {tasks.length === 0 ? <Empty icon="🧠" title="Hodet er tomt (her)">Alt som surrer – skriv det ned så slipper hjernen å holde på det.</Empty> : (
            <div className="card"><ul className="list">
              {tasks.map((t) => (
                <li key={t.id} className="row">
                  <span className="grow">{t.title}{t.steps.length > 0 && <span className="muted small"> · {t.steps.filter((s) => s.done).length}/{t.steps.length}</span>}</span>
                  <button className="btn sm" onClick={() => { setCurrentId(t.id); setTab('now') }}>▶︎</button>
                  <button className="iconbtn" aria-label="Slett" onClick={() => setTasks((xs) => xs.filter((x) => x.id !== t.id))}>🗑</button>
                </li>
              ))}
            </ul></div>
          )}
        </>
      )}

      {tab === 'stats' && (
        <>
          <div className="stats">
            <Stat hero value={todayCount} label="ting fullført i dag" />
            <Stat value={`${streak} 🔥`} label="dager på rad" />
          </div>
          <div className="card"><h2>Siste seire</h2>
            {done.length === 0 ? <p className="muted small">Ingen ennå. Den første er den tyngste.</p> : (
              <ul className="list">{done.slice(0, 20).map((d, i) => <li key={d.id + i} className="row"><span className="grow">✅ {d.title}</span><span className="muted small">{d.date}</span></li>)}</ul>
            )}
          </div>
          <BackupCard app={APP} toast={showToast} />
        </>
      )}
    </Shell>
  )
}

function Focus({ task, onUpdate, onFinish, onDrop }) {
  const [mins, setMins] = useState(2)
  const [endAt, setEndAt] = useState(null)
  const [now, setNow] = useState(Date.now())
  const [buddy, setBuddy] = useState(false)
  const [stepDraft, setStepDraft] = useState('')
  const noise = useRef(null)

  useEffect(() => { if (!endAt) return; const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t) }, [endAt])
  useEffect(() => { if (endAt && now >= endAt) { setEndAt(null); chime() } }, [now, endAt])
  useEffect(() => () => noise.current?.stop(), [])

  const toggleBuddy = () => {
    if (buddy) { noise.current?.stop(); noise.current = null } else { try { noise.current = makeNoise() } catch { /* ingen lyd */ } }
    setBuddy(!buddy)
  }
  const remaining = endAt ? Math.max(0, endAt - now) : mins * 60000
  const total = mins * 60000
  const frac = endAt ? 1 - remaining / total : 0
  const nextStep = task.steps.find((s) => !s.done)
  const R = 88, C = 2 * Math.PI * R

  return (
    <>
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="muted small" style={{ margin: 0 }}>Du starter på</p>
        <h2 style={{ fontSize: 22, margin: '4px 0 12px' }}>{task.title}</h2>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="12" />
            <circle cx="100" cy="100" r={R} fill="none" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: 'stroke-dashoffset .25s linear' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <div>
              {buddy && <div className="buddy" aria-hidden>🫂</div>}
              <b style={{ fontSize: 40, fontVariantNumeric: 'tabular-nums' }}>{Math.floor(remaining / 60000)}:{String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')}</b>
            </div>
          </div>
        </div>
        {!endAt && (
          <div className="seg" style={{ margin: '14px 0' }}>
            {[2, 5, 10, 25].map((m) => <button key={m} aria-pressed={mins === m} onClick={() => setMins(m)}>{m} min</button>)}
          </div>
        )}
        <div className="row" style={{ marginTop: endAt ? 14 : 0 }}>
          {endAt ? <button className="btn ghost grow" onClick={() => setEndAt(null)}>Pause</button>
            : <button className="btn grow" onClick={() => { setEndAt(Date.now() + mins * 60000); setNow(Date.now()) }}>▶︎ Start {mins} min</button>}
          <button className={'btn ' + (buddy ? '' : 'ghost')} onClick={toggleBuddy} aria-pressed={buddy}>🫂 Kroppsdobbel</button>
        </div>
        {buddy && <p className="muted small">Noen sitter med deg. Brun støy på. Du er ikke alene om dette.</p>}
      </div>

      <div className="card">
        <h2>Bitte små steg</h2>
        {nextStep && <p className="small" style={{ marginTop: 0 }}>Neste: <b>{nextStep.text}</b></p>}
        <ul className="list">
          {task.steps.map((s) => (
            <li key={s.id} className="row">
              <input type="checkbox" checked={s.done} style={{ width: 22, height: 22, accentColor: 'var(--accent)' }}
                onChange={() => onUpdate({ ...task, steps: task.steps.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) })} />
              <span className="grow" style={{ textDecoration: s.done ? 'line-through' : 'none', opacity: s.done ? 0.5 : 1 }}>{s.text}</span>
            </li>
          ))}
        </ul>
        <form className="row" style={{ marginTop: 8 }} onSubmit={(e) => { e.preventDefault(); if (!stepDraft.trim()) return; onUpdate({ ...task, steps: [...task.steps, { id: uid(), text: stepDraft.trim(), done: false }] }); setStepDraft('') }}>
          <input className="input grow" value={stepDraft} onChange={(e) => setStepDraft(e.target.value)} placeholder="Legg til et steg så lite at det er flaut" />
          <button className="btn ghost">+</button>
        </form>
      </div>
      <div className="row">
        <button className="btn ghost grow" onClick={onDrop}>Ikke nå</button>
        <button className="btn grow" onClick={() => onFinish(task)}>✅ Ferdig</button>
      </div>
      <style>{`.buddy{font-size:28px;animation:breathe 4s ease-in-out infinite}@keyframes breathe{50%{transform:scale(1.25);opacity:.7}}`}</style>
    </>
  )
}

boot(App)
