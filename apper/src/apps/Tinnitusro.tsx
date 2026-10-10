import { useEffect, useRef, useState } from 'react'
import { Btn, Row, Screen, Section, Seg, Stepper, TabBar, ToggleRow, fmtDur, num, toast, useNow, useStore } from '../kit'

type Color = 'white' | 'pink' | 'brown'

function makeNoise(ctx: AudioContext, color: Color) {
  const len = ctx.sampleRate * 4
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      if (color === 'white') d[i] = w * 0.5
      else if (color === 'pink') {
        // Paul Kellets pinkfilter
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852
        b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926
      } else { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 }
    }
  }
  return buf
}

// Logaritmisk skala 250 Hz – 12 kHz
const MIN = 250, MAX = 12000
const toHz = (t: number) => Math.round(MIN * Math.pow(MAX / MIN, t))
const toT = (hz: number) => Math.log(hz / MIN) / Math.log(MAX / MIN)

export default function Tinnitusro() {
  const [tab, setTab] = useState<'mask' | 'find'>('mask')
  const [color, setColor] = useStore<Color>('tinn:color', 'pink')
  const [vol, setVol] = useStore('tinn:vol', 0.35)
  const [freq, setFreq] = useStore('tinn:freq', 0)
  const [notch, setNotch] = useStore('tinn:notch', true)
  const [timerMin, setTimerMin] = useStore('tinn:timer', 30)
  const [playing, setPlaying] = useState(false)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [probe, setProbe] = useState(freq || 4000)
  const [toneOn, setToneOn] = useState(false)
  const now = useNow(1000)

  const ctx = useRef<AudioContext | null>(null)
  const nodes = useRef<{ src?: AudioBufferSourceNode; gain?: GainNode; osc?: OscillatorNode; oscGain?: GainNode }>({})
  const ac = () => (ctx.current ??= new AudioContext())

  const stop = () => {
    const n = nodes.current
    if (n.gain && ctx.current) { n.gain.gain.cancelScheduledValues(ctx.current.currentTime); n.gain.gain.setTargetAtTime(0, ctx.current.currentTime, 0.15) }
    const src = n.src; setTimeout(() => { try { src?.stop() } catch { /* allerede stoppet */ } }, 600)
    nodes.current.src = undefined; setPlaying(false); setEndsAt(null)
  }

  const start = () => {
    const c = ac(); c.resume()
    const src = c.createBufferSource(); src.buffer = makeNoise(c, color); src.loop = true
    let chain: AudioNode = src
    if (notch && freq > 0) {
      // To hakkfiltre i serie, ca. én oktav bredt, for dypere hakk rundt tinnitusfrekvensen
      for (let i = 0; i < 2; i++) { const f = c.createBiquadFilter(); f.type = 'notch'; f.frequency.value = freq; f.Q.value = 1.4; chain.connect(f); chain = f }
    }
    const g = c.createGain(); g.gain.value = 0; chain.connect(g); g.connect(c.destination)
    g.gain.setTargetAtTime(vol, c.currentTime, 0.4)
    src.start()
    nodes.current.src = src; nodes.current.gain = g
    setPlaying(true)
    if (timerMin > 0) {
      setEndsAt(Date.now() + timerMin * 60000)
      const fade = Math.min(60, timerMin * 60 * 0.2)
      g.gain.setValueAtTime(vol, c.currentTime + timerMin * 60 - fade)
      g.gain.linearRampToValueAtTime(0, c.currentTime + timerMin * 60)
    }
  }

  // Ny støytype / hakk mens den spiller: start på nytt
  useEffect(() => { if (playing) { stop(); setTimeout(start, 650) } }, [color, notch, freq])
  useEffect(() => { const g = nodes.current.gain; if (g && ctx.current && playing) g.gain.setTargetAtTime(vol, ctx.current.currentTime, 0.1) }, [vol, playing])
  useEffect(() => { if (endsAt && now >= endsAt) stop() }, [now, endsAt])

  // Tonegenerator
  useEffect(() => {
    if (!toneOn) { const n = nodes.current; if (n.oscGain && ctx.current) n.oscGain.gain.setTargetAtTime(0, ctx.current.currentTime, 0.05); const o = n.osc; setTimeout(() => { try { o?.stop() } catch { /* */ } }, 300); n.osc = undefined; return }
    const c = ac(); c.resume()
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = probe
    const g = c.createGain(); g.gain.value = 0; o.connect(g); g.connect(c.destination); g.gain.setTargetAtTime(0.06, c.currentTime, 0.05)
    o.start(); nodes.current.osc = o; nodes.current.oscGain = g
  }, [toneOn])
  useEffect(() => { const o = nodes.current.osc; if (o && ctx.current) o.frequency.setTargetAtTime(probe, ctx.current.currentTime, 0.02) }, [probe])
  useEffect(() => () => {
    try { nodes.current.src?.stop(); nodes.current.osc?.stop(); ctx.current?.close() } catch { /* */ }
    ctx.current = null; nodes.current = {}
  }, [])

  const t = toT(probe)
  return (
    <>
      {tab === 'mask' && (
        <Screen title="Mask">
          <div className="card center" style={{ background: 'linear-gradient(170deg,#0b3d4a,#062027)', color: '#fff', paddingTop: 28 }}>
            <button onClick={() => (playing ? stop() : start())} aria-label={playing ? 'Pause' : 'Spill'}
              style={{ width: 150, height: 150, borderRadius: '50%', border: 0, background: 'rgba(64,200,224,.18)', color: '#fff', fontSize: 54, boxShadow: playing ? '0 0 0 14px rgba(64,200,224,.12), 0 0 0 28px rgba(64,200,224,.06)' : 'none', transition: 'box-shadow 1.2s', animation: playing ? 'breathe 6s ease-in-out infinite' : undefined }}>
              {playing ? '❚❚' : '▶'}
            </button>
            <style>{'@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}'}</style>
            <div style={{ marginTop: 18, opacity: .8 }} className="small">
              {playing ? (endsAt ? `Tones ut om ${fmtDur(endsAt - now)}` : 'Spiller til du stopper') : 'Trykk for å starte'}
              {notch && freq > 0 && ' · hakk på ' + num(freq) + ' Hz'}
            </div>
          </div>
          <Seg value={color} onChange={setColor} options={[{ value: 'white', label: 'Hvit' }, { value: 'pink', label: 'Rosa' }, { value: 'brown', label: 'Brun' }]} />
          <Section header="Volum" footer="Masker med lavt volum, rett under tinnituslyden. Lyden skal ikke overdøve den.">
            <div className="row"><span>🔈</span><input type="range" min={0} max={1} step={0.01} value={vol} onChange={(e) => setVol(+e.target.value)} aria-label="Volum" /><span>🔊</span></div>
          </Section>
          <Section>
            <ToggleRow label="Hakkfilter" detail={freq ? `Fjerner energi rundt ${num(freq)} Hz` : 'Finn frekvensen din først'} checked={notch && freq > 0} onChange={(b) => freq ? setNotch(b) : (toast('Finn frekvensen først'), setTab('find'))} />
            <div className="row"><span className="row-main">Sovetimer</span><span className="row-value" style={{ color: 'var(--label)' }}>{timerMin ? `${timerMin} min` : 'Av'}</span><Stepper value={timerMin} onChange={setTimerMin} step={15} min={0} max={480} /></div>
          </Section>
        </Screen>
      )}

      {tab === 'find' && (
        <Screen title="Finn frekvens" subtitle="Bruk hodetelefoner og lavt volum. Skru på tonen og dra til den ligner pipet ditt.">
          <div className="card center">
            <div className="big-num">{num(probe)} <span style={{ fontSize: 22 }}>Hz</span></div>
            <svg viewBox="0 0 300 60" width="100%" height={60} style={{ margin: '10px 0' }}>
              <path d={Array.from({ length: 301 }, (_, x) => `${x ? 'L' : 'M'} ${x} ${30 + 22 * Math.sin((x / 300) * Math.PI * 2 * (2 + t * 18))}`).join(' ')} fill="none" stroke="var(--tint)" strokeWidth={2} />
            </svg>
            <input type="range" min={0} max={1} step={0.001} value={t} onChange={(e) => setProbe(toHz(+e.target.value))} aria-label="Frekvens" />
            <div className="small muted" style={{ display: 'flex', justifyContent: 'space-between' }}><span>250 Hz</span><span>1 k</span><span>4 k</span><span>12 k</span></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 14, alignItems: 'center' }}>
              <span className="small muted">Finjuster</span>
              <Stepper value={probe} onChange={setProbe} step={probe > 3000 ? 50 : 10} min={MIN} max={MAX} />
            </div>
          </div>
          <div className="btn-row">
            <Btn kind={toneOn ? 'danger' : 'tinted'} onClick={() => setToneOn(!toneOn)}>{toneOn ? 'Stopp tone' : 'Spill tone'}</Btn>
            <Btn onClick={() => { setFreq(probe); setNotch(true); setToneOn(false); toast(`Lagret ${num(probe)} Hz`) }}>Lagre som min</Btn>
          </div>
          <Section header="Lagret">
            <Row label="Min tinnitus" value={freq ? `${num(freq)} Hz` : 'Ikke satt'} />
          </Section>
          <p className="pad small muted">Tips: Tinnitus forveksles lett med en oktav over eller under. Sjekk også dobbel og halv frekvens. Ved ny, ensidig eller pulserende tinnitus: kontakt lege.</p>
        </Screen>
      )}

      <TabBar value={tab} onChange={(x) => { setTab(x); if (x === 'mask') setToneOn(false) }} tabs={[{ id: 'mask', label: 'Mask', icon: '🎧' }, { id: 'find', label: 'Finn frekvens', icon: '〰️' }]} />
    </>
  )
}
