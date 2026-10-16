// node signal-core.test.js
const assert = require('assert');
const S = require('./signal-core.js');

const today = '2026-10-16';
function series(n, f) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push({ day: S.addDays(today, -i), ...f(i) });
  return out;
}
const normal = () => ({ sleep: 7.5, activity: 3, irritability: 2 });
let pass = 0;
function t(name, fn) { fn(); pass++; console.log('ok  ', name); }

t('lærer før 7 baseline-dager', () => {
  const r = S.evaluate(series(6, normal), today);
  assert.strictEqual(r.state, 'lærer');
});

t('stabil måned = rolig', () => {
  const r = S.evaluate(series(30, normal), today);
  assert.strictEqual(r.state, 'rolig');
  assert.strictEqual(r.baseline.sleep, 7.5);
});

t('én dårlig dag flagger ikke', () => {
  const e = series(30, i => i === 0 ? { sleep: 5, activity: 5, irritability: 4 } : normal());
  assert.strictEqual(S.evaluate(e, today).state, 'rolig');
});

t('to dager kort søvn + høy aktivitet = flagg opp', () => {
  const e = series(30, i => i <= 1 ? { sleep: 5, activity: 5, irritability: 2 } : normal());
  const r = S.evaluate(e, today);
  assert.strictEqual(r.state, 'flagg');
  assert.strictEqual(r.direction, 'opp');
});

t('to dager lang søvn + lav aktivitet = flagg ned', () => {
  const e = series(30, i => i <= 1 ? { sleep: 10, activity: 1, irritability: 2 } : normal());
  const r = S.evaluate(e, today);
  assert.strictEqual(r.state, 'flagg');
  assert.strictEqual(r.direction, 'ned');
});

t('to netter < 4 t flagger selv uten baseline', () => {
  const e = series(2, () => ({ sleep: 3, activity: 3, irritability: 2 }));
  const r = S.evaluate(e, today);
  assert.strictEqual(r.state, 'flagg');
  assert.ok(r.hard);
});

t('baseline er personlig: kortsover på 5,5 t flagger ikke på 5,5 t', () => {
  const e = series(30, () => ({ sleep: 5.5, activity: 4, irritability: 2 }));
  assert.strictEqual(S.evaluate(e, today).state, 'rolig');
});

t('bare irritabilitet høy (ett signal) flagger ikke', () => {
  const e = series(30, i => i <= 2 ? { sleep: 7.5, activity: 3, irritability: 5 } : normal());
  assert.strictEqual(S.evaluate(e, today).state, 'rolig');
});

console.log(`\n${pass} tester grønne`);
