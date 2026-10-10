import { useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, NumRow, Row, Screen, Section, Sheet, TabBar, TextRow,
  downloadText, fmtDate, fmtDur, fmtTime, kr, toast, uid, useNow, useStore,
} from '../kit'

type Part = { id: string; name: string; age: string; role: string; pronouns: string; color: string; comfort: string; triggers: string }
type Front = { id: string; partIds: string[]; start: number; end?: number; note: string }
type Note = { id: string; partId: string; text: string; date: number }
type Lost = { id: string; date: number; duration: string; known: string; bought: string; amount: number }

const COLORS = ['#af52de', '#5856d6', '#ff2d55', '#ff9500', '#34c759', '#00c7be', '#007aff', '#a2845e', '#ffcc00', '#8e8e93']

function Dot({ color, size = 28, label }: { color: string; size?: number; label?: string }) {
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'inline-grid', placeItems: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.42, flex: 'none', boxShadow: '0 0 0 2px var(--bg2)' }}>
      {label?.[0]?.toUpperCase()}
    </span>
  )
}

export default function Delene() {
  const [tab, setTab] = useState<'front' | 'parts' | 'board' | 'lost'>('front')
  const [parts, setParts] = useStore<Part[]>('delene:parts', [])
  const [fronts, setFronts] = useStore<Front[]>('delene:fronts', [])
  const [board, setBoard] = useStore<Note[]>('delene:board', [])
  const [lost, setLost] = useStore<Lost[]>('delene:lost', [])
  const [switching, setSwitching] = useState(false)
  const [sel, setSel] = useState<string[]>([])
  const [swNote, setSwNote] = useState('')
  const [editPart, setEditPart] = useState<Part | null>(null)
  const [noteText, setNoteText] = useState('')
  const [noteBy, setNoteBy] = useState('')
  const [editLost, setEditLost] = useState<Lost | null>(null)
  const now = useNow(30000)

  const pById = (id: string) => parts.find((p) => p.id === id)
  const current = fronts.find((f) => !f.end)
  const label = (f: Front) => f.partIds.length ? f.partIds.map((id) => pById(id)?.name ?? '?').join(' + ') : 'Uklart / blurry'
  const color = (f: Front) => (f.partIds[0] && pById(f.partIds[0])?.color) || '#8e8e93'

  const doSwitch = () => {
    const t = Date.now()
    setFronts((all) => [...all.map((f) => f.end ? f : { ...f, end: t }), { id: uid(), partIds: sel, start: t, note: swNote }])
    setSwitching(false); setSel([]); setSwNote(''); toast('Bytte logget')
  }

  // Dagens tidslinje 00–24
  const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
  const ds = dayStart.getTime(), de = ds + 86400000
  const todays = fronts.filter((f) => (f.end ?? now) > ds && f.start < de)

  const exportTxt = () => {
    const since = Date.now() - 14 * 86400000
    const lines = ['DELENE – systemlogg (siste 14 dager)', new Date().toLocaleString('nb-NO'), '', 'DELER:',
      ...parts.map((p) => `• ${p.name}${p.age ? `, ${p.age}` : ''}${p.role ? ` – ${p.role}` : ''}${p.pronouns ? ` (${p.pronouns})` : ''}`),
      '', 'FRONT-LOGG:',
      ...fronts.filter((f) => f.start > since).map((f) => `${new Date(f.start).toLocaleString('nb-NO')}  ${label(f)}  (${fmtDur((f.end ?? Date.now()) - f.start)})${f.note ? '  – ' + f.note : ''}`),
      '', 'TAPT TID:',
      ...lost.filter((l) => l.date > since).map((l) => `${new Date(l.date).toLocaleString('nb-NO')}  ${l.duration}  Vet: ${l.known || '–'}  Kjøpt: ${l.bought || '–'} ${l.amount ? kr(l.amount) : ''}`)]
    downloadText('delene-systemlogg.txt', lines.join('\n'))
  }

  return (
    <>
      {tab === 'front' && (
        <Screen title="Fremme" subtitle="Alle er velkomne her. Ingenting forlater denne enheten.">
          <div className="card center">
            {current ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  {(current.partIds.length ? current.partIds : ['?']).map((id, i) => (
                    <span key={id} style={{ marginLeft: i ? -10 : 0 }}><Dot size={64} color={pById(id)?.color ?? '#8e8e93'} label={pById(id)?.name ?? '?'} /></span>
                  ))}
                </div>
                <div className="mid-num">{label(current)}</div>
                <div className="muted">siden {fmtTime(current.start)} · {fmtDur(now - current.start).replace(/:\d\d$/, '')} t</div>
                {current.note && <p className="small" style={{ margin: '8px 0 0' }}>«{current.note}»</p>}
              </>
            ) : <div className="muted" style={{ padding: 12 }}>Ingen front logget ennå.</div>}
            <div style={{ marginTop: 16 }}><Btn onClick={() => { setSwitching(true); setSel(current?.partIds ?? []) }}>{current ? 'Bytt / legg til' : 'Logg hvem som er fremme'}</Btn></div>
          </div>

          <Section header="I dag">
            <div className="row" style={{ display: 'block' }}>
              <div style={{ display: 'flex', height: 22, borderRadius: 6, overflow: 'hidden', background: 'var(--fill)', position: 'relative' }}>
                {todays.map((f) => {
                  const a = Math.max(f.start, ds), b = Math.min(f.end ?? now, de)
                  return <div key={f.id} title={label(f)} style={{ position: 'absolute', left: `${((a - ds) / 864e5) * 100}%`, width: `${Math.max(0.4, ((b - a) / 864e5) * 100)}%`, top: 0, bottom: 0, background: color(f) }} />
                })}
                <div style={{ position: 'absolute', left: `${((now - ds) / 864e5) * 100}%`, top: -2, bottom: -2, width: 2, background: 'var(--red)' }} />
              </div>
              <div className="small muted" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>
            </div>
          </Section>

          {fronts.length > 0 && (
            <Section header="Siste bytter">
              {[...fronts].reverse().slice(0, 12).map((f) => (
                <Row key={f.id} icon={<Dot size={30} color={color(f)} label={label(f)} />} iconBg="transparent" label={label(f)}
                  detail={`${fmtDate(f.start, { weekday: 'short', day: 'numeric', month: 'short' })} ${fmtTime(f.start)}${f.note ? ' · ' + f.note : ''}`}
                  value={f.end ? fmtDur(f.end - f.start).replace(/:\d\d$/, '') : 'nå'} />
              ))}
            </Section>
          )}
          <div className="btn-row"><Btn kind="gray" onClick={exportTxt}>Eksporter for behandler</Btn></div>
        </Screen>
      )}

      {tab === 'parts' && (
        <Screen title="Deler" right={<button className="navbtn" onClick={() => setEditPart({ id: uid(), name: '', age: '', role: '', pronouns: '', color: COLORS[parts.length % COLORS.length], comfort: '', triggers: '' })}>＋</button>}>
          {parts.length === 0 ? (
            <Empty icon="🫂" title="Ingen deler registrert" text="Legg til de dere kjenner. Det er lov å vite lite.">
              <Btn onClick={() => setEditPart({ id: uid(), name: '', age: '', role: '', pronouns: '', color: COLORS[0], comfort: '', triggers: '' })}>Legg til</Btn>
            </Empty>
          ) : (
            <div className="grid2">
              {parts.map((p) => (
                <button key={p.id} className="card" style={{ border: 0, textAlign: 'left', borderTop: `4px solid ${p.color}` }} onClick={() => setEditPart(p)}>
                  <Dot color={p.color} label={p.name} size={40} />
                  <div style={{ fontWeight: 600, marginTop: 8 }}>{p.name}</div>
                  <div className="small muted">{[p.age, p.role, p.pronouns].filter(Boolean).join(' · ') || '—'}</div>
                </button>
              ))}
            </div>
          )}
        </Screen>
      )}

      {tab === 'board' && (
        <Screen title="Tavla" subtitle="Beskjeder mellom deler.">
          <Section>
            <TextRow value={noteText} onChange={setNoteText} placeholder="Skriv en beskjed til de andre …" />
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              <span className="muted small">Fra:</span>
              {parts.map((p) => (
                <button key={p.id} className={'chip' + (noteBy === p.id ? ' on' : '')} style={noteBy === p.id ? { background: p.color } : undefined} onClick={() => setNoteBy(p.id)}>{p.name}</button>
              ))}
              <button className={'chip' + (noteBy === '' ? ' on' : '')} onClick={() => setNoteBy('')}>Vet ikke</button>
            </div>
          </Section>
          <div className="btn-row"><Btn disabled={!noteText.trim()} onClick={() => { setBoard((b) => [{ id: uid(), partId: noteBy, text: noteText.trim(), date: Date.now() }, ...b]); setNoteText(''); toast('Hengt opp') }}>Heng opp</Btn></div>
          {board.map((n) => {
            const p = pById(n.partId)
            return (
              <div key={n.id} className="card" style={{ borderLeft: `5px solid ${p?.color ?? '#8e8e93'}` }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{n.text}</div>
                <div className="small muted" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>— {p?.name ?? 'ukjent'} · {fmtDate(n.date, { day: 'numeric', month: 'short' })} {fmtTime(n.date)}</span>
                  <button className="navbtn small" style={{ padding: 0 }} onClick={() => setBoard((b) => b.filter((x) => x.id !== n.id))}>Fjern</button>
                </div>
              </div>
            )
          })}
        </Screen>
      )}

      {tab === 'lost' && (
        <Screen title="Tapt tid" subtitle="Når tid forsvinner. Hva vet vi?" right={<button className="navbtn" onClick={() => setEditLost({ id: uid(), date: Date.now(), duration: '', known: '', bought: '', amount: 0 })}>＋</button>}>
          {lost.length === 0 ? (
            <Empty icon="🕳️" title="Ingen hull logget" text="Våkner du med pakker på døra og ingen minne? Skriv det ned her, uten dom.">
              <Btn onClick={() => setEditLost({ id: uid(), date: Date.now(), duration: '', known: '', bought: '', amount: 0 })}>Logg tapt tid</Btn>
            </Empty>
          ) : (
            <>
              <div className="card"><div className="stat-l">Kjøp under tapt tid</div><div className="mid-num">{kr(lost.reduce((s, l) => s + (l.amount || 0), 0))}</div></div>
              <Section>
                {lost.map((l) => (
                  <Row key={l.id} onClick={() => setEditLost(l)} chevron label={`${fmtDate(l.date, { weekday: 'short', day: 'numeric', month: 'short' })} · ${l.duration || 'ukjent varighet'}`}
                    detail={[l.known, l.bought && `Kjøpt: ${l.bought}`].filter(Boolean).join(' · ') || '—'} value={l.amount ? kr(l.amount) : undefined} />
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[
        { id: 'front', label: 'Fremme', icon: '👁️' }, { id: 'parts', label: 'Deler', icon: '🫂' },
        { id: 'board', label: 'Tavla', icon: '📌' }, { id: 'lost', label: 'Tapt tid', icon: '🕳️' }]} />

      <Sheet open={switching} onClose={() => setSwitching(false)} title="Hvem er fremme?" action={{ label: 'Logg', onClick: doSwitch }}>
        <Section footer="Velg flere for co-front. Velg ingen for «uklart».">
          {parts.map((p) => (
            <Row key={p.id} icon={<Dot color={p.color} label={p.name} size={30} />} iconBg="transparent" label={p.name} detail={p.role}
              onClick={() => setSel((s) => s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id])}
              value={sel.includes(p.id) ? <span className="tint">✓</span> : undefined} />
          ))}
          {parts.length === 0 && <Row label="Legg til deler under «Deler» først" className="muted" />}
        </Section>
        <Section><InputRow value={swNote} onChange={setSwNote} placeholder="Notat (valgfritt): hva skjedde?" /></Section>
      </Sheet>

      {editPart && (
        <Sheet open onClose={() => setEditPart(null)} title={editPart.name || 'Ny del'}
          action={{ label: 'Lagre', disabled: !editPart.name.trim(), onClick: () => { setParts((a) => a.some((p) => p.id === editPart.id) ? a.map((p) => p.id === editPart.id ? editPart : p) : [...a, editPart]); setEditPart(null) } }}>
          <Section>
            <InputRow label="Navn" value={editPart.name} onChange={(v) => setEditPart({ ...editPart, name: v })} />
            <InputRow label="Alder" value={editPart.age} onChange={(v) => setEditPart({ ...editPart, age: v })} placeholder="valgfritt" />
            <InputRow label="Rolle" value={editPart.role} onChange={(v) => setEditPart({ ...editPart, role: v })} placeholder="beskytter, lille …" />
            <InputRow label="Pronomen" value={editPart.pronouns} onChange={(v) => setEditPart({ ...editPart, pronouns: v })} />
          </Section>
          <Section header="Farge">
            <div className="row" style={{ flexWrap: 'wrap', gap: 10 }}>
              {COLORS.map((c) => (
                <button key={c} aria-label={c} onClick={() => setEditPart({ ...editPart, color: c })} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: editPart.color === c ? '3px solid var(--label)' : 0 }} />
              ))}
            </div>
          </Section>
          <Section header="Trøst – hva hjelper"><TextRow value={editPart.comfort} onChange={(v) => setEditPart({ ...editPart, comfort: v })} placeholder="Teppe, musikk, at noen sier navnet …" /></Section>
          <Section header="Triggere – vær varsom med"><TextRow value={editPart.triggers} onChange={(v) => setEditPart({ ...editPart, triggers: v })} /></Section>
          {parts.some((p) => p.id === editPart.id) && <Section><ConfirmRow label="Fjern del" onConfirm={() => { setParts((a) => a.filter((p) => p.id !== editPart.id)); setEditPart(null) }} /></Section>}
        </Sheet>
      )}

      {editLost && (
        <Sheet open onClose={() => setEditLost(null)} title="Tapt tid"
          action={{ label: 'Lagre', onClick: () => { setLost((a) => a.some((l) => l.id === editLost.id) ? a.map((l) => l.id === editLost.id ? editLost : l) : [editLost, ...a]); setEditLost(null) } }}>
          <Section>
            <InputRow label="Når" type="datetime-local" value={new Date(editLost.date - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16)}
              onChange={(v) => v && setEditLost({ ...editLost, date: new Date(v).getTime() })} />
            <InputRow label="Hvor lenge" value={editLost.duration} onChange={(v) => setEditLost({ ...editLost, duration: v })} placeholder="ca. 3 timer" />
          </Section>
          <Section header="Hva vet vi"><TextRow value={editLost.known} onChange={(v) => setEditLost({ ...editLost, known: v })} placeholder="Spor: meldinger, kvitteringer, steder …" /></Section>
          <Section header="Hva ble kjøpt">
            <InputRow value={editLost.bought} onChange={(v) => setEditLost({ ...editLost, bought: v })} placeholder="Lego, robotstøvsuger …" />
            <NumRow label="Beløp" value={editLost.amount} onChange={(n) => setEditLost({ ...editLost, amount: n })} suffix="kr" />
          </Section>
          {lost.some((l) => l.id === editLost.id) && <Section><ConfirmRow label="Slett" onConfirm={() => { setLost((a) => a.filter((l) => l.id !== editLost.id)); setEditLost(null) }} /></Section>}
        </Sheet>
      )}
    </>
  )
}
