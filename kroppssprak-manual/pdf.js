// Skriver manual.html til manual.pdf i A5 via Chromium
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const p = await b.newPage();
  await p.emulateMedia({ media: 'print', colorScheme: 'light' });
  await p.goto('file://' + path.resolve(__dirname, 'manual.html'), { waitUntil: 'load' });
  // Innholdsfortegnelsen skal stå etter forsiden
  await p.evaluate(() => { const t = document.querySelector('.tittel'), n = document.querySelector('nav#TOC'); if (t && n) t.after(n); });
  await p.pdf({ path: path.resolve(__dirname, 'manual.pdf'), format: 'A5', printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;text-align:center;font-size:8px;color:#777;font-family:sans-serif"><span class="pageNumber"></span></div>',
    margin: { top: '16mm', bottom: '18mm', left: '14mm', right: '14mm' } });
  await b.close();
})();
