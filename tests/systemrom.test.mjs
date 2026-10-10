// Brukerkrav for Systemrommet: hvem er her, lapper, kjøpsbrems 48 t, og at alt følger med i
// sikkerhetskopi og «Slett alt» i Pusterom. Kjør: npm test
import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP_DIR = path.resolve(process.env.APP_DIR || repo);
const ROOM = pathToFileURL(path.join(APP_DIR, 'systemrom.html')).href;
const APP = pathToFileURL(path.join(APP_DIR, 'index.html')).href;
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const H = 60 * 60 * 1000;

let browser;
before(async () => { browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined }); });
after(async () => { await browser?.close(); });

// seed: { nøkkel: verdi } skrives til localStorage før siden laster (bare første gang).
async function open(url = ROOM, seed) {
  const context = await browser.newContext({ ...PHONE, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const errors = [];
  const dialogs = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('dialog', (d) => { dialogs.push(d.message()); d.dismiss(); });
  if (seed) {
    await context.addInitScript((s) => {
      if (sessionStorage.getItem('seeded')) return;
      sessionStorage.setItem('seeded', '1');
      for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v));
    }, seed);
  }
  await page.goto(url);
  return { context, page, errors, dialogs };
}

async function logIn(page, name) {
  await page.fill('#frontName', name);
  await page.click('#frontBtn');
}
const ls = (page, key) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key);

