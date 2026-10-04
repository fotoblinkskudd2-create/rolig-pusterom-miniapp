import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { dumpPrefix, restorePrefix } from './store.js';
import { isoDate, readFileText, shareOrDownload } from './util.js';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function Shell({ title, tagline, tabs, tab, onTab, children, right }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef();
  const toast = useCallback((m) => {
    setMsg(m); clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2200);
  }, []);
  useEffect(() => { document.title = title; }, [title]);
  return (
    <ToastCtx.Provider value={toast}>
      <div className="app">
        <header className="topbar">
          <a className="back" href="../../" aria-label="Til verkstedet">‹ Alle</a>
          <h1>{title}</h1>
          {right}
        </header>
        {tagline && <p className="tagline">{tagline}</p>}
        {children}
      </div>
      {tabs && (
        <nav className="tabs">
          <div className="tabs-inner">
            {tabs.map((t) => (
              <button key={t.id} className={'tab' + (t.id === tab ? ' on' : '')} onClick={() => onTab(t.id)}>
                <b aria-hidden>{t.icon}</b>{t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
      {msg && <div className="toast" role="status">{msg}</div>}
    </ToastCtx.Provider>
  );
}

export function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="sheet-bg" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-label={title}>
        <div className="row between" style={{ marginBottom: 6 }}>
          <h2>{title}</h2>
          <button className="btn sm ghost" onClick={onClose}>Lukk</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// <label> kun rundt ett skjemafelt. Rundt knapper (chips) ville et trykk på etiketten aktivert første knapp.
export function Field({ label, children }) {
  const isControl = ['input', 'select', 'textarea'].includes(children?.type);
  if (isControl) return <label className="field"><span>{label}</span>{children}</label>;
  return <div className="field" role="group" aria-label={label}><span>{label}</span>{children}</div>;
}

export function Empty({ title, children }) {
  return <div className="empty"><div className="big">{title}</div>{children}</div>;
}

export function Chips({ options, value, onChange }) {
  return (
    <div className="chips">
      {options.map((o) => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        return <button type="button" key={v} className={'chip' + (v === value ? ' on' : '')} onClick={() => onChange(v)}>{l}</button>;
      })}
    </div>
  );
}

// Lokal-først betyr: brukeren må kunne ta dataen med seg. Dette kortet ligger i alle appene.
export function BackupCard({ prefix, appName, extraExport, extraImport }) {
  const toast = useToast();
  const fileRef = useRef();
  const doExport = async () => {
    const data = { app: appName, prefix, exported: new Date().toISOString(), store: dumpPrefix(prefix) };
    if (extraExport) data.extra = await extraExport();
    const r = await shareOrDownload(`${prefix.replace(/[:.]/g, '')}-${isoDate(new Date())}.json`, JSON.stringify(data, null, 2), 'application/json');
    if (r !== 'aborted') toast('Backup laget');
  };
  const doImport = async (e) => {
    const f = e.target.files?.[0]; e.target.value = '';
    if (!f) return;
    try {
      const data = JSON.parse(await readFileText(f));
      if (data.prefix !== prefix) throw new Error('feil app');
      if (!confirm('Erstatte det som ligger her med backupen?')) return;
      restorePrefix(prefix, data.store);
      if (extraImport && data.extra) await extraImport(data.extra);
      location.reload();
    } catch (err) {
      toast('Kunne ikke lese backup: ' + err.message);
    }
  };
  return (
    <div className="card">
      <h2>Dataen din</h2>
      <p className="muted small" style={{ marginBottom: 12 }}>
        Alt ligger kun på denne enheten. Ingen konto, ingen server. Sletter du nettleserdata, er det borte – ta backup.
      </p>
      <div className="grid2">
        <button className="btn" onClick={doExport}>Ta backup</button>
        <button className="btn ghost" onClick={() => fileRef.current.click()}>Gjenopprett</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
    </div>
  );
}

export function InstallHint() {
  const standalone = typeof window !== 'undefined' && (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone);
  if (standalone) return null;
  return (
    <div className="card">
      <h2>Legg på Hjem-skjerm</h2>
      <p className="muted small">I Safari: trykk Del-knappen → «Legg til på Hjem-skjerm». Da får appen eget ikon, fullskjerm og virker uten nett.</p>
    </div>
  );
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}
