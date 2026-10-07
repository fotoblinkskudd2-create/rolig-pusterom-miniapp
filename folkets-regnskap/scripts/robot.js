// Roboten. Kjøres daglig (GitHub Actions). Henter nyhetsstrømmer, plukker ut saker om
// sykehuskø, stempler dem «nyhetssak» og legger dem i data/nyheter.json.
// Lagrer lenke og tittel så hver sak kan etterprøves. Teller aldri samme sak to ganger.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { regionFor } from '../public/skjema.js';

const ENTITETER = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function dekod(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&(\w+);/g, (m, n) => ENTITETER[n] ?? m)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tag(xml, navn) {
  const m = new RegExp(`<${navn}(?:\\s[^>]*)?>([\\s\\S]*?)</${navn}>`, 'i').exec(xml);
  return m ? dekod(m[1]) : '';
}

export function lesRss(xml) {
  const saker = [];
  for (const [, item] of xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)) {
    saker.push({
      tittel: tag(item, 'title'),
      url: tag(item, 'link'),
      beskrivelse: tag(item, 'description'),
      dato: tag(item, 'pubDate'),
      kilde: tag(item, 'source'),
    });
  }
  return saker;
}

// Sted → fylke. Sykehus og byer som nevnes i nyheter.
const STEDER = {
  Oslo: ['oslo', 'ullevål', 'rikshospitalet', 'radiumhospitalet', 'aker sykehus', 'lovisenberg', 'diakonhjemmet', 'oslo universitetssykehus'],
  Akershus: ['akershus', 'ahus', 'lørenskog', 'bærum', 'asker'],
  Østfold: ['østfold', 'fredrikstad', 'sarpsborg', 'halden', 'moss', 'kalnes'],
  Buskerud: ['buskerud', 'drammen', 'kongsberg', 'ringerike', 'vestre viken'],
  Innlandet: ['innlandet', 'hamar', 'lillehammer', 'gjøvik', 'elverum', 'kongsvinger', 'sykehuset innlandet'],
  Vestfold: ['vestfold', 'tønsberg', 'sandefjord', 'larvik'],
  Telemark: ['telemark', 'skien', 'porsgrunn', 'notodden'],
  Agder: ['agder', 'kristiansand', 'arendal', 'flekkefjord', 'sørlandet sykehus'],
  Rogaland: ['rogaland', 'stavanger', 'haugesund', 'sandnes', 'helse stavanger', 'helse fonna'],
  Vestland: ['vestland', 'bergen', 'haukeland', 'førde', 'voss', 'helse bergen', 'helse førde', 'haraldsplass'],
  'Møre og Romsdal': ['møre og romsdal', 'ålesund', 'molde', 'kristiansund', 'volda'],
  Trøndelag: ['trøndelag', 'trondheim', 'st. olav', 'st. olavs', 'levanger', 'namsos'],
  Nordland: ['nordland', 'bodø', 'mo i rana', 'narvik', 'nordlandssykehuset', 'helgelandssykehuset'],
  Troms: ['troms', 'tromsø', 'harstad', 'unn', 'universitetssykehuset nord-norge'],
  Finnmark: ['finnmark', 'alta', 'hammerfest', 'kirkenes', 'vadsø'],
};

const HENDELSE_ORD = {
  dodsfall: ['døde', 'døden', 'dødsfall', 'omkom', 'mistet livet'],
  fristbrudd: ['fristbrudd', 'brudd på fristen', 'frist ble brutt'],
  forverring: ['forverret', 'ble verre', 'forverring', 'ble sykere'],
  avvist_henvisning: ['avvist henvisning', 'henvisningen ble avvist', 'avslag på henvisning'],
  avlyst: ['avlyst', 'utsatt operasjon', 'utsatte operasjoner', 'strøket'],
  lang_ventetid: ['ventetid', 'ventetiden', 'venteliste', 'ventet i'],
};

