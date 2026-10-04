import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { APPS } from './src/registry.js';

const input = { hub: resolve(import.meta.dirname, 'index.html') };
for (const a of APPS) input[a.slug] = resolve(import.meta.dirname, `apps/${a.slug}/index.html`);

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input } },
});
