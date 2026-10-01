// Starter appen på loopback. Miljø: PORT, HOST, DB_PATH, SECURE_COOKIES=1.
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { startApp } from './core/server.js';
import { appDef } from './app/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, here.includes('dist-server') ? '../..' : '..');
const port = Number(process.env.PORT ?? 8787);
const host = process.env.HOST ?? '127.0.0.1';
const dbPath = process.env.DB_PATH ?? resolve(root, 'data', `${appDef.id}.db`);

const app = await startApp(appDef, {
  port,
  host,
  dbPath,
  distDir: resolve(root, 'dist'),
  secureCookies: process.env.SECURE_COOKIES === '1',
  log: process.env.LOG === '1',
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()).filter(Boolean)
});
console.log(`${appDef.name} kjører på http://${host}:${port} (database: ${dbPath})`);

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    await app.close();
    process.exit(0);
  });
}
