import { useEffect, useMemo, useState } from 'react'
import { boot } from '../../shared/boot.jsx'
import { useLocal, uid, useToast, copyText } from '../../shared/store.js'
import { Shell, Sheet, Field, Seg, Empty, Stat, BackupCard } from '../../shared/ui.jsx'
import { kr, num, fmtDate, daysUntil, relDays, todayISO, addMonths, toISODate } from '../../shared/format.js'
import { downloadICS } from '../../shared/ics.js'
import { idbGet, idbSet, idbDel, idbKeys, shrinkImage, blobToDataURL, dataURLToBlob } from '../../shared/idb.js'

const APP = 'garanti'
const DB = 'garanti-bilder'
// Forbrukerkjøpsloven § 27: reklamasjonsfrist 2 år, 5 år for ting som skal vare vesentlig lenger (mobil, PC, hvitevarer, TV …).
const CATS = [['Mobil / PC / nettbrett', 5], ['Hvitevarer', 5], ['TV / lyd', 5], ['Møbler', 5], ['Sykkel', 5], ['Klær / sko', 2], ['Leker / LEGO', 2], ['Småelektronikk', 2], ['Annet', 2]]

const reklEnd = (r) => toISODate(addMonths(r.date, 12 * num(r.rekl)))
const warrantyEnd = (r) => (num(r.warranty) > 0 ? toISODate(addMonths(r.date, 12 * num(r.warranty))) : null)

function useImage(id) {
  const [url, setUrl] = useState(null)
  useEffect(() => {
    let u
    idbGet(DB, id).then((b) => { if (b) { u = URL.createObjectURL(b); setUrl(u) } })
    return () => u && URL.revokeObjectURL(u)
  }, [id])
  return url
}

