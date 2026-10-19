// Kjør: node products/01-kjolerom/test/kjolerom.test.mjs
// Krever playwright (globalt installert i Claude-containeren, ellers: npm i -D playwright).
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(path.join(process.execPath, '../../lib/node_modules/playwright'))); }

const here = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.join(here, '..', 'kjolerom.html');
const url = pathToFileURL(appPath).href;
const shots = path.join(here, '..', 'bilder');
fs.mkdirSync(shots, { recursive: true });

let failed = 0, passed = 0;
async function t(name, fn) {
  try { await fn(); passed++; console.log('  ✓ ' + name); }
  catch (e) { failed++; console.log('  ✗ ' + name + '\n    ' + (e.stack || e).toString().split('\n').slice(0, 3).join('\n    ')); }
}
function eq(a, b, msg) { if (a !== b) throw new Error(`${msg}: forventet ${JSON.stringify(b)}, fikk ${JSON.stringify(a)}`); }
function ok(v, msg) { if (!v) throw new Error(msg); }

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
const page = await ctx.newPage();
const errors = [];
const requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) requests.push(r.url()); });

await page.clock.install({ time: new Date('2026-10-19T14:00:00+02:00') });
await page.goto(url);

console.log('Kjølerom');

await t('laster uten JS-feil og med tom tilstand', async () => {
  eq(errors.length, 0, 'JS-feil ' + errors.join('; '));
  ok(await page.getByText('Kjølerommet er tomt').isVisible(), 'tom-tekst mangler');
});

await t('annuitet matcher referanse (10 000 kr, 24,9 %, 12 mnd)', async () => {
  const m = await page.evaluate(() => window.__kjolerom.annuity(10000, 24.9, 12));
  // referanse fra okonomi/kost.py
  ok(Math.abs(m - 949.96) < 0.01, 'månedsbeløp ' + m);
});

await t('delbetaling viser ekte kostnad i forhåndsvisning', async () => {
  await page.fill('#wTitle', 'Lego Technic 42171');
  await page.fill('#wPrice', '2499');
  await page.selectOption('#wPay', 'delbetaling');
  ok(await page.locator('#installRow').isVisible(), 'delbetaling-felt skjult');
  await page.selectOption('#wPay', 'debet');
  ok(!(await page.locator('#installRow').isVisible()), 'delbetaling-felt synlig for debet');
  await page.selectOption('#wPay', 'delbetaling');
  const txt = await page.locator('#costPreview').innerText();
  ok(/Ekte kostnad/.test(txt), 'mangler ekte kostnad: ' + txt);
});

await t('legger ønske i fryseren med 48t nedtelling', async () => {
  await page.fill('#wWhy', 'Jeg trenger noe å bygge med hendene.');
  await page.click('button[type=submit]');
  const card = page.locator('#frozenList .card').first();
  ok(await card.isVisible(), 'kort mangler');
  ok(/48 t 0 min igjen/.test(await card.innerText()), 'nedtelling: ' + await card.innerText());
  eq(await card.locator('[data-act=bought]').count(), 0, '«Fortsatt ja» skal ikke finnes før tint');
  await page.screenshot({ path: path.join(shots, 'app-fryser.png'), fullPage: true });
});

await t('overlevering: ny del + lapp vises i banner', async () => {
  await page.click('nav button[data-page=overlevering]');
  await page.fill('#newPart', 'Lille');
  await page.click('#addPart');
  await page.click('.part-btn:has-text("Lille")');
  await page.fill('#hoNote', 'Lego ligger i kjølerommet. Ikke kjøp før søndag.');
  await page.click('#hoSave');
  await page.screenshot({ path: path.join(shots, 'app-overlevering.png'), fullPage: true });
  await page.click('nav button[data-page=fryser]');
  const b = await page.locator('#handoverBanner').innerText();
  ok(/Lille/.test(b) && /Ikke kjøp før søndag/.test(b), 'banner: ' + b);
});

await t('etter 48t: tint, avgjør, logger hvem', async () => {
  await page.clock.fastForward('48:00:01');
  await page.reload();
  const card = page.locator('#thawedList .card').first();
  ok(await card.evaluate(e => e.classList.contains('thawed')), 'ikke tint');
  ok(/1<\/b> ønske er tint|1 ønske er tint/.test(await page.locator('#handoverBanner').innerText()), 'banner sier ikke tint');
  await page.screenshot({ path: path.join(shots, 'app-tint.png'), fullPage: true });
  await card.locator('[data-act=released]').click();
  const s = await page.evaluate(() => window.__kjolerom.state.wishes[0]);
  eq(s.status, 'released', 'status');
  const lille = await page.evaluate(() => window.__kjolerom.state.parts.find(p => p.name === 'Lille').id);
  eq(s.decidedBy, lille, 'decidedBy');
});

