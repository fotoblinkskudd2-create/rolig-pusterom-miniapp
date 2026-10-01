import { useEffect, useState } from 'react'

const ROUNDS = 8
const BEST_KEY = 'plantelop-best'
const CARDS = {
  lys: { icon: '☀️', label: 'Lys' },
  vann: { icon: '💧', label: 'Vann' },
  jord: { icon: '🟫', label: 'Jord' },
  luft: { icon: '💨', label: 'Luft' },
}
const DRAW = ['lys', 'lys', 'vann', 'vann', 'jord', 'jord', 'luft']
const POTS = [
  { name: 'Vindu', hint: 'Vanlig potte.', needLys: 1, drain: 1, pack: 1 },
  { name: 'Skygge', hint: 'Trenger 2 lys.', needLys: 2, drain: 1, pack: 1 },
  { name: 'Leire', hint: 'Vann pakker jorda fort.', needLys: 1, drain: 1, pack: 2 },
  { name: 'Sand', hint: 'Vannet renner fort ut.', needLys: 1, drain: 2, pack: 1 },
]
const MAX_WATER = 5

function drawHand() {
  const hand = ['lys']
  while (hand.length < 4) hand.push(DRAW[Math.floor(Math.random() * DRAW.length)])
  return hand.sort().map((type, i) => ({ id: `${Date.now()}-${i}`, type }))
}

function freshPots() {
  return POTS.map(() => ({ water: 2, food: 2, packed: 0, stage: 0, rot: 0, stretch: 0, dead: false, word: '' }))
}

