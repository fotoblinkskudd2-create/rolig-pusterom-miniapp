import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validerInnmelding } from '../public/skjema.js';
import { lesRss, klassifiser, slaSammen, kjorRobot } from '../scripts/robot.js';
import { aggreger, skjulSma, trend, lesCsv, validerOffisielt, byggStatistikk } from '../scripts/bygg.js';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = JSON.parse(await readFile(join(ROT, 'config', 'kilder.json'), 'utf8'));
const xml = await readFile(join(ROT, 'test', 'fixtures', 'feed.xml'), 'utf8');
const NAA = new Date('2026-10-07T12:00:00Z');

const gyldig = {
  omrade: 'sykehuskø', hendelser: ['forverring', 'fristbrudd'], ventetid: '27_52', fylke: 'Vestland',
  fagomrade: 'Ortopedi', maned: '2026-08', melder: 'pasient', harDokumentasjon: true,
};

test('gyldig innmelding blir ubekreftet og får helseregion', () => {
  const r = validerInnmelding(gyldig, NAA);
  assert.equal(r.ok, true);
  assert.equal(r.sak.status, 'ubekreftet');
  assert.equal(r.sak.region, 'Helse Vest');
});

test('innmelding kaster ukjente felt – fritekst kan ikke snikes inn', () => {
  const r = validerInnmelding({ ...gyldig, kommentar: 'Ola Nordmann, 12345678901', nettside: 'x' }, NAA);
  assert.equal(r.ok, true);
  assert.equal(JSON.stringify(r.sak).includes('Ola'), false);
  assert.deepEqual(Object.keys(r.sak).sort(), ['fagomrade', 'fylke', 'harDokumentasjon', 'hendelser', 'kilde', 'maned', 'melder', 'omrade', 'region', 'status', 'ventetid']);
});

test('innmelding avvises ved ugyldige verdier', () => {
  assert.deepEqual(validerInnmelding({ ...gyldig, omrade: 'nav' }, NAA).feil, ['omrade']);
  assert.deepEqual(validerInnmelding({ ...gyldig, hendelser: [] }, NAA).feil, ['hendelser']);
  assert.deepEqual(validerInnmelding({ ...gyldig, hendelser: ['tull'] }, NAA).feil, ['hendelser']);
  assert.deepEqual(validerInnmelding({ ...gyldig, maned: '2026-11' }, NAA).feil, ['maned']);
  assert.deepEqual(validerInnmelding({ ...gyldig, maned: '2026-13' }, NAA).feil, ['maned']);
  assert.deepEqual(validerInnmelding({ ...gyldig, fylke: 'Sogn og Fjordane' }, NAA).feil, ['fylke']);
  assert.deepEqual(validerInnmelding({ ...gyldig, harDokumentasjon: 'ja' }, NAA).feil, ['harDokumentasjon']);
  assert.equal(validerInnmelding(null, NAA).ok, false);
});

test('RSS leses med CDATA og entiteter', () => {
  const saker = lesRss(xml);
  assert.equal(saker.length, 4);
  assert.equal(saker[0].tittel, 'Døde mens han ventet på operasjon ved Haukeland - NRK');
  assert.equal(saker[0].beskrivelse, 'Ventetiden ved sykehuset var over ett år.');
  assert.equal(saker[0].kilde, 'NRK');
});

test('roboten stempler bare helsekø-saker, og gjetter ikke fylke', () => {
  const [a, b, c, d] = lesRss(xml).map((s) => klassifiser({ ...s, feed: 'Test' }, cfg));
  assert.equal(a.status, 'nyhetssak');
  assert.equal(a.tittel, 'Døde mens han ventet på operasjon ved Haukeland');
  assert.equal(a.fylke, 'Vestland');
  assert.equal(a.region, 'Helse Vest');
  assert.ok(a.hendelser.includes('dodsfall'));
  assert.equal(a.maned, '2026-10');
  assert.equal(b.fylke, null, 'to fylker nevnt = nasjonal sak');
  assert.ok(b.hendelser.includes('fristbrudd'));
  assert.equal(c, null, 'fotball');
  assert.equal(d, null, 'passkø er ikke helse');
});

