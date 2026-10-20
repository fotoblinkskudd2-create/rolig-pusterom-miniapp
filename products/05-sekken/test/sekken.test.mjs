// Kjør: node products/05-sekken/test/sekken.test.mjs
// Starter en liten statisk server (service workers krever http), installerer PWA-en, går offline,
// og sjekker at alle sider lastes. Tester så sekken: pakk → tøm → pakk ut → angre, og at appene deler deler.
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const shots = path.join(here, '..', 'bilder');
const tmp = fs.mkdtempSync(path.join(here, '.tmp-'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json', '.stl': 'model/stl' };
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.normalize(path.join(root, u.endsWith('/') ? u + 'index.html' : u));
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let failed = 0, passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + String(e.stack || e).split('\n').slice(0, 3).join('\n    ')); }
}
const ok = (v, m) => { if (!v) throw new Error(m); };

const PAGES = [['index.html', 'Pusterom'], ['isolation-mirror.html', 'Isolation Mirror'], ['products/01-kjolerom/kjolerom.html', 'Kjølerom'],
  ['products/02-pustestein/pustestein.html', 'Pustestein'], ['products/03-granatbelte/granatbelte.html', 'Granatbelte'],
  ['products/04-brevvakt/brevvakt.html', 'Brevvakt'], ['products/05-sekken/sekken.html', 'Sekken']];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [], external = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
ctx.on('request', r => { if (!r.url().startsWith(base) && !/^(blob|data):/.test(r.url())) external.push(r.url()); });

console.log('Sekken (PWA over http)');

await t('manifest er gyldig og peker på ikoner som finnes', async () => {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  ok(m.display === 'standalone' && m.icons.length === 3, 'manifest');
  for (const i of m.icons) ok(fs.existsSync(path.join(root, i.src)), 'mangler ' + i.src);
  for (const s of m.shortcuts) ok(fs.existsSync(path.join(root, s.url.split('#')[0])), 'snarvei ' + s.url);
});

await t('sw.js sin SHELL-liste finnes på disk', async () => {
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const list = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
  for (const f of list) ok(fs.existsSync(path.join(root, f)), 'mangler i SHELL: ' + f);
  for (const [p] of PAGES) ok(list.includes(p), 'side ikke i SHELL: ' + p);
});

await t('service worker installeres og tar kontroll', async () => {
  await page.goto(base + 'index.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  ok(await page.evaluate(() => !!navigator.serviceWorker.controller), 'ingen kontroller');
});

await t('alle sider laster offline', async () => {
  await ctx.setOffline(true);
  for (const [p, title] of PAGES) {
    await page.goto(base + p);
    ok((await page.title()).includes(title), p + ' → ' + await page.title());
  }
  await ctx.setOffline(false);
});

await t('appene deler deler: Granatbelte leser Kjølerom på samme opphav', async () => {
  await page.goto(base + 'products/01-kjolerom/kjolerom.html#overlevering');
  await page.fill('#newPart', 'Lille'); await page.click('#addPart');
  await page.goto(base + 'products/03-granatbelte/granatbelte.html');
  const opts = await page.locator('#rawPart option').allInnerTexts();
  ok(opts.includes('Meg') && opts.includes('Lille'), JSON.stringify(opts));
});

let sekk;
await t('pakk sekken: én fil med alle apper', async () => {
  await page.goto(base + 'products/04-brevvakt/brevvakt.html');
  await page.fill('#fMain', '2499'); await page.fill('#fCreditor', 'Test'); await page.click('#checkBtn'); await page.click('#saveCase');
  await page.goto(base + 'products/05-sekken/sekken.html');
  ok(/Aldri pakket/.test(await page.locator('#status').innerText()), 'status');
  await page.screenshot({ path: path.join(shots, 'app-sekken.png'), fullPage: true });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#backupBtn')]);
  sekk = path.join(tmp, 'sekk.json'); await dl.saveAs(sekk);
  const j = JSON.parse(fs.readFileSync(sekk, 'utf8'));
  ok(j.format === 'rolig-sekk' && ['kjolerom.v1', 'granatbelte.v1', 'brevvakt.v1'].every(k => k in j.keys), Object.keys(j.keys).join(','));
  ok(/0 dager/.test(await page.locator('#status').innerText()), 'ikke oppdatert');
});

await t('tøm krever SLETT', async () => {
  ok(await page.locator('#wipeBtn').isDisabled(), 'ikke sperret');
  await page.fill('#wipeWord', 'slett'); ok(await page.locator('#wipeBtn').isDisabled(), 'små bokstaver godtatt');
  await page.fill('#wipeWord', 'SLETT'); await page.click('#wipeBtn');
  ok(await page.evaluate(() => localStorage.getItem('kjolerom.v1') === null && localStorage.getItem('brevvakt.v1') === null), 'ikke tømt');
});

await t('pakk ut bare Brevvakt, så alt; angre virker', async () => {
  await page.setInputFiles('#restoreIn', sekk);
  await page.locator('#restoreKeys input[data-app="Kjølerom"]').uncheck();
  await page.locator('#restoreKeys input[data-app="Granatbelte"]').uncheck();
  await page.click('#restoreBtn');
  ok(await page.evaluate(() => localStorage.getItem('brevvakt.v1') !== null && localStorage.getItem('kjolerom.v1') === null), 'utvalg ignorert');
  await page.click('#undoBtn');
  ok(await page.evaluate(() => localStorage.getItem('brevvakt.v1') === null), 'angre');
  await page.setInputFiles('#restoreIn', sekk); await page.click('#restoreBtn');
  await page.goto(base + 'products/01-kjolerom/kjolerom.html#overlevering');
  ok((await page.locator('#partPicker').innerText()).includes('Lille'), 'Kjølerom ikke tilbake');
});

await t('fremmed fil avvises', async () => {
  await page.goto(base + 'products/05-sekken/sekken.html');
  const f = path.join(tmp, 'x.json'); fs.writeFileSync(f, JSON.stringify({ format: 'noe-annet', keys: { 'kjolerom.v1': '{}' } }));
  await page.setInputFiles('#restoreIn', f); await page.waitForTimeout(100);
  ok(await page.locator('#restorePick').isHidden(), 'godtok fremmed fil');
});

await t('ingen eksterne kall, ingen JS-feil', async () => {
  ok(external.length === 0, external.join(', '));
  ok(errors.length === 0, errors.join('; '));
});

await browser.close(); server.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} bestått, ${failed} feilet`);
process.exit(failed ? 1 : 0);
