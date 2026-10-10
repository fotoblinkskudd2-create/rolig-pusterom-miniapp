// Røyktest for hele appen i ekte Chromium.
// Kjør fra repo-roten:  node test/smoke.mjs
// Krever playwright og http-server (npm i -g playwright http-server).
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(path.join(execSync('npm root -g').toString().trim(), 'playwright')); }
const { chromium } = playwright;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'pusterom-'));
console.log('Skjermbilder:', OUT);
const errors = [];
let fails = 0;
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

const srv = spawn('http-server', [ROOT, '-p', '8765', '-s', '-c-1']);
await new Promise(r => setTimeout(r, 1500));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

// Seed legacy 1.0 data (toDateString keys, string mood, HTML in note)
await page.goto('http://localhost:8765/index.html');
await page.evaluate(() => {
  const old = new Date(Date.now() - 3*864e5);
  localStorage.setItem('checkins', JSON.stringify([
    { date: old.toISOString(), mood: '2', note: '<img src=x onerror="window.pwned=1">' }
  ]));
  localStorage.setItem('doneActions', JSON.stringify({ [new Date().toDateString()]: [0, 2], 'Mon Jan 01 2024': [1] }));
});
await page.reload();
await page.screenshot({ path: OUT + '/1-hjem.png', fullPage: true });

// alert-free save without mood
let dialog = false; page.on('dialog', d => { dialog = true; d.dismiss(); });
await page.click('#saveBtn');
ok(!dialog, 'no alert() when mood missing');
ok(await page.isVisible('#saveMsg'), 'inline nudge shown');

// Nav fix: "Pust med meg" highlights Pusterom tab
await page.click('#page-hjem [data-goto=pusterom]');
ok(await page.getAttribute('.nav [data-goto=pusterom]', 'aria-current') === 'page', 'Pust med meg marks nav tab');
ok(await page.isVisible('#page-pusterom'), 'pusterom visible');

// breathing: fast-forward via clock
await page.click('#breathBtn');
ok(await page.textContent('#breathText') === 'Pust inn…', 'breath starts inhale');
await page.waitForTimeout(4200);
ok(await page.textContent('#breathText') === 'Hold…', 'hold after 4s');
await page.waitForTimeout(8000);
ok((await page.textContent('#breathCount')).includes('1 runde'), 'round counted');
// leaving page stops breathing + logs
await page.click('.nav [data-goto=grep]');
ok(await page.evaluate(() => !breathing), 'breathing stops on page leave');
ok(await page.evaluate(() => JSON.parse(localStorage.getItem('breaths')).length === 1), 'breath session logged');

// Små grep: legacy key migrated
const doneCount = await page.locator('.action-card.done').count();
ok(doneCount === 2, 'legacy doneActions migrated (got ' + doneCount + ')');
await page.locator('.action-card button').nth(4).click();
ok(await page.locator('.action-card.done').count() === 3, 'toggle action');
ok(await page.evaluate(() => !Object.keys(JSON.parse(localStorage.getItem('doneActions'))).some(k => k.includes('2024'))), 'old action days pruned');
await page.screenshot({ path: OUT + '/2-grep.png', fullPage: true });

// Check in
await page.click('.nav [data-goto=hjem]');
await page.click('.mood-btn[data-mood="4"]');
await page.fill('#note', 'Linje en\nlinje to <b>ikke fet</b>');
await page.click('#saveBtn');
ok((await page.textContent('#saveMsg')).includes('Takk'), 'checkin saved');
ok(await page.evaluate(() => typeof JSON.parse(localStorage.getItem('checkins'))[0].mood === 'number'), 'mood stored as number');

// History
await page.click('.nav [data-goto=historikk]');
ok(await page.evaluate(() => !window.pwned), 'no XSS from note');
ok(await page.locator('.history-item').count() === 2, 'two history items');
ok(await page.locator('#trend .day').count() === 14, '14 trend bars');
ok(await page.locator('#trend .day:not(.empty)').count() === 2, '2 filled trend bars');
const summary = await page.textContent('#weekSummary');
console.log('  summary:', summary);
await page.screenshot({ path: OUT + '/3-historikk.png', fullPage: true });

