// Funksjonelle sjekker for siste-ord.html.
// Kjør: NODE_PATH=$(npm root -g) node etterliv/test-siste-ord.cjs
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

const FILE = 'file://' + path.resolve(__dirname, 'siste-ord.html');
let pass = 0, fail = 0;
function check(name, ok, info) {
  if (ok) { pass++; console.log('ok   ' + name); }
  else { fail++; console.log('FEIL ' + name + (info !== undefined ? ' → ' + JSON.stringify(info) : '')); }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 375, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.goto(FILE);

  // 1 rensing
  const c = await page.evaluate(() => window.__sisteOrd.clean('  eh jeg er  stolt av deg ehm '));
  check('rensing fjerner «eh», retter stor bokstav og punktum', c === 'Jeg er stolt av deg.', c);

  // 2 start
  await page.fill('#sender', 'Erik');
  await page.fill('#signature', 'Pappa');
  await page.click('[data-mode="assistert"]');
  await page.click('#s-start [data-go="mottakere"]');
  check('går til mottakere', await page.isVisible('#s-mottakere'));

  // 3 maks tre mottakere
  for (const [n, r] of [['Kari', 'partner'], ['Ola', 'sønn'], ['Ingrid', 'datter']]) {
    await page.fill('#r-name', n); await page.fill('#r-rel', r); await page.click('#add-btn');
  }
  check('tre mottakere lagt til', (await page.locator('#recipient-list .letter-row').count()) === 3);
  check('fjerde mottaker blokkert', await page.isDisabled('#add-btn'));

  // 4 spørsmål for Kari
  await page.click('#s-mottakere [data-go="sporsmal"]');
  await page.click('#q-chips [data-pick]:has-text("Kari")');
  check('seks spørsmål vises', (await page.locator('#q-form textarea').count()) === 6);
  await page.fill('[data-answer="vite"]', 'eh du har vært det beste i livet mitt');
  await page.fill('[data-answer="minne"]', 'turen til lofoten i 2009 da det regnet hele uka');
  await page.fill('[data-answer="hilsen"]', 'glad i deg alltid');
  await page.click('#make-draft');
  const draft = await page.inputValue('#editor');
  check('utkast starter med hilsen og navn', draft.startsWith('Kjære Kari,'), draft);
  check('utkast inneholder egne ord, renset', draft.includes('Du har vært det beste i livet mitt.') && draft.endsWith('Pappa'), draft);
  check('egne ord 100 % i første utkast', (await page.textContent('#own-share')).includes('100 %'));

  // 5 godkjenning krever lagring og bekreftelse
  await page.fill('#editor', draft + '\n\nPS: husk å vanne tomatene');
  await page.check('#confirm');
  check('kan ikke godkjenne ulagret endring', await page.isDisabled('#approve'));
  const shareAfter = await page.textContent('#own-share');
  check('egne ord faller når nye ord legges til', !shareAfter.includes('100 %'), shareAfter);
  await page.click('#save-version');
  check('revisjon telles', (await page.textContent('#rev-badge')).includes('Revisjon 1'));
  await page.check('#confirm');
  await page.click('#approve');
  await page.waitForSelector('#reopen');
  const st = await page.evaluate(() => window.__sisteOrd.state());
  const kari = st.letters.find(l => l.name === 'Kari');
  check('godkjent med SHA-256', kari.approved && /^sha256:[0-9a-f]{64}$/.test(kari.approved.hash), kari.approved);
  check('editor låst etter godkjenning', await page.getAttribute('#editor', 'readonly') !== null);

  // 6 revisjoner utenfor pakken
  await page.click('nav [data-go="sporsmal"]');
  await page.click('#q-chips [data-pick]:has-text("Ola")');
  await page.fill('[data-answer="takk"]', 'takk for at du hjalp meg med båten');
  await page.click('#make-draft');
  for (let i = 1; i <= 3; i++) {
    await page.fill('#editor', (await page.inputValue('#editor')) + ' ' + i);
    await page.click('#save-version');
  }
  check('tredje revisjon merkes utenfor pakken', (await page.locator('.notice:has-text("utenfor pakken")').count()) === 1);

  // 7 vurdering
  await page.click('nav [data-go="utkast"]');
  await page.click('#d-chips [data-pick]:has-text("Kari")');
  await page.click('[data-rate="5"]');
  check('vurdering lagres', (await page.evaluate(() => window.__sisteOrd.state().letters[0].rating)) === 5);

  // 8 levering: bare godkjente
  await page.click('nav [data-go="levering"]');
  check('nedlasting bare for godkjent brev', (await page.locator('[data-txt]').count()) === 1);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-txt]')]);
  const tmp = path.join(os.tmpdir(), 'brev.txt');
  await dl.saveAs(tmp);
  check('nedlastet tekst = godkjent tekst', fs.readFileSync(tmp, 'utf8').trim() === kari.approved.text.trim());

  // 9 gjenoppretting fra lagring
  await page.reload();
  const st2 = await page.evaluate(() => window.__sisteOrd.state());
  check('tilstand overlever omlasting', st2.letters.length === 3 && !!st2.letters[0].approved);

  // 10 åpne for endring fjerner godkjenning
  await page.click('nav [data-go="utkast"]');
  await page.click('#d-chips [data-pick]:has-text("Kari")');
  await page.click('#reopen');
  check('åpning fjerner godkjenning', (await page.evaluate(() => window.__sisteOrd.state().letters[0].approved)) === null);

  // 11 måling-CSV
  await page.click('nav [data-go="maling"]');
  const [csvDl] = await Promise.all([page.waitForEvent('download'), page.click('#export-csv')]);
  await csvDl.saveAs(tmp);
  const csv = fs.readFileSync(tmp, 'utf8');
  check('CSV har én rad per brev', csv.trim().split('\n').length === 4, csv);

  // 12 sletting
  await page.click('#wipe');
  check('sletting tømmer alt', (await page.evaluate(() => window.__sisteOrd.state().letters.length)) === 0);

  // 13 XSS i navn
  await page.click('#s-start [data-go="mottakere"]');
  await page.fill('#r-name', '<img src=x onerror=window.__x=1>');
  await page.click('#add-btn');
  check('navn escapes', (await page.evaluate(() => window.__x)) === undefined);

  check('ingen JS-feil', errors.length === 0, errors);
  await browser.close();
  console.log(`\n${pass} ok, ${fail} feil`);
  process.exit(fail ? 1 : 0);
})();
