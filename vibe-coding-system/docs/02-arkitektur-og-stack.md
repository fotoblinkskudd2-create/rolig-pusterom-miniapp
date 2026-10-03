# 2. Arkitektur og teknologistack

## Høynivådiagram

```mermaid
flowchart LR
  subgraph Klient
    U[Nettleser<br/>React + TS SPA]
  end

  subgraph Edge
    CDN[CDN / WAF<br/>kun statiske filer]
  end

  subgraph Plattform["Kubernetes / Container Apps (EØS-region)"]
    BFF[BFF<br/>OIDC-sesjon, CSRF]
    API[Vibe API<br/>FastAPI]
    WK[Worker<br/>import, embedding, re-index]
    EMB[Embedding-tjeneste<br/>BGE-M3, selvhostet GPU/CPU]
    RR[Re-ranker<br/>bge-reranker-v2-m3]
    Q[(Kø<br/>Redis Streams / Service Bus)]
  end

  subgraph Data
    PG[(PostgreSQL 16<br/>relasjonelt + JSONB + RLS)]
    VEC[(pgvector HNSW<br/>i samme PG)]
    OBJ[(Objektlager<br/>importfiler, backup, kryptert)]
    KMS[[KMS / Key Vault<br/>DEK/KEK]]
  end

  subgraph Observability
    OTEL[OpenTelemetry Collector]
    LOG[(Logg: Loki<br/>uten PII)]
    MET[(Metrikker: Prometheus)]
    GRAF[Grafana + Alertmanager]
  end

  IDP[[IdP: Entra ID / Keycloak<br/>ID-porten for innbyggere]]

  U -->|HTTPS| CDN --> U
  U -->|HTTPS, cookie| BFF
  BFF <-->|OIDC + PKCE| IDP
  BFF -->|JWT| API
  API --> PG
  API --> VEC
  API --> EMB
  API --> RR
  API --> Q --> WK
  WK --> EMB
  WK --> PG
  WK --> OBJ
  API -. envelope-kryptering .-> KMS
  API --> OTEL
  WK --> OTEL
  OTEL --> LOG
  OTEL --> MET
  MET --> GRAF
```

### Dataflyt for en observasjon

```mermaid
sequenceDiagram
  participant T as Terapeut
  participant API
  participant PG as Postgres (RLS)
  participant E as Embedding
  participant C as Hybrid-klassifikator
  T->>API: POST /contacts/{id}/observations
  API->>PG: BEGIN, SET LOCAL app.user_id
  API->>PG: sjekk tildeling + samtykke
  alt mangler behandling_observasjon
    API-->>T: 403 problem+json (logget)
  else har ml_klassifisering
    API->>E: embed(tekst)
    API->>C: regler + semantikk + negasjon
  else uten ML-samtykke
    API->>C: kun P0-regler (ingen vektor lagres)
  end
  API->>PG: INSERT observation, suggestions, embedding
  API->>PG: COMMIT
  API->>PG: INSERT audit_event
  API-->>T: 201 + forslag (P0 øverst, med begrunnelse)
```

## Anbefalt stack

| Lag | Valg | Hvorfor | Alternativ |
|---|---|---|---|
| Frontend | React 18 + TypeScript + Vite, TanStack Query, Radix UI | Tilgjengelige primitiver, typesikker | SvelteKit |
| BFF | FastAPI eller Node (Fastify) | Holder tokens unna nettleseren | API-gateway med OIDC-plugin |
| Backend | **Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy 2 / asyncpg** | Samme språk som ML-økosystemet, OpenAPI gratis | Node + NestJS |
| Relasjonell DB | **PostgreSQL 16** med RLS, JSONB, partisjonering | Én DB å sikre, revidere og ta backup av | — |
| Vektor | **pgvector (HNSW)** i samme PG | Færre databehandlere, transaksjonell sletting ved tilbaketrukket samtykke | Qdrant (selvhostet) når > 10 M vektorer; Weaviate. Pinecone frarådes (US-SaaS og helsedata) |
| Embeddings | **BGE-M3** (flerspråklig, 1024 dim, god på norsk) selvhostet | Ingen helsedata ut av eget miljø | multilingual-e5-large; NorBERT-familien for finjustering |
| Re-rank | bge-reranker-v2-m3 | Kryss-encoder for topp-20 | — |
| Tekstklassifikator | Finjustert XLM-R / NB-BERT (multi-label) når ≥ 300 eksempler per kode | Bedre presisjon enn ren likhet | Logistisk regresjon på embeddings (baseline) |
| Kø / jobber | Redis Streams eller Azure Service Bus + arq/Celery | Import, re-embedding | — |
| Auth | OIDC (Entra ID / Keycloak), ID-porten for innbyggere | SSO, MFA, roller i claims | — |
| Hemmeligheter / nøkler | Azure Key Vault / HashiCorp Vault | Envelope-kryptering, rotasjon | — |
| Container / orkestrering | Docker, Kubernetes (AKS) eller Azure Container Apps | Samme image fra dev til prod | On-prem: k3s / OpenShift |
| IaC | Terraform + Helm | Reproduserbart | Bicep |
| CI/CD | GitHub Actions (mal i `ci/github-actions.yml`) | Miljøgodkjenning, OIDC til sky | GitLab CI |
| Observability | OpenTelemetry → Prometheus, Loki, Tempo, Grafana | Åpen standard | Azure Monitor |
| CDN / WAF | Azure Front Door / Cloudflare (kun statiske filer, ingen API-caching) | — | — |

## Arkitekturprinsipper

1. **Én kilde til sannhet**: relasjonsdata og vektorer i samme Postgres til volumet krever noe annet.
2. **Helsedata forlater ikke miljøet**: modellene er selvhostet. Eventuell ekstern LLM (til oppsummering) kun etter DPIA, med databehandleravtale og EØS-prosessering, og alltid på pseudonymisert tekst.
3. **Sikkerhet i databasen, ikke bare i appen**: RLS, append-only audit, uforanderlige kodeversjoner (testet i `db/schema.sql`).
4. **Forklarbarhet**: hvert forslag har `matched_signals`, `rule_score` og `semantic_score`.
5. **Utbyttbart ML-lag**: `Embedder`-protokollen (`backend/app/embeddings.py`) gjør modellbytte til en konfigurasjonsendring pluss en re-embedding-jobb.

## To-do

- [ ] Velg sky og region, eller on-prem (kap. 14)
- [ ] Bestem IdP og rollekilde (AD-grupper eller egen tabell)
- [ ] Ytelsestest BGE-M3 på CPU kontra GPU med forventet volum

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | BFF med OIDC + PKCE | Må |
| 2 | Embedding-tjeneste bak intern HTTP med batch | Må |
| 3 | Re-ranker | Bør (MLP) |
| 4 | Qdrant-migreringssti | Kan |
