// Fiktive demodata. Oppretter kontoen demo@focusdump.local (passord: demo-passord) – merket DEMO.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { buildApp } from './core/server.js';
import { appDef } from './app/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, here.includes('dist-server') ? '../..' : '..');
const dbPath = process.env.DB_PATH ?? resolve(root, 'data', `${appDef.id}.db`);
const { server, db } = buildApp(appDef, { dbPath });
await new Promise<void>((r) => server.listen(0, '127.0.0.1', () => r()));
const base = `http://127.0.0.1:${(server.address() as any).port}`;
const call = async (method: string, path: string, body: unknown, token?: string) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body)
  });
  return { status: res.status, body: (await res.json()) as any };
};
let r = await call('POST', '/api/auth/register', { email: 'demo@focusdump.local', password: 'demo-passord' });
if (r.status === 409) r = await call('POST', '/api/auth/login', { email: 'demo@focusdump.local', password: 'demo-passord' });
const token = r.body.token;
await call('POST', '/api/tasks/capture', { tasks: 'DEMO: Rydde skrivebord\nDEMO: Sende tilbud\nDEMO: Bestille deler', minutes: 5 }, token);
console.log(`Demodata lagt inn i ${dbPath}. Logg inn med demo@focusdump.local / demo-passord.`);
server.close();
db.close();
