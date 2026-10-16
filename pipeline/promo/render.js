// Rendrer promo.html bilde for bilde til frames/. Kjør: NODE_PATH=$(npm root -g) node render.js
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const FPS = 25, DUR = 30, out = path.join(__dirname, 'frames');
(async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('file://' + path.join(__dirname, 'promo.html'));
  await p.evaluate(() => document.fonts.ready);
  console.log('fonter:', await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).join(', ') || 'ingen (fallback)'));
  for (let i = 0; i < FPS * DUR; i++) {
    await p.evaluate(t => render(t), i / FPS);
    await p.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`) });
  }
  await b.close();
})();
