import { useState } from 'react'
import { Btn, ConfirmRow, Empty, InputRow, Row, Screen, Section, Seg, Sheet, TabBar, TextRow, daysBetween, fmtDate, toast, uid, useStore } from '../kit'

type Kind = 'ring' | 'melding' | 'treff'
type Person = { id: string; name: string; every: number; phone: string; topics: string; log: { date: number; kind: Kind }[]; created: number }
const KIND: Record<Kind, string> = { ring: '📞', melding: '💬', treff: '☕' }
const FREQ = [{ value: 7, label: 'Ukentlig' }, { value: 14, label: '2 uker' }, { value: 30, label: 'Månedlig' }, { value: 90, label: 'Kvartal' }]

function hue(s: string) { let h = 0; for (const c of s) h = (h * 37 + c.charCodeAt(0)) % 360; return h }
function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#fff', fontSize: size * 0.4, background: `linear-gradient(140deg, hsl(${hue(name)} 65% 60%), hsl(${(hue(name) + 40) % 360} 60% 45%))` }}>{name.trim()[0]?.toUpperCase() ?? '?'}</span>
}

const lastContact = (p: Person) => p.log[0]?.date ?? p.created
/** > 1 betyr forfalt. 1,5 = 50 % over ønsket intervall. */
export const overdue = (p: Person, now = Date.now()) => daysBetween(lastContact(p), now) / p.every

export default function Ringerunde() {
  const [tab, setTab] = useState<'due' | 'all'>('due')
  const [people, setPeople] = useStore<Person[]>('ringe:people', [])
  const [edit, setEdit] = useState<Person | null>(null)
  const now = Date.now()
  const sorted = [...people].sort((a, b) => overdue(b, now) - overdue(a, now))
  const due = sorted.filter((p) => overdue(p, now) >= 0.85)

  const log = (id: string, kind: Kind) => {
    setPeople(people.map((p) => p.id === id ? { ...p, log: [{ date: Date.now(), kind }, ...p.log] } : p))
    toast(`${KIND[kind]} logget`)
  }
  const blank = (): Person => ({ id: uid(), name: '', every: 30, phone: '', topics: '', log: [], created: Date.now() })

  const PersonRow = ({ p }: { p: Person }) => {
    const d = daysBetween(lastContact(p), now), o = overdue(p, now)
    return (
      <div className="row" style={{ display: 'block' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar name={p.name} />
          <button className="row-main" style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }} onClick={() => setEdit(p)}>
            <span className="row-label" style={{ fontWeight: 600 }}>{p.name}</span>
            <span className="row-detail" style={{ color: o > 1 ? 'var(--orange)' : undefined }}>{p.log.length ? `Sist: ${d === 0 ? 'i dag' : `${d} dager siden`}` : 'Aldri logget'} · {FREQ.find((f) => f.value === p.every)?.label ?? `hver ${p.every}. dag`}</span>
          </button>
          {p.phone && <a className="btn small tinted" href={`tel:${p.phone.replace(/\s/g, '')}`} style={{ textDecoration: 'none' }}>Ring</a>}
        </div>
        <div className="progress" style={{ margin: '10px 0 8px' }}><div style={{ width: `${Math.min(1, o) * 100}%`, background: o > 1.5 ? 'var(--red)' : o > 1 ? 'var(--orange)' : 'var(--tint)' }} /></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(Object.keys(KIND) as Kind[]).map((k) => <button key={k} className="chip" style={{ flex: 1 }} onClick={() => log(p.id, k)}>{KIND[k]} {k === 'ring' ? 'Ringte' : k === 'melding' ? 'Melding' : 'Møttes'}</button>)}
        </div>
      </div>
    )
  }

  return (
    <>
      {tab === 'due' && (
        <Screen title="På tide" right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Legg til person">＋</button>}>
          {people.length === 0 ? (
            <Empty icon="📞" title="Hvem vil du ikke miste?" text="Bestemor. Kompisen fra studietiden. Søsteren du bare ser i jula. Legg dem inn og velg hvor ofte.">
              <Btn onClick={() => setEdit(blank())}>Legg til person</Btn>
            </Empty>
          ) : due.length === 0 ? (
            <Empty icon="🌿" title="Alle er innenfor" text="Ingen har gått for lenge. Neste ut er øverst under «Alle»." />
          ) : <Section header={`${due.length} venter på deg`}>{due.map((p) => <PersonRow key={p.id} p={p} />)}</Section>}
        </Screen>
      )}

      {tab === 'all' && (
        <Screen title="Alle" right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Legg til person">＋</button>}>
          {people.length === 0 ? <Empty icon="👥" title="Ingen her ennå" /> : <Section>{sorted.map((p) => <PersonRow key={p.id} p={p} />)}</Section>}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'due', label: due.length ? `På tide (${due.length})` : 'På tide', icon: '⏰' }, { id: 'all', label: 'Alle', icon: '👥' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.name || 'Ny person'}
          action={{ label: 'Lagre', disabled: !edit.name.trim(), onClick: () => { setPeople(people.some((p) => p.id === edit.id) ? people.map((p) => p.id === edit.id ? edit : p) : [...people, edit]); setEdit(null) } }}>
          {edit.name && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Avatar name={edit.name} size={72} /></div>}
          <Section>
            <InputRow label="Navn" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
            <InputRow label="Telefon" type="tel" value={edit.phone} onChange={(v) => setEdit({ ...edit, phone: v })} placeholder="valgfritt" />
          </Section>
          <Section header="Hvor ofte"><div className="row"><Seg style={{ flex: 1 }} value={edit.every} onChange={(n) => setEdit({ ...edit, every: n })} options={FREQ} /></div></Section>
          <Section header="Snakk om neste gang"><TextRow value={edit.topics} onChange={(v) => setEdit({ ...edit, topics: v })} placeholder="Hvordan gikk operasjonen? Den nye jobben?" /></Section>
          {edit.log.length > 0 && (
            <Section header="Historikk">
              {edit.log.slice(0, 10).map((l, i) => <Row key={i} icon={KIND[l.kind]} iconBg="var(--fill)" label={fmtDate(l.date, { weekday: 'short', day: 'numeric', month: 'long' })} />)}
            </Section>
          )}
          {people.some((p) => p.id === edit.id) && <Section><ConfirmRow label="Fjern person" onConfirm={() => { setPeople(people.filter((p) => p.id !== edit.id)); setEdit(null) }} /></Section>}
        </Sheet>
      )}
    </>
  )
}
