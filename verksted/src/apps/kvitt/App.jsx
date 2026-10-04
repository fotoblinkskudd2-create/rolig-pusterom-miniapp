import { useEffect, useRef, useState } from 'react';
import { BackupCard, Chips, Empty, Field, Sheet, Shell, useToast } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { blobToDataUrl, dataUrlToBlob, idbDel, idbGet, idbSet, shrinkImage } from '../../shared/idb.js';
import { addMonths, copyText, daysBetween, fmtDate, fromIso, isoDate, kr, makeIcs, num, shareOrDownload, today } from '../../shared/util.js';

const P = 'kvitt:';
const CATS = ['Elektronikk', 'Hvitevarer', 'Møbler', 'Klær', 'Verktøy', 'Sport', 'Annet'];

const expiry = (it) => addMonths(fromIso(it.date), 12 * num(it.years));
function left(it) {
  const d = daysBetween(today(), expiry(it));
  if (d < 0) return { d, text: 'Utløpt', cls: 'muted' };
  if (d < 60) return { d, text: `${d} dager igjen`, cls: 'danger' };
  const m = Math.floor(d / 30.44);
  return { d, text: m >= 12 ? `${Math.floor(m / 12)} år ${m % 12} mnd igjen` : `${m} mnd igjen`, cls: 'ok' };
}

function Photo({ id, onClick, style }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let u; let alive = true;
    idbGet(id).then((b) => { if (b && alive) { u = URL.createObjectURL(b); setUrl(u); } });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [id]);
  if (!url) return <div style={{ ...style, background: 'var(--surface-2)' }} />;
  return <img src={url} alt="Kvittering" onClick={onClick} style={{ objectFit: 'cover', borderRadius: 12, ...style }} />;
}

function letter(it, problem) {
  return `Reklamasjon – ${it.name}

Til ${it.store || '[butikk]'}

Jeg kjøpte ${it.name} hos dere ${fmtDate(fromIso(it.date))} for ${kr(it.price)}. Kvittering er vedlagt.

Varen har følgende mangel:
${problem || '[beskriv feilen og når du oppdaget den]'}

Jeg reklamerer herved på mangelen, jf. forbrukerkjøpsloven § 27. Reklamasjonsfristen er ${num(it.years)} år fra overtakelse, og den er ikke utløpt. Jeg ber om at varen repareres eller omleveres uten kostnad for meg, jf. forbrukerkjøpsloven. Dersom dette ikke er mulig, krever jeg prisavslag eller heving.

Jeg ber om skriftlig svar innen 14 dager.

Med vennlig hilsen
[navn]
[telefon / e-post]
${isoDate(new Date())}`;
}

function Editor({ initial, onSave, onDelete, onClose }) {
  const [f, setF] = useState(initial);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef();
  const set = (k) => (e) => setF({ ...f, [k]: e?.target ? e.target.value : e });
  const addPhoto = async (e) => {
    const files = [...(e.target.files || [])]; e.target.value = '';
    setBusy(true);
    try {
      const ids = [];
      for (const file of files) { const id = 'kvitt-' + uid(); await idbSet(id, await shrinkImage(file)); ids.push(id); }
      setF((x) => ({ ...x, photos: [...(x.photos || []), ...ids] }));
    } finally { setBusy(false); }
  };
  return (
    <Sheet title={initial.id ? 'Endre' : 'Ny kvittering'} onClose={onClose}>
      <button className="btn block primary" style={{ marginBottom: 12 }} onClick={() => fileRef.current.click()} disabled={busy}>
        {busy ? 'Lagrer bilde…' : '📷 Ta bilde av kvitteringen'}
      </button>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={addPhoto} />
      {f.photos?.length > 0 && (
        <div className="row wrap" style={{ marginBottom: 12 }}>
          {f.photos.map((p) => (
            <div key={p} style={{ position: 'relative' }}>
              <Photo id={p} style={{ width: 72, height: 72 }} />
              <button className="btn sm" style={{ position: 'absolute', top: -6, right: -6, minHeight: 24, padding: '0 7px', borderRadius: 99 }}
                onClick={() => setF({ ...f, photos: f.photos.filter((x) => x !== p) })}>✕</button>
            </div>
          ))}
        </div>
      )}
      <Field label="Hva"><input className="input" value={f.name} onChange={set('name')} placeholder="Vaskemaskin" /></Field>
      <div className="grid2">
        <Field label="Butikk"><input className="input" value={f.store} onChange={set('store')} placeholder="Elkjøp" /></Field>
        <Field label="Pris"><input className="input" inputMode="decimal" value={f.price} onChange={set('price')} /></Field>
      </div>
      <Field label="Kjøpsdato"><input className="input" type="date" value={f.date} onChange={set('date')} /></Field>
      <Field label="Reklamasjonsfrist">
        <Chips options={[{ value: '2', label: '2 år' }, { value: '5', label: '5 år – skal vare lenge' }]} value={String(f.years)} onChange={set('years')} />
      </Field>
      <p className="muted small" style={{ marginTop: -4, marginBottom: 12 }}>5 år gjelder ting som er ment å vare vesentlig lenger enn 2 år: hvitevarer, PC, mobil, møbler, sykkel m.m.</p>
      <Field label="Kategori"><Chips options={CATS} value={f.cat} onChange={set('cat')} /></Field>
      <Field label="Notat (serienummer, garanti fra produsent …)"><textarea className="input" value={f.notes} onChange={set('notes')} /></Field>
      <div className="stack">
        <button className="btn primary block" disabled={!f.name} onClick={() => onSave(f)}>Lagre</button>
        {onDelete && <button className="btn danger block" onClick={onDelete}>Slett</button>}
      </div>
    </Sheet>
  );
}

