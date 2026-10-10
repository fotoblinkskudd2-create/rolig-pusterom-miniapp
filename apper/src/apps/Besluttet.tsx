import { useState } from 'react'
import { Btn, ConfirmRow, Empty, InputRow, Row, Screen, Section, Stepper, TabBar, TextRow, fmtDate, toast, uid, useStore } from '../kit'

type Decision = {
  id: string; title: string; options: string[]; criteria: { name: string; weight: number }[]
  scores: Record<string, number>; gut?: { picked: number; felt: 'lettet' | 'skuffet' }; outcome: string; created: number
}
const blank = (): Decision => ({ id: uid(), title: '', options: ['Alternativ A', 'Alternativ B'], criteria: [{ name: 'Økonomi', weight: 3 }, { name: 'Livskvalitet', weight: 5 }, { name: 'Folk', weight: 4 }], scores: {}, outcome: '', created: Date.now() })

/** Vektet sum per alternativ, normalisert til 0–10. */
export function totals(d: Decision) {
  const wsum = d.criteria.reduce((s, c) => s + c.weight, 0) || 1
  return d.options.map((_, oi) => d.criteria.reduce((s, c, ci) => s + c.weight * (d.scores[`${ci}-${oi}`] ?? 5), 0) / wsum)
}

export default function Besluttet() {
  const [tab, setTab] = useState<'matrix' | 'coin' | 'list'>('matrix')
  const [all, setAll] = useStore<Decision[]>('beslutt:all', [])
  const [curId, setCurId] = useStore('beslutt:current', '')
  const [flip, setFlip] = useState<{ n: number; result: number } | null>(null)
  const d = all.find((x) => x.id === curId)
  const upd = (p: Partial<Decision>) => d && setAll(all.map((x) => x.id === d.id ? { ...x, ...p } : x))
  const create = () => { const n = blank(); setAll([n, ...all]); setCurId(n.id); setTab('matrix') }

  const t = d ? totals(d) : []
  const best = t.indexOf(Math.max(...t))

  const doFlip = () => { if (!d) return; const result = Math.floor(Math.random() * d.options.length); setFlip({ n: (flip?.n ?? 0) + 1, result }); upd({ gut: undefined }) }

  return (
    <>
      {tab === 'matrix' && (
        <Screen title="Matrise" right={<button className="navbtn" onClick={create} aria-label="Ny beslutning">＋</button>}>
          {!d ? (
            <Empty icon="⚖️" title="Hva skal du bestemme?" text="Flytte? Slutte? Kjøpe? Lag en matrise, vekt det som betyr noe, og la magen si sitt.">
              <Btn onClick={create}>Ny beslutning</Btn>
            </Empty>
          ) : (
            <>
              <Section><InputRow value={d.title} onChange={(v) => upd({ title: v })} placeholder="Spørsmålet: Bergen eller Oslo?" /></Section>
              <Section header="Alternativer">
                {d.options.map((o, oi) => (
                  <div className="row" key={oi}>
                    <input className="inline left" value={o} onChange={(e) => upd({ options: d.options.map((x, i) => i === oi ? e.target.value : x) })} aria-label={`Alternativ ${oi + 1}`} />
                    {d.options.length > 2 && <button className="navbtn" onClick={() => upd({ options: d.options.filter((_, i) => i !== oi), scores: {} })} aria-label="Fjern">✕</button>}
                  </div>
                ))}
                {d.options.length < 5 && <Row className="action" label="＋ Alternativ" onClick={() => upd({ options: [...d.options, `Alternativ ${String.fromCharCode(65 + d.options.length)}`] })} />}
              </Section>
              {d.criteria.map((c, ci) => (
                <Section key={ci} header={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, textTransform: 'none' }}>
                    <input value={c.name} onChange={(e) => upd({ criteria: d.criteria.map((x, i) => i === ci ? { ...x, name: e.target.value } : x) })} style={{ border: 0, background: 'none', fontSize: 13, color: 'var(--label2)', flex: 1, outline: 'none', textTransform: 'uppercase' }} aria-label="Kriterium" />
                    <span>vekt {c.weight}</span>
                    <Stepper value={c.weight} onChange={(n) => upd({ criteria: d.criteria.map((x, i) => i === ci ? { ...x, weight: n } : x) })} min={1} max={5} />
                  </span>}>
                  {d.options.map((o, oi) => {
                    const k = `${ci}-${oi}`, s = d.scores[k] ?? 5
                    return (
                      <div className="row" key={oi}>
                        <span style={{ width: 96, flex: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o}</span>
                        <input type="range" min={1} max={10} value={s} onChange={(e) => upd({ scores: { ...d.scores, [k]: +e.target.value } })} aria-label={`${c.name} for ${o}`} />
                        <b style={{ width: 24, textAlign: 'right' }}>{s}</b>
                      </div>
                    )
                  })}
                </Section>
              ))}
              <div className="btn-row"><Btn kind="tinted" onClick={() => upd({ criteria: [...d.criteria, { name: 'Nytt kriterium', weight: 3 }] })}>＋ Kriterium</Btn></div>
              <Section header="Resultat">
                {d.options.map((o, oi) => (
                  <div className="row" key={oi} style={{ display: 'block' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontWeight: oi === best ? 700 : 400 }}>{oi === best && '🏆 '}{o}</span><b>{t[oi].toFixed(1).replace('.', ',')}</b></div>
                    <div className="progress"><div style={{ width: `${t[oi] * 10}%`, background: oi === best ? 'var(--green)' : 'var(--label3)' }} /></div>
                  </div>
                ))}
              </Section>
            </>
          )}
        </Screen>
      )}

      {tab === 'coin' && (
        <Screen title="Mynt" subtitle="Tallene har talt. Nå får magen ordet. Kast mynten, og kjenn etter hva du håpet på.">
          {!d ? <Empty icon="🪙" title="Lag en beslutning først" /> : (
            <>
              <div className="card center" style={{ perspective: 800, padding: '30px 16px' }}>
                <div key={flip?.n} style={{ width: 170, height: 170, margin: '0 auto', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #f5f5f7, #8e8e93 70%, #48484a)', display: 'grid', placeItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,.25)', animation: flip ? 'coin 1.4s cubic-bezier(.2,.8,.3,1)' : undefined, fontWeight: 700, fontSize: 20, color: '#1c1c1e', padding: 16, textAlign: 'center' }}>
                  {flip ? d.options[flip.result] : '?'}
                </div>
                <style>{'@keyframes coin{0%{transform:translateY(0) rotateX(0)}40%{transform:translateY(-90px) rotateX(1080deg)}100%{transform:translateY(0) rotateX(1800deg)}}'}</style>
              </div>
              {flip && !d.gut && (
                <>
                  <p className="center" style={{ margin: '0 16px 12px', fontWeight: 600 }}>Det ble «{d.options[flip.result]}». Hva kjente du?</p>
                  <div className="btn-row">
                    <Btn kind="gray" onClick={() => { upd({ gut: { picked: flip.result, felt: 'skuffet' } }); toast('Notert: skuffet') }}>😞 Skuffet</Btn>
                    <Btn onClick={() => { upd({ gut: { picked: flip.result, felt: 'lettet' } }); toast('Notert: lettet') }}>😮‍💨 Lettet</Btn>
                  </div>
                </>
              )}
              {d.gut && (
                <div className="card center">
                  <div className="mid-num" style={{ fontSize: 22 }}>Magen sier: {d.gut.felt === 'lettet' ? d.options[d.gut.picked] : d.options.length === 2 ? d.options[1 - d.gut.picked] : `ikke ${d.options[d.gut.picked]}`}</div>
                  <div className="small muted" style={{ marginTop: 6 }}>Matrisen sier: {d.options[best]}{(d.gut.felt === 'lettet' ? d.gut.picked === best : d.options.length === 2 && 1 - d.gut.picked === best) ? '. Enige. 🤝' : '. Uenige. Hvilket kriterium mangler?'}</div>
                </div>
              )}
              <div className="btn-row"><Btn kind={flip ? 'tinted' : 'filled'} onClick={doFlip}>{flip ? 'Kast igjen' : 'Kast mynten'}</Btn></div>
            </>
          )}
        </Screen>
      )}

      {tab === 'list' && (
        <Screen title="Beslutninger" right={<button className="navbtn" onClick={create} aria-label="Ny beslutning">＋</button>}>
          {all.length === 0 ? <Empty icon="📁" title="Ingen beslutninger" /> : (
            <Section>
              {all.map((x) => {
                const tt = totals(x), b = tt.indexOf(Math.max(...tt))
                return <Row key={x.id} chevron onClick={() => { setCurId(x.id); setTab('matrix') }} label={x.title || 'Uten tittel'} detail={`${fmtDate(x.created)} · matrise: ${x.options[b]}${x.gut ? ` · mage: ${x.gut.felt}` : ''}`} value={x.id === curId ? '●' : ''} />
              })}
            </Section>
          )}
          {d && (
            <>
              <Section header={`Hvordan gikk det? · ${d.title || 'Aktiv'}`} footer="Skriv det ned senere. Neste store valg blir lettere når du ser hvordan de forrige gikk.">
                <TextRow value={d.outcome} onChange={(v) => upd({ outcome: v })} placeholder="Jeg valgte … og det ble …" />
              </Section>
              <Section><ConfirmRow label="Slett denne beslutningen" onConfirm={() => { setAll(all.filter((x) => x.id !== d.id)); setCurId('') }} /></Section>
            </>
          )}
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'matrix', label: 'Matrise', icon: '⚖️' }, { id: 'coin', label: 'Mynt', icon: '🪙' }, { id: 'list', label: 'Beslutninger', icon: '📁' }]} />
    </>
  )
}