function grow(pot, rules, cards) {
  if (pot.dead) return { ...pot }
  const n = (t) => cards.filter((c) => c.type === t).length
  const p = { ...pot }
  p.water = Math.min(MAX_WATER + 1, p.water + 2 * n('vann'))
  p.packed += rules.pack * n('vann')
  p.food = Math.min(4, p.food + 2 * n('jord'))
  if (n('luft') > 0) p.packed = 0

  if (p.water >= MAX_WATER) {
    p.rot += 1
    p.word = p.rot >= 2 ? 'Råtnet' : 'Råte'
    if (p.rot >= 2) p.dead = true
  } else {
    p.rot = 0
    if (p.water === 0) p.word = 'Tørst'
    else if (n('lys') < rules.needLys) {
      p.word = 'Strekker'
      p.stretch += 1
    } else if (p.food === 0) p.word = 'Sulten'
    else if (p.packed >= 3) p.word = 'Kvelt'
    else {
      p.stage += 1
      p.food -= 1
      p.word = p.stage >= 4 ? 'Blomst!' : 'Vokser'
    }
  }
  p.water = Math.max(0, p.water - rules.drain)
  return p
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

export default function App() {
  const [round, setRound] = useState(1)
  const [pots, setPots] = useState(freshPots)
  const [hand, setHand] = useState(drawHand)
  const [placed, setPlaced] = useState([[], [], [], []])
  const [selected, setSelected] = useState(null)
  const [misses, setMisses] = useState([{}, {}, {}, {}])
  const [end, setEnd] = useState(null)
  const [best, setBest] = useState(readBest)

  useEffect(() => {
    if (end?.won && (!best || end.round < best)) {
      setBest(end.round)
      try {
        localStorage.setItem(BEST_KEY, String(end.round))
      } catch {
        // uten lagring er rekorden bare for denne økten
      }
    }
  }, [end, best])

  const placeOn = (i) => {
    if (selected == null || pots[i].dead) return
    const card = hand.find((c) => c.id === selected)
    setHand(hand.filter((c) => c.id !== selected))
    setPlaced(placed.map((list, j) => (j === i ? [...list, card] : list)))
    setSelected(null)
  }

  const takeBack = (i, card) => {
    setPlaced(placed.map((list, j) => (j === i ? list.filter((c) => c.id !== card.id) : list)))
    setHand([...hand, card])
  }

  const nextRound = () => {
    const after = pots.map((p, i) => grow(p, POTS[i], placed[i]))
    const counted = misses.map((m, i) => {
      const w = after[i].word
      if (pots[i].dead || ['Vokser', 'Blomst!'].includes(w)) return m
      return { ...m, [w]: (m[w] || 0) + 1 }
    })
    setPots(after)
    setMisses(counted)
    setPlaced([[], [], [], []])
    setSelected(null)

    const bloomed = after.findIndex((p) => p.stage >= 4)
    if (bloomed >= 0) {
      setEnd({ won: true, round, pot: POTS[bloomed].name, prevBest: best })
    } else if (round >= ROUNDS || after.every((p) => p.dead)) {
      // Mangelen som stoppet planten som kom lengst.
      const top = after.reduce((bi, p, i) => (p.stage > after[bi].stage ? i : bi), 0)
      const worst = Object.entries(counted[top]).sort((a, b) => b[1] - a[1])[0]
      setEnd({ won: false, round, pot: POTS[top].name, worst: worst ? worst[0] : 'Tid' })
    } else {
      setRound(round + 1)
      setHand(drawHand())
    }
  }

  const restart = () => {
    setRound(1)
    setPots(freshPots())
    setHand(drawHand())
    setPlaced([[], [], [], []])
    setSelected(null)
    setMisses([{}, {}, {}, {}])
    setEnd(null)
  }

  return (
    <main className="app">
      <header className="top">
        <h1>Planteløp</h1>
        <div className="stats">
          <span>Runde {round}/{ROUNDS}</span>
          <span>Rekord {best ? `runde ${best}` : '–'}</span>
        </div>
      </header>

      <p className="goal">Få én plante i blomst. Gi kort, trykk potte.</p>

      <section className="pots">
        {pots.map((p, i) => {
          const rules = POTS[i]
          const height = p.stage * 16 + Math.min(p.stretch, 4) * 12
          return (
            <div
              key={rules.name}
              className={`pot ${selected != null && !p.dead ? 'target' : ''} ${p.dead ? 'dead' : ''}`}
              onClick={() => placeOn(i)}
              role="button"
              aria-label={`Potte ${rules.name}`}
            >
              <div className="pot-head">
                <strong>{rules.name}</strong>
                <span className="hint">{rules.hint}</span>
              </div>
              <div className="plant-area">
                <div className={`plant ${p.stretch > 0 ? 'pale' : ''}`}>
                  {p.stage >= 4 && <span className="flower">🌸</span>}
                  {p.stage === 3 && <span className="bud" />}
                  <div className="stem" style={{ height: `${8 + height}px` }}>
                    {p.stage >= 1 && <span className="leaf left" />}
                    {p.stage >= 2 && <span className="leaf right" />}
                  </div>
                </div>
                <div className="soil" />
              </div>
              <div className={`word ${!p.word ? 'calm' : p.word === 'Vokser' || p.word === 'Blomst!' ? 'good' : ''}`}>
                {p.word || 'Frø'}
              </div>
              <div className="meters">
                <span title="Vann">💧{'●'.repeat(p.water)}{'○'.repeat(Math.max(0, MAX_WATER - 1 - p.water))}</span>
                <span title="Næring">🟫{'●'.repeat(p.food)}{'○'.repeat(Math.max(0, 4 - p.food))}</span>
                <span title="Luft i jorda">💨{'●'.repeat(Math.max(0, 3 - p.packed))}{'○'.repeat(Math.min(3, p.packed))}</span>
              </div>
              <div className="placed">
                {placed[i].map((c) => (
                  <button
                    key={c.id}
                    className="chip"
                    onClick={(e) => {
                      e.stopPropagation()
                      takeBack(i, c)
                    }}
                    aria-label={`Ta tilbake ${CARDS[c.type].label}`}
                  >
                    {CARDS[c.type].icon}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className="hand" aria-label="Kort denne runden">
        {hand.map((c) => (
          <button
            key={c.id}
            className={`card-btn ${selected === c.id ? 'selected' : ''}`}
            onClick={() => setSelected(selected === c.id ? null : c.id)}
          >
            <span className="card-icon">{CARDS[c.type].icon}</span>
            {CARDS[c.type].label}
          </button>
        ))}
        {hand.length === 0 && <p className="empty">Alle kort er gitt.</p>}
      </section>

      <button className="primary" onClick={nextRound}>
        Neste runde
      </button>

      {end && (
        <div className="overlay">
          <div className="card">
            {end.won ? (
              <>
                <h2>🌸 Blomst i runde {end.round}!</h2>
                <p>{end.pot} klarte det.</p>
                {(!end.prevBest || end.round < end.prevBest) && <p className="new-best">Ny rekord!</p>}
              </>
            ) : (
              <>
                <h2>Ingen blomst</h2>
                <p>{end.pot} kom lengst. Det stoppet den:</p>
                <p className="reason">{end.worst}</p>
              </>
            )}
            <button className="primary" onClick={restart}>
              Spill igjen
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
