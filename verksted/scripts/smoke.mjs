// Røyktest: åpner hub + alle apper i iPhone-størrelse, klikker gjennom kjerneflyter, feiler på konsollfeil.
// Kjør: npm run build && node scripts/smoke.mjs  (starter egen statisk server)
import { createRequire } from 'node:module';
import { execSync, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { APPS } from '../src/registry.js';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }
const SHOTS = process.env.SHOTS || 'shots';
mkdirSync(SHOTS, { recursive: true });

const server = spawn('npx', ['http-server', 'dist', '-p', '4599', '-s', '-c-1'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const base = 'http://localhost:4599/';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: 'dark', locale: 'nb-NO' });
await ctx.route(/hvakosterstrommen\.no/, (route) => {
  const d = route.request().url().match(/(\d{4})\/(\d{2})-(\d{2})_/);
  const rows = [];
  for (let h = 0; h < 24; h++) for (let q = 0; q < 4; q++) {
    const s = new Date(+d[1], +d[2] - 1, +d[3], h, q * 15);
    rows.push({ NOK_per_kWh: 0.4 + Math.sin(h / 3) * 0.3 + (h > 16 && h < 20 ? 0.8 : 0), EUR_per_kWh: 0, EXR: 11.5, time_start: s.toISOString(), time_end: new Date(s.getTime() + 900000).toISOString() });
  }
  route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(rows) });
});
const errors = [];
const page = await ctx.newPage();
page.on('pageerror', (e) => errors.push(`${page.url()}: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && errors.push(`${page.url()}: ${m.text()}`));
page.on('dialog', (d) => d.accept());

const shot = (n) => page.screenshot({ path: `${SHOTS}/${n}.png` });
const go = async (path) => { await page.goto(base + path); await page.waitForSelector('#root > *'); };
const click = (text) => page.getByRole('button', { name: text, exact: true }).first().click();
const check = async (label, cond) => { if (!(await cond)) errors.push('FEIL: ' + label); else console.log('ok  ', label); };

await go(''); await shot('00-hub');
await check('hub viser 10 apper', page.locator('a.card').count().then((n) => n === 10));

// Abo-Liket
await go('apps/abo-liket/');
await click('+ Legg til'); await click('Netflix'); await click('Lagre');
await click('+ Legg til'); await page.getByPlaceholder('Netflix').fill('Viaplay'); await page.getByPlaceholder('159').fill('449'); await click('Lagre');
await check('abo: månedssum 608', page.getByText('608').first().isVisible());
await shot('01-abo-liket');
await click('Drep'); await click('Drept');
await check('abo: drept-lista', page.getByText('Gjenoppliv').first().isVisible());

// Dump
await go('apps/dump/');
await page.locator('textarea').fill('Ring tannlegen'); await page.keyboard.press('Enter');
await page.locator('textarea').fill('Betal strøm\nKjøp melk'); await click('Dump');
await check('dump: 3 åpne', page.locator('ul.list li').count().then((n) => n === 3));
await shot('02-dump');
await click('Én ting'); await click('Ferdig');
await go('apps/dump/?add=Fra%20Siri');
await check('dump: ?add= virker', page.getByText('Fra Siri').isVisible());

// Kvitt
await go('apps/kvitt/');
await click('+ Ny'); await page.getByPlaceholder('Vaskemaskin').fill('Vaskemaskin'); await page.getByPlaceholder('Elkjøp').fill('Elkjøp');
await page.locator('.sheet input[inputmode=decimal]').fill('7990'); await click('5 år – skal vare lenge'); await click('Lagre');
await check('kvitt: 5 år igjen', page.getByText(/4 år 11 mnd igjen|5 år 0 mnd igjen/).isVisible());
await page.getByText('Vaskemaskin').first().click(); await page.locator('.sheet textarea').fill('Lekker vann');
await check('kvitt: reklamasjon', page.getByText('Lag reklamasjon', { exact: false }).isVisible());
await shot('03-kvitt');

// Splitt
await go('apps/splitt/');
await page.getByPlaceholder(/Ny gruppe/).fill('Hyttetur'); await click('Lag');
for (const n of ['Ola', 'Kari', 'Per']) { await page.getByPlaceholder('Legg til navn').fill(n); await click('+'); }
await click('+ Utgift'); await page.getByPlaceholder(/Middag/).fill('Mat'); await page.locator('.sheet input[inputmode=decimal]').fill('900'); await click('Lagre');
await click('+ Utgift'); await page.getByPlaceholder(/Middag/).fill('Bensin'); await page.locator('.sheet input[inputmode=decimal]').fill('300');
await page.locator('.sheet .field', { hasText: 'Deles på' }).getByRole('button', { name: 'Kari' }).click(); await click('Lagre');
// Ola betalte 900 (alle tre) => +600; Ola betalte 300 delt Ola+Per (Kari av) => Ola +150, Per -150. Kari -300, Per -450.
await check('splitt: Per → Ola 450', page.getByText('450,00').first().isVisible());
await check('splitt: Kari → Ola 300', page.getByText('300,00').first().isVisible());
await shot('04-splitt');

// Doom-Brems
await go('apps/doom-brems/?app=Instagram');
await check('doom: brems vises', page.getByText('Hvorfor? Ærlig.').isVisible());
await shot('05-doom-brems');
await click('Ingen grunn. Lukk.');
await check('doom: logget', page.getByText('Logg').first().isVisible());

// Strømvakt
await go('apps/stromvakt/');
await page.waitForSelector('svg rect');
await check('strøm: graf', page.locator('svg rect').count().then((n) => n === 96));
await shot('06-stromvakt');

// Kjøpekarantene
await go('apps/karantene/');
await click('Jeg vil kjøpe noe …'); await page.locator('.sheet input').first().fill('Lego Millennium Falcon');
await page.locator('.sheet input[inputmode=decimal]').fill('8999'); await click('Lås inne');
await check('karantene: i buret', page.getByText('Lego Millennium Falcon').isVisible());
await shot('07-karantene');
await click('Delbetaling'); await page.locator('input').first().fill('10000');
await check('delbetaling: ekstra vises', page.getByText('Ekstra for å slippe å vente').isVisible());

// Gjeld-Snøball
await go('apps/snoball/');
await click('Legg inn første gjeld');
const addDebt = async (n, bal, rate, min) => {
  await page.getByPlaceholder(/Kredittkort/).fill(n);
  const ins = page.locator('.sheet input[inputmode=decimal]');
  await ins.nth(0).fill(bal); await ins.nth(1).fill(rate); await ins.nth(2).fill(min); await click('Lagre');
};
await addDebt('Kredittkort', '45000', '24', '1500');
await click('+ Legg til gjeld'); await addDebt('Klarna', '8000', '0', '700');
await click('+ Legg til gjeld'); await addDebt('Forbrukslån', '150000', '14', '3000');
await click('Plan');
await check('snøball: gjeldfri-dato', page.getByText('Gjeldfri').isVisible());
await shot('08-snoball');

// Brunstøy
await go('apps/brunstoy/');
await click('▶ Spill');
await check('brunstøy: spiller', page.getByText('■ Stopp').isVisible());
await page.getByPlaceholder(/Hva skal du gjøre/).fill('Skrive søknad'); await click('Start');
await check('brunstøy: økt', page.getByText('Skrive søknad').isVisible());
await shot('09-brunstoy');
await click('Ferdig');

// Systemtavla
await go('apps/systemtavla/');
for (const n of ['Vera', 'Lille']) { await click('+ Medlem'); await page.locator('.sheet input').first().fill(n); await click('Lagre'); }
await page.locator('.chip', { hasText: 'Vera' }).click();
await check('system: fremme', page.getByText(/Vera fremme i/).isVisible());
await click('Tavla'); await page.locator('textarea').fill('Husk tannlegen torsdag'); await click('Legg på tavla');
await click('Fremme');
await check('system: beskjed på forsiden', page.getByText('Husk tannlegen torsdag').isVisible());
await shot('10-systemtavla');

// Lys modus-skjermbilde av hub
await page.emulateMedia({ colorScheme: 'light' }); await go(''); await shot('00-hub-light');

await browser.close(); server.kill();
if (errors.length) { console.error('\n' + errors.join('\n')); process.exit(1); }
console.log(`\nAlle ${APPS.length} apper + hub OK`);
