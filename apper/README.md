# 25 Apper

25 nye appkonsepter, researchet fra App Store og GitHub, designet med prompts og kodet som iOS-aktige React-apper. Alt lagres på enheten. Ingen konto, ingen server.

**Åpne:** `dist/index.html` direkte i Safari eller Chrome. Det er én selvstendig fil. På iPhone: Del → Legg til på Hjem-skjerm.

| Fil | Innhold |
|-----|---------|
| [RESEARCH.md](RESEARCH.md) | Metode, funn fra App Store og GitHub, kilder og forbehold |
| [KONSEPTER.md](KONSEPTER.md) | Alle 25: problem, signal, målgruppe, forretningsmodell og funksjoner |
| [PROMPTS.md](PROMPTS.md) | Designprompt og ikonprompt per app, klare for Figma Make, v0 eller Midjourney |
| `src/concepts.json` | Én kilde for konsepter og prompts. Appen og docs genereres herfra. |
| `src/kit/` | iOS-designsystemet: tokens (lys og mørk) og komponenter |
| `src/apps/` | De 25 appene, én fil hver |

## De 25

| | App | Hva |
|-|-----|-----|
| 🔨 | Gjeldsknuser | Live rente-taksameter, snøball- eller skredplan, betalingslogg |
| 🧩 | Delene | Systemlogg for DID/OSDD: front, deler, tavle, tapt tid |
| 🧊 | Impulsbrems | Kjølerom for kjøp, med pris i arbeidstimer etter skatt |
| 🌗 | Skiftsøvn | Søvnvindu, kaffestopp og lys for turnus |
| 🎧 | Tinnitusro | Frekvensmatcher og støy med hakkfilter (Web Audio) |
| 🍞 | Surdeigsvakt | Fôringslogg, ratio, bakerprosent, heving |
| 🫙 | Gjæringslogg | Batcher, dagteller, ABV fra OG og FG |
| 💿 | Vinylhylla | Katalog, Goldmine-gradering, vektet «hva spiller jeg?» |
| 🌈 | Dagstripe | Visuell dagplan med nå-linje og nedtelling |
| 🛖 | Hyttebygger | Fokustimer. Forlater du appen, knekker planken. |
| 🧗 | Klatrelogg | Grader, forsøk, pyramide |
| 🦵 | Korsbånd | Rehab-faser, bøy og strekk i grader, smerte |
| 🌸 | Bekkenbunn | Guidet knip og slipp, diskré modus |
| 🏡 | Samvær | Samværskalender, utgiftsdeling, overlevering |
| 🌡️ | Feberlogg | Temperatur, medisinlogg, tidligste neste dose |
| 🌦️ | Humørvær | 2D humørkart (energi × behag), rapport til terapeut |
| 🪤 | Tankefelle | CBT-tankeskjema i sju steg, mønstre |
| 🌅 | Edru | Rusfri-teller, timinutters trangbølge, ny start uten skam |
| 📞 | Ringerunde | Hvem har du ikke snakket med på lenge? |
| 🪚 | Snekkerkalk | Kappliste-optimalisering, trappekalkulator |
| 🏠 | Boligkalk | Annuitet og serie, utlånsforskriften, dokumentavgift |
| 🧾 | Frilanskalk | Timepris for ENK, avsetning per faktura |
| ⚖️ | Besluttet | Vektet matrise og myntkast for magefølelsen |
| 🎒 | Sekkevekt | Basevekt, forbruk og på kroppen, tyngste ting |
| 🗣️ | Snakkebrett | ASK-brett med norsk tale, skriv-og-snakk, fullskjermtekst |

## Utvikle

```bash
npm install
npm run dev        # utviklingsserver
npm run build      # typecheck → dist/index.html (én fil) → regenererer KONSEPTER.md og PROMPTS.md
npm run e2e        # ende-til-ende-test i Chromium mot dist/ (CHROMIUM_PATH=… ved behov)
```

Nytt konsept: legg det inn i `src/concepts.json`, lag `src/apps/Navn.tsx` og registrer det i `src/apps/index.ts`.

## Designsystem

- **Tokens:** Apples semantiske farger (`--bg`, `--bg2`, `--label`, `--label2`, `--sep`, `--fill` med flere), med egne verdier for lys og mørk modus via `prefers-color-scheme`. Hver app setter sin egen `--tint`.
- **Typografi:** SF Pro (system), SF Pro Rounded for store tall, tabulære sifre.
- **Komponenter:** `Screen` (navbar med stor tittel som kollapser), `TabBar`, `Section` og `Row` (inset grouped), `InputRow`, `NumRow`, `SelectRow`, `ToggleRow`, `StepperRow`, `Seg`, `Sheet` (bunnark), `Ring`, `Bars`, `Spark`, `Progress`, `Empty`, `ConfirmRow` (sletting i to trykk, ingen `alert()`).
- **Lagring:** `useStore(key, init)` holder localStorage og React i synk, og faller tilbake til minnet i privat modus.
- **Safe areas:** `env(safe-area-inset-*)` for notch og hjemindikator.

## Ansvar

Feberlogg, Korsbånd, Bekkenbunn, Edru, Delene og Tankefelle er støtteverktøy, ikke medisinsk behandling. Doser og regler (utlånsforskriften, skatt) er veiledende og kan endres i appen.
