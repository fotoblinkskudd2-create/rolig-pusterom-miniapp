import { useEffect, useRef } from 'react'
import { exportApp, importApp, saveFile } from './store.js'

export function Shell({ title, glyph, tabs, tab, setTab, action, children, toast }) {
  return (
    <div className="shell">
      <header className="top">
        <span className="glyph" aria-hidden>{glyph}</span>
        <h1>{title}</h1>
        {action}
      </header>
      <main className="main">{children}</main>
      {tabs && (
        <nav className="tabbar">
          {tabs.map((t) => (
            <button key={t.id} aria-current={tab === t.id} onClick={() => { setTab(t.id); window.scrollTo(0, 0) }}>
              <span aria-hidden>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

export function Sheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; removeEventListener('keydown', onKey) }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="grab" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="iconbtn" onClick={onClose} aria-label="Lukk">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Field = ({ label, children }) => (
  <label className="field"><span>{label}</span>{children}</label>
)

export function Seg({ value, onChange, options }) {
  return (
    <div className="seg" role="group">
      {options.map(([v, label]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{label}</button>
      ))}
    </div>
  )
}

export const Empty = ({ icon, title, children }) => (
  <div className="empty"><span className="big" aria-hidden>{icon}</span><b>{title}</b><div className="small">{children}</div></div>
)

export const Stat = ({ value, label, hero }) => (
  <div className={'stat' + (hero ? ' hero' : '')}><b>{value}</b><small>{label}</small></div>
)

// Backup/gjenoppretting. Viktig på iPhone: en Hjem-skjerm-app har egen lagring adskilt fra Safari,
// og sletter du appen forsvinner dataene. JSON-fila er brukerens eneste "sky".
export function BackupCard({ app, toast, extraExport, extraImport }) {
  const fileRef = useRef()
  const doExport = async () => {
    const payload = exportApp(app)
    if (extraExport) payload.extra = await extraExport()
    await saveFile(`${app}-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json')
  }
  const doImport = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const payload = JSON.parse(await f.text())
      importApp(app, payload)
      if (extraImport && payload.extra) await extraImport(payload.extra)
      toast?.('Gjenopprettet – laster på nytt')
      setTimeout(() => location.reload(), 700)
    } catch (err) {
      toast?.(err.message || 'Kunne ikke lese fila')
    }
    e.target.value = ''
  }
  return (
    <div className="card">
      <h2>Dine data</h2>
      <p className="muted small" style={{ marginTop: 0 }}>
        Alt ligger kun på denne telefonen. Ingen konto, ingen server, ingen sporing. Ta backup innimellom –
        sletter du appen fra Hjem-skjermen, forsvinner dataene.
      </p>
      <div className="row">
        <button className="btn ghost grow" onClick={doExport}>⬆︎ Ta backup</button>
        <button className="btn ghost grow" onClick={() => fileRef.current.click()}>⬇︎ Gjenopprett</button>
      </div>
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={doImport} />
    </div>
  )
}

export function InstallHint() {
  const standalone = typeof window !== 'undefined' && (window.navigator.standalone || matchMedia('(display-mode: standalone)').matches)
  if (standalone) return null
  return (
    <div className="card notice small">
      <b>Legg på Hjem-skjerm:</b> trykk Del-knappen (firkant med pil opp) i Safari → «Legg til på Hjem-skjerm».
      Da åpner appen i fullskjerm og virker uten nett.
    </div>
  )
}
