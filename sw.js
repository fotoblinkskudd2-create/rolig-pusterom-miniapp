// Pusterom service worker: gjør appen tilgjengelig uten nett.
// Ingen data sendes noe sted. Bare appens egne filer mellomlagres.
// Bytt CACHE ved hver endring i filene under, ellers får brukere gammel versjon.
const CACHE = 'pusterom-1.3.0';
const SHELL = [
  './',
  './index.html',
  './isolation-mirror.html',
  './systemrom.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('pusterom-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Nett først for sider (får nye versjoner når man er på nett), cache først for resten.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
