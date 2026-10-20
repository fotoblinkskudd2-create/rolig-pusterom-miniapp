// Ende-til-ende: ekte kjerne (devserver) + telefon-UI i Chromium. Kjøres fra firmware/:
//   make dev && node test/e2e.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKJERM = join(ROT, '..', 'render');
const PORT = 8049;
const K = 'testnokkel48';
const T0 = 1792503660000; // tir 20.10.2026 15:41 Oslo
const URL = `http://localhost:${PORT}`;
const LOGG = join(ROT, 'build', 'e2e.jsonl');

let feil = 0, sjekker = 0;
const sjekk = (ok, hva) => { sjekker++; if (!ok) { feil++; console.log('FEIL', hva); } else console.log('ok  ', hva); };

rmSync(LOGG, { force: true });
mkdirSync(SKJERM, { recursive: true });
const srv = spawn(join(ROT, 'build', 'devserver'),
  ['--port', String(PORT), '--logg', LOGG, '--klokke', String(T0), '--nokkel', K, '--web', join(ROT, 'web')],
  { stdio: ['ignore', 'ignore', 'inherit'] });
await new Promise((r) => setTimeout(r, 400));

const api = async (sti, kropp, nokkel = K) => {
  const r = await fetch(URL + sti, {
    method: kropp ? 'POST' : 'GET',
    headers: { 'X-Stafett-Nokkel': nokkel, 'Content-Type': 'application/json' },
    body: kropp ? JSON.stringify(kropp) : undefined,
  });
  return { status: r.status, body: r.headers.get('content-type').includes('json') ? await r.json() : await r.text() };
};
const hopp = (ms) => fetch(URL + '/sim/hopp', { method: 'POST', body: JSON.stringify({ ms }) });

