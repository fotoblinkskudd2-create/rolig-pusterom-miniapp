// Kjør: node products/04-brevvakt/test/brevvakt.test.mjs
// Referanseverdier er regnet for hånd fra inkassoforskriften §§ 2-2/2-3 og Finanstilsynets rentetabell.
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const prod = path.join(here, '..');
const url = pathToFileURL(path.join(prod, 'brevvakt.html')).href;
const shots = path.join(prod, 'bilder');
const tmp = fs.mkdtempSync(path.join(here, '.tmp-'));

let failed = 0, passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + String(e.stack || e).split('\n').slice(0, 3).join('\n    ')); }
}
const ok = (v, m) => { if (!v) throw new Error(m); };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
const page = await ctx.newPage();
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!/^(file|blob|data):/.test(r.url())) requests.push(r.url()); });
await page.clock.install({ time: new Date('2026-05-10T10:00:00+02:00') });
await page.goto(url);
const B = (fn, ...a) => page.evaluate(([src, args]) => { const f = new Function('B', 'args', 'return (' + src + ')(B, ...args)'); return f(window.__brev, args); }, [fn.toString(), a]);

console.log('Brevvakt');

await t('salærtak forbruker, lett: trinnene i § 2-2', async () => {
  const caps = await B((b) => [500, 501, 1000, 2499, 2500, 2501, 10000, 10001, 50000, 250000, 250001].map(m => b.cap({ main: m })));
  eq(caps, [187.5, 262.5, 262.5, 300, 300, 600, 600, 1200, 1200, 2700, 5400], 'lett');
});

await t('tungt (§ 2-3), næring ×1,5, ikke-mva +25 %, avdrag +1 125', async () => {
  eq(await B((b) => b.cap({ main: 2499, tung: true })), 600, 'tung');
  eq(await B((b) => b.cap({ main: 300000, tung: true })), 10800, 'tung topp');
  eq(await B((b) => b.cap({ main: 2499, consumer: false })), 450, 'næring');
  eq(await B((b) => b.cap({ main: 2499, mva: false })), 375, 'mva');
  eq(await B((b) => b.cap({ main: 2499, avdrag: true })), 1425, 'avdrag');
});

await t('tungt salær først etter MER enn 28 dager', async () => {
  eq(await B((b) => [b.tungAllowed('2026-03-01', '2026-03-29'), b.tungAllowed('2026-03-01', '2026-03-30'), b.tungAllowed('', '2026-12-01')]), [false, true, false], 'dager');
});

await t('forsinkelsesrente over tre halvår = 1 212,60 kr', async () => {
  const r = await B((b) => b.forsinkelsesrente(10000, '2025-12-31', '2026-12-31'));
  eq(r.total, 1212.6, 'total');
  eq(r.parts.map(p => [p.days, p.rate]), [[1, 12.25], [181, 12], [183, 12.25]], 'perioder');
});

await t('rente før 2020 og etter tabellen flagges, ikke gjettes', async () => {
  const r = await B((b) => b.forsinkelsesrente(1000, '2019-12-01', '2027-02-01'));
  ok(r.unknownDays === 31 && r.beyondDays === 31, JSON.stringify([r.unknownDays, r.beyondDays]));
});

const LETTER = `BETALINGSOPPFORDRING
Saksnummer: 2026-48151
Kreditor: Lånebanken ASA
Hovedstol: 2 499,00
Forfallsdato: 01.03.2026
Purregebyr: 38,00
Varselgebyr: 38,00
Inkassosalær: 600,00
Forsinkelsesrente 12,00 %: 45,20
Å betale: 3 220,20
Betales innen: 15.05.2026`;

await t('utlesing av brevtekst: beløp, datoer, sak, type', async () => {
  const p = await B((b, txt) => b.parseLetter(txt), LETTER);
  eq(p, { ref: '2026-48151', main: 2499, due: '2026-03-01', geb: 76, fee: 600, rente: 45.2, frist: '2026-05-15', type: 'oppfordring' }, 'parse');
  eq(await B((b) => ['1.234,50', '1 234,-', 'kr 12 000', '99.90', '1.000.000'].map(b.parseAmount)), [1234.5, 1234, 12000, 99.9, 1000000], 'beløp');
});