// Export txt
const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#exportTxt')]);
ok(dl.suggestedFilename() === 'pusterom-historikk.txt', 'txt export filename');
const txt = fs.readFileSync(await dl.path(), 'utf8');
ok(txt.includes('linje to') && txt.includes('greit (4/5)'), 'txt content');
console.log(txt.split('\n').slice(0, 8).join('\n'));

// JSON backup -> wipe -> restore
const [dj] = await Promise.all([page.waitForEvent('download'), page.click('#exportJson')]);
const jsonPath = OUT + '/backup.json';
fs.copyFileSync(await dj.path(), jsonPath);
await page.click('#wipeBtn');
ok(await page.evaluate(() => localStorage.getItem('checkins')) !== null, 'first wipe tap is only arming');
await page.click('#wipeBtn');
ok(await page.evaluate(() => localStorage.getItem('checkins')) === null, 'second tap wipes');
await page.setInputFiles('#importJson', jsonPath);
await page.waitForTimeout(300);
ok((await page.textContent('#dataMsg')).includes('Hentet inn 2'), 'restore: ' + await page.textContent('#dataMsg'));
await page.setInputFiles('#importJson', jsonPath);
await page.waitForTimeout(300);
ok((await page.textContent('#dataMsg')).includes('fantes allerede'), 'restore is idempotent');

// Hash deep link
await page.goto('http://localhost:8765/index.html#pusterom');
ok(await page.isVisible('#page-pusterom'), 'hashchange #pusterom');
await page.goto('about:blank');
await page.goto('http://localhost:8765/index.html#pusterom');
ok(await page.isVisible('#page-pusterom'), 'deep link #pusterom');

// SW registered + offline
await page.goto('http://localhost:8765/index.html');
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload();
await ctx.setOffline(true);
await page.goto('http://localhost:8765/isolation-mirror.html');
ok(await page.isVisible('#generate'), 'mirror works offline');
await page.goto('http://localhost:8765/index.html');
ok(await page.isVisible('#saveBtn'), 'index works offline');
await ctx.setOffline(false);

// Mirror
await page.goto('http://localhost:8765/isolation-mirror.html');
await page.fill('#note', 'Ingen har ringt på ni dager. ' + 'Ord '.repeat(60));
await page.setInputFiles('#photo', ROOT + '/icon-512.png');
ok(await page.isVisible('#prev'), 'photo preview');
await page.click('#generate');
ok((await page.textContent('#protocol')).includes('Bildet ligger bare her'), 'protocol mentions photo');
const pr = await page.textContent('#labprompt');
const line = pr.split('\n')[1];
ok(line.endsWith('Ord…') && line.length <= 'PROBLEM: Isolasjon. '.length + 181, 'prompt truncated at word: ' + line.length);
await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
await page.click('#copy');
await page.waitForTimeout(200); const cs = await page.textContent('#copyStatus'); ok(cs === 'Kopiert.' || cs.startsWith('Teksten er markert'), 'copy feedback: ' + cs);
await page.click('#clearPhoto');
ok(!(await page.isVisible('#prev')) && !(await page.isVisible('#clearPhoto')), 'clear photo hides preview + X');
await page.screenshot({ path: OUT + '/4-mirror.png', fullPage: true });

// file:// mode + dark mode
const p2 = await (await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' })).newPage();
p2.on('pageerror', e => errors.push('file:// ' + e.message));
await p2.goto('file://' + ROOT + '/index.html');
await p2.click('.nav [data-goto=historikk]');
ok(await p2.isVisible('#page-historikk'), 'file:// works');
await p2.click('.nav [data-goto=hjem]');
await p2.screenshot({ path: OUT + '/5-dark.png', fullPage: true });

ok(errors.length === 0, 'no console errors ' + JSON.stringify(errors));
await browser.close(); srv.kill();
console.log(fails ? `\n${fails} FAIL` : '\nALL GREEN');
process.exit(fails ? 1 : 0);