export default function App() {
  const [items, setItems] = useStore(P + 'items', []);
  const [edit, setEdit] = useState(null);
  const [view, setView] = useState(null);
  const [big, setBig] = useState(null);
  const [problem, setProblem] = useState('');
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('alle');
  const toast = useToast();

  const sorted = [...items].sort((a, b) => expiry(a) - expiry(b));
  const shown = sorted.filter((i) => (i.name + i.store + i.cat + i.notes).toLowerCase().includes(q.toLowerCase()));
  const activeVal = items.filter((i) => left(i).d >= 0).reduce((a, i) => a + num(i.price), 0);
  const soon = items.filter((i) => { const d = left(i).d; return d >= 0 && d < 60; });

  const save = (f) => { setItems((xs) => (f.id ? xs.map((x) => (x.id === f.id ? f : x)) : [{ ...f, id: uid() }, ...xs])); setEdit(null); };
  const remove = async (it) => {
    if (!confirm(`Slette ${it.name}?`)) return;
    for (const p of it.photos || []) await idbDel(p);
    setItems((xs) => xs.filter((x) => x.id !== it.id)); setEdit(null); setView(null);
  };
  const blank = { name: '', store: '', price: '', date: isoDate(new Date()), years: '2', cat: 'Elektronikk', notes: '', photos: [] };

  const exportImages = async () => {
    const out = {};
    for (const it of items) for (const p of it.photos || []) { const b = await idbGet(p); if (b) out[p] = await blobToDataUrl(b); }
    return out;
  };
  const importImages = async (imgs) => { for (const [k, v] of Object.entries(imgs)) await idbSet(k, await dataUrlToBlob(v)); };

  const v = view && items.find((x) => x.id === view);

  return (
    <Shell title="Kvitt" tabs={[{ id: 'alle', icon: '▤', label: 'Kvitteringer' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'alle' && <>
        <div className="card">
          <div className="muted small">Verdier du fortsatt kan reklamere på</div>
          <div className="big accent mono">{kr(activeVal)}</div>
          <div className="muted small">{items.length} kvitteringer · {soon.length} utløper innen 60 dager</div>
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <input className="input grow" placeholder="Søk" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn primary" onClick={() => setEdit(blank)}>+ Ny</button>
        </div>
        {shown.length === 0 ? <div className="card"><Empty title="Skoeske-fri">Ta bilde av neste kvittering før den bleker i lommeboka. Termopapir dør på et år.</Empty></div> : (
          <div className="card">
            <ul className="list">
              {shown.map((it) => {
                const l = left(it);
                return (
                  <li key={it.id} onClick={() => setView(it.id)} style={{ cursor: 'pointer' }}>
                    {it.photos?.[0] ? <Photo id={it.photos[0]} style={{ width: 48, height: 48, flex: 'none' }} /> : <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--surface-2)', flex: 'none' }} />}
                    <div className="grow">
                      <b className="ellipsis" style={{ display: 'block' }}>{it.name}</b>
                      <div className="muted small">{it.store} · {kr(it.price)}</div>
                    </div>
                    <span className={'small ' + l.cls} style={{ textAlign: 'right' }}>{l.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </>}

      {tab === 'mer' && <>
        <div className="card">
          <h2>Kalendervarsel</h2>
          <p className="muted small" style={{ marginBottom: 10 }}>Få varsel 30 dager før reklamasjonsfristen går ut for hver ting.</p>
          <button className="btn block" onClick={() => {
            const ev = items.filter((i) => left(i).d >= 0).map((i) => ({ title: `Reklamasjonsfrist: ${i.name}`, date: expiry(i), alarmDays: 30, description: `Kjøpt ${i.store} ${i.date}. Feil på den? Reklamer nå.` }));
            if (!ev.length) return toast('Ingen aktive frister');
            shareOrDownload('reklamasjonsfrister.ics', makeIcs(ev), 'text/calendar');
          }}>Last ned frister (.ics)</button>
        </div>
        <div className="card small">
          <h2>Rettighetene dine (kort)</h2>
          <ul style={{ paddingLeft: 18 }}>
            <li>Reklamasjonsfrist: 2 år, eller 5 år for ting ment å vare vesentlig lenger (forbrukerkjøpsloven § 27).</li>
            <li>Du må si fra «innen rimelig tid» etter at du oppdaget feilen – to måneder regnes alltid som tidsnok.</li>
            <li>Reklamasjon gjelder selgeren, ikke produsenten. Garanti er noe ekstra, ikke en erstatning.</li>
            <li>Uenig? Forbrukerrådet mekler gratis.</li>
          </ul>
        </div>
        <BackupCard prefix={P} appName="Kvitt" extraExport={exportImages} extraImport={importImages} />
      </>}

      {v && (
        <Sheet title={v.name} onClose={() => { setView(null); setProblem(''); }}>
          {v.photos?.length > 0 && (
            <div className="row" style={{ overflowX: 'auto', marginBottom: 12 }}>
              {v.photos.map((p) => <Photo key={p} id={p} onClick={() => setBig(p)} style={{ width: 120, height: 160, flex: 'none' }} />)}
            </div>
          )}
          <div className="card">
            <div className="row between"><span className="muted">Butikk</span><b>{v.store || '–'}</b></div>
            <div className="row between"><span className="muted">Pris</span><b>{kr(v.price)}</b></div>
            <div className="row between"><span className="muted">Kjøpt</span><b>{fmtDate(fromIso(v.date))}</b></div>
            <div className="row between"><span className="muted">Frist</span><b className={left(v).cls}>{fmtDate(expiry(v))} · {left(v).text}</b></div>
            {v.notes && <p className="small" style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{v.notes}</p>}
          </div>
          <div className="card">
            <h2>Noe er galt? Lag reklamasjon</h2>
            <textarea className="input" placeholder="Beskriv feilen. F.eks.: Maskinen slutter å sentrifugere, oppdaget 2. oktober." value={problem} onChange={(e) => setProblem(e.target.value)} />
            <div className="grid2" style={{ marginTop: 10 }}>
              <button className="btn primary" onClick={async () => { await copyText(letter(v, problem)); toast('Brev kopiert – lim inn i e-post'); }}>Kopier brev</button>
              <button className="btn" onClick={() => shareOrDownload(`reklamasjon-${v.name}.txt`, letter(v, problem))}>Del</button>
            </div>
          </div>
          <div className="grid2">
            <button className="btn" onClick={() => { setEdit(v); setView(null); }}>Endre</button>
            <button className="btn danger" onClick={() => remove(v)}>Slett</button>
          </div>
        </Sheet>
      )}
      {big && (
        <div className="sheet-bg" style={{ alignItems: 'center', background: 'rgba(0,0,0,.92)' }} onClick={() => setBig(null)}>
          <Photo id={big} style={{ maxWidth: '96vw', maxHeight: '90dvh', objectFit: 'contain' }} />
        </div>
      )}
      {edit && <Editor initial={edit} onSave={save} onClose={() => setEdit(null)} onDelete={edit.id ? () => remove(edit) : null} />}
    </Shell>
  );
}
