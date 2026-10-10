import { useState } from 'react'
import { Btn, ConfirmRow, Empty, InputRow, NumRow, Row, Screen, Section, SelectRow, Sheet, TabBar, ToggleRow, num, toast, uid, useStore } from '../kit'

type Gear = { id: string; name: string; cat: string; grams: number; worn: boolean; consumable: boolean }
type Trip = { id: string; name: string; items: string[]; packed: string[] }
const CATS: Record<string, string> = { Ly: '#3a9d4f', Sove: '#5e5ce6', Kjøkken: '#ff9f0a', Klær: '#30b0c7', Elektronikk: '#8e8e93', Hygiene: '#ff6482', 'Mat/vann': '#a2845e', Annet: '#c7c7cc' }
const kg = (g: number) => `${num(g / 1000, 2)} kg`

function Donut({ data, size = 150 }: { data: { c: string; v: number }[]; size?: number }) {
  const total = data.reduce((s, d) => s + d.v, 0) || 1, r = size / 2 - 12, C = 2 * Math.PI * r
  let acc = 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--fill)" strokeWidth={20} />
      {data.map((d, i) => { const len = (d.v / total) * C; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.c} strokeWidth={20} strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-acc} />; acc += len; return el })}
    </svg>
  )
}

export default function Sekkevekt() {
  const [tab, setTab] = useState<'trip' | 'gear' | 'heavy'>('trip')
  const [gear, setGear] = useStore<Gear[]>('sekk:gear', [])
  const [trips, setTrips] = useStore<Trip[]>('sekk:trips', [])
  const [tripId, setTripId] = useStore('sekk:trip', '')
  const [edit, setEdit] = useState<Gear | null>(null)
  const [picking, setPicking] = useState(false)
  const [q, setQ] = useState('')

  const trip = trips.find((t) => t.id === tripId) ?? trips[0]
  const setTrip = (p: Partial<Trip>) => trip && setTrips(trips.map((t) => t.id === trip.id ? { ...t, ...p } : t))
  const items = trip ? gear.filter((g) => trip.items.includes(g.id)) : []
  const base = items.filter((g) => !g.worn && !g.consumable).reduce((s, g) => s + g.grams, 0)
  const cons = items.filter((g) => g.consumable).reduce((s, g) => s + g.grams, 0)
  const worn = items.filter((g) => g.worn).reduce((s, g) => s + g.grams, 0)
  const byCat = Object.keys(CATS).map((c) => ({ cat: c, c: CATS[c], v: items.filter((g) => g.cat === c && !g.worn && !g.consumable).reduce((s, g) => s + g.grams, 0) })).filter((x) => x.v)
  const heavy = [...(trip ? items : gear)].filter((g) => !g.worn && !g.consumable).sort((a, b) => b.grams - a.grams).slice(0, 5)
  const newTrip = () => { const t = { id: uid(), name: `Tur ${trips.length + 1}`, items: [], packed: [] }; setTrips([...trips, t]); setTripId(t.id) }
  const blank = (): Gear => ({ id: uid(), name: '', cat: 'Annet', grams: 0, worn: false, consumable: false })

  return (
    <>
      {tab === 'trip' && (
        <Screen title={trip?.name ?? 'Tur'} right={<button className="navbtn" onClick={newTrip}>Ny tur</button>}>
          {!trip ? (
            <Empty icon="🎒" title="Planlegg en tur" text="Legg inn utstyret under «Lager», og sett så sammen turen.">
              <Btn onClick={newTrip}>Ny tur</Btn>
            </Empty>
          ) : (
            <>
              {trips.length > 1 && <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>{trips.map((t) => <button key={t.id} className={'chip' + (t.id === trip.id ? ' on' : '')} onClick={() => setTripId(t.id)} style={{ flex: 'none' }}>{t.name}</button>)}</div>}
              <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ position: 'relative' }}>
                  <Donut data={byCat} />
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div className="small muted">Base</div><b style={{ fontSize: 20 }}>{kg(base)}</b></div></div>
                </div>
                <div className="small" style={{ flex: 1 }}>{byCat.map((x) => <div key={x.cat} style={{ display: 'flex', justifyContent: 'space-between' }}><span><b style={{ color: x.c }}>●</b> {x.cat}</span><span className="muted">{num(x.v)} g</span></div>)}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, margin: '0 16px 16px' }}>
                {[['Base', base], ['Forbruk', cons], ['På kroppen', worn]].map(([l, v]) => <div key={l as string} className="card" style={{ margin: 0, padding: 12 }}><div className="stat-l">{l}</div><b>{kg(v as number)}</b></div>)}
              </div>
              <div className="card center"><div className="stat-l">Sekken på ryggen</div><div className="mid-num">{kg(base + cons)}</div></div>
              {Object.keys(CATS).map((c) => {
                const list = items.filter((g) => g.cat === c)
                if (!list.length) return null
                return (
                  <Section key={c} header={`${c} · ${num(list.reduce((s, g) => s + g.grams, 0))} g`}>
                    {list.map((g) => {
                      const on = trip.packed.includes(g.id)
                      return <Row key={g.id} label={<span style={{ opacity: on ? 0.5 : 1 }}>{g.name}{g.worn ? ' 👕' : g.consumable ? ' 🍫' : ''}</span>} detail={`${num(g.grams)} g`}
                        onClick={() => setTrip({ packed: on ? trip.packed.filter((x) => x !== g.id) : [...trip.packed, g.id] })}
                        value={<span style={{ fontSize: 22, color: on ? 'var(--green)' : 'var(--label3)' }}>{on ? '●' : '○'}</span>} />
                    })}
                  </Section>
                )
              })}
              <div className="btn-row"><Btn kind="tinted" onClick={() => setPicking(true)}>Velg utstyr fra lageret</Btn></div>
              <Section>
                <InputRow label="Turnavn" value={trip.name} onChange={(v) => setTrip({ name: v })} />
                <ConfirmRow label="Slett tur" onConfirm={() => { setTrips(trips.filter((t) => t.id !== trip.id)); setTripId('') }} />
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'gear' && (
        <Screen title="Lager" subtitle={gear.length ? `${gear.length} ting · ${kg(gear.reduce((s, g) => s + g.grams, 0))}` : undefined} right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Nytt utstyr">＋</button>}>
          {gear.length === 0 ? (
            <Empty icon="⛺" title="Tomt lager" text="Vei utstyret på kjøkkenvekta og legg det inn i gram."><Btn onClick={() => setEdit(blank())}>Legg til utstyr</Btn></Empty>
          ) : (
            <>
              <div className="searchbar"><span>🔍</span><input placeholder="Søk" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Section>
                {gear.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.cat.localeCompare(b.cat) || b.grams - a.grams).map((g) => (
                  <Row key={g.id} onClick={() => setEdit(g)} icon="" iconBg={CATS[g.cat]} label={g.name} detail={g.cat + (g.worn ? ' · på kroppen' : g.consumable ? ' · forbruk' : '')} value={`${num(g.grams)} g`} />
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'heavy' && (
        <Screen title="Tyngst" subtitle={trip ? `Basevekt på «${trip.name}»` : 'Hele lageret'}>
          {heavy.length === 0 ? <Empty icon="🪶" title="Ingenting å veie" /> : (
            <>
              <div className="card">
                {heavy.map((g) => (
                  <div key={g.id} style={{ margin: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>{g.name}</span><b>{num(g.grams)} g</b></div>
                    <div className="progress" style={{ height: 10 }}><div style={{ width: `${(g.grams / heavy[0].grams) * 100}%`, background: CATS[g.cat] }} /></div>
                  </div>
                ))}
              </div>
              <p className="pad muted">Bytt disse først. De fem tyngste utgjør {base ? num((heavy.reduce((s, g) => s + g.grams, 0) / base) * 100) : '–'} % av basevekta.</p>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'trip', label: 'Tur', icon: '🎒' }, { id: 'gear', label: 'Lager', icon: '⛺' }, { id: 'heavy', label: 'Tyngst', icon: '🏋️' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.name || 'Nytt utstyr'} action={{ label: 'Lagre', disabled: !edit.name, onClick: () => { setGear(gear.some((g) => g.id === edit.id) ? gear.map((g) => g.id === edit.id ? edit : g) : [...gear, edit]); setEdit(null); toast('Lagret') } }}>
          <Section>
            <InputRow label="Navn" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} placeholder="Telt, sovepose …" />
            <SelectRow label="Kategori" value={edit.cat} options={Object.keys(CATS).map((c) => ({ value: c, label: c }))} onChange={(c) => setEdit({ ...edit, cat: c })} />
            <NumRow label="Vekt" value={edit.grams} onChange={(n) => setEdit({ ...edit, grams: n })} suffix="g" />
          </Section>
          <Section footer="Basevekt er alt i sekken utenom mat, vann og brensel. Det du har på deg, telles for seg.">
            <ToggleRow label="På kroppen" checked={edit.worn} onChange={(b) => setEdit({ ...edit, worn: b, consumable: b ? false : edit.consumable })} />
            <ToggleRow label="Forbruk (mat, vann, gass)" checked={edit.consumable} onChange={(b) => setEdit({ ...edit, consumable: b, worn: b ? false : edit.worn })} />
          </Section>
          {gear.some((g) => g.id === edit.id) && <Section><ConfirmRow label="Slett fra lager" onConfirm={() => { setGear(gear.filter((g) => g.id !== edit.id)); setTrips(trips.map((t) => ({ ...t, items: t.items.filter((x) => x !== edit.id) }))); setEdit(null) }} /></Section>}
        </Sheet>
      )}

      <Sheet open={picking} onClose={() => setPicking(false)} title="Pakk" action={{ label: 'Ferdig', onClick: () => setPicking(false) }}>
        {gear.length === 0 ? <Empty icon="⛺" title="Lageret er tomt" text="Legg inn utstyr under «Lager» først." /> : (
          <Section>
            {gear.map((g) => {
              const on = !!trip?.items.includes(g.id)
              return <Row key={g.id} label={g.name} detail={`${g.cat} · ${num(g.grams)} g`} onClick={() => setTrip({ items: on ? trip!.items.filter((x) => x !== g.id) : [...trip!.items, g.id] })} value={<span className="tint" style={{ fontSize: 20 }}>{on ? '✓' : ''}</span>} />
            })}
          </Section>
        )}
      </Sheet>
    </>
  )
}
