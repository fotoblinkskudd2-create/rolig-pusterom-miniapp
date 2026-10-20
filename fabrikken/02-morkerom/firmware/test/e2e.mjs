// Ende-til-ende: Mørkerom-kjernen (devserver, ekte kryptering) + fremkallingsrommet i Chromium.
//   make dev && node test/e2e.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UT = join(ROT, '..', 'render');
const SD = join(ROT, 'build', 'e2e-sd');
const PORT = 8065;
const K = 'morkt48';
const T0 = 1792503660000;
const URL = `http://localhost:${PORT}`;

let feil = 0, sjekker = 0;
const sjekk = (ok, hva) => { sjekker++; if (!ok) { feil++; console.log('FEIL', hva); } else console.log('ok  ', hva); };

rmSync(SD, { recursive: true, force: true });
mkdirSync(UT, { recursive: true });
const start = (klokke) => spawn(join(ROT, 'build', 'devserver'),
  ['--port', String(PORT), '--sd', SD, '--klokke', String(klokke), '--nokkel', K, '--web', join(ROT, 'web'), '--eksempler', join(ROT, 'tools', 'eksempler')],
  { stdio: ['ignore', 'ignore', 'inherit'] });
let srv = start(T0);
await new Promise((r) => setTimeout(r, 400));

