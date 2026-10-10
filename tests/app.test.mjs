// Brukerkrav for Pusterom, kjørt i ekte Chromium (Playwright).
// Kjør: npm test        Mot en annen mappe: APP_DIR=/sti/til/app npm test
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = path.resolve(process.env.APP_DIR || repo);
const APP = pathToFileURL(path.join(APP_DIR, 'index.html')).href;
const MIRROR = pathToFileURL(path.join(APP_DIR, 'isolation-mirror.html')).href;
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

let browser;
before(async () => {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  browser = await chromium.launch({ executablePath });
});
after(async () => { await browser?.close(); });

// Ny kontekst per test = tom localStorage. Dialoger (alert/confirm) registreres i stedet for å blokkere.
async function open(url = APP, ctxOpts = {}, beforeGoto) {
  const context = await browser.newContext({ ...PHONE, acceptDownloads: true, ...ctxOpts });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const dialogs = [];
  const errors = [];
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  page.on('pageerror', (e) => errors.push(e.message));
  if (beforeGoto) await beforeGoto(page, context);
  await page.goto(url);
  return { context, page, dialogs, errors };
}

const visiblePage = (page) => page.$eval('.page.active', (e) => e.id);
const nav = (page, label) => page.locator('nav').getByRole('button', { name: label });

async function checkIn(page, mood, note = '') {
  await page.click(`.mood-btn[data-mood="${mood}"]`);
  if (note) await page.fill('#note', note);
  await page.getByRole('button', { name: 'Lagre sjekk-inn' }).click();
}

