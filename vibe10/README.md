# Vibe10 — ti iPhone-apper uten konto, sky eller abonnement

Ti React-apper som installeres rett fra Safari til Hjem-skjermen. Ingen App Store. Ingen innlogging.
All data blir på telefonen. Alt virker i flymodus etter første åpning.

| # | App | Gjør |
|---|---|---|
| 1 | ⏳ **Prøvefella** | Abonnementer og prøveperioder, kalendervarsel før trekk, «kirkegård» som teller hva du har spart |
| 2 | 📉 **Gjeldsradar** | Snøball/skred-plan, gjeldsfri-dato, renter spart med ekstra innbetaling |
| 3 | 🧊 **Kjøpebrems** | Fryser impulskjøp 24 t–30 dager, viser pris i arbeidstimer og hva som trigger kjøpslysten |
| 4 | ▶️ **Startknappen** | ADHD-start: én oppgave, 2-minutters ring, mikrosteg, kroppsdobbel med brun støy |
| 5 | 🛑 **Doombrems** | Snarveier-automasjon som stopper TikTok/Instagram med pustepause og logg |
| 6 | 🧾 **Garantiboksen** | Kvitteringsbilder, reklamasjonsfrist 2/5 år, ferdig reklamasjonsbrev |
| 7 | 🍕 **Spleiselapp** | Del utgifter, færrest mulig overføringer, hele spleisen deles som én lenke |
| 8 | 🥚 **Kjøleskapet** | Huk av det du har, se hva du kan lage nå, handleliste for resten |
| 9 | 🫧 **Minnehull** | Logg for systemer/dissosiasjon: hvem er her, tidshull, beskjedtavle, AES-kryptert med PIN |
| 10 | 🛡️ **Inkasso-skjold** | Frister, inkassosteg, panikk-knapp og brevmaler for avtale, innsigelse og dokumentasjon |

- **Hvorfor disse ti:** [RESEARCH.md](RESEARCH.md) (Reddit-smerte, GitHub-mønstre og de lovlige smutthullene)
- **Promptene som bygger dem:** [PROMPTS.md](PROMPTS.md)

## På iPhone

1. Åpne nettadressen der `dist/` ligger (se «Publiser» under) i **Safari**.
2. Velg en app → Del-knappen → **Legg til på Hjem-skjerm**.
3. Hver app blir sitt eget ikon. Gjenta for de du vil ha.

> ⚠️ En Hjem-skjerm-app har **egen lagring**, adskilt fra Safari. Sletter du ikonet, forsvinner dataene.
> Bruk «Ta backup» under Data/Innstillinger av og til.

## Utvikle

```bash
npm install
npm run dev          # http://localhost:5173/  (hub) · /apps/<id>/
npm run build        # → dist/  (genererer HTML, manifest, ikoner og service worker)
npm run zip          # → vibe10.zip av dist/
ONLY=gjeld,spleis npx vite build   # bygg bare noen apper
node scripts/shots.mjs             # iPhone-skjermbilder (lys + mørk) til shots/
```

Struktur:

```
apps.config.js        én liste med navn/farge/ikon for alle appene
apps/<id>/main.jsx    hver app (index.html genereres)
shared/               designsystem (base.css), lagring, ark/faner, .ics, IndexedDB, boot + service worker
scripts/prebuild.mjs  HTML + manifest + PNG-ikoner (Chromium) per app
scripts/gen-sw.mjs    service worker som forhåndscacher hele dist/
```

## Publiser

`dist/` er rene statiske filer med relative stier, så den kan ligge hvor som helst.

- **GitHub Pages:** Workflowen `.github/workflows/pages.yml` bygger og publiserer ved push. Slå på
  *Settings → Pages → Source: GitHub Actions* i repoet én gang.
- **Netlify / Cloudflare Pages:** dra `dist/`-mappa (eller innholdet i `vibe10.zip`) inn i nettleseren.
- Må være **HTTPS** for at service worker og Hjem-skjerm-modus skal virke (gjelder ikke localhost).

## Testet og ikke testet

Testet i Chromium med iPhone 15-viewport, lys og mørk: alle 11 sider rendrer uten JS-feil. I tillegg er dette
klikket gjennom: Doombrems-bremsen, Startknappen-ringen, oppgjørsmatte og delelenke i Spleiselapp (åpnet i en ny,
tom nettleser), PIN-kryptering i Minnehull (kryptert lagring, feil PIN avvist, riktig PIN låser opp) og at appene
åpner uten nett.

**Ikke testet på en ekte iPhone:** Snarveier-automasjonen og URL-skjemaene i Doombrems, .ics-import via delingsarket,
kamera-opplasting i Garantiboksen og lyd i Startknappen. Sjekk disse først.
