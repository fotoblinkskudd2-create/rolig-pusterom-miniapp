import { useEffect, useState } from 'react'
import { Btn, Empty, InputRow, Row, Screen, Section, StepperRow, TabBar, haptic, num, toast, uid, useStore } from '../kit'

type Phrase = { id: string; emoji: string; text: string }
const BOARD: Record<string, { c: string; p: [string, string][] }> = {
  Behov: { c: '#34c759', p: [['💧', 'Jeg er tørst'], ['🍽️', 'Jeg er sulten'], ['🚻', 'Jeg må på do'], ['🤕', 'Jeg har vondt'], ['🥶', 'Jeg fryser'], ['🥵', 'Jeg er for varm'], ['😴', 'Jeg er trøtt'], ['💊', 'Jeg trenger medisinen min'], ['🛏️', 'Jeg vil legge meg'], ['🌬️', 'Jeg trenger frisk luft']] },
  Følelser: { c: '#ff9f0a', p: [['🙂', 'Jeg har det bra'], ['😟', 'Jeg er redd'], ['😢', 'Jeg er lei meg'], ['😠', 'Jeg er frustrert'], ['😵‍💫', 'Det blir for mye nå'], ['🤗', 'Jeg vil ha en klem'], ['🙏', 'Takk'], ['❤️', 'Jeg er glad i deg']] },
  Samtale: { c: '#2f6bff', p: [['⏳', 'Kan du vente litt?'], ['🔁', 'Kan du si det igjen?'], ['🐢', 'Snakk litt saktere'], ['✍️', 'Kan du skrive det ned?'], ['🤷', 'Jeg vet ikke'], ['🗣️', 'Jeg kan ikke snakke nå, men jeg forstår deg'], ['👋', 'Hei'], ['👋', 'Ha det']] },
  Folk: { c: '#ff2d55', p: [['📞', 'Kan du ringe familien min?'], ['🧑‍⚕️', 'Jeg vil snakke med legen'], ['🆘', 'Jeg trenger hjelp nå'], ['🚪', 'Jeg vil være alene litt'], ['👀', 'Bli her hos meg']] },
}

function useSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const load = () => setVoices(speechSynthesis.getVoices())
    load(); speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [])
  const voice = voices.find((v) => /^(nb|no|nn)/i.test(v.lang)) ?? voices.find((v) => /^(sv|da)/i.test(v.lang))
  return { voice, supported: 'speechSynthesis' in window }
}

