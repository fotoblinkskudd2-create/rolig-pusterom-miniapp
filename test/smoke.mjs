// Røyktest for Pusterom. Kjør: node test/smoke.mjs
// Krever Playwright (globalt eller lokalt). Ingen andre avhengigheter.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = require('/opt/node22/lib/node_modules/playwright'));
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404).end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

let failed = 0;
const results = [];
async function test(name, fn) {
  try { await fn(); results.push('  ok   ' + name); }
  catch (e) { failed++; results.push('  FEIL ' + name + '\n       ' + (e && e.message || e).split('\n')[0]); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});

async function freshPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('dialog', (d) => { errors.push('dialog: ' + d.message()); d.dismiss(); });
  return { ctx, page, errors };
}

await test('«Pust med meg» flytter også nav-markeringen', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto(BASE + 'index.html');
  await page.click('text=Pust med meg');
  assert(await page.isVisible('#page-pusterom'), 'pusterom ikke synlig');
  const current = await page.getAttribute('.nav button[aria-current="page"]', 'data-goto');
  assert(current === 'pusterom', 'nav viser ' + current);
  assert(page.url().endsWith('#pusterom'), 'hash ikke oppdatert: ' + page.url());
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Lokal-først-linje er synlig på forsiden', async () => {
  const { ctx, page } = await freshPage();
  await page.goto(BASE);
  assert(await page.isVisible('text=Alt blir på denne enheten'), 'mangler lokal-linje');
  await ctx.close();
});

await test('Lagre uten humør gir hint, ikke alert()', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto(BASE);
  await page.click('#saveBtn');
  assert(await page.isVisible('#saveMsg'), 'hint vises ikke');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Notat med HTML blir tekst, ikke kode (XSS)', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto(BASE);
  await page.click('.mood-btn[data-mood="2"]');
  await page.fill('#note', '<img src=x onerror="window.pwned=1">');
  await page.click('#saveBtn');
  await page.click('.nav button[data-goto="historikk"]');
  assert(await page.evaluate(() => window.pwned) === undefined, 'skript kjørte');
  const txt = await page.textContent('.history-item .text');
  assert(txt.includes('<img'), 'notat vises ikke som tekst: ' + txt);
  assert(await page.isVisible('#trend'), 'trend skjult');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Gamle data (1.0-format) leses uten feil', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto(BASE);
  await page.evaluate(() => {
    const today = new Date().toDateString();
    localStorage.setItem('checkins', JSON.stringify([{ date: new Date().toISOString(), mood: '4', note: 'gammel' }, { date: 'tull', mood: '9' }]));
    localStorage.setItem('doneActions', JSON.stringify({ [today]: [0, 2], 'Mon Jan 01 2001': [1] }));
  });
  await page.goto(BASE + '#grep');
  assert(await page.locator('.action-card.done').count() === 2, 'gamle «gjort» forsvant');
  await page.click('.nav button[data-goto="historikk"]');
  assert(await page.locator('.history-item').count() === 1, 'ugyldig rad ble ikke filtrert');
  const week = await page.textContent('#weekSummary');
  assert(week.includes('1 sjekk-inn') && week.includes('2 små grep'), week);
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Humørgraf: 14 ulike dager rundt overgang til vintertid', async () => {
  const { ctx, page, errors } = await freshPage({ timezoneId: 'Europe/Oslo' });
  await page.clock.setFixedTime(new Date('2026-10-26T23:30:00+01:00'));
  await page.goto(BASE);
  await page.evaluate(() => localStorage.setItem('checkins', JSON.stringify([{ date: new Date().toISOString(), mood: 3, note: '' }])));
  await page.goto(BASE + '#historikk');
  await page.reload();
  const days = await page.evaluate(() => {
    const out = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
      out.push(d.getDate());
    }
    return out;
  });
  assert(new Set(days).size === 14 && days[13] === 26 && days[12] === 25 && days[11] === 24, days.join(','));
  const labels = await page.$$eval('#barLabels span', (s) => s.map((x) => x.textContent));
  assert(labels[13] === '26' && labels[11] === '24', labels.join(','));
  assert(await page.locator('.bar.today:not(.empty)').count() === 1, 'dagens søyle mangler');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Små grep: av/på og prunes ikke dagens', async () => {
  const { ctx, page } = await freshPage();
  await page.goto(BASE + '#grep');
  await page.locator('.action-card button').nth(3).click();
  assert(await page.locator('.action-card.done').count() === 1, 'ble ikke merket');
  await page.locator('.action-card button').nth(3).click();
  assert(await page.locator('.action-card.done').count() === 0, 'ble ikke avmerket');
  assert(await page.isVisible('a[href="tel:116123"]'), 'hjelpetelefon mangler');
  await ctx.close();
});

await test('Eksport laster ned .txt med innhold', async () => {
  const { ctx, page } = await freshPage();
  await page.goto(BASE);
  await page.click('.mood-btn[data-mood="5"]');
  await page.fill('#note', 'linje en\nlinje to');
  await page.click('#saveBtn');
  await page.click('.nav button[data-goto="historikk"]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')]);
  assert(/^pusterom-historikk-\d{4}-\d{2}-\d{2}\.txt$/.test(dl.suggestedFilename()), dl.suggestedFilename());
  const body = fs.readFileSync(await dl.path(), 'utf8');
  assert(body.includes('5/5 rolig') && body.includes('    linje to'), body);
  await ctx.close();
});

