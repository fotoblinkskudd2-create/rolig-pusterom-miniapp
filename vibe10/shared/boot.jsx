import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'

// Monterer appen og registrerer felles service worker på rot (offline for alle appene).
// `toRoot` = relativ sti fra appens mappe til dist-roten, f.eks. '../../'.
export function boot(App, toRoot = '../../') {
  createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    addEventListener('load', () => {
      navigator.serviceWorker.register(toRoot + 'sw.js', { scope: toRoot }).catch(() => {})
    })
  }
}
