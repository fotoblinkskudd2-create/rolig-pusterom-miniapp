# AGENTS.md — rolig-pusterom-miniapp

Les `VERK.md` først. Det er arbeidskontrakten for alle agenter i dette repoet
(Claude Code, Codex, OpenClaw, Hermes og andre). Denne filen er prosjektadapteren:
verifiserte fakta om repoet og reglene som gjelder her. Ved konflikt vinner en
konkret brukerbestilling, deretter denne filen, deretter VERK.md.

## Verifiserte prosjektfakta (kontrollert 2026-10-15)

- To statiske filer: `index.html` (appen) og `isolation-mirror.html`. Ingen build,
  ingen avhengigheter, ingen server, ingen konto.
- `index.html`: fire sider — Innsjekk, Pusterom, Små grep, Historikk.
  Kjerneflyt: `saveCheckin()` → `localStorage['checkins']`, `switchPage(name)`,
  `toggleBreath()`/`runBreathCycle()`, `renderActions()`/`toggleAction(i)`
  → `localStorage['doneActions']`, `renderHistory()` + eksport til `.txt`.
- `isolation-mirror.html`: `generate()` bygger en Labben/Grok-prompt, `copyPrompt()`
  kopierer. Bildet vises bare i fanen, lastes aldri opp.
- `RUN.md` = bruksanvisning og lagringsnøkler. `HULL.md` = kjente mangler.
- Ingen testrammeverk. Kvalitetsporten er `bash tools/check.sh`.

## Ufravikelige regler i dette repoet

1. **Lokal-first.** Ingen `fetch`, ingen eksterne skript, fonter, CDN-er, analyse
   eller sporing. Dette er en stress-app; data som forlater enheten er et tillitsbrudd.
   `tools/check.sh` feiler hvis dette brytes.
2. **Ny `localStorage`-nøkkel** skal dokumenteres i tabellen i `RUN.md` i samme
   commit. `tools/check.sh` kontrollerer det.
3. **Behold stacken.** Ren HTML/CSS/JS i én fil per side. Ikke innfør rammeverk,
   bundler eller npm uten konkret begrunnelse i bestillingen.
4. **Mobil først.** Maks-bredde 440px, store trykkflater, rolig palett (`:root`-variablene).
   Ingen `alert()`; vis feil i siden.
5. **Ikke bryt eksisterende data.** Endringer i lagringsformat må lese gamle
   `checkins`/`doneActions` uten tap.
6. **Tone:** Rolig, kort, ikke-klinisk. Appen gir ikke diagnose eller behandling.

## Kontroll før «ferdig» (VERK §18–19)

- `bash tools/check.sh` → alle linjer `OK`.
- Ved UI-endring: åpne siden i headless Chromium (Playwright,
  `executablePath: '/opt/pw-browsers/chromium'` i Claude Code-skyen), ta skjermbilde
  i 390×844, og si eksplisitt hvis visning *ikke* er kontrollert.
- Oppdater `HULL.md` når en mangel lukkes eller oppdages.
- Bruk statusordene i VERK §19 presist: en commit er IMPLEMENTERT, ikke TESTET.

## Åpne spor (fra HULL.md, ikke startet)

PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.
