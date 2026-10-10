// Genererer KONSEPTER.md og PROMPTS.md fra src/concepts.json, så docs og app aldri spriker.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const concepts = JSON.parse(readFileSync(join(root, 'src/concepts.json'), 'utf8'))
const cats = [...new Set(concepts.map((c) => c.category))]

const k = [
  '# 25 konsepter',
  '',
  '> Generert fra `src/concepts.json` med `npm run docs`. Ikke rediger for hånd.',
  '',
  'Research og metode: [RESEARCH.md](RESEARCH.md). Designprompts: [PROMPTS.md](PROMPTS.md).',
  '',
  '| # | App | Kategori | Kort | Modell |',
  '|---|-----|----------|------|--------|',
  ...concepts.map((c, i) => `| ${i + 1} | ${c.emoji} **${c.name}** | ${c.category} | ${c.tagline} | ${c.model} |`),
  '',
]
for (const cat of cats) {
  k.push(`## ${cat}`, '')
  for (const c of concepts.filter((x) => x.category === cat)) {
    k.push(
      `### ${c.emoji} ${c.name} – ${c.tagline}`, '',
      `> *«${c.gonzo}»*`, '',
      `**Problem.** ${c.problem}`, '',
      `**Signal.** ${c.signal}`, '',
      `**For hvem.** ${c.audience}`, '',
      `**Modell.** ${c.model}`, '',
      '**Funksjoner (bygget):**', '',
      ...c.features.map((f) => `- ${f}`), '',
      `Kode: [\`src/apps/\`](src/apps/) · åpnes med \`#/${c.id}\``, '',
    )
  }
}
writeFileSync(join(root, 'KONSEPTER.md'), k.join('\n'))

const p = [
  '# Designprompts',
  '',
  '> Generert fra `src/concepts.json` med `npm run docs`. Ikke rediger for hånd.',
  '',
  'Én skjermprompt og én ikonprompt per app. Promptene er skrevet på engelsk, fordi UI-generatorer',
  '(Figma Make, v0, Galileo, Uizard, Midjourney) gir best resultat på engelsk, men UI-tekstene er norske.',
  'Hver prompt har samme oppbygning: produkt og målgruppe, stemning, palett med hex-koder, skjermer i rekkefølge,',
  'komponenter, bevegelse, tone og en «ikke gjør»-liste mot generisk slop.',
  '',
  'Promptene finnes også inne i appen: trykk ⓘ i en app, eller på en rad under «Alle konsepter» på hjemskjermen. Der er det en kopier-knapp.',
  '',
]
concepts.forEach((c, i) => {
  p.push(`## ${i + 1}. ${c.emoji} ${c.name}`, '', `Farger: \`${c.colors[0]}\` → \`${c.colors[1]}\` · tint \`${c.tint}\``, '', '**Skjermer:**', '', '```text', c.prompt, '```', '', '**Ikon:**', '', '```text', c.iconPrompt, '```', '')
})
writeFileSync(join(root, 'PROMPTS.md'), p.join('\n'))
console.log(`docs: ${concepts.length} konsepter → KONSEPTER.md, PROMPTS.md`)
