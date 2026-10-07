const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('./engine.js');
const { HEADERS, VALID, series, b64 } = require('./fixtures.js');

const KEYS = ['analysis', 'refinement', 'iteration_count', 'constraints'];
const clone = o => JSON.parse(JSON.stringify(o));
const codes = r => r.constraints.errors.map(e => e.code);
function rejects(input, code) {
  const r = T.generate(input);
  assert.deepEqual(Object.keys(r), KEYS);
  assert.equal(r.constraints.passed, false);
  assert.equal(r.analysis.status, 'rejected');
  assert.equal(r.refinement, null);
  assert.ok(codes(r).includes(code), `forventet ${code}, fikk ${codes(r)}`);
  return r;
}
const withMod = (base, i, patch) => {
  const o = clone(base);
  Object.assign(o.modalities[i], patch);
  return o;
};

test('gyldige input: eksakte nøkler, schema pass, latency målt', () => {
  for (const [name, input] of Object.entries(VALID)) {
    const r = T.generate(input);
    assert.deepEqual(Object.keys(r), KEYS, name);
    assert.equal(r.constraints.passed, true, `${name}: ${JSON.stringify(r.constraints.errors)}`);
    assert.equal(r.analysis.causal_claim, false);
    assert.equal(typeof r.constraints.metrics.latency_ms, 'number');
    assert.ok(r.constraints.metrics.latency_ms < 500);
    assert.equal(r.iteration_count, 1);
    JSON.parse(JSON.stringify(r)); // JSON-serialiserbar
  }
});

test('ingen plassholder: mirror uten tekst får ikke oppdiktet problem', () => {
  const r = T.generate(VALID.mirrorImage);
  assert.equal('problem' in r.refinement.fields, false);
  assert.match(r.refinement.lab_prompt, /PROBLEM: Isolasjon\.\n/);
  assert.doesNotMatch(JSON.stringify(r), /stille isolasjon|lorem|TODO|placeholder/i);
});

test('statistikk: trend tolkes kun ved n ≥ 10 og p < 0.05', () => {
  const up = T.generate(VALID.historyUp).analysis.mood_trend;
  assert.equal(up.significant, true);
  assert.equal(up.direction, 'up');
  assert.ok(up.p < 0.05);
  const short = T.generate(VALID.historyShort).analysis.mood_trend;
  assert.equal(short.significant, false);
  assert.equal(short.p, null);
  assert.equal(short.direction, null);
  const flat = T.mannKendall(Array(15).fill(3));
  assert.equal(flat.significant, false);
  const noise = T.mannKendall([3, 1, 4, 1, 5, 2, 2, 3, 5, 1, 4, 2]);
  assert.equal(noise.significant, false);
});

test('korrelasjon ≠ kausalitet: samtidige grep og humør gir merknad, ingen effektpåstand', () => {
  const r = T.generate(VALID.historyUp);
  assert.equal(r.analysis.causal_claim, false);
  assert.ok(r.analysis.notes.some(n => /ikke årsak/.test(n)));
});

test('normalisering: null-bredde/kontrolltegn renses og gir ekstra iterasjon', () => {
  const r = T.generate(withMod(VALID.mirrorText, 0, { value: '​  Alene\u0007 igjen.  ﻿' }));
  assert.equal(r.constraints.passed, true);
  assert.equal(r.iteration_count, 2);
  assert.equal(r.refinement.fields.problem, 'Alene igjen.');
  assert.ok(r.constraints.warnings.some(w => w.code === 'W_SANITIZED'));
});

test('usortert serie sorteres med advarsel', () => {
  const o = clone(VALID.historyUp);
  o.modalities[0].points.reverse();
  const r = T.generate(o);
  assert.equal(r.constraints.passed, true);
  assert.ok(r.constraints.warnings.some(w => w.code === 'W_SORTED'));
  assert.equal(r.analysis.mood_trend.direction, 'up');
});

