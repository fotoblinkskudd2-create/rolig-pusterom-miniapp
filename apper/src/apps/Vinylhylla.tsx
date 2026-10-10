import { useMemo, useState } from 'react'
import {
  Btn, ConfirmRow, Empty, InputRow, Row, Screen, Section, Seg, Sheet, TabBar, TextRow,
  daysBetween, fmtDate, toast, uid, useStore,
} from '../kit'

type Rec = { id: string; artist: string; album: string; year: string; pressing: string; grade: string; plays: number; last?: number; added: number; notes: string }
const GRADES = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P']
const GRADE_TXT: Record<string, string> = { M: 'Mint – uåpnet', NM: 'Near Mint – nesten perfekt', 'VG+': 'Very Good Plus – lette merker', VG: 'Very Good – hørbart sus', 'G+': 'Good Plus – tydelig slitt', G: 'Good – spilles, men slitt', F: 'Fair – skadet', P: 'Poor – knapt spillbar' }

function hue(s: string) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h }
function Cover({ r, size }: { r: Rec; size: number | string }) {
  const h = hue(r.artist + r.album)
  return (
    <div style={{ width: size, aspectRatio: '1', borderRadius: 8, background: `linear-gradient(135deg, hsl(${h} 70% 55%), hsl(${(h + 60) % 360} 60% 25%))`, display: 'flex', alignItems: 'flex-end', padding: 8, color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,.2)', overflow: 'hidden' }}>
      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.15, textShadow: '0 1px 2px rgba(0,0,0,.4)' }}>{r.album}<br /><span style={{ fontWeight: 400, opacity: .85 }}>{r.artist}</span></div>
    </div>
  )
}

/** Vektet trekning: plater som ikke er spilt på lenge og sjelden, vinner oftere. */
function pick(recs: Rec[], exclude?: string) {
  const pool = recs.filter((r) => r.id !== exclude)
  if (!pool.length) return recs[0]
  const now = Date.now()
  const w = pool.map((r) => Math.pow(daysBetween(r.last ?? r.added - 30 * 864e5, now) + 1, 1.5) / (r.plays + 1))
  let x = Math.random() * w.reduce((a, b) => a + b, 0)
  for (let i = 0; i < pool.length; i++) { x -= w[i]; if (x <= 0) return pool[i] }
  return pool[pool.length - 1]
}

