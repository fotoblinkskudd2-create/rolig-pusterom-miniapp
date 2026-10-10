import { useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, NumRow, Row, Screen, Section, Seg, Sheet, TabBar,
  dayKey, daysBetween, downloadText, fmtDate, fromDayKey, kr, toast, uid, useStore,
} from '../kit'

type P = 'A' | 'B'
type Pattern = '7/7' | '2-2-3' | 'eow'
type Setup = { a: string; b: string; pattern: Pattern; start: string }
type Exp = { id: string; what: string; amount: number; paidBy: P; shareA: number; date: number }
type Note = { id: string; text: string; date: number; done: boolean }

const COL: Record<P, string> = { A: '#30a14e', B: '#e0a458' }
const CYCLE_223: P[] = ['A', 'A', 'B', 'B', 'A', 'A', 'A', 'B', 'B', 'A', 'A', 'B', 'B', 'B']

/** Hvem har barna en gitt dato. Startdato = første dag forelder A har dem. */
export function who(s: Setup, d: Date): P {
  const n = daysBetween(fromDayKey(s.start), d), mod = (x: number, m: number) => ((x % m) + m) % m
  if (s.pattern === '7/7') return mod(Math.floor(n / 7), 2) === 0 ? 'A' : 'B'
  if (s.pattern === '2-2-3') return CYCLE_223[mod(n, 14)]
  const wd = d.getDay(), week = mod(Math.floor((n + mod(fromDayKey(s.start).getDay() - 1, 7)) / 7), 2)
  return week === 1 && (wd === 5 || wd === 6 || wd === 0) ? 'B' : 'A'
}

/** > 0: B skylder A. < 0: A skylder B. */
export const balance = (exps: Exp[]) => exps.reduce((s, e) => e.paidBy === 'A' ? s + (e.amount * (100 - e.shareA)) / 100 : s - (e.amount * e.shareA) / 100, 0)

