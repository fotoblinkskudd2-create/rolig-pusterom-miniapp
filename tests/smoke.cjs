// Røyktest for Pusterom. Sjekker at det README/RUN/HULL lover faktisk finnes i appen.
// Kjør: NODE_PATH=$(npm root -g) node tests/smoke.cjs   (krever Playwright, se RUN.md)
const path = require('path');
const fs = require('fs');
const os = require('os');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const url = (f) => 'file://' + path.join(root, f);

const results = [];
async function check(name, fn) {
  try { await fn(); results.push([true, name]); }
  catch (e) { results.push([false, name + ' -> ' + e.message.split('\n')[0]]); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ acceptDownloads: true });
  ctx.setDefaultTimeout(3000);
  const page = await ctx.newPage();
  const errors = [];
  const dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });

  await page.goto(url('index.html'));

  await check('ingen JS-feil ved lasting', async () => {
    assert(errors.length === 0, errors.join(' | '));
  });

  await check('lokal-first-linje synlig på Hjem', async () => {
    const t = await page.locator('#page-hjem').innerText();
    assert(/Alt blir på denne enheten/.test(t), 'mangler «Alt blir på denne enheten»');
  });

  await check('«Pust med meg» bytter side OG flytter nav-markering', async () => {
    await page.click('text=Pust med meg');
    assert(await page.isVisible('#page-pusterom'), 'pusterom ikke synlig');
    const active = await page.locator('.nav button.active').innerText();
    assert(/Pusterom/.test(active), 'nav aktiv = ' + JSON.stringify(active.trim()));
    assert(errors.length === 0, errors.join(' | '));
  });

  await check('lagring uten humør gir ingen alert()', async () => {
    await page.click('.nav button:has-text("Hjem")');
    await page.click('text=Lagre sjekk-inn');
    assert(dialogs.length === 0, 'alert: ' + dialogs.join(' | '));
    const t = await page.locator('#page-hjem').innerText();
    assert(/Velg hvordan du har det/.test(t), 'ingen synlig beskjed');
  });

  await check('sjekk-inn lagres og vises i historikk, note som tekst', async () => {
    await page.click('.mood-btn[data-mood="4"]');
    await page.fill('#note', '<b>fet</b> & greit');
    await page.click('text=Lagre sjekk-inn');
    await page.click('.nav button:has-text("Historikk")');
    const html = await page.locator('#historyList').innerHTML();
    assert(!/<b>fet<\/b>/.test(html), 'note tolket som HTML');
    const t = await page.locator('#historyList').innerText();
    assert(t.includes('<b>fet</b> & greit'), 'note ikke vist som tekst');
  });

  await check('export: «Ta historikken med deg» gir pusterom-historikk.txt', async () => {
    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 3000 }),
      page.click('text=Ta historikken med deg'),
    ]);
    assert(dl.suggestedFilename() === 'pusterom-historikk.txt', 'filnavn ' + dl.suggestedFilename());
    const p = path.join(os.tmpdir(), 'pusterom-smoke.txt');
    await dl.saveAs(p);
    const body = fs.readFileSync(p, 'utf8');
    assert(body.includes('<b>fet</b> & greit') && body.includes('4/5'), 'innhold mangler: ' + body.slice(0, 120));
  });

  await check('Isolation Mirror lenket fra Hjem', async () => {
    await page.click('.nav button:has-text("Hjem")');
    const href = await page.getAttribute('a[href="isolation-mirror.html"]', 'href', { timeout: 2000 });
    assert(href, 'ingen lenke');
  });

  await check('Isolation Mirror genererer Labben-prompt', async () => {
    const p2 = await ctx.newPage();
    const e2 = [];
    p2.on('pageerror', (e) => e2.push(e.message));
    await p2.goto(url('isolation-mirror.html'));
    await p2.fill('#note', 'testnote');
    await p2.click('text=Generer');
    const prompt = await p2.locator('#labprompt').innerText();
    assert(prompt.includes('/lab') && prompt.includes('testnote'), 'prompt mangler innhold');
    assert(e2.length === 0, e2.join(' | '));
  });

  await check('ingen JS-feil totalt', async () => {
    assert(errors.length === 0, errors.join(' | '));
  });

  await browser.close();
  let failed = 0;
  for (const [ok, name] of results) {
    if (!ok) failed++;
    console.log((ok ? 'OK   ' : 'FEIL ') + name);
  }
  console.log(`\n${results.length - failed}/${results.length} bestått`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
