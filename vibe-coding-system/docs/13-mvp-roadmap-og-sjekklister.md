# 13. Mini-MVP: omfang, roadmap og sjekklister

## Omfang

**Inne:** én organisasjon · roller terapeut, fagansvarlig, personvernombud og admin · 12 koder · kontakt + samtykke + observasjon · hybrid klassifisering (regler + BGE-M3) · vurdering av forslag · anbefalinger · semantisk søk · audit · OIDC · Postgres + pgvector · CI/CD · staging + prod.

**Ute (MLP+):** sluttbruker-app · re-ranker · finjustert klassifikator · EPJ-integrasjon · multi-tenant · VibeCodeEditor-GUI (MVP: koder endres via API + PR på JSON) · rapporter.

## Estimat

1,5 utvikler (én fullstack + én backend/ML på 50 %) + fagansvarlig ~20 % + personvernombud ved behov.

| Arbeidspakke | Uker (1 utv.) | Allerede i repo |
|---|---|---|
| Datamodell + migrasjoner + PostgresStore + RLS | 1,5 | skjema ✅ |
| API (implementerte + gjenstående ruter) | 1,5 | 9 ruter ✅ |
| Klassifikator + taksonomi + gullsett | 1,0 | ✅ (regler + hashing) |
| BGE-M3-tjeneste + pgvector-søk + PII-maskering | 1,5 | — |
| Auth (OIDC + BFF) | 1,0 | dev-auth ✅ |
| Frontend: skall, kontakt, observasjon, kort, dashboard, samtykke, audit | 3,5 | VibeCodeCard ✅ |
| Feltkryptering + KMS | 0,5 | — |
| Observability + alarmer | 1,0 | — |
| CI/CD + IaC + miljøer | 1,0 | CI-mal ✅ |
| E2E, a11y, last- og sikkerhetstest | 1,0 | — |
| Buffer (20 %) | 2,5 | — |
| **Sum** | **~15 utviklerkuker ≈ 10 kalenderuker med 1,5 utv.** | |

Med to fulle utviklere: ~8 uker. Med én: ~14 uker.

## Sprintplan (5 × 2 uker = 10 uker)

| Sprint | Uker | Mål | Leveranser (definition of done) |
|---|---|---|---|
| **S1: Fundament** | 1–2 | Data og sikkerhet på plass | Alembic V001 fra `schema.sql` · `PostgresStore` med `SET LOCAL` + RLS-tester i Testcontainers · OIDC mot test-IdP · CI aktivert (lint, schema, OpenAPI, pytest) · DPIA startet · fagråd godkjenner 12 koder |
| **S2: Kjerneflyt API** | 3–4 | Observasjon → forslag → vurdering, ende til ende i API | Alle MVP-ruter mot Postgres · feltkryptering (envelope) · audit i egen transaksjon + partisjon · Idempotency-Key · innsynseksport · gullsett utvidet til 100 |
| **S3: Semantikk** | 5–6 | Ekte embeddings | BGE-M3 i TEI-container · PII-maskering før embedding · prototyper + HNSW · semantisk søk via pgvector · re-embedding-jobb · regelbasert tilbakefall når embedding er nede · ML-regresjon med F1 ≥ 0,75 og krise-recall 1,0 |
| **S4: Frontend** | 7–8 | Terapeut kan jobbe i UI | App-skall + BFF-innlogging · Dashboard (P0 først) · Kontaktvisning + tidslinje · ObservasjonsEditor · VibeCodeCard koblet til API · Samtykkeflyt · semantisk søk · audit-visning for personvernombud |
| **S5: Herding og pilot** | 9–10 | Klar for 5–10 pilotbrukere | Playwright E2E + axe · k6 (p95 < 300 ms ved 50 VU) · ZAP baseline · OTel-dashboards + P0-alarm · backup + gjenopprettingstest · sandkasse med syntetiske data · opplæringsvideoer · go/no-go-møte |

## Go/no-go-sjekkliste ved lansering

| # | Kriterium | Eier | ✓ |
|---|---|---|---|
| **Juridisk og personvern** | | | |
| 1 | DPIA ferdig og godkjent av personvernombud | DPO | ☐ |
| 2 | Behandlingsgrunnlag dokumentert (art. 6 + 9) | Jurist | ☐ |
| 3 | Databehandleravtale med sky; data i EØS | Jurist | ☐ |
| 4 | Samtykketekst brukertestet og versjonert | Produkt | ☐ |
| **Klinisk sikkerhet** | | | |
| 5 | Krise-recall = 1,0 på frosset testsett | ML | ☐ |
| 6 | Kriserutine skrevet, kjent av alle pilotbrukere | Fagansvarlig | ☐ |
| 7 | P0-alarm (uvurdert > 4 t) testet ende til ende | Drift | ☐ |
| 8 | Fagpanel har vurdert 100 forslag; 0 «potensielt skadelig» uten tiltak | Fagansvarlig | ☐ |
| 9 | Alle 12 koder godkjent (firøyeprinsipp) | Fagansvarlig | ☐ |
| **Sikkerhet** | | | |
| 10 | RLS-tester grønne; IDOR-test manuelt verifisert | Utvikler | ☐ |
| 11 | Ingen HIGH/CRITICAL i Trivy/ZAP | Utvikler | ☐ |
| 12 | Feltkryptering aktiv; nøkkelrotasjon dokumentert | Drift | ☐ |
| 13 | MFA påkrevd for alle roller | Drift | ☐ |
| 14 | Ingen PII i applikasjonslogger (stikkprøve av 1 000 linjer) | Utvikler | ☐ |
| **Drift** | | | |
| 15 | Gjenopprettingstest utført; RTO ≤ 4 t målt | Drift | ☐ |
| 16 | Dashboards + alarmer + runbooks | Drift | ☐ |
| 17 | Tilbakerulling testet (app og modell) | Drift | ☐ |
| 18 | Regelbasert tilbakefall verifisert (embedding stoppet) | Utvikler | ☐ |
| **Kvalitet og bruk** | | | |
| 19 | E2E + a11y (WCAG 2.2 AA) grønne | Utvikler | ☐ |
| 20 | p95 < 300 ms ved forventet last | Utvikler | ☐ |
| 21 | Pilotbrukere har fullført opplæring inkl. kontrollkort | Produkt | ☐ |
| 22 | Kanal for tilbakemelding og avvik etablert | Produkt | ☐ |

**Regel:** punkt 1, 2, 5, 6, 7 og 10 er absolutte. Ett rødt = no-go. Øvrige kan ha dokumentert, tidsavgrenset avvik godkjent av produkteier og personvernombud.

## To-do

- [ ] Bekreft teamstørrelse → velg 8-, 10- eller 14-ukersplan
- [ ] Sett datoer for sprintdemoer og go/no-go-møte

## Prioritert backlog (MVP, rangert)

1. PostgresStore + RLS
2. OIDC
3. DPIA
4. Feltkryptering
5. BGE-M3 + PII-maskering
6. P0-alarm
7. Frontend kjerneflyt
8. Innsynseksport
9. E2E/a11y
10. Gjenopprettingstest