test('korrupte formater', async t => {
  await t.test('avkuttet JSON', () => rejects('{"schema_version":"1.0","source":"chec', 'E_PARSE'));
  await t.test('tom streng', () => rejects('', 'E_PARSE'));
  await t.test('JSON med BOM og søppel', () => rejects('﻿{"a":1}}', 'E_PARSE'));
  await t.test('null', () => rejects(null, 'E_ROOT_TYPE'));
  await t.test('liste som rot', () => rejects([VALID.checkin], 'E_ROOT_TYPE'));
  await t.test('tall-streng', () => rejects('42', 'E_ROOT_TYPE'));
  await t.test('__proto__-forurensing', () =>
    rejects('{"schema_version":"1.0","source":"checkin","modalities":[],"__proto__":{"x":1}}', 'E_FORBIDDEN_KEY'));
  await t.test('sirkulær referanse', () => {
    const o = clone(VALID.checkin); o.modalities[0].self = o; rejects(o, 'E_CYCLE');
  });
  await t.test('for dyp nesting', () => {
    const o = clone(VALID.checkin); o.tags = { a: { b: { c: { d: { e: { f: {} } } } } } }; rejects(o, 'E_DEPTH');
  });
  await t.test('korrupt base64', () =>
    rejects(withMod(VALID.mirrorImage, 0, { header: '/9j/4AAQ!!==' }), 'E_BASE64'));
  await t.test('base64 med feil padding', () =>
    rejects(withMod(VALID.mirrorImage, 0, { header: HEADERS.jpeg.slice(0, -1) }), 'E_BASE64'));
  await t.test('PNG-byte merket som JPEG', () =>
    rejects(withMod(VALID.mirrorImage, 0, { header: HEADERS.png }), 'E_MAGIC_MISMATCH'));
  await t.test('trunkert header', () =>
    rejects(withMod(VALID.mirrorImage, 0, { header: b64([0xff, 0xd8, 0xff]) }), 'E_HEADER_SHORT'));
  await t.test('nullbytes som bilde', () =>
    rejects(withMod(VALID.mirrorImage, 0, { header: b64(new Array(16).fill(0)) }), 'E_MAGIC_MISMATCH'));
  await t.test('ukjent mime', () =>
    rejects(withMod(VALID.mirrorImage, 0, { mime: 'image/svg+xml' }), 'E_MIME'));
  await t.test('mime i store bokstaver gjettes ikke', () =>
    rejects(withMod(VALID.mirrorImage, 0, { mime: 'IMAGE/JPEG' }), 'E_MIME'));
  await t.test('bilde 0 byte', () => rejects(withMod(VALID.mirrorImage, 0, { bytes: 0 }), 'E_TYPE'));
  await t.test('bilde for stort', () => rejects(withMod(VALID.mirrorImage, 0, { bytes: 26 * 1024 * 1024 }), 'E_SIZE'));
  await t.test('NaN-bredde', () => rejects(withMod(VALID.mirrorImage, 0, { width: NaN }), 'E_RANGE'));
  await t.test('ugyldig dato', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points[3].t = '2026-13-45T99:00:00Z'; rejects(o, 'E_TIMESTAMP');
  });
  await t.test('dato uten tidssone', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points[3].t = '2026-01-04T10:00:00'; rejects(o, 'E_TIMESTAMP');
  });
  await t.test('fremtidig dato', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points[3].t = '2099-01-01T00:00:00Z'; rejects(o, 'E_TIMESTAMP');
  });
  await t.test('serie for lang', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points = series(1001, () => 3); rejects(o, 'E_SIZE');
  });
  await t.test('tom serie', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points = []; rejects(o, 'E_EMPTY');
  });
});