export default function Snakkebrett() {
  const [tab, setTab] = useState<'board' | 'type' | 'mine'>('board')
  const [cat, setCat] = useState('Behov')
  const [custom, setCustom] = useStore<Phrase[]>('snakk:custom', [])
  const [rate, setRate] = useStore('snakk:rate', 0.95)
  const [text, setText] = useState('')
  const [big, setBig] = useState<string | null>(null)
  const [lit, setLit] = useState<string | null>(null)
  const [draft, setDraft] = useState({ emoji: '💬', text: '' })
  const { voice, supported } = useSpeech()

  const say = (t: string, key = t) => {
    haptic(15); setLit(key); setTimeout(() => setLit(null), 900)
    if (!supported) { setBig(t); return }
    speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(t)
    u.lang = voice?.lang ?? 'nb-NO'; if (voice) u.voice = voice; u.rate = rate
    speechSynthesis.speak(u)
  }

  const cats = [...Object.keys(BOARD), ...(custom.length ? ['Mine'] : [])]
  const phrases: Phrase[] = cat === 'Mine' ? custom : BOARD[cat].p.map(([emoji, t]) => ({ id: t, emoji, text: t }))
  const color = cat === 'Mine' ? '#5856d6' : BOARD[cat].c

  const Tile = ({ p }: { p: Phrase }) => (
    <button onClick={() => say(p.text, p.id)} style={{ border: 0, borderRadius: 18, padding: '16px 12px', minHeight: 104, background: lit === p.id ? color : 'var(--bg2)', color: lit === p.id ? '#fff' : 'var(--label)', boxShadow: `inset 0 0 0 2px ${color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 17, fontWeight: 600, lineHeight: 1.2, transition: 'background .15s' }}>
      <span style={{ fontSize: 34 }}>{p.emoji}</span>{p.text}
    </button>
  )

  return (
    <>
      {tab === 'board' && (
        <Screen title="Brett" large={false}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 16px' }}>
            {[['JA', '#34c759'], ['NEI', '#ff3b30']].map(([t, c]) => (
              <button key={t} onClick={() => say(t === 'JA' ? 'Ja' : 'Nei', t)} style={{ border: 0, borderRadius: 20, height: 96, fontSize: 40, fontWeight: 800, color: '#fff', background: c, opacity: lit === t ? 0.7 : 1, transform: lit === t ? 'scale(.97)' : undefined, transition: 'all .15s' }}>{t}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '4px 16px 14px', overflowX: 'auto' }}>
            {cats.map((c) => <button key={c} className={'chip' + (cat === c ? ' on' : '')} style={{ flex: 'none', fontSize: 17, padding: '10px 16px', ...(cat === c ? { background: c === 'Mine' ? '#5856d6' : BOARD[c].c } : {}) }} onClick={() => setCat(c)}>{c}</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px 24px' }}>
            {phrases.map((p) => <Tile key={p.id} p={p} />)}
          </div>
          {!supported && <p className="pad small muted">Denne nettleseren har ikke tale. Frasene vises i stedet stort på skjermen.</p>}
        </Screen>
      )}

      {tab === 'type' && (
        <Screen title="Skriv">
          <div className="section"><div className="group" style={{ padding: 16 }}>
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Skriv det du vil si …" aria-label="Tekst"
              style={{ width: '100%', minHeight: 160, border: 0, outline: 'none', background: 'none', fontSize: 26, lineHeight: 1.3, resize: 'vertical' }} />
          </div></div>
          <div className="btn-row">
            <Btn disabled={!text.trim()} onClick={() => say(text)}>🔊 Snakk</Btn>
            <Btn kind="tinted" disabled={!text.trim()} onClick={() => setBig(text)}>Vis stort</Btn>
          </div>
          <div className="btn-row">
            <Btn kind="gray" disabled={!text.trim()} onClick={() => { setCustom([...custom, { id: uid(), emoji: '💬', text: text.trim() }]); toast('Lagret under «Mine»') }}>Lagre som frase</Btn>
            <Btn kind="gray" disabled={!text} onClick={() => setText('')}>Tøm</Btn>
          </div>
        </Screen>
      )}

      {tab === 'mine' && (
        <Screen title="Mine fraser">
          <Section header="Ny frase">
            <InputRow label="Emoji" value={draft.emoji} onChange={(v) => setDraft({ ...draft, emoji: v })} />
            <InputRow label="Tekst" value={draft.text} onChange={(v) => setDraft({ ...draft, text: v })} placeholder="Jeg heter Kari" />
          </Section>
          <div className="btn-row"><Btn disabled={!draft.text.trim()} onClick={() => { setCustom([...custom, { id: uid(), emoji: draft.emoji || '💬', text: draft.text.trim() }]); setDraft({ emoji: '💬', text: '' }); toast('Lagt til') }}>Legg til</Btn></div>
          {custom.length === 0 ? <Empty icon="💬" title="Ingen egne fraser" text="Navn, adresse, allergier, «Jeg har afasi, gi meg tid»." /> : (
            <Section header="Fraser" footer="Trykk for å høre. Pilene flytter.">
              {custom.map((p, i) => (
                <div className="row" key={p.id}>
                  <button onClick={() => say(p.text, p.id)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 0, padding: 0, textAlign: 'left', minWidth: 0 }}>
                    <span className="row-icon" style={{ background: 'var(--fill)' }}>{p.emoji}</span>
                    <span className="row-label">{p.text}</span>
                  </button>
                  <button className="navbtn" disabled={i === 0} onClick={() => { const a = [...custom];[a[i - 1], a[i]] = [a[i], a[i - 1]]; setCustom(a) }} aria-label="Flytt opp">↑</button>
                  <button className="navbtn" disabled={i === custom.length - 1} onClick={() => { const a = [...custom];[a[i + 1], a[i]] = [a[i], a[i + 1]]; setCustom(a) }} aria-label="Flytt ned">↓</button>
                  <button className="navbtn" style={{ color: 'var(--red)' }} onClick={() => setCustom(custom.filter((x) => x.id !== p.id))} aria-label="Slett">✕</button>
                </div>
              ))}
            </Section>
          )}
          <Section header="Tale" footer={voice ? `Stemme: ${voice.name} (${voice.lang})` : 'Fant ingen norsk stemme. Installer norsk tale i systeminnstillingene for best resultat.'}>
            <StepperRow label="Tempo" value={rate} onChange={setRate} step={0.05} min={0.5} max={1.5} fmt={(n) => num(n, 2)} />
            <Row className="action" label="Test stemmen" onClick={() => say('Hei, dette er stemmen min.', 'test')} />
          </Section>
        </Screen>
      )}

      <TabBar value={tab} onChange={setTab} tabs={[{ id: 'board', label: 'Brett', icon: '🗣️' }, { id: 'type', label: 'Skriv', icon: '⌨️' }, { id: 'mine', label: 'Mine', icon: '⭐' }]} />

      {big && (
        <button onClick={() => setBig(null)} aria-label="Lukk" style={{ position: 'fixed', inset: 0, zIndex: 80, border: 0, background: '#000', color: '#fff', display: 'grid', placeItems: 'center', padding: 24, fontSize: 'clamp(36px, 11vw, 96px)', fontWeight: 800, lineHeight: 1.1, textAlign: 'center', wordBreak: 'break-word' }}>
          {big}
          <span style={{ position: 'absolute', bottom: 'calc(24px + env(safe-area-inset-bottom))', left: 0, right: 0, fontSize: 15, fontWeight: 400, opacity: .5 }}>Trykk for å lukke</span>
        </button>
      )}
    </>
  )
}
