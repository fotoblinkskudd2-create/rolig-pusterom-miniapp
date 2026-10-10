import { useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, NumRow, Progress, Row, Screen, Section, SelectRow, Sheet, StepperRow, TabBar,
  daysBetween, fmtDate, num, toast, uid, useNow, useStore,
} from '../kit'

type Batch = { id: string; name: string; type: string; start: number; target: number; og: number; fg: number; done: boolean; notes: { date: number; text: string }[] }
const TYPES: Record<string, string> = { 'Øl': '🍺', 'Mjød': '🍯', 'Vin': '🍷', 'Cider': '🍏', 'Kombucha': '🫖', 'Kimchi/surkål': '🥬', 'Annet': '🫙' }
const TARGET: Record<string, number> = { 'Øl': 21, 'Mjød': 42, 'Vin': 30, 'Cider': 21, 'Kombucha': 10, 'Kimchi/surkål': 7, 'Annet': 14 }

export const abv = (og: number, fg: number) => Math.max(0, (og - fg) * 131.25)
const atten = (og: number, fg: number) => (og > 1 ? ((og - fg) / (og - 1)) * 100 : 0)

export default function Gjaering() {
  const [tab, setTab] = useState<'shelf' | 'calc'>('shelf')
  const [batches, setBatches] = useStore<Batch[]>('gjaer:batches', [])
  const [edit, setEdit] = useState<Batch | null>(null)
  const [note, setNote] = useState('')
  const [og, setOg] = useState(1.05), [fg, setFg] = useState(1.01)
  const now = useNow(60000)

  const save = (b: Batch) => setBatches((all) => all.some((x) => x.id === b.id) ? all.map((x) => x.id === b.id ? b : x) : [b, ...all])
  const blank = (): Batch => ({ id: uid(), name: '', type: 'Øl', start: Date.now(), target: 21, og: 0, fg: 0, done: false, notes: [] })
  const day = (b: Batch) => daysBetween(b.start, now) + 1
  const active = batches.filter((b) => !b.done), done = batches.filter((b) => b.done)

  const BatchRow = ({ b }: { b: Batch }) => {
    const d = day(b), ready = d >= b.target
    return (
      <button className="row" onClick={() => setEdit(b)} style={{ display: 'block' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{TYPES[b.type]}</span>
          <span className="row-main">
            <span className="row-label">{b.name || b.type}</span>
            <span className="row-detail">{b.done ? `Ferdig · ${fmtDate(b.start)}` : `Dag ${d} av ${b.target}`}{b.og && b.fg ? ` · ${num(abv(b.og, b.fg), 1)} %` : ''}</span>
          </span>
          {!b.done && <span className="tag" style={ready ? { background: 'color-mix(in srgb, var(--green) 18%, transparent)', color: 'var(--green)' } : undefined}>{ready ? 'Klar' : 'Aktiv'}</span>}
        </div>
        {!b.done && <div style={{ marginTop: 8 }}><Progress value={d / b.target} color={ready ? 'var(--green)' : undefined} /></div>}
      </button>
    )
  }

  return (
    <>
      {tab === 'shelf' && (
        <Screen title="Hylla" right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Ny batch">＋</button>}>
          {batches.length === 0 ? (
            <Empty icon="🫙" title="Tom hylle" text="Start en batch: øl, mjød, kombucha eller kimchi.">
              <Btn onClick={() => setEdit(blank())}>Ny batch</Btn>
            </Empty>
          ) : (
            <>
              {active.length > 0 && <Section header={`På gang (${active.length})`}>{active.map((b) => <BatchRow key={b.id} b={b} />)}</Section>}
              {done.length > 0 && <Section header="Ferdige">{done.map((b) => <BatchRow key={b.id} b={b} />)}</Section>}
            </>
          )}
        </Screen>
      )}

      {tab === 'calc' && (
        <Screen title="Kalkulator" subtitle="Alkohol fra hydrometer (OG → FG).">
          <div className="card center">
            <div className="stat-l">Alkohol</div>
            <div className="big-num">{num(abv(og, fg), 1)} %</div>
            <div className="muted small">Tilsynelatende forgjæring {num(atten(og, fg), 0)} %</div>
          </div>
          <Section footer="ABV ≈ (OG − FG) × 131,25. Mål ved samme temperatur som hydrometeret er kalibrert for (ofte 20 °C).">
            <StepperRow label="OG (start)" value={og} onChange={setOg} step={0.001} min={0.99} max={1.2} fmt={(n) => n.toFixed(3)} />
            <StepperRow label="FG (slutt)" value={fg} onChange={setFg} step={0.001} min={0.98} max={1.2} fmt={(n) => n.toFixed(3)} />
          </Section>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'shelf', label: 'Hylla', icon: '🫙' }, { id: 'calc', label: 'Kalkulator', icon: '🧮' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.name || 'Ny batch'} action={{ label: 'Lagre', onClick: () => { save(edit); setEdit(null); toast('Lagret') } }}>
          <Section>
            <InputRow label="Navn" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} placeholder="Høstmjød" />
            <SelectRow label="Type" value={edit.type} options={Object.keys(TYPES).map((t) => ({ value: t, label: `${TYPES[t]} ${t}` }))}
              onChange={(t) => setEdit({ ...edit, type: t, target: TARGET[t] })} />
            <InputRow label="Startet" type="date" value={new Date(edit.start - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10)}
              onChange={(v) => v && setEdit({ ...edit, start: new Date(v + 'T12:00').getTime() })} />
            <StepperRow label="Måldag" value={edit.target} onChange={(n) => setEdit({ ...edit, target: n })} min={1} max={365} fmt={(n) => `dag ${n}`} />
          </Section>
          <Section header="Hydrometer" footer={edit.og && edit.fg ? `ABV ${num(abv(edit.og, edit.fg), 1)} %` : 'Valgfritt. Skriv f.eks. 1.052'}>
            <NumRow label="OG" value={edit.og} onChange={(n) => setEdit({ ...edit, og: n })} />
            <NumRow label="FG" value={edit.fg} onChange={(n) => setEdit({ ...edit, fg: n })} />
          </Section>
          <Section header="Smaksnotater">
            {edit.notes.map((n, i) => <Row key={i} label={n.text} detail={`Dag ${daysBetween(edit.start, n.date) + 1} · ${fmtDate(n.date)}`} />)}
            <div className="row">
              <input className="inline left" placeholder="Ny notat …" value={note} onChange={(e) => setNote(e.target.value)} />
              <Btn small kind="tinted" disabled={!note.trim()} onClick={() => { setEdit({ ...edit, notes: [...edit.notes, { date: Date.now(), text: note.trim() }] }); setNote('') }}>Legg til</Btn>
            </div>
          </Section>
          <Section>
            <Row className="action" label={edit.done ? 'Marker som aktiv' : 'Marker som ferdig (tappet)'} onClick={() => setEdit({ ...edit, done: !edit.done })} />
            {batches.some((b) => b.id === edit.id) && <ConfirmRow label="Slett batch" onConfirm={() => { setBatches((a) => a.filter((b) => b.id !== edit.id)); setEdit(null) }} />}
          </Section>
        </Sheet>
      )}
    </>
  )
}
