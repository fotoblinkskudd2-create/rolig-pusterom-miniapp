# Folkets regnskap

> Staten har alltid hatt dataene om oss. Nå får vi dataene om staten.

En åpen database over saker der det offentlige svikter. Første område: **sykehuskø** – ventetid, forverring og dødsfall i kø. Barnevern, NAV og trygd ligger klare i skjemaet, men er slått av.

## Kjør

```sh
cd folkets-regnskap
npm start          # http://localhost:8080 – tall, skjema og metode
npm test           # 11 tester, ingen avhengigheter
npm run robot      # henter nyheter nå (krever nett)
npm run bygg       # bygger public/data/statistikk.json på nytt
```

Node 20+. Null npm-pakker.

## Slik henger det sammen

```
Folk  ──skjema──▶ server.js ──▶ data/innmeldt/<uuid>.json   (ubekreftet)
Robot ──RSS────▶ scripts/robot.js ──▶ data/nyheter.json     (nyhetssak)
Moderator ─────▶ scripts/stempel.js <id> dokumentert         (dokumentert)
Offentlige tall ▶ data/offisielt.csv (krever https-kilde per rad)
                         │
                   scripts/bygg.js
                         ▼
        public/data/statistikk.json  ← bare aggregater
        public/data/kilder.json      ← lenker til nyhetssaker
```

| Fil | Gjør |
|---|---|
| `public/skjema.js` | Felles skjema og validering for nettleser og server. Ukjente felt kastes. |
| `server.js` | Serverer sidene, tar imot `POST /api/meld`. Lagrer ikke IP, nettleser eller klokkeslett. Maks 5 per avsender per døgn, med salt som bare finnes i minnet. |
| `scripts/robot.js` | Leser strømmene i `config/kilder.json`. Teller bare saker om kø **og** helse. Setter fylke bare når nøyaktig ett fylke/sykehus nevnes. Samme tittel telles én gang. |
| `scripts/bygg.js` | Teller per status, fylke, hendelse, fagområde og måned. Celler under 3 blir «<3». Trend krever minst 10 saker i hver periode. |
| `scripts/stempel.js` | Moderator oppgraderer en innmeldt sak etter å ha sett dokumentasjon utenfor systemet. |
| `.github/workflows/folkets-regnskap-robot.yml` | Kjører test → robot → bygg hver morgen og committer nye tall. |

## Prinsipper i koden

- **Ingen navn:** skjemaet har ingen fritekst. Test: `innmelding kaster ukjente felt`.
- **Mønster, ikke person:** innmeldte saker publiseres aldri enkeltvis, bare som tall.
- **Etterprøvbart:** nyhetssaker har lenke; offentlige tall uten `https://`-kilde forkastes.
- **Ingen falske påstander:** «For tidlig å si» til det finnes nok data.

## Det som gjenstår før det kan gå live

1. **Hosting med server.** GitHub Pages kan vise tallene, men kan ikke ta imot innmeldinger. `server.js` trenger en liten VPS eller lignende, og `data/innmeldt/` må ligge på persistent disk (ikke i git – det er skjult med `.gitignore`).
2. **Offentlige tall.** `data/offisielt.csv` er tom. Fyll den fra Helsedirektoratets ventetidsstatistikk, med lenke per rad. Ingen tall er funnet på.
3. **Strømmene er ikke testet mot nett herfra** (miljøet sperret NRK/Google). Første kjøring i Actions viser i loggen hvor mange som ble lest og truffet per strøm.
4. **Stiftelse/samvirke, moderatorrutine og personvernerklæring.**
