import { useEffect, useRef, useState } from 'react';
import { BackupCard, Empty, Shell, useToast } from '../../shared/ui.jsx';
import { uid, useStore } from '../../shared/store.js';
import { copyText, fmtTime, isoDate } from '../../shared/util.js';

const P = 'dump:';

export default function App() {
  const [items, setItems] = useStore(P + 'items', []);
  const [text, setText] = useState('');
  const [tab, setTab] = useState('dump');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef();
  const toast = useToast();
  const todayKey = isoDate(new Date());

  // ?add=tekst – lar en iOS-snarvei («Hei Siri, dump») legge rett inn.
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const add = p.get('add');
    if (add) {
      setItems((xs) => [{ id: uid(), text: add.trim(), at: Date.now() }, ...xs]);
      history.replaceState(null, '', location.pathname);
      toast('Dumpet fra snarvei');
    }
  }, [setItems, toast]);

  const open = items.filter((i) => !i.doneAt);
  const doneToday = items.filter((i) => i.doneAt && isoDate(i.doneAt) === todayKey);
  const dumpedToday = items.filter((i) => isoDate(i.at) === todayKey).length;

  const add = (e) => {
    e.preventDefault();
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;
    setItems((xs) => [...lines.map((l) => ({ id: uid(), text: l, at: Date.now() })), ...xs]);
    setText('');
    inputRef.current?.focus();
  };
  const done = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, doneAt: Date.now() } : x)));
  const undo = (id) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, doneAt: null } : x)));
  const del = (id) => setItems((xs) => xs.filter((x) => x.id !== id));
  const later = (id) => setItems((xs) => { const it = xs.find((x) => x.id === id); return [...xs.filter((x) => x.id !== id), it]; });
  const clearOld = () => setItems((xs) => xs.filter((x) => !x.doneAt || isoDate(x.doneAt) === todayKey));

  const current = open[Math.min(focusIdx, open.length - 1)];

  return (
    <Shell title="Dump" tabs={[{ id: 'dump', icon: '↓', label: 'Dump' }, { id: 'en', icon: '①', label: 'Én ting' }, { id: 'mer', icon: '≡', label: 'Mer' }]} tab={tab} onTab={setTab}>
      {tab === 'dump' && <>
        <form onSubmit={add} className="card">
          <textarea ref={inputRef} className="input" autoFocus rows={2} value={text} placeholder="Hva surrer i hodet? Skriv. Enter. Ferdig."
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) add(e); }} style={{ minHeight: 60 }} />
          <div className="row between" style={{ marginTop: 10 }}>
            <span className="muted small">{dumpedToday} dumpet · {doneToday.length} ferdig i dag</span>
            <button className="btn primary" type="submit" disabled={!text.trim()}>Dump</button>
          </div>
        </form>
        <div className="card">
          {open.length === 0 ? <Empty title="Hodet er tomt">Nyt det. Det varer ikke.</Empty> : (
            <ul className="list">
              {open.map((i) => (
                <li key={i.id}>
                  <button className="btn sm ghost" aria-label="Ferdig" onClick={() => done(i.id)} style={{ width: 34, padding: 0 }}>✓</button>
                  <div className="grow">{i.text}<div className="muted small">{fmtTime(i.at)}{isoDate(i.at) !== todayKey && ` · ${new Date(i.at).toLocaleDateString('nb-NO')}`}</div></div>
                  <button className="btn sm ghost" aria-label="Slett" onClick={() => del(i.id)}>✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {doneToday.length > 0 && (
          <div className="card">
            <h2>Ferdig i dag</h2>
            <ul className="list">
              {doneToday.map((i) => (
                <li key={i.id}><span className="grow muted" style={{ textDecoration: 'line-through' }}>{i.text}</span><button className="btn sm ghost" onClick={() => undo(i.id)}>Angre</button></li>
              ))}
            </ul>
          </div>
        )}
      </>}

      {tab === 'en' && (
        <div style={{ minHeight: '60dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {!current ? <Empty title="Ingenting igjen">Gå ut. Drikk vann. Se på en sky.</Empty> : <>
            <p className="muted small" style={{ textAlign: 'center' }}>Bare denne. Resten finnes ikke akkurat nå.</p>
            <div className="huge" style={{ textAlign: 'center', margin: '28px 0', fontSize: 'clamp(2rem, 9vw, 3.4rem)', wordBreak: 'break-word' }}>{current.text}</div>
            <div className="stack">
              <button className="btn primary block" style={{ minHeight: 64, fontSize: '1.2rem' }} onClick={() => { done(current.id); toast('Én mindre.'); }}>Ferdig</button>
              <button className="btn block" onClick={() => { later(current.id); setFocusIdx(0); }}>Ikke nå – vis neste</button>
            </div>
            <p className="muted small" style={{ textAlign: 'center', marginTop: 16 }}>{open.length - 1} andre venter. De kan vente.</p>
          </>}
        </div>
      )}

      {tab === 'mer' && <>
        <div className="card">
          <h2>«Hei Siri, dump»</h2>
          <ol className="small" style={{ paddingLeft: 18 }}>
            <li>Åpne Snarveier → + → «Be om inndata» (Tekst).</li>
            <li>Legg til «URL»: <code>{location.origin + location.pathname}?add=</code> og sett inn «Oppgitt inndata» bak <code>=</code>.</li>
            <li>Legg til «Åpne URL-er». Kall snarveien «Dump».</li>
          </ol>
          <button className="btn sm" style={{ marginTop: 10 }} onClick={async () => { await copyText(location.origin + location.pathname + '?add='); toast('URL kopiert'); }}>Kopier URL</button>
        </div>
        <div className="card">
          <h2>Rydd</h2>
          <button className="btn block" onClick={clearOld}>Fjern ferdige fra tidligere dager</button>
          <button className="btn block ghost" style={{ marginTop: 8 }} onClick={async () => { await copyText(open.map((i) => '- ' + i.text).join('\n')); toast('Liste kopiert'); }}>Kopier åpne som liste</button>
        </div>
        <BackupCard prefix={P} appName="Dump" />
      </>}
    </Shell>
  );
}