describe('Hjem og sjekk-inn', () => {
  test('lagring uten valgt humør gir rolig melding, ingen popup, ingenting lagres', async () => {
    const { context, page, dialogs } = await open();
    await page.click('text=Lagre sjekk-inn');
    assert.deepEqual(dialogs, [], 'ingen alert()');
    const msg = page.locator('#saveMsg');
    await msg.waitFor({ state: 'visible' });
    assert.match(await msg.textContent(), /Velg/);
    assert.equal(await page.evaluate(() => localStorage.getItem('checkins')), null);
    await context.close();
  });

  test('sjekk-inn med notat havner i historikken og i ukesoppsummeringen', async () => {
    const { context, page, errors } = await open();
    await checkIn(page, 2, 'Lang dag på jobb');
    await page.locator('#saveMsg').waitFor({ state: 'visible' });
    await nav(page, 'Historikk').click();
    const item = page.locator('.history-item').first();
    assert.match(await item.textContent(), /Lang dag på jobb/);
    assert.match(await item.textContent(), /Tungt/);
    assert.match(await page.textContent('#weekSummary'), /1 gang \(1 innsjekk\)/);
    assert.doesNotMatch(await page.textContent('#weekSummary'), /\b0 /, 'nuller skal ikke ramses opp');
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('siden sier tydelig at data blir på enheten', async () => {
    const { context, page } = await open();
    assert.match(await page.textContent('#page-hjem'), /blir på denne enheten/i);
    await context.close();
  });

  test('hjelpenumre er synlige og kan ringes direkte', async () => {
    const { context, page } = await open();
    for (const tel of ['tel:116123', 'tel:22400040', 'tel:113']) {
      assert.ok(await page.locator(`#page-hjem a[href="${tel}"]`).isVisible(), tel);
    }
    await context.close();
  });

  test('humørknappene har lesbare navn for skjermleser', async () => {
    const { context, page } = await open();
    const names = await page.$$eval('.mood-btn', (bs) => bs.map((b) => b.textContent.trim()));
    assert.equal(names.length, 5);
    for (const n of names) assert.match(n, /[A-Za-zÆØÅæøå]{3,}/, `knapp uten tekst: "${n}"`);
    await context.close();
  });
});

describe('Navigasjon', () => {
  test('«Pust med meg» åpner Pusterom og markerer Pusterom i menyen', async () => {
    const { context, page } = await open();
    await page.click('text=Pust med meg');
    assert.equal(await visiblePage(page), 'page-pusterom');
    const active = await page.$$eval('nav button.active, nav button[aria-current="page"]', (bs) => [...new Set(bs)].map((b) => b.textContent.trim()));
    assert.deepEqual(active.map((t) => t.replace(/\W+/gu, '')), ['Pusterom']);
    await context.close();
  });

  test('alle menyknapper viser riktig side og bare én er aktiv', async () => {
    const { context, page } = await open();
    for (const [label, id] of [['Små grep', 'page-grep'], ['Historikk', 'page-historikk'], ['Pusterom', 'page-pusterom'], ['Hjem', 'page-hjem']]) {
      await nav(page, label).click();
      assert.equal(await visiblePage(page), id);
      assert.equal(await page.locator('nav button[aria-current="page"]').count(), 1);
    }
    await context.close();
  });

  test('lenke direkte til #pusterom åpner Pusterom (snarvei fra hjemskjerm)', async () => {
    const { context, page } = await open(APP + '#pusterom');
    assert.equal(await visiblePage(page), 'page-pusterom');
    await context.close();
  });

  test('Isolation Mirror kan nås fra appen', async () => {
    const { context, page } = await open();
    await nav(page, 'Historikk').click();
    const link = page.locator('#page-historikk a[href="isolation-mirror.html"]');
    assert.ok(await link.isVisible());
    await link.click();
    await page.waitForURL(/isolation-mirror\.html$/);
    assert.equal(await page.textContent('h1'), 'Isolation Mirror');
    await context.close();
  });
});

describe('Sikkerhet og personvern', () => {
  test('HTML i notatet vises som tekst og kjøres ikke', async () => {
    const { context, page } = await open();
    const evil = '<img src=x onerror="document.title=\'XSS\'"><b>fet</b>';
    await checkIn(page, 3, evil);
    await nav(page, 'Historikk').click();
    await page.waitForTimeout(100);
    assert.notEqual(await page.title(), 'XSS');
    assert.equal(await page.locator('.history-item img, .history-item b').count(), 0);
    assert.match(await page.textContent('.history-item'), /<b>fet<\/b>/);
    await context.close();
  });

  test('hele brukerreisen gjør ingen nettverkskall', async () => {
    const outside = [];
    const { context, page } = await open(APP, {}, async (p) => {
      p.on('request', (r) => { if (!/^(file|data|blob):/.test(r.url())) outside.push(r.url()); });
    });
    await checkIn(page, 4, 'test');
    await nav(page, 'Pusterom').click();
    await nav(page, 'Små grep').click();
    await page.locator('.action-card button').first().click();
    await nav(page, 'Historikk').click();
    await page.goto(MIRROR);
    await page.fill('#note', 'alene');
    await page.click('text=Generer');
    assert.deepEqual(outside, []);
    await context.close();
  });

  test('sletting krever to trykk og fjerner alt', async () => {
    const { context, page, dialogs } = await open();
    await checkIn(page, 1, 'slett meg');
    await nav(page, 'Historikk').click();
    await page.click('#wipeBtn');
    assert.notEqual(await page.evaluate(() => localStorage.getItem('checkins')), null, 'ett trykk skal ikke slette');
    await page.click('#wipeBtn');
    assert.equal(await page.evaluate(() => localStorage.getItem('checkins')), null);
    assert.match(await page.textContent('#historyList'), /Ingen sjekk-inn/);
    assert.deepEqual(dialogs, []);
    await context.close();
  });
});

describe('Historikk kan tas med', () => {
  test('eksport til .txt inneholder dato, humør og notat', async () => {
    const { context, page } = await open();
    await checkIn(page, 5, 'Gikk tur\nfikk sove');
    await nav(page, 'Historikk').click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('text=Ta historikken med deg')]);
    assert.match(dl.suggestedFilename(), /^pusterom-historikk-\d{4}-\d{2}-\d{2}\.txt$/);
    const text = await readFile(await dl.path(), 'utf8');
    assert.match(text, /5\/5 Rolig/);
    assert.match(text, /Gikk tur\n\s+fikk sove/);
    await context.close();
  });

  test('sikkerhetskopi kan hentes inn igjen etter at nettleserdata er slettet', async () => {
    const { context, page } = await open();
    await checkIn(page, 2, 'før sletting');
    await nav(page, 'Historikk').click();
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#backupBtn')]);
    const backup = await dl.path();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await nav(page, 'Historikk').click();
    assert.match(await page.textContent('#historyList'), /Ingen sjekk-inn/);
    await page.setInputFiles('#restoreFile', backup);
    await page.locator('.history-item').first().waitFor();
    assert.match(await page.textContent('.history-item'), /før sletting/);
    // Samme fil to ganger skal ikke gi duplikater.
    await page.setInputFiles('#restoreFile', backup);
    await page.locator('#toast', { hasText: 'fantes allerede' }).waitFor();
    assert.equal(await page.locator('.history-item').count(), 1);
    await context.close();
  });

  test('feil fil ved gjenoppretting endrer ingenting og sier ifra', async () => {
    const { context, page } = await open();
    await checkIn(page, 3, 'skal overleve');
    await nav(page, 'Historikk').click();
    const dir = await mkdtemp(path.join(tmpdir(), 'pusterom-'));
    const bad = path.join(dir, 'feil.json');
    await writeFile(bad, '{"noe":"annet"}');
    await page.setInputFiles('#restoreFile', bad);
    await page.locator('#toast', { hasText: 'Ingenting ble endret' }).waitFor();
    assert.equal(await page.locator('.history-item').count(), 1);
    await context.close();
  });

  test('sikkerhetskopi med ondsinnet innhold blir renset', async () => {
    const { context, page } = await open();
    const dir = await mkdtemp(path.join(tmpdir(), 'pusterom-'));
    const file = path.join(dir, 'b.json');
    await writeFile(file, JSON.stringify({
      app: 'pusterom', version: 1,
      checkins: [
        { date: '2026-01-02T10:00:00Z', mood: 9, note: 'ugyldig humør' },
        { date: 'ikke-dato', mood: 2, note: 'ugyldig dato' },
        { date: '2026-01-03T10:00:00Z', mood: 2, note: '<img src=x onerror="document.title=1">' }
      ]
    }));
    await nav(page, 'Historikk').click();
    await page.setInputFiles('#restoreFile', file);
    await page.locator('#toast', { hasText: 'Hentet inn 1' }).waitFor();
    assert.equal(await page.locator('.history-item').count(), 1);
    assert.equal(await page.locator('.history-item img').count(), 0);
    await context.close();
  });

  test('data fra 1.1 (humør lagret som tekst) vises fortsatt', async () => {
    const { context, page } = await open(APP, {}, async (p) => {
      await p.addInitScript(() => {
        if (!localStorage.getItem('checkins')) {
          localStorage.setItem('checkins', JSON.stringify([{ date: new Date().toISOString(), mood: '4', note: 'gammel' }]));
        }
      });
    });
    await nav(page, 'Historikk').click();
    assert.match(await page.textContent('.history-item'), /gammel/);
    assert.match(await page.textContent('.history-item'), /🙂/);
    await context.close();
  });
});