test('samme sak fra to strømmer telles én gang', () => {
  const s = klassifiser({ ...lesRss(xml)[0], feed: 'A' }, cfg);
  const kopi = klassifiser({ ...lesRss(xml)[0], kilde: '', tittel: 'Døde mens han ventet på operasjon ved Haukeland', feed: 'NRK siste', url: 'https://nrk.no/x' }, cfg);
  assert.equal(s.id, kopi.id);
  const { liste, lagtTil } = slaSammen([s], [kopi]);
  assert.equal(liste.length, 1);
  assert.equal(lagtTil, 0);
});

test('små celler skjules', () => {
  assert.deepEqual(skjulSma({ Oslo: { a: 0, b: 1, c: 2, d: 3 } }), { Oslo: { a: 0, b: '<3', c: '<3', d: 3 } });
});

test('trend sier ingenting med for få saker', () => {
  const saker = (maned, n) => Array.from({ length: n }, () => ({ maned }));
  assert.equal(trend([...saker('2026-09', 5), ...saker('2026-04', 5)], NAA).retning, null);
  const t = trend([...saker('2026-09', 30), ...saker('2026-05', 20)], NAA);
  assert.equal(t.retning, 'verre');
  assert.equal(t.endring, 50);
  assert.equal(trend([...saker('2026-08', 10), ...saker('2026-04', 20)], NAA).retning, 'bedre');
});

test('offentlige tall uten https-kilde forkastes', () => {
  const rader = lesCsv('# kommentar\nperiode;maal;verdi;enhet;kildenavn;kilde_url\n2026-T2;Ventetid;61;dager;Hdir;https://hdir.no/x\n2026-T1;Ventetid;58;dager;Rykte;\n2026-T1;Ventetid;abc;dager;Hdir;https://hdir.no/y\n');
  const ok = validerOffisielt(rader);
  assert.equal(ok.length, 1);
  assert.equal(ok[0].verdi, 61);
});

test('aggregering teller per status, fylke og dødsfall', () => {
  const inn = validerInnmelding(gyldig, NAA).sak;
  const nyhet = klassifiser({ ...lesRss(xml)[0], feed: 'A' }, cfg);
  const s = aggreger({ innmeldt: [inn, { ...inn, status: 'dokumentert' }], nyheter: [nyhet], offisielt: [] }, NAA);
  assert.equal(s.totalt, 3);
  assert.deepEqual(s.perStatus, { dokumentert: 1, nyhetssak: 1, ubekreftet: 1 });
  assert.equal(s.dodsfall.nyhetssak, 1);
  assert.equal(s.perFylke.Vestland.totalt, 3);
  assert.equal(s.perFylke.Vestland.ubekreftet, '<3');
  assert.equal(Object.keys(s.perManed).length, 24);
  assert.equal(Object.keys(s.perManed).at(-1), '2026-10');
  assert.equal(JSON.stringify(s).includes(inn.maned + '"'), true);
  assert.equal(JSON.stringify(s).includes('Haukeland'), false, 'titler går ikke i statistikken');
});

test('robot og bygg ende til ende', async () => {
  const rot = await mkdtemp(join(tmpdir(), 'regnskap-'));
  await cp(join(ROT, 'config'), join(rot, 'config'), { recursive: true });
  await mkdir(join(rot, 'data', 'innmeldt'), { recursive: true });
  await writeFile(join(rot, 'data', 'innmeldt', 'x.json'), JSON.stringify(validerInnmelding(gyldig, NAA).sak));

  let kall = 0;
  const r = await kjorRobot(rot, async () => { if (kall++ === 0) throw new Error('nede'); return xml; });
  assert.match(r.logg[0], /FEIL nede/);
  assert.equal(r.totalt, 2);
  const igjen = await kjorRobot(rot, async () => xml);
  assert.equal(igjen.lagtTil, 0, 'kjøres daglig uten å dobbeltelle');

  const s = await byggStatistikk(rot, NAA);
  assert.equal(s.totalt, 3);
  const kilder = JSON.parse(await readFile(join(rot, 'public', 'data', 'kilder.json'), 'utf8'));
  assert.equal(kilder.length, 2);
  assert.ok(kilder.every((k) => k.url.startsWith('https://')));
});
