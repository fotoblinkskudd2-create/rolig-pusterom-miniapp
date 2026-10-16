const test = require('node:test');
const assert = require('node:assert');
const os = require('node:os'); const path = require('node:path'); const fs = require('node:fs');
process.env.DB_FILE = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'vl-')), 'db.json');
const server = require('../server');

test('registrer → sjekk inn → status → del → eksport → slett', async t => {
  await new Promise(r => server.listen(0, r));
  t.after(() => server.close());
  const base = `http://localhost:${server.address().port}`;
  let ck = '';
  const call = async (method, p, body) => {
    const r = await fetch(base + p, { method, headers: { 'Content-Type': 'application/json', cookie: ck }, body: body && JSON.stringify(body) });
    const sc = r.headers.get('set-cookie'); if (sc) ck = sc.split(';')[0];
    const txt = await r.text();
    return { status: r.status, body: r.headers.get('content-type').includes('json') ? JSON.parse(txt) : txt };
  };

  assert.equal((await call('GET', '/api/me')).status, 401);
  assert.equal((await call('POST', '/api/register', { email: 'a@b.no', password: 'kort' })).status, 400);
  assert.equal((await call('POST', '/api/register', { email: 'a@b.no', password: 'langtpassord' })).status, 200);
  assert.equal((await call('POST', '/api/checkins', { date: 'tull', sleep: 7, mood: 0, energy: 3, meds: true })).status, 400);

  for (let i = 1; i <= 12; i++) {
    const date = `2026-09-${String(i).padStart(2, '0')}`;
    const late = i > 10;
    const r = await call('POST', '/api/checkins', { date, sleep: late ? 4.5 : 7.5, mood: late ? 2 : 0, energy: late ? 5 : 3, meds: true });
    assert.equal(r.status, 200);
  }
  const me = await call('GET', '/api/me');
  assert.equal(me.body.status.level, 'red');

  const sh = await call('POST', '/api/share');
  const pub = await fetch(`${base}/api/share/${sh.body.shareToken}`).then(r => r.json());
  assert.deepEqual(Object.keys(pub).sort(), ['lastCheckin', 'level']);
  assert.equal(pub.level, 'red');

  const csv = await call('GET', '/api/export');
  assert.match(csv.body, /2026-09-12;4.5;2;5;ja/);

  assert.equal((await call('DELETE', '/api/account')).status, 200);
  assert.equal((await fetch(`${base}/api/share/${sh.body.shareToken}`)).status, 404);
});