export default function Vinylhylla() {
  const [tab, setTab] = useState<'shelf' | 'play'>('shelf')
  const [recs, setRecs] = useStore<Rec[]>('vinyl:recs', [])
  const [sort, setSort] = useState<'artist' | 'year' | 'plays'>('artist')
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState<Rec | null>(null)
  const [sugId, setSugId] = useState<string | null>(null)
  const [spin, setSpin] = useState(0)

  const list = useMemo(() => {
    const s = q.toLowerCase()
    return recs.filter((r) => (r.artist + r.album).toLowerCase().includes(s)).sort((a, b) =>
      sort === 'artist' ? a.artist.localeCompare(b.artist, 'nb') : sort === 'year' ? (+a.year || 0) - (+b.year || 0) : b.plays - a.plays)
  }, [recs, q, sort])
  const sug = recs.find((r) => r.id === sugId) ?? null
  const next = () => { const p = pick(recs, sugId ?? undefined); setSugId(p?.id ?? null); setSpin((s) => s + 1) }
  const play = (id: string) => { setRecs((a) => a.map((r) => r.id === id ? { ...r, plays: r.plays + 1, last: Date.now() } : r)); toast('▶ Spilles') }
  const blank = (): Rec => ({ id: uid(), artist: '', album: '', year: '', pressing: '', grade: 'VG+', plays: 0, added: Date.now(), notes: '' })
  const totalPlays = recs.reduce((s, r) => s + r.plays, 0)

  return (
    <>
      {tab === 'shelf' && (
        <Screen title="Hylla" subtitle={recs.length ? `${recs.length} plater · ${totalPlays} avspillinger` : undefined}
          right={<button className="navbtn" onClick={() => setEdit(blank())} aria-label="Ny plate">＋</button>}>
          {recs.length === 0 ? (
            <Empty icon="💿" title="Hylla er tom" text="Legg inn platene dine. Omslaget lages som en fargegradient fra navnet.">
              <Btn onClick={() => setEdit(blank())}>Legg til plate</Btn>
            </Empty>
          ) : (
            <>
              <div className="searchbar"><span>🔍</span><input placeholder="Søk artist eller album" value={q} onChange={(e) => setQ(e.target.value)} /></div>
              <Seg value={sort} onChange={setSort} options={[{ value: 'artist', label: 'Artist' }, { value: 'year', label: 'År' }, { value: 'plays', label: 'Mest spilt' }]} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: '0 16px 24px' }}>
                {list.map((r) => (
                  <button key={r.id} onClick={() => setEdit(r)} style={{ background: 'none', border: 0, padding: 0, textAlign: 'left' }}>
                    <Cover r={r} size="100%" />
                    <div className="small muted" style={{ marginTop: 4 }}>{r.grade} · {r.plays}×</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </Screen>
      )}

      {tab === 'play' && (
        <Screen title="Hva spiller jeg?">
          {recs.length === 0 ? <Empty icon="🎶" title="Ingen plater" text="Legg inn plater på hylla først." /> : (
            <>
              <div className="card center" style={{ background: '#111', color: '#fff' }}>
                <div key={spin} style={{ width: 210, height: 210, margin: '10px auto 18px', borderRadius: '50%', background: 'repeating-radial-gradient(circle, #1a1a1a 0 2px, #0c0c0c 2px 4px)', display: 'grid', placeItems: 'center', animation: 'vspin 1.6s cubic-bezier(.2,.8,.3,1)' }}>
                  <div style={{ width: 76, height: 76, borderRadius: '50%', background: sug ? `hsl(${hue(sug.artist + sug.album)} 70% 55%)` : '#ff2d55', display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#111' }} />
                  </div>
                </div>
                <style>{'@keyframes vspin{from{transform:rotate(-540deg)}to{transform:none}}'}</style>
                {sug ? (
                  <>
                    <div className="mid-num">{sug.album}</div>
                    <div style={{ opacity: .75 }}>{sug.artist}{sug.year && ` · ${sug.year}`}</div>
                    <div className="small" style={{ marginTop: 8, color: '#ff6b8a' }}>
                      {sug.last ? `Ikke spilt på ${daysBetween(sug.last, Date.now())} dager` : 'Aldri spilt'} · {sug.plays}× totalt
                    </div>
                  </>
                ) : <div style={{ opacity: .7 }}>Trykk for et forslag</div>}
              </div>
              <div className="btn-row">
                <Btn kind="gray" onClick={next}>{sug ? 'En annen' : 'Foreslå'}</Btn>
                <Btn disabled={!sug} onClick={() => sug && play(sug.id)}>Spill</Btn>
              </div>
              <p className="pad small muted">Forslagene vekter plater du ikke har spilt på lenge, og som er spilt sjelden.</p>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={(t) => { setTab(t); if (t === 'play' && !sugId && recs.length) next() }} tabs={[{ id: 'shelf', label: 'Hylla', icon: '📚' }, { id: 'play', label: 'Spill', icon: '💿' }]} />

      {edit && (
        <Sheet open onClose={() => setEdit(null)} title={edit.album || 'Ny plate'}
          action={{ label: 'Lagre', disabled: !edit.artist || !edit.album, onClick: () => { setRecs((a) => a.some((r) => r.id === edit.id) ? a.map((r) => r.id === edit.id ? edit : r) : [...a, edit]); setEdit(null) } }}>
          {edit.album && <div style={{ width: 140, margin: '0 auto 16px' }}><Cover r={edit} size={140} /></div>}
          <Section>
            <InputRow label="Artist" value={edit.artist} onChange={(v) => setEdit({ ...edit, artist: v })} />
            <InputRow label="Album" value={edit.album} onChange={(v) => setEdit({ ...edit, album: v })} />
            <InputRow label="År" value={edit.year} onChange={(v) => setEdit({ ...edit, year: v })} inputMode="numeric" />
            <InputRow label="Pressing" value={edit.pressing} onChange={(v) => setEdit({ ...edit, pressing: v })} placeholder="UK 1977, 180 g …" />
          </Section>
          <Section header="Gradering (Goldmine)" footer={GRADE_TXT[edit.grade]}>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {GRADES.map((g) => <button key={g} className={'chip' + (edit.grade === g ? ' on' : '')} onClick={() => setEdit({ ...edit, grade: g })}>{g}</button>)}
            </div>
          </Section>
          <Section>
            <Row label="Avspillinger" value={`${edit.plays}×`} />
            <Row label="Sist spilt" value={edit.last ? fmtDate(edit.last, { dateStyle: 'medium' }) : 'Aldri'} />
          </Section>
          <Section header="Notater"><TextRow value={edit.notes} onChange={(v) => setEdit({ ...edit, notes: v })} /></Section>
          {recs.some((r) => r.id === edit.id) && <Section><ConfirmRow label="Fjern fra hylla" onConfirm={() => { setRecs((a) => a.filter((r) => r.id !== edit.id)); setEdit(null) }} /></Section>}
        </Sheet>
      )}
    </>
  )
}
