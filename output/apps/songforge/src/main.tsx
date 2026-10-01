// FELLES KJERNE – inngang. App-spesifikt innhold ligger i src/app/.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './core/styles.css';
import './app/app.css';
import { App } from './app/App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if ('serviceWorker' in navigator && location.protocol !== 'capacitor:' && import.meta.env.PROD) {
  navigator.serviceWorker.register('/sw.js').catch(() => {
    /* uten service worker virker appen fortsatt med nett */
  });
}