describe('Pusterom', () => {
  test('rytmen er 4-2-6 og sirkelen bruker like lang tid som teksten', async () => {
    const { context, page } = await open(APP + '#pusterom', {}, async (p) => { await p.clock.install(); });
    await page.click('#breathBtn');
    const state = () => page.evaluate(() => ({
      text: document.getElementById('breathText').textContent,
      dur: getComputedStyle(document.getElementById('breathCircle')).transitionDuration.split(',')[0].trim()
    }));
    let s = await state();
    assert.equal(s.text, 'Pust inn…'); assert.equal(s.dur, '4s');
    await page.clock.runFor(4100);
    s = await state();
    assert.equal(s.text, 'Hold…');
    await page.clock.runFor(2000);
    s = await state();
    assert.equal(s.text, 'Pust ut…'); assert.equal(s.dur, '6s');
    await page.clock.runFor(6000);
    assert.equal((await state()).text, 'Pust inn…');
    await context.close();
  });

  test('en fullført runde teller som pusteøkt i oversikten', async () => {
    const { context, page } = await open(APP + '#pusterom', {}, async (p) => { await p.clock.install(); });
    await page.click('#breathBtn');
    await page.clock.runFor(12100);
    assert.match(await page.textContent('#breathRounds'), /1 runde/);
    await page.click('#breathBtn');
    await nav(page, 'Historikk').click();
    assert.match(await page.textContent('#weekSummary'), /1 pusteøkt/);
    await context.close();
  });

  test('å forlate Pusterom stopper pusten', async () => {
    const { context, page } = await open(APP + '#pusterom', {}, async (p) => { await p.clock.install(); });
    await page.click('#breathBtn');
    await nav(page, 'Hjem').click();
    await nav(page, 'Pusterom').click();
    assert.equal(await page.textContent('#breathBtn'), 'Start');
    await context.close();
  });

  test('redusert bevegelse: sirkelen skalerer ikke', async () => {
    const { context, page } = await open(APP + '#pusterom', { reducedMotion: 'reduce' }, async (p) => { await p.clock.install(); });
    await page.click('#breathBtn');
    const t = await page.$eval('#breathCircle', (e) => getComputedStyle(e).transform);
    assert.ok(t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)', t);
    await context.close();
  });
});

