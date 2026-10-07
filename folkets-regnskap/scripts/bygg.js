// Gjør rådata om til tall. Ingen enkeltsaker går ut herfra – bare mønsteret.
// Unntak: nyhetssaker får lenke i kildelisten, fordi de allerede er offentlige og må kunne etterprøves.
import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FYLKER, HENDELSER, FAGOMRADER, STATUS, MIN_VIS } from '../public/skjema.js';

const STATUSER = Object.keys(STATUS);

function tomTelling() {
  return Object.fromEntries([...STATUSER, 'totalt'].map((s) => [s, 0]));
}

function tell(mal, nokkel, status) {
  mal[nokkel] ??= tomTelling();
  mal[nokkel][status]++;
  mal[nokkel].totalt++;
}

// Små celler i krysstabeller kan peke ut én person i én kommune. De skjules.
export function skjulSma(tabell) {
  const ut = {};
  for (const [k, rad] of Object.entries(tabell)) {
    ut[k] = Object.fromEntries(Object.entries(rad).map(([s, n]) => [s, n > 0 && n < MIN_VIS ? `<${MIN_VIS}` : n]));
  }
  return ut;
}

function manedFor(dato, tilbake) {
  const d = new Date(Date.UTC(dato.getUTCFullYear(), dato.getUTCMonth() - tilbake, 1));
  return d.toISOString().slice(0, 7);
}

// Siste tre hele måneder mot de tre før. For få saker = ingen påstand.
export function trend(saker, naa = new Date()) {
  const siste = new Set([1, 2, 3].map((i) => manedFor(naa, i)));
  const forrige = new Set([4, 5, 6].map((i) => manedFor(naa, i)));
  const a = saker.filter((s) => siste.has(s.maned)).length;
  const b = saker.filter((s) => forrige.has(s.maned)).length;
  const periode = { fra: manedFor(naa, 3), til: manedFor(naa, 1), forrigeFra: manedFor(naa, 6), forrigeTil: manedFor(naa, 4) };
  if (a < 10 || b < 10) return { retning: null, siste: a, forrige: b, ...periode };
  const endring = (a - b) / b;
  const retning = endring > 0.1 ? 'verre' : endring < -0.1 ? 'bedre' : 'flat';
  return { retning, endring: Math.round(endring * 100), siste: a, forrige: b, ...periode };
}

export function lesCsv(tekst) {
  const linjer = tekst.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const [hode, ...rader] = linjer;
  if (!hode) return [];
  const felt = hode.split(';').map((f) => f.trim());
  return rader.map((r) => Object.fromEntries(r.split(';').map((v, i) => [felt[i], v.trim()])));
}

// Offentlige tall godtas bare med kilde som kan klikkes på.
export function validerOffisielt(rader) {
  return rader.filter((r) => /^https:\/\//.test(r.kilde_url || '') && r.periode && r.maal && r.verdi !== '' && !Number.isNaN(Number(r.verdi)))
    .map((r) => ({ ...r, verdi: Number(r.verdi) }));
}

export function aggreger({ innmeldt, nyheter, offisielt }, naa = new Date()) {
  const alle = [...innmeldt, ...nyheter];
  const perStatus = Object.fromEntries(STATUSER.map((s) => [s, alle.filter((x) => x.status === s).length]));

  const perFylke = {};
  const perHendelse = {};
  const perManed = {};
  const perFagomrade = {};

  for (const s of alle) {
    tell(perFylke, s.fylke && FYLKER.includes(s.fylke) ? s.fylke : 'Uten fylke', s.status);
    for (const h of s.hendelser) if (HENDELSER[h]) tell(perHendelse, h, s.status);
    tell(perManed, s.maned, s.status);
    if (s.fagomrade && FAGOMRADER.includes(s.fagomrade)) tell(perFagomrade, s.fagomrade, s.status);
  }

  // Bare siste 24 måneder i tidslinjen, fylt ut med nuller så hullene synes.
  const tidslinje = {};
  for (let i = 23; i >= 0; i--) {
    const m = manedFor(naa, i);
    tidslinje[m] = perManed[m] ?? tomTelling();
  }

  return {
    oppdatert: naa.toISOString(),
    omrade: 'sykehuskø',
    totalt: alle.length,
    perStatus,
    dodsfall: Object.fromEntries(STATUSER.map((st) => [st, alle.filter((x) => x.status === st && x.hendelser.includes('dodsfall')).length])),
    trend: trend(alle, naa),
    perFylke: skjulSma(perFylke),
    perHendelse: skjulSma(perHendelse),
    perFagomrade: skjulSma(perFagomrade),
    perManed: skjulSma(tidslinje),
    offisielt,
    minVis: MIN_VIS,
  };
}

async function lesInnmeldt(mappe) {
  const filer = await readdir(mappe).catch(() => []);
  const saker = [];
  for (const f of filer.filter((f) => f.endsWith('.json'))) {
    saker.push(JSON.parse(await readFile(join(mappe, f), 'utf8')));
  }
  return saker;
}

export async function byggStatistikk(rot, naa = new Date()) {
  const innmeldt = await lesInnmeldt(join(rot, 'data', 'innmeldt'));
  const nyheter = JSON.parse(await readFile(join(rot, 'data', 'nyheter.json'), 'utf8').catch(() => '[]'));
  const offisielt = validerOffisielt(lesCsv(await readFile(join(rot, 'data', 'offisielt.csv'), 'utf8').catch(() => '')));

  const stat = aggreger({ innmeldt, nyheter, offisielt }, naa);
  const kilder = nyheter.map(({ dato, tittel, url, kilde, fylke, hendelser }) => ({ dato, tittel, url, kilde, fylke, hendelser }));

  const ut = join(rot, 'public', 'data');
  await mkdir(ut, { recursive: true });
  await writeFile(join(ut, 'statistikk.json'), JSON.stringify(stat, null, 2) + '\n');
  await writeFile(join(ut, 'kilder.json'), JSON.stringify(kilder, null, 2) + '\n');
  return stat;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const s = await byggStatistikk(rot);
  console.log(`Bygget: ${s.totalt} saker (${STATUSER.map((k) => `${k} ${s.perStatus[k]}`).join(', ')}).`);
}
