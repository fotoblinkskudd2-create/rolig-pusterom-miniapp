'use strict';
// Konspirasjonslabben – server. Ingen avhengigheter. Node 18+.
// Kjør: node server.js   →   http://localhost:3000

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const motor = require('./lib/engine');
const { Arkiv } = require('./lib/arkiv');

const PORT = Number(process.env.PORT) || 3000;
const OFFENTLIG = path.join(__dirname, 'public');
const arkiv = new Arkiv(process.env.ARKIV_FIL || path.join(__dirname, 'data', 'arkiv.json'));

const TYPER = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

function lesKropp(req, maks = 32 * 1024) {
  return new Promise((ok, feil) => {
    let str = '';
    req.setEncoding('utf8');
    req.on('data', (c) => {
      str += c;
      if (str.length > maks) { feil(Object.assign(new Error('For mye tekst. Selv manifest har grenser.'), { status: 413 })); req.destroy(); }
    });
    req.on('end', () => {
      if (!str) return ok({});
      try { ok(JSON.parse(str)); } catch { feil(Object.assign(new Error('Ugyldig JSON'), { status: 400 })); }
    });
    req.on('error', feil);
  });
}

// En veldig enkel hastighetsbegrensning per IP for skriveoperasjoner.
const skrivelogg = new Map();
function forFort(ip) {
  const naa = Date.now();
  const liste = (skrivelogg.get(ip) || []).filter((t) => naa - t < 60_000);
  liste.push(naa);
  skrivelogg.set(ip, liste);
  return liste.length > 20;
}

function serverFil(req, res, urlsti) {
  const rel = urlsti === '/' ? 'index.html' : decodeURIComponent(urlsti).replace(/^\/+/, '');
  const fil = path.normalize(path.join(OFFENTLIG, rel));
  if (!fil.startsWith(OFFENTLIG + path.sep)) return json(res, 403, { feil: 'Nei.' });
  fs.readFile(fil, (err, data) => {
    if (err) return json(res, 404, { feil: 'Finnes ikke. Eller gjør den det?' });
    res.writeHead(200, { 'Content-Type': TYPER[path.extname(fil)] || 'application/octet-stream' });
    res.end(data);
  });
}

async function api(req, res, url) {
  const { pathname } = url;
  const m = req.method;

  if (m === 'GET' && pathname === '/api/sak') {
    return json(res, 200, {
      sak: motor.SAK,
      nivaer: motor.NIVAER,
      brikker: motor.BRIKKER,
      pressemelding: motor.ordliste(motor.PRESSEMELDING),
      motbevis: motor.MOTBEVIS,
    });
  }

  if (m === 'GET' && pathname === '/api/cuibono') {
    return json(res, 200, motor.cuiBono());
  }

  if (m === 'POST' && pathname === '/api/tallmagi') {
    const { input } = await lesKropp(req);
    return json(res, 200, motor.tallmagi(String(input || '').slice(0, 200)));
  }

  if (m === 'POST' && pathname === '/api/vurder') {
    const { nivaa, data } = await lesKropp(req);
    const svar = motor.vurder(nivaa, data);
    if (!svar) return json(res, 400, { feil: 'Ukjent nivå. Eller et nivå så hemmelig at selv vi ikke vet om det.' });
    return json(res, 200, svar);
  }

  if (m === 'GET' && pathname === '/api/teorier') {
    const sort = url.searchParams.get('sort') === 'nye' ? 'nye' : 'topp';
    return json(res, 200, arkiv.liste(sort));
  }

  if (m === 'POST' && pathname === '/api/teorier') {
    if (forFort(req.socket.remoteAddress)) return json(res, 429, { feil: 'Rolig. Selv de mest våkne må puste.' });
    const { alias, tekst } = await lesKropp(req);
    const ren = String(tekst || '').trim();
    if (ren.length < 20) return json(res, 400, { feil: 'Minst 20 tegn. En ekte teori trenger plass til minst ett «tilfeldig?».' });
    const vurdering = motor.vurderViral(ren);
    const teori = arkiv.legg({
      id: crypto.randomUUID(),
      alias: String(alias || 'Anonym sannhetssøker').trim().slice(0, 40) || 'Anonym sannhetssøker',
      tekst: ren.slice(0, 1200),
      overbevisning: vurdering.overbevisning,
      sannsynlighet: vurdering.sannsynlighet,
      rang: vurdering.rang,
      stemmer: { aapnet: 0, sjekket: 0 },
      tid: new Date().toISOString(),
    });
    return json(res, 201, teori);
  }

  const stem = pathname.match(/^\/api\/teorier\/([\w-]+)\/stem$/);
  if (m === 'POST' && stem) {
    if (forFort(req.socket.remoteAddress)) return json(res, 429, { feil: 'For mange stemmer. Valgfusk?' });
    const { type } = await lesKropp(req);
    if (type !== 'aapnet' && type !== 'sjekket') return json(res, 400, { feil: 'Stemmetype må være aapnet eller sjekket.' });
    const teori = arkiv.stem(stem[1], type);
    if (!teori) return json(res, 404, { feil: 'Teorien er borte. Slettet? Typisk.' });
    return json(res, 200, teori);
  }

  return json(res, 404, { feil: 'Ukjent endepunkt' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (req.method !== 'GET') return json(res, 405, { feil: 'Metode ikke tillatt' });
    return serverFil(req, res, url.pathname);
  } catch (e) {
    return json(res, e.status || 500, { feil: e.status ? e.message : 'Noe gikk galt. Vi mistenker sabotasje.' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🧵 Konspirasjonslabben kjører på http://localhost:${PORT}`);
  });
}

module.exports = { server, arkiv };