await t('ende-til-ende: lim inn → sjekk → overkrav 301 kr (forbrukslån, ikke mva)', async () => {
  await page.fill('#paste', LETTER);
  await page.click('#parseBtn');
  ok(/Fant 7 felt/.test(await page.locator('#parseLine').innerText()), await page.locator('#parseLine').innerText());
  eq(await page.locator('#fOppfFrist').inputValue(), '2026-05-15', 'oppf-frist fra brev');
  await page.fill('#fCreditor', 'Lånebanken');
  await page.uncheck('#fMva');
  await page.click('#checkBtn');
  const v = await page.locator('#verdict').innerText();
  ok(/De krever 301,00 kr mer/.test(v.replace(/\s/g, ' ')), v);
  ok(/5 dager igjen/.test(await page.locator('#calmSummary').innerText()), 'frist');
  const L = await page.locator('#letter').innerText();
  ok(/inkassoforskriften §§ 2-1 og 2-2/.test(L) && /375,00 kr/.test(L.replace(/\s/g, ' ')) && /2026-48151/.test(L), 'brev');
  ok(/bestrider ikke hovedkravet/.test(L), 'hovedkrav-setning');
  await page.screenshot({ path: path.join(shots, 'app-svar.png'), fullPage: true });
});

await t('innenfor taket gir grønt og ingen innsigelse', async () => {
  await page.click('nav button[data-page=brev]');
  await page.fill('#fFee', '200'); await page.fill('#fGeb', '76');
  await page.click('#checkBtn');
  ok(/Innenfor taket/.test(await page.locator('#verdict').innerText()), 'ikke grønt');
  ok(await page.locator('#letterWrap').isHidden(), 'brev vises');
});

await t('for høy rente fanges', async () => {
  await page.click('nav button[data-page=brev]');
  await page.fill('#fRente', '120');
  await page.click('#checkBtn');
  ok(/De krever 61,49 kr mer/.test((await page.locator('#verdict').innerText()).replace(/\s/g, ' ')), await page.locator('#verdict').innerText()); // 120 − 57,51 − 1
});

await t('lagre sak, åpne igjen, .ics med varsel', async () => {
  await page.click('#saveCase');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#icsBtn')]);
  const f = path.join(tmp, 'f.ics'); await dl.saveAs(f);
  const ics = fs.readFileSync(f, 'utf8');
  ok(/DTSTART;VALUE=DATE:20260515/.test(ics) && /TRIGGER:-P3D/.test(ics), ics);
  await page.click('nav button[data-page=saker]');
  ok(/Lånebanken/.test(await page.locator('#caseList').innerText()), 'sak mangler');
  await page.reload();
  await page.click('nav button[data-page=saker]');
  await page.click('[data-open]');
  ok(/De krever/.test(await page.locator('#verdict').innerText()), 'gjenåpning');
});

await t('XSS i kreditornavn', async () => {
  await page.click('nav button[data-page=brev]');
  await page.fill('#fCreditor', '<img src=x onerror="window.__p=1">');
  await page.click('#checkBtn');
  eq(await page.evaluate(() => window.__p), undefined, 'XSS');
});

await t('regelsiden viser tabellen med kilde', async () => {
  await page.click('nav button[data-page=regler]');
  const r = await page.locator('#ruleCard').innerText();
  ok(/19\.12\.2025/.test(r) && /10 800,00 kr/.test(r.replace(/\s/g, ' ')), 'regler');
  await page.screenshot({ path: path.join(shots, 'app-regler.png'), fullPage: true });
});

await t('320px uten horisontal scroll', async () => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const pg of ['brev', 'svar', 'saker', 'regler']) {
    await page.click(`nav button[data-page=${pg}]`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 320, pg + ' ' + sw);
  }
});
await t('null nettverkskall', async () => ok(requests.length === 0, requests.join(', ')));
await t('ingen JS-feil', async () => ok(errors.length === 0, errors.join('; ')));

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} bestått, ${failed} feilet`);
process.exit(failed ? 1 : 0);
