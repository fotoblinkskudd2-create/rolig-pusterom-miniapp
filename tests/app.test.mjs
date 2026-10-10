// Regresjonstest for løftene i HULL.md / RUN.md (1.1).
// Kjør: node tests/app.test.mjs   (krever global playwright)
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
let fails = 0;
const ok = (name, cond, extra = '') => { console.log(`${cond ? 'OK  ' : 'FEIL'} ${name}${extra ? ' — ' + extra : ''}`); if (!cond) fails++; };

const browser = await pw.chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(e.message));
let dialogs = 0; page.on('dialog', d => { dialogs++; d.dismiss(); });
await page.goto(url);

// 1. Nav følger siden når «Pust med meg» brukes
await page.click('text=Pust med meg');
const activeNav = await page.textContent('.nav button.active').catch(() => '');
ok('«Pust med meg» markerer Pusterom i nav', /Pusterom/.test(activeNav || ''), `aktiv: ${(activeNav||'').trim()}`);
ok('Pusterom-siden vises', await page.isVisible('#page-pusterom'));

// 2. Ingen alert() ved lagring uten humør
await page.click('.nav button >> text=Hjem');
await page.click('text=Lagre sjekk-inn');
ok('ingen alert() uten humør', dialogs === 0, `dialoger: ${dialogs}`);
ok('inline-beskjed uten humør', await page.isVisible('#moodHint'));

// 3. Lokal-first-setning synlig
ok('«Alt blir på denne enheten» synlig', await page.isVisible('text=Alt blir på denne enheten'));

// 4. Notat med HTML skal vises som tekst, ikke kjøres
await page.click('.mood-btn[data-mood="2"]');
await page.fill('#note', '<img src=x onerror="window.__xss=1">tung dag');
await page.click('text=Lagre sjekk-inn');
await page.click('.nav button >> text=Historikk');
ok('notat escapes (ingen XSS)', !(await page.evaluate(() => window.__xss)));
ok('notat vises som tekst', await page.isVisible('text=tung dag'));

// 5. Eksport som .txt
const [dl] = await Promise.all([
  page.waitForEvent('download', { timeout: 3000 }).catch(() => null),
  page.click('text=Ta historikken med deg').catch(() => null),
]);
let txt = '';
if (dl) { const p = await dl.path(); txt = fs.readFileSync(p, 'utf8'); }
ok('eksport laster ned pusterom-historikk.txt', dl && dl.suggestedFilename() === 'pusterom-historikk.txt');
ok('eksport inneholder notatet', txt.includes('tung dag'));

// 6. Isolation Mirror lenket fra appen
ok('lenke til Isolation Mirror', (await page.locator('a[href="isolation-mirror.html"]').count()) > 0);

ok('ingen JS-feil', errors.length === 0, errors.join(' | '));
await browser.close();
console.log(fails ? `${fails} TEST(ER) FEILET` : 'ALLE TESTER BESTÅTT');
process.exit(fails ? 1 : 0);
