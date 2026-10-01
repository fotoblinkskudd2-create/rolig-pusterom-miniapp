import { useEffect, useState } from 'react'

// Lag fra bunn til topp. Hvert lag spiser laget under.
const LAYERS = [
  { name: 'Alger', many: 'alger', icon: '🌿', cap: 24 },
  { name: 'Tanglopper', many: 'tanglopper', icon: '🦐', cap: 16 },
  { name: 'Småfisk', many: 'småfisk', icon: '🐟', cap: 10 },
  { name: 'Måke', many: 'måker', icon: '🐦', cap: 5 },
]
const START = [14, 8, 6, 2]
// Hvor mye hvert individ spiser per runde, og hvor mye mat som gir én ny.
const RATE = [0, 1, 0.5, 0.5]
const GROW = [0, 2, 1, 3]
const REGROW = 5
const ROUNDS = 12
const ROUND_MS = 8000
const BEST_KEY = 'fjaereplytt-best'

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function saveBest(score) {
  try {
    localStorage.setItem(BEST_KEY, String(score))
  } catch {
    // ingen lagring tilgjengelig – spillet virker likevel
  }
}

function newGame(prevBest) {
  return {
    prevBest,
    phase: 'play',
    round: 1,
    layers: [...START],
    action: null,
    deadline: Date.now() + ROUND_MS,
    log: ['Trykk et lag. Slipp ut eller vern.'],
    reason: '',
    score: 0,
  }
}

function resolve(g) {
  const before = [...g.layers]
  if (g.action?.type === 'out') {
    before[g.action.layer] = Math.max(1, before[g.action.layer] - 2)
  }
  const protectedLayer = g.action?.type === 'protect' ? g.action.layer : -1
  const next = [...before]
  const log = []
  const eatenOut = []

  for (let p = LAYERS.length - 1; p >= 1; p--) {
    const prey = p - 1
    const need = Math.ceil(before[p] * RATE[p])
    const got = prey === protectedLayer ? 0 : Math.min(before[prey], need)
    next[prey] -= got
    const short = need - got
    if (short > 0) next[p] -= Math.ceil(short / 2)
    else next[p] += Math.floor(got / GROW[p])
    if (next[prey] <= 0) eatenOut.push(prey)

    if (prey === protectedLayer) {
      log.push(`${LAYERS[p].name} fikk ingenting. ${LAYERS[prey].name} var vernet.`)
    } else {
      log.push(`${LAYERS[p].name} spiste ${got}. ${LAYERS[prey].name} igjen: ${Math.max(0, next[prey])}.`)
    }
  }
  next[0] += REGROW
  for (let i = 0; i < next.length; i++) {
    next[i] = Math.max(0, Math.min(LAYERS[i].cap, next[i]))
  }

  const dead = next.findIndex((n) => n === 0)
  if (dead >= 0) {
    const survived = g.round - 1
    const score = survived * Math.min(...g.layers)
    const reason = eatenOut.includes(dead)
      ? `${LAYERS[dead + 1].name} spiste opp alle ${LAYERS[dead].many}. Kjeden brast.`
      : `For lite ${LAYERS[dead - 1].many}. Alle ${LAYERS[dead].many} sultet bort.`
    return { ...g, phase: 'lost', layers: next, log, reason, score }
  }

  if (g.round >= ROUNDS) {
    return { ...g, phase: 'won', layers: next, log, score: ROUNDS * Math.min(...next) }
  }

  return {
    ...g,
    round: g.round + 1,
    layers: next,
    action: null,
    deadline: Date.now() + ROUND_MS,
    log,
  }
}

export default function App() {
  const [game, setGame] = useState({ phase: 'start', layers: [...START], log: [], round: 0 })
  const [best, setBest] = useState(readBest)
  const [picked, setPicked] = useState(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (game.phase !== 'play') return
    const id = setInterval(() => {
      const t = Date.now()
      setNow(t)
      setGame((g) => (g.phase === 'play' && t >= g.deadline ? resolve(g) : g))
    }, 100)
    return () => clearInterval(id)
  }, [game.phase])

  useEffect(() => {
    if (game.round) setPicked(null)
  }, [game.round])

  useEffect(() => {
    if ((game.phase === 'won' || game.phase === 'lost') && game.score > best) {
      setBest(game.score)
      saveBest(game.score)
    }
  }, [game.phase, game.score, best])

  const start = () => {
    setPicked(null)
    setGame(newGame(best))
  }

  const act = (type, layer) => {
    setGame((g) => ({ ...g, action: { type, layer } }))
    setPicked(null)
  }

  const runNow = () => setGame((g) => (g.phase === 'play' ? resolve(g) : g))

  const left = game.phase === 'play' ? Math.max(0, game.deadline - now) : 0
  const playing = game.phase === 'play'

  return (
    <main className="app">
      <header className="top">
        <h1>Fjæreplytt</h1>
        <div className="stats">
          <span>Runde {Math.max(1, game.round)}/{ROUNDS}</span>
          <span>Rekord {best}</span>
        </div>
      </header>

      {playing && (
        <div className="timer" aria-label="Tid igjen av runden">
          <div className="timer-fill" style={{ width: `${(left / ROUND_MS) * 100}%` }} />
        </div>
      )}

      <section className="pool">
        {[...LAYERS.keys()].reverse().map((i) => {
          const L = LAYERS[i]
          const count = game.layers[i]
          const marked = game.action?.layer === i ? game.action.type : null
          return (
            <div key={L.name} className={`layer layer-${i}`}>
              <button
                className={`layer-btn ${picked === i ? 'picked' : ''} ${count <= Math.max(1, L.cap * 0.2) ? 'low' : ''}`}
                disabled={!playing || game.action != null}
                onClick={() => setPicked(picked === i ? null : i)}
              >
                <span className="layer-name">
                  {L.name}
                  {marked === 'protect' && <span className="tag">🛡 vernet</span>}
                  {marked === 'out' && <span className="tag">↗ 2 sluppet ut</span>}
                </span>
                <span className="icons" aria-hidden="true">
                  {L.icon.repeat(Math.min(count, 12))}
                  {count > 12 ? '…' : ''}
                </span>
                <span className="count">{count}</span>
              </button>
              {picked === i && playing && (
                <div className="choices">
                  <button onClick={() => act('out', i)} disabled={count <= 1}>
                    Slipp ut 2
                  </button>
                  <button onClick={() => act('protect', i)} disabled={i === LAYERS.length - 1}>
                    Vern
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </section>

      <section className="log" aria-live="polite">
        {game.log.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      {playing && (
        <button className="primary" onClick={runNow}>
          {game.action ? 'Kjør runden nå' : 'Hopp over runden'}
        </button>
      )}

      {game.phase === 'start' && (
        <div className="overlay">
          <div className="card">
            <h2>Hold pytten i live</h2>
            <p>Hvert lag spiser laget under. Ett grep per runde.</p>
            <p>Overlev {ROUNDS} runder.</p>
            <button className="primary" onClick={start}>Start</button>
          </div>
        </div>
      )}

      {(game.phase === 'lost' || game.phase === 'won') && (
        <div className="overlay">
          <div className="card">
            <h2>{game.phase === 'won' ? 'Pytten lever!' : `Brast i runde ${game.round}`}</h2>
            {game.phase === 'lost' && <p className="reason">{game.reason}</p>}
            <p className="score">Poeng: {game.score}</p>
            <p className="hint">Runder × minste lag.</p>
            {game.score > game.prevBest && <p className="new-best">Ny rekord!</p>}
            <button className="primary" onClick={start}>Prøv igjen</button>
          </div>
        </div>
      )}
    </main>
  )
}
