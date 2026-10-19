// Kjør: node test/pusterom.test.mjs — verifiserer at 1.1-påstandene i HULL.md faktisk holder.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href;
let failed = 0;
const t = async (n, f) => { try { await f(); console.log('  ✓ ' + n); } catch (e) { failed++; console.log('  ✗ ' + n + '\n    ' + e.message); } };
const ok = (v, m) => { if (!v) throw new Error(m); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = []; let dialogs = 0;
page.on('pageerror', e => errors.push(e.message));
page.on('dialog', d => { dialogs++; d.dismiss(); });
await page.goto(url);
console.log('Pusterom 1.1');
await t('«Pust med meg» flytter nav-markering', async () => {
  await page.click('text=Pust med meg');
  ok(await page.locator('.nav button.active').innerText().then(s => s.includes('Pusterom')), 'nav ikke oppdatert');
});
await t('#pusterom i URL åpner Pusterom direkte', async () => {
  await page.goto(url + '#pusterom');
  ok(await page.locator('#page-pusterom').isVisible(), 'ikke synlig');
});
await t('ingen alert() uten humør', async () => {
  await page.goto(url + '#hjem');
  await page.click('text=Lagre sjekk-inn');
  ok(dialogs === 0, 'dialog vist');
  ok(await page.locator('#saveMsg').isVisible(), 'ingen myk melding');
});
await t('lokal-first-linje og lenker', async () => {
  ok(await page.getByText('Alt blir på denne enheten').isVisible(), 'mangler');
  ok(await page.locator('a[href="isolation-mirror.html"]').count() === 1, 'IM-lenke');
  ok(await page.locator('a[href="products/01-kjolerom/kjolerom.html"]').count() === 1, 'Kjølerom-lenke');
});
await t('notat med HTML rendres som tekst', async () => {
  await page.click('.mood-btn[data-mood="3"]');
  await page.fill('#note', '<img src=x onerror="window.__p=1">');
  await page.click('text=Lagre sjekk-inn');
  await page.click('.nav button[data-page=historikk]');
  ok(await page.evaluate(() => window.__p) === undefined, 'XSS');
});
await t('eksport gir pusterom-historikk.txt', async () => {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('text=Ta historikken med deg')]);
  ok(dl.suggestedFilename() === 'pusterom-historikk.txt', dl.suggestedFilename());
});
await t('ingen JS-feil', async () => ok(errors.length === 0, errors.join('; ')));
await browser.close();
process.exit(failed ? 1 : 0);
