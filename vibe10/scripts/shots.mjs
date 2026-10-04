// Visuell røyktest: server dist/ og ta iPhone-skjermbilder av hver app (lys + mørk).
// Bruk: node scripts/shots.mjs [appId ...]   → shots/<id>-light.png / -dark.png
import { createServer } from 'node:http'
import { readFile, mkdir } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { createRequire } from 'node:module'
import { apps } from '../apps.config.js'
const require = createRequire(import.meta.url)
const { chromium, devices } = require('/opt/node22/lib/node_modules/playwright')

const dist = resolve(import.meta.dirname, '..', 'dist')
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' }
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (p.endsWith('/')) p += 'index.html'
  try { res.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); res.end(await readFile(resolve(dist, '.' + p))) }
  catch { res.writeHead(404); res.end() }
}).listen(4317)

const out = resolve(import.meta.dirname, '..', 'shots'); await mkdir(out, { recursive: true })
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['', ...apps.map((a) => a.id)]
const browser = await chromium.launch()
const errors = []
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ ...devices['iPhone 15'], colorScheme: scheme })
  if (process.env.SEED) await ctx.addInitScript({ content: await readFile(process.env.SEED, 'utf8') })
  for (const id of ids) {
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(`${id}: ${e.message}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`${id} console: ${m.text()}`))
    await page.goto(`http://localhost:4317/${id ? `apps/${id}/` : ''}${process.env.QS || ''}`)
    await page.waitForTimeout(400)
    await page.screenshot({ path: resolve(out, `${id || 'hub'}-${scheme}.png`), fullPage: !!process.env.FULL })
    await page.close()
  }
  await ctx.close()
}
await browser.close(); server.close()
console.log(errors.length ? 'FEIL:\n' + errors.join('\n') : 'ingen JS-feil')
