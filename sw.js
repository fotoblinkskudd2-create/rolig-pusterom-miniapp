// Rolig service worker: alt offline etter første besøk. Ingen data sendes noe sted — dette cacher bare sidene selv.
// Øk VERSION når en side endres, så nye filer hentes.
const VERSION = 'rolig-2026-10-20-1';
const SHELL = [
  './', './index.html', './isolation-mirror.html', './manifest.webmanifest', './rolig-pwa.js',
  './ikoner/ikon-180.png', './ikoner/ikon-192.png', './ikoner/ikon-512.png', './ikoner/ikon-maskable-512.png',
  './products/01-kjolerom/kjolerom.html',
  './products/02-pustestein/pustestein.html',
  './products/03-granatbelte/granatbelte.html',
  './products/04-brevvakt/brevvakt.html',
  './products/05-sekken/sekken.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Cache først, nett som reserve; bare samme opphav og GET.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
