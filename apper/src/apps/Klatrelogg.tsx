import { useState } from 'react'
import { Btn, Empty, InputRow, Row, Screen, Section, Seg, StepperRow, TabBar, dayKey, fmtDate, fromDayKey, toast, uid, useStore } from '../kit'

type Kind = 'boulder' | 'rope'
type Result = 'flash' | 'top' | 'project'
type Climb = { id: string; date: number; kind: Kind; grade: string; attempts: number; result: Result; name: string }

const FONT = ['3', '4', '4+', '5', '5+', '6A', '6A+', '6B', '6B+', '6C', '6C+', '7A', '7A+', '7B', '7B+', '7C', '7C+', '8A', '8A+', '8B']
const V = ['VB', 'V0', 'V0+', 'V1', 'V2', 'V3', 'V3', 'V4', 'V4', 'V5', 'V5', 'V6', 'V7', 'V8', 'V8', 'V9', 'V10', 'V11', 'V12', 'V13']
const FRENCH = ['4', '5a', '5b', '5c', '6a', '6a+', '6b', '6b+', '6c', '6c+', '7a', '7a+', '7b', '7b+', '7c', '7c+', '8a', '8a+', '8b']
const RES: Record<Result, { l: string; c: string }> = { flash: { l: 'Flash', c: '#ffd60a' }, top: { l: 'Toppet', c: '#34c759' }, project: { l: 'Prosjekt', c: '#8e8e93' } }