function harOrd(tekst, ord) {
  const esc = ord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\p{L}\\p{N}])${esc}(?![\\p{L}\\p{N}])`, 'iu').test(tekst);
}

export function klassifiser(sak, cfg) {
  const tekst = `${sak.tittel} ${sak.beskrivelse}`.toLowerCase();
  if (!cfg.tema.some((o) => harOrd(tekst, o))) return null;
  // Helseord matches fra ordstart: «sykehus» treffer «sykehuset», men «lege» treffer ikke «skolegang».
  if (!cfg.helseord.some((o) => new RegExp(`(?<![\\p{L}\\p{N}])${o}`, 'iu').test(tekst))) return null;

  const fylker = Object.entries(STEDER)
    .filter(([, ord]) => ord.some((o) => harOrd(tekst, o)))
    .map(([f]) => f);
  // Nevnes flere fylker, er det en nasjonal sak. Da gjetter vi ikke.
  const fylke = fylker.length === 1 ? fylker[0] : null;

  const hendelser = Object.entries(HENDELSE_ORD)
    .filter(([, ord]) => ord.some((o) => harOrd(tekst, o)))
    .map(([h]) => h);

  const d = new Date(sak.dato);
  const gyldig = !Number.isNaN(+d);
  const dato = (gyldig ? d : new Date()).toISOString().slice(0, 10);

  // Google Nyheter legger « - Kilde» bak tittelen.
  const kilde = sak.kilde || sak.feed;
  const tittel = kilde && sak.tittel.endsWith(` - ${kilde}`) ? sak.tittel.slice(0, -kilde.length - 3) : sak.tittel;

  return {
    id: createHash('sha256').update(normaliser(tittel)).digest('hex').slice(0, 16),
    dato,
    maned: dato.slice(0, 7),
    tittel,
    url: sak.url,
    kilde,
    omrade: cfg.omrade,
    fylke,
    region: fylke ? regionFor(fylke) : null,
    hendelser: hendelser.length ? hendelser : ['lang_ventetid'],
    status: 'nyhetssak',
  };
}

function normaliser(t) {
  return t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

// Slår sammen nye og gamle saker. Samme tittel = samme sak, uansett hvilken strøm.
export function slaSammen(gamle, nye) {
  const alle = new Map(gamle.map((s) => [s.id, s]));
  let lagtTil = 0;
  for (const s of nye) {
    if (!alle.has(s.id)) {
      alle.set(s.id, s);
      lagtTil++;
    }
  }
  const liste = [...alle.values()].sort((a, b) => b.dato.localeCompare(a.dato) || a.id.localeCompare(b.id));
  return { liste, lagtTil };
}

async function hent(url) {
  const res = await fetch(url, {
    headers: { 'user-agent': 'FolketsRegnskap-robot/1.0 (+https://github.com/fotoblinkskudd2-create/rolig-pusterom-miniapp)' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

export async function kjorRobot(rot, henter = hent) {
  const cfg = JSON.parse(await readFile(join(rot, 'config', 'kilder.json'), 'utf8'));
  const fil = join(rot, 'data', 'nyheter.json');
  const gamle = JSON.parse(await readFile(fil, 'utf8').catch(() => '[]'));

  const nye = [];
  const logg = [];
  for (const feed of cfg.feeds) {
    try {
      const saker = lesRss(await henter(feed.url));
      const treff = saker.map((s) => klassifiser({ ...s, feed: feed.navn }, cfg)).filter(Boolean);
      nye.push(...treff);
      logg.push(`${feed.navn}: ${saker.length} lest, ${treff.length} treff`);
    } catch (e) {
      logg.push(`${feed.navn}: FEIL ${e.message}`);
    }
  }

  const { liste, lagtTil } = slaSammen(gamle, nye);
  await writeFile(fil, JSON.stringify(liste, null, 2) + '\n');
  return { logg, lagtTil, totalt: liste.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const r = await kjorRobot(rot);
  console.log(r.logg.join('\n'));
  console.log(`Nye saker: ${r.lagtTil}. Totalt: ${r.totalt}.`);
}
