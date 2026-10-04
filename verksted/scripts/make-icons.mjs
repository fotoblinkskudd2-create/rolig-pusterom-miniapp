// Tegner PNG-ikoner (180/192/512) med headless Chromium. Ingen bildefiler i repoet trengs for å lage dem.
// Kjør: node scripts/make-icons.mjs  (krever playwright; i dette miljøet ligger den globalt)
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { APPS } from '../src/registry.js';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require(execSync('npm root -g').toString().trim() + '/playwright'); }

const svg = (color, mono) => `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" fill="#111113"/>
<circle cx="256" cy="256" r="210" fill="${color}"/>
<path d="M60 420 L452 92" stroke="#111113" stroke-width="18" opacity=".35"/>
<text x="256" y="300" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-weight="900" font-size="190" letter-spacing="-8" fill="#111113">${mono}</text>
</svg>`;

const browser = await pw.chromium.launch({ executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH ? undefined : '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const all = [...APPS, { slug: 'hub', color: '#f2f2f2', mono: 'V10' }];
for (const a of all) {
  for (const size of [180, 192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0">${svg(a.color, a.mono).replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
    await page.screenshot({ path: `public/icons/${a.slug}-${size}.png`, omitBackground: false });
  }
}
await browser.close();
console.log(`ikoner: ${all.length * 3}`);
