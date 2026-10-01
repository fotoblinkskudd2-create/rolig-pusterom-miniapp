// Ende-til-ende i ekte Chromium mot bygget app og ekte SQLite-database.
// Krever `npm run build` først (gjøres av `npm run test:all`).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { tempDbPath, start, launchBrowser, assertNoHorizontalScroll, assertTapTargets } from './helpers.js';
import type { RunningApp } from '../server/core/server.js';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const shots = resolve(root, '../../../rapporter/focusdump/skjermbilder');

describe('FocusDump ende-til-ende (390 px)', () => {
  const tmp = tempDbPath();
  let app: RunningApp;
  let port: number;
  let browser: Browser;
  let ctx: BrowserContext;
  let page: Page;

  beforeAll(async () => {
    if (!existsSync(resolve(dist, 'index.html'))) throw new Error('Kjør npm run build først.');
    mkdirSync(shots, { recursive: true });
    app = await start(tmp.path, dist);
    port = Number(new URL(app.url).port);
    browser = await launchBrowser();
    ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'nb-NO' });
    page = await ctx.newPage();
  });

  afterAll(async () => {
    await browser?.close();
    await app?.close();
    tmp.cleanup();
  });

  it('tomtilstand og registrering', async () => {
    await page.goto(app.url);
    await page.getByRole('button', { name: 'Ny her? Lag konto' }).click();
    await page.getByLabel('E-post').fill('alexander@demo.local');
    await page.getByLabel('Passord').fill('demo-passord-1');
    await page.getByRole('button', { name: 'Lag konto' }).click();
    await page.getByText('Innboksen er tom.').waitFor();
    await assertNoHorizontalScroll(page);
    await assertTapTargets(page);
    await page.screenshot({ path: `${shots}/01-tom.png` });
  });

  it('feil input vises ved feltet og lagres ikke', async () => {
    await page.getByRole('button', { name: 'Tøm hodet' }).click();
    await page.getByLabel('Oppgaver, én per linje').fill('Noe');
    await page.getByLabel('Tilgjengelige minutter per oppgave').fill('121');
    await page.getByRole('button', { name: 'Legg i innboksen' }).click();
    await page.getByText('Tilgjengelige minutter må være mellom 1 og 120.').waitFor();
    await page.screenshot({ path: `${shots}/02-feil.png` });
    expect(await page.getByText('Ingenting i innboksen.').isVisible()).toBe(true);
  });

  it('egen input -> Lag nå-kort -> start -> pause', async () => {
    await page.getByLabel('Oppgaver, én per linje').fill('Rydde skrivebord\nSende tilbud\nBestille deler');
    await page.getByLabel('Tilgjengelige minutter per oppgave').fill('5');
    await page.getByRole('button', { name: 'Legg i innboksen' }).click();
    await page.getByText('Innboks (3)').waitFor();
    await page.screenshot({ path: `${shots}/03-innboks.png` });

    await page.getByRole('button', { name: 'Nå', exact: true }).click();
    await page.getByRole('button', { name: 'Lag nå-kort' }).click();
    await page.getByRole('heading', { name: 'Rydde skrivebord' }).waitFor();
    await page.getByRole('button', { name: 'Start 5 min' }).click();
    await page.getByRole('button', { name: 'Pause' }).waitFor();
    await page.waitForTimeout(1200);
    await page.getByRole('button', { name: 'Pause' }).click();
    await page.getByRole('button', { name: 'Fortsett' }).waitFor();
    const t1 = await page.getByRole('timer').textContent();
    await page.waitForTimeout(1500);
    expect(await page.getByRole('timer').textContent()).toBe(t1); // står stille under pause
    expect(t1).toMatch(/^4:5\d$/);
    await assertNoHorizontalScroll(page);
    await assertTapTargets(page);
    await page.screenshot({ path: `${shots}/04-naa-kort-pause.png` });
  });

  it('endre ett felt og se lagringsstatus', async () => {
    await page.getByRole('button', { name: 'Innboks' }).click();
    const row = page.locator('li', { hasText: 'Sende tilbud' });
    await row.getByRole('button', { name: 'Endre' }).click();
    await page.getByLabel('Oppgave', { exact: true }).fill('Sende tilbud til Bergen verksted');
    await page.getByRole('button', { name: 'Lagre' }).click();
    await page.getByText('Sende tilbud til Bergen verksted').waitFor();
    await page.getByText('· Lagret').waitFor();
  });

  it('konflikt ved gammel revisjon vises med "Hent ny versjon"', async () => {
    const row = page.locator('li', { hasText: 'Bestille deler' });
    await row.getByRole('button', { name: 'Endre' }).click();
    // Endring fra "en annen enhet" mens skjemaet er åpent.
    const r = await page.request.get(`${app.url}/api/tasks`);
    const t = (await r.json()).tasks.find((x: any) => x.text === 'Bestille deler');
    await page.request.patch(`${app.url}/api/tasks/${t.id}`, { data: { revision: t.revision, text: 'Bestille deler (annen enhet)' } });
    await page.getByLabel('Oppgave', { exact: true }).fill('Bestille deler – min versjon');
    await page.getByRole('button', { name: 'Lagre' }).click();
    await page.getByText('Posten er endret et annet sted').waitFor();
    await page.screenshot({ path: `${shots}/05-konflikt.png` });
    await page.getByRole('button', { name: 'Hent ny versjon' }).click();
    await expect.poll(() => page.getByLabel('Oppgave', { exact: true }).inputValue()).toBe('Bestille deler (annen enhet)');
    await page.getByRole('button', { name: 'Avbryt' }).click();
  });

  it('data og pauset timer overlever serverrestart og reload', async () => {
    await app.close();
    app = await start(tmp.path, dist, port);
    await page.reload();
    await page.getByRole('button', { name: 'Fortsett' }).waitFor();
    expect(await page.getByRole('heading', { name: 'Rydde skrivebord' }).isVisible()).toBe(true);
    expect(await page.getByRole('timer').textContent()).toMatch(/^4:5\d$/);
  });

  it('offline: fangst legges i kø og synkroniseres én gang', async () => {
    await page.getByRole('button', { name: 'Innboks' }).click();
    await ctx.setOffline(true);
    await page.getByLabel('Oppgaver, én per linje').fill('Ringe rørlegger');
    await page.getByRole('button', { name: 'Legg i innboksen' }).click();
    await page.getByText('Lagret på enheten. Sendes når nettet er tilbake.').waitFor();
    await page.getByText('1 venter på nett').waitFor();
    await page.screenshot({ path: `${shots}/06-offline-ko.png` });
    // Nettet tilbake: køen sendes automatisk med samme operasjons-id.
    await ctx.setOffline(false);
    await page.getByRole('status').filter({ hasText: /^Synkronisert$/ }).waitFor({ timeout: 30000 });
    await page.getByText('ikke synkronisert').waitFor({ state: 'detached' });
    await page.getByText('Ringe rørlegger').waitFor();
    const db = new DatabaseSync(tmp.path, { readOnly: true });
    const n = db.prepare("SELECT COUNT(*) AS n FROM tasks WHERE text = 'Ringe rørlegger'").get() as any;
    db.close();
    expect(n.n).toBe(1);
  });

  it('ferdig, i dag og eksport stemmer med databasen', async () => {
    await page.getByRole('button', { name: 'Nå', exact: true }).click();
    await page.getByRole('button', { name: 'Ferdig' }).click();
    await page.getByRole('button', { name: 'Lag nå-kort' }).waitFor();
    await page.getByRole('button', { name: 'I dag' }).click();
    await page.getByText('Du har gjort ferdig 1 ting i dag.').waitFor();
    await page.screenshot({ path: `${shots}/07-i-dag.png` });
    await page.getByRole('button', { name: 'Historikk' }).click();
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Last ned JSON' }).click()]);
    const path = await download.path();
    const exported = JSON.parse((await import('node:fs')).readFileSync(path!, 'utf8'));
    const db = new DatabaseSync(tmp.path, { readOnly: true });
    const rows = db.prepare('SELECT * FROM tasks ORDER BY position').all();
    db.close();
    expect(exported.format_version).toBe(1);
    expect(exported.data.tasks).toEqual(rows.map((r) => ({ ...r })));
    await page.screenshot({ path: `${shots}/08-historikk.png` });
  });

  it('tastatur og tekstskalering 200 %', async () => {
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'SUMMARY', 'INPUT']).toContain(tag);
    await page.addStyleTag({ content: 'html{font-size:200% !important}' });
    await page.getByRole('button', { name: 'Nå', exact: true }).click();
    await assertNoHorizontalScroll(page);
    await page.screenshot({ path: `${shots}/09-tekst-200.png` });
  });

  it('desktop-bredde', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    await page.getByRole('button', { name: 'Innboks' }).click();
    await assertNoHorizontalScroll(page);
    await page.screenshot({ path: `${shots}/10-desktop.png` });
  });
});