await t('regnskap viser sluppet beløp og unngått rente', async () => {
  await page.click('nav button[data-page=regnskap]');
  eq((await page.locator('#sReleased').innerText()).replace(/\s/g, ' '), '2 499 kr', 'sluppet');
  const avoided = Number((await page.locator('#sInterest').innerText()).replace(/\D/g, ''));
  ok(avoided > 300 && avoided < 1000, 'unngått ' + avoided);
  await page.screenshot({ path: path.join(shots, 'app-regnskap.png'), fullPage: true });
});

await t('frys til: nytt vindu, teller re-frys', async () => {
  await page.click('nav button[data-page=fryser]');
  await page.fill('#wTitle', 'Robotstøvsuger');
  await page.fill('#wPrice', '4990');
  await page.selectOption('#wPay', 'kort');
  await page.click('button[type=submit]');
  await page.clock.fastForward('49:00:00');
  await page.reload();
  await page.locator('#thawedList .card [data-act=refreeze]').first().click();
  const w = await page.evaluate(() => window.__kjolerom.state.wishes.find(x => x.title === 'Robotstøvsuger'));
  eq(w.refreezes, 1, 'refreezes');
  eq(w.status, 'frozen', 'status');
});

await t('rentedager vises når gjeld er satt', async () => {
  await page.click('nav button[data-page=kappe]');
  await page.fill('#setDebt', '250000'); await page.locator('#setDebt').dispatchEvent('change');
  await page.fill('#setDebtApr', '18'); await page.locator('#setDebtApr').dispatchEvent('change');
  await page.fill('#sentence', 'Vi har det vi trenger i kveld.');
  ok((await page.locator('#labelText').innerText()).includes('Vi har det vi trenger'), 'etikett');
  await page.screenshot({ path: path.join(shots, 'app-kappe.png'), fullPage: true });
  await page.click('nav button[data-page=fryser]');
  await page.fill('#wPrice', '1000');
  const txt = await page.locator('#costPreview').innerText();
  // 250 000 * 18 % / 365 = 123,29 kr/dag → 1000 kr = 8,1 dager
  ok(/8,1 dager|8\.1 dager/.test(txt), 'rentedager: ' + txt);
});

await t('XSS: tittel rendres som tekst', async () => {
  await page.fill('#wTitle', '<img src=x onerror="window.__pwned=1">');
  await page.fill('#wPrice', '1');
  await page.selectOption('#wPay', 'debet');
  await page.click('button[type=submit]');
  eq(await page.evaluate(() => window.__pwned), undefined, 'XSS kjørte');
});

await t('eksport → import rundtur', async () => {
  const json = await page.evaluate(() => JSON.stringify(window.__kjolerom.state));
  const f = path.join(shots, '..', 'test', '.tmp-export.json');
  fs.writeFileSync(f, json);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  ok(await page.getByText('Kjølerommet er tomt').isVisible(), 'ikke tømt');
  await page.click('nav button[data-page=kappe]');
  await page.setInputFiles('#importFile', f);
  await page.waitForTimeout(100);
  const n = await page.evaluate(() => window.__kjolerom.state.wishes.length);
  eq(n, 3, 'antall ønsker etter import');
  fs.unlinkSync(f);
});

await t('ødelagt lagring krasjer ikke', async () => {
  await page.evaluate(() => localStorage.setItem('kjolerom.v1', '{not json'));
  await page.reload();
  await page.click('nav button[data-page=fryser]');
  ok(await page.getByText('Kjølerommet er tomt').isVisible(), 'ikke gjenopprettet');
});

await t('ingen skamspråk i UI', async () => {
  const html = fs.readFileSync(appPath, 'utf8').replace(/<script[\s\S]*?<\/script>/g, m => m.replace(/\/\/.*$/gm, ''));
  const visible = html.replace(/<style[\s\S]*?<\/style>/g, '').toLowerCase();
  for (const w of ['impuls', 'synd', 'dårlig', 'svak', 'avhengig', ' feil '])
    ok(!visible.includes(w), 'forbudt ord: ' + w);
});

await t('320px: ingen horisontal scroll', async () => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.click('nav button[data-page=fryser]');
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= 320, 'scrollWidth ' + sw);
});

await t('null nettverkskall', async () => { eq(requests.length, 0, 'kall: ' + requests.join(', ')); });
await t('ingen JS-feil gjennom hele kjøringen', async () => { eq(errors.length, 0, errors.join('; ')); });

await browser.close();
console.log(`\n${passed} bestått, ${failed} feilet`);
process.exit(failed ? 1 : 0);
