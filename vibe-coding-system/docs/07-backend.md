# 7. Backend-implementasjon

**Valg: Python 3.12 + FastAPI.** ML-økosystemet (tokenisering, embeddings, evaluering) er i Python, Pydantic gir validering og OpenAPI, og ett språk for API og ML gir ett team.

## Filstruktur

Implementert i MVP-skissen (✅) og planlagt:

```
backend/
├── app/
│   ├── main.py            ✅ ruter, problem+json, audit
│   ├── models.py          ✅ Pydantic-modeller (API + domene)
│   ├── classifier.py      ✅ hybrid regel + semantikk, P0-overstyring
│   ├── embeddings.py      ✅ Embedder-protokoll + HashingEmbedder
│   ├── store.py           ✅ InMemoryStore med transaksjon/rollback
│   ├── security.py        ✅ dev-tokens, rolle-avhengigheter (OIDC-krok)
│   ├── db/
│   │   ├── postgres.py       PostgresStore (asyncpg, SET LOCAL, RLS)
│   │   └── migrations/       Alembic V001…
│   ├── crypto.py             envelope-kryptering via KMS
│   ├── pii.py                maskering før embedding
│   └── workers/
│       ├── import_job.py     CSV/NDJSON-import
│       └── embed_job.py      re-embedding / backfill
├── tests/
│   └── test_api.py        ✅ 14 tester inkl. ML-regresjon
├── requirements.txt       ✅
└── Dockerfile             ✅ non-root, healthcheck
```

Kjør:

```bash
cd vibe-coding-system/backend
pip install -r requirements.txt
pytest -q                                  # 14 passed
uvicorn app.main:app --reload              # http://localhost:8000/docs
curl -H "Authorization: Bearer dev-terapeut-ola" localhost:8000/v1/vibe-codes
```

Dev-token-format: `dev-<rolle>-<bruker>`, for eksempel `dev-fagansvarlig-ane`. De er avslått når `VIBE_ENV=prod`.

## Nøkkelruter (utdrag fra `app/main.py`)

**Opprett VibeCode**: kun fagansvarlig, alltid som `draft`. Regex valideres før commit.

```python
@app.post("/v1/vibe-codes", response_model=VibeCode, status_code=201)
def create_code(body: VibeCodeIn, p: Principal = Depends(require(Role.fagansvarlig))):
    with store.transaction():
        if body.id in store.vibe_codes:
            raise HTTPException(409, f"{body.id} finnes allerede. Bruk PUT for ny versjon.")
        unknown = [c for c in body.related_codes + body.composition.amplified_by if c not in store.vibe_codes]
        if unknown:
            raise HTTPException(422, f"Ukjente relaterte koder: {', '.join(unknown)}")
        code = VibeCode(**body.model_dump(), status="draft", created_by=p.user_id, change_note="opprettet")
        _compile_or_422(code)  # validerer regex og bygger prototyper før commit
        store.vibe_codes[code.id] = [code]
    audit(p, "vibe_code.create", f"vibe_code/{code.id}@1")
    return code
```

**Lagre observasjon**: tildeling, samtykke, klassifisering og vektor i én transaksjon.

```python
@app.post("/v1/contacts/{contact_id}/observations", response_model=Observation, status_code=201)
def add_observation(contact_id: UUID, body: ObservationIn, p: Principal = Depends(require(Role.terapeut))):
    with store.transaction():
        contact = load_contact(contact_id, p)              # 404 hvis ikke tildelt
        if not contact.has_consent("behandling_observasjon"):
            raise HTTPException(403, "Kontakten har ikke gitt samtykke …")
        if contact.has_consent("ml_klassifisering"):
            vec = embedder.embed([body.text])[0]
            suggestions = classifier.classify(body.text, store.current_codes(), vec)
        else:
            # Kun krise-regler. Sikkerhet går foran, men ingen vektor lagres.
            suggestions = [h for h in classifier.classify(body.text, p0_codes) if h.escalate]
        ...
```

**Semantisk søk** og **anbefalinger** (tidsvekting med halveringstid 14 dager, bekreftet × 1,5, avvist ekskludert, komposisjon × 1,25, P0 alltid først): se `semantic_search` og `recommendations` i `app/main.py`.

## Databasetilgang og transaksjoner (Postgres)

```python
# app/db/postgres.py (skisse)
@asynccontextmanager
async def tx(pool: asyncpg.Pool, principal: Principal):
    async with pool.acquire() as conn:
        async with conn.transaction(isolation="read_committed"):
            # RLS bruker disse. SET LOCAL forsvinner ved COMMIT/ROLLBACK, så det lekker ikke mellom forespørsler.
            await conn.execute("SELECT set_config('app.user_id', $1, true), set_config('app.role', $2, true)",
                               str(principal.uuid), principal.role.value)
            yield conn

async def insert_observation(conn, obs, suggestions, vec, model_id, dek):
    await conn.execute(
        "INSERT INTO vibe.observation (id, contact_id, source, text_enc, observed_at, attributes, created_by, classified)"
        " VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        obs.id, obs.contact_id, obs.source, encrypt(dek, obs.text), obs.observed_at, obs.attributes, obs.created_by, vec is not None)
    if vec is not None:
        await conn.execute("INSERT INTO vibe.observation_embedding VALUES ($1,$2,$3)", obs.id, model_id, vec)
    await conn.executemany("INSERT INTO vibe.code_suggestion (...) VALUES (...)", [...])
```

Mønstre:
- **Én transaksjon per forespørsel** for forretningsdata. **Audit skrives i egen transaksjon** etter commit, og også ved avvisning. Avviste forsøk skal synes.
- `READ COMMITTED` som standard. `SERIALIZABLE` + retry kun for versjonering av koder (unngår to samtidige `version = n+1`).
- **Outbox** for hendelser (P0-varsel, re-embedding): skriv `outbox`-rad i samme transaksjon, og en worker publiserer.
- Embedding-kallet skjer **før** transaksjonen åpnes i produksjon, så låser ikke holdes under nettverkskall.
- Tilkoblingspool via PgBouncer (transaction mode). Fungerer med `SET LOCAL`, ikke med `SET`.

## To-do

- [ ] `PostgresStore` med samme grensesnitt som `InMemoryStore`
- [ ] OIDC-validering (JWKS-cache, `aud`/`iss`, rolle-claim)
- [ ] Outbox + worker for P0-varsling

## Prioritert backlog

| # | Punkt | Prioritet |
|---|---|---|
| 1 | PostgresStore + RLS-integrasjonstester | Må |
| 2 | OIDC | Må |
| 3 | Feltkryptering | Må |
| 4 | Outbox/P0-varsel | Må |
| 5 | Async-embedding utenfor transaksjon | Bør |