test('skjema: udefinerte og manglende felt', async t => {
  await t.test('ukjent toppnivåfelt', () => rejects(Object.assign(clone(VALID.checkin), { mood: 3 }), 'E_UNDEFINED_FIELD'));
  await t.test('ukjent modalitetsfelt', () => rejects(withMod(VALID.checkin, 0, { confidence: 0.9 }), 'E_UNDEFINED_FIELD'));
  await t.test('ukjent punktfelt', () => {
    const o = clone(VALID.historyUp); o.modalities[0].points[0].note = 'x'; rejects(o, 'E_UNDEFINED_FIELD');
  });
  await t.test('undefined-verdi teller som manglende', () => rejects(withMod(VALID.checkin, 0, { value: undefined }), 'E_REQUIRED'));
  await t.test('mangler header', () => {
    const o = clone(VALID.mirrorImage); delete o.modalities[0].header; rejects(o, 'E_REQUIRED');
  });
  await t.test('feil schema_version', () => rejects(Object.assign(clone(VALID.checkin), { schema_version: '0.9' }), 'E_SCHEMA_VERSION'));
  await t.test('ukjent source', () => rejects(Object.assign(clone(VALID.checkin), { source: 'labben' }), 'E_ENUM'));
  await t.test('ukjent modalitet', () => rejects(withMod(VALID.checkin, 0, { type: 'audio' }), 'E_ENUM'));
  await t.test('intern type som modalitet', () => rejects(withMod(VALID.checkin, 0, { type: 'point' }), 'E_ENUM'));
  await t.test('modalities ikke liste', () => rejects(Object.assign(clone(VALID.checkin), { modalities: {} }), 'E_TYPE'));
  await t.test('mood som streng', () => rejects(withMod(VALID.checkin, 0, { value: '3' }), 'E_TYPE'));
  await t.test('mood desimal', () => rejects(withMod(VALID.checkin, 0, { value: 3.5 }), 'E_TYPE'));
  await t.test('mood utenfor skala', () => rejects(withMod(VALID.checkin, 0, { value: 6 }), 'E_RANGE'));
  await t.test('tom tekst etter rens', () => rejects(withMod(VALID.mirrorText, 0, { value: ' ​\n ' }), 'E_EMPTY'));
  await t.test('for lang tekst', () => rejects(withMod(VALID.mirrorText, 0, { value: 'ø'.repeat(2001) }), 'E_TEXT_LENGTH'));
  await t.test('ukjent lang', () => rejects(withMod(VALID.mirrorText, 0, { lang: 'no' }), 'E_ENUM'));
  await t.test('action utenfor liste', () => {
    const o = clone(VALID.historyUp); o.modalities[1].index = 7; rejects(o, 'E_RANGE');
  });
  await t.test('checkin uten mood', () => {
    const o = clone(VALID.checkin); o.modalities = [o.modalities[1]]; rejects(o, 'E_MODALITY_COMBO');
  });
  await t.test('bilde ikke tillatt i checkin', () => {
    const o = clone(VALID.checkin); o.modalities.push(clone(VALID.mirrorImage.modalities[0])); rejects(o, 'E_MODALITY_COMBO');
  });
  await t.test('to mood-verdier er tvetydig', () => {
    const o = clone(VALID.checkin); o.modalities.push({ type: 'mood', value: 1 }); rejects(o, 'E_DUPLICATE_MODALITY');
  });
});

test('tvetydige tag-verdier ignoreres aldri', async t => {
  const tag = tags => Object.assign(clone(VALID.mirrorText), { tags });
  for (const [label, tags] of [
    ['case-variant', { intensity: 'High' }],
    ['mellomrom', { intensity: ' low' }],
    ['flere verdier', { intensity: 'low/high' }],
    ['kommaliste', { context: 'stress,sleep' }],
    ['tom', { context: '' }],
    ['ukjent verdi', { intensity: 'extreme' }]
  ]) {
    await t.test(label, () => {
      const r = rejects(tag(tags), 'E_TAG_AMBIGUOUS');
      assert.ok(r.constraints.checks.find(c => c.id === 'C_TAGS' && !c.passed));
    });
  }
  await t.test('ukjent tag-nøkkel', () => rejects(tag({ mood: 'low' }), 'E_UNDEFINED_FIELD'));
  await t.test('tag som tall', () => rejects(tag({ intensity: 2 }), 'E_TYPE'));
});

test('fromCheckins: kjent lagringsformat konverteres, alt annet avvises', () => {
  const ok = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.UTC(2026, 1, 1 + i)).toISOString(), mood: String(5 - Math.floor(i / 3)), note: ''
  }));
  const r = T.generate(T.fromCheckins(ok));
  assert.equal(r.constraints.passed, true);
  assert.equal(r.analysis.mood_trend.direction, 'down');
  ok[2].mood = '3.5';
  assert.ok(codes(T.generate(T.fromCheckins(ok))).includes('E_TYPE'));
  ok[2].mood = '3'; ok[4].note = 'ekstra';
  assert.equal(T.generate(T.fromCheckins(ok)).constraints.passed, true); // note droppes bevisst av adapteren
});
