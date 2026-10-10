import { useMemo, useState } from 'react'
import { Btn, NumRow, Row, Screen, Section, StepperRow, TabBar, num, uid, useStore } from '../kit'

type Cut = { id: string; len: number; qty: number }
type Board = { cuts: number[]; used: number }

/** First-fit decreasing: lengste kapp først, inn i første lengde det passer i. Sagsnitt tas etter hvert kapp. */
export function packCuts(cuts: Cut[], stock: number, kerf: number) {
  const all = cuts.flatMap((c) => Array.from({ length: Math.max(0, Math.floor(c.qty)) }, () => c.len)).filter((l) => l > 0).sort((a, b) => b - a)
  const tooLong = all.filter((l) => l > stock)
  const boards: Board[] = []
  for (const len of all.filter((l) => l <= stock)) {
    const b = boards.find((x) => x.used + len <= stock)
    if (b) { b.cuts.push(len); b.used += len + kerf } else boards.push({ cuts: [len], used: len + kerf })
  }
  const total = all.filter((l) => l <= stock).reduce((s, l) => s + l, 0)
  const waste = boards.length ? 1 - total / (boards.length * stock) : 0
  return { boards, tooLong, waste, total }
}

const PALETTE = ['#c9a46b', '#a2742f', '#d9b98a', '#8a6a3f', '#e3c99d', '#b88d4f']

