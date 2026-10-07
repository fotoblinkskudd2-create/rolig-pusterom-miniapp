// Liten server uten avhengigheter. Serverer public/ og tar imot anonyme innmeldinger.
// Lagrer ALDRI IP, nettleser eller klokkeslett. Bare skjemafeltene, med måned som fineste tid.
import http from 'node:http';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validerInnmelding } from './public/skjema.js';
import { byggStatistikk } from './scripts/bygg.js';

const ROT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(ROT, 'public');
const INNMELDT = join(ROT, 'data', 'innmeldt');
const PORT = Number(process.env.PORT) || 8080;

const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
};

// Spam-vern: maks innmeldinger per avsender per døgn. Nøkkelen er en hash med
// et salt som bare finnes i minnet og byttes hvert døgn, så den kan ikke spores tilbake.
const MAKS_PER_DOGN = 5;
let salt = randomBytes(32);
let teller = new Map();
setInterval(() => { salt = randomBytes(32); teller = new Map(); }, 24 * 3600 * 1000).unref();

function forMange(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress || '';
  const nokkel = createHash('sha256').update(salt).update(ip).digest('hex');
  const n = (teller.get(nokkel) || 0) + 1;
  teller.set(nokkel, n);
  return n > MAKS_PER_DOGN;
}

function svar(res, kode, data) {
  res.writeHead(kode, { 'content-type': TYPER['.json'], 'cache-control': 'no-store' });
  res.end(JSON.stringify(data));
}

async function lesKropp(req, maks = 4096) {
  let kropp = '';
  for await (const bit of req) {
    kropp += bit;
    if (kropp.length > maks) throw new Error('for stor');
  }
  return kropp;
}

async function meld(req, res) {
  if (forMange(req)) return svar(res, 429, { ok: false, feil: ['for_mange'] });
  let inn;
  try {
    inn = JSON.parse(await lesKropp(req));
  } catch {
    return svar(res, 400, { ok: false, feil: ['ugyldig'] });
  }
  // Honningkrukke: feltet er skjult for mennesker. Roboter fyller det ut.
  if (inn?.nettside) return svar(res, 200, { ok: true });

  const r = validerInnmelding(inn);
  if (!r.ok) return svar(res, 400, r);

  const id = randomUUID();
  await mkdir(INNMELDT, { recursive: true });
  await writeFile(join(INNMELDT, `${id}.json`), JSON.stringify({ id, ...r.sak }, null, 2) + '\n');
  await byggStatistikk(ROT);
  svar(res, 201, { ok: true, id });
}

async function statisk(req, res) {
  const sti = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  let fil = join(PUBLIC, sti);
  if (!fil.startsWith(PUBLIC)) return svar(res, 403, { ok: false });
  if (fil.endsWith('/') || fil === PUBLIC) fil = join(fil, 'index.html');
  try {
    const innhold = await readFile(fil);
    res.writeHead(200, { 'content-type': TYPER[extname(fil)] || 'application/octet-stream' });
    res.end(innhold);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Finnes ikke');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/meld') return await meld(req, res);
    if (req.method === 'GET' || req.method === 'HEAD') return await statisk(req, res);
    svar(res, 405, { ok: false });
  } catch (e) {
    console.error(e.message);
    svar(res, 500, { ok: false });
  }
});

await byggStatistikk(ROT);
server.listen(PORT, () => console.log(`Folkets regnskap: http://localhost:${PORT}`));
