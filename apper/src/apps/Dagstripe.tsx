import { useState } from 'react'
import { Btn, ConfirmRow, Empty, InputRow, Ring, Row, Screen, Section, Sheet, TabBar, dayKey, fmtDur, pad2, toast, uid, useNow, useStore } from '../kit'

type Block = { id: string; emoji: string; title: string; start: string; dur: number; color: string; done?: boolean }
type Tpl = { id: string; name: string; blocks: Omit<Block, 'id' | 'done'>[] }

const COLORS = ['#ffb340', '#ff375f', '#63e6e2', '#7d7aff', '#34c759', '#bf5af2', '#64d2ff', '#a2845e']
const EMOJI = ['☕', '🚿', '🍳', '💊', '💻', '📞', '🧹', '🛒', '🏃', '🍽️', '📚', '🎮', '🛋️', '🛏️', '🚌', '🐕', '🧘', '✍️']
const DURS = [15, 30, 45, 60, 90, 120]
const START_H = 6, END_H = 24, PX = 1.1

const toMin = (s: string) => { const [h, m] = s.split(':').map(Number); return h * 60 + m }
const fmtMin = (m: number) => `${pad2(Math.floor(m / 60) % 24)}:${pad2(m % 60)}`

const DEFAULT_TPL: Tpl[] = [
  { id: 'morgen', name: 'Morgen', blocks: [
    { emoji: '💊', title: 'Medisin + vann', start: '07:30', dur: 15, color: '#64d2ff' },
    { emoji: '🚿', title: 'Dusj', start: '07:45', dur: 15, color: '#63e6e2' },
    { emoji: '🍳', title: 'Frokost', start: '08:00', dur: 30, color: '#ffb340' },
  ] },
  { id: 'kveld', name: 'Kveld', blocks: [
    { emoji: '🍽️', title: 'Middag', start: '17:30', dur: 45, color: '#ffb340' },
    { emoji: '🧹', title: '10 min rydding', start: '19:00', dur: 15, color: '#34c759' },
    { emoji: '🛋️', title: 'Fri tid', start: '20:00', dur: 90, color: '#bf5af2' },
    { emoji: '🛏️', title: 'Skjerm av, seng', start: '22:30', dur: 30, color: '#7d7aff' },
  ] },
]

