// Etter `vite build`: skriver dist/sw.js som forhåndscacher hver eneste fil i dist/.
// Én service worker på rot styrer alle 10 appene → alt virker i flymodus etter første besøk.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, relative, sep } from 'node:path'

const dist = resolve(import.meta.dirname, '..', 'dist')

async function walk(dir) {
  const out = []
  for (const name of await readdir(dir)) {
    const p = resolve(dir, name)
    if ((await stat(p)).isDirectory()) out.push(...(await walk(p)))
    else out.push(p)
  }
  return out
}

const files = (await walk(dist)).filter((f) => !f.endsWith('sw.js') && !f.endsWith('.zip'))
const hash = createHash('sha256')
for (const f of files) hash.update(await readFile(f))
const version = hash.digest('hex').slice(0, 10)
const urls = files.map((f) => './' + relative(dist, f).split(sep).join('/'))
// Mapper (…/apps/x/) må også kunne slås opp når iOS åpner start_url.
for (const u of [...urls]) if (u.endsWith('/index.html')) urls.push(u.slice(0, -'index.html'.length))

const sw = `// Generert av scripts/gen-sw.mjs – ikke rediger.
const CACHE = 'vibe10-${version}'
const PRECACHE = ${JSON.stringify(urls)}

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone()
      if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, copy))
      return res
    }).catch(() => caches.match('./index.html'))),
  )
})
`
await writeFile(resolve(dist, 'sw.js'), sw)
console.log(`sw.js: ${urls.length} filer, versjon ${version}`)
