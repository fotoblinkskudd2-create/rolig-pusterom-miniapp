// FELLES TESTHJELP – lik i alle apper.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startApp, type RunningApp } from '../server/core/server.js';
import { appDef } from '../server/app/index.js';

export function tempDbPath() {
  const dir = mkdtempSync(join(tmpdir(), `${appDef.id}-test-`));
  return { dir, path: join(dir, 'test.db'), cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

export async function start(dbPath: string, distDir?: string, port = 0): Promise<RunningApp> {
  return startApp(appDef, { port, dbPath, distDir });
}

/** Chromium fra miljøet (PLAYWRIGHT_BROWSERS_PATH) eller CHROMIUM_PATH. */
export async function launchBrowser() {
  const { chromium } = await import('playwright-core');
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  try {
    return await chromium.launch({ executablePath });
  } catch (e) {
    return await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => {
      throw e;
    });
  }
}

/** Kontrollerer at siden ikke ruller horisontalt (390 px mobil). */
export async function assertNoHorizontalScroll(page: import('playwright-core').Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (r.sw > r.cw + 1) throw new Error(`Horisontal rulling: scrollWidth ${r.sw} > ${r.cw}`);
}

/** Små trykkflater: alle synlige knapper skal være minst 44 px høye. */
export async function assertTapTargets(page: import('playwright-core').Page) {
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('button, a.btn, summary')]
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .map((el) => ({ t: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h < 43.5)
  );
  if (small.length) throw new Error(`For små trykkflater: ${JSON.stringify(small)}`);
}

export class Client {
  token = '';
  constructor(public base: string) {}

  async req(method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(this.base + path, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
        ...headers
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
    return { status: res.status, body: json, headers: res.headers };
  }

  get(p: string) { return this.req('GET', p); }
  post(p: string, b: unknown = {}, h?: Record<string, string>) { return this.req('POST', p, b, h); }
  patch(p: string, b: unknown, h?: Record<string, string>) { return this.req('PATCH', p, b, h); }
  del(p: string, b: unknown = {}) { return this.req('DELETE', p, b); }

  async register(email: string, password = 'hemmelig123') {
    const r = await this.post('/api/auth/register', { email, password });
    if (r.status !== 201) throw new Error(`register feilet: ${JSON.stringify(r.body)}`);
    this.token = r.body.token;
    return r.body.user;
  }

  async login(email: string, password = 'hemmelig123') {
    const r = await this.post('/api/auth/login', { email, password });
    if (r.status !== 200) throw new Error(`login feilet: ${JSON.stringify(r.body)}`);
    this.token = r.body.token;
  }
}
