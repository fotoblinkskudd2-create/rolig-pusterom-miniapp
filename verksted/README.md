# Verksted

Ti iOS-webapper i React. Ingen konto. Ingen sky. Ingen abonnement. Alt blir på telefonen.

| App | Hva |
|---|---|
| **Abo-Liket** | Abonnementssporer med «Drep»-knapp og kalendervarsler |
| **Dump** | Én boks for alt som surrer. «Én ting»-modus. Siri-snarvei |
| **Kvitt** | Kvitteringer med foto, 2/5 års reklamasjonsfrist, ferdig reklamasjonsbrev |
| **Splitt** | Del regninga. Hele gruppa deles i en lenke, uten server |
| **Doom-Brems** | Snarveier-automasjon som bremser Instagram/TikTok med pust |
| **Strømvakt** | Spotpris NO1–NO5, billigste tid for vask/elbil |
| **Kjøpekarantene** | Impulskjøp i bur + hva delbetalingen faktisk koster |
| **Gjeld-Snøball** | Snøball vs skred, gjeldfri-dato |
| **Brunstøy** | Brun støy som overlever lydløs-bryteren + fokusøkter |
| **Systemtavla** | For plurale systemer: hvem er fremme, beskjeder, tapt tid |

Bakgrunn og research: [`IDEER.md`](./IDEER.md). Promptene appene er bygd fra: [`PROMPTS.md`](./PROMPTS.md).

## Få det på iPhonen

Appene trenger HTTPS for å kunne installeres og virke offline.

**Raskest – GitHub Pages:** workflowen `.github/workflows/verksted-pages.yml` bygger og publiserer ved push til `main`. Slå på Settings → Pages → Source: «GitHub Actions». Åpne `https://<bruker>.github.io/<repo>/` i Safari.

**Eller hvilken som helst statisk host:** pakk ut `../leveranse/verksted-app.zip` og last opp innholdet (Netlify Drop, Cloudflare Pages, egen server). Alle stier er relative, så den virker i en undermappe også.

Så: åpne en app i Safari → Del → «Legg til på Hjem-skjerm». Hver app får eget ikon.

## Utvikle

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ + service worker
npm test           # Playwright-røyktest av alle 10 (krever bygg først)
npm run zip        # ../leveranse/*.zip
```

Ny app: legg til i `src/registry.js`, kjør `npm run generate && npm run icons`, skriv `src/apps/<slug>/App.jsx`.

## Struktur

```
src/registry.js        én liste over alle appene
src/shared/            lagring, UI-komponenter, .ics, deling, IndexedDB
src/apps/<slug>/       én mappe per app
apps/<slug>/index.html generert inngang (scripts/generate.mjs)
public/                manifest + ikoner (scripts/make-icons.mjs)
scripts/build-sw.mjs   service worker som precacher hele bygget
scripts/smoke.mjs      ende-til-ende-test i iPhone-størrelse
```

## Ærlige begrensninger

- Data lever i nettleserens lagring. Sletter du Safari-data, er det borte. Hver app har backup-knapp – bruk den.
- Lagt til på Hjem-skjerm har hver app sin egen lagring, atskilt fra Safari-fanen.
- Strømvakt trenger nett for nye priser; resten virker helt offline.
- Doom-Brems-oppskriften i Snarveier kan ha litt andre handlingsnavn på din iOS-versjon.
- Satser for strømstøtte/Norgespris og lovtekst i Kvitt er forenklet – sjekk gjeldende regler.
