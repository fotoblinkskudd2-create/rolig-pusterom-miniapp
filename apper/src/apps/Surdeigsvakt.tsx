import { useState } from 'react'
import { Btn, InputRow, NumRow, Ring, Row, Screen, Section, Seg, StepperRow, TabBar, fmtDate, fmtDur, fmtTime, num, toast, uid, useNow, useStore } from '../kit'

type Feed = { id: string; date: number; ratio: string }

function status(h: number) {
  if (h < 3) return { t: 'Nettopp matet – den våkner', c: 'var(--label2)' }
  if (h < 10) return { t: 'Aktiv – rundt toppen. Bak nå!', c: 'var(--green)' }
  if (h < 24) return { t: 'Sulten – på vei ned', c: 'var(--orange)' }
  return { t: 'Over et døgn. Kjøleskap? Ellers: mat den.', c: 'var(--red)' }
}
// Hvor høyt i glasset: stiger til topp ~6 t, synker mot 24 t
const rise = (h: number) => (h < 6 ? h / 6 : Math.max(0.15, 1 - (h - 6) / 22))

function Jar({ level }: { level: number }) {
  const y = 150 - level * 100
  return (
    <svg viewBox="0 0 120 170" width={120} height={170} style={{ display: 'block', margin: '0 auto' }}>
      <rect x="30" y="4" width="60" height="14" rx="3" fill="var(--brown)" />
      <path d="M22 22 h76 v128 a12 12 0 0 1 -12 12 h-52 a12 12 0 0 1 -12 -12 z" fill="var(--fill)" stroke="var(--label3)" strokeWidth="2" />
      <clipPath id="jar"><path d="M24 24 h72 v126 a10 10 0 0 1 -10 10 h-52 a10 10 0 0 1 -10 -10 z" /></clipPath>
      <g clipPath="url(#jar)">
        <rect x="20" y={y} width="80" height={170 - y} fill="#f3dfb5" style={{ transition: 'y 1s' }} />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={34 + i * 10} cy={y + 14 + (i % 3) * 18} r={2 + (i % 2)} fill="#d9bf8a" />)}
      </g>
      <line x1="98" y1="100" x2="104" y2="100" stroke="var(--label3)" strokeWidth="2" />
    </svg>
  )
}

