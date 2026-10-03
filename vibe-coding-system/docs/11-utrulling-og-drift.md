# 11. Utrulling og drift

## Trinnvis veikart

| Fase | Når | Omfang | Exit-kriterier |
|---|---|---|---|
| **MVP** | uke 1–10 | Én organisasjon, terapeutrollen + fagansvarlig. 12 koder. Regler + embedding. Kontakt, samtykke, observasjon, forslag, vurdering, anbefaling, audit. PostgreSQL + pgvector. OIDC. | Go/no-go (kap. 13), DPIA godkjent, krise-recall 1,0, 5–10 pilotbrukere |
| **MLP** (minimum lovable) | uke 11–20 | Re-ranker, finjustert klassifikator, VibeCodeEditor med godkjenningsflyt, import fra EPJ/CRM, Dashboard, Storybook, rettferdighetsmåling, P0-integrasjon mot vaktordning | Bekreftelsesrate ≥ 70 %, SUS ≥ 72, 50 brukere |
| **Produksjon** | uke 21+ | Flere virksomheter (tenant-isolasjon), sluttbruker-app (kan bygge på Rolig pusterom), HA-database, 99,9 % SLO, pentest, ekstern revisjon | Pentest uten høy/kritisk, revisjon godkjent |

## CI/CD

Mal: [`ci/github-actions.yml`](../ci/github-actions.yml). Den er **ikke aktivert ennå**. Kopier den til `.github/workflows/vibe-ci.yml` når repoet er klart.

```
PR ──► lint (ruff) ──► schema.sql mot ekte pgvector ──► OpenAPI-validering ──► pytest (inkl. krise-recall-gate)
   └─► frontend: npm ci + tsc
main ─► bygg image ─► Trivy-skann (blokkerer HIGH/CRITICAL) ─► staging (auto) ─► produksjon (manuell godkjenning, canary 10 % → 100 %)
```

Prinsipper: samme image fra staging til produksjon (promoveres, bygges ikke på nytt); hemmeligheter via OIDC-federering til sky (ingen langlevde nøkler i GitHub); migrasjoner kjøres som egen jobb **før** ny app-versjon (expand/contract, kap. 3).

## Backup og gjenoppretting

| Hva | Hvordan | RPO | RTO |
|---|---|---|---|
| PostgreSQL | Kontinuerlig WAL-arkivering (pgBackRest / administrert PITR) + daglig full backup, kryptert, i en annen sone | ≤ 5 min | ≤ 4 t |
| Objektlager (importfiler) | Versjonering + livssyklus (slettes etter 30 dager) | 24 t | 8 t |
| Nøkler (KMS) | Soft delete + purge protection, eksportert til HSM-backup | — | — |
| Konfigurasjon / IaC | Git | 0 | 1 t |

**Gjenopprettingstest hvert kvartal**: gjenopprett til et isolert miljø, kjør røyktester og RLS-tester, mål faktisk RTO, og dokumenter. En backup som aldri er gjenopprettet, er bare et håp.

Merk sletting: når en kontakt hard-slettes, ligger data fortsatt i backup til backupen roteres ut (≤ 35 dager). Ved gjenoppretting kjøres sletteloggen på nytt.

## DB-migrasjoner

1. Alembic-revisjon i PR, gjennomgått av to personer.
2. CI kjører `upgrade` mot tom DB **og** mot et anonymisert øyeblikksbilde av produksjon.
3. Expand → deploy app (dobbeltskriving) → backfill-jobb → deploy app (les ny) → contract i neste utgivelse.
4. Lange operasjoner: `CREATE INDEX CONCURRENTLY`, batch-backfill med `LIMIT` og pause.
5. Tilbakerulling = ny migrasjon fremover, eller gjenoppretting fra PITR for destruktive feil.

## Skalering

| Komponent | Strategi | Når |
|---|---|---|
| API | Horisontalt (stateless), HPA på CPU + p95 | > 60 % CPU |
| Embedding | Egen deployment; GPU-node ved > 20 req/s; batching | p95 > 100 ms |
| Postgres | Vertikalt først → lesereplika for søk og rapporter → partisjonering (audit, observasjon per år) | > 70 % CPU / IOPS |
| Vektor | pgvector HNSW → Qdrant-klynge | > 10 M vektorer eller ANN p95 > 50 ms |
| Worker | Antall per kølengde (KEDA) | kø > 1 000 |
| Multi-tenant | Schema per tenant (inntil ~50) → database per tenant for store kunder | ved kunde nr. 2 |

## To-do

- [ ] Terraform-moduler: nettverk, PG, KMS, container-plattform
- [ ] Aktiver CI-malen
- [ ] Første gjenopprettingstest før pilot

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | CI aktiv med krise-recall-gate | Må |
| 2 | PITR + gjenopprettingstest | Må |
| 3 | Staging-miljø med syntetiske data | Må |
| 4 | Canary-utrulling | Bør |
| 5 | KEDA for worker | Kan |
