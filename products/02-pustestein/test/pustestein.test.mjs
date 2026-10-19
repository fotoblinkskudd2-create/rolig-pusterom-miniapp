// Kjør: node products/02-pustestein/test/pustestein.test.mjs
// Ende-til-ende: kalibrer → spor med "tommel" → parametre.json → CAD-skriptet bygger steinen.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const prod = path.join(here, '..');
const url = pathToFileURL(path.join(prod, 'pustestein.html')).href;
const shots = path.join(prod, 'bilder');
const tmp = fs.mkdtempSync(path.join(here, '.tmp-'));

let failed = 0, passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + String(e.stack || e).split('\n').slice(0, 3).join('\n    ')); }
}
const ok = (v, m) => { if (!v) throw new Error(m); };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} ikke ≈ ${b} ± ${tol}`);

// testbilde (fjord-ish gradient) via python/matplotlib — samme verktøy som CAD
const photo = path.join(tmp, 'fjord.png');
execFileSync('python3', ['-c', `
import numpy as np, matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt
y = np.linspace(0, 1, 300)[:, None]; x = np.linspace(0, 1, 400)[None, :]
img = np.dstack([0.2 + 0.3*y + 0*x, 0.35 + 0.3*y + 0.1*x, 0.55 + 0.3*y + 0*x])
plt.imsave(r"${photo}", np.clip(img, 0, 1))
`]);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!/^(file|blob|data):/.test(r.url())) requests.push(r.url()); });
await page.goto(url);

console.log('Pustestein');

await t('laster, tegner stein med 3 segmenter', async () => {
  ok(errors.length === 0, errors.join('; '));
  ok(await page.locator('#guideSvg path').count() === 3, 'segmenter');
  ok(/5,0 pust i minuttet/.test(await page.locator('#rhythmLine').innerText()), 'rytmelinje');
});

await t('geometri speiler CAD: P1 og rillelengde', async () => {
  const g = await page.evaluate(() => ({ P1: window.__stein.P1, L: window.__stein.grooveLen() }));
  near(g.P1, 221.03, 0.05, 'ellipseomkrets'); // python: ellipse_perimeter(40, 30)
  ok(g.L === 120, 'L ' + g.L);
});

await t('guide: fase følger 4–2–6 og teller ribber', async () => {
  const p = await ctx.newPage();
  await p.clock.install();
  await p.goto(url);
  await p.click('#guideBtn');
  await p.clock.runFor(1000); ok((await p.locator('#phase').innerText()) === 'Pust inn…', 'inn');
  await p.clock.runFor(4000); ok((await p.locator('#phase').innerText()) === 'Hold…', 'hold');
  await p.clock.runFor(1500); ok((await p.locator('#phase').innerText()) === 'Pust ut…', 'ut'); // t = 6,5 s
  ok((await p.locator('#count').innerText()) === '1 / 6', 'teller ' + await p.locator('#count').innerText());
  await p.clock.runFor(4600); ok((await p.locator('#count').innerText()) === '6 / 6', 'teller slutt');
  await p.clock.runFor(1000); ok((await p.locator('#phase').innerText()) === 'Pust inn…', 'ny runde');
  await p.screenshot({ path: path.join(shots, 'app-guide.png'), fullPage: true });
  await p.close();
});

async function traceLoop(ms) {
  await page.locator('#traceSvg').evaluate(e => e.scrollIntoView({ block: 'center' }));
  const box = await page.locator('#traceSvg').boundingBox();
  const vb = (await page.locator('#traceSvg').getAttribute('viewBox')).split(' ').map(Number);
  const k = await page.evaluate(() => window.__stein.kFor(window.__stein.clampLen(window.__stein.grooveLen()).L));
  const toPx = (x, y) => [box.x + (x - vb[0]) / vb[2] * box.width, box.y + (-y - vb[1]) / vb[3] * box.height];
  const N = 120;
  let [sx, sy] = toPx(k * 40, 0);
  await page.mouse.move(sx, sy); await page.mouse.down();
  let px = 0, last = [sx, sy];
  const start = Date.now();
  for (let i = 1; i <= N; i++) {
    const a = i / N * 2 * Math.PI, [x, y] = toPx(k * 40 * Math.cos(a), k * 30 * Math.sin(a));
    await page.mouse.move(x, y); px += Math.hypot(x - last[0], y - last[1]); last = [x, y];
    const wait = start + ms * i / N - Date.now(); if (wait > 0) await page.waitForTimeout(wait);
  }
  await page.mouse.up();
  return { px, secs: (Date.now() - start) / 1000 };
}

let expected;
await t('kalibrering: kort-slider setter px/mm', async () => {
  await page.click('nav button[data-page=kalibrer]');
  await page.locator('#pxmm').fill('4');
  const w = await page.locator('#cardBox').evaluate(e => e.getBoundingClientRect().width);
  near(w, 53.98 * 4, 1, 'kortbredde');
});

await t('kort i ekte mobilskala (6 px/mm) får plass på 390px', async () => {
  await page.locator('#pxmm').fill('6');
  const w = await page.locator('#cardBox').evaluate(e => e.getBoundingClientRect().width);
  near(w, 53.98 * 6, 1, 'kortbredde');
  ok(await page.evaluate(() => document.documentElement.scrollWidth) <= 390, 'horisontal scroll');
  await page.locator('#pxmm').fill('4');
});

await t('tre sporinger → median fart i ekte mm/s', async () => {
  const runs = [];
  for (let i = 0; i < 3; i++) runs.push(await traceLoop(4000));
  const v = await page.evaluate(() => window.__stein.st.speed_mm_s);
  expected = runs.map(r => r.px / 4 / r.secs).sort((a, b) => a - b)[1];
  near(v, expected, expected * 0.08, 'fart');
  ok((await page.locator('#traceLine').innerText()).startsWith('3 av 3'), 'teller runder');
  await page.screenshot({ path: path.join(shots, 'app-kalibrer.png'), fullPage: true });
});

await t('for rask tommel → rille for lang → advarsel, nedlasting sperret', async () => {
  await page.click('nav button[data-page=lag]');
  ok(/må være \d+–\d+ mm/.test(await page.locator('#warnLine').innerText()), 'ingen advarsel');
  ok(await page.locator('#dlJson').isDisabled(), 'knapp ikke sperret');
});

await t('halv runde teller ikke', async () => {
  await page.click('nav button[data-page=kalibrer]');
  await page.click('#traceReset');
  await page.locator('#traceSvg').evaluate(e => e.scrollIntoView({ block: 'center' }));
  const box = await page.locator('#traceSvg').boundingBox();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height / 2); await page.mouse.down();
  for (let i = 0; i < 20; i++) { await page.mouse.move(box.x + box.width * (0.9 - i * 0.04), box.y + box.height * 0.2); await page.waitForTimeout(200); }
  await page.mouse.up();
  ok((await page.evaluate(() => window.__stein.st.traces.length)) === 0, 'halv runde ble telt');
});

let jsonPath;
await t('manuell fart 9,5 → parametre.json lastes ned', async () => {
  await page.click('nav button[data-page=lag]');
  await page.fill('#pSpeed', '9.5'); await page.locator('#pSpeed').dispatchEvent('change');
  await page.selectOption('#pR', '8');
  ok(/114 mm/.test(await page.locator('#sumLine').innerText()), await page.locator('#sumLine').innerText());
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#dlJson')]);
  jsonPath = path.join(tmp, 'parametre.json'); await dl.saveAs(jsonPath);
  const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  ok(j.speed_mm_s === 9.5 && j.groove_r === 8 && j.inhale === 4, JSON.stringify(j));
  await page.screenshot({ path: path.join(shots, 'app-lag.png'), fullPage: true });
});

await t('CAD bygger steinen fra appens parametre.json', async () => {
  const out = execFileSync('python3', [path.join(prod, 'cad', 'pustestein.py'), jsonPath], { encoding: 'utf8', env: { ...process.env, PUSTESTEIN_NO_IMAGES: '1', PUSTESTEIN_OUT: tmp } });
  ok(/Rille\s+: 114 mm/.test(out), out.split('\n')[3]);
  ok(/stein True/.test(out), 'ikke vanntett');
  ok(fs.existsSync(path.join(tmp, 'pustestein.stl')), 'STL mangler');
});

await t('bilde: beskjæring 45×35 mm @ 300 dpi, utskrift i mm', async () => {
  await page.click('nav button[data-page=bilde]');
  await page.setInputFiles('#photoIn', photo);
  await page.waitForTimeout(200);
  const c = await page.locator('#cropCanvas').evaluate(e => [e.width, e.height]);
  ok(c[0] === 531 && c[1] === 413, 'canvas ' + c);
  await page.click('#rotateBtn');
  const c2 = await page.locator('#cropCanvas').evaluate(e => [e.width, e.height]);
  ok(c2[0] === 413 && c2[1] === 531, 'stående ' + c2);
  await page.evaluate(() => { window.print = () => { window.__printed = true; }; });
  await page.click('#printPhoto'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => window.__printed), 'print ikke kalt');
  const st = await page.locator('#printSheet img').first().getAttribute('style');
  ok(/width:35mm;height:45mm/.test(st.replace(/\s/g, '')), st);
  ok(await page.locator('#printSheet img').count() === 6, 'antall');
  await page.screenshot({ path: path.join(shots, 'app-bilde.png'), fullPage: true });
});

await t('320px uten horisontal scroll på alle sider', async () => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const pg of ['guide', 'kalibrer', 'bilde', 'lag']) {
    await page.click(`nav button[data-page=${pg}]`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 320, pg + ' scrollWidth ' + sw);
  }
});

await t('null nettverkskall', async () => ok(requests.length === 0, requests.join(', ')));
await t('ingen JS-feil', async () => ok(errors.length === 0, errors.join('; ')));

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} bestått, ${failed} feilet`);
process.exit(failed ? 1 : 0);
