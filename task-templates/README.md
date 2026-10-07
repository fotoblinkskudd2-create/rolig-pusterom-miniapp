# task-templates

Validerer multimodal input lokalt og lager JSON task-maler. Ingen avhengigheter. Samme fil kjører i nettleser (`isolation-mirror.html`) og Node.

```js
TaskTemplates.generate(input) // → { analysis, refinement, iteration_count, constraints }
```

Alltid nøyaktig de fire nøklene. Avvist input: `analysis.status = "rejected"`, `refinement = null`, feil i `constraints.errors`.

## Input (schema 1.0)

```json
{
  "schema_version": "1.0",
  "source": "isolation_mirror | checkin | history | breathing",
  "tags": { "intensity": "low|medium|high", "context": "isolation|stress|sleep|low_mood" },
  "modalities": [
    { "type": "text", "value": "…", "lang": "nb|nn|en" },
    { "type": "image", "mime": "image/png|jpeg|webp|gif|heic", "bytes": 51200, "header": "<base64 av første ≥12 byte>", "width": 1, "height": 1 },
    { "type": "mood", "value": 1 },
    { "type": "timeseries", "points": [{ "t": "2026-10-01T08:00:00Z", "mood": 3 }] },
    { "type": "action", "index": 0 }
  ]
}
```

| source | krever én av | tillatt |
|---|---|---|
| isolation_mirror | text, image | text, image, mood |
| checkin | mood | mood, text |
| history | timeseries | timeseries, action (flere ok) |
| breathing | mood | mood |

## Regler

- **Udefinerte felt** → `E_UNDEFINED_FIELD`. Feltet blir ikke stille droppet.
- **Tvetydige tags** (`High`, `" low"`, `low/high`, `""`, ukjent) → `E_TAG_AMBIGUOUS`. Systemet gjetter aldri, selv når det er åpenbart hva som var ment.
- **Ingen plassholdere.** Tom tekst gir `E_EMPTY`. Isolation Mirror uten tekst får ikke et oppdiktet `problem`-felt.
- **Bilde** sjekkes på MIME, størrelse og magiske byte i headeren. Pikslene leses aldri, og bildet forlater aldri enheten.
- **Rens** (NFC, kontrolltegn, null-bredde-tegn, trim, sortering av serie) er ikke-semantisk og gir `W_*`-advarsel. Da valideres input på nytt (`iteration_count` 2). Maks 3 iterasjoner, ellers `E_UNSTABLE`.
- **Statistikk:** humørtrend testes med Mann-Kendall med tie-korreksjon, og tolkes bare når n ≥ 10 og p < 0,05. Ellers er `direction` lik `null`.
- **Korrelasjon ≠ kausalitet:** `causal_claim` er alltid `false`. Når grep og humør er registrert samtidig, kommer en merknad om det, men ingen effekt påstås.

## Feilkoder

| kode | sjekk |
|---|---|
| E_PARSE, E_ROOT_TYPE, E_CYCLE, E_DEPTH, E_FORBIDDEN_KEY | C_PARSE |
| E_REQUIRED, E_UNDEFINED_FIELD, E_SCHEMA_VERSION, E_TYPE, E_ENUM | C_SCHEMA |
| E_TAG_AMBIGUOUS | C_TAGS |
| E_MODALITY_COMBO, E_DUPLICATE_MODALITY, E_EMPTY, E_RANGE, E_TEXT_LENGTH, E_TIMESTAMP, E_SIZE | C_MODALITY |
| E_MIME, E_BASE64, E_HEADER_SHORT, E_MAGIC_MISMATCH | C_IMAGE |
| E_UNSTABLE | C_STABLE |
| latency ≥ 500 ms | C_LATENCY |

## Kjør

```
npm test      # 62 tester, inkl. korrupte formater
npm run bench # latency + minne per kombinasjon → bench-results.json
```

`fromCheckins(localStorage.checkins)` konverterer appens lagrede format (`mood: "3"`) eksplisitt. Alt annet enn ett siffer 1–5 avvises.

Benchmark-tallene avhenger av maskinen. Minnetallet er heap-delta per beholdt resultat (V8, `--expose-gc`), og er et estimat.
