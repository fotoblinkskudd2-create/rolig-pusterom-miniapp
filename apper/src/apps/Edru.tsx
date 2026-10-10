import { useEffect, useState } from 'react'
import {
  Btn, Chips, ConfirmRow, Empty, InputRow, NumRow, Progress, Row, Screen, Section, TabBar,
  fmtDate, fmtDur, haptic, kr, toast, useNow, useStore,
} from '../kit'

type Streak = { start: number; end: number }
type Urge = { date: number; trigger: string[]; surfed: boolean }
const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365, 730, 1095, 1825]
const TRIGGERS = ['Stress', 'Ensomhet', 'Kjedsomhet', 'Fest', 'Fredag', 'Krangel', 'Sliten', 'Sulten', 'Penger', 'Feiring', 'Smerte', 'Vet ikke']
const URGE_MS = 10 * 60000

function parts(ms: number) {
  const s = Math.floor(ms / 1000)
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

export default function Edru() {
  const [tab, setTab] = useState<'count' | 'wave' | 'hist'>('count')
  const [start, setStart] = useStore<number | null>('edru:start', null)
  const [what, setWhat] = useStore('edru:what', 'alkohol')
  const [cost, setCost] = useStore('edru:cost', 150)
  const [streaks, setStreaks] = useStore<Streak[]>('edru:streaks', [])
  const [urges, setUrges] = useStore<Urge[]>('edru:urges', [])
  const [wave, setWave] = useState<number | null>(null)
  const [after, setAfter] = useState(false)
  const [trig, setTrig] = useState<string[]>([])
  const now = useNow(tab === 'wave' && wave ? 80 : 1000)

  const ms = start ? now - start : 0
  const p = parts(ms), days = ms / 864e5
  const next = MILESTONES.find((m) => m > days) ?? Math.ceil(days / 365 + 1) * 365
  const prev = [...MILESTONES].reverse().find((m) => m <= days) ?? 0
  const totalDays = streaks.reduce((s, x) => s + (x.end - x.start) / 864e5, 0) + days
  const longest = Math.max(days, ...streaks.map((x) => (x.end - x.start) / 864e5))

  useEffect(() => {
    if (wave && now - wave >= URGE_MS) { setWave(null); setAfter(true); haptic([30, 80, 30]) }
  }, [now, wave])

  const waveT = wave ? (now - wave) / URGE_MS : 0
  const amp = Math.sin(waveT * Math.PI) * 40 + 8 // trangen stiger og legger seg
  const waveText = waveT < 0.3 ? 'Trangen stiger. Det er greit. Bare legg merke til den.' : waveT < 0.6 ? 'Den topper seg. Pust ut lenger enn du puster inn.' : 'Den legger seg. Bli her litt til.'

  return (
    <>
      {tab === 'count' && (
        <Screen title="Teller">
          {!start ? (
            <>
              <Empty icon="🌅" title="Dag én er i dag" text="Ingen skam, ingen nullstilling av historien. Bare en start." />
              <Section>
                <InputRow label="Fri fra" value={what} onChange={setWhat} placeholder="alkohol, spill, …" />
                <NumRow label="Brukte per dag" value={cost} onChange={setCost} suffix="kr" />
                <InputRow label="Startet" type="datetime-local" value="" onChange={(v) => v && setStart(new Date(v).getTime())} />
              </Section>
              <div className="btn-row"><Btn onClick={() => setStart(Date.now())}>Start nå</Btn></div>
            </>
          ) : (
            <>
              <div className="card center" style={{ background: 'linear-gradient(160deg,#ffcf7a,#ff8a00)', color: '#3a1d00' }}>
                <div className="stat-l" style={{ color: '#3a1d00' }}>Fri fra {what}</div>
                <div className="big-num" style={{ fontSize: 72 }}>{p.d}</div>
                <div style={{ fontWeight: 600 }}>{p.d === 1 ? 'dag' : 'dager'}</div>
                <div className="mid-num" style={{ fontSize: 22, marginTop: 6, fontFamily: 'var(--mono)' }}>{p.h} t {p.m} min {p.s} s</div>
              </div>
              <div className="grid2">
                <div className="card"><div className="stat-l">Spart</div><div className="mid-num">{kr(days * cost)}</div></div>
                <div className="card"><div className="stat-l">Bølger ridd</div><div className="mid-num">{urges.filter((u) => u.surfed).length}</div></div>
              </div>
              <Section header={`Neste milepæl: ${next} dager`} footer={`${Math.max(0, Math.ceil(next - days))} dager igjen`}>
                <div className="row" style={{ display: 'block' }}><Progress value={(days - prev) / (next - prev)} /></div>
              </Section>
              <div className="btn-row"><Btn kind="tinted" onClick={() => setTab('wave')}>🌊 Jeg har trang nå</Btn></div>
            </>
          )}
        </Screen>
      )}

      {tab === 'wave' && (
        <Screen title="Bølgen" subtitle="Trang varer sjelden mer enn 10–20 minutter. Du trenger ikke kjempe. Bare ri den.">
          {after ? (
            <>
              <div className="card center"><div style={{ fontSize: 48 }}>🌅</div><div className="mid-num">Du red den.</div><div className="muted">Hva trigget den?</div></div>
              <Section><div className="row"><Chips options={TRIGGERS} value={trig} onToggle={(t) => setTrig(trig.includes(t) ? trig.filter((x) => x !== t) : [...trig, t])} /></div></Section>
              <div className="btn-row"><Btn onClick={() => { setUrges([{ date: Date.now(), trigger: trig, surfed: true }, ...urges]); setAfter(false); setTrig([]); toast('Logget. Godt jobba.'); setTab('count') }}>Lagre</Btn></div>
            </>
          ) : (
            <>
              <div className="card" style={{ background: '#0c1a33', color: '#fff', overflow: 'hidden', padding: 0 }}>
                <svg viewBox="0 0 300 160" width="100%" style={{ display: 'block' }}>
                  <path d={`M 0 160 ${Array.from({ length: 61 }, (_, i) => `L ${i * 5} ${100 - amp * Math.sin(i / 6 + now / 700) * (wave ? 1 : 0.3)}`).join(' ')} L 300 160 Z`} fill="#ff8a00" opacity=".85" />
                  <path d={`M 0 160 ${Array.from({ length: 61 }, (_, i) => `L ${i * 5} ${112 - amp * 0.7 * Math.sin(i / 5 + now / 900 + 1) * (wave ? 1 : 0.3)}`).join(' ')} L 300 160 Z`} fill="#ffb340" opacity=".6" />
                </svg>
                <div className="center" style={{ padding: '6px 16px 20px' }}>
                  <div className="big-num" style={{ fontSize: 44 }}>{wave ? fmtDur(URGE_MS - (now - wave)) : '10:00'}</div>
                  <div style={{ opacity: .8, marginTop: 6, minHeight: 40 }}>{wave ? waveText : 'Sett deg ned. Trykk start. Pust.'}</div>
                </div>
              </div>
              <div className="btn-row">{wave ? <Btn kind="gray" onClick={() => { setWave(null); setAfter(true) }}>Den har lagt seg</Btn> : <Btn onClick={() => setWave(Date.now())}>Start bølgen</Btn>}</div>
              <p className="pad small muted">Trenger du noen å snakke med nå? Rusinfo: 915 08 588. Mental Helse hjelpetelefon: 116 123 (døgnåpen).</p>
            </>
          )}
        </Screen>
      )}

      {tab === 'hist' && (
        <Screen title="Historikk" subtitle="Hver dag teller fortsatt. Rekker blir ikke slettet.">
          <div className="grid2">
            <div className="card"><div className="stat-l">Totalt fri</div><div className="mid-num">{Math.floor(totalDays)} d</div></div>
            <div className="card"><div className="stat-l">Lengste rekke</div><div className="mid-num">{Math.floor(longest)} d</div></div>
          </div>
          {streaks.length + (start ? 1 : 0) > 0 ? (
            <Section header="Rekker">
              {[...streaks, ...(start ? [{ start, end: now }] : [])].reverse().map((s, i) => (
                <div className="row" key={s.start} style={{ display: 'block' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>{fmtDate(s.start, { dateStyle: 'medium' })}{i === 0 && start ? ' · nå' : ` – ${fmtDate(s.end, { dateStyle: 'medium' })}`}</span>
                    <b>{Math.floor((s.end - s.start) / 864e5)} d</b>
                  </div>
                  <Progress value={(s.end - s.start) / 864e5 / Math.max(1, longest)} />
                </div>
              ))}
            </Section>
          ) : <Empty icon="📈" title="Ingen historikk ennå" />}
          {urges.length > 0 && (
            <Section header="Triggere">
              {TRIGGERS.map((t) => ({ t, n: urges.filter((u) => u.trigger.includes(t)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n).map((x) => <Row key={x.t} label={x.t} value={x.n} />)}
            </Section>
          )}
          {start && (
            <Section footer="Sprekk skjer. Rekken du hadde blir lagret, og en ny starter nå.">
              <ConfirmRow label="Ny start" confirmLabel="Trykk igjen – rekken lagres" onConfirm={() => { setStreaks([...streaks, { start, end: Date.now() }]); setStart(Date.now()); toast('Ny start. Dag én igjen, men ikke fra null.') }} />
            </Section>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'count', label: 'Teller', icon: '🌅' }, { id: 'wave', label: 'Bølgen', icon: '🌊' }, { id: 'hist', label: 'Historikk', icon: '📈' }]} />
    </>
  )
}
