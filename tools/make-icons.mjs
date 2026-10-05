// Lager PNG-ikoner fra samme motiv som icons/icon.svg. Kjør: node tools/make-icons.mjs
// PNG-ene er fullflate uten runde hjørner (plattformen runder selv). Motivet ligger innenfor
// den trygge sonen på 80 %, så icon-512.png kan også brukes som maskable.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const svg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect width="512" height="512" fill="#f5f7f4"/>
  <circle cx="256" cy="256" r="170" fill="#d4e4f0"/>
  <circle cx="256" cy="256" r="108" fill="#a8c5b0"/></svg>`;

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 }
];

const browser = await chromium.launch();
for (const t of targets) {
  const page = await browser.newPage({ viewport: { width: t.size, height: t.size } });
  await page.setContent(`<html><body style="margin:0">${svg()}</body></html>`);
  await page.screenshot({ path: path.join(root, 'icons', t.file), omitBackground: false });
  await page.close();
  console.log('icons/' + t.file, t.size + 'px');
}
await browser.close();
