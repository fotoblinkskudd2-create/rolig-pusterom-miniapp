'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'klab-'));
process.env.ARKIV_FIL = path.join(dir, 'arkiv.json');
const { server } = require('../server');

let base;
test.before(() => new Promise((ok) => server.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; ok(); })));
test.after(() => new Promise((ok) => server.close(ok)));

const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('serverer forsiden og saken', async () => {
  const html = await fetch(base + '/').then((r) => r.text());
  assert.match(html, /Konspirasjons/);
  const sak = await fetch(base + '/api/sak').then((r) => r.json());
  assert.equal(sak.nivaer.length, 6);
  assert.ok(sak.pressemelding.length > 20);
});

test('stier utenfor public avvises', async () => {
  const r = await fetch(base + '/..%2Fserver.js');
  assert.notEqual(r.status, 200);
});

test('vurder og tallmagi', async () => {
  const v = await post('/api/vurder', { nivaa: 'cuibono', data: { tekst: 'Tilfeldig? Jeg bare spør.' } }).then((r) => r.json());
  assert.ok(v.overbevisning > 0);
  const bad = await post('/api/vurder', { nivaa: 'nope' });
  assert.equal(bad.status, 400);
  const t = await post('/api/tallmagi', { input: '25.10.2026' }).then((r) => r.json());
  assert.ok(t.treff.length > 0);
});

test('publiser, list og stem i arkivet', async () => {
  const kort = await post('/api/teorier', { alias: 'x', tekst: 'kort' });
  assert.equal(kort.status, 400);
  const r = await post('/api/teorier', { alias: 'Sannhetssøker1814', tekst: 'Tilfeldig? Klokka OG stormen samme natt!!!' });
  assert.equal(r.status, 201);
  const teori = await r.json();
  const s = await post(`/api/teorier/${teori.id}/stem`, { type: 'sjekket' }).then((x) => x.json());
  assert.equal(s.stemmer.sjekket, 1);
  const feilType = await post(`/api/teorier/${teori.id}/stem`, { type: 'hack' });
  assert.equal(feilType.status, 400);
  const liste = await fetch(base + '/api/teorier?sort=nye').then((x) => x.json());
  assert.equal(liste[0].id, teori.id);
  assert.ok(fs.existsSync(process.env.ARKIV_FIL));
});

test('ugyldig JSON gir 400', async () => {
  const r = await fetch(base + '/api/vurder', { method: 'POST', body: '{nei' });
  assert.equal(r.status, 400);
});
