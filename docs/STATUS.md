# Status: hva som er bygget, hva som er verifisert, hva som mangler

Sist oppdatert 2026-10-06.

## Utgangspunkt

Repoet inneholdt en ren HTML-prototype («Pusterom», `index.html`, `isolation-mirror.html`) uten backend,
uten AGENTS.md og uten noen tidligere Antipsykologen-motor eller regelstyrt svarmotor. Det var derfor
ingen produktregler eller tekster å gjenbruke; Pusterom-filene er latt være urørt. Antipsykologen er
bygget som ny stack ved siden av.

## Implementeringsplan (valgt og gjennomført)

1. **Backend** (TypeScript, Fastify, PostgreSQL, egne SQL-migrasjoner): auth, eierskap, SSE-strømming,
   avbrytelse, idempotens, grenser, sikkerhet, kontekst/sammendrag, minne, handlingskort, eksport, sletting.
2. **Modelladapter** mot Anthropic Messages API (offisiell `@anthropic-ai/sdk`), bak et `ModelProvider`-grensesnitt.
   En tydelig merket mock brukes i tester og kan slås på lokalt (`MODEL_PROVIDER=mock`); den er sperret i produksjon.
3. **iOS** (SwiftUI, Swift Concurrency, iOS 17+, `@Observable`): Keychain, lokal utkastlagring, SSE-klient, alle skjermer.
4. **Tester**: deterministiske tester mot ekte PostgreSQL og ekte HTTP/SSE; separat evalueringssett for samtaleatferd.

### Arkitektur

```
iPhone (SwiftUI)                     Backend (Node 22 / Fastify)                  Anthropic API
─────────────────                    ───────────────────────────                  ─────────────
Keychain: enhetsnøkkel  ──HTTPS──▶   /v1/auth/*  (tokens hashet i DB)
DraftStore: utkast                   /v1/conversations/:id/messages  ──stream──▶  claude-opus-5-5
SSE-parser ◀──text/event-stream──    ├ idempotens (clientMessageId)              (effort low,
ConversationModel                    ├ sikkerhet: screener + klassifisering ──▶   fallbacks default)
                                     ├ kontekst: tråd / sammendrag / minner       claude-haiku-4-5
                                     └ status: created→generating→completed|      (sikkerhet, sammendrag,
                                               cancelled|failed                    handlingskort)
                                     PostgreSQL (migrasjoner i backend/migrations)
```

## Verifisert i byggemiljøet (med bevis)

| Hva | Bevis |
|---|---|
| Backend typesjekker | `npx tsc --noEmit` uten feil |
| 94 automatiske tester grønne mot ekte PostgreSQL 16 og ekte HTTP/SSE | `docs/TEST-RESULTS.md` |
| De ti spesifiserte testene (1–10) | `backend/test/01-…` til `10-…`; klientdelen av 3 og 10 også i `ios/AntipsykologenTests` (ikke kjørt) |
| Anthropic-adapteren sender riktig forespørsel (modell, effort, fallback-header, cache_control på stabil systemdel), parser strømmen, kartlegger stop-reason/feil og avbryter | `backend/test/anthropic-adapter.test.ts` – mot en **lokal falsk** server med Anthropic-formatert SSE, med den ekte SDK-en |
| Sign in with Apple-verifisering (signatur, iss, aud, utløp, nonce) | `backend/test/apple-auth.test.ts` – med lokalt genererte nøkler, ikke Apples |
| Serveren starter med `npm start`, migrerer, svarer på `/readyz` og strømmer en samtale | Manuell røyktest med curl (testmodus) |
| Logger uten samtaletekst, tokens eller IP | `backend/test/logging.test.ts` |
| Ingen nøkler i iOS-kildekode/prosjekt | `backend/test/02-no-secrets-in-client.test.ts`, `npm run scan:secrets -- ../ios` |
| Swift-filene er syntaktisk velformede | tree-sitter-swift-parsing av alle `.swift`-filer: ingen feil. **Ikke** typesjekk/kompilering. |
| Xcode-prosjektfilen er syntaktisk gyldig | Parset med `xcode`-pakken (2 targets, 2 synkroniserte grupper). **Ikke** åpnet i Xcode. |
| Evalfilen er gyldig | `npm run evals -- --dry-run` |

