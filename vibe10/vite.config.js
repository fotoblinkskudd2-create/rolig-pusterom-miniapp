import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { apps } from './apps.config.js'

const input = { hub: resolve(import.meta.dirname, 'index.html') }
// ONLY=provefella,gjeld npm run build → bygg bare noen apper (rask iterasjon).
const only = process.env.ONLY?.split(',')
for (const a of apps) if (!only || only.includes(a.id)) input[a.id] = resolve(import.meta.dirname, `apps/${a.id}/index.html`)

export default defineConfig({
  // Relative stier: dist/ kan legges hvor som helst (GitHub Pages-undermappe, Netlify, egen server).
  base: './',
  plugins: [react()],
  build: { rollupOptions: { input } },
})