export default function Klatrelogg() {
  const [tab, setTab] = useState<'log' | 'pyr' | 'sess'>('log')
  const [climbs, setClimbs] = useStore<Climb[]>('klatre:climbs', [])
  const [scale, setScale] = useStore<'font' | 'v'>('klatre:scale', 'font')
  const [kind, setKind] = useStore<Kind>('klatre:kind', 'boulder')
  const [grade, setGrade] = useState(kind === 'boulder' ? '6A' : '6a')
  const [attempts, setAttempts] = useState(1)
  const [result, setResult] = useState<Result>('top')
  const [name, setName] = useState('')
  const [pyrKind, setPyrKind] = useState<Kind>('boulder')

  const grades = kind === 'boulder' ? FONT : FRENCH
  const label = (k: Kind, g: string) => k === 'boulder' && scale === 'v' ? V[FONT.indexOf(g)] ?? g : g
  const today = dayKey()
  const todays = climbs.filter((c) => dayKey(c.date) === today)

  const save = () => {
    setClimbs([{ id: uid(), date: Date.now(), kind, grade, attempts, result: attempts > 1 && result === 'flash' ? 'top' : result, name }, ...climbs])
    toast(result === 'project' ? 'Prosjekt logget' : `${label(kind, grade)} ${result === 'flash' ? '⚡ flash!' : 'toppet 💪'}`)
    setAttempts(1); setName('')
  }

  const pg = pyrKind === 'boulder' ? FONT : FRENCH
  const sends = climbs.filter((c) => c.kind === pyrKind && c.result !== 'project')
  const counts = pg.map((g) => sends.filter((c) => c.grade === g).length)
  const maxIdx = counts.reduce((m, c, i) => (c ? i : m), -1)
  const rows = pg.map((g, i) => ({ g, n: counts[i] })).filter((_, i) => i <= maxIdx && i >= Math.max(0, maxIdx - 6)).reverse()
  const maxN = Math.max(1, ...rows.map((r) => r.n))
  const flashRate = sends.length ? Math.round((sends.filter((c) => c.result === 'flash').length / sends.length) * 100) : 0

  const byDay = climbs.reduce<Record<string, Climb[]>>((a, c) => { (a[dayKey(c.date)] ??= []).push(c); return a }, {})

  return (
    <>
      {tab === 'log' && (
        <Screen title="Logg">
          <Seg value={kind} onChange={(k) => { setKind(k); setGrade(k === 'boulder' ? '6A' : '6a') }} options={[{ value: 'boulder', label: 'Buldring' }, { value: 'rope', label: 'Tau' }]} />
          <Section header="Grad">
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: 12, scrollbarWidth: 'none' }}>
              {grades.map((g) => <button key={g} className={'chip' + (grade === g ? ' on' : '')} style={{ flex: 'none', fontWeight: 600 }} onClick={() => setGrade(g)}>{label(kind, g)}</button>)}
            </div>
          </Section>
          <Section>
            <StepperRow label="Forsøk" value={attempts} onChange={setAttempts} min={1} max={99} />
            <div className="row"><Seg style={{ flex: 1 }} value={result} onChange={setResult} options={(Object.keys(RES) as Result[]).map((r) => ({ value: r, label: RES[r].l }))} /></div>
            <InputRow label="Navn" value={name} onChange={setName} placeholder="valgfritt: «Lilla i hjørnet»" />
          </Section>
          <div className="btn-row"><Btn onClick={save}>Lagre {label(kind, grade)}</Btn></div>
          {todays.length > 0 && (
            <Section header={`I dag · ${todays.length} klatringer`}>
              {todays.map((c) => (
                <Row key={c.id} icon={label(c.kind, c.grade)} iconBg={RES[c.result].c} label={c.name || (c.kind === 'boulder' ? 'Buldre' : 'Rute')}
                  detail={`${RES[c.result].l} · ${c.attempts} forsøk`} value={<button className="navbtn small" onClick={() => setClimbs(climbs.filter((x) => x.id !== c.id))}>Angre</button>} />
              ))}
            </Section>
          )}
          <Section header="Innstilling">
            <div className="row"><span className="row-main">Buldregrad</span><Seg style={{ width: 160 }} value={scale} onChange={setScale} options={[{ value: 'font', label: 'Font' }, { value: 'v', label: 'V-skala' }]} /></div>
          </Section>
        </Screen>
      )}

      {tab === 'pyr' && (
        <Screen title="Pyramide">
          <Seg value={pyrKind} onChange={setPyrKind} options={[{ value: 'boulder', label: 'Buldring' }, { value: 'rope', label: 'Tau' }]} />
          {sends.length === 0 ? <Empty icon="🔺" title="Ingen topper ennå" text="Pyramiden bygges av alt du har toppet eller flashet." /> : (
            <>
              <div className="grid2">
                <div className="card"><div className="stat-l">Maks grad</div><div className="mid-num">{label(pyrKind, pg[maxIdx])}</div></div>
                <div className="card"><div className="stat-l">Flash-rate</div><div className="mid-num">{flashRate} %</div></div>
              </div>
              <div className="card">
                {rows.map((r) => (
                  <div key={r.g} style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0' }}>
                    <span style={{ width: 40, textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{label(pyrKind, r.g)}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      <div style={{ width: `${(r.n / maxN) * 100}%`, minWidth: r.n ? 18 : 0, height: 22, borderRadius: 5, background: 'var(--tint)', color: '#fff', fontSize: 12, display: 'grid', placeItems: 'center', transition: 'width .4s' }}>{r.n || ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Screen>
      )}

      {tab === 'sess' && (
        <Screen title="Økter">
          {Object.keys(byDay).length === 0 ? <Empty icon="🧗" title="Ingen økter" text="Logg klatringer, så dukker øktene opp her." /> : (
            <Section>
              {Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0])).map(([k, cs]) => {
                const top = cs.filter((c) => c.result !== 'project')
                const best = top.sort((a, b) => (a.kind === 'boulder' ? FONT : FRENCH).indexOf(b.grade) - (a.kind === 'boulder' ? FONT : FRENCH).indexOf(a.grade))[0]
                return <Row key={k} label={fmtDate(fromDayKey(k), { weekday: 'long', day: 'numeric', month: 'short' })}
                  detail={`${cs.length} klatringer · ${top.length} topper · ${cs.reduce((s, c) => s + c.attempts, 0)} forsøk`} value={best ? label(best.kind, best.grade) : '–'} />
              })}
            </Section>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'log', label: 'Logg', icon: '🧗' }, { id: 'pyr', label: 'Pyramide', icon: '🔺' }, { id: 'sess', label: 'Økter', icon: '📅' }]} />
    </>
  )
}
