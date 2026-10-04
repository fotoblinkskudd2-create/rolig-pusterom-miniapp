import { useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, useToast, copyText } from '../../shared/store.js'
import { Shell, Sheet, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { INGREDIENTS, RECIPES } from './recipes.js'

const APP = 'kjokken'

function App() {
  const [pantry, setPantry] = useLocal(APP, 'pantry', [])
  const [custom, setCustom] = useLocal(APP, 'custom', [])
  const [shop, setShop] = useLocal(APP, 'shop', [])
  const [cooked, setCooked] = useLocal(APP, 'cooked', 0)
  const [tab, setTab] = useState('cook')
  const [open, setOpen] = useState(null)
  const [draft, setDraft] = useState('')
  const [toast, showToast] = useToast()

  const have = useMemo(() => new Set(pantry), [pantry])
  const ranked = useMemo(() => RECIPES.map((r) => ({ ...r, missing: r.ing.filter((i) => !have.has(i)), bonus: (r.extra || []).filter((i) => have.has(i)) }))
    .sort((a, b) => a.missing.length - b.missing.length || b.bonus.length - a.bonus.length || a.time - b.time), [have])
  const ready = ranked.filter((r) => r.missing.length === 0)
  const almost = ranked.filter((r) => r.missing.length > 0 && r.missing.length <= 2)

  const toggle = (i) => setPantry((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))
  const addShop = (items) => { setShop((s) => [...new Set([...s, ...items])]); showToast(`${items.length} lagt i handlelista`) }
  const boughtAll = () => { setPantry((p) => [...new Set([...p, ...shop])]); setShop([]); showToast('Handlet! Skapet er oppdatert') }

  return (
    <Shell
      title="Kjøleskapet" glyph="🥚" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'cook', icon: '🍳', label: 'Kan lage' }, { id: 'pantry', icon: '🧺', label: 'Har' }, { id: 'shop', icon: '🛒', label: `Handle${shop.length ? ` (${shop.length})` : ''}` }, { id: 'data', icon: '💾', label: 'Data' }]}
    >
      {tab === 'cook' && (
        <>
          <div className="stats"><Stat hero value={ready.length} label="retter du kan lage NÅ" /><Stat value={almost.length} label="mangler bare 1–2 ting" /></div>
          {pantry.length === 0 ? (
            <Empty icon="🧺" title="Hva har du?">Gå til «Har» og huk av det som står i skapet. Tar 30 sekunder.</Empty>
          ) : (
            <>
              {ready.length > 0 && <div className="card"><h2>✅ Kan lages nå</h2><ul className="list">{ready.map((r) => <RecipeRow key={r.name} r={r} onClick={() => setOpen(r)} />)}</ul></div>}
              {almost.length > 0 && <div className="card"><h2>🟡 Nesten</h2><ul className="list">{almost.map((r) => <RecipeRow key={r.name} r={r} onClick={() => setOpen(r)} />)}</ul></div>}
              {ready.length === 0 && almost.length === 0 && <Empty icon="🤷" title="Tynt i skapet">Legg til litt mer under «Har», eller se handlelista.</Empty>}
            </>
          )}
          <p className="muted small">Salt, pepper, olje og vann regnes som noe du har.</p>
        </>
      )}

      {tab === 'pantry' && (
        <>
          {Object.entries({ ...INGREDIENTS, ...(custom.length ? { 'Egne': custom } : {}) }).map(([cat, list]) => (
            <div className="card" key={cat}>
              <h2>{cat}</h2>
              <div className="row wrap">{list.map((i) => <button key={i} className={'chip' + (have.has(i) ? '' : ' off')} onClick={() => toggle(i)}>{have.has(i) ? '✓ ' : ''}{i}</button>)}</div>
            </div>
          ))}
          <form className="card row" onSubmit={(e) => { e.preventDefault(); const v = draft.trim().toLowerCase(); if (v && !custom.includes(v)) { setCustom([...custom, v]); toggle(v) } setDraft('') }}>
            <input className="input grow" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Legg til egen vare" /><button className="btn ghost">+</button>
          </form>
          <button className="btn ghost block" onClick={() => setPantry([])}>Tøm alt (skapet er tomt)</button>
        </>
      )}

      {tab === 'shop' && (
        <>
          {shop.length === 0 ? <Empty icon="🛒" title="Handlelista er tom">Åpne en «nesten»-oppskrift og legg det som mangler her.</Empty> : (
            <>
              <div className="card"><ul className="list">{shop.map((i) => (
                <li key={i} className="row"><span className="grow">{i}</span>
                  <button className="btn sm ghost" onClick={() => { setShop(shop.filter((x) => x !== i)); setPantry((p) => [...new Set([...p, i])]) }}>Kjøpt</button></li>
              ))}</ul></div>
              <div className="row">
                <button className="btn ghost grow" onClick={async () => { await copyText(shop.map((i) => '• ' + i).join('\n')); showToast('Kopiert') }}>📋 Kopier</button>
                <button className="btn grow" onClick={boughtAll}>✅ Kjøpt alt</button>
              </div>
            </>
          )}
        </>
      )}

      {tab === 'data' && <><div className="stats"><Stat hero value={cooked} label="måltider laget hjemme" /><Stat value={`${cooked * 120} kr`} label="spart vs. take-away (ca. 120 kr/stk)" /></div><BackupCard app={APP} toast={showToast} /></>}

      <Sheet open={!!open} title={open?.name || ''} onClose={() => setOpen(null)}>
        {open && (
          <>
            <p className="muted" style={{ marginTop: 0 }}>⏱ {open.time} min</p>
            <div className="card">
              <h2>Trenger</h2>
              <div className="row wrap">{open.ing.map((i) => <span key={i} className={'chip ' + (have.has(i) ? 'ok' : 'danger')}>{have.has(i) ? '✓' : '✗'} {i}</span>)}</div>
              {open.extra && <><h2 style={{ marginTop: 12 }}>Kan legge til</h2><div className="row wrap">{open.extra.map((i) => <span key={i} className={'chip' + (have.has(i) ? '' : ' off')}>{i}</span>)}</div></>}
            </div>
            <div className="card"><h2>Slik</h2><p style={{ margin: 0 }}>{open.steps}</p></div>
            <div className="stack">
              {open.missing.length > 0 && <button className="btn ghost block" onClick={() => addShop(open.missing)}>🛒 Legg {open.missing.length} manglende i handlelista</button>}
              <button className="btn block" onClick={() => { setCooked((c) => c + 1); setOpen(null); showToast('👨‍🍳 Laget hjemme. Rått.') }}>Jeg lagde den!</button>
            </div>
          </>
        )}
      </Sheet>
    </Shell>
  )
}

const RecipeRow = ({ r, onClick }) => (
  <li className="row" onClick={onClick} style={{ cursor: 'pointer' }}>
    <span className="grow"><b>{r.name}</b><br /><span className="muted small">{r.time} min{r.missing.length ? ` · mangler ${r.missing.join(', ')}` : r.bonus.length ? ` · + ${r.bonus.join(', ')}` : ''}</span></span>
    <span className="muted">›</span>
  </li>
)

boot(App)