export default function Snekkerkalk() {
  const [tab, setTab] = useState<'cut' | 'stair'>('cut')
  const [stock, setStock] = useStore('snekker:stock', 4800)
  const [kerf, setKerf] = useStore('snekker:kerf', 3)
  const [cuts, setCuts] = useStore<Cut[]>('snekker:cuts', [{ id: 'a', len: 1200, qty: 6 }, { id: 'b', len: 900, qty: 4 }, { id: 'c', len: 2400, qty: 3 }])
  const [stair, setStair] = useStore('snekker:stair', { rise: 2700, run: 0, steps: 0 })

  const res = useMemo(() => packCuts(cuts, stock, kerf), [cuts, stock, kerf])
  const color = (len: number) => PALETTE[[...new Set(cuts.map((c) => c.len))].indexOf(len) % PALETTE.length]

  // Trapp
  const autoSteps = Math.max(2, Math.round(stair.rise / 180))
  const n = stair.steps || autoSteps
  const R = stair.rise / n
  const G = stair.run > 0 ? stair.run / (n - 1) : 620 - 2 * R
  const rule = 2 * R + G
  const run = G * (n - 1)
  const angle = (Math.atan(R / G) * 180) / Math.PI
  const ok = rule >= 600 && rule <= 650 && R >= 150 && R <= 200 && G >= 220

  return (
    <>
      {tab === 'cut' && (
        <Screen title="Kappliste">
          <Section header="Materiale">
            <NumRow label="Lengde på plank" value={stock} onChange={setStock} suffix="mm" />
            <NumRow label="Sagsnitt" value={kerf} onChange={setKerf} suffix="mm" />
          </Section>
          <Section header="Kapp (lengde × antall)">
            {cuts.map((c) => (
              <div className="row" key={c.id}>
                <input className="inline left" inputMode="numeric" value={c.len || ''} placeholder="mm" aria-label="Lengde i mm" style={{ maxWidth: 90 }}
                  onChange={(e) => setCuts(cuts.map((x) => x.id === c.id ? { ...x, len: +e.target.value.replace(/\D/g, '') } : x))} />
                <span className="muted">mm ×</span>
                <input className="inline left" inputMode="numeric" value={c.qty || ''} aria-label="Antall" style={{ maxWidth: 50 }}
                  onChange={(e) => setCuts(cuts.map((x) => x.id === c.id ? { ...x, qty: +e.target.value.replace(/\D/g, '') } : x))} />
                <span style={{ flex: 1 }} />
                <span style={{ width: 14, height: 14, borderRadius: 3, background: color(c.len) }} />
                <button className="navbtn" onClick={() => setCuts(cuts.filter((x) => x.id !== c.id))} aria-label="Fjern">✕</button>
              </div>
            ))}
            <Row className="action" label="＋ Legg til kapp" onClick={() => setCuts([...cuts, { id: uid(), len: 0, qty: 1 }])} />
          </Section>
          <div className="card center">
            <div className="big-num" style={{ fontSize: 48 }}>{res.boards.length} <span style={{ fontSize: 22 }}>lengder</span></div>
            <div className="muted">{num(res.waste * 100, 1)} % svinn · {num(res.total / 1000, 2)} m kapp</div>
            {res.tooLong.length > 0 && <div style={{ color: 'var(--red)', marginTop: 8 }}>{res.tooLong.length} kapp er lengre enn planken!</div>}
          </div>
          {res.boards.length > 0 && (
            <Section header="Kappeplan">
              {res.boards.map((b, i) => (
                <div className="row" key={i} style={{ display: 'block' }}>
                  <div className="small muted" style={{ marginBottom: 4 }}>#{i + 1} · rest {Math.max(0, Math.round(stock - b.used + kerf))} mm</div>
                  <div style={{ display: 'flex', height: 26, borderRadius: 4, overflow: 'hidden', background: 'repeating-linear-gradient(45deg, var(--fill) 0 4px, transparent 4px 8px)' }}>
                    {b.cuts.map((c, j) => (
                      <div key={j} style={{ width: `${(c / stock) * 100}%`, background: color(c), borderRight: `${Math.max(1, (kerf / stock) * 300)}px solid var(--bg2)`, fontSize: 10, color: '#3b2a12', display: 'grid', placeItems: 'center', overflow: 'hidden', whiteSpace: 'nowrap', fontWeight: 600 }}>{c}</div>
                    ))}
                  </div>
                </div>
              ))}
            </Section>
          )}
        </Screen>
      )}

      {tab === 'stair' && (
        <Screen title="Trapp">
          <Section header="Mål" footer="La «Tilgjengelig lengde» stå på 0 for å få anbefalt inntrinn fra regelen 2 × opptrinn + inntrinn ≈ 620 mm.">
            <NumRow label="Total høyde" value={stair.rise} onChange={(v) => setStair({ ...stair, rise: v })} suffix="mm" />
            <NumRow label="Tilgjengelig lengde" value={stair.run} onChange={(v) => setStair({ ...stair, run: v })} suffix="mm" />
            <StepperRow label="Antall opptrinn" value={n} onChange={(v) => setStair({ ...stair, steps: v })} min={2} max={40} />
          </Section>
          <div className="card">
            <svg viewBox={`0 0 ${run + G} ${stair.rise}`} width="100%" height={180} preserveAspectRatio="xMidYMid meet">
              <path d={'M 0 ' + stair.rise + Array.from({ length: n }, (_, i) => ` L ${i * G} ${stair.rise - (i + 1) * R} L ${(i + 1) * G} ${stair.rise - (i + 1) * R}`).join('') + ` L ${n * G} ${stair.rise} Z`}
                fill="#c9a46b" stroke="#5c4326" strokeWidth={stair.rise / 120} />
            </svg>
          </div>
          <div className="grid2">
            <div className="card"><div className="stat-l">Opptrinn</div><div className="mid-num">{num(R, 0)} mm</div></div>
            <div className="card"><div className="stat-l">Inntrinn</div><div className="mid-num">{num(G, 0)} mm</div></div>
            <div className="card"><div className="stat-l">Total lengde</div><div className="mid-num">{num(run, 0)} mm</div></div>
            <div className="card"><div className="stat-l">Stigning</div><div className="mid-num">{num(angle, 1)}°</div></div>
          </div>
          <Section>
            <Row label="2 × opptrinn + inntrinn" value={<span className="tag" style={ok ? { background: 'color-mix(in srgb, var(--green) 18%, transparent)', color: 'var(--green)' } : { background: 'color-mix(in srgb, var(--red) 15%, transparent)', color: 'var(--red)' }}>{num(rule, 0)} mm {ok ? '✓' : '✗'}</span>} />
          </Section>
          <p className="pad small muted">Komfortsonen er ca. 600–650 mm, med opptrinn 150–200 mm. Sjekk gjeldende byggteknisk forskrift for trappa du skal bygge.</p>
          {stair.steps > 0 && <div className="btn-row"><Btn kind="gray" onClick={() => setStair({ ...stair, steps: 0 })}>Tilbake til automatisk antall</Btn></div>}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'cut', label: 'Kappliste', icon: '🪚' }, { id: 'stair', label: 'Trapp', icon: '🪜' }]} />
    </>
  )
}
