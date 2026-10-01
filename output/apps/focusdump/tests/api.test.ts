import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { tempDbPath, start, Client } from './helpers.js';
import type { RunningApp } from '../server/core/server.js';

const sample = { tasks: 'Rydde skrivebord\nSende tilbud\nBestille deler', minutes: 5 };

describe('FocusDump API', () => {
  const tmp = tempDbPath();
  let app: RunningApp;
  let a: Client;

  beforeAll(async () => {
    app = await start(tmp.path);
    a = new Client(app.url);
    await a.register('a@test.no');
  });
  afterAll(async () => {
    await app.close();
    tmp.cleanup();
  });

  it('krever innlogging', async () => {
    const r = await new Client(app.url).get('/api/tasks');
    expect(r.status).toBe(401);
    expect(r.body.error.message).toMatch(/Logg inn/);
  });

  it('avviser ugyldig input uten delvis lagring', async () => {
    for (const bad of [
      { tasks: '', minutes: 5 },
      { tasks: 'A', minutes: 0 },
      { tasks: 'A', minutes: 121 },
      { tasks: 'A', minutes: 2.5 },
      { tasks: 'A', minutes: 'fem' },
      { tasks: 'A\n' + 'x'.repeat(201), minutes: 5 },
      { tasks: Array.from({ length: 51 }, (_, i) => `t${i}`).join('\n'), minutes: 5 }
    ]) {
      const r = await a.post('/api/tasks/capture', bad);
      expect(r.status, JSON.stringify(bad)).toBe(400);
      expect(r.body.error.details.fields).toBeTypeOf('object');
    }
    expect((await a.get('/api/tasks')).body.tasks).toHaveLength(0);
  });

  it('grenseverdier 1 og 120 minutter godtas', async () => {
    const lo = await a.post('/api/tasks/capture', { tasks: 'Grense lav', minutes: 1 });
    const hi = await a.post('/api/tasks/capture', { tasks: 'Grense høy', minutes: 120 });
    expect(lo.status).toBe(201);
    expect(hi.status).toBe(201);
    for (const t of [...lo.body.tasks, ...hi.body.tasks]) {
      await a.post(`/api/tasks/${t.id}/archive`, { revision: t.revision });
    }
  });

  let first: any;
  it('kontrolleksempel ende-til-ende: fangst -> nå-kort -> start -> pause 60 s -> 240 s igjen -> gjenoppta', async () => {
    const cap = await a.post('/api/tasks/capture', sample);
    expect(cap.status).toBe(201);
    expect(cap.body.tasks.map((t: any) => t.text)).toEqual(['Rydde skrivebord', 'Sende tilbud', 'Bestille deler']);

    const now = await a.post('/api/now', { minutes: 5 });
    expect(now.status).toBe(200);
    expect(now.body.text).toBe('Rydde skrivebord');
    expect(now.body.state).toBe('ready');

    // Start 60 s tilbake i tid og pause nå => 240 s igjen (tidsstempelbasert).
    const t0 = Date.now() - 60_000;
    const started = await a.post(`/api/tasks/${now.body.id}/start`, { revision: now.body.revision, at: new Date(t0).toISOString() });
    expect(started.status).toBe(200);
    expect(started.body.session.duration_s).toBe(300);
    const paused = await a.post(`/api/tasks/${now.body.id}/pause`, { revision: started.body.revision, at: new Date(t0 + 60_000).toISOString() });
    expect(paused.body.state).toBe('paused');
    expect(paused.body.session.remaining_ms).toBe(240_000);

    // Etter "reload" er verdien den samme.
    const again = await a.get(`/api/tasks/${now.body.id}`);
    expect(again.body.session.remaining_ms).toBe(240_000);

    const resumed = await a.post(`/api/tasks/${now.body.id}/resume`, { revision: paused.body.revision });
    expect(resumed.body.state).toBe('active');
    expect(resumed.body.session.remaining_ms).toBeLessThanOrEqual(240_000);
    expect(resumed.body.session.remaining_ms).toBeGreaterThan(235_000);
    first = resumed.body;
  });

  it('bare ett nå-kort av gangen', async () => {
    const r = await a.post('/api/now', {});
    expect(r.status).toBe(409);
    expect(r.body.error.code).toBe('har_naa_kort');
  });

  it('ulovlig tilstandsendring avvises og data beholdes', async () => {
    const list = (await a.get('/api/tasks')).body.tasks;
    const inbox = list.find((t: any) => t.text === 'Sende tilbud');
    const r = await a.post(`/api/tasks/${inbox.id}/pause`, { revision: inbox.revision });
    expect(r.status).toBe(409);
    const s = await a.post(`/api/tasks/${inbox.id}/state`, { revision: inbox.revision, state: 'done' });
    expect(s.status).toBe(409);
    const after = await a.get(`/api/tasks/${inbox.id}`);
    expect(after.body.state).toBe('inbox');
    expect(after.body.revision).toBe(inbox.revision);
  });

  it('gammel revisjon gir konflikt med gjeldende versjon', async () => {
    const list = (await a.get('/api/tasks')).body.tasks;
    const t = list.find((x: any) => x.text === 'Bestille deler');
    const ok = await a.patch(`/api/tasks/${t.id}`, { revision: t.revision, text: 'Bestille deler i dag' });
    expect(ok.status).toBe(200);
    expect(ok.body.revision).toBe(t.revision + 1);
    const stale = await a.patch(`/api/tasks/${t.id}`, { revision: t.revision, text: 'Gammel versjon' });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('konflikt');
    expect(stale.body.error.details.current.text).toBe('Bestille deler i dag');
  });

  it('dobbel innsending med samme operasjons-id gir én post', async () => {
    const before = (await a.get('/api/tasks')).body.tasks.length;
    const h = { 'Idempotency-Key': 'op-dobbel-1' };
    const r1 = await a.post('/api/tasks/capture', { tasks: 'Ring rørlegger', minutes: 5 }, h);
    const r2 = await a.post('/api/tasks/capture', { tasks: 'Ring rørlegger', minutes: 5 }, h);
    expect(r1.status).toBe(201);
    expect(r2.status).toBe(201);
    expect(r2.headers.get('idempotent-replay')).toBe('true');
    expect(r2.body.tasks[0].id).toBe(r1.body.tasks[0].id);
    expect((await a.get('/api/tasks')).body.tasks.length).toBe(before + 1);
  });

  it('klientgenerert id (offline) gjentatt gir ikke dobbel post', async () => {
    const id = crypto.randomUUID();
    const r1 = await a.post('/api/tasks/capture', { tasks: 'Offline oppgave', minutes: 5, ids: [id] });
    const r2 = await a.post('/api/tasks/capture', { tasks: 'Offline oppgave', minutes: 5, ids: [id] });
    expect(r1.body.tasks[0].id).toBe(id);
    expect(r2.body.tasks[0].id).toBe(id);
    expect((await a.get('/api/tasks')).body.tasks.filter((t: any) => t.id === id)).toHaveLength(1);
  });

  it('omprioritering flytter oppgaven opp', async () => {
    const list = (await a.get('/api/tasks')).body.tasks.filter((t: any) => t.state === 'inbox');
    const last = list[list.length - 1];
    const r = await a.post(`/api/tasks/${last.id}/move`, { revision: last.revision, direction: 'up' });
    expect(r.status).toBe(200);
    const after = (await a.get('/api/tasks')).body.tasks.filter((t: any) => t.state === 'inbox');
    expect(after[after.length - 2].id).toBe(last.id);
    const top = after[0];
    const up = await a.post(`/api/tasks/${top.id}/move`, { revision: top.revision, direction: 'up' });
    expect(up.status).toBe(409);
  });

  it('arkiv kan gjenåpnes; sletting krever arkiv og bekreftelse', async () => {
    const t = (await a.get('/api/tasks')).body.tasks.find((x: any) => x.text === 'Ring rørlegger');
    const noConfirm = await a.del(`/api/tasks/${t.id}`, {});
    expect(noConfirm.status).toBe(400);
    const notArchived = await a.del(`/api/tasks/${t.id}`, { confirm: true });
    expect(notArchived.status).toBe(409);
    const arch = await a.post(`/api/tasks/${t.id}/archive`, { revision: t.revision });
    expect(arch.body.archived_at).not.toBeNull();
    expect((await a.get('/api/tasks?archived=1')).body.tasks.some((x: any) => x.id === t.id)).toBe(true);
    const un = await a.post(`/api/tasks/${t.id}/unarchive`, { revision: arch.body.revision });
    expect(un.body.archived_at).toBeNull();
    const arch2 = await a.post(`/api/tasks/${t.id}/archive`, { revision: un.body.revision });
    const del = await a.del(`/api/tasks/${t.id}`, { confirm: true });
    expect(del.status).toBe(200);
    expect((await a.get(`/api/tasks/${t.id}`)).status).toBe(404);
    expect(arch2.status).toBe(200);
  });

  it('kan ikke arkivere en pågående økt', async () => {
    const r = await a.post(`/api/tasks/${first.id}/archive`, { revision: first.revision });
    expect(r.status).toBe(409);
  });

  it('ferdig avslutter økten og daglig oversikt teller den', async () => {
    const cur = (await a.get(`/api/tasks/${first.id}`)).body;
    const done = await a.post(`/api/tasks/${first.id}/finish`, { revision: cur.revision });
    expect(done.body.state).toBe('done');
    expect(done.body.session).toBeNull();
    const today = await a.get(`/api/today?tz=${new Date().getTimezoneOffset()}`);
    expect(today.body.done).toBeGreaterThanOrEqual(1);
    expect(today.body.sessions).toBeGreaterThanOrEqual(1);
    expect(today.body.message).toMatch(/ferdig/);
  });

  it('eksport har versjon, tidspunkt, felter og stemmer med databasen', async () => {
    const r = await a.get('/api/export');
    expect(r.body.format).toBe('focusdump-eksport');
    expect(r.body.format_version).toBe(1);
    expect(Date.parse(r.body.exported_at)).not.toBeNaN();
    expect(Object.keys(r.body.fields).length).toBeGreaterThan(5);
    const db = new DatabaseSync(tmp.path, { readOnly: true });
    const me = (await a.get('/api/auth/me')).body.user;
    const rows = db.prepare('SELECT * FROM tasks WHERE owner_id = ? ORDER BY position').all(me.id);
    const sessions = db.prepare('SELECT * FROM focus_sessions WHERE owner_id = ?').all(me.id);
    db.close();
    expect(r.body.data.tasks).toEqual(rows.map((x) => ({ ...x })));
    expect(r.body.data.sessions).toHaveLength(sessions.length);
    const csv = await a.get('/api/export?format=csv');
    expect(csv.headers.get('content-type')).toMatch(/text\/csv/);
    expect(String(csv.body).split('\n').length).toBe(rows.length + 2);
  });

  it('konto B kan ikke lese eller endre konto A', async () => {
    const b = new Client(app.url);
    await b.register('b@test.no');
    expect((await b.get('/api/tasks')).body.tasks).toHaveLength(0);
    expect((await b.get(`/api/tasks/${first.id}`)).status).toBe(404);
    expect((await b.patch(`/api/tasks/${first.id}`, { revision: 1, text: 'hack' })).status).toBe(404);
    expect((await b.post(`/api/tasks/${first.id}/archive`, { revision: 1 })).status).toBe(404);
    expect((await b.get('/api/export')).body.data.tasks).toHaveLength(0);
    // Klientgenerert id fra A kan ikke kapres av B.
    const aTask = (await a.get('/api/tasks')).body.tasks[0];
    const steal = await b.post('/api/tasks/capture', { tasks: 'x', minutes: 5, ids: [aTask.id] });
    expect(steal.status).toBe(409);
  });

  it('data overlever serverrestart', async () => {
    const before = (await a.get('/api/tasks')).body.tasks;
    await app.close();
    app = await start(tmp.path);
    a.base = app.url;
    const after = (await a.get('/api/tasks')).body.tasks;
    expect(after.map((t: any) => [t.id, t.text, t.state, t.revision])).toEqual(
      before.map((t: any) => [t.id, t.text, t.state, t.revision])
    );
  });

  it('feil passord og ugyldig JSON gir konkret feil', async () => {
    const c = new Client(app.url);
    const r = await c.post('/api/auth/login', { email: 'a@test.no', password: 'feilfeilfeil' });
    expect(r.status).toBe(401);
    const raw = await fetch(app.url + '/api/tasks/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${a.token}` },
      body: '{ikke json'
    });
    expect(raw.status).toBe(400);
  });
});
