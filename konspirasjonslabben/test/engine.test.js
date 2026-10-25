'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const m = require('../lib/engine');

test('analyser: retorikk øker overbevisning, ledd senker sannsynlighet', () => {
  const kjedelig = m.analyser('Klokka ble stilt tilbake en time i natt. Det skjer hvert år.');
  const gal = m.analyser(
    'Tilfeldig? Klokka ble stilt tilbake SAMME natt som stormen kom!!! Det betyr at eliten styrer været, ' +
    'fordi de trenger mørket. Hvorfor snakker ingen om dette??? Gjør din egen research. Følg pengene.'
  );
  assert.ok(gal.overbevisning > kjedelig.overbevisning + 30);
  assert.ok(gal.sannsynlighet < kjedelig.sannsynlighet / 10);
  const ider = gal.teknikker.map((t) => t.id);
  for (const id of ['tilfeldig', 'de', 'taushet', 'research', 'penger']) assert.ok(ider.includes(id), id);
});

test('analyser: tåler tom og enorm input', () => {
  assert.equal(m.analyser('').overbevisning, 0);
  assert.ok(m.analyser('A'.repeat(100000)).overbevisning <= 100);
});

test('tallmagi finner alltid noe', () => {
  for (const inp of ['25.10.2026', 'Boelo', 'x', '9999999', 'Ola Nordmann 0150']) {
    const r = m.tallmagi(inp);
    assert.ok(r.treff.length > 0, inp);
  }
  assert.equal(m.tallmagi('').treff.length, 0);
});

test('tallmagi skiller rene treff fra juks', () => {
  const r = m.tallmagi('1814');
  assert.ok(r.treff.some((t) => t.mal === 1814 && !t.juks));
});

test('bokstavsum og tverrsum', () => {
  assert.equal(m.bokstavsum('abc'), 6);
  assert.equal(m.bokstavsum('å'), 29);
  assert.equal(m.tverrsum(2026), 10);
});

test('rød tråd: sirkel oppdages, duplikater og ugyldige brikker filtreres', () => {
  const r = m.vurderTraad([
    { fra: 'klokka', til: 'stormen', fordi: 'fordi samme natt' },
    { fra: 'stormen', til: 'klokka', fordi: 'duplikat' },
    { fra: 'stormen', til: 'sauer', fordi: 'fordi sauene merker vær' },
    { fra: 'sauer', til: 'klokka', fordi: 'tilfeldig?' },
    { fra: 'klokka', til: 'finnesikke', fordi: 'x' },
  ]);
  assert.equal(r.antall, 3);
  assert.equal(r.sirkel, true);
  assert.ok(Math.abs(r.sannsynlighet - 0.35 ** 3) < 1e-12);
  assert.equal(m.harSirkel([{ fra: 'a', til: 'b' }, { fra: 'b', til: 'c' }]), false);
});

test('sitatsmia: hull gir «...» og ukjente indekser ignoreres', () => {
  const ord = m.ordliste(m.PRESSEMELDING);
  const i1 = ord.indexOf('full');
  const r = m.vurderSitat([i1 - 2, i1 - 1, i1, i1 + 1, i1 + 2, i1 + 3, 999, -1, 'x']);
  assert.match(r.sitat, /Vi har full kontroll på tiden/);
  const r2 = m.vurderSitat([0, 5]);
  assert.match(r2.sitat, /\.\.\./);
  assert.equal(m.vurderSitat([]).sitat, '');
});

test('immun: fullt besvart gir 100 % immunitet og 0 % falsifiserbarhet', () => {
  const svar = m.MOTBEVIS.map(() => 'Akkurat det de vil at du skal tro. Hvem betalte?');
  const r = m.vurderImmun(svar);
  assert.equal(r.immunitet, 100);
  assert.equal(r.falsifiserbarhet, 0);
  assert.ok(r.monstre.length >= 2);
});

test('viral: rettelsen deles mindre enn løgnen', () => {
  const r = m.vurderViral('DE STJAL EN TIME!!! 🚨🚨 Tilfeldig? DEL FØR DE SLETTER DETTE!!');
  assert.ok(r.delinger > r.rettelseDelinger * 10);
  assert.ok(r.faktainnhold < 50);
});

test('vurder: ukjent nivå gir null', () => {
  assert.equal(m.vurder('finnes-ikke', {}), null);
});
