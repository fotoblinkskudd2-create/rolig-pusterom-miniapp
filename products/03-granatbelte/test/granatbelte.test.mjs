// Kjør: node products/03-granatbelte/test/granatbelte.test.mjs
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
const url = pathToFileURL(path.join(prod, 'granatbelte.html')).href;
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
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
const errors = [], requests = [];
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('request', r => { if (!/^(file|blob|data):/.test(r.url())) requests.push(r.url()); });
await page.clock.install({ time: new Date('2026-10-19T02:40:00+02:00') });
await page.goto(url);
const lint = (s) => page.evaluate((x) => window.__granat.lint(x).map(i => i.rule), s);

console.log('Granatbelte');

await t('startutkast: eneste merknad er den kildeløse {{kunst}}', async () => {
  eq(await page.evaluate(() => window.__granat.lint(window.__granat.st.drafts[0].text).map(i => i.rule + ':' + i.hit)), ['kildelos:{{kunst}} = 3,1 mrd kr'], 'lint');
  await page.screenshot({ path: path.join(shots, 'app-skriv.png'), fullPage: true });
});

await t('lint: usikrede tall med enhet fanges, tokens og årstall ikke', async () => {
  eq(await lint('Jeg så 3,1 mrd forsvinne. 818 mill. 30 % og 2 499 kr. Vinden 53 mph. I 2024 skjedde det. {{bacon}}'),
    ['usikret', 'usikret', 'usikret', 'usikret', 'usikret'], 'tall');
});

await t('lint: intro, begge sider, filler, pen slutt, tredjeperson', async () => {
  eq(await lint('I dag tenkte jeg å skrive. Jeg er egentlig sint.\n\nTakk for at du leste.'), ['intro', 'filler', 'pen'], 'a');
  eq(await lint('Jeg ser det. På den ene siden er det fint.'), ['begge'], 'b');
  const third = 'Han gikk ut. ' + 'Vinden var kald og fjorden frøs. '.repeat(8);
  eq(await lint(third), ['jeg'], 'c');
  eq(await lint('Jeg ble faktiskert? Nei. Ganskeløs.'), [], 'ordgrenser'); // «faktiskert», «ganskeløs» er ikke filler
});

await t('lint: ukjent granat', async () => { eq(await lint('Jeg kastet {{finnesikke}}.'), ['ukjent'], 'ukjent'); });

await t('chip setter inn {{token}} ved markøren', async () => {
  await page.click('#newDraft');
  await page.fill('#draftTitle', 'Test');
  await page.fill('#editor', 'Jeg så  forsvinne.');
  await page.locator('#editor').evaluate(e => { e.selectionStart = e.selectionEnd = 7; });
  await page.click('[data-ins="bacon"]');
  await page.waitForTimeout(700);
  eq(await page.locator('#editor').inputValue(), 'Jeg så {{bacon}} forsvinne.', 'tekst');
});

await t('rå-modus: Backspace, Delete, klipp ut og overskriving blokkeres; skriving virker', async () => {
  await page.click('#rawBtn');
  const before = await page.locator('#editor').inputValue();
  await page.keyboard.press('End');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Home');
  await page.keyboard.press('Delete');
  eq(await page.locator('#editor').inputValue(), before, 'slettet i rå-modus');
  await page.keyboard.press('End');
  await page.keyboard.type(' Og så brant det.');
  ok((await page.locator('#editor').inputValue()).endsWith('Og så brant det.'), 'skriving blokkert');
  await page.locator('#editor').evaluate(e => { e.selectionStart = 0; e.selectionEnd = 3; });
  await page.keyboard.type('X');
  ok((await page.locator('#editor').inputValue()).startsWith('Jeg'), 'overskrev markering');
  ok(/RÅ 1[45]:\d\d/.test(await page.locator('#rawStatus').innerText()), 'status ' + await page.locator('#rawStatus').innerText());
  await page.screenshot({ path: path.join(shots, 'app-raa.png'), fullPage: true });
});

await t('etter fristen: sletting tillatt igjen, økt logget', async () => {
  await page.clock.fastForward('15:01');
  await page.waitForTimeout(400);
  ok(/Deadline/.test(await page.locator('#rawStatus').innerText()), 'ikke deadline');
  await page.locator('#editor').focus();
  await page.keyboard.press('End');
  await page.keyboard.press('Backspace');
  ok((await page.locator('#editor').inputValue()).endsWith('brant det'), 'kunne ikke slette etter frist');
  const s = await page.evaluate(() => window.__granat.st.sessions[0]);
  ok(s.min === 15 && s.words === 4 && s.done === true, JSON.stringify(s));
});