describe('Systemrommet', () => {
  test('kan nås fra forsiden i Pusterom', async () => {
    const { context, page } = await open(APP);
    await page.locator('#page-hjem a[href="systemrom.html"]').click();
    await page.waitForURL(/systemrom\.html$/);
    assert.equal(await page.textContent('h1'), 'Systemrommet');
    await context.close();
  });

  test('hvem er her: navn logges, blir en knapp, og «mens du var borte» viser det som skjedde', async () => {
    const { context, page, errors } = await open();
    await logIn(page, 'Kari');
    assert.match(await page.textContent('#nowLine'), /Kari har vært her siden/);
    assert.match(await page.textContent('#away'), /Første gang Kari/);
    await logIn(page, 'Lille');
    await page.fill('#noteText', 'Ikke åpne pakken før fredag');
    await page.click('#noteBtn');
    // Kari kommer tilbake via knappen og får se hva Lille gjorde.
    await page.getByRole('button', { name: 'Logg at Kari er her' }).click();
    const away = await page.textContent('#away');
    assert.match(away, /Kari var sist her/);
    assert.match(away, /Lille var her/);
    assert.match(away, /Lapp fra Lille til alle: «Ikke åpne pakken før fredag»/);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('to innlogginger på rad skjuler ikke det andre gjorde før', async () => {
    const t = (h) => new Date(Date.now() - h * H).toISOString();
    const { context, page } = await open(ROOM, {
      'systemrom.front': [
        { id: 'f3', at: t(0.1), name: 'Kari', note: '' },
        { id: 'f2', at: t(20), name: 'Lille', note: '' },
        { id: 'f1', at: t(30), name: 'Kari', note: '' }
      ],
      'systemrom.lapper': [{ id: 'n1', at: t(19), from: 'Lille', to: 'Kari', text: 'Pakken er min', readBy: [] }]
    });
    await logIn(page, 'Kari');
    const away = await page.textContent('#away');
    assert.match(away, /Kari var sist her .*Det er 30 t/);
    assert.match(away, /Lille var her/);
    assert.match(away, /Pakken er min/);
    await context.close();
  });

  test('tomt navn logges som «vet ikke»', async () => {
    const { context, page } = await open();
    await page.click('#frontBtn');
    assert.match(await page.textContent('#nowLine'), /vet ikke har vært her/);
    await context.close();
  });

  test('lapper: «til deg», kan merkes som sett, og fjerning krever to trykk', async () => {
    const { context, page } = await open();
    await logIn(page, 'Kari');
    await page.fill('#noteTo', 'Lille');
    await page.fill('#noteText', 'Spiste klokka 12');
    await page.click('#noteBtn');
    assert.doesNotMatch(await page.textContent('#notes'), /til deg/, 'ikke til Kari');
    await logIn(page, 'lille'); // store/små bokstaver spiller ingen rolle
    assert.match(await page.textContent('#notes'), /til deg/);
    await page.getByRole('button', { name: 'Jeg har sett den' }).click();
    assert.match(await page.textContent('#notes'), /Sett av lille/);
    const remove = page.locator('#notes').getByRole('button', { name: 'Fjern' });
    await remove.click();
    assert.equal((await ls(page, 'systemrom.lapper')).length, 1, 'ett trykk fjerner ikke');
    await page.locator('#notes').getByRole('button', { name: 'Trykk igjen for å fjerne' }).click();
    assert.equal((await ls(page, 'systemrom.lapper')).length, 0);
    await context.close();
  });

  test('tom lapp lagres ikke og gir rolig melding, ingen popup', async () => {
    const { context, page, dialogs } = await open();
    await page.click('#noteBtn');
    await page.locator('#toast').waitFor({ state: 'visible' });
    assert.match(await page.textContent('#toast'), /tom/);
    assert.equal(await ls(page, 'systemrom.lapper'), null);
    assert.deepEqual(dialogs, []);
    await context.close();
  });

  test('HTML i navn, lapp og kjøp vises som tekst og kjøres ikke', async () => {
    const { context, page, errors } = await open();
    const evil = '<img src=x onerror="window.__pwned=1">';
    await logIn(page, evil);
    await page.fill('#noteTo', evil);
    await page.fill('#noteText', evil);
    await page.click('#noteBtn');
    await page.fill('#buyWhat', evil);
    await page.fill('#buyWhy', evil);
    await page.click('#brakeBtn');
    await page.reload();
    assert.equal(await page.evaluate(() => window.__pwned), undefined);
    assert.equal(await page.locator('main img').count(), 0);
    assert.match(await page.textContent('#notes'), /<img src=x/);
    assert.deepEqual(errors, []);
    await context.close();
  });
});

describe('Kjøpsbrems', () => {
  test('nytt kjøp låses i 48 timer: ingen kjøp-knapp, bare stemmer og «slipp nå»', async () => {
    const { context, page } = await open();
    await logIn(page, 'Kari');
    await page.fill('#buyWhat', 'Lego Technic');
    await page.fill('#buyPrice', '2499');
    await page.selectOption('#buyHow', 'avbetaling');
    await page.click('#brakeBtn');
    const box = page.locator('#brakes');
    assert.match(await box.textContent(), /Lego Technic/);
    assert.match(await box.textContent(), /Låses opp om 47 t 59 min|Låses opp om 48 t 0 min/);
    assert.equal(await box.getByRole('button', { name: 'Kjøp', exact: true }).count(), 0);
    await box.getByRole('button', { name: 'Jeg vil ikke' }).click();
    assert.match(await box.textContent(), /Vil ikke: Kari/);
    await context.close();
  });

  test('etter 48 timer kan det slippes, og pengene som ble værende telles', async () => {
    const at = new Date(Date.now() - 49 * H).toISOString();
    const { context, page } = await open(ROOM, {
      'systemrom.front': [{ id: 'f1', at, name: 'Kari', note: '' }],
      'systemrom.brems': [
        { id: 'b1', at, by: 'Lille', what: 'Robotstøvsuger', price: 4990, how: 'avbetaling', why: '', votes: [] },
        { id: 'b2', at, by: 'Lille', what: 'Bok', price: 300, how: 'direkte', why: '', votes: [] }
      ]
    });
    const box = page.locator('#brakes');
    assert.match(await box.textContent(), /48 timer har gått/);
    await box.locator('.item', { hasText: 'Robotstøvsuger' }).getByRole('button', { name: 'Slipp det' }).click();
    const tally = await page.textContent('#tally');
    assert.match(tally, /Sluppet: 1 ting/);
    assert.match(tally, /4\s990 kr/);
    assert.match(tally, /ny gjeld som aldri ble til/);
    await box.locator('.item', { hasText: 'Bok' }).getByRole('button', { name: 'Kjøp' }).click();
    assert.match(await page.textContent('#tally'), /Kjøpt etter 48 timer: 1/);
    assert.match(await page.textContent('#brakes'), /Ingenting låst/);
    await context.close();
  });

  test('ferske kjøp kan ikke markeres som kjøpt selv om noen prøver', async () => {
    const at = new Date(Date.now() - 2 * H).toISOString();
    const { context, page } = await open(ROOM, {
      'systemrom.brems': [{ id: 'b1', at, by: 'Lille', what: 'Lego', price: 100, how: 'direkte', why: '', votes: [] }]
    });
    assert.equal(await page.locator('#brakes').getByRole('button', { name: 'Kjøp', exact: true }).count(), 0);
    await context.close();
  });

  test('«mens du var borte» sier ifra om kjøp som venter på avgjørelse', async () => {
    const at = new Date(Date.now() - 50 * H).toISOString();
    const { context, page } = await open(ROOM, {
      'systemrom.front': [{ id: 'f1', at, name: 'Kari', note: '' }],
      'systemrom.brems': [{ id: 'b1', at, by: 'Lille', what: 'Lego', price: 100, how: 'direkte', why: '', votes: [] }]
    });
    await logIn(page, 'Kari');
    assert.match(await page.textContent('#away'), /1 kjøp venter på avgjørelse/);
    await context.close();
  });
});

describe('Systemrommet og dataene dine', () => {
  test('sikkerhetskopi tar med Systemrommet, og gjenoppretting henter det tilbake', async () => {
    const { context, page } = await open();
    await logIn(page, 'Kari');
    await page.fill('#noteText', 'Husk vann');
    await page.click('#noteBtn');
    await page.fill('#buyWhat', 'Lego');
    await page.click('#brakeBtn');

    await page.goto(APP + '#historikk');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#backupBtn')]);
    const backup = JSON.parse(await readFile(await dl.path(), 'utf8'));
    assert.equal(backup.systemrom.front[0].name, 'Kari');
    assert.equal(backup.systemrom.lapper[0].text, 'Husk vann');
    assert.equal(backup.systemrom.brems[0].what, 'Lego');

    await page.evaluate(() => localStorage.clear());
    await page.setInputFiles('#restoreFile', { name: 'kopi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await page.locator('#toast').waitFor({ state: 'visible' });
    assert.match(await page.textContent('#toast'), /3 ting fra Systemrommet/);
    // Henter man inn samme fil igjen, blir ingenting dobbelt.
    await page.setInputFiles('#restoreFile', { name: 'kopi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    assert.equal((await ls(page, 'systemrom.lapper')).length, 1);

    await page.goto(ROOM);
    assert.match(await page.textContent('#notes'), /Husk vann/);
    assert.match(await page.textContent('#brakes'), /Lego/);
    await context.close();
  });

  test('ugyldige Systemrom-oppføringer i en sikkerhetskopi hoppes over', async () => {
    const { context, page } = await open(APP + '#historikk');
    const backup = {
      app: 'pusterom', version: 1, checkins: [],
      systemrom: { front: [{ id: 'ok', at: new Date().toISOString(), name: 'Kari' }, { at: 'tull', name: 'X' }, 'streng'], lapper: 'ikke en liste', brems: [{ id: 'b', at: new Date().toISOString() }] }
    };
    await page.setInputFiles('#restoreFile', { name: 'kopi.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await page.locator('#toast').waitFor({ state: 'visible' });
    assert.deepEqual((await ls(page, 'systemrom.front')).map((e) => e.id), ['ok']);
    assert.deepEqual((await ls(page, 'systemrom.brems')) ?? [], []);
    await context.close();
  });

  test('«Slett alt» i Pusterom sletter også Systemrommet', async () => {
    const { context, page } = await open();
    await logIn(page, 'Kari');
    await page.fill('#noteText', 'Hemmelig');
    await page.click('#noteBtn');
    await page.goto(APP + '#historikk');
    await page.click('#wipeBtn');
    await page.click('#wipeBtn');
    const left = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('systemrom.')));
    assert.deepEqual(left, []);
    await context.close();
  });

  test('ingen nettverkskall, ingen sideveis scrolling på 320 px', async () => {
    const context = await browser.newContext({ ...PHONE, viewport: { width: 320, height: 640 } });
    const page = await context.newPage();
    const requests = [];
    page.on('request', (r) => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:')) requests.push(r.url()); });
    await page.goto(ROOM);
    await logIn(page, 'Et veldig langt navn som ikke har mellomrom'.replace(/ /g, ''));
    await page.fill('#noteText', 'x'.repeat(600));
    await page.click('#noteBtn');
    await page.fill('#buyWhat', 'y'.repeat(80));
    await page.fill('#buyPrice', '123456789');
    await page.click('#brakeBtn');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 0, `scroller sideveis ${overflow}px`);
    assert.deepEqual(requests, []);
    await context.close();
  });
});
