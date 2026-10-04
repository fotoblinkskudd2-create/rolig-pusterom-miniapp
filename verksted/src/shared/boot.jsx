import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// rootRel: sti fra siden til roten der sw.js ligger ('./' for hub, '../../' for apper).
export function boot(App, rootRel = '../../') {
  createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>);
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const url = new URL(rootRel + 'sw.js', location.href);
    navigator.serviceWorker.register(url, { scope: new URL(rootRel, location.href).pathname }).catch(() => {});
  }
}