await t('ny granat uten kilde → automatisk uverifisert; duplikat avvises', async () => {
  await page.click('nav button[data-page=granater]');
  await page.fill('#cSlug', 'vind');
  await page.fill('#cValue', '53'); await page.fill('#cUnit', 'mph');
  await page.fill('#cClaim', 'vindkast ved Batsverk');
  await page.click('#cSave');
  eq(await page.evaluate(() => window.__granat.st.cards.find(c => c.slug === 'vind').trust), 'uverifisert', 'trust');
  await page.fill('#cSlug', 'vind'); await page.fill('#cValue', '1'); await page.fill('#cClaim', 'x');
  await page.click('#cSave');
  eq(await page.evaluate(() => window.__granat.st.cards.filter(c => c.slug === 'vind').length), 1, 'duplikat');
  await page.screenshot({ path: path.join(shots, 'app-granater.png'), fullPage: true });
});

await t('omdøping av granat oppdaterer tokens i tekstene', async () => {
  await page.click('[data-edit="bacon"]');
  await page.fill('#cSlug', 'triptyk');
  await page.click('#cSave');
  ok((await page.evaluate(() => window.__granat.st.drafts.find(d => d.title === 'Test').text)).includes('{{triptyk}}'), 'ikke omdøpt');
});

await t('XSS i påstand og lenke rendres ikke', async () => {
  await page.fill('#cSlug', 'xss'); await page.fill('#cValue', '1'); await page.fill('#cClaim', '<img src=x onerror="window.__p=1">');
  await page.fill('#cSource', 'x'); await page.fill('#cUrl', 'javascript:alert(1)');
  await page.click('#cSave');
  ok(await page.evaluate(() => !window.__granat.st.cards.some(c => c.slug === 'xss')), 'javascript:-lenke godtatt');
  await page.fill('#cUrl', 'https://example.org'); await page.click('#cSave');
  await page.click('nav button[data-page=skriv]');
  await page.fill('#editor', 'Jeg kastet {{xss}}.'); await page.waitForTimeout(700);
  await page.click('nav button[data-page=lint]');
  eq(await page.evaluate(() => window.__p), undefined, 'XSS');
});

await t('Markdown-eksport: fotnoter, KILDE MANGLER synlig', async () => {
  await page.click('nav button[data-page=skriv]');
  await page.selectOption('#draftSel', { label: 'Åtte-en-åtte' });
  await page.click('nav button[data-page=lint]');
  await page.screenshot({ path: path.join(shots, 'app-sjekk.png'), fullPage: true });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportMd')]);
  const f = path.join(tmp, 'ut.md'); await dl.saveAs(f);
  const md = fs.readFileSync(f, 'utf8');
  ok(dl.suggestedFilename() === 'atte-en-atte.md', dl.suggestedFilename());
  ok(md.includes('818 mill kr[^1]') && md.includes('818 kr[^2]'), 'tokens');
  ok(md.includes('3,1 mrd kr [KILDE MANGLER][^3]'), 'kildeløs ikke merket');
  ok(/\[\^3\]: KILDE MANGLER — brukt på visuell kunst i 2024/.test(md), 'fotnote 3');
  ok(/\[\^4\]: av utestående forbruksgjeld.*norges-bank\.no.*hentet 2026-10-19/.test(md), 'fotnote 4');
});

await t('utskrift av kort: ID-1-mål', async () => {
  await page.click('nav button[data-page=granater]');
  await page.evaluate(() => { window.print = () => { window.__printed = 1; }; });
  await page.click('#printBtn'); await page.waitForTimeout(100);
  await page.emulateMedia({ media: 'print' });
  const r = await page.locator('#printCards .pc').first().evaluate(e => { const b = e.getBoundingClientRect(); return [Math.round(b.width / 96 * 25.4 * 10) / 10, Math.round(b.height / 96 * 25.4 * 10) / 10]; });
  eq(r, [85.6, 54], 'mm');
  await page.emulateMedia({ media: 'screen' });
});

await t('eksport/import alt: rundtur, filtrerer ugyldige kort', async () => {
  await page.click('nav button[data-page=mer]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportAll')]);
  const f = path.join(tmp, 'alt.json'); await dl.saveAs(f);
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  j.cards.push({ slug: 'BAD SLUG', value: '1' }, { slug: 'okslug', value: 2 }, { slug: 'evil', value: '1', url: 'javascript:x' });
  fs.writeFileSync(f, JSON.stringify(j));
  const n = j.cards.length;
  await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.click('nav button[data-page=mer]');
  await page.setInputFiles('#importAll', f); await page.waitForTimeout(150);
  const cards = await page.evaluate(() => window.__granat.st.cards);
  eq(cards.length, n - 2, 'antall');
  eq(cards.find(c => c.slug === 'evil').url, '', 'javascript-url');
});

await t('320px uten horisontal scroll', async () => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const pg of ['skriv', 'lint', 'granater', 'mer']) {
    await page.click(`nav button[data-page=${pg}]`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 320, pg + ' ' + sw);
  }
});
await t('null nettverkskall (lenker klikkes ikke)', async () => ok(requests.length === 0, requests.join(', ')));
await t('ingen JS-feil', async () => ok(errors.length === 0, errors.join('; ')));

await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${passed} bestått, ${failed} feilet`);
process.exit(failed ? 1 : 0);