export default function Samvaer() {
  const [tab, setTab] = useState<'cal' | 'exp' | 'notes'>('cal')
  const [setup, setSetup] = useStore<Setup>('samvaer:setup', { a: 'Forelder A', b: 'Forelder B', pattern: '7/7', start: dayKey() })
  const [exps, setExps] = useStore<Exp[]>('samvaer:exps', [])
  const [notes, setNotes] = useStore<Note[]>('samvaer:notes', [])
  const [month, setMonth] = useState(0)
  const [editExp, setEditExp] = useState<Exp | null>(null)
  const [noteText, setNoteText] = useState('')
  const [settings, setSettings] = useState(false)

  const name = (p: P) => (p === 'A' ? setup.a : setup.b)
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + month)
  const y = base.getFullYear(), m = base.getMonth()
  const first = (new Date(y, m, 1).getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate()
  const today = new Date()
  const bal = balance(exps)
  const nextHandover = (() => { const cur = who(setup, today); for (let i = 1; i < 30; i++) { const d = new Date(); d.setDate(d.getDate() + i); if (who(setup, d) !== cur) return d } return null })()

  const exportTxt = () => downloadText('samvaer.txt', [
    'SAMVÆR – eksport ' + new Date().toLocaleString('nb-NO'), '',
    `Mønster: ${setup.pattern === 'eow' ? 'Annenhver helg' : setup.pattern} fra ${setup.start}`, '',
    'UTGIFTER:', ...exps.map((e) => `${fmtDate(e.date, { dateStyle: 'short' })}  ${e.what}  ${kr(e.amount)}  betalt av ${name(e.paidBy)}  (${e.shareA}/${100 - e.shareA})`),
    '', bal > 0.5 ? `${setup.b} skylder ${setup.a} ${kr(bal)}` : bal < -0.5 ? `${setup.a} skylder ${setup.b} ${kr(-bal)}` : 'I balanse',
  ].join('\n'))

  return (
    <>
      {tab === 'cal' && (
        <Screen title="Kalender" right={<button className="navbtn" onClick={() => setSettings(true)}>Oppsett</button>}>
          <div className="card center">
            <div className="stat-l">I dag er barna hos</div>
            <div className="mid-num" style={{ color: COL[who(setup, today)] }}>{name(who(setup, today))}</div>
            {nextHandover && <div className="muted small">Neste overlevering {fmtDate(nextHandover, { weekday: 'long', day: 'numeric', month: 'short' })} → {name(who(setup, nextHandover))}</div>}
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <button className="navbtn" onClick={() => setMonth(month - 1)} aria-label="Forrige måned">‹</button>
              <b style={{ textTransform: 'capitalize' }}>{base.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' })}</b>
              <button className="navbtn" onClick={() => setMonth(month + 1)} aria-label="Neste måned">›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, textAlign: 'center' }}>
              {['M', 'T', 'O', 'T', 'F', 'L', 'S'].map((d, i) => <div key={i} className="small muted">{d}</div>)}
              {Array.from({ length: first }, (_, i) => <div key={'e' + i} />)}
              {Array.from({ length: dim }, (_, i) => {
                const d = new Date(y, m, i + 1), p = who(setup, d), prev = new Date(y, m, i), handover = who(setup, prev) !== p
                const isToday = dayKey(d) === dayKey(today)
                return (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: COL[p] + (isToday ? '' : '33'), color: isToday ? '#fff' : undefined, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: isToday ? 700 : 400, position: 'relative' }}>
                    {i + 1}{handover && <span style={{ position: 'absolute', top: 1, right: 3, fontSize: 9 }}>⇄</span>}
                  </div>
                )
              })}
            </div>
            <div className="small" style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 12 }}>
              <span><b style={{ color: COL.A }}>■</b> {setup.a}</span><span><b style={{ color: COL.B }}>■</b> {setup.b}</span><span>⇄ overlevering</span>
            </div>
          </div>
        </Screen>
      )}

      {tab === 'exp' && (
        <Screen title="Utgifter" right={<button className="navbtn" onClick={() => setEditExp({ id: uid(), what: '', amount: 0, paidBy: 'A', shareA: 50, date: Date.now() })}>＋</button>}>
          <div className="card center">
            <div className="mid-num">{Math.abs(bal) < 0.5 ? 'I balanse' : bal > 0 ? `${setup.b} skylder ${setup.a}` : `${setup.a} skylder ${setup.b}`}</div>
            {Math.abs(bal) >= 0.5 && <div className="big-num" style={{ fontSize: 40, marginTop: 4 }}>{kr(Math.abs(bal))}</div>}
            {Math.abs(bal) >= 0.5 && <div style={{ marginTop: 14 }}><Btn kind="tinted" onClick={() => { setExps([{ id: uid(), what: 'Oppgjør', amount: Math.abs(bal), paidBy: bal > 0 ? 'B' : 'A', shareA: bal > 0 ? 100 : 0, date: Date.now() }, ...exps]); toast('Oppgjør registrert') }}>Registrer oppgjør</Btn></div>}
          </div>
          {exps.length === 0 ? <Empty icon="🧾" title="Ingen utgifter" text="Fotballsko, tannlege, SFO. Legg inn hvem som betalte og hvordan det deles." /> : (
            <Section>
              {exps.map((e) => (
                <Row key={e.id} onClick={() => setEditExp(e)} icon={e.paidBy} iconBg={COL[e.paidBy]} label={e.what}
                  detail={`${fmtDate(e.date)} · betalt av ${name(e.paidBy)} · ${e.shareA}/${100 - e.shareA}`} value={kr(e.amount)} />
              ))}
            </Section>
          )}
          <div className="btn-row"><Btn kind="gray" onClick={exportTxt}>Eksporter .txt</Btn></div>
        </Screen>
      )}

      {tab === 'notes' && (
        <Screen title="Overlevering" subtitle="Ting den andre må vite. Kort og nøytralt.">
          <Section>
            <div className="row">
              <input className="inline left" placeholder="Medisin i sekken, gymtøy på fredag …" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
              <Btn small kind="tinted" disabled={!noteText.trim()} onClick={() => { setNotes([{ id: uid(), text: noteText.trim(), date: Date.now(), done: false }, ...notes]); setNoteText('') }}>Legg til</Btn>
            </div>
          </Section>
          {notes.length > 0 && (
            <Section>
              {notes.map((n) => (
                <Row key={n.id} label={<span style={{ textDecoration: n.done ? 'line-through' : undefined, opacity: n.done ? 0.5 : 1 }}>{n.text}</span>} detail={fmtDate(n.date)}
                  onClick={() => setNotes(notes.map((x) => x.id === n.id ? { ...x, done: !x.done } : x))}
                  value={<span style={{ fontSize: 22, color: n.done ? 'var(--green)' : 'var(--label3)' }}>{n.done ? '●' : '○'}</span>} />
              ))}
              {notes.some((n) => n.done) && <Row className="action" label="Fjern ferdige" onClick={() => setNotes(notes.filter((n) => !n.done))} />}
            </Section>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'cal', label: 'Kalender', icon: '📅' }, { id: 'exp', label: 'Utgifter', icon: '🧾' }, { id: 'notes', label: 'Overlevering', icon: '🎒' }]} />

      <Sheet open={settings} onClose={() => setSettings(false)} title="Oppsett" action={{ label: 'Ferdig', onClick: () => setSettings(false) }}>
        <Section>
          <InputRow label="Forelder A" value={setup.a} onChange={(v) => setSetup({ ...setup, a: v })} />
          <InputRow label="Forelder B" value={setup.b} onChange={(v) => setSetup({ ...setup, b: v })} />
        </Section>
        <Seg value={setup.pattern} onChange={(p) => setSetup({ ...setup, pattern: p })} options={[{ value: '7/7', label: '7/7' }, { value: '2-2-3', label: '2-2-3' }, { value: 'eow', label: 'Annenhver helg' }]} />
        <Section footer={setup.pattern === 'eow' ? 'Forelder B har fredag–søndag annenhver uke, med start uka etter startdatoen.' : 'Første dag forelder A har barna i syklusen.'}>
          <InputRow label="Startdato" type="date" value={setup.start} onChange={(v) => v && setSetup({ ...setup, start: v })} />
        </Section>
      </Sheet>

      {editExp && (
        <Sheet open onClose={() => setEditExp(null)} title={editExp.what || 'Ny utgift'} action={{ label: 'Lagre', disabled: !editExp.what || editExp.amount <= 0, onClick: () => { setExps((a) => a.some((e) => e.id === editExp.id) ? a.map((e) => e.id === editExp.id ? editExp : e) : [editExp, ...a]); setEditExp(null) } }}>
          <Section>
            <InputRow label="Hva" value={editExp.what} onChange={(v) => setEditExp({ ...editExp, what: v })} placeholder="Fotballsko" />
            <NumRow label="Beløp" value={editExp.amount} onChange={(n) => setEditExp({ ...editExp, amount: n })} suffix="kr" />
          </Section>
          <Section header="Betalt av"><div className="row"><Seg style={{ flex: 1 }} value={editExp.paidBy} onChange={(p) => setEditExp({ ...editExp, paidBy: p })} options={[{ value: 'A', label: setup.a }, { value: 'B', label: setup.b }]} /></div></Section>
          <Section header="Fordeling" footer={`${setup.a} ${editExp.shareA} % · ${setup.b} ${100 - editExp.shareA} %`}>
            <div className="row"><Seg style={{ flex: 1 }} value={editExp.shareA} onChange={(n) => setEditExp({ ...editExp, shareA: n })} options={[{ value: 50, label: '50/50' }, { value: 60, label: '60/40' }, { value: 40, label: '40/60' }, { value: 100, label: `Alt ${setup.a}` }, { value: 0, label: `Alt ${setup.b}` }]} /></div>
          </Section>
          {exps.some((e) => e.id === editExp.id) && <Section><ConfirmRow label="Slett utgift" onConfirm={() => { setExps((a) => a.filter((e) => e.id !== editExp.id)); setEditExp(null) }} /></Section>}
        </Sheet>
      )}
    </>
  )
}
