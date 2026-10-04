// Lager HTML-inngang + manifest for hver app ut fra src/registry.js.
// Kjør: node scripts/generate.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { APPS } from '../src/registry.js';

const head = ({ title, color, manifest, icon, description }) => `<!doctype html>
<html lang="nb">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="${color}">
<meta name="description" content="${description}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${title}">
<link rel="manifest" href="${manifest}">
<link rel="apple-touch-icon" href="${icon}">
<link rel="icon" type="image/png" href="${icon}">
<title>${title}</title>
</head>`;

for (const a of APPS) {
  mkdirSync(`apps/${a.slug}`, { recursive: true });
  writeFileSync(`apps/${a.slug}/index.html`, `${head({
    title: a.name, color: a.color, description: a.tagline,
    manifest: './manifest.webmanifest', icon: `../../icons/${a.slug}-180.png`,
  })}
<body style="--accent:${a.color}">
<div id="root"></div>
<script type="module" src="/src/apps/${a.slug}/main.jsx"></script>
</body>
</html>
`);
  mkdirSync(`public/apps/${a.slug}`, { recursive: true });
  writeFileSync(`public/apps/${a.slug}/manifest.webmanifest`, JSON.stringify({
    name: a.name, short_name: a.name, description: a.tagline,
    id: `./apps/${a.slug}/`, start_url: './', scope: './', display: 'standalone',
    background_color: '#111113', theme_color: a.color, lang: 'nb',
    icons: [
      { src: `../../icons/${a.slug}-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `../../icons/${a.slug}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
    ],
  }, null, 2));
}

writeFileSync('index.html', `${head({
  title: 'Verksted', color: '#111113', description: 'Ti lokale iOS-webapper. Ingen konto. Ingen sky.',
  manifest: './manifest.webmanifest', icon: './icons/hub-180.png',
})}
<body style="--accent:#e5484d">
<div id="root"></div>
<script type="module" src="/src/hub/main.jsx"></script>
</body>
</html>
`);
writeFileSync('public/manifest.webmanifest', JSON.stringify({
  name: 'Verksted', short_name: 'Verksted', description: 'Ti lokale iOS-webapper.',
  id: './', start_url: './', scope: './', display: 'standalone',
  background_color: '#111113', theme_color: '#111113', lang: 'nb',
  icons: [
    { src: 'icons/hub-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icons/hub-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}, null, 2));
console.log(`generert: ${APPS.length} apper + hub`);