describe('Små grep', () => {
  test('merket grep huskes etter omlasting og kan angres', async () => {
    const { context, page } = await open(APP + '#grep');
    const first = page.locator('.action-card').first();
    await first.getByRole('button').click();
    await page.reload();
    await page.locator('.action-card.done').first().waitFor();
    assert.equal(await page.locator('.action-card.done').count(), 1);
    await page.locator('.action-card').first().getByRole('button').click();
    assert.equal(await page.locator('.action-card.done').count(), 0);
    await context.close();
  });
});

describe('Mobil og visning', () => {
  for (const width of [320, 390]) test(`ingen sideveis scrolling og menyen dekker ikke innhold på ${width} px`, async () => {
    const { context, page } = await open(APP, { viewport: { width, height: 700 } });
    await checkIn(page, 1, 'et langt notat '.repeat(40));
    for (const label of ['Hjem', 'Pusterom', 'Små grep', 'Historikk']) {
      await nav(page, label).click();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 0, `${label}: ${overflow}px for bredt`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const covered = await page.evaluate(() => {
        const navTop = document.querySelector('nav').getBoundingClientRect().top;
        const items = [...document.querySelectorAll('.page.active a, .page.active button, .page.active .summary')];
        const last = items[items.length - 1];
        return last ? last.getBoundingClientRect().bottom - navTop : -1;
      });
      assert.ok(covered <= 0, `${label}: siste element skjult ${covered}px under menyen`);
    }
    await context.close();
  });

  test('mørk modus gir mørk bakgrunn', async () => {
    const { context, page } = await open(APP, { colorScheme: 'dark' });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const [r, g, b] = bg.match(/\d+/g).map(Number);
    assert.ok(r + g + b < 150, bg);
    await context.close();
  });

  test('trykkflater er minst 44 px høye', async () => {
    const { context, page } = await open();
    for (const label of ['Hjem', 'Små grep', 'Historikk']) {
      await nav(page, label).click();
      const small = await page.$$eval('.page.active button, .page.active a, nav button', (els) =>
        els.filter((e) => e.offsetParent !== null && e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim()));
      assert.deepEqual(small, [], `${label}: for små trykkflater`);
    }
    await context.close();
  });
});

describe('Isolation Mirror', () => {
  test('genererer protokoll og prompt, og kopiering gir tilbakemelding', async () => {
    const { context, page } = await open(MIRROR, { permissions: ['clipboard-read', 'clipboard-write'] });
    await page.fill('#note', 'Ingen har ringt på en uke');
    await page.click('text=Generer');
    assert.match(await page.textContent('#labprompt'), /PROBLEM: Isolasjon\. Ingen har ringt på en uke/);
    assert.equal(await page.locator('#protocol p').count(), 4);
    await page.click('text=Kopier prompt');
    await page.locator('#copyStatus', { hasText: /Kopiert|markert/ }).waitFor();
    await context.close();
  });
});
