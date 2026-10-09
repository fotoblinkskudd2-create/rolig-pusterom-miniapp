/* Ende-til-ende-kontroll i ekte Chromium (Playwright). Kjør: node tests/e2e.js
 * Starter egen lokal server, så den kan stoppes midt i testen (offline-kontroll).
 */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
let pw;
try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }

const ROT = path.join(__dirname, '..');
const TYPER = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
function server(port) {
  const s = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p === '/') p = '/index.html';
    const f = path.join(ROT, p);
    if (!f.startsWith(ROT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPER[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => s.listen(port, '127.0.0.1', () => r(s)));
}

const resultater = [];
async function kontroll(navn, fn) {
  try { await fn(); resultater.push(['OK', navn]); console.log('OK   ' + navn); }
  catch (e) { resultater.push(['FEIL', navn, e.message]); console.log('FEIL ' + navn + '\n     ' + e.message.split('\n').slice(0, 4).join('\n     ')); }
}

(async () => {
  const PORT = 8765, URL0 = 'http://127.0.0.1:' + PORT + '/index.html';
  let srv = await server(PORT);
  const browser = await pw.chromium.launch();
  const ny = async (opt) => {
    const ctx = await browser.newContext(Object.assign({ viewport: { width: 375, height: 760 } }, opt || {}));
    const page = await ctx.newPage(); page.feil = [];
    page.on('pageerror', e => page.feil.push(e.message));
    return { ctx, page };
  };
  const tekst = p => p.locator('#tilbakemelding').innerText();
  const lagret = p => p.evaluate(() => JSON.parse(localStorage.getItem('smallWinsLab.framdrift')));

  let { ctx, page } = await ny();

  await kontroll('Start: én inngang «Prøv en oppgave» åpner SIG-01', async () => {
    await page.goto(URL0);
    assert.equal(await page.getByRole('button', { name: 'Prøv en oppgave' }).count(), 1);
    await page.getByRole('button', { name: 'Prøv en oppgave' }).click();
    assert.match(page.url(), /#\/oppgave\/SIG-01$/);
  });

  await kontroll('Feilforsøk gir «Prøv igjen.» med konkret regel og bevarer brettet', async () => {
    await page.getByRole('button', { name: 'Sjekk' }).click();
    const t = await tekst(page);
    assert.match(t, /Prøv igjen\./); assert.match(t, /NOT-porten får A = PÅ/); assert.match(t, /Se hva denne brikken gjør/);
    assert.equal(await page.locator('.bryter').getAttribute('aria-pressed'), 'true');
  });

  await kontroll('Korrekt løsning: «Det virket.» + «Du fant en løsning.» + forklaring; gjentatt trykk er trygt', async () => {
    await page.locator('.bryter').click();
    assert.match(await page.locator('.regler li').innerText(), /✓/);
    await page.getByRole('button', { name: 'Sjekk' }).dblclick();
    const t = await tekst(page);
    assert.match(t, /Det virket\./); assert.match(t, /Du fant en løsning\./); assert.match(t, /Hvorfor:/);
    assert.equal((await lagret(page)).løst['SIG-01'], true);
    await page.getByRole('button', { name: 'Neste oppgave →' }).click();
    assert.match(page.url(), /SIG-02/);
  });

  await kontroll('Alternativ løsning godtas (SIG-03 med bare B, REK-01 ■ ● ▲)', async () => {
    await page.goto(URL0 + '#/oppgave/SIG-03');
    await page.getByRole('button', { name: /Bryter B/ }).click();
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Det virket/);
    await page.goto(URL0 + '#/oppgave/REK-01'); // start: ▲ ● ■
    await page.getByRole('button', { name: /Plass 1: gul trekant/ }).click();
    await page.getByRole('button', { name: 'Flytt til høyre ▶' }).click();
    await page.getByRole('button', { name: 'Flytt til høyre ▶' }).click(); // ● ■ ▲
    await page.getByRole('button', { name: /Plass 2: rød firkant/ }).click();
    await page.getByRole('button', { name: '◀ Flytt til venstre' }).click(); // ■ ● ▲
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Det virket/);
    assert.deepEqual((await lagret(page)).forsøk['REK-01'], ['firkant', 'sirkel', 'trekant']);
  });

  await kontroll('Hint midt i forsøk bevarer forsøket; hint 2 og slutt', async () => {
    await page.goto(URL0 + '#/oppgave/REK-02');
    await page.getByRole('button', { name: /Plass 4: blå sirkel/ }).click();
    await page.getByRole('button', { name: '◀ Flytt til venstre' }).click();
    const før = (await lagret(page)).forsøk['REK-02'];
    await page.getByRole('button', { name: 'Hint 1 av 2' }).click();
    await page.getByRole('button', { name: 'Hint 2 av 2' }).click();
    assert.equal(await page.locator('.hint li').count(), 2);
    assert.ok(await page.getByRole('button', { name: 'Ingen flere hint' }).isDisabled());
    assert.deepEqual((await lagret(page)).forsøk['REK-02'], før);
    assert.equal((await lagret(page)).hint['REK-02'], 2);
  });

  await kontroll('Angre etter feil (FEI-01): feil bytte → Prøv igjen → Angre gir original', async () => {
    await page.goto(URL0 + '#/oppgave/FEI-01');
    await page.getByRole('button', { name: /Del 3: − 1/ }).click();
    await page.getByRole('button', { name: '× 3', exact: true }).click();
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Prøv igjen.*Maskinen gir 30\. Målet er 11/s);
    assert.match(await page.locator('.maskin').innerText(), /✎ byttet/);
    await page.getByRole('button', { name: '↶ Angre' }).click();
    assert.equal(await page.locator('.merkelapp').count(), 0);
    if (!(await page.locator('.valg').count())) await page.getByRole('button', { name: /Del 3: − 1/ }).click();
    await page.getByRole('button', { name: '+ 1', exact: true }).click();
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Det virket/);
  });

  await kontroll('Ruter: ulovlig steg forklares, angre fjerner siste steg, reload gjenoppretter', async () => {
    await page.goto(URL0 + '#/oppgave/RUT-02');
    await page.getByRole('button', { name: 'Gå opp' }).click();
    assert.match(await tekst(page), /utenfor/);
    await page.getByRole('button', { name: 'Gå ned' }).click();
    assert.match(await tekst(page), /stein/);
    await page.getByRole('button', { name: /Rad 2, kolonne 2/ }).click();
    assert.match(await tekst(page), /skrå/);
    for (const r of ['Gå til høyre', 'Gå til høyre', 'Gå til høyre']) await page.getByRole('button', { name: r }).click();
    await page.getByRole('button', { name: '↶ Angre' }).click();
    assert.equal((await lagret(page)).forsøk['RUT-02'].sti.length, 3);
    await page.reload();
    assert.match(await page.locator('h1').innerText(), /Korteste vei/);
    assert.match(await page.locator('.brett').innerText(), /Steg: 2/);
    await page.goto(URL0 + '#/');
    assert.match(await page.locator('.hjem').innerText(), /fortsetter på RUT-02/);
    // fullfør korteste rute fra (0,2): ned, ned, høyre, ned
    await page.getByRole('button', { name: 'Prøv en oppgave' }).click();
    for (const r of ['Gå ned', 'Gå ned', 'Gå til høyre', 'Gå ned']) await page.getByRole('button', { name: r }).click();
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Det virket/);
  });

  await kontroll('Bytte tema og komme tilbake bevarer forsøket (MON-02)', async () => {
    await page.goto(URL0 + '#/oppgave/MON-02');
    await page.getByRole('button', { name: 'Legg inn fylt trekant' }).click();
    await page.goto(URL0 + '#/tema/ruter');
    await page.getByRole('link', { name: 'Mønstre' }).click();
    await page.getByRole('link', { name: /MON-02/ }).click();
    assert.match(await page.getByRole('button', { name: /Plass 6:/ }).getAttribute('aria-label'), /fylt trekant/);
    await page.getByRole('button', { name: 'Legg inn fylt firkant' }).click();
    await page.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await tekst(page), /Det virket/);
  });

  await kontroll('Tastatur uten mus: REK-03 og RUT-01 løses med Tab/piltaster/Enter', async () => {
    await page.goto(URL0 + '#/oppgave/REK-03'); // start ■ ★ ● ▲  → mål ● ▲ ★ ■
    const kort = id => page.locator('[data-fokus="kort-' + id + '"]');
    await kort('firkant').focus();
    for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight'); // ★ ● ▲ ■
    await kort('stjerne').focus();
    await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); // ● ▲ ★ ■
    assert.equal(await page.evaluate(() => document.activeElement.dataset.fokus), 'kort-stjerne');
    await page.locator('[data-fokus="sjekk"]').focus(); await page.keyboard.press('Enter');
    assert.match(await tekst(page), /Det virket/);
    await page.goto(URL0 + '#/oppgave/RUT-01');
    await page.locator('[data-fokus="rutenett"]').focus();
    for (const k of ['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowRight', 'ArrowRight', 'ArrowRight']) await page.keyboard.press(k);
    await page.keyboard.press('Tab'); // fokus videre til en pil-knapp, deretter Sjekk via fokus
    await page.locator('[data-fokus="sjekk"]').focus(); await page.keyboard.press('Enter');
    assert.match(await tekst(page), /Det virket/);
  });

  await kontroll('Alle 30 oppgaver: eksempelløsning gir «Det virket.» i grensesnittet, start gir «Prøv igjen.»', async () => {
    const D = require('../js/data.js');
    for (const t of D.OPPGAVER) {
      await page.goto(URL0 + '#/oppgave/' + t.id);
      await page.getByRole('button', { name: 'Start på nytt' }).click();
      await page.getByRole('button', { name: 'Sjekk' }).click();
      assert.match(await tekst(page), /Prøv igjen/, t.id + ' start');
      await page.evaluate(([id, s]) => { const d = JSON.parse(localStorage.getItem('smallWinsLab.framdrift')); d.forsøk[id] = s; localStorage.setItem('smallWinsLab.framdrift', JSON.stringify(d)); }, [t.id, t.eksempelløsning]);
      await page.reload();
      await page.getByRole('button', { name: 'Sjekk' }).click();
      assert.match(await tekst(page), /Det virket/, t.id + ' eksempel');
    }
    assert.equal(Object.keys((await lagret(page)).løst).length >= 30, true);
  });

  await kontroll('Ugyldig import avvises og bevarer gjeldende data', async () => {
    const før = await lagret(page);
    await page.goto(URL0 + '#/framdrift');
    await page.locator('#importtekst').fill('{"versjon":1,"løst":{"SIG-01":true},"forsøk":{"SIG-01":{"A":"<script>alert(1)</script>"}}}');
    await page.getByRole('button', { name: 'Hent fra tekst' }).click();
    assert.match(await page.locator('.tilbakemelding').innerText(), /avvist\. Ingenting er endret\. Forsøket på SIG-01/);
    assert.deepEqual(await lagret(page), før);
    await page.locator('#importtekst').fill('ikke json');
    await page.getByRole('button', { name: 'Hent fra tekst' }).click();
    assert.match(await page.locator('.tilbakemelding').innerText(), /avvist/);
    assert.deepEqual(await lagret(page), før);
  });

  await kontroll('Eksport → slett alt → import gir tilbake løste, forsøk, hint og gjeldende', async () => {
    await page.goto(URL0 + '#/oppgave/RUT-03');
    await page.getByRole('button', { name: 'Start på nytt' }).click();
    await page.getByRole('button', { name: 'Gå til høyre' }).click();
    await page.goto(URL0 + '#/framdrift');
    const før = await lagret(page);
    const [nedlasting] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /Last ned framdrift/ }).click()]);
    const fil = await nedlasting.path(); const eksport = fs.readFileSync(fil, 'utf8');
    assert.equal(nedlasting.suggestedFilename(), 'small-wins-lab-framdrift.json');
    await page.getByRole('button', { name: 'Slett all framdrift …' }).click();
    await page.getByRole('button', { name: 'Ja, slett all framdrift' }).click();
    assert.equal(Object.keys((await lagret(page)).løst).length, 0);
    await page.locator('#importfil').setInputFiles(fil);
    await page.getByRole('button', { name: 'Hent fra fil' }).click();
    await page.waitForFunction(() => /hentet/.test(document.body.innerText));
    const etter = await lagret(page);
    assert.deepEqual(etter.løst, før.løst); assert.deepEqual(etter.forsøk, før.forsøk); assert.deepEqual(etter.hint, før.hint);
    assert.equal(etter.gjeldende, 'RUT-03');
    assert.ok(eksport.includes('"app": "small-wins-lab"'));
  });

  await kontroll('Ødelagt lagret forsøk: forståelig melding, resten reddes, oppgaven starter fra gyldig start', async () => {
    await page.evaluate(() => { const d = JSON.parse(localStorage.getItem('smallWinsLab.framdrift')); d.forsøk['SIG-02'] = { A: 'kanskje' }; d.hint['SIG-04'] = 99; localStorage.setItem('smallWinsLab.framdrift', JSON.stringify(d)); });
    await page.reload(); await page.goto(URL0 + '#/oppgave/SIG-02');
    assert.match(await page.locator('.banner').innerText(), /SIG-02 kunne ikke leses.*Resten er tatt vare på/s);
    assert.equal(await page.locator('.bryter[aria-pressed="false"]').count(), 2);
    const d = await lagret(page);
    assert.equal(d.forsøk['SIG-02'], undefined); assert.equal(d.hint['SIG-04'], undefined); assert.ok(Object.keys(d.løst).length >= 30);
    await page.getByRole('button', { name: 'Greit' }).click();
    assert.equal(await page.locator('.banner').count(), 0);
  });

  await kontroll('Helt ødelagt lagring (ikke JSON) gir melding og ny start', async () => {
    const { ctx: c2, page: p2 } = await ny();
    await p2.goto(URL0); await p2.evaluate(() => localStorage.setItem('smallWinsLab.framdrift', '{{{'));
    await p2.reload();
    assert.match(await p2.locator('.banner').innerText(), /kunne ikke leses/);
    await p2.getByRole('button', { name: 'Prøv en oppgave' }).click();
    assert.match(p2.url(), /SIG-01/); await c2.close();
  });

  await kontroll('Utilgjengelig localStorage: appen virker i minnet og sier at framdrift ikke lagres', async () => {
    const { ctx: c3, page: p3 } = await ny();
    await c3.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blokkert'); } }); });
    await p3.goto(URL0);
    assert.match(await p3.locator('.banner').innerText(), /lagres ikke på denne enheten/);
    await p3.getByRole('button', { name: 'Prøv en oppgave' }).click();
    await p3.locator('.bryter').click(); await p3.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await p3.locator('#tilbakemelding').innerText(), /Det virket/);
    await p3.goto(URL0 + '#/');
    assert.match(await p3.locator('.hjem').innerText(), /1 av 6/);
    assert.deepEqual(p3.feil, []); await c3.close();
  });

  await kontroll('Smal skjerm 320 px: ingen vannrett rulling på noen av de 30 oppgavene eller andre sider', async () => {
    const { ctx: c4, page: p4 } = await ny({ viewport: { width: 320, height: 640 } });
    const D = require('../js/data.js');
    for (const h of ['#/', '#/tema/rekkefølge', '#/framdrift'].concat(D.OPPGAVER.map(t => '#/oppgave/' + t.id))) {
      await p4.goto(URL0 + h);
      const b = await p4.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(b <= 320, h + ' bredde ' + b);
    }
    const små = await p4.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent && (b.getBoundingClientRect().height < 44 || b.getBoundingClientRect().width < 44)).map(b => b.textContent));
    assert.deepEqual(små, []);
    await p4.goto(URL0.replace('index.html', 'print.html'));
    assert.ok(await p4.evaluate(() => document.documentElement.scrollWidth) <= 320, 'print.html');
    await c4.close();
  });

  await kontroll('Utskrift: 30 kort, fasit i egen del med sideskift, skjermknapper skjult', async () => {
    await page.goto(URL0.replace('index.html', 'print.html'));
    await page.emulateMedia({ media: 'print' });
    assert.equal(await page.locator('.oppgavekort').count(), 30);
    assert.equal(await page.locator('.fasitpost').count(), 30);
    assert.equal(await page.locator('.skjerm').isVisible(), false);
    assert.equal(await page.locator('.fasitdel').evaluate(e => getComputedStyle(e).breakBefore), 'page');
    const kortTekst = await page.locator('#kort').innerText();
    assert.ok(!/Eksempel:/.test(kortTekst), 'fasit lekker ikke inn i kortene');
    for (const id of ['SIG-06', 'REK-06', 'MON-06', 'RUT-06', 'FEI-06']) assert.ok(kortTekst.includes(id));
    const pdf = await page.pdf({ format: 'A4' });
    fs.writeFileSync(path.join(ROT, 'docs', 'oppgavekort.pdf'), pdf);
    assert.ok(pdf.length > 20000);
    await page.emulateMedia({ media: 'screen' });
  });

  await kontroll('file:// uten server: appen og utskriften virker', async () => {
    const { ctx: c5, page: p5 } = await ny();
    await p5.goto('file://' + path.join(ROT, 'index.html') + '#/oppgave/SIG-02');
    await p5.locator('.bryter').first().click(); await p5.locator('.bryter').nth(1).click();
    await p5.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await p5.locator('#tilbakemelding').innerText(), /Det virket/);
    await p5.goto('file://' + path.join(ROT, 'print.html'));
    assert.equal(await p5.locator('.oppgavekort').count(), 30);
    assert.deepEqual(p5.feil, []); await c5.close();
  });

  await kontroll('Offline: service worker cacher; server stoppet + nett av → reload, oppgave, utskrift virker', async () => {
    const { ctx: c6, page: p6 } = await ny();
    await p6.goto(URL0);
    await p6.evaluate(() => navigator.serviceWorker.ready.then(() => true));
    await p6.reload(); // nå kontrollert av service worker
    assert.equal(await p6.evaluate(() => !!navigator.serviceWorker.controller), true);
    await new Promise(r => srv.close(r)); srv = null;
    await c6.setOffline(true);
    await p6.reload();
    await p6.getByRole('button', { name: 'Prøv en oppgave' }).click();
    await p6.locator('.bryter').click(); await p6.getByRole('button', { name: 'Sjekk' }).click();
    assert.match(await p6.locator('#tilbakemelding').innerText(), /Det virket/);
    await p6.goto(URL0.replace('index.html', 'print.html'));
    assert.equal(await p6.locator('.oppgavekort').count(), 30);
    // kontroll av at serveren faktisk er nede
    const nede = await new Promise(r => http.get('http://127.0.0.1:' + PORT + '/index.html', () => r(false)).on('error', () => r(true)));
    assert.equal(nede, true);
    await c6.close();
  });

  await kontroll('Ingen JavaScript-feil i hovedkonteksten', async () => { assert.deepEqual(page.feil, []); });

  await browser.close(); if (srv) srv.close();
  const feil = resultater.filter(r => r[0] === 'FEIL');
  console.log('\n' + (resultater.length - feil.length) + ' av ' + resultater.length + ' ende-til-ende-kontroller bestått.');
  fs.writeFileSync(path.join(ROT, 'docs', 'e2e-resultat.txt'), new Date().toISOString() + '\n' + resultater.map(r => r.join('  ')).join('\n') + '\n');
  process.exit(feil.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