const nettleser = await chromium.launch();
try {
  const ctx = await nettleser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  const side = await ctx.newPage();
  const konsollfeil = [];
  side.on('pageerror', (e) => konsollfeil.push(String(e)));

  // 1. Uten nøkkel: ærlig beskjed, ingen data
  const uten = await api('/api/state', null, '');
  sjekk(uten.status === 401, 'API uten nøkkel gir 401');
  const feilNokkel = await api('/api/state', null, 'testnokkel49');
  sjekk(feilNokkel.status === 401, 'API med feil nøkkel gir 401');
  await side.goto(URL + '/');
  await side.waitForSelector('#kobling:not(.skjult)');
  sjekk((await side.textContent('#kobling')).includes('hold hjulet'), 'telefon uten nøkkel forklarer hvordan man kobler til');

  // 2. Parring via QR-lenke (#k=...)
  await side.goto(URL + '/#k=' + K);
  await side.waitForFunction(() => document.querySelector('#kobling').classList.contains('skjult'));
  sjekk(!(await side.url()).includes('k='), 'nøkkelen fjernes fra adresselinja etter parring');
  await side.reload();
  await side.waitForSelector('#noter .tom');
  sjekk(true, 'nøkkelen huskes etter omlasting');

  // 3. Velg del
  await side.click('#hvem');
  await side.fill('#ny-del', 'Lille');
  await side.click('#lagre-del');
  sjekk((await side.textContent('#hvem')) === 'Lille', 'del valgt: Lille');

  // 4. Tom note avvises inline (ingen alert)
  side.on('dialog', () => { feil++; console.log('FEIL alert() brukt'); });
  await side.click('#send-note');
  sjekk((await side.textContent('#m-note')).includes('Skriv noe'), 'tom note gir inline-melding');

  // 5. Overlevering
  await side.fill('#note', 'Kjøpte Lego på Klarna. Beklager.\nDen kommer torsdag. Ikke åpne før du har spist.');
  await side.click('#send-note');
  await side.waitForSelector('#noter .kort');
  sjekk((await side.textContent('#noter')).includes('Kjøpte Lego'), 'note vises i lista');
  sjekk((await side.textContent('#noter .meta')).includes('Lille'), 'note merket med del');
  const st1 = (await api('/api/state')).body;
  sjekk(st1.handoffs.length === 1 && st1.handoffs[0].del === 'Lille', 'note lagret på enheten');

  // 6. Svar (fra en annen del)
  await side.click('#hvem');
  await side.click('#del-chips button:has-text("ukjent del")');
  await side.click('#noter .kort button');
  await side.fill('#note', 'Ok. Vi lar pakken ligge til fredag.');
  await side.click('#send-note');
  await side.waitForSelector('#noter .kort.svar');
  sjekk((await side.textContent('#noter .kort.svar .meta')).includes('→ svar'), 'svar vises som svar');
  sjekk(await side.evaluate(() => { const k = [...document.querySelectorAll('#noter .kort')]; return !k[0].classList.contains('svar') && k[1].classList.contains('svar'); }), 'svar ligger under noten det svarer på');

  // 7. Kjølerom
  await side.click('nav button[data-til="kjol"]');
  await side.fill('#ting', 'Lego 10316 Rivendell');
  await side.fill('#pris', 'abc');
  await side.click('#send-kjol');
  sjekk((await side.textContent('#m-kjol')).includes('kroner'), 'ugyldig pris gir forklaring');
  await side.fill('#pris', '1 899');
  await side.fill('#butikk', 'Komplett');
  await side.click('#send-kjol');
  await side.waitForSelector('#kjol .kort');
  sjekk((await side.textContent('#kjol')).includes('1 899 kr'), 'pris formatert 1 899 kr');
  { const t = await side.textContent('#kjol'); sjekk(t.includes('48 t igjen'), 'nedtelling 48 t: ' + t); }
  sjekk(await side.isVisible('#kjol button:has-text("Dropp nå")'), 'kan droppe med en gang');
  sjekk(!(await side.isVisible('#kjol button:has-text("Kjøp")')), 'kan ikke kjøpe før 48 t');
  const stK = (await api('/api/state')).body; console.log('DEBUG', JSON.stringify(stK.kjol));
  const tidlig = await api('/api/kjol/avgjor', { id: stK.kjol[0].id, valg: 'kjop' });
  sjekk(tidlig.status === 400 && String(tidlig.body.feil).includes('ikke ferdig'), 'API nekter kjøp før 48 t (passiv: bare forklarer) ' + JSON.stringify(tidlig));
  await side.fill('#ting', 'Robotstøvsuger');
  await side.fill('#pris', '3490');
  await side.click('#send-kjol');
  await side.waitForFunction(() => document.querySelectorAll('#kjol .kort').length === 2);
  await side.screenshot({ path: join(SKJERM, 'telefon-kjolerom.png') });

  // 8. 48 timer senere
  await hopp(48 * 3600000 + 60000);
  await side.reload();
  await side.click('nav button[data-til="kjol"]');
  await side.waitForSelector('#kjol button:has-text("Kjøp")');
  sjekk(await side.isVisible('#kjol button:has-text("48 t til")'), 'etter 48 t: kjøp / dropp / 48 t til');
  await side.click('#kjol .kort:first-child button:has-text("Dropp")');
  await side.waitForFunction(() => document.querySelector('#spart').textContent.includes('1 ting'));
  sjekk((await side.textContent('#spart')).includes('1 899 kr'), 'latt være: 1 ting · 1 899 kr');
  await side.click('#kjol .kort:first-child button:has-text("48 t til")');
  await side.waitForFunction(() => document.querySelector('#kjol').textContent.includes('t igjen'));
  sjekk(true, 'forlenget 48 t');

  // 9. Forfall
  await side.click('nav button[data-til="forfall"]');
  await side.fill('#ff-navn', 'Klarna');
  await side.fill('#ff-ore', '1412');
  await side.fill('#ff-dato', '2026-10-28');
  await side.check('#ff-mnd');
  await side.click('#send-ff');
  await side.waitForSelector('#forfall .kort');
  sjekk((await side.textContent('#forfall')).includes('28.10.2026'), 'forfall vises');
  await side.click('#forfall button:has-text("Betalt")');
  await side.waitForFunction(() => document.querySelector('#forfall').textContent.includes('28.11.2026'));
  sjekk(true, 'betalt → neste måned vises');
  await side.screenshot({ path: join(SKJERM, 'telefon-forfall.png') });

  // 10. Eksport
  await side.click('nav button[data-til="mer"]');
  const [last] = await Promise.all([side.waitForEvent('download'), side.click('#eksport')]);
  const sti = await last.path();
  const tekst = (await import('node:fs')).readFileSync(sti, 'utf8');
  sjekk(tekst.includes('Kjøpte Lego') && tekst.includes('Robotstøvsuger') && tekst.includes('Klarna'), 'eksport inneholder alt');

  // 11. Hjulet: trykk etter 48 t fravær → velkommen
  await hopp(13 * 3600000);
  await api('/api/hjul', { h: 'trykk' });
  const st2 = (await api('/api/state')).body;
  sjekk(st2.overlay === 1, 'trykk etter langt fravær viser «Hei. Du var borte»');
  const pbm = await fetch(URL + '/skjerm.pbm', { headers: { 'X-Stafett-Nokkel': K } });
  writeFileSync(join(ROT, 'build', 'e2e-velkommen.pbm'), Buffer.from(await pbm.arrayBuffer()));
  await api('/api/hjul', { h: 'vri+' });
  sjekk((await api('/api/state')).body.overlay === 0, 'vri lukker overlegg');
  await api('/api/hjul', { h: 'vri+' });
  sjekk((await api('/api/state')).body.side === 1, 'vri blar til Noter');
  await api('/api/hjul', { h: 'hold3' });
  sjekk((await api('/api/state')).body.overlay === 2, 'hold 3 s viser QR');
  await api('/api/hjul', { h: 'trykk' });

  // 12. NFC-sti åpner kjølerommet direkte
  await side.goto(URL + '/kjol');
  sjekk(await side.isVisible('section[data-fane="kjol"]'), '/kjol (NFC) åpner kjølerommet');

  // 13. Ingen horisontal rulling på 320 px
  await side.setViewportSize({ width: 320, height: 640 });
  for (const f of ['noter', 'kjol', 'forfall', 'mer']) {
    await side.click(`nav button[data-til="${f}"]`);
    const bred = await side.evaluate(() => document.documentElement.scrollWidth);
    sjekk(bred <= 320, `ingen horisontal rulling (${f}) på 320 px`);
  }
  await side.setViewportSize({ width: 390, height: 844 });
  await side.click('nav button[data-til="noter"]');
  await side.screenshot({ path: join(SKJERM, 'telefon-noter.png') });

  // 14. Mørk modus
  const mork = await nettleser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: 'dark', locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  const ms = await mork.newPage();
  await ms.goto(URL + '/#k=' + K);
  await ms.waitForSelector('#noter .kort');
  const bg = await ms.evaluate(() => getComputedStyle(document.body).backgroundColor);
  sjekk(bg === 'rgb(22, 22, 21)', 'mørk modus: mørk bakgrunn');
  await ms.screenshot({ path: join(SKJERM, 'telefon-mork.png') });

  // 15. Simulator
  const sim = await ctx.newPage();
  await sim.setViewportSize({ width: 1000, height: 820 });
  await sim.goto(URL + '/sim#k=' + K);
  await sim.waitForTimeout(800);
  await sim.screenshot({ path: join(SKJERM, 'simulator.png') });
  sjekk(true, 'simulator lastet');

  // 16. Omstart: loggen spilles av, ingenting tapt
  srv.kill();
  await new Promise((r) => setTimeout(r, 200));
  const srv2 = spawn(join(ROT, 'build', 'devserver'), ['--port', String(PORT), '--logg', LOGG, '--klokke', String(T0 + 62 * 3600000), '--nokkel', K, '--web', join(ROT, 'web')], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 400));
  const st3 = (await api('/api/state')).body;
  sjekk(st3.handoffs.length === 2 && st3.kjol.length === 2 && st3.forfall.length === 1, 'etter omstart: alt er der');
  srv2.kill();

  sjekk(konsollfeil.length === 0, 'ingen JS-feil i telefon-UI' + (konsollfeil.length ? ': ' + konsollfeil.join(' | ') : ''));
} finally {
  await nettleser.close();
  srv.kill();
}
console.log(`\n${sjekker} sjekker, ${feil} feil`);
process.exit(feil ? 1 : 0);
