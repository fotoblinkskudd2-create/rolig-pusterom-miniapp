const test = require('node:test');
const assert = require('node:assert');
const { evaluate } = require('../engine');

function days(n, f) {
  const out = [];
  const start = Date.parse('2026-09-01');
  for (let i = 0; i < n; i++) {
    out.push({ date: new Date(start + i * 864e5).toISOString().slice(0, 10), sleep: 7.5, mood: 0, energy: 3, meds: true, ...f(i) });
  }
  return out;
}

test('stabil periode gir grønt', () => {
  assert.equal(evaluate(days(14, () => ({}))).level, 'green');
});

test('to netter med søvnfall gir gult', () => {
  const r = evaluate(days(14, i => i >= 12 ? { sleep: 5 } : {}));
  assert.equal(r.level, 'yellow');
  assert.ok(r.hits.some(h => h.id === 'sleep_drop'));
});

test('søvnfall + høy stemning gir rødt', () => {
  const r = evaluate(days(14, i => i >= 11 ? { sleep: 5, mood: 2 } : {}));
  assert.equal(r.level, 'red');
});

test('hull i datoer bryter rekken', () => {
  const d = days(14, i => i >= 12 ? { sleep: 4 } : {});
  d.splice(12, 1);
  assert.equal(evaluate(d).hits.filter(h => h.id === 'sleep_drop').length, 0);
});

test('for lite data gir ingen søvnvarsel', () => {
  assert.equal(evaluate(days(3, () => ({ sleep: 3 }))).hits.filter(h => h.id.startsWith('sleep')).length, 0);
});

test('glemt medisin to dager gir gult', () => {
  const r = evaluate(days(10, i => i >= 8 ? { meds: false } : {}));
  assert.equal(r.level, 'yellow');
});

test('avslåtte regler ignoreres', () => {
  const rules = require('../engine').DEFAULT_RULES.map(r => ({ ...r, on: false }));
  assert.equal(evaluate(days(10, () => ({ meds: false, sleep: 2 })), rules).level, 'green');
});
