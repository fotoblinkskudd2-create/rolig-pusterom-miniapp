import {
  createContext, useContext, useEffect, useRef, useState, useSyncExternalStore,
  type CSSProperties, type ReactNode,
} from 'react'

/* ================= Lagring (lokal-first) =================
 * Alt lagres i localStorage under "apper:<nøkkel>". Samme nøkkel holdes i synk
 * mellom komponenter. Feiler lagring (privat modus), lever appen videre i minnet. */
const PREFIX = 'apper:'
const cache = new Map<string, unknown>()
const subs = new Map<string, Set<() => void>>()

function readKey<T>(key: string, init: T): T {
  if (!cache.has(key)) {
    let v: unknown = init
    try {
      const raw = localStorage.getItem(PREFIX + key)
      if (raw != null) v = JSON.parse(raw)
    } catch { /* tom eller blokkert lagring */ }
    cache.set(key, v)
  }
  return cache.get(key) as T
}

function writeKey<T>(key: string, v: T) {
  cache.set(key, v)
  try { localStorage.setItem(PREFIX + key, JSON.stringify(v)) } catch { /* minne holder */ }
  subs.get(key)?.forEach((f) => f())
}

export function useStore<T>(key: string, init: T): [T, (v: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      if (!subs.has(key)) subs.set(key, new Set())
      subs.get(key)!.add(cb)
      return () => { subs.get(key)!.delete(cb) }
    },
    () => readKey(key, init),
  )
  const set = (v: T | ((prev: T) => T)) => {
    const prev = readKey(key, init)
    writeKey(key, typeof v === 'function' ? (v as (p: T) => T)(prev) : v)
  }
  return [value, set]
}

export function clearApp(prefix: string) {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX + prefix)).forEach((k) => localStorage.removeItem(k))
  } catch { /* ignorer */ }
  ;[...cache.keys()].filter((k) => k.startsWith(prefix)).forEach((k) => { cache.delete(k); subs.get(k)?.forEach((f) => f()) })
}

