import { useRef, useState, type PointerEvent } from 'react'
import { Btn, Chips, Empty, Row, Screen, Section, TabBar, TextRow, clamp, downloadText, fmtDate, fmtTime, toast, uid, useStore } from '../kit'

type Entry = { id: string; date: number; x: number; y: number; word: string; tags: string[]; note: string }

// Rader: høy → lav energi. Kolonner: ubehagelig → behagelig.
const WORDS = [
  ['Rasende', 'Stresset', 'Gira', 'Ekstatisk'],
  ['Irritert', 'Rastløs', 'Glad', 'Inspirert'],
  ['Nedfor', 'Likegyldig', 'Komfortabel', 'Trygg'],
  ['Fortvilet', 'Utmattet', 'Avslappet', 'Rolig'],
]
const TAGS = ['Søvn', 'Jobb', 'Folk', 'Familie', 'Kropp', 'Penger', 'Mat', 'Trening', 'Alene', 'Ute', 'Skjerm', 'Helse']
const Q = [
  { n: 'Høy energi, ubehagelig', c: '#ff5a4e' }, { n: 'Høy energi, behagelig', c: '#ffcc00' },
  { n: 'Lav energi, ubehagelig', c: '#5e5ce6' }, { n: 'Lav energi, behagelig', c: '#34c759' },
]
export const wordAt = (x: number, y: number) => WORDS[clamp(Math.floor((1 - y) * 4), 0, 3)][clamp(Math.floor(x * 4), 0, 3)]
const quad = (e: { x: number; y: number }) => (e.y >= 0.5 ? 0 : 2) + (e.x >= 0.5 ? 1 : 0)

function Pad({ x, y, onMove, dots, size = '100%' }: { x?: number; y?: number; onMove?: (x: number, y: number) => void; dots?: Entry[]; size?: string | number }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: PointerEvent) => {
    if (!onMove || !ref.current || (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse')) return
    const r = ref.current.getBoundingClientRect()
    onMove(clamp((e.clientX - r.left) / r.width, 0, 1), clamp(1 - (e.clientY - r.top) / r.height, 0, 1))
  }
  return (
    <div ref={ref} onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture?.(e.pointerId); move(e) }} onPointerMove={move}
      style={{ position: 'relative', width: size, aspectRatio: '1', borderRadius: 18, overflow: 'hidden', touchAction: 'none', cursor: onMove ? 'crosshair' : undefined }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #5e5ce6, #34c759)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #ff5a4e, #ffcc00)', WebkitMaskImage: 'linear-gradient(to bottom, #000, transparent)', maskImage: 'linear-gradient(to bottom, #000, transparent)' }} />
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,.4)' }} />
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,.4)' }} />
      {onMove && <>
        <span style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 11, fontWeight: 600, opacity: .85 }}>↑ energi</span>
        <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', fontSize: 11, fontWeight: 600, opacity: .85 }}>behag →</span>
      </>}
      {dots?.map((d) => <span key={d.id} style={{ position: 'absolute', left: `${d.x * 100}%`, top: `${(1 - d.y) * 100}%`, width: 12, height: 12, margin: -6, borderRadius: '50%', background: '#fff', border: '2px solid rgba(0,0,0,.35)' }} />)}
      {x != null && y != null && <span style={{ position: 'absolute', left: `${x * 100}%`, top: `${(1 - y) * 100}%`, width: 34, height: 34, margin: -17, borderRadius: '50%', background: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,.35)', transition: 'left .05s, top .05s' }} />}
    </div>
  )
}

