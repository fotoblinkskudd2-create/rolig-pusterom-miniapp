import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import raw from './concepts.json'
import type { Concept } from './types'
import { APPS } from './apps'
import { AppCtx, Btn, Section, Sheet, ToastHost, copyText, toast } from './kit'

const concepts = raw as Concept[]
const CATS = ['Penger', 'Hode', 'Kropp', 'Familie', 'Håndverk', 'Verktøy']

function useHashRoute() {
  const get = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''))
  const [route, setRoute] = useState(get)
  useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

export function AppIcon({ c, size = 62 }: { c: Concept; size?: number }) {
  return (
    <div className="app-icon" style={{ background: `linear-gradient(160deg, ${c.colors[0]}, ${c.colors[1]})`, width: size, height: size, borderRadius: size * 0.225, fontSize: size * 0.52 }}>
      <span style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,.25))' }}>{c.emoji}</span>
    </div>
  )
}

function InfoSheet({ c, open, onClose }: { c: Concept; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Om appen">
      <div className="center" style={{ padding: '8px 16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><AppIcon c={c} size={88} /></div>
        <h2 style={{ margin: '0 0 4px', fontSize: 24 }}>{c.name}</h2>
        <div className="muted">{c.tagline}</div>
        <p style={{ fontStyle: 'italic', margin: '14px 0 0', fontSize: 15 }}>«{c.gonzo}»</p>
      </div>
      <Section header="Problemet"><div className="row" style={{ display: 'block' }}>{c.problem}</div></Section>
      <Section header="Signal fra research"><div className="row" style={{ display: 'block' }}>{c.signal}</div></Section>
      <Section header="Hvem og hvordan">
        <div className="row" style={{ display: 'block' }}><b>For:</b> {c.audience}</div>
        <div className="row" style={{ display: 'block' }}><b>Modell:</b> {c.model}</div>
      </Section>
      <Section header="Funksjoner">
        {c.features.map((f) => <div className="row" key={f}>• {f}</div>)}
      </Section>
      <Section header="Designprompt" footer="Lim inn i Figma Make, v0, Galileo, Midjourney eller en annen UI-generator.">
        <div className="row" style={{ display: 'block' }}><pre className="prompt">{c.prompt}</pre></div>
      </Section>
      <div className="btn-row"><Btn onClick={async () => { await copyText(c.prompt); toast('Designprompt kopiert') }}>Kopier designprompt</Btn></div>
      <Section header="Ikonprompt">
        <div className="row" style={{ display: 'block' }}><pre className="prompt">{c.iconPrompt}</pre></div>
      </Section>
      <div className="btn-row"><Btn kind="tinted" onClick={async () => { await copyText(c.iconPrompt); toast('Ikonprompt kopiert') }}>Kopier ikonprompt</Btn></div>
    </Sheet>
  )
}

function Home() {
  const [q, setQ] = useState('')
  const [info, setInfo] = useState<Concept | null>(null)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? concepts.filter((c) => (c.name + c.tagline + c.category + c.problem).toLowerCase().includes(s)) : concepts
  }, [q])
  return (
    <div className="screen fade-in" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <h1 className="large-title" style={{ paddingTop: 12 }}>25 Apper</h1>
      <p className="subtitle">Researchet fra App Store og GitHub, designet med prompts og kodet i React. Alt lagres på denne enheten.</p>
      <div className="searchbar"><span>🔍</span><input placeholder="Søk" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Søk i apper" /></div>
      {CATS.map((cat) => {
        const list = filtered.filter((c) => c.category === cat)
        if (!list.length) return null
        return (
          <div key={cat}>
            <h2 className="cat-h">{cat}</h2>
            <div className="home-grid">
              {list.map((c) => (
                <button key={c.id} className="app-tile" onClick={() => { location.hash = '/' + c.id }}
                  onContextMenu={(e) => { e.preventDefault(); setInfo(c) }} aria-label={c.name}>
                  <AppIcon c={c} />
                  <span className="app-name">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )
      })}
      {!filtered.length && <div className="empty"><div className="ei">🫥</div><h4>Ingen treff</h4></div>}
      <Section header="Alle konsepter" footer="Trykk på en rad for konsept, research og designprompt. Langt trykk på et ikon gjør det samme.">
        {filtered.map((c) => (
          <button key={c.id} className="row tap" onClick={() => setInfo(c)}>
            <AppIcon c={c} size={34} />
            <span className="row-main"><span className="row-label">{c.name}</span><span className="row-detail">{c.tagline}</span></span>
            <span className="row-chev">›</span>
          </button>
        ))}
      </Section>
      {info && <InfoSheet c={info} open onClose={() => setInfo(null)} />}
    </div>
  )
}

export default function App() {
  const route = useHashRoute()
  const c = concepts.find((x) => x.id === route)
  const Comp = c ? APPS[c.id] : undefined
  const [info, setInfo] = useState(false)
  const exit = useCallback(() => { location.hash = '/' }, [])
  const openInfo = useCallback(() => setInfo(true), [])
  const ctx = useMemo(() => ({ exit, info: openInfo }), [exit, openInfo])
  useEffect(() => { setInfo(false); document.title = c ? c.name : '25 Apper' }, [c])
  return (
    <>
      {c && Comp ? (
        <div style={{ '--tint': c.tint } as CSSProperties}>
          <AppCtx.Provider value={ctx}>
            <Comp key={c.id} />
          </AppCtx.Provider>
          <InfoSheet c={c} open={info} onClose={() => setInfo(false)} />
        </div>
      ) : <Home />}
      <ToastHost />
    </>
  )
}