/* ================= Hjelpere ================= */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
const nf0 = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 })
const nf2 = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 2 })
export const kr = (n: number) => `${nf0.format(Math.round(n || 0))} kr`
export const num = (n: number, d: 0 | 1 | 2 = 0) => (d === 0 ? nf0 : d === 1 ? nf1 : nf2).format(Number.isFinite(n) ? n : 0)
export const pad2 = (n: number) => String(n).padStart(2, '0')
export const dayKey = (d: Date | number = new Date()) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${pad2(x.getMonth() + 1)}-${pad2(x.getDate())}`
}
export const fromDayKey = (k: string) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const fmtDate = (d: Date | number | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
  new Date(d).toLocaleDateString('nb-NO', opts)
export const fmtTime = (d: Date | number) => new Date(d).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
export const fmtDur = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60
  return h ? `${h}:${pad2(m)}:${pad2(r)}` : `${m}:${pad2(r)}`
}
export const daysBetween = (a: Date | number, b: Date | number) => {
  const A = new Date(a); A.setHours(0, 0, 0, 0)
  const B = new Date(b); B.setHours(0, 0, 0, 0)
  return Math.round((B.getTime() - A.getTime()) / 86400000)
}
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
export const toNum = (s: string) => { const n = parseFloat(String(s).replace(',', '.').replace(/\s/g, '')); return Number.isFinite(n) ? n : 0 }
export function haptic(pattern: number | number[] = 10) { try { navigator.vibrate?.(pattern) } catch { /* iOS mangler vibrate */ } }

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t) }, [ms])
  return now
}

export async function copyText(t: string) {
  try { await navigator.clipboard.writeText(t); return true } catch {
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select()
    const ok = document.execCommand('copy'); ta.remove(); return ok
  }
}
export function downloadText(name: string, text: string, type = 'text/plain') {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }))
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

/* ================= Toast ================= */
let toastSet: ((t: string | null) => void) | null = null
export function toast(t: string) { toastSet?.(t); haptic(8) }
export function ToastHost() {
  const [t, setT] = useState<string | null>(null)
  useEffect(() => { toastSet = setT; return () => { toastSet = null } }, [])
  useEffect(() => { if (!t) return; const x = setTimeout(() => setT(null), 1800); return () => clearTimeout(x) }, [t])
  return t ? <div className="toast" role="status">{t}</div> : null
}

/* ================= App-kontekst (levert av hjemskjermen) ================= */
export const AppCtx = createContext<{ exit: () => void; info: () => void } | null>(null)

export function Screen({ title, subtitle, right, children, large = true }: {
  title: string; subtitle?: ReactNode; right?: ReactNode; children: ReactNode; large?: boolean
}) {
  const ctx = useContext(AppCtx)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > (large ? 36 : 2))
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [large])
  return (
    <div className="screen fade-in">
      <div className={'navbar' + (scrolled || !large ? ' scrolled' : '')}>
        <div className="nav-left">
          {ctx && <button className="navbtn" onClick={ctx.exit} aria-label="Tilbake til hjem"><span className="chev">‹</span>Hjem</button>}
        </div>
        <div className="nav-title">{title}</div>
        <div className="nav-right">
          {right}
          {ctx && <button className="navbtn" onClick={ctx.info} aria-label="Om appen">ⓘ</button>}
        </div>
      </div>
      {large && <h1 className="large-title">{title}</h1>}
      {subtitle && <p className="subtitle">{subtitle}</p>}
      {children}
    </div>
  )
}

export function TabBar<T extends string>({ tabs, value, onChange }: {
  tabs: { id: T; label: string; icon: string }[]; value: T; onChange: (t: T) => void
}) {
  return (
    <nav className="tabbar"><div className="tabbar-inner">
      {tabs.map((t) => (
        <button key={t.id} className={'tab' + (t.id === value ? ' on' : '')} onClick={() => { onChange(t.id); window.scrollTo(0, 0); haptic(5) }}>
          <span className="ti">{t.icon}</span>{t.label}
        </button>
      ))}
    </div></nav>
  )
}

/* ================= Lister ================= */
export function Section({ header, footer, children, style }: { header?: ReactNode; footer?: ReactNode; children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="section" style={style}>
      {header && <div className="section-h">{header}</div>}
      <div className="group">{children}</div>
      {footer && <div className="section-f">{footer}</div>}
    </div>
  )
}

export function Row({ label, detail, value, icon, iconBg, onClick, chevron, children, className = '', style }: {
  label?: ReactNode; detail?: ReactNode; value?: ReactNode; icon?: ReactNode; iconBg?: string
  onClick?: () => void; chevron?: boolean; children?: ReactNode; className?: string; style?: CSSProperties
}) {
  const inner = (
    <>
      {icon != null && <span className="row-icon" style={{ background: iconBg ?? 'var(--tint)' }}>{icon}</span>}
      {(label != null || detail != null) && (
        <span className="row-main">
          {label != null && <span className="row-label">{label}</span>}
          {detail != null && <span className="row-detail">{detail}</span>}
        </span>
      )}
      {children}
      {value != null && <span className="row-value">{value}</span>}
      {chevron && <span className="row-chev">›</span>}
    </>
  )
  const cls = 'row' + (icon != null ? ' has-icon' : '') + (className ? ' ' + className : '')
  return onClick
    ? <button className={cls} onClick={onClick} style={style}>{inner}</button>
    : <div className={cls} style={style}>{inner}</div>
}

export function InputRow({ label, value, onChange, type = 'text', placeholder, suffix, inputMode, left }: {
  label?: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string
  suffix?: string; inputMode?: 'decimal' | 'numeric' | 'text'; left?: boolean
}) {
  return (
    <label className="row">
      {label && <span style={{ flex: 'none' }}>{label}</span>}
      <input className={'inline' + (left || !label ? ' left' : '')} type={type} value={value} placeholder={placeholder}
        inputMode={inputMode ?? (type === 'number' ? 'decimal' : undefined)}
        onChange={(e) => onChange(e.target.value)} onFocus={(e) => type === 'number' && e.target.select()} />
      {suffix && <span className="muted">{suffix}</span>}
    </label>
  )
}

export function NumRow({ label, value, onChange, suffix, step, min, max }: {
  label: string; value: number; onChange: (n: number) => void; suffix?: string; step?: number; min?: number; max?: number
}) {
  const [s, setS] = useState(String(value))
  const last = useRef(value)
  useEffect(() => { if (value !== last.current) { setS(String(value)); last.current = value } }, [value])
  return (
    <label className="row">
      <span style={{ flex: 'none' }}>{label}</span>
      <input className="inline" type="text" inputMode="decimal" value={s} step={step} min={min} max={max}
        onFocus={(e) => e.target.select()}
        onChange={(e) => { setS(e.target.value); const n = toNum(e.target.value); last.current = n; onChange(n) }} />
      {suffix && <span className="muted">{suffix}</span>}
    </label>
  )
}

export function TextRow({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <div className="row"><textarea className="inline" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></div>
}

export function SelectRow<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void
}) {
  return (
    <label className="row">
      <span style={{ flex: 'none' }}>{label}</span>
      <select className="inline" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="row-chev">⌄</span>
    </label>
  )
}

export function ToggleRow({ label, detail, checked, onChange }: { label: string; detail?: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="row">
      <span className="row-main"><span className="row-label">{label}</span>{detail && <span className="row-detail">{detail}</span>}</span>
      <input type="checkbox" className="toggle" checked={checked} onChange={(e) => { onChange(e.target.checked); haptic(6) }} />
    </label>
  )
}

export function Stepper({ value, onChange, step = 1, min = -Infinity, max = Infinity }: {
  value: number; onChange: (n: number) => void; step?: number; min?: number; max?: number
}) {
  const r = (n: number) => Math.round(n * 1000) / 1000
  return (
    <span className="stepper">
      <button aria-label="Mindre" onClick={() => { onChange(r(clamp(value - step, min, max))); haptic(5) }}>−</button>
      <span />
      <button aria-label="Mer" onClick={() => { onChange(r(clamp(value + step, min, max))); haptic(5) }}>+</button>
    </span>
  )
}

export function StepperRow({ label, value, onChange, step, min, max, fmt }: {
  label: string; value: number; onChange: (n: number) => void; step?: number; min?: number; max?: number; fmt?: (n: number) => string
}) {
  return (
    <div className="row">
      <span className="row-main"><span className="row-label">{label}</span></span>
      <span className="row-value" style={{ color: 'var(--label)', minWidth: 40 }}>{fmt ? fmt(value) : value}</span>
      <Stepper value={value} onChange={onChange} step={step} min={min} max={max} />
    </div>
  )
}

/** To-trinns sletting: første trykk spør, andre trykk sletter. Ingen alert(). */
export function ConfirmRow({ label, confirmLabel = 'Trykk igjen for å bekrefte', onConfirm }: { label: string; confirmLabel?: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false)
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t) }, [armed])
  return (
    <button className="row destructive" onClick={() => { if (armed) { onConfirm(); setArmed(false); haptic([10, 40, 10]) } else { setArmed(true); haptic(10) } }}>
      {armed ? confirmLabel : label}
    </button>
  )
}

/* ================= Kontroller ================= */
export function Seg<T extends string | number>({ options, value, onChange, style }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; style?: CSSProperties
}) {
  return (
    <div className="seg" role="tablist" style={style}>
      {options.map((o) => (
        <button key={String(o.value)} role="tab" aria-selected={o.value === value} className={o.value === value ? 'on' : ''}
          onClick={() => { onChange(o.value); haptic(5) }}>{o.label}</button>
      ))}
    </div>
  )
}

export function Chips<T extends string>({ options, value, onToggle }: { options: T[]; value: T[]; onToggle: (v: T) => void }) {
  return (
    <div className="chips">
      {options.map((o) => (
        <button key={o} className={'chip' + (value.includes(o) ? ' on' : '')} onClick={() => { onToggle(o); haptic(5) }}>{o}</button>
      ))}
    </div>
  )
}

export function Btn({ children, onClick, kind = 'filled', disabled, small, style }: {
  children: ReactNode; onClick?: () => void; kind?: 'filled' | 'tinted' | 'gray' | 'plain' | 'danger'; disabled?: boolean; small?: boolean; style?: CSSProperties
}) {
  return (
    <button className={'btn' + (kind !== 'filled' ? ' ' + kind : '') + (small ? ' small' : '')} onClick={() => { haptic(8); onClick?.() }} disabled={disabled} style={style}>
      {children}
    </button>
  )
}

export function Sheet({ open, onClose, title, children, action }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; action?: { label: string; onClick: () => void; disabled?: boolean }
}) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className="sheet-back" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <button className="navbtn" style={{ justifySelf: 'start' }} onClick={onClose}>Avbryt</button>
          <h3>{title}</h3>
          {action
            ? <button className="navbtn" style={{ justifySelf: 'end', fontWeight: 600 }} disabled={action.disabled} onClick={action.onClick}>{action.label}</button>
            : <span />}
        </div>
        {children}
      </div>
    </>
  )
}

export function Ring({ value, size = 200, stroke = 14, color = 'var(--tint)', track = 'var(--fill)', children }: {
  value: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode
}) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamp(value, 0, 1))} style={{ transition: 'stroke-dashoffset .5s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  )
}

export function Bars({ data, color, height = 120, fmt }: { data: { label: string; value: number }[]; color?: string; height?: number; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bars" style={{ height }}>
      {data.map((d, i) => (
        <div className="b" key={i} title={fmt ? fmt(d.value) : String(d.value)}>
          <div className="bf" style={{ height: `${(d.value / max) * 82}%`, background: color }} />
          <div className="bl">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

export function Spark({ values, height = 60, color = 'var(--tint)', min, max }: { values: number[]; height?: number; color?: string; min?: number; max?: number }) {
  if (values.length < 2) return <div className="muted small" style={{ height, display: 'grid', placeItems: 'center' }}>Trenger minst to målinger</div>
  const lo = min ?? Math.min(...values), hi = max ?? Math.max(...values), span = hi - lo || 1
  const w = 300
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - 4 - ((v - lo) / span) * (height - 8)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function Progress({ value, color }: { value: number; color?: string }) {
  return <div className="progress"><div style={{ width: `${clamp(value, 0, 1) * 100}%`, background: color }} /></div>
}

export function Empty({ icon, title, text, children }: { icon: string; title: string; text?: ReactNode; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="ei">{icon}</div>
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {children && <div style={{ marginTop: 18 }}>{children}</div>}
    </div>
  )
}