function App() {
  const [items, setItems] = useLocal(APP, 'items', [])
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null)
  const [view, setView] = useState(null)
  const [tab, setTab] = useState('box')
  const [toast, showToast] = useToast()

  const list = useMemo(() => items
    .filter((i) => !q || `${i.name} ${i.store} ${i.cat}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date)), [items, q])
  const active = items.filter((i) => daysUntil(reklEnd(i)) >= 0)
  const soon = active.filter((i) => daysUntil(reklEnd(i)) <= 60)

  const save = async (item, file) => {
    if (file) { await idbSet(DB, item.id, await shrinkImage(file)); item = { ...item, hasImg: true } }
    setItems((xs) => (xs.some((x) => x.id === item.id) ? xs.map((x) => (x.id === item.id ? item : x)) : [item, ...xs]))
    setEdit(null); showToast('Lagret i boksen')
  }
  const remove = async (item) => { await idbDel(DB, item.id); setItems((xs) => xs.filter((x) => x.id !== item.id)); setView(null) }

  const exportImgs = async () => {
    const out = {}
    for (const k of await idbKeys(DB)) out[k] = await blobToDataURL(await idbGet(DB, k))
    return { images: out }
  }
  const importImgs = async (extra) => { for (const [k, v] of Object.entries(extra.images || {})) await idbSet(DB, k, await dataURLToBlob(v)) }

  return (
    <Shell
      title="Garantiboksen" glyph="🧾" tab={tab} setTab={setTab} toast={toast}
      tabs={[{ id: 'box', icon: '🧾', label: 'Boksen' }, { id: 'law', icon: '⚖️', label: 'Rettigheter' }, { id: 'data', icon: '💾', label: 'Data' }]}
      action={<button className="btn sm" onClick={() => setEdit({ id: uid(), name: '', store: '', price: '', date: todayISO(), cat: CATS[0][0], rekl: 5, warranty: '', note: '' })}>+ Ny</button>}
    >
      {tab === 'box' && (
        <>
          <div className="stats">
            <Stat hero value={active.length} label={`ting med reklamasjonsrett · ${kr(active.reduce((t, i) => t + num(i.price), 0))}`} />
            <Stat value={soon.length} label="utløper innen 60 dager" />
          </div>
          {items.length > 0 && <input className="input" style={{ marginBottom: 12 }} placeholder="🔍 Søk: vaskemaskin, Elkjøp …" value={q} onChange={(e) => setQ(e.target.value)} />}
          {items.length === 0 ? <Empty icon="🧾" title="Boksen er tom">Ta bilde av kvitteringen med en gang du kommer hjem. Om 3 år, når vaskemaskinen dør, takker du deg selv.</Empty> : (
            <div className="card"><ul className="list">{list.map((i) => <Row key={i.id} i={i} onClick={() => setView(i)} />)}</ul></div>
          )}
          {active.length > 0 && (
            <button className="btn ghost block" onClick={() => downloadICS('garantiboksen', active.map((i) => ({
              uid: `${i.id}-rekl`, title: `🧾 Reklamasjonsfrist går ut: ${i.name}`, date: reklEnd(i),
              description: `Kjøpt ${fmtDate(i.date)} hos ${i.store}. Sjekk at den virker – feil må meldes før i dag.`, alarmsDaysBefore: [30, 7],
            })), 'Garantiboksen')}>📅 Varsle meg før fristene går ut</button>
          )}
        </>
      )}
      {tab === 'law' && <Law />}
      {tab === 'data' && (
        <>
          <BackupCard app={APP} toast={showToast} extraExport={exportImgs} extraImport={importImgs} />
          <p className="muted small">Backup-fila inneholder også bildene av kvitteringene.</p>
        </>
      )}

      <Sheet open={!!edit} title="Kvittering" onClose={() => setEdit(null)}>
        {edit && <Form i={edit} onSave={save} />}
      </Sheet>
      <Sheet open={!!view} title={view?.name || ''} onClose={() => setView(null)}>
        {view && <Detail i={view} onEdit={() => { setEdit(view); setView(null) }} onDelete={() => remove(view)} showToast={showToast} />}
      </Sheet>
    </Shell>
  )
}

function Row({ i, onClick }) {
  const d = daysUntil(reklEnd(i))
  return (
    <li className="row" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Thumb id={i.id} has={i.hasImg} />
      <span className="grow" style={{ minWidth: 0 }}>
        <b className="ellipsis" style={{ display: 'block' }}>{i.name}</b>
        <span className="muted small">{i.store} · {fmtDate(i.date)}</span>
      </span>
      <span className={'chip ' + (d < 0 ? 'off' : d <= 60 ? 'danger' : 'ok')}>{d < 0 ? 'utløpt' : d > 365 ? `${Math.floor(d / 365)} år+` : relDays(d)}</span>
    </li>
  )
}

function Thumb({ id, has, big }) {
  const url = useImage(has ? id : '__none')
  const s = big ? { width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 12, background: 'var(--surface-2)' } : { width: 48, height: 48, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }
  return url ? <img src={url} alt="Kvittering" style={s} /> : big ? null : <div style={{ ...s, background: 'var(--surface-2)', display: 'grid', placeItems: 'center' }}>🧾</div>
}

function Detail({ i, onEdit, onDelete, showToast }) {
  const w = warrantyEnd(i)
  const letter = `Reklamasjon – ${i.name}

Til: ${i.store || '[butikk]'}
Fra: [ditt navn, adresse, telefon]
Dato: ${fmtDate(new Date())}

Jeg kjøpte ${i.name} hos dere ${fmtDate(i.date)}${num(i.price) ? ` for ${kr(i.price)}` : ''}. Kvittering er vedlagt.

Varen har følgende mangel: [beskriv feilen og når du oppdaget den].

Jeg reklamerer herved på mangelen i medhold av forbrukerkjøpsloven § 27, og krever at mangelen rettes eller at varen omleveres, jf. § 29. Retting/omlevering skal skje uten kostnad for meg og innen rimelig tid.

Jeg ber om skriftlig svar innen 14 dager.

Med vennlig hilsen
[navn]`
  return (
    <>
      <Thumb id={i.id} has={i.hasImg} big />
      <div className="card" style={{ marginTop: 12 }}>
        <ul className="list">
          <li className="row"><span className="grow muted">Butikk</span><b>{i.store || '–'}</b></li>
          <li className="row"><span className="grow muted">Kjøpt</span><b>{fmtDate(i.date)}</b></li>
          <li className="row"><span className="grow muted">Pris</span><b>{kr(i.price)}</b></li>
          <li className="row"><span className="grow muted">Reklamasjonsrett ({i.rekl} år)</span><b>{fmtDate(reklEnd(i))}</b></li>
          {w && <li className="row"><span className="grow muted">Produsentgaranti</span><b>{fmtDate(w)}</b></li>}
        </ul>
        {i.note && <p className="small">{i.note}</p>}
      </div>
      <div className="card"><h2>Ferdig reklamasjonsbrev</h2><pre className="letter">{letter}</pre>
        <button className="btn block" style={{ marginTop: 10 }} onClick={async () => { await copyText(letter); showToast('Brevet er kopiert') }}>📋 Kopier brev</button>
      </div>
      <div className="row"><button className="btn ghost grow" onClick={onEdit}>Endre</button><button className="btn ghost grow" onClick={onDelete}>Slett</button></div>
    </>
  )
}

function Form({ i: init, onSave }) {
  const [i, set] = useState(init)
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const up = (k) => (e) => set({ ...i, [k]: e.target.value })
  return (
    <form onSubmit={async (e) => { e.preventDefault(); if (!i.name.trim() || busy) return; setBusy(true); await onSave(i, file) }}>
      <label className="btn ghost block" style={{ marginBottom: 12 }}>
        📷 {file ? 'Bilde valgt ✓' : i.hasImg ? 'Bytt bilde' : 'Ta bilde av kvitteringen'}
        <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <Field label="Hva kjøpte du?"><input className="input" value={i.name} onChange={up('name')} placeholder="Vaskemaskin Bosch Serie 6" /></Field>
      <div className="row">
        <Field label="Butikk"><input className="input" value={i.store} onChange={up('store')} /></Field>
        <Field label="Pris"><input className="input" inputMode="decimal" value={i.price} onChange={up('price')} /></Field>
      </div>
      <Field label="Kjøpsdato"><input className="input" type="date" value={i.date} onChange={up('date')} /></Field>
      <Field label="Kategori"><select className="input" value={i.cat} onChange={(e) => { const c = CATS.find((x) => x[0] === e.target.value); set({ ...i, cat: c[0], rekl: c[1] }) }}>
        {CATS.map(([c]) => <option key={c}>{c}</option>)}</select></Field>
      <Field label="Reklamasjonsfrist"><Seg value={num(i.rekl)} onChange={(v) => set({ ...i, rekl: v })} options={[[2, '2 år'], [5, '5 år (skal vare lenge)']]} /></Field>
      <Field label="Ekstra produsentgaranti (år, valgfritt)"><input className="input" inputMode="numeric" value={i.warranty} onChange={up('warranty')} /></Field>
      <Field label="Notat"><input className="input" value={i.note} onChange={up('note')} placeholder="Serienummer, ordrenr …" /></Field>
      <button className="btn block" disabled={busy}>{busy ? 'Lagrer …' : 'Lagre'}</button>
    </form>
  )
}

const Law = () => (
  <>
    <div className="card">
      <h2>Reklamasjon ≠ garanti</h2>
      <p className="small">Reklamasjonsretten er lovfestet og gjelder uansett hva butikken sier. Garanti er et frivillig ekstra løfte fra produsenten.</p>
      <ul className="small" style={{ paddingLeft: 18 }}>
        <li><b>2 år</b> er normal frist.</li>
        <li><b>5 år</b> for ting som er ment å vare vesentlig lenger – typisk mobil, PC, TV, hvitevarer, møbler (forbrukerkjøpsloven § 27).</li>
        <li>Feil som viser seg en stund etter kjøpet regnes som hovedregel for å ha vært der fra start – det er butikken som må sannsynliggjøre noe annet (§ 18).</li>
        <li>Du må si fra <b>innen rimelig tid</b> etter at du oppdaget feilen – innen 2 måneder er alltid i tide.</li>
        <li>Du kan klage til <b>butikken</b>, ikke bare produsenten.</li>
      </ul>
    </div>
    <div className="card small muted">
      Står det fast? <a href="https://www.forbrukerradet.no" target="_blank" rel="noreferrer">Forbrukerrådet</a> hjelper gratis med mekling. Dette er generell info, ikke juridisk rådgivning.
    </div>
  </>
)

boot(App)
