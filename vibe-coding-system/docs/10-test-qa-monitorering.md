# 10. Testing, QA og monitorering

## Testplan

| Nivå | Verktøy | Hva | Status / mål |
|---|---|---|---|
| **Enhet** | pytest, Vitest | Klassifikator (regex, negasjon, P0-overstyring), scoring, Pydantic-validering, React-komponenter | ✅ backend. Mål: dekning ≥ 85 % på `classifier.py` |
| **API / integrasjon** | pytest + TestClient | Auth (401/403), samtykke (403), tildeling (404), versjonering, rollback ved ugyldig regex, sletting av vektorer ved tilbaketrukket samtykke, audit-redaksjon | ✅ 13 tester i `tests/test_api.py` |
| **Database** | pytest + Testcontainers (pgvector/pg16) | Migrasjon opp, RLS, append-only, firøyeprinsipp, HNSW-spørring | Manuelt verifisert (kap. 3), automatiseres i sprint 2 |
| **Kontrakt** | openapi-spec-validator, Schemathesis | Spesifikasjonen er gyldig; API-et oppfører seg som spesifikasjonen (fuzzing) | Validering ✅; Schemathesis sprint 3 |
| **E2E** | Playwright | Logg inn → opprett kontakt med samtykke → observasjon → se forslag → bekreft → anbefaling; P0-flyt; trekk samtykke | Sprint 5 |
| **Tilgjengelighet** | axe-core (Playwright), manuell skjermleser | WCAG 2.2 AA | Sprint 5 |
| **ML-regresjon** | pytest + gullsett/testsett | Krise-recall = 1,0 (hard), F1 ≥ terskel, ingen kode faller > 3 pp fra forrige modell | ✅ `test_golden_set_regression` |
| **Ytelse** | k6 | p95 < 300 ms for observasjon ved 50 samtidige, søk < 200 ms | Sprint 6 |
| **Sikkerhet** | Bandit, Trivy, ZAP baseline, pentest | OWASP topp 10, RLS-omgåelse, IDOR | ZAP sprint 6, pentest før produksjon |
| **Klinisk akseptanse** | Fagpanel | 100 forslag vurdert: korrekt, nyttig, potensielt skadelig | Før pilot |

### Kritiske testtilfeller (må aldri bli røde)
1. P0-ord gir `escalate=true` uansett negasjon og uansett ML-samtykke.
2. Terapeut B får 404 på terapeut As kontakt, og forsøket logges som `denied`.
3. Observasjon uten `behandling_observasjon`-samtykke blir avvist.
4. Tilbaketrukket ML-samtykke fjerner alle vektorer for kontakten.
5. Kodeversjoner kan ikke endres i etterkant.

## Metrikker

| Kategori | Metrikk | Terskel / SLO |
|---|---|---|
| Latens | `http_server_duration` p50/p95/p99 per rute | p95 < 300 ms (observasjon), < 200 ms (søk) |
| | `embedding_duration_seconds` | p95 < 100 ms |
| Gjennomstrømning | forespørsler/s, observasjoner/min, importrader/s | kapasitetsplanlegging |
| Feilrate | 5xx-rate | < 0,5 % over 5 min |
| | 4xx-fordeling (spesielt 403 samtykke) | trend |
| Tilgjengelighet | Oppetid | 99,5 % (MVP), 99,9 % (prod) |
| **ML-drift** | Andel observasjoner med ≥ 1 forslag | ± 15 % fra 4-ukers snitt |
| | Fordeling av koder (PSI, populasjonsstabilitetsindeks) | PSI > 0,2 = alarm |
| | **Bekreftelsesrate** per kode (bekreftet / vurdert) | fall > 10 pp/uke = alarm |
| | Embedding-drift: snitt-cosinus mot referanse-sentroide | > 3σ |
| | Andel P0 per uke | plutselig endring = undersøk (både opp og ned) |
| Sikkerhet | `audit outcome=denied` per bruker | > 5/time = varsel |
| | Uvurderte P0-forslag eldre enn 4 t | > 0 = **side** |
| Data | Backup-alder, replikeringsforsinkelse | < 24 t, < 30 s |

## Alarmer og tilbakefall

| Alarm | Alvor | Handling |
|---|---|---|
| Uvurdert P0 > 4 t | **Kritisk** | Varsle vakthavende fagperson (SMS/Teams), eskaler til leder etter 1 t |
| 5xx > 2 % i 5 min | Høy | Vakt; automatisk tilbakerulling hvis det skjedde innen 30 min etter utrulling |
| Embedding-tjeneste nede | Høy | **Tilbakefall**: kun regelbasert klassifisering (P0 virker alltid uten ML); merk `classified=false`, kø for re-klassifisering |
| ML-drift (PSI/bekreftelsesrate) | Middels | Fryse modellversjon, rulle tilbake til forrige i modellregisteret, analyse |
| DB-replikering > 60 s | Middels | Les fra primær, undersøk |
| Uvanlig mange `denied` | Middels | Personvernombud varsles, mulig konto-misbruk |

**Prinsipp for degradering:** systemet skal degradere til *trygt*, ikke til *stille*. Uten ML gjelder fortsatt reglene. Uten regler (for eksempel ødelagt taksonomi-utgivelse) gjelder forrige frosne utgivelse. Uten database blir det ingen skriving, og en tydelig feilmelding vises. Ingenting forsvinner i det stille.

## To-do

- [ ] Testcontainers-oppsett for Postgres-tester
- [ ] OTel-instrumentering (FastAPI-instrumentor) + dashboards
- [ ] Runbook for hver alarm

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | P0-alarm (uvurdert > 4 t) | Må |
| 2 | Testcontainers + RLS-tester | Må |
| 3 | Regelbasert tilbakefall ved ML-brudd | Må |
| 4 | Playwright E2E | Bør |
| 5 | PSI-drift-dashboard | Bør |
| 6 | k6-lasttest | Bør |
