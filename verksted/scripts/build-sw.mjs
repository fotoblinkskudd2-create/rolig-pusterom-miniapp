// Etter vite build: skriver dist/sw.js med presisering av alle filer, så alt virker offline.
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const dist = 'dist';
const files = [];
(function walk(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (!p.endsWith('sw.js') && !p.endsWith('.zip')) files.push(relative(dist, p).split('\\').join('/'));
  }
})(dist);
const version = createHash('sha1').update(files.join('|') + Date.now()).digest('hex').slice(0, 10);
const dirs = files.filter((f) => f.endsWith('/index.html')).map((f) => './' + f.slice(0, -'index.html'.length));
const precache = ['./', ...dirs, ...files.map((f) => './' + f)];

writeFileSync(join(dist, 'sw.js'), `// Generert av scripts/build-sw.mjs – ikke rediger.
const CACHE = 'verksted-${version}';
const PRECACHE = ${JSON.stringify(precache)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // eksterne API-er (strømpris) går rett på nett
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(new URL('./index.html', e.request.url).href)))
  );
});
`);
console.log(`sw.js: ${precache.length} filer, cache ${version}`);
