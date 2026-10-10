import { useState } from 'react'
import {
  Btn, Empty, InputRow, NumRow, Ring, Row, Screen, Section, Seg, Sheet, TabBar,
  fmtDate, kr, num, toast, uid, useNow, useStore,
} from '../kit'

type Item = { id: string; name: string; price: number; url: string; created: number; hours: number; status: 'cold' | 'bought' | 'dropped'; decided?: number }

const left = (i: Item, now: number) => i.created + i.hours * 3600000 - now
const fmtLeft = (ms: number) => {
  const h = Math.ceil(ms / 3600000)
  return h >= 24 ? `${Math.floor(h / 24)} d ${h % 24} t` : `${h} t`
}

export default function Impulsbrems() {
  const [tab, setTab] = useState<'freezer' | 'thaw' | 'settings'>('freezer')
  const [items, setItems] = useStore<Item[]>('impuls:items', [])
  const [wage, setWage] = useStore('impuls:wage', { hourly: 280, tax: 32 })
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ name: '', price: 0, url: '', hours: 72 })
  const now = useNow(30000)

  const net = wage.hourly * (1 - wage.tax / 100)
  const workHours = (p: number) => (net > 0 ? p / net : 0)
  const cold = items.filter((i) => i.status === 'cold' && left(i, now) > 0)
  const thawed = items.filter((i) => i.status === 'cold' && left(i, now) <= 0)
  const decided = items.filter((i) => i.status !== 'cold')
  const saved = items.filter((i) => i.status === 'dropped').reduce((s, i) => s + i.price, 0)

  const decide = (id: string, status: 'bought' | 'dropped') => {
    setItems((all) => all.map((i) => i.id === id ? { ...i, status, decided: Date.now() } : i))
    toast(status === 'dropped' ? '🧊 Droppet. Penger beholdt.' : 'Kjøpt etter kjøling. Greit nok.')
  }
  const add = () => {
    setItems((a) => [{ id: uid(), ...draft, created: Date.now(), status: 'cold' }, ...a])
    setAdding(false); setDraft({ name: '', price: 0, url: '', hours: 72 }); toast('Lagt i fryseren')
  }

  const Card = ({ i }: { i: Item }) => {
    const l = left(i, now), p = 1 - l / (i.hours * 3600000)
    return (
      <div className="row">
        <Ring value={p} size={46} stroke={5} color="#64d2ff"><span style={{ fontSize: 18 }}>🧊</span></Ring>
        <span className="row-main">
          <span className="row-label">{i.name}</span>
          <span className="row-detail">{kr(i.price)} = <b>{num(workHours(i.price), 1)} arbeidstimer</b></span>
        </span>
        <span className="row-value">{fmtLeft(l)}</span>
      </div>
    )
  }

  return (
    <>
      {tab === 'freezer' && (
        <Screen title="Fryseren" right={<button className="navbtn" onClick={() => setAdding(true)} aria-label="Nytt ønske">＋</button>}>
          <div className="card center" style={{ background: 'linear-gradient(160deg,#d8f3ff,#9cd2ff)', color: '#03315e' }}>
            <div className="stat-l" style={{ color: '#03315e' }}>Spart ved å droppe</div>
            <div className="big-num">{kr(saved)}</div>
            <div className="small">= {num(workHours(saved), 1)} timer du slapp å jobbe</div>
          </div>
          {thawed.length > 0 && (
            <div className="btn-row"><Btn onClick={() => setTab('thaw')}>{thawed.length} {thawed.length === 1 ? 'ting har' : 'ting har'} tint – bestem deg</Btn></div>
          )}
          {cold.length === 0 ? (
            <Empty icon="🧊" title="Fryseren er tom" text="Har du lyst på noe? Legg det her i stedet for i handlekurven.">
              <Btn onClick={() => setAdding(true)}>Frys et ønske</Btn>
            </Empty>
          ) : <Section header="Kjøles ned">{cold.map((i) => <Card key={i.id} i={i} />)}</Section>}
        </Screen>
      )}

      {tab === 'thaw' && (
        <Screen title="Tint">
          {thawed.length === 0 && <Empty icon="⏳" title="Ingenting har tint ennå" text="Når kjøletiden er ute, havner ønsket her." />}
          {thawed.map((i) => (
            <div key={i.id} className="card">
              <div style={{ fontWeight: 600, fontSize: 20 }}>{i.name}</div>
              <div className="muted">{kr(i.price)} · {num(workHours(i.price), 1)} arbeidstimer · fryst {fmtDate(i.created)}</div>
              {i.url && <a href={i.url} target="_blank" rel="noreferrer" className="small tint">Åpne lenke</a>}
              <p style={{ margin: '12px 0' }}>Vil du fortsatt ha den?</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <Btn kind="gray" onClick={() => decide(i.id, 'bought')}>Kjøp</Btn>
                <Btn onClick={() => decide(i.id, 'dropped')}>Dropp</Btn>
              </div>
            </div>
          ))}
          {decided.length > 0 && (
            <Section header="Historikk">
              {decided.map((i) => (
                <Row key={i.id} label={i.name} detail={`${i.status === 'dropped' ? 'Droppet' : 'Kjøpt'} ${i.decided ? fmtDate(i.decided) : ''}`}
                  value={<span style={{ color: i.status === 'dropped' ? 'var(--green)' : 'var(--label2)' }}>{kr(i.price)}</span>} />
              ))}
            </Section>
          )}
        </Screen>
      )}

      {tab === 'settings' && (
        <Screen title="Lønn">
          <Section header="Timelønn" footer={`Netto per time: ${kr(net)}. Brukes for å regne priser om til arbeidstid.`}>
            <NumRow label="Brutto timelønn" value={wage.hourly} onChange={(n) => setWage({ ...wage, hourly: n })} suffix="kr" />
            <NumRow label="Skatt" value={wage.tax} onChange={(n) => setWage({ ...wage, tax: n })} suffix="%" />
          </Section>
          <Section header="Statistikk">
            <Row label="Droppet" value={items.filter((i) => i.status === 'dropped').length} />
            <Row label="Kjøpt etter kjøling" value={items.filter((i) => i.status === 'bought').length} />
            <Row label="I fryseren" value={cold.length} />
          </Section>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[
        { id: 'freezer', label: 'Fryseren', icon: '🧊' },
        { id: 'thaw', label: thawed.length ? `Tint (${thawed.length})` : 'Tint', icon: '💧' },
        { id: 'settings', label: 'Lønn', icon: '⚙️' }]} />

      <Sheet open={adding} onClose={() => setAdding(false)} title="Frys et ønske" action={{ label: 'Frys', onClick: add, disabled: !draft.name || draft.price <= 0 }}>
        <Section>
          <InputRow label="Hva" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Robotstøvsuger" />
          <NumRow label="Pris" value={draft.price} onChange={(n) => setDraft({ ...draft, price: n })} suffix="kr" />
          <InputRow label="Lenke" value={draft.url} onChange={(v) => setDraft({ ...draft, url: v })} placeholder="valgfritt" type="url" />
        </Section>
        {draft.price > 0 && <div className="card center"><div className="mid-num">{num(workHours(draft.price), 1)} timer</div><div className="muted small">så lenge må du jobbe for den, etter skatt</div></div>}
        <Section header="Kjøletid"><div className="row"><Seg style={{ flex: 1 }} value={draft.hours} onChange={(h) => setDraft({ ...draft, hours: h })} options={[{ value: 24, label: '24 t' }, { value: 72, label: '72 t' }, { value: 168, label: '1 uke' }]} /></div></Section>
      </Sheet>
    </>
  )
}
