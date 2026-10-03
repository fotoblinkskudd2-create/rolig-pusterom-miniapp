# 14. Leveranser, format og spørsmål til oppdragsgiver

## Leveranser i denne pakken

| Format | Fil | Status |
|---|---|---|
| Markdown | `docs/01`–`14` | ✅ |
| Mermaid | arkitektur, sekvens (02), ER (03), klassifiseringsflyt (04), ML-pipeline (06) | ✅ |
| OpenAPI YAML | `api/openapi.yaml` | ✅ validert |
| SQL-skjema | `db/schema.sql` | ✅ kjørt mot PG 16 + pgvector; RLS og immutabilitet testet |
| Python | `backend/app/*.py` | ✅ 14 tester grønne, ruff ren |
| TypeScript/React | `frontend/src/components/VibeCodeCard.tsx`, `types.ts` | ✅ `tsc --strict` ren |
| JSON | `data/vibe_codes.json` (12 koder), `data/examples/*.json` (6 ekte request/response), `data/golden_set.jsonl` | ✅ |
| Drift | `backend/Dockerfile`, `docker-compose.yml`, `ci/github-actions.yml` (mal) | ✅ (Docker ikke bygget i denne økten) |

Hver seksjon i `docs/` slutter med **To-do** og **Prioritert backlog**.

## Samlet backlog (topp 15 på tvers)

| # | Punkt | Kap. | Prioritet |
|---|---|---|---|
| 1 | DPIA + behandlingsgrunnlag | 9 | Må, blokkerer pilot |
| 2 | Klinisk validering av VC-012-mønstre | 4 | Må |
| 3 | PostgresStore + RLS-integrasjonstester | 3, 7 | Må |
| 4 | OIDC + BFF | 2, 7 | Må |
| 5 | Feltkryptering (envelope/KMS) | 9 | Må |
| 6 | PII-maskering før embedding | 6 | Må |
| 7 | BGE-M3 bak `Embedder` | 6 | Må |
| 8 | P0-alarm + outbox-varsling | 7, 10 | Må |
| 9 | Frontend kjerneflyt | 8 | Må |
| 10 | Innsynseksport (art. 15/20) | 5 | Må |
| 11 | CI aktivert med krise-recall-gate | 11 | Må |
| 12 | Gjenopprettingstest | 11 | Må |
| 13 | Re-ranker | 6 | Bør |
| 14 | Terskel per kode + nynorsk/dialekt | 4 | Bør |
| 15 | Rettferdighetsmåling | 6, 9 | Bør |

## Spørsmål til oppdragsgiver

Svarene endrer arkitekturen. Antakelsene i parentes er det pakken er bygget på nå.

### Brukere og arbeidsflyt
1. **Hvilke roller og arbeidsflyter er viktigst ved oppstart?** Er det terapeut → observasjon → forslag, eller fagansvarlig → taksonomi først? *(Antatt: terapeutflyten.)*
2. Skal **sluttbrukere** (klienter) inn i MVP, for eksempel via Rolig pusterom-appen, eller er det fase 2? *(Antatt: fase 2.)*
3. Hvem eier taksonomien faglig, og hvem godkjenner endringer (firøyeprinsipp)?
4. Finnes en eksisterende **kriserutine / vaktordning** som P0 skal kobles til?

### Data og integrasjoner
5. **Finnes eksisterende data (CSV, CRM, EPJ) som må importeres?** Hvilket system (DIPS, Infodoc, CGM, Visma, egen)? Format og volum?
6. Skal Vibe Codes skrives **tilbake** til journal, eller lever de kun i dette systemet?
7. Finnes historiske, annoterte eller annoterbare data til trening? Har vi lov til å bruke dem (samtykke/formål)?

### Volum og ytelse
8. **Forventet trafikk og antall samtidige brukere?** *(Antatt: 50–200 brukere, < 50 samtidige, ~5 000 observasjoner/mnd.)*
9. **Krav til sanntid og latens** for søk og anbefalinger? *(Antatt: < 1 s oppfattet, p95 < 300 ms server.)* Trengs forslag *mens* man skriver?

### Regulatorisk
10. **Hvilket land/region og hvilke regulatoriske krav gjelder?** Er virksomheten en helseaktør (pasientjournalloven, Normen), eller et lavterskeltilbud/coaching (samtykke som grunnlag)? *(Antatt: Norge, art. 9.)*
11. Skal produktet markedsføres med **diagnostisk eller behandlende formål**? (Utløser MDR/medisinsk utstyr. Pakken er bygget for å *unngå* det.)
12. Er det brukere i USA eller utenfor EØS (CCPA, overføringsgrunnlag)?

### Drift og kostnad
13. **On-prem eller sky, og hvilken sky?** *(Antatt: Azure Norway East.)* Finnes eksisterende plattform (AKS, OpenShift, NHN)?
14. **Kostnadsramme for drift per måned?** Styrer GPU kontra CPU for embedding, HA-nivå og administrert kontra selvdrevet Postgres. *(Grovt: MVP på CPU ~ 3–8 000 kr/mnd i sky; med GPU og HA ~ 15–30 000 kr/mnd. Må prises konkret.)*
15. Krav til oppetid (SLA) og RPO/RTO? *(Antatt: 99,5 %, RPO 5 min, RTO 4 t.)*
16. Eksisterende IdP (Entra ID, Keycloak, Feide, HelseID, ID-porten)?

### Forholdet til eksisterende repo
17. Dette repoet er i dag **Rolig pusterom**, en lokal-først app der «ingen sky» er et uttalt prinsipp (`HULL.md`). Vibe Coding System er en skybasert tjeneste med helsedata. Skal det:
    - (a) leve som eget repo (anbefalt: ulike trusselmodeller og utgivelsessykluser), eller
    - (b) bli her, med pusterom-appen som en framtidig *valgfri* sluttbrukerklient som aldri sender data uten eksplisitt samtykke?
