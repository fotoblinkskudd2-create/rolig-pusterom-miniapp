# Varsellys — MVP

Personlige varselsignaler og kriseplan for bipolar lidelse. Det er idé #1 av 250 (se `../03-topp15-briefs.md`).

> **Ikke medisinsk utstyr.** Verktøyet er for selvhjelp sammen med behandler. Akutt: **113** · Legevakt **116 117** · Mental Helse **116 123**.

## Kjør lokalt

Du trenger Node 18 eller nyere. Prosjektet har ingen avhengigheter.

```bash
cd pipeline/mvp-varsellys
npm run seed     # valgfritt: demobruker demo@varsellys.no / demo1234, 20 dager data som ender i rødt
npm start        # http://localhost:3000
npm test         # 8 tester: signalmotor + API ende-til-ende
```

Delt visning for tillitsperson etter seed: `http://localhost:3000/s/demo-deling`

## Hva som virker (ende-til-ende)

| Del | Fil |
|---|---|
| Konto med scrypt-hash og HttpOnly/SameSite-cookie | `server.js` |
| Daglig innsjekk (søvn, humør −3..+3, energi 1–5, medisin, notat), én per dag | `server.js` `/api/checkins` |
| **Signalmotor:** personlig søvnnormal (median av 14 dager) og 6 regler som kan slås av og på. To gule på samme tid gir rødt. Hull i datoene bryter en rekke. | `engine.js` |
| Kriseplan for gult og rødt, skrevet av deg selv. Den vises automatisk når et signal slår ut, sammen med «Ring X»-knapp. | `public/index.html` |
| Delelenke for tillitsperson: viser **bare** farge og dato for siste innsjekk. Lenken kan trekkes tilbake. | `/api/share`, `/s/:token` |
| CSV-eksport av 90 dager til behandler | `/api/export` |
| Sletting av konto og alle data | `DELETE /api/account` |

## Regler (standard)

| Nivå | Regel |
|---|---|
| Gult | Søvn ≥ 2 t under egen normal 2 netter på rad |
| Rødt | Søvn ≥ 3 t under egen normal 3 netter på rad |
| Gult | Humør ≥ +2 tre dager på rad |
| Gult | Humør ≤ −2 fire dager på rad |
| Gult | Medisin ikke tatt 2 dager på rad |
| Rødt | Energi 5/5 og under 5 t søvn 2 dager på rad |

Terskler er satt etter klinisk sunn fornuft (søvnfall som tidlig manisignal), **ikke validert**. Brukeren og behandleren bør justere dem sammen.

## Bevisst utelatt fra v1

- Push og SMS til tillitsperson. Han eller hun ser fargen ved å åpne lenken. Neste steg er Twilio/Web Push med samtykke.
- Import fra wearables (HealthKit/Fit). Det er idé #9, Søvnvakt.
- Redigering av terskler i UI. API-et støtter det (`PUT /api/rules`), UI-et har bare av/på.
- Kryptering i hvile, rate limiting, passordreset og CSRF-token utover SameSite=Strict.
- Ekte database. `data/db.json` holder for én server og en pilot. Bytt til SQLite eller Postgres før reelle brukere.
- Ingen AI. Regelmotoren er bevisst forklarbar: brukeren skal se *hvorfor* fargen er gul.

## Før ekte brukere

DPIA, vurdering av medisinsk utstyr (MDR, klasse I?), samtykketekst og testing sammen med brukerorganisasjon (f.eks. Bipolarforeningen) og behandlere.
