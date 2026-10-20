// Ende-til-ende: Vindusvakt-kjernen (devserver, simulert utsikt) + telefon-UI i Chromium.
//   make dev && node test/e2e.mjs
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UT = join(ROT, '..', 'render');
const DATA = join(ROT, 'build', 'e2e-data');
const PORT = 8073, K = 'vindu48', T0 = 1792503660000;
const URL = `http://localhost:${PORT}`;
const TIME = 3600000, DOGN = 24 * TIME;

let feil = 0, sjekker = 0;
const sjekk = (ok, hva) => { sjekker++; if (!ok) { feil++; console.log('FEIL', hva); } else console.log('ok  ', hva); };

rmSync(DATA, { recursive: true, force: true });
mkdirSync(UT, { recursive: true });
const start = (klokke) => spawn(join(ROT, 'build', 'devserver'), ['--port', String(PORT), '--data', DATA, '--klokke', String(klokke), '--nokkel', K, '--web', join(ROT, 'web')], { stdio: ['ignore', 'ignore', 'inherit'] });
let srv = start(T0);
await new Promise((r) => setTimeout(r, 400));
const api = async (sti, kropp, nokkel = K) => {
  const r = await fetch(URL + sti, { method: kropp ? 'POST' : 'GET', headers: { 'X-Vindusvakt-Nokkel': nokkel, 'Content-Type': 'application/json' }, body: kropp ? JSON.stringify(kropp) : undefined });
  const t = r.headers.get('content-type') || '';
  return { status: r.status, body: t.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
};
const tilstand = async () => (await api('/api/state')).body;
const hopp = (ms) => fetch(URL + '/sim/hopp', { method: 'POST', body: JSON.stringify({ ms }) });

const nettleser = await chromium.launch();
try {
  const ctx = await nettleser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'nb-NO', timezoneId: 'Europe/Oslo' });
  const side = await ctx.newPage();
  const jsfeil = [];
  side.on('pageerror', (e) => jsfeil.push(String(e)));

  sjekk((await api('/api/state', null, '')).status === 401, 'uten nøkkel: 401');
  await side.goto(URL + '/');
  await side.waitForSelector('#kobling:not([hidden])');
  sjekk(true, 'telefon uten nøkkel viser forklaring');
  await side.goto(URL + '/#k=' + K);
  await side.waitForFunction(() => document.querySelector('#kobling').hidden && document.querySelector('#lys').textContent.startsWith('Sola opp'));
  sjekk(true, 'paret; Oslo i dag: «Sola opp …»');
  sjekk((await tilstand()).prover.length === 1, 'første time: ett bilde');

  // En uke senere
  await hopp(7 * DOGN);
  const s1 = await tilstand();
  sjekk(s1.prover.length >= 168 && s1.prover.length <= 8 * 24 + 1, `en uke: ${s1.prover.length} bilder, ett i timen`);
  sjekk(s1.prover.every((p, i, a) => i === 0 || Math.abs(p.ts - a[i - 1].ts - TIME) < 60000), 'én time mellom hvert bilde (±1 min)');
  sjekk(s1.prover.some((p) => p.lys < 30) && s1.prover.some((p) => p.lys > 150), 'lysverdiene følger døgnet (natt < 30, dag > 150)');
  await side.reload();
  await side.waitForFunction(() => document.querySelectorAll('#uke canvas').length === 28);
  await side.waitForFunction(() => [...document.querySelectorAll('#uke canvas')].filter((c) => c.getAttribute('aria-label')).length >= 26);
  sjekk(true, 'ukesrutenett: 28 ruter, minst 26 med bilde');
  const pbm = await api('/api/prove/' + s1.prover[10].ts + '.pbm');
  sjekk(pbm.status === 200 && pbm.body.length === 1176 + 10, 'miniatyr er 112×84 1-bit (1 176 byte + hode)');
  sjekk((await api('/api/prove/1.pbm')).status === 404, 'ukjent tidspunkt: 404');
  await side.screenshot({ path: join(UT, 'telefon-oslo.png') });

  // Flytt til Tromsø
  await side.click('#steder button:has-text("Tromsø")');
  await side.click('#lagre');
  await side.waitForFunction(() => document.querySelector('#m-sted').textContent.includes('Lagret'));
  const s2 = await tilstand();
  sjekk(s2.sted.navn === 'Tromsø' && Math.abs(s2.sted.lat - 69.6492) < 1e-4, 'sted lagret: Tromsø 69,6492');
  // Ugyldig sted
  await side.fill('#lat', 'nord');
  await side.click('#lagre');
  await side.waitForFunction(() => document.querySelector('#m-sted').textContent.includes('tall'));
  sjekk(true, 'ugyldig breddegrad gir forklaring');
  sjekk((await api('/api/sted', { navn: 'X', lat_u: 95000000, lon_u: 0 })).status === 400, 'API nekter lat 95°');

  // Inn i mørketida: fra 27.10 til 10.12
  await hopp(44 * DOGN);
  const s3 = await tilstand();
  sjekk(s3.sol.type === 'morketid', 'Tromsø 10. desember: mørketid');
  sjekk(s3.sol.dager_til_sol >= 34 && s3.sol.dager_til_sol <= 38, `dager til sola: ${s3.sol.dager_til_sol}`);
  sjekk(s3.sol.bla_til > s3.sol.bla_fra, 'blåtime finnes');
  sjekk(s3.prover.length <= 8 * 24 + 1, 'arkivet holder seg på åtte døgn');
  sjekk(s3.prover.filter((p) => p.lys > 150).length === 0, 'ingen bilder med dagslys i mørketida');
  await side.reload();
  await side.waitForFunction(() => document.querySelector('#stort').textContent.includes('dager til sola'));
  sjekk((await side.textContent('#lys')).startsWith('Mørketid.'), 'telefonen sier «Mørketid.»');
  await side.screenshot({ path: join(UT, 'telefon-morketid.png') });
  const skjerm = await api('/api/skjerm.pbm');
  sjekk(skjerm.status === 200 && skjerm.body.length === 48000 + 11, 'skjermbilde 800×480');

  // Linsedeksel
  const før = (await tilstand()).prover.length;
  await api('/api/knapp', { k: 'lukk' });
  const sistTs = (await tilstand()).prover.at(-1).ts;
  await hopp(3 * TIME);
  const lukket = await tilstand();
  sjekk(lukket.privat && lukket.prover.at(-1).ts === sistTs, 'linse lukket: ingen nye bilder på 3 t');
  await api('/api/knapp', { k: 'aapne' });
  await hopp(TIME);
  sjekk((await tilstand()).prover.at(-1).ts > sistTs, 'linse åpen: bilder igjen');
  sjekk(før > 0, 'arkivet var der hele tiden');

  // Knapp: sider
  await api('/api/knapp', { k: 'neste' });
  sjekk((await tilstand()).side === 1, 'knapp: I DAG');
  await api('/api/knapp', { k: 'neste' });
  sjekk((await tilstand()).side === 2, 'knapp: ÅRET');

  // Smal skjerm
  await side.setViewportSize({ width: 320, height: 640 });
  await side.reload();
  await side.waitForSelector('#uke canvas');
  sjekk(await side.evaluate(() => document.documentElement.scrollWidth <= 320), 'ingen horisontal rulling på 320 px');
  await side.setViewportSize({ width: 390, height: 844 });

  // Simulator
  const sim = await ctx.newPage();
  await sim.setViewportSize({ width: 1340, height: 860 });
  await sim.goto(URL + '/sim#k=' + K);
  await sim.waitForTimeout(900);
  await sim.screenshot({ path: join(UT, 'simulator.png') });
  sjekk(true, 'simulator lastet');

  // Omstart
  const antall = (await tilstand()).prover.length;
  srv.kill();
  await new Promise((r) => setTimeout(r, 200));
  srv = start(T0 + 51 * DOGN + 5 * TIME);
  await new Promise((r) => setTimeout(r, 400));
  const s4 = await tilstand();
  sjekk(s4.sted.navn === 'Tromsø', 'etter omstart: sted husket');
  sjekk(s4.prover.length >= antall, 'etter omstart: arkivet husket');
  sjekk(jsfeil.length === 0, 'ingen JS-feil' + (jsfeil.length ? ': ' + jsfeil.join(' | ') : ''));
} finally {
  await nettleser.close();
  srv.kill();
}
console.log(`\n${sjekker} sjekker, ${feil} feil`);
process.exit(feil ? 1 : 0);