## IKKE verifisert

| Hva | Hvorfor | Hva du må gjøre |
|---|---|---|
| **iOS-appen er ikke kompilert, kjørt eller testet** – verken i simulator eller på iPhone | Byggemiljøet er Linux; nedlasting av Swift-verktøykjeden ble blokkert av nettverkspolicyen | Åpne `ios/Antipsykologen.xcodeproj` i Xcode 16+, bygg, kjør ⌘U. Forvent mulige kompileringsfeil ved første bygg. |
| **Ingen kall mot ekte modell er gjort** | `ANTHROPIC_API_KEY` finnes ikke i miljøet | Sett nøkkelen i `backend/.env`, kjør `npm run dev`, send en melding, kjør `npm run evals`. |
| Samtaleevalueringene (19 saker) er ikke kjørt mot modell | Samme | `cd backend && npm run evals` (koster penger, se skriptet) |
| Docker Compose er ikke kjørt, Docker-imaget ikke bygget | Docker-daemonen kjører ikke i byggemiljøet | `docker compose up --build` |
| Hjelpetilbud er kontrollert mot søketreff fra offisielle domener, ikke mot sidene direkte | Direkte innhenting blokkert | Se `docs/SAFETY.md` → «Før lansering» |
| Sign in with Apple mot Apples ekte nøkler | Krever Apple-konto og enhet | Se `docs/TESTFLIGHT.md` §3 |
| Tilgjengelighet (VoiceOver, Dynamic Type, små skjermer, mørk modus) i praksis | Ingen simulator | Test på iPhone SE med største tekststørrelse og VoiceOver |

## Kjente mangler og begrensninger

- **Misbruk av anonyme kontoer:** begrenset per IP (i minnet, per instans) og per bruker (tokens/kostnad), men
  uten App Attest/DeviceCheck. Bør legges til før offentlig lansering.
- **Flere instanser:** avbrytelse virker på tvers via DB-flagg, men IP-grensen for registrering og
  `active`-kartet er lokale. Én instans er antatt.
- **Kostnadstak** bruker konfigurerte priser (`PRICE_*`), ikke leverandørens faktura. Hold dem oppdatert.
- **Kontekstbudsjett** bruker et tegnbasert tokenestimat (`tegn/3`), ikke `count_tokens`.
- **Sammendrag** lages synkront før svaret når tråden er over `CONTEXT_BUDGET_TOKENS` (150k); det gir én ekstra
  forsinkelse den turen. Feiler sammendraget, brukes hele tråden.
- **«Historikk av»** sletter samtalen 24 t etter siste melding (vedlikeholdsjobb hvert 5. min), ikke umiddelbart.
- **Handlingskort** overlever sletting av samtalen (de er eksplisitt lagret av brukeren); de brukes ikke i modellkontekst.
- **Ingen påminnelser/varsler** for handlingskort (bevisst: ingen press, ingen streaks).
- **Appikon** mangler (påkrevd for arkivering).
- **Kun norsk** grensesnitt og modellinstruks.
- **Mindreårige:** ingen alderssjekk.
- **Strømming i bakgrunnen:** iOS kan kutte forbindelsen når appen går i bakgrunnen. Svaret vises da som
  avbrutt, utkast beholdes, og «Prøv igjen» bruker samme meldings-ID. Det finnes ingen bakgrunnsgenerering.
- **Leverandørens databehandling** (oppbevaring, nulloppbevaring) avhenger av API-kontoen og må avklares av den som drifter.
- Pusterom-prototypen (`index.html`, `isolation-mirror.html`) er urørt og ikke en del av Antipsykologen.