export default function Surdeigsvakt() {
  const [tab, setTab] = useState<'starter' | 'ratio' | 'recipe' | 'proof'>('starter')
  const [name, setName] = useStore('surdeig:name', 'Kjell')
  const [feeds, setFeeds] = useStore<Feed[]>('surdeig:feeds', [])
  const [ratio, setRatio] = useStore('surdeig:ratio', '1:2:2')
  const [starterG, setStarterG] = useStore('surdeig:starterG', 30)
  const [rec, setRec] = useStore('surdeig:recipe', { total: 1600, hyd: 75, salt: 2, lev: 20 })
  const [proof, setProof] = useStore<{ start: number | null; hours: number }>('surdeig:proof', { start: null, hours: 4 })
  const now = useNow(15000)

  const last = feeds[0]
  const h = last ? (now - last.date) / 3600000 : 99
  const st = status(h)
  const [, f, w] = ratio.split(':').map(Number)

  // Bakerprosent: levain regnes som 100 % hydrert (halvt mel, halvt vann)
  const flour = rec.total / (1 + rec.hyd / 100 + rec.salt / 100 + rec.lev / 100)
  const water = flour * rec.hyd / 100, salt = flour * rec.salt / 100, lev = flour * rec.lev / 100
  const realHyd = ((water + lev / 2) / (flour + lev / 2)) * 100
  const proofLeft = proof.start ? proof.start + proof.hours * 3600000 - now : 0

  return (
    <>
      {tab === 'starter' && (
        <Screen title={name}>
          <div className="card center">
            <Jar level={last ? rise(h) : 0.2} />
            <div className="mid-num" style={{ fontSize: 22, marginTop: 8 }}>{last ? `Matet for ${h < 1 ? Math.round(h * 60) + ' min' : num(h, 1) + ' t'} siden` : 'Aldri matet her'}</div>
            <div style={{ color: st.c, marginTop: 4 }}>{last ? st.t : 'Logg første fôring'}</div>
            <div style={{ marginTop: 16 }}>
              <Btn onClick={() => { setFeeds([{ id: uid(), date: Date.now(), ratio }, ...feeds]); toast(`${name} er matet 🍞`) }}>Mat nå ({ratio})</Btn>
            </div>
          </div>
          <Section><InputRow label="Starterens navn" value={name} onChange={setName} /></Section>
          {feeds.length > 0 && (
            <Section header="Fôringslogg">
              {feeds.slice(0, 20).map((x, i) => (
                <Row key={x.id} label={`${fmtDate(x.date, { weekday: 'short', day: 'numeric', month: 'short' })} ${fmtTime(x.date)}`}
                  detail={feeds[i + 1] ? `${num((x.date - feeds[i + 1].date) / 3600000, 1)} t siden forrige` : undefined} value={x.ratio} />
              ))}
            </Section>
          )}
        </Screen>
      )}

      {tab === 'ratio' && (
        <Screen title="Fôring">
          <Seg value={ratio} onChange={setRatio} options={['1:1:1', '1:2:2', '1:5:5', '1:10:10'].map((r) => ({ value: r, label: r }))} />
          <Section footer="Høyere ratio = lengre tid til topp. 1:1:1 ca. 4 t, 1:5:5 ca. 8–10 t, 1:10:10 over natta (romtemp).">
            <StepperRow label="Starter" value={starterG} onChange={setStarterG} step={5} min={5} fmt={(n) => `${n} g`} />
          </Section>
          <div className="grid2">
            <div className="card center"><div className="stat-l">Mel</div><div className="mid-num">{starterG * f} g</div></div>
            <div className="card center"><div className="stat-l">Vann</div><div className="mid-num">{starterG * w} g</div></div>
          </div>
          <div className="card center"><div className="stat-l">Total starter etterpå</div><div className="mid-num">{starterG * (1 + f + w)} g</div></div>
        </Screen>
      )}

      {tab === 'recipe' && (
        <Screen title="Oppskrift" subtitle="Bakerprosent: alt regnes mot melet.">
          <Section header="Mål">
            <NumRow label="Total deigvekt" value={rec.total} onChange={(n) => setRec({ ...rec, total: n })} suffix="g" />
            <StepperRow label="Hydrering" value={rec.hyd} onChange={(n) => setRec({ ...rec, hyd: n })} step={1} min={50} max={100} fmt={(n) => `${n} %`} />
            <StepperRow label="Salt" value={rec.salt} onChange={(n) => setRec({ ...rec, salt: n })} step={0.1} min={0} max={4} fmt={(n) => `${num(n, 1)} %`} />
            <StepperRow label="Levain" value={rec.lev} onChange={(n) => setRec({ ...rec, lev: n })} step={1} min={0} max={50} fmt={(n) => `${n} %`} />
          </Section>
          <Section header="Vei opp" footer={`Reell hydrering med levain (100 %): ${num(realHyd, 1)} %`}>
            <Row label="Mel" value={<b style={{ color: 'var(--label)' }}>{Math.round(flour)} g</b>} detail="100 %" />
            <Row label="Vann" value={<b style={{ color: 'var(--label)' }}>{Math.round(water)} g</b>} detail={`${rec.hyd} %`} />
            <Row label="Levain" value={<b style={{ color: 'var(--label)' }}>{Math.round(lev)} g</b>} detail={`${rec.lev} %`} />
            <Row label="Salt" value={<b style={{ color: 'var(--label)' }}>{num(salt, 1)} g</b>} detail={`${num(rec.salt, 1)} %`} />
          </Section>
        </Screen>
      )}

      {tab === 'proof' && (
        <Screen title="Heving">
          <div className="card">
            <Ring value={proof.start ? 1 - proofLeft / (proof.hours * 3600000) : 0} size={210}>
              <div>
                <div className="big-num" style={{ fontSize: 40 }}>{proof.start ? (proofLeft > 0 ? fmtDur(proofLeft) : 'Klar!') : `${proof.hours} t`}</div>
                <div className="muted small">{proof.start ? `startet ${fmtTime(proof.start)}` : 'ikke startet'}</div>
              </div>
            </Ring>
          </div>
          {!proof.start && (
            <Section><StepperRow label="Varighet" value={proof.hours} onChange={(n) => setProof({ ...proof, hours: n })} step={0.5} min={0.5} max={24} fmt={(n) => `${num(n, 1)} t`} /></Section>
          )}
          <div className="btn-row">
            {proof.start
              ? <Btn kind="gray" onClick={() => setProof({ ...proof, start: null })}>Nullstill</Btn>
              : <Btn onClick={() => { setProof({ ...proof, start: Date.now() }); toast('Hevingen er i gang') }}>Start heving</Btn>}
          </div>
          <p className="pad small muted">Poke-test: Trykk en finger 1 cm inn. Kommer gropa sakte tilbake, er deigen klar. Spretter den rett tilbake, trenger den mer tid.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[
        { id: 'starter', label: 'Starter', icon: '🫙' }, { id: 'ratio', label: 'Fôring', icon: '⚖️' },
        { id: 'recipe', label: 'Oppskrift', icon: '📋' }, { id: 'proof', label: 'Heving', icon: '⏲️' }]} />
    </>
  )
}
