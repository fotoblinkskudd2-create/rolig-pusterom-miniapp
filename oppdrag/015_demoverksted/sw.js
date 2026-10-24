const CACHE = "demoverksted-v1";
const FILER = ["./", "./index.html", "./konsoll.js", "./src/behandling.js", "./src/dokumentkontroll.js", "./src/margin.js", "./manifest.webmanifest", "./ikon-192.png",
  "./scenarier/index.json", "./scenarier/v1/arbeidskort.json", "./scenarier/v1/dokumentkontroll.json", "./scenarier/v1/margin.json",
  "../004_arbeidskort/dist/uttrekk.js", "../004_arbeidskort/dist/eml.js", "../felles/web/stil.css", "../felles/web/dom.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILER)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { if (e.request.method === "GET") e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(t => t || fetch(e.request))); });