const api = async (sti, kropp, nokkel = K) => {
  const r = await fetch(URL + sti, { method: kropp ? 'POST' : 'GET', headers: { 'X-Morkerom-Nokkel': nokkel, 'Content-Type': 'application/json' }, body: kropp ? JSON.stringify(kropp) : undefined });
  const t = r.headers.get('content-type') || '';
  return { status: r.status, body: t.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
};
const knapp = (k) => api('/api/knapp', { k });
const hopp = (ms) => fetch(URL + '/sim/hopp', { method: 'POST', body: JSON.stringify({ ms }) });
const tilstand = async () => (await api('/api/state')).body;

const nettleser = await chromium.launch();
try {
  const ctx = await nettleser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  const side = await ctx.newPage();
  const jsfeil = [];
  side.on('pageerror', (e) => jsfeil.push(String(e)));
  side.on('dialog', () => { feil++; console.log('FEIL dialog brukt'); });

  // 1. Uten nøkkel
  sjekk((await api('/api/state', null, '')).status === 401, 'API uten nøkkel: 401');
  await side.goto(URL + '/');
  await side.waitForSelector('#kobling:not([hidden])');
  sjekk((await side.textContent('#kobling')).includes('hold bla'), 'telefon uten nøkkel forklarer parring');

  // 2. Parring
  await side.goto(URL + '/#k=' + K);
  await side.waitForFunction(() => document.querySelector('#kobling').hidden && document.querySelector('#antall').textContent === '0');
  sjekk(!side.url().includes('k='), 'nøkkel fjernet fra adresselinja');

  // 3. Deksel lukket: utløser gjør ingenting
  await knapp('utloser');
  sjekk((await tilstand()).i_morket === 0, 'deksel lukket: ingen bilder');

  // 4. Tre bilder
  await knapp('aapne');
  for (let i = 0; i < 3; i++) await knapp('utloser');
  const s1 = await tilstand();
  sjekk(s1.i_morket === 3 && s1.igjen === 21, 'tre bilder i mørket, 21 igjen');
  sjekk(s1.morket.every((m) => Object.keys(m).join() === 'fremkalles'), 'mørket avslører bare tidspunkt, ikke id eller innhold');
  sjekk(s1.fremkalte.length === 0, 'ingenting fremkalt ennå');
  sjekk(s1.vis === 1, 'bakskjermen viser «Inn i mørket»');
  await side.reload();
  await side.waitForFunction(() => document.querySelector('#antall').textContent === '3');
  sjekk((await side.locator('#prikker i').count()) === 3, 'tre prikker for tre bilder');
  sjekk((await side.textContent('#oppdrag')) === s1.oppdrag.tekst, 'dagens oppdrag vises');
  sjekk(await side.isVisible('#ingen'), 'tom-tilstand for fremkalte');

  // 5. Mørket holder
  for (const id of [1, 2, 3]) {
    sjekk((await api(`/api/bilde/${id}.jpg`)).status === 403, `bilde ${id}: original nektes (403) i mørket`);
    sjekk((await api(`/api/bilde/${id}.pbm`)).status === 403, `bilde ${id}: 1-bit nektes (403) i mørket`);
  }
  // 6. Kryptert på kortet
  const filer = readdirSync(SD).filter((f) => f.endsWith('.mrk'));
  sjekk(filer.length === 3, 'tre krypterte filer på kortet');
  const f1 = readFileSync(join(SD, 'B0001.mrk'));
  const kilde = readFileSync(join(ROT, 'tools', 'eksempler', readdirSync(join(ROT, 'tools', 'eksempler')).sort()[0]));
  sjekk(f1.subarray(0, 4).toString() === 'MRK1' && f1.indexOf(Buffer.from([0xFF, 0xD8, 0xFF])) === -1, 'filen starter med MRK1 og inneholder ingen JPEG-markør');
  sjekk(f1.length === kilde.length + 32, 'konvolutt = JPEG + 32 byte (magi, nonce, tag)');

  // 7. 48 timer senere
  await hopp(48 * 3600000 + 60000);
  const s2 = await tilstand();
  sjekk(s2.fremkalte.length === 3 && s2.i_morket === 0, 'etter 48 t: tre fremkalt');
  sjekk(s2.vis === 3, 'bakskjermen varsler «fremkalt»');
  const org = await api('/api/bilde/1.jpg');
  sjekk(org.status === 200 && org.body.equals(kilde), 'original dekryptert, byte for byte lik det kameraet så');
  await side.reload();
  await side.waitForFunction(() => document.querySelectorAll('#fremkalte img').length === 3);
  await side.waitForFunction(() => [...document.querySelectorAll('#fremkalte img')].every((i) => i.complete && i.naturalWidth > 0));
  sjekk(true, 'tre miniatyrer lastet');
  await side.waitForFunction(() => document.querySelector('#ark').width === 424);
  sjekk(true, 'kontaktark tegnet (424 px: 4 × 100 + 5 × 4, rundet til 8)');
  await side.screenshot({ path: join(UT, 'telefon-fremkalt.png') });

  // 8. Lysbordet
  await side.click('#fremkalte button >> nth=0');
  await side.waitForFunction(() => { const c = document.querySelector('#lb-bilde canvas'); return c && c.width === 200 && c.height === 144; });
  sjekk(true, 'lysbord: fremkalt 1-bit 200×144');
  await side.screenshot({ path: join(UT, 'telefon-lysbord.png') });
  await side.click('#v-org');
  await side.waitForFunction(() => { const i = document.querySelector('#lb-bilde img'); return i && i.complete && i.naturalWidth === 1600; });
  sjekk(true, 'lysbord: original 1600 px');
  sjekk((await side.getAttribute('#lb-last', 'href')).includes('k=' + K), 'nedlasting bærer nøkkel');
  // 9. Kast
  sjekk(!(await side.isVisible('#lb-kast-ja')), 'kast-bekreftelse skjult til man ber om den');
  await side.click('#lb-kast');
  await side.click('#lb-kast-ja');
  await side.waitForFunction(() => document.querySelectorAll('#fremkalte img').length === 2);
  sjekk((await api('/api/bilde/3.jpg')).status === 404, 'kastet bilde er borte (nyeste først: id 3)');

  // 10. Tvang
  await knapp('utloser');
  await knapp('utloser');
  await side.reload();
  await side.waitForFunction(() => document.querySelector('#antall').textContent === '2');
  await side.click('#tvang');
  sjekk(!(await side.isVisible('#tvang')) && await side.isVisible('#tvang-ja') && await side.isVisible('#tvang-nei'), 'tvang: bare ja/nei synlig etter første trykk');
  await side.click('#tvang-nei');
  sjekk(await side.isVisible('#tvang') && !(await side.isVisible('#tvang-ja')), 'nei: tilbake til én knapp');
  sjekk((await tilstand()).i_morket === 2, '«nei» lar dem ligge');
  await side.click('#tvang');
  await side.click('#tvang-ja');
  await side.waitForFunction(() => document.querySelector('#m-tvang').textContent.includes('Fremkalt'));
  const s3 = await tilstand();
  sjekk(s3.i_morket === 0 && s3.tvunget === 2, 'tvang: 2 fremkalt tidlig, og det telles');
  sjekk(await side.isDisabled('#tvang'), 'knappen er av når mørket er tomt');

  // 11. Full rull
  for (let i = 0; i < 24; i++) await knapp('utloser');
  const s4 = await tilstand();
  sjekk(s4.i_morket === 24 && s4.igjen === 0, 'full rull: 24 i mørket');
  await knapp('utloser');
  const s5 = await tilstand();
  sjekk(s5.i_morket === 24 && s5.vis === 4, 'bilde 25 nektes, bakskjermen sier «Rullen er full»');

  // 12. Bakskjerm-gjennomgang med bla
  await knapp('bla');  // lukk Full
  await knapp('bla');  // første fremkalte
  sjekk((await tilstand()).vis === 2, 'bla viser fremkalt bilde på bakskjermen');
  await knapp('hold3');
  sjekk((await tilstand()).vis === 6, 'hold 3 s: QR');
  await knapp('bla');

  // 13. Smal skjerm
  await side.setViewportSize({ width: 320, height: 640 });
  await side.reload();
  await side.waitForSelector('#fremkalte img');
  sjekk(await side.evaluate(() => document.documentElement.scrollWidth <= 320), 'ingen horisontal rulling på 320 px');
  await side.setViewportSize({ width: 390, height: 844 });
  await side.reload();
  await side.waitForFunction(() => document.querySelector('#antall').textContent === '24');
  await side.screenshot({ path: join(UT, 'telefon-morket.png') });

  // 14. Simulator
  const sim = await ctx.newPage();
  await sim.setViewportSize({ width: 1000, height: 860 });
  await sim.goto(URL + '/sim#k=' + K);
  await sim.waitForTimeout(900);
  await sim.screenshot({ path: join(UT, 'simulator.png') });
  sjekk(true, 'simulator lastet');

  // 15. Omstart: logg + nøkkel overlever, bilder kan fortsatt åpnes
  srv.kill();
  await new Promise((r) => setTimeout(r, 200));
  srv = start(T0 + 60 * 3600000);
  await new Promise((r) => setTimeout(r, 400));
  const s6 = await tilstand();
  sjekk(s6.fremkalte.length === 4 && s6.i_morket === 24, 'etter omstart: samme tilstand');
  sjekk((await api('/api/bilde/1.jpg')).body.equals(kilde), 'etter omstart: original dekrypteres fortsatt');

  sjekk(jsfeil.length === 0, 'ingen JS-feil' + (jsfeil.length ? ': ' + jsfeil.join(' | ') : ''));
} finally {
  await nettleser.close();
  srv.kill();
}
console.log(`\n${sjekker} sjekker, ${feil} feil`);
process.exit(feil ? 1 : 0);
