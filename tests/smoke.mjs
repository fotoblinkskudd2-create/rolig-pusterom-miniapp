// Røyktest for Pusterom. Kjør: node tests/smoke.mjs
// Krever playwright (global eller lokal). Åpner index.html via file:// — slik RUN.md sier.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const root = resolve(import.meta.dirname, '..');
const url = pathToFileURL(resolve(root, 'index.html')).href;
function loadPlaywright() {
  const req = createRequire(import.meta.url);
  try { return req('playwright'); } catch {}
  const globalRoot = execSync('npm root -g').toString().trim();
  return createRequire(resolve(globalRoot, 'noop.js'))('playwright');
}
const { chromium } = loadPlaywright();
let failed = 0;
const check = (name, ok, extra = '') => {
  console.log((ok ? 'OK   ' : 'FEIL ') + name + (extra ? '  ' + extra : ''));
  if (!ok) failed++;
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ acceptDownloads: true, colorScheme: scheme, viewport: { width: 375, height: 740 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  let dialog = false;
  page.on('dialog', d => { dialog = true; d.dismiss(); });
  await page.goto(url);
  const tag = `[${scheme}]`;

  // WCAG-kontrast for alle knapper med tekst
  const lowContrast = await page.evaluate(() => {
    const lum = c => { const [r, g, b] = c.match(/\d+/g).slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    return [...document.querySelectorAll('#page-hjem .btn')].filter(el => {
      const cs = getComputedStyle(el);
      const [a, b] = [lum(cs.color), lum(cs.backgroundColor)].sort((x, y) => y - x);
      return (a + 0.05) / (b + 0.05) < 4.5;
    }).map(el => el.textContent.trim());
  });
  check(`${tag} knappekontrast ≥ 4.5`, lowContrast.length === 0, lowContrast.join(', '));
  check(`${tag} lokal-first-linje synlig`, await page.isVisible('text=Alt blir på denne enheten'));

  await page.click('text=Lagre sjekk-inn');
  check(`${tag} ingen alert() uten humør`, !dialog);
  check(`${tag} inline hint uten humør`, (await page.textContent('#saveMsg')).includes('Velg hvordan'));

  await page.click('text=Pust med meg');
  const active = await page.getAttribute('.nav button.active', 'data-page');
  check(`${tag} «Pust med meg» flytter nav`, active === 'pusterom', `aktiv=${active}`);

  await page.click('#breathBtn');
  await page.click('.nav button[data-page="grep"]');
  check(`${tag} pust stopper ved sidebytte`, (await page.textContent('#breathBtn')) === 'Start');

  await page.click('.nav button[data-page="historikk"]');
  check(`${tag} export skjult ved tom historikk`, !(await page.isVisible('#exportBtn')));

  await page.click('.nav button[data-page="hjem"]');
  await page.click('.mood-btn[data-mood="2"]');
  await page.fill('#note', '<img src=x onerror="window.__xss=1">tung dag');
  await page.click('text=Lagre sjekk-inn');
  await page.click('.nav button[data-page="historikk"]');
  check(`${tag} note escapes (ingen XSS)`, !(await page.evaluate(() => window.__xss)) && (await page.isVisible('text=tung dag')));

  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportBtn')]);
  const txt = readFileSync(await dl.path(), 'utf8');
  check(`${tag} export .txt`, dl.suggestedFilename() === 'pusterom-historikk.txt' && txt.includes('humør 2/5') && txt.includes('tung dag'));

  await page.click('.nav button[data-page="grep"]');
  await page.click('.action-card >> nth=0 >> button');
  const done = await page.evaluate(() => JSON.parse(localStorage.getItem('doneActions')));
  check(`${tag} små grep lagres`, Object.values(done).flat().includes(0));

  await page.evaluate(() => localStorage.setItem('checkins', '{ødelagt'));
  await page.reload();
  check(`${tag} tåler korrupt localStorage`, errors.length === 0, errors.join(' | '));

  if (scheme === 'dark') {
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(`${tag} mørk bakgrunn`, bg === 'rgb(26, 31, 28)', bg);
  }

  await page.click('.nav button[data-page="historikk"]');
  await page.click('text=Isolation Mirror');
  await page.fill('#note', 'ingen å snakke med');
  await page.click('text=Generer');
  check(`${tag} Mirror genererer Labben-prompt`, (await page.textContent('#labprompt')).includes('ingen å snakke med'));
  await page.click('#copyBtn');
  await page.waitForTimeout(200);
  check(`${tag} kopier gir tilbakemelding`, (await page.textContent('#copyBtn')) !== 'Kopier prompt');
  check(`${tag} ingen JS-feil`, errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.webmanifest'), 'utf8'));
check('manifest gyldig JSON med ikon', manifest.icons?.length > 0);
console.log(failed ? `\n${failed} feil` : '\nAlt grønt');
process.exit(failed ? 1 : 0);
