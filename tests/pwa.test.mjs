// PWA: installerbar og brukbar uten nett. Service worker krever http, så her brukes tools/serve.mjs.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createServer } from '../tools/serve.mjs';

let browser, server, base;
before(async () => {
  browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  server = createServer();
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${server.address().port}/`;
});
after(async () => {
  await browser?.close();
  await new Promise((r) => server.close(r));
});

test('manifestet er gyldig og alle ikoner finnes', async () => {
  const res = await fetch(base + 'manifest.webmanifest');
  assert.equal(res.status, 200);
  const m = await res.json();
  assert.equal(m.display, 'standalone');
  assert.ok(m.icons.some((i) => i.sizes === '192x192'));
  assert.ok(m.icons.some((i) => i.sizes === '512x512'));
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
  for (const icon of m.icons) {
    const r = await fetch(new URL(icon.src, base + 'manifest.webmanifest'));
    assert.equal(r.status, 200, icon.src);
  }
  for (const s of m.shortcuts) assert.equal((await fetch(new URL(s.url, base))).status, 200, s.url);
  assert.equal((await fetch(base + 'icons/apple-touch-icon.png')).status, 200);
});

test('alle filer service workeren mellomlagrer finnes', async () => {
  const sw = await (await fetch(base + 'sw.js')).text();
  const list = JSON.parse(sw.match(/const SHELL = (\[[\s\S]*?\]);/)[1].replace(/'/g, '"'));
  for (const f of list) assert.equal((await fetch(new URL(f, base))).status, 200, f);
});

test('appen, Isolation Mirror og Systemrommet åpner uten nett etter første besøk', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base + 'index.html');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  assert.equal(await page.textContent('h1'), 'Hei. Du er trygg her.');
  // Lagring virker også offline.
  await page.click('.mood-btn[data-mood="3"]');
  await page.click('#saveBtn');
  await page.locator('#saveMsg').waitFor({ state: 'visible' });
  await page.goto(base + 'isolation-mirror.html');
  assert.equal(await page.textContent('h1'), 'Isolation Mirror');
  await page.goto(base + 'systemrom.html');
  assert.equal(await page.textContent('h1'), 'Systemrommet');
  await page.goto(base + 'index.html#pusterom');
  assert.equal(await page.$eval('.page.active', (e) => e.id), 'page-pusterom');
  await context.close();
});