export default function Humorvaer() {
  const [tab, setTab] = useState<'in' | 'week' | 'report'>('in')
  const [entries, setEntries] = useStore<Entry[]>('humor:entries', [])
  const [pt, setPt] = useState({ x: 0.5, y: 0.5 })
  const [tags, setTags] = useState<string[]>([])
  const [note, setNote] = useState('')
  const word = wordAt(pt.x, pt.y)
  const week = entries.filter((e) => Date.now() - e.date < 7 * 864e5)
  const qCounts = [0, 1, 2, 3].map((q) => entries.filter((e) => quad(e) === q).length)
  const tagCounts = TAGS.map((t) => ({ t, n: entries.filter((e) => e.tags.includes(t)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n)
  const tagByQuad = (q: number) => TAGS.map((t) => ({ t, n: entries.filter((e) => quad(e) === q && e.tags.includes(t)).length })).filter((x) => x.n).sort((a, b) => b.n - a.n).slice(0, 3)

  const exportTxt = () => downloadText('humorvaer-rapport.txt', [
    'HUMØRVÆR – rapport til behandler', new Date().toLocaleString('nb-NO'), `${entries.length} innsjekker`, '',
    'FORDELING:', ...Q.map((q, i) => `  ${q.n}: ${qCounts[i]} (${entries.length ? Math.round((qCounts[i] / entries.length) * 100) : 0} %)`), '',
    'VANLIGSTE TAGGER:', ...tagCounts.slice(0, 8).map((x) => `  ${x.t}: ${x.n}`), '',
    'TAGGER I «LAV ENERGI, UBEHAGELIG»:', ...tagByQuad(2).map((x) => `  ${x.t}: ${x.n}`), '',
    'LOGG:', ...entries.map((e) => `${new Date(e.date).toLocaleString('nb-NO')}  ${e.word}  (energi ${Math.round(e.y * 10)}/10, behag ${Math.round(e.x * 10)}/10)  ${e.tags.join(', ')}${e.note ? '  – ' + e.note : ''}`),
  ].join('\n'))

  return (
    <>
      {tab === 'in' && (
        <Screen title="Sjekk inn" subtitle="Dra prikken dit du er. Høyde er energi, bredde er hvor behagelig det er.">
          <div style={{ padding: '0 16px 12px' }}><Pad x={pt.x} y={pt.y} onMove={(x, y) => setPt({ x, y })} /></div>
          <div className="center" style={{ marginBottom: 18 }}><div className="mid-num" style={{ fontSize: 32 }}>{word}</div></div>
          <Section header="Hva henger sammen med det?"><div className="row"><Chips options={TAGS} value={tags} onToggle={(t) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])} /></div></Section>
          <Section><TextRow value={note} onChange={setNote} placeholder="Notat (valgfritt)" /></Section>
          <div className="btn-row"><Btn onClick={() => { setEntries([{ id: uid(), date: Date.now(), ...pt, word, tags, note }, ...entries]); setTags([]); setNote(''); toast(`«${word}» lagret`) }}>Lagre</Btn></div>
        </Screen>
      )}

      {tab === 'week' && (
        <Screen title="Uka">
          {week.length === 0 ? <Empty icon="🌦️" title="Ingen innsjekk denne uka" /> : (
            <>
              <div style={{ padding: '0 16px 20px' }}><Pad dots={week} /></div>
              <Section>
                {week.map((e) => (
                  <Row key={e.id} icon="" iconBg={Q[quad(e)].c} label={e.word} detail={`${fmtDate(e.date, { weekday: 'short' })} ${fmtTime(e.date)}${e.tags.length ? ' · ' + e.tags.join(', ') : ''}${e.note ? ' · ' + e.note : ''}`}
                    value={<button className="navbtn small" onClick={() => setEntries(entries.filter((x) => x.id !== e.id))}>Slett</button>} />
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'report' && (
        <Screen title="Rapport" subtitle="Til deg selv eller behandleren din.">
          {entries.length === 0 ? <Empty icon="📄" title="Ingen data ennå" /> : (
            <>
              <Section header="Fordeling">
                {Q.map((q, i) => (
                  <div className="row" key={q.n} style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>{q.n}</span><span className="muted">{qCounts[i]}</span></div>
                    <div className="progress"><div style={{ width: `${(qCounts[i] / entries.length) * 100}%`, background: q.c }} /></div>
                  </div>
                ))}
              </Section>
              {tagCounts.length > 0 && <Section header="Vanligste tagger">{tagCounts.slice(0, 6).map((x) => <Row key={x.t} label={x.t} value={x.n} />)}</Section>}
              {tagByQuad(2).length > 0 && <Section header="Når du er nede og tom" footer="Tagger som oftest henger med lav energi og ubehag.">{tagByQuad(2).map((x) => <Row key={x.t} label={x.t} value={x.n} />)}</Section>}
              <div className="btn-row"><Btn onClick={exportTxt}>Eksporter rapport (.txt)</Btn></div>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'in', label: 'Sjekk inn', icon: '🎯' }, { id: 'week', label: 'Uka', icon: '🗓️' }, { id: 'report', label: 'Rapport', icon: '📄' }]} />
    </>
  )
}
