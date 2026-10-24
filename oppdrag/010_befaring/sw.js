// Cache-first for app-skallet, slik at befaringen åpnes uten nett etter første besøk.
const CACHE = "befaring-v1";
const SKALL = ["./", "./index.html", "./ui.js", "./lager.js", "./dist/befaring.js", "./manifest.webmanifest", "./ikon-192.png",
  "../felles/web/stil.css", "../felles/web/dom.js", "../felles/web/pdf.js", "../felles/web/zip.js",
  "./data/demo.json", "./data/bilder/bad_fukt.jpg", "./data/bilder/kjokken_stikk.jpg", "./data/bilder/gang_sprekk.jpg"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SKALL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(t => t || fetch(e.request)));
});
