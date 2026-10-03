# Psykologiet Vibe Coding System

Fritekst fra samtaler, innsjekker og notater blir til **Vibe Codes**: forklarbare arbeidshypoteser («Overveldet», «Grubling», «Økonomisk stress») med konkrete tiltak. Systemet foreslår. Mennesker avgjør. Krisesignaler går alltid rett til et menneske.

> Separat fra Rolig pusterom-appen i repo-roten, som forblir lokal-først. Se spørsmål 17 i [kap. 14](docs/14-leveranser-og-sporsmal.md).

## Start her

```bash
# Backend (Python 3.11+)
cd backend && pip install -r requirements.txt
pytest -q                          # 14 tester, inkl. ML-regresjon (krise-recall = 1.0)
uvicorn app.main:app --reload      # http://localhost:8000/docs
curl -H "Authorization: Bearer dev-terapeut-ola" localhost:8000/v1/vibe-codes

# Frontend-komponent
cd frontend && npm install && npm run typecheck

# Hele stacken med Postgres + pgvector
docker compose up
```

## Innhold

| # | Dokument | Leveranse |
|---|---|---|
| 1 | [Sammendrag og mål](docs/01-sammendrag-og-mal.md) | KPI-er, roller |
| 2 | [Arkitektur og stack](docs/02-arkitektur-og-stack.md) | Mermaid-arkitektur + sekvens, stack-tabell |
| 3 | [Datamodell](docs/03-datamodell.md) | ER-diagram, entitetstabeller, JSONB-regler, versjonering → [`db/schema.sql`](db/schema.sql) |
| 4 | [Vibe Codes og taksonomi](docs/04-vibe-codes-og-taksonomi.md) | Mal, 12 koder, hybrid klassifisering → [`data/vibe_codes.json`](data/vibe_codes.json) |
| 5 | [API](docs/05-api.md) | Endepunkter, eksempler, feil → [`api/openapi.yaml`](api/openapi.yaml), [`data/examples/`](data/examples/) |
| 6 | [ML-pipeline](docs/06-ml-pipeline.md) | Embeddings, vektor, re-rank, annotasjon, evaluering |
| 7 | [Backend](docs/07-backend.md) | Filstruktur, ruter, transaksjoner → [`backend/`](backend/) |
| 8 | [Frontend](docs/08-frontend.md) | Komponenter, UX-prinsipper → [`VibeCodeCard.tsx`](frontend/src/components/VibeCodeCard.tsx) |
| 9 | [Personvern og etikk](docs/09-personvern-etikk.md) | GDPR, samtykke-mal, policy, risikomatrise |
| 10 | [Test og monitorering](docs/10-test-qa-monitorering.md) | Testplan, metrikker, alarmer, tilbakefall |
| 11 | [Utrulling og drift](docs/11-utrulling-og-drift.md) | Veikart, CI/CD → [`ci/github-actions.yml`](ci/github-actions.yml), backup, skalering |
| 12 | [Opplæring og dokumentasjon](docs/12-opplaering-og-dokumentasjon.md) | Materiell, FAQ, dok-struktur, etiketteringsguide |
| 13 | [MVP, roadmap, sjekklister](docs/13-mvp-roadmap-og-sjekklister.md) | Estimat, 5 × 2-ukers sprinter, go/no-go |
| 14 | [Leveranser og spørsmål](docs/14-leveranser-og-sporsmal.md) | Samlet backlog, 17 spørsmål til oppdragsgiver |

## Hva er verifisert

- `pytest`: 14/14 grønne (auth, roller, samtykke, tildeling, versjonering, rollback, negasjon, P0 uten ML-samtykke, sletting av vektorer, audit-redaksjon, gullsett)
- `db/schema.sql` kjørt mot PostgreSQL 16 + pgvector 0.6: RLS, append-only og firøyeprinsippet testet
- `openapi.yaml` validert; `tsc --strict` ren; `ruff` ren

## Hva er ikke ferdig

In-memory lager i stedet for Postgres i API-et · hashing-embedder i stedet for BGE-M3 · dev-tokens i stedet for OIDC · ingen feltkryptering ennå · Docker-image ikke bygget her · gullsettet er en røyktest, ikke klinisk validering. Alt dette står i backloggene.

## Ansvarsfraskrivelse

Vibe Codes er ikke diagnoser, og systemet er ikke en sikkerhetsvurdering. Ved akutt fare: **113**. Legevakt: **116 117**. Mental Helse Hjelpetelefonen: **116 123**.