await test('Slett krever to trykk', async () => {
  const { ctx, page } = await freshPage();
  await page.goto(BASE);
  await page.click('.mood-btn[data-mood="3"]');
  await page.click('#saveBtn');
  await page.click('.nav button[data-goto="historikk"]');
  await page.click('#clearBtn');
  assert(await page.locator('.history-item').count() === 1, 'slettet etter ett trykk');
  await page.click('#clearBtn');
  assert(await page.locator('.history-item').count() === 0, 'ikke slettet etter to trykk');
  await ctx.close();
});

await test('Pusterom: én runde telles og lagres', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.clock.install();
  await page.goto(BASE + '#pusterom');
  await page.click('#breathBtn');
  assert((await page.textContent('#breathText')).includes('Pust inn'), 'starter ikke');
  await page.clock.runFor(4100);
  assert((await page.textContent('#breathText')).includes('Hold'), 'ikke hold');
  await page.clock.runFor(8000);
  assert((await page.textContent('#breathCount')).includes('1 runde'), 'runde ikke telt');
  await page.click('#breathBtn');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('breathSessions')));
  assert(saved.length === 1 && saved[0].rounds === 1, JSON.stringify(saved));
  // Boks-mønster: fire steg
  await page.click('.pattern-btn[data-pattern="boks"]');
  await page.click('#breathBtn');
  await page.clock.runFor(4100);
  await page.clock.runFor(4000);
  assert((await page.textContent('#breathText')).includes('Pust ut'), 'boks steg 3 feil');
  // Bytte side stopper pusten
  await page.click('.nav button[data-goto="hjem"]');
  assert(await page.textContent('#breathBtn') === 'Start', 'pust fortsatte i bakgrunnen');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Isolation Mirror: prompt, kopier, tilbake', async () => {
  const { ctx, page, errors } = await freshPage({ permissions: ['clipboard-read', 'clipboard-write'] });
  await page.goto(BASE + '#historikk');
  await page.click('a.mirror-link');
  await page.fill('#note', 'Ingen har ringt\npå tre dager');
  await page.click('#generateBtn');
  const prompt = await page.textContent('#labprompt');
  assert(prompt.includes('PROBLEM: Isolasjon. Ingen har ringt på tre dager\nBRUKER'), prompt);
  assert(await page.locator('#protocol li').count() === 3, 'protokoll mangler');
  await page.click('#copyBtn');
  await page.waitForFunction(() => document.getElementById('copyStatus').textContent.length > 0);
  assert((await page.evaluate(() => navigator.clipboard.readText())).startsWith('Grok-bot runtime'), 'utklippstavle tom');
  await page.click('a.back');
  assert(await page.isVisible('#page-hjem'), 'tilbake-lenke feiler');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Service worker registreres over http', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto(BASE);
  const ok = await page.evaluate(async () => !!(await navigator.serviceWorker.ready));
  assert(ok, 'ingen SW');
  assert(!errors.length, errors.join('; '));
  await ctx.close();
});

await test('Fungerer fra file:// (ingen server)', async () => {
  const { ctx, page, errors } = await freshPage();
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await page.click('.mood-btn[data-mood="4"]');
  await page.click('#saveBtn');
  await page.click('.nav button[data-goto="historikk"]');
  assert(await page.locator('.history-item').count() === 1, 'lagring feilet på file://');
  const real = errors.filter((e) => !/manifest/i.test(e));
  assert(!real.length, real.join('; '));
  await ctx.close();
});

if (process.env.SHOTS) {
  fs.mkdirSync(process.env.SHOTS, { recursive: true });
  for (const scheme of ['light', 'dark']) {
    const { ctx, page } = await freshPage({ colorScheme: scheme, deviceScaleFactor: 2 });
    await page.goto(BASE);
    await page.evaluate(() => {
      const now = Date.now(), D = 864e5, notes = ['Tung morgen. Kom meg ut likevel.', '', 'Pustet før møtet. Hjalp.', ''];
      const list = [];
      [0, 1, 2, 4, 5, 7, 8, 9, 11, 13].forEach((d, i) => list.push({ date: new Date(now - d * D).toISOString(), mood: [4, 3, 2, 3, 4, 5, 3, 2, 3, 4][i], note: notes[i % 4] }));
      localStorage.setItem('checkins', JSON.stringify(list));
      localStorage.setItem('breathSessions', JSON.stringify([{ date: new Date().toISOString(), pattern: 'rolig', rounds: 5 }]));
    });
    for (const p of ['hjem', 'pusterom', 'grep', 'historikk']) {
      await page.goto(BASE + '#' + p);
      await page.reload();
      await page.screenshot({ path: path.join(process.env.SHOTS, `${scheme}-${p}.png`), fullPage: true });
    }
    await page.goto(BASE + 'isolation-mirror.html');
    await page.fill('#note', 'Ingen har ringt på tre dager');
    await page.click('#generateBtn');
    await page.screenshot({ path: path.join(process.env.SHOTS, `${scheme}-mirror.png`), fullPage: true });
    await ctx.close();
  }
}

await browser.close();
server.close();
console.log(results.join('\n'));
console.log(failed ? `\n${failed} feilet` : '\nAlt grønt.');
process.exit(failed ? 1 : 0);
