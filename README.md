# Antipsykologen

> «Du har forklart det. Hva gjør du nå?»

Et norsk refleksjonsverktøy med tørr humor, direkte spørsmål og konkrete handlinger. iOS-app (SwiftUI)
med egen backend (TypeScript + PostgreSQL) og strømmet samtale fra en språkmodell (Anthropic) via serveren.
Ikke en psykolog. Ikke en krisetjeneste.

**Status:** backend er bygget og testet (93 automatiske tester). iOS-appen er skrevet, men **ikke kompilert
eller kjørt** – byggemiljøet hadde ikke Xcode. **Ingen kall mot ekte modell er gjort** – ingen API-nøkkel var
tilgjengelig. Se [docs/STATUS.md](docs/STATUS.md) for nøyaktig hva som er verifisert.

## Innhold

| Mappe / fil | Hva |
|---|---|
| `backend/` | API, modelladapter, sikkerhet, migrasjoner, tester |
| `backend/prompts/system.no.md` | Systeminstruksen |
| `backend/config/hjelpetilbud.no.json` | Verifiserte norske hjelpetilbud med kontrolldato |
| `ios/` | Xcode-prosjekt (SwiftUI, iOS 17+) og XCTest |
| `evals/conversation-evals.json` | Samtaleevalueringer (kjøres mot ekte modell) |
| `docker-compose.yml` | PostgreSQL + backend lokalt |
| [docs/API.md](docs/API.md) | API-kontrakt, SSE-hendelser, statuser |
| [docs/PRIVACY.md](docs/PRIVACY.md) | Hva lagres hvor, hva sendes til modellleverandøren |
| [docs/SAFETY.md](docs/SAFETY.md) | Sikkerhetsflyt og begrensninger |
| [docs/TESTFLIGHT.md](docs/TESTFLIGHT.md) | Signering og TestFlight |
| [docs/STATUS.md](docs/STATUS.md) | Plan, arkitektur, verifisert / ikke verifisert, kjente mangler |
| [docs/TEST-RESULTS.md](docs/TEST-RESULTS.md) | Siste testkjøring |
| `index.html`, `isolation-mirror.html`, `RUN.md`, `HULL.md` | Tidligere, urelatert «Pusterom»-prototype (urørt) |

## Kom i gang lokalt

Krav: Node 22+, og enten Docker eller en PostgreSQL 16 du har selv. For iOS: Mac med Xcode 16+.

### 1. Konfigurer

```bash
cp backend/.env.example backend/.env
# Rediger backend/.env: sett ANTHROPIC_API_KEY=<nøkkel fra https://platform.claude.com/>
```

Uten nøkkel nekter serveren å starte med `MODEL_PROVIDER=anthropic`. For å prøve uten nøkkel:
`MODEL_PROVIDER=mock` – svarene er da faste testsvar merket «[Testmodus – ikke et modellsvar]», og appen viser et banner.

### 2a. Start med Docker Compose

```bash
docker compose up --build
curl http://localhost:8080/readyz     # {"ok":true,"db":"ok","provider":"anthropic"}
```

### 2b. …eller uten Docker

```bash
# PostgreSQL må kjøre, og DATABASE_URL i backend/.env må peke på den.
cd backend
npm ci
set -a && . ./.env && set +a
npm run migrate
npm run dev                          # http://localhost:8080
```

### 3. Prøv API-et med curl

```bash
B=http://localhost:8080
T=$(curl -s -X POST $B/v1/auth/anonymous | python3 -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')
C=$(curl -s -X POST $B/v1/conversations -H "authorization: Bearer $T" -H 'content-type: application/json' \
      -d '{"topic":"utsettelse"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["id"])')
curl -N -X POST $B/v1/conversations/$C/messages -H "authorization: Bearer $T" -H 'content-type: application/json' \
  -d "{\"clientMessageId\":\"$(uuidgen | tr A-Z a-z)\",\"content\":\"Jeg skal skrive søknaden, men rydder kjøleskapet.\"}"
```

### 4. iOS

```bash
open ios/Antipsykologen.xcodeproj
```

Velg skjemaet **Antipsykologen**, en iPhone-simulator, og kjør (⌘R). Debug-bygget bruker `http://localhost:8080`
(`ios/Support/Debug.xcconfig`). Tester: ⌘U. Signering og TestFlight: [docs/TESTFLIGHT.md](docs/TESTFLIGHT.md).

## Tester

```bash
# Testene trenger en PostgreSQL-database de kan tømme:
export TEST_DATABASE_URL=postgres://antipsykologen:antipsykologen@localhost:5432/antipsykologen_test
createdb -h localhost -U antipsykologen antipsykologen_test   # én gang
cd backend
npm run typecheck
npm test                              # deterministiske tester, mock-modell, ekte DB og HTTP
npm run scan:secrets -- ../ios        # ingen nøkler i klientkoden
npm run evals -- --dry-run            # valider evalsettet (gratis)
npm run evals                         # samtaleatferd mot EKTE modell (koster penger)
```

Testene er delt slik:

| Type | Hvor | Modell |
|---|---|---|
| Programlogikk (auth, eierskap, strømming, idempotens, sletting, sikkerhetsflyt, logger) | `backend/test/*.test.ts` | Mock |
| Adapter mot leverandørens protokoll | `backend/test/anthropic-adapter.test.ts` | Lokal falsk server |
| iOS-logikk (SSE-parser, utkast, avbrudd, nettfeil) | `ios/AntipsykologenTests` | Falsk tjeneste |
| Samtaleatferd (19 saker, regler + modell som dommer) | `evals/` + `backend/scripts/run-evals.ts` | **Ekte** |

## Produktprinsipp

Utfordre bortforklaringen. Bevar menneskets verdighet.
