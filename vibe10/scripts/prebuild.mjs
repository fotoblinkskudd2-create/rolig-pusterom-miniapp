// Genererer alt iOS trenger per app før Vite bygger:
//   apps/<id>/index.html          – inngangsside med iOS-meta-tagger
//   public/apps/<id>/manifest.webmanifest
//   public/apps/<id>/icon-180.png, icon-192.png, icon-512.png  (rendres med Chromium)
//   public/icon-*.png + manifest for hubben
// Kjør: node scripts/prebuild.mjs   (gjøres automatisk av `npm run build`)
import { mkdir, writeFile, access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { apps } from '../apps.config.js'

const root = resolve(import.meta.dirname, '..')
const hub = { id: '', name: 'Vibe10', short: 'Vibe10', color: '#111113', glyph: '🔟', tagline: 'Ti lokale iPhone-apper. Ingen konto. Ingen sky.' }

const iconSvg = (a, size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${a.color}"/><stop offset="1" stop-color="#111113"/></linearGradient></defs>
  <rect width="100" height="100" fill="url(#g)"/>
  <text x="50" y="54" font-size="52" text-anchor="middle" dominant-baseline="middle"
    font-family="Noto Color Emoji, Apple Color Emoji, sans-serif">${a.glyph}</text>
</svg>`

const html = (a) => `<!doctype html>
<html lang="nb">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="${a.color}" />
  <meta name="description" content="${a.tagline}" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="${a.short}" />
  <link rel="apple-touch-icon" href="./icon-180.png" />
  <link rel="icon" href="./icon-192.png" />
  <link rel="manifest" href="./manifest.webmanifest" />
  <title>${a.name}</title>
</head>
<body style="--accent:${a.color}">
  <div id="root"></div>
  <script type="module" src="./main.jsx"></script>
</body>
</html>
`

const manifest = (a, start = './') => JSON.stringify({
  name: a.name,
  short_name: a.short,
  description: a.tagline,
  lang: 'nb',
  start_url: start,
  scope: './',
  display: 'standalone',
  background_color: '#0b0b0c',
  theme_color: a.color,
  icons: [
    { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: './icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2)

async function renderIcons(targets) {
  const { chromium } = await import('playwright').catch(async () => {
    // Global playwright i dette miljøet; fall tilbake til require-sti.
    const { createRequire } = await import('node:module')
    return createRequire(import.meta.url)('/opt/node22/lib/node_modules/playwright')
  })
  const browser = await chromium.launch()
  const page = await browser.newPage()
  for (const { a, dir } of targets) {
    for (const size of [180, 192, 512]) {
      await page.setViewportSize({ width: size, height: size })
      await page.setContent(`<html><body style="margin:0">${iconSvg(a, size)}</body></html>`)
      await page.screenshot({ path: resolve(dir, `icon-${size}.png`), clip: { x: 0, y: 0, width: size, height: size } })
    }
  }
  await browser.close()
}

const exists = (p) => access(p).then(() => true, () => false)

const targets = []
for (const a of apps) {
  const appDir = resolve(root, 'apps', a.id)
  const pubDir = resolve(root, 'public', 'apps', a.id)
  await mkdir(appDir, { recursive: true })
  await mkdir(pubDir, { recursive: true })
  await writeFile(resolve(appDir, 'index.html'), html(a))
  await writeFile(resolve(pubDir, 'manifest.webmanifest'), manifest(a))
  if (process.argv.includes('--icons') || !(await exists(resolve(pubDir, 'icon-512.png')))) targets.push({ a, dir: pubDir })
}
await writeFile(resolve(root, 'public', 'manifest.webmanifest'), manifest(hub))
if (process.argv.includes('--icons') || !(await exists(resolve(root, 'public', 'icon-512.png')))) targets.push({ a: hub, dir: resolve(root, 'public') })

if (targets.length) {
  try {
    await renderIcons(targets)
    console.log(`ikoner: ${targets.length} sett rendret`)
  } catch (e) {
    console.warn('Fant ikke Chromium/Playwright – hopper over ikon-rendring (eksisterende PNG-er brukes).', e.message)
  }
}
console.log(`prebuild: ${apps.length} apper + hub`)
