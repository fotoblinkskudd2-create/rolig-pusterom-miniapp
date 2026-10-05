// Røyktest mot kjørende container: node tests/smoke.mjs [base-url]
// Feiler på JS-feil, CSP-brudd og brukte løfter i README.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.argv[2] || 'http://localhost:8080';
const browser = await chromium.launch();
const ctx = await browser.newContext({ acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', e => problems.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
const offsite = [];
page.on('request', r => { if (!r.url().startsWith(BASE) && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) offsite.push(r.url()); });

// --- Pusterom ---
await page.goto(BASE + '/index.html');
await page.click('text=Lagre sjekk-inn');
assert.ok(await page.isVisible('#moodHint'), 'hint i stedet for alert');

await page.click('.mood-btn[data-mood="2"]');
await page.fill('#note', '<img src=x onerror=alert(1)>tungt');
await page.click('text=Lagre sjekk-inn');

await page.click('text=Pust med meg');
assert.equal(await page.getAttribute('.nav button.active', 'data-page'), 'pusterom', 'nav følger «Pust med meg»');

await page.click('.nav button[data-page="historikk"]');
assert.equal(await page.locator('#historyList img').count(), 0, 'note escapes');
assert.ok((await page.textContent('#historyList')).includes('<img'), 'note vises som tekst');

const [dl] = await Promise.all([page.waitForEvent('download'), page.click('text=Ta historikken med deg')]);
assert.equal(dl.suggestedFilename(), 'pusterom-historikk.txt');

// --- Systemrommet ---
await page.goto(BASE + '/systemrom.html');
await page.fill('#frontName', 'Kari');
await page.click('text=Logg at jeg er her');
assert.ok((await page.textContent('#away')).includes('Første gang'));

await page.fill('#noteTo', 'Lille');
await page.fill('#noteText', 'Pakken på døra er min.');
await page.click('text=Legg igjen lapp');

await page.fill('#buyWhat', 'Lego Technic');
await page.fill('#buyPrice', '2499');
await page.selectOption('#buyHow', 'avbetaling');
await page.click('text=Lås i 48 timer');
assert.ok((await page.textContent('#brakes')).includes('Låses opp om'));

await page.fill('#frontName', 'Lille');
await page.click('text=Logg at jeg er her');
assert.ok((await page.textContent('#notes')).includes('til deg'), 'lapp merket til Lille');
await page.click('text=Jeg har sett den');
assert.ok((await page.textContent('#notes')).includes('Sett av Lille'));

await page.fill('#frontName', 'kari');
await page.click('text=Logg at jeg er her');
const away = await page.textContent('#away');
assert.ok(away.includes('var sist her'), 'mens du var borte');
assert.ok(away.includes('Lille') && away.includes('var her'), 'viser byttet i mellomtiden');

// Spol kjøpsbremsen 49 timer tilbake
await page.evaluate(() => {
  const b = JSON.parse(localStorage.getItem('systemrom.brems'));
  b[0].at = new Date(Date.now() - 49 * 3600e3).toISOString();
  localStorage.setItem('systemrom.brems', JSON.stringify(b));
});
await page.reload();
assert.ok((await page.textContent('#brakes')).includes('48 timer har gått'));
await page.click('text=Slipp det');
const tally = await page.textContent('#tally');
assert.ok(tally.includes('2') && tally.includes('ny gjeld som aldri ble til'), tally);

const [json] = await Promise.all([page.waitForEvent('download'), page.click('text=Last ned (.json)')]);
assert.match(json.suggestedFilename(), /^systemrom-\d{4}-\d{2}-\d{2}\.json$/);

// --- Mirror + service worker ---
await page.goto(BASE + '/isolation-mirror.html');
await page.click('text=Generer');
assert.ok((await page.textContent('#labprompt')).includes('/lab'));
await page.goto(BASE + '/index.html');
await page.evaluate(() => navigator.serviceWorker.ready);

// Skjermbilder lys/mørk
if (process.env.SHOTS) {
  for (const scheme of ['light', 'dark']) {
    const p = await browser.newPage({ colorScheme: scheme, viewport: { width: 390, height: 1400 } });
    await p.goto(BASE + '/index.html');
    await p.evaluate(s => localStorage.setItem('x', s), scheme);
    await p.screenshot({ path: `${process.env.SHOTS}/index-${scheme}.png` });
    await p.goto(BASE + '/systemrom.html');
    await p.screenshot({ path: `${process.env.SHOTS}/systemrom-${scheme}.png`, fullPage: true });
    await p.close();
  }
}

await browser.close();
assert.deepEqual(problems, [], problems.join('\n'));
assert.deepEqual(offsite, [], 'requests utenfor egen origin: ' + offsite.join(', '));
console.log('ok: alle røyktester passerte');
