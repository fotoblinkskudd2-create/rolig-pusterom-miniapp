# 5. API-kontrakter og OpenAPI

Kontrakt: [`api/openapi.yaml`](../api/openapi.yaml) (OpenAPI 3.1, validert med `openapi-spec-validator`). Endepunkter med `x-implemented: true` finnes i `backend/app/main.py`, og FastAPI genererer også live-dokumentasjon på `/docs`.

## Endepunkter

| Område | Metode og sti | Rolle | Status |
|---|---|---|---|
| Auth | `POST /auth/token`, `GET /auth/me` | — | Kontrakt (BFF) |
| VibeCode | `GET /vibe-codes`, `GET /vibe-codes/{id}[?version=n]`, `GET /vibe-codes/{id}/versions` | alle | ✅ |
| | `POST /vibe-codes` (draft), `PUT /vibe-codes/{id}` (ny versjon) | fagansvarlig | ✅ |
| | `DELETE /vibe-codes/{id}` → 405, bruk `deprecated` | — | Kontrakt |
| Søk | `POST /search/semantic` | alle | ✅ |
| Kontakter | `POST /contacts` | terapeut | ✅ |
| | `GET /contacts`, `GET/PATCH/DELETE /contacts/{id}`, `GET /contacts/{id}/export` | terapeut | Kontrakt |
| Samtykke | `DELETE /contacts/{id}/consents/{purpose}` | terapeut | ✅ |
| Interaksjoner | `GET/POST /contacts/{id}/interactions` | terapeut | Kontrakt |
| Observasjoner | `POST /contacts/{id}/observations` | terapeut | ✅ |
| Vurdering | `PATCH /observations/{id}/suggestions/{code}?decision=` | terapeut | ✅ |
| Anbefalinger | `GET /contacts/{id}/recommendations?days=30` | terapeut | ✅ |
| Batch-import | `POST /import/contacts?dry_run=true` (CSV/NDJSON) → 202 + jobb | admin | Kontrakt |
| Ingest | `POST /ingest/embed-jobs`, `GET /jobs/{id}` | admin | Kontrakt |
| Audit | `GET /audit-logs` | personvernombud (full), admin (uten detaljer) | ✅ |

## Eksempler

Disse er **faktiske svar** generert fra API-et, ikke håndskrevne. Se [`data/examples/`](../data/examples/).

**Lagre observasjon:** `POST /v1/contacts/{id}/observations`

```json
{
  "text": "Inkassobrevet ligger på bordet, gjelden vokser og jeg skammer meg. Får ikke sove.",
  "source": "samtale",
  "attributes": {"humør_1_5": 2, "varighet_min": 50}
}
```

`201 Created` (forkortet):

```json
{
  "id": "d65111f1-…",
  "classified": true,
  "embedding_model": "hashing-char345-512",
  "suggestions": [
    {"code_id": "VC-008", "code_version": 1, "score": 0.88, "rule_score": 0.8, "semantic_score": 1.0,
     "matched_signals": ["gjelden", "Inkassobrevet"], "negated_signals": [], "escalate": false, "status": "foreslatt"},
    {"code_id": "VC-006", "score": 0.612, "matched_signals": ["skammer"], "escalate": false, "status": "foreslatt"}
  ]
}
```

**Semantisk søk:** `POST /v1/search/semantic` `{"query": "ligger våken og tankene går i ring", "top_k": 3}`

```json
[
  {"code_id": "VC-010", "name": "Søvnforstyrrelse", "score": 0.5061, "semantic_score": 0.4659, "rule_score": 0.6},
  {"code_id": "VC-003", "name": "Grubling", "score": 0.4359, "semantic_score": 0.6228, "rule_score": 0.0},
  {"code_id": "VC-005", "name": "Lav energi / nedstemthet", "score": 0.2434, "semantic_score": 0.3478, "rule_score": 0.0}
]
```

Merk at VC-003 (Grubling) har høyest semantisk score, mens VC-010 vinner på regeltreffet «ligger våken». Med en ekte embedding-modell og re-ranker vil grubling sannsynligvis gå til topps. Dette er nettopp den typen tilfelle ML-regresjonssettet skal fange.

## Feilhåndtering

Alle feil er `application/problem+json` (RFC 9457):

| Status | Når | Eksempel `title` |
|---|---|---|
| 400 | Ugyldig format | — |
| 401 | Mangler eller ugyldig token | «Mangler bearer-token» |
| 403 | Feil rolle **eller** manglende samtykke | «Kontakten har ikke gitt samtykke til lagring av observasjoner» |
| 404 | Finnes ikke **eller** ikke tildelt (samme svar, slik at eksistens ikke lekker) | «Kontakt ikke funnet» |
| 409 | ID finnes allerede | «VC-099 finnes allerede. Bruk PUT for ny versjon.» |
| 422 | Valideringsfeil, ugyldig regex, ukjente relaterte koder | `detail: [{loc, msg}]` |
| 429 | Ratebegrensning (gateway) | `Retry-After`-header |
| 5xx | Uventet. `trace_id` i svaret, aldri stacktrace | — |

```json
{"type": "https://vibe.example/problems/422", "title": "Ugyldig forespørsel", "status": 422,
 "detail": [{"loc": ["body", "query"], "msg": "String should have at least 2 characters"}]}
```

**Konvensjoner:** `Idempotency-Key` på POST som oppretter noe; markørbasert paginering (`cursor`, `next_cursor`); versjon i stien (`/v1`); bakoverkompatible endringer kun innen `v1`.

## To-do

- [ ] Implementer kontrakt-endepunktene (`GET /contacts`, interaksjoner, eksport, import)
- [ ] Generer TypeScript-klient fra OpenAPI (`openapi-typescript`) i frontend-bygget
- [ ] Kontraktstest: Schemathesis mot kjørende API i CI

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | `GET /contacts/{id}/export` (innsyn, art. 15) | Må |
| 2 | Idempotency-Key-støtte | Må |
| 3 | Batch-import med `dry_run`-rapport | Bør |
| 4 | Webhooks for P0-eskalering (til EPJ / vaktordning) | Bør |
