# Felles mal for de 30 appene (til app-builder)

Les først `byggeinstrukser-30/claude-code/FELLES-KONTRAKT.md`, `KVALITET.md` og din oppgavefil i `byggeinstrukser-30/claude-code/oppgaver/<app-id>.md`. **Referanseappen `output/apps/focusdump/` er WEB_VERIFISERT og viser hvordan alt skal se ut. Les den før du skriver kode.**

## Opprett appen

```bash
output/ny-app.sh <app-id> "<Visningsnavn>" "<Problem og løfte>"
cd output/apps/<app-id> && npm ci
```

Stacken er låst i `package-lock.json`: React 19, Vite 8, TypeScript 7, Node 22 med innebygd `node:sqlite`, Vitest 5, playwright-core 1.56.1 og Capacitor 8.5.2. Ikke legg til avhengigheter uten en reell grunn. Legger du til en, bruk `npm install --save-exact` og noter grunnen i README.

## Ikke rør (felles kjerne)

`server/core/*`, `src/core/*`, `src/main.tsx`, `server/index.ts`, `tests/helpers.ts`, `public/sw.js`, `tsconfig*.json`, `vite.config.ts`.
Trenger du en endring i kjernen, ikke gjør den. Beskriv den i `rapporter/<app-id>/KJERNE-ONSKER.md`. Hovedagenten integrerer felles endringer.

Det kjernen gir deg:

- `Router` med `r.get/post/patch/delete(path, handler)`. Handlere er **synkrone** (SQLite). Returner et objekt (200), `{ __status: 201, ... }` eller `{ download: { filename, contentType, body } }`. Kast `new ApiError(status, code, norskMelding, details?)`.
- `ctx.user.id` brukes som eier. **Hver** spørring mot domenetabeller filtrerer på `owner_id`. Barnetabeller får også `owner_id` (som i focusdump), så eierkontrollen blir enkel og sikker.
- Muterende kall kjører i én transaksjon. `Idempotency-Key` gir trygg retry automatisk.
- `Validator` har text, num, int, date, time, oneOf, url, bool, lines og revision. Kall `done()` før du skriver noe (ingen delvis lagring). Meldinger på norsk.
- `repo.ts` har getOwned, listOwned, insertOwned (godtar klient-UUID), updateOwned (revisjon → 409 med `details.current`), setArchived og deleteOwned (krever arkiv og `confirm: true`).
- `exportEnvelope(APP, fields, data)` gir format, format_version, app_version, exported_at og fields.
- Klient: `api()`, `mutate()` (offline-kø med operasjons-id), `useSession`, `AuthScreen`, `Shell` (fanemeny), `Field`, `ErrorBox` (med «Hent ny versjon» ved konflikt), `ConfirmButton`, `Empty`, `SyncPanel`, `useSync`, `useDraft`, `kvGet/kvSet`. CSS-klasser: card, stack, row, grow, list, btn (primary, big, small, danger, ghost, icon), notice (error, warn, info), badge, pill, muted, small, num, table-wrap, stale.

## Du skriver

| Fil | Innhold |
|---|---|
| `server/app/domain.ts` | Ren domenelogikk uten Node- eller DOM-import, så klienten kan bruke den. Tilstander, tillatte overganger, beregninger, parsing og grenser. |
| `server/app/migrations.ts` | Tabeller fra minimumsmodellen i oppgaven. Hver post får id (TEXT UUID), owner_id, created_at, updated_at, revision og archived_at der det passer. CHECK-regler, indekser og ON DELETE-regler. |
| `server/app/routes.ts` | Liste, opprett, hent, endre (revisjon), arkiver/gjenåpne, slett (bekreftet), domenehandlinger, tilstandsendring validert på server, beregning som egen funksjon og eksport (JSON, eventuelt CSV/ICS/Markdown når domenet trenger det). |
| `server/seed.ts` | Fiktive DEMO-data. Kopier mønsteret fra focusdump. |
| `src/app/App.tsx`, `src/app/app.css` | Domenespesifikke skjermer: oversikt med tydelig hovedhandling, opprett/rediger, resultat/detalj med synlig lagringsstatus, og historikk/eksport. **Ikke bare en omdøpt tabell.** |
| `tests/domain.test.ts` | Kontrolleksempelet **nøyaktig** som i oppgaven, grenseverdier i hvert tall- og datofelt, ulovlige overganger og domeneregler. |
| `tests/api.test.ts` | Ugyldig input uten delvis lagring, ulovlig overgang, gammel revisjon → 409, dobbel innsending (Idempotency-Key), at konto B ikke når konto A, restart, eksport kontrollert mot databasen, arkiv/gjenåpning/sletting, og at endret input gir ny beregning. |
| `tests/e2e.test.ts` | Chromium 390 px. Registrer, bruk egen input, kjør hovedhandlingen, vurder resultatet, endre ett felt, restart serveren og reload, og eksporter. Test også konflikt-UI og offline-kø der den er implementert. Kontroller `assertNoHorizontalScroll` og `assertTapTargets`, tekst 200 % og desktop. Skjermbilder lagres i `rapporter/<app-id>/skjermbilder/`. |
| `README.md`, `docs/API.md`, `docs/SKJEMA.md`, `docs/IOS.md` | Bruk samme oppbygning som i focusdump. IOS.md er iOS-kontrakten: backend, lokale data, tillatelser og oppførsel uten nett, med konkrete steg for IOS_VERIFISERT. |
| `rapporter/<app-id>/STATUS.md` | Rapportformatet fra KVALITET.md. Ta med eksporteksempel (`eksport-eksempel.json` eller tilsvarende). |

## Regler du ikke kan fravike

- Kontrolleksempelet i oppgaven skal være en reell test som gir nøyaktig forventet tall eller oppførsel.
- Regn penger i øre (heltall) eller med eksplisitt avrunding, aldri med akkumulerte flyttall.
- Ingen knapp later som den sender, betaler, varsler, publiserer eller kobler til sensorer. En deling skjer bare på brukerens initiativ: kopiering, nedlasting av fil, eller `navigator.share` hvis den finnes, med kopiering som reserve. Eksterne integrasjoner er tydelig merket «ikke implementert».
- Resultat fra gammel input merkes som utdatert (`stale`) eller beregnes på nytt. Det enkleste er å beregne på serveren ved hver henting.
- Følsomme domener (helse, omsorg, felt): ingen diagnose, dosering, juridisk godkjenning eller nødhjelp. Bruk formuleringene fra oppgaven.
- Norsk i UI og dokumentasjon. Få valg, korte setninger, store trykkflater.
- Alt skal fungere på loopback med fiktive data.

## Ferdig når

Fra repo-roten: `output/verify.sh <app-id>` viser «WEB: alle kontroller bestått». Kjør deretter `npx cap add ios` i appmappen (krever `npm run build` først), så `ios/` blir generert, og kjør `output/verify.sh <app-id>` igjen så testloggen er fersk. Status blir WEB_VERIFISERT + IOS_IKKE_VERIFISERT. Ikke påstå noe testloggen ikke viser.

Ikke kjør git-kommandoer som endrer noe (add, commit, push, reset, checkout). Hovedagenten committer.