export default function Dagstripe() {
  const [tab, setTab] = useState<'day' | 'now' | 'tpl'>('day')
  const [all, setAll] = useStore<Record<string, Block[]>>('dag:blocks', {})
  const [tpls, setTpls] = useStore<Tpl[]>('dag:templates', DEFAULT_TPL)
  const [edit, setEdit] = useState<Block | null>(null)
  const now = useNow(10000)
  const key = dayKey(now)
  const blocks = [...(all[key] ?? [])].sort((a, b) => toMin(a.start) - toMin(b.start))
  const setBlocks = (f: (b: Block[]) => Block[]) => setAll((a) => ({ ...a, [key]: f(a[key] ?? []) }))
  const d = new Date(now), nowMin = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60
  const current = blocks.find((b) => nowMin >= toMin(b.start) && nowMin < toMin(b.start) + b.dur)
  const nextB = blocks.find((b) => toMin(b.start) > nowMin)

  const blank = (): Block => {
    const last = blocks[blocks.length - 1]
    const start = last ? Math.max(toMin(last.start) + last.dur, Math.ceil(nowMin / 15) * 15) : Math.ceil(nowMin / 15) * 15
    return { id: uid(), emoji: '💻', title: '', start: fmtMin(Math.min(start, 23 * 60)), dur: 30, color: COLORS[blocks.length % COLORS.length] }
  }
  const applyTpl = (t: Tpl) => { setBlocks((b) => [...b, ...t.blocks.map((x) => ({ ...x, id: uid() }))]); toast(`«${t.name}» lagt til`); setTab('day') }

  return (
    <>
      {tab === 'day' && (
        <Screen title="I dag" right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Ny blokk">＋</button>}>
          {blocks.length === 0 && (
            <Empty icon="🌈" title="Tom dag" text="Legg til blokker, eller start med en mal.">
              <div className="stack"><Btn onClick={() => setEdit(blank())}>Ny blokk</Btn>{tpls.map((t) => <Btn key={t.id} kind="tinted" onClick={() => applyTpl(t)}>Bruk «{t.name}»</Btn>)}</div>
            </Empty>
          )}
          {blocks.length > 0 && (
            <div style={{ position: 'relative', margin: '0 16px 24px 0', height: (END_H - START_H) * 60 * PX }}>
              {Array.from({ length: END_H - START_H }, (_, i) => (
                <div key={i} style={{ position: 'absolute', top: i * 60 * PX, left: 0, right: 0, borderTop: '0.5px solid var(--sep)' }}>
                  <span className="small muted" style={{ position: 'absolute', left: 12, top: -9, background: 'var(--bg)', padding: '0 4px', fontVariantNumeric: 'tabular-nums' }}>{pad2(START_H + i)}</span>
                </div>
              ))}
              {blocks.map((b) => {
                const top = (toMin(b.start) - START_H * 60) * PX, h = Math.max(26, b.dur * PX - 3)
                const isCur = b === current
                return (
                  <button key={b.id} onClick={() => setEdit(b)} style={{
                    position: 'absolute', top, left: 58, right: 0, height: h, border: 0, borderRadius: 10, padding: '4px 10px', textAlign: 'left',
                    background: b.done ? 'var(--fill)' : b.color, color: b.done ? 'var(--label2)' : '#1c1c1e', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden',
                    boxShadow: isCur ? `0 0 0 3px var(--bg), 0 0 0 5px ${b.color}` : undefined, opacity: b.done ? 0.7 : 1,
                  }}>
                    <span style={{ fontSize: h > 40 ? 22 : 16 }}>{b.done ? '✅' : b.emoji}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontWeight: 600, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: b.done ? 'line-through' : undefined }}>{b.title || 'Uten navn'}</span>
                      {h > 40 && <span style={{ fontSize: 12, opacity: .75 }}>{b.start}–{fmtMin(toMin(b.start) + b.dur)}</span>}
                    </span>
                  </button>
                )
              })}
              {nowMin >= START_H * 60 && <div style={{ position: 'absolute', top: (nowMin - START_H * 60) * PX, left: 50, right: 0, height: 2, background: 'var(--red)', zIndex: 2 }}>
                <span style={{ position: 'absolute', left: -5, top: -4, width: 10, height: 10, borderRadius: '50%', background: 'var(--red)' }} />
              </div>}
            </div>
          )}
        </Screen>
      )}

      {tab === 'now' && (
        <Screen title="Nå">
          {current ? (() => {
            const end = toMin(current.start) + current.dur, leftMs = (end - nowMin) * 60000
            return (
              <>
                <div className="card center" style={{ background: current.color, color: '#1c1c1e' }}>
                  <Ring value={leftMs / (current.dur * 60000)} size={230} stroke={18} color="rgba(0,0,0,.55)" track="rgba(255,255,255,.35)">
                    <div><div style={{ fontSize: 64 }}>{current.emoji}</div><div className="mid-num">{fmtDur(leftMs).replace(/:\d\d$/, '')} min</div><div className="small">igjen</div></div>
                  </Ring>
                  <div className="mid-num" style={{ marginTop: 14 }}>{current.title}</div>
                  <div className="small">{current.start}–{fmtMin(end)}</div>
                </div>
                <div className="btn-row"><Btn onClick={() => { setBlocks((bs) => bs.map((x) => x.id === current.id ? { ...x, done: true } : x)); toast('Ferdig! ✅') }}>Ferdig</Btn></div>
              </>
            )
          })() : <Empty icon="🌤️" title="Ingen blokk akkurat nå" text={nextB ? undefined : 'Ingenting mer planlagt i dag.'} />}
          {nextB && <Section header="Neste"><Row icon={nextB.emoji} iconBg={nextB.color} label={nextB.title} value={`${nextB.start} · om ${Math.round(toMin(nextB.start) - nowMin)} min`} /></Section>}
        </Screen>
      )}

      {tab === 'tpl' && (
        <Screen title="Maler" subtitle="Legg en hel rutine inn i dagen med ett trykk.">
          {tpls.map((t) => (
            <Section key={t.id} header={t.name}>
              {t.blocks.map((b, i) => <Row key={i} icon={b.emoji} iconBg={b.color} label={b.title} value={`${b.start} · ${b.dur} min`} />)}
              <Row className="action" label={`Bruk «${t.name}» i dag`} onClick={() => applyTpl(t)} />
            </Section>
          ))}
          {blocks.length > 0 && (
            <div className="btn-row"><Btn kind="tinted" onClick={() => { const name = `Mal ${tpls.length + 1}`; setTpls([...tpls, { id: uid(), name, blocks: blocks.map(({ emoji, title, start, dur, color }) => ({ emoji, title, start, dur, color })) }]); toast(`Lagret som «${name}»`) }}>Lagre dagen som mal</Btn></div>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'day', label: 'I dag', icon: '🌈' }, { id: 'now', label: 'Nå', icon: '⏳' }, { id: 'tpl', label: 'Maler', icon: '📋' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.title || 'Ny blokk'}
          action={{ label: 'Lagre', onClick: () => { setBlocks((bs) => bs.some((x) => x.id === edit.id) ? bs.map((x) => x.id === edit.id ? edit : x) : [...bs, edit]); setEdit(null) } }}>
          <div className="center" style={{ fontSize: 56, marginBottom: 8 }}>{edit.emoji}</div>
          <Section><div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{EMOJI.map((e) => <button key={e} className={'chip' + (edit.emoji === e ? ' on' : '')} onClick={() => setEdit({ ...edit, emoji: e })} style={{ fontSize: 20 }}>{e}</button>)}</div></Section>
          <Section>
            <InputRow label="Hva" value={edit.title} onChange={(v) => setEdit({ ...edit, title: v })} placeholder="Svare på e-post" />
            <InputRow label="Start" type="time" value={edit.start} onChange={(v) => v && setEdit({ ...edit, start: v })} />
          </Section>
          <Section header="Varighet"><div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>{DURS.map((m) => <button key={m} className={'chip' + (edit.dur === m ? ' on' : '')} onClick={() => setEdit({ ...edit, dur: m })}>{m} min</button>)}</div></Section>
          <Section header="Farge"><div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>{COLORS.map((c) => <button key={c} aria-label={c} onClick={() => setEdit({ ...edit, color: c })} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: edit.color === c ? '3px solid var(--label)' : 0 }} />)}</div></Section>
          {blocks.some((b) => b.id === edit.id) && (
            <Section>
              <Row className="action" label={edit.done ? 'Marker som ikke ferdig' : 'Marker som ferdig'} onClick={() => setEdit({ ...edit, done: !edit.done })} />
              <ConfirmRow label="Slett blokk" onConfirm={() => { setBlocks((bs) => bs.filter((x) => x.id !== edit.id)); setEdit(null) }} />
            </Section>
          )}
        </Sheet>
      )}
    </>
  )
}
