/* Small Wins Lab — service worker. Cacher alle lokale filer slik at appen virker uten nett. */
const CACHE = 'small-wins-lab-v1';
const FILER = ['./', 'index.html', 'print.html', 'css/app.css', 'css/print.css', 'js/data.js', 'js/engine.js',
  'js/storage.js', 'js/tekst.js', 'js/app.js', 'js/print.js', 'manifest.webmanifest', 'icon.svg'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILER)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(treff => treff || fetch(e.request).then(svar => {
    if (svar.ok) { const kopi = svar.clone(); caches.open(CACHE).then(c => c.put(e.request, kopi)); }
    return svar;
  })));
});
