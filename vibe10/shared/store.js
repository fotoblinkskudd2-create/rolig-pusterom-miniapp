import { useCallback, useEffect, useState } from 'react'

// Lokal-først lagring. Alt ligger i localStorage under `${app}:${key}`.
// Ingen server, ingen konto. Backup = JSON-fil brukeren selv eier.

export function useLocal(app, key, initial) {
  const k = `${app}:${key}`
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(k)
      return raw == null ? (typeof initial === 'function' ? initial() : initial) : JSON.parse(raw)
    } catch {
      return typeof initial === 'function' ? initial() : initial
    }
  })
  useEffect(() => {
    try { localStorage.setItem(k, JSON.stringify(value)) } catch { /* full lagring / privat modus */ }
  }, [k, value])
  return [value, setValue]
}

export function exportApp(app) {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k.startsWith(app + ':')) data[k.slice(app.length + 1)] = JSON.parse(localStorage.getItem(k))
  }
  return { app, exportedAt: new Date().toISOString(), data }
}

export function importApp(app, payload) {
  if (!payload || payload.app !== app || typeof payload.data !== 'object') throw new Error('Feil fil for denne appen')
  for (const [k, v] of Object.entries(payload.data)) localStorage.setItem(`${app}:${k}`, JSON.stringify(v))
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export function useToast() {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => {
    setMsg(m)
    clearTimeout(show.t)
    show.t = setTimeout(() => setMsg(null), 2200)
  }, [])
  return [msg, show]
}

// Del eller last ned en fil. På iPhone åpner navigator.share delingsarket
// (Lagre i Filer, AirDrop, Kalender for .ics). Faller tilbake til nedlasting.
export async function saveFile(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type })
  const file = new File([blob], name, { type })
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return } catch (e) { if (e.name === 'AbortError') return }
  }
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true } catch {
    const t = Object.assign(document.createElement('textarea'), { value: text })
    document.body.appendChild(t); t.select()
    const ok = document.execCommand('copy'); t.remove(); return ok
  }
}
