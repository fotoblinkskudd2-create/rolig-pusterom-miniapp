# Family Memory AI — Technical Blueprint

A privacy-first, mobile-first system that turns an unstructured family archive (video, audio, photos, documents, voice notes, typed stories) into a queryable knowledge base, and retells it as grounded narrative through a conversational interface.

Design stance, stated once and applied throughout:

- **Retrieval, not training.** The model never gets fine-tuned on the family. Every fact the AI says comes from retrieved source material at answer time, with citations back to the original artifact. That keeps it auditable, correctable and deletable (fine-tuned weights can't forget one person on request).
- **Sources are immutable, interpretations are versioned.** The original file is never modified. Transcripts, captions, extracted facts and summaries are derived layers, each tagged with the model and version that produced it, and each can be regenerated or overridden by a human.
- **One Postgres, one object store.** Relational data, vectors, full-text and the graph layer all live in PostgreSQL until scale proves otherwise. Fewer moving parts beats theoretical performance for a family-sized corpus (typically 10k–500k artifacts, 1–20 TB).

---

## 1. System Architecture Overview

### 1.1 Layer diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│  CLIENT (PWA, mobile-first)                                          │
│  SvelteKit or Next.js · Service Worker · IndexedDB (encrypted cache) │
│  Chat · Timeline · People · Places · Upload (resumable) · Review     │
└───────────────┬───────────────────────────────▲──────────────────────┘
                │ HTTPS/TLS 1.3, passkey auth   │ SSE (token stream)
┌───────────────▼───────────────────────────────┴──────────────────────┐
│  API GATEWAY / BFF                                                   │
│  Auth (passkeys/OIDC) · rate limit · authz policy check · upload URL │
├──────────────────────────────────────────────────────────────────────┤
│  CORE SERVICES                                                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐  │
│  │ Archive API  │ │ Memory/Query │ │ Conversation │ │ Review &    │  │
│  │ (CRUD, ACL)  │ │ (retrieval)  │ │ orchestrator │ │ curation    │  │
│  └──────────────┘ └──────────────┘ └──────┬───────┘ └─────────────┘  │
└───────────────┬───────────────────────────┼──────────────────────────┘
                │ job queue                 │ LLM calls (redacted context)
┌───────────────▼──────────────────┐ ┌──────▼─────────────────────────┐
│  INGESTION WORKERS (GPU/CPU)     │ │  AI LAYER                      │
│  ffmpeg · ASR · diarization ·    │ │  Claude API (generation)       │
│  OCR · captioning · face/place · │ │  Embeddings (text + image)     │
│  entity & event extraction       │ │  Reranker · local fallback LLM │
└───────────────┬──────────────────┘ └──────┬─────────────────────────┘
                │                           │
┌───────────────▼───────────────────────────▼──────────────────────────┐
│  STORAGE                                                             │
│  PostgreSQL 16+ (relational + pgvector + FTS + graph tables)         │
│  S3-compatible object store (originals, derivatives, HLS segments)   │
│  KMS / Vault (envelope keys)  ·  Backup target (separate provider)   │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.2 Technology stack

| Layer | Recommendation | Why | Alternatives |
|---|---|---|---|
| Client | **SvelteKit** PWA (or Next.js if team is React-native) + Tailwind | Small bundles on mobile, first-class SSR + service worker | Expo/React Native later if native features (background upload, Photos API) become essential |
| Media playback | hls.js + native HLS on iOS | Adaptive streaming of large video over mobile | Plain MP4 progressive for short clips |
| Uploads | **tus** protocol (tus-js-client + tusd) direct to object store | Resumable multi-GB uploads over flaky mobile networks | S3 multipart presigned URLs |
| API | **TypeScript (Fastify/Hono)** for BFF; **Python (FastAPI)** for ML workers | TS shares types with client; Python owns the ML ecosystem | Go for gateway if throughput matters |
| Job queue | **Postgres-backed queue** (Graphile Worker / Procrastinate) → Temporal at scale | No extra infra in MVP; Temporal for long multi-step media DAGs | Redis + BullMQ / Celery |
| Database | **PostgreSQL 16+ with pgvector (HNSW), pg_trgm, built-in FTS** | One transactional store for metadata, vectors, ACL and search | Qdrant/Weaviate if vectors exceed ~50M rows |
| Object storage | **S3-compatible**: Cloudflare R2 / Backblaze B2 (hosted) or **MinIO/Garage** (self-hosted) | Cheap egress (R2), versioning, object lock for backups | AWS S3 + Glacier tiers |
| Key management | **HashiCorp Vault / OpenBao** (self-hosted) or cloud KMS | Envelope encryption, per-family keys, rotation | age/sops for small single-node deploys |
| Generation LLM | **Claude** via API — Sonnet 5.5 for conversation, Opus 5.5 for long-form biography synthesis, Haiku 4.5 for bulk extraction/classification | Long context, strong instruction following and citation discipline | Local Llama/Qwen-class model via vLLM/Ollama for fully offline mode |
| Embeddings (text) | **Multilingual model**: Voyage multilingual (hosted) or **BGE-M3 / multilingual-e5-large** (self-hosted) | Family archives are rarely monolingual (Norwegian + dialect + English) | OpenAI/Cohere embeddings |
| Embeddings (image) | **SigLIP / OpenCLIP** | Text-to-image search ("photos at the cabin in winter") | Caption-only search (cheaper, weaker) |
| ASR | **WhisperX** (Whisper large-v3 + alignment); **NB-Whisper** (National Library of Norway) for Norwegian/dialect | Word-level timestamps, strong dialect handling | Hosted ASR (Deepgram, AssemblyAI) — only if privacy policy allows |
| Diarization | **pyannote.audio** | Speaker segments → link to people | NeMo diarization |
| OCR / documents | **Docling** or Unstructured for PDFs/DOCX; **Tesseract/PaddleOCR**, plus a vision LLM pass for handwriting | Layout-aware parsing; handwritten letters need a VLM | Cloud Document AI |
| Faces | **InsightFace** (detection + ArcFace embeddings), clustering with HDBSCAN | Local, high quality; clusters are labelled by humans | Immich's pipeline as reference |
| Observability | OpenTelemetry → Grafana/Loki/Tempo; Langfuse (self-hosted) for LLM traces | Debug retrieval quality without shipping data to a SaaS | Sentry (scrub PII) |
| Deploy | Docker Compose (MVP, single host + 1 GPU) → Kubernetes/Nomad | Matches the corpus size; GPU workers scale independently | Fly.io/Render + Modal for GPU bursts |

---

## 2. Data Ingestion Pipeline

### 2.1 Pipeline shape

Every upload becomes an **Artifact** and runs through a DAG of idempotent steps. Each step writes a **Derivation** row (input hash, step name, model+version, output pointer, status). Re-running a step with a better model produces a new derivation; the old one is kept until the new one is accepted.

```
upload (tus) → quarantine bucket
  → 1. fingerprint (SHA-256, perceptual hash pHash/dHash for images, chromaprint for audio)
  → 2. dedupe (exact + near-duplicate clustering)
  → 3. type sniff (libmagic, not file extension) + AV scan (ClamAV)
  → 4. metadata extract (exiftool / ffprobe)
  → 5. format-specific branch (below)
  → 6. chunk → embed → index
  → 7. entity + event extraction (LLM, structured output)
  → 8. entity resolution (link to existing People/Places/Events)
  → 9. human review queue (low-confidence links, faces, dates)
  → promote to encrypted archive bucket
```

### 2.2 Format-specific strategies

| Format | Parsing | Derived outputs | Notes |
|---|---|---|---|
| **Video** (MP4, MOV, MTS, digitized VHS) | ffprobe → ffmpeg extract audio track + scene detection (PySceneDetect) + keyframes per scene | HLS ladder (360p/720p/1080p), poster, keyframes, audio → ASR branch, keyframes → image branch | Transcode to HLS once; never stream originals to mobile. Digitized tapes: split by scene/date-stamp OCR |
| **Audio / voice notes** (M4A, MP3, WAV, OPUS) | Normalize to 16 kHz mono WAV → VAD (Silero) → WhisperX ASR → pyannote diarization | Word-timestamped transcript, speaker turns, language tag, Opus/AAC derivative for playback | Speaker turns linked to People via voice embeddings (human-confirmed) |
| **Photos** (JPEG, HEIC, RAW, scanned prints) | exiftool (date, GPS, camera), HEIC→AVIF/WebP derivatives, face detection, image embedding, VLM caption | Thumbnails (3 sizes), caption, OCR text (if any text in frame), faces, place | Scanned prints have no EXIF: date estimated from back-of-print OCR, album context, or user input; mark `date_precision` accordingly |
| **Documents** (PDF, DOCX, letters, certificates) | Docling/Unstructured layout parse; OCR for scans; VLM pass for handwriting | Structured text with page/region anchors, document type classification (letter, certificate, obituary, diary) | Keep page/bbox anchors so citations can highlight the exact region |
| **Typed stories / interviews / chat exports** | Direct ingest; segment by speaker/paragraph | Text chunks with author + "told by" attribution | Attribution matters: "Mum told me" ≠ "Mum wrote" |
| **Guided interviews** (in-app) | Recorded in-app with prompt metadata ("Tell me about your first home") | Audio + transcript pre-linked to the prompt and the speaker | The single highest-value source — design for it from day one |

### 2.3 Semantic tagging & metadata extraction

Two passes, deliberately separated:

1. **Deterministic metadata** (cheap, reliable): EXIF/ffprobe timestamps, GPS → reverse geocode (self-hosted Nominatim or Photon), file provenance, uploader, device.
2. **LLM extraction** (Haiku 4.5, structured JSON output against a strict schema), run per chunk:
   - **Entities**: persons (with role/relationship mentions: "my grandmother", "uncle Per"), places, organizations, objects of significance (the boat, the farm).
   - **Events**: what happened, who participated, where, when (with precision: exact/day/month/year/decade/circa), emotional valence.
   - **Claims**: atomic factual statements with subject–predicate–object form ("Ola — worked_at — Aker shipyard — 1962–1975"), each carrying the source chunk ID and a confidence.
   - **Themes/tags**: controlled vocabulary (migration, war, illness, work, holidays, food, faith) plus free tags.

Every extracted item stores `source_span` (artifact + char range / timestamp range / page+bbox) so it can be cited and re-verified.

### 2.4 Entity resolution

The hard problem. "Mormor", "Grandma Anna", "Anna Hansen" and "mamma" (when spoken by Anna's daughter) are the same person.

- **Speaker-relative resolution**: a kinship term is resolved relative to the *speaker/author* of the chunk, using the family graph ("mamma" said by Kari → Kari's mother).
- **Candidate scoring**: name similarity (trigram + phonetic, e.g. Double Metaphone tuned for Nordic names), kinship-path match, date plausibility (a person can't be at an event before birth), co-occurrence.
- **Thresholds**: auto-link above high confidence; queue for human review in the middle band; create a provisional entity below.
- **Faces**: cluster unlabelled faces; a human names one cluster, labels propagate; age-progression means clusters per person per era are normal — merge, don't force.

### 2.5 Storage normalization

- **Originals**: write-once, content-addressed (`/{family_id}/orig/{sha256}`), encrypted, object-lock in backup tier.
- **Derivatives**: `/{family_id}/deriv/{artifact_id}/{kind}/{version}` — regenerable, so cheaper storage class and no long-term backup needed.
- **Unified text representation**: every artifact, regardless of modality, produces one or more **Chunks** with the same shape: text, modality, anchor (time range / page+bbox / image region), language, speaker/author, date (with precision), and embedding. Retrieval only ever operates over Chunks; playback/rendering uses the anchor to jump back into the original.

---

## 3. Knowledge Base Design

### 3.1 Schema (relational + vector, PostgreSQL)

Core tables (all carry `family_id` for row-level security, plus `created_at`, `created_by`):

| Table | Key columns | Purpose |
|---|---|---|
| `family` | id, name, kms_key_ref, settings | Tenant boundary + per-family encryption key |
| `member` | id, family_id, user_id, role, linked_person_id | App users (may or may not be a Person in the tree) |
| `person` | id, display_name, aliases[], birth/death (date + precision), gender (optional, free text), bio_summary, sensitivity, deceased flag, consent_status | People in the story, living or dead |
| `relationship` | person_a, person_b, type (parent/spouse/sibling/adoptive/step/partner/godparent…), start/end, source_claim_id | Family graph edges, versioned, sourced |
| `place` | id, name, aliases[], geom (PostGIS point/polygon), parent_place_id, era_names | Places incl. historical names ("Christiania") |
| `event` | id, title, type, date_start/date_end, date_precision, place_id, summary | Life events and episodes |
| `event_participant` | event_id, person_id, role | Who was there, in what role |
| `artifact` | id, type, sha256, phash, mime, size, captured_at (+precision), uploaded_by, provenance, storage_key, encryption_meta, status | One per original file |
| `derivation` | id, artifact_id, step, model, model_version, params_hash, output_key, status, accepted | Lineage of every derived layer |
| `chunk` | id, artifact_id, derivation_id, modality, text, anchor (jsonb), lang, speaker_person_id, author_person_id, date_start/end, embedding vector(1024), tsv tsvector | Unified retrievable unit |
| `image_embedding` | artifact_id, region (jsonb, null = whole image), embedding vector(768/1152) | Visual search |
| `face` | id, artifact_id, bbox, embedding, cluster_id, person_id, confirmed_by | Face → person linkage |
| `claim` | id, subject_type/id, predicate, object_type/id/literal, date range, confidence, source_chunk_id, status (proposed/confirmed/disputed/rejected) | Atomic, cited facts |
| `mention` | chunk_id, entity_type, entity_id, span, confidence | Chunk ↔ entity links (drives graph expansion) |
| `narrative` | id, kind (bio/episode/era/answer), subject refs, body, citations jsonb, model, generated_at, approved_by | Saved generated stories, re-verifiable |
| `acl_grant` | subject (member/group), resource (artifact/person/event/tag), permission, conditions (time-lock, after-death) | Fine-grained sharing |
| `audit_log` | actor, action, resource, ts, request_hash | Append-only, hash-chained |

Design notes:

- **Dates are ranges with precision**, never a single timestamp. "Summer of '68" = 1968-06-01..1968-08-31, precision `season`. All temporal filtering uses range overlap.
- **Claims are the truth layer.** Conflicting claims coexist (`disputed`) with their sources; the AI surfaces disagreement instead of averaging it away.
- **Graph without a graph DB**: `relationship`, `event_participant` and `mention` form the graph; recursive CTEs handle kinship traversal (depth ≤ 6 covers any practical query). Move to Apache AGE or Neo4j only if graph analytics become a product feature.

### 3.2 Indexing strategy

- **Vector**: pgvector HNSW on `chunk.embedding` (cosine, `m=16, ef_construction=64`), plus a partial index per modality if one modality dominates. Use halfvec (fp16) to halve memory with negligible recall loss.
- **Lexical**: `tsvector` with language-specific config (norwegian/english) + `pg_trgm` for names and fuzzy recall ("Bjørnstad" vs "Bjornstad"). Names are where pure vector search fails worst.
- **Structured**: B-tree on `(family_id, date_start, date_end)`, GiST on date ranges, GIN on `aliases`, PostGIS GiST on `place.geom`.
- **Hybrid retrieval**: run vector + BM25-style lexical in parallel, merge with **Reciprocal Rank Fusion**, then **rerank** the top ~50 with a cross-encoder (bge-reranker-v2-m3 self-hosted, or a hosted reranker) down to ~12–20 chunks.

### 3.3 Context enrichment

Raw chunks are too thin for a model to reason with ("He said no, and that was that."). Enrich at index time:

1. **Contextual chunk headers**: before embedding, prepend a short LLM-generated situating line per chunk — who's speaking, when, about whom, what artifact ("Voice note by Kari, 2024, recalling her father Ola's decision in 1971 to sell the farm"). Embed header + text. This is the single largest retrieval-quality gain for conversational archives.
2. **Hierarchical summaries**: artifact summary → event summary → person-era summary ("Ola, 1960–1975") → person biography. Built bottom-up (map-reduce), each with citations to children. Retrieval can hit any level; broad questions hit summaries, specific ones hit chunks.
3. **Entity cards**: per person/place, a compact, regularly regenerated card: key dates, relationships, top claims, characteristic phrases/quotes, voice samples. Cards are what get injected into every conversation about that person.
4. **Temporal neighbors**: link chunks that share participants and overlapping date ranges, so "what happened next" queries can walk the timeline.

---

## 4. AI Integration Layer

### 4.1 Structuring family data for the model

The model gets four context tiers, assembled per request, in a fixed order that maximizes prompt-cache hits:

| Tier | Content | Size | Caching |
|---|---|---|---|
| **T0 — System contract** | Role, rules (grounding, citation format, uncertainty language, sensitivity handling), output schema | ~1.5k tokens | Static, always cached |
| **T1 — Family frame** | Compact family graph (people, relationships, life spans), place gazetteer, family glossary (nicknames, dialect words, inside references) | 3–15k tokens | Changes rarely; cached |
| **T2 — Focus cards** | Entity cards for persons/places/events resolved from the query and conversation | 2–8k tokens | Per-conversation, often cache hit across turns |
| **T3 — Evidence** | Reranked chunks with IDs, speaker, date, artifact type, and anchor; plus relevant claims (incl. disputed ones) | 6–30k tokens | Per-turn |

Evidence is passed as clearly delimited, ID-tagged documents (e.g. `[S14] Voice note · Kari (daughter) · recorded 2024 · about 1971`), and the model must cite those IDs. The family frame is serialized as compact structured text, not prose — models resolve kinship far more reliably from an explicit edge list than from narrative.

### 4.2 Prompt engineering for authentic narrative

Authenticity = **fidelity to sources + voice of the tellers**, not invention. The system contract enforces:

- **Grounding rule**: every factual statement must be supported by cited evidence. If evidence is missing, say so plainly ("The archive doesn't say where they lived before 1950"), and offer to ask a living relative (creates an interview prompt).
- **Attribution**: distinguish first-hand vs reported ("Ola told Kari that…"), and surface contradictions ("Kari remembers 1971; Per's letter says 1972").
- **Quote preservation**: use verbatim quotes from transcripts where they exist; never fabricate quotes. Dialect stays dialect.
- **Uncertainty language** tied to `date_precision` and claim confidence ("around 1970", "probably").
- **No impersonation of the deceased by default.** The narrator speaks *about* people, quoting them. A first-person "voice" mode (if offered at all) is opt-in per person, set by an authorized family member, visibly labelled as reconstruction, and restricted to paraphrasing documented statements. This is a product and ethics decision, not a prompt tweak — default it off.
- **Modes** with distinct output templates: *Answer* (concise, cited), *Story* (narrative episode, 300–1500 words, cited per paragraph), *Biography chapter* (Opus, long-form, built from era summaries), *Timeline* (structured list for UI rendering), *Interview helper* (generates follow-up questions for living relatives based on gaps).
- **Style controls**: audience (child/adult), tone (factual/warm), language (respond in the user's language, keep quotes in original).

### 4.3 Memory context injection (per-turn pipeline)

```
user message
 → 1. query understanding (Haiku, structured output):
       resolved entities (using conversation state + family graph),
       time window, intent (fact / story / list / compare / media),
       sub-queries for multi-hop ("where did grandpa work when mum was born?"
       → mum's birth date → grandpa's employment at that date)
 → 2. ACL filter: compute the asker's visible resource set (applied *inside* SQL, never after)
 → 3. hybrid retrieval per sub-query (vector + lexical + structured filters on date/person/place)
 → 4. graph expansion: 1-hop over mentions/event_participant for the resolved entities
 → 5. rerank + diversity (MMR across artifacts/speakers so one long interview doesn't drown others)
 → 6. assemble T0–T3 within token budget
 → 7. generate (Sonnet, streamed via SSE)
 → 8. post-check: verify each citation ID exists in the supplied evidence; strip/flag unsupported
       sentences (cheap Haiku verifier pass for Story/Bio modes)
 → 9. render with inline citation chips → tap opens photo / seeks audio to timestamp / highlights PDF region
```

**Conversation memory**: keep a rolling conversation state (resolved entities, current time window, open threads) as structured data, not just raw history — so "and what about her sister?" resolves correctly after 20 turns. Summarize old turns; never re-inject the full transcript.

**Agentic mode (Phase 3)**: expose retrieval as tools (`search_chunks`, `get_person`, `get_timeline`, `find_media`) and let the model plan multi-step lookups. Better for complex questions, but costlier and less predictable — keep the deterministic pipeline as the default path.

### 4.4 What gets sent to the LLM provider

- Only the assembled context for that turn — never bulk exports.
- Use a provider/plan with zero-data-retention or no-training terms; document it in the family's privacy settings.
- Optional **redaction layer** for `sensitivity = high` items (health, adoption, legal matters): either excluded from cloud calls entirely or routed to the local model.
- Fully-local mode: vLLM/Ollama serving an open-weights model for both extraction and generation. Expect noticeably weaker narrative quality and multilingual handling; make it a per-family switch, not a fork of the codebase (same orchestrator, pluggable model adapter).

---

## 5. Mobile Web Interface

### 5.1 Client architecture

- **PWA** (installable, standalone display, home-screen icon). SvelteKit with SSR for first paint, client-side routing after.
- **Primary surfaces** (bottom tab bar, thumb-reachable):
  1. **Ask** — chat with streaming answers, citation chips, inline media cards (photo carousel, audio clip with waveform scrubbed to the cited timestamp).
  2. **Timeline** — virtualized vertical scroll by decade/year; density heat-strip shows where the archive is thin.
  3. **People** — family tree (pan/zoom canvas, e.g. a lightweight D3/ELK layout) + person pages (card, timeline, media, "ask about X").
  4. **Add** — capture: record voice note, guided interview prompt, camera scan of old prints/letters (edge detection + perspective correction), batch upload from Photos.
  5. **Review** — curation queue: confirm faces, merge people, fix dates, approve/reject claims. Swipe-based; designed for 2-minute sessions.
- **State**: TanStack Query (or Svelte stores + a query cache) for server state; small local store for UI.
- **Media**: responsive `srcset` derivatives, lazy loading, HLS for video, range requests for audio. Never load originals on mobile unless explicitly downloaded.
- **Accessibility**: large-type mode and voice-in/voice-out (Web Speech API or server TTS) — older relatives are core users, not edge cases.

### 5.2 Offline capability

- **Service worker** (Workbox): app shell precached; stale-while-revalidate for entity cards, timeline pages and thumbnails.
- **Offline read set**: user pins people/eras ("Grandma's album") → cards, summaries, thumbnails and selected audio cached locally in IndexedDB, **encrypted** with a key derived from the session (WebCrypto, non-extractable keys), wiped on logout/remote revoke.
- **Offline capture**: voice notes, photos and text stories queue in IndexedDB; tus uploads resume when online (Background Sync where supported; foreground resume on iOS, which lacks Background Sync).
- **Offline chat**: not supported in cloud mode (retrieval + LLM are server-side). Show cached person/timeline views instead; be explicit in UI. On-device LLM is not worth it for this use case yet.

### 5.3 Real-time sync

- **Server → client**: SSE for chat token streams and ingestion progress ("transcribing interview… 62%"). A single multiplexed SSE (or WebSocket) channel per session for notifications: new uploads by relatives, review items, comments.
- **Client → server**: optimistic mutations with idempotency keys; uploads are idempotent by content hash (dedupe across relatives uploading the same photo).
- **Conflict handling**: edits to people/claims/dates are field-level, last-writer-wins *with history*; contested facts become `disputed` claims rather than silent overwrites. Collaborative long-form editing of narratives (Phase 3) uses a CRDT (Yjs) with server persistence.

---

## 6. Privacy & Security

### 6.1 Encryption

- **In transit**: TLS 1.3 everywhere, HSTS, internal mTLS between services (service mesh or WireGuard on a small deploy).
- **At rest — envelope encryption**: each family has a KEK in Vault/KMS; each artifact gets a random DEK (AES-256-GCM), stored wrapped in `artifact.encryption_meta`. Deleting a family's KEK = crypto-shredding everything, including backups.
- **Database**: disk-level encryption + application-level encryption for high-sensitivity columns (transcript text of `sensitivity=high` chunks, notes). Note the trade-off: encrypted columns can't be full-text indexed — keep their embeddings (lower leak risk, still not zero) or exclude them from search.
- **Zero-knowledge option (honest limits)**: true E2EE (server never sees plaintext) is incompatible with server-side transcription, embedding and LLM retrieval. Offer it only for a **"vault" tier** — sealed items (letters, wills, diaries) the AI cannot read — not for the whole system. Don't market the whole platform as E2EE.
- **Backups**: encrypted, to a second provider/region, object-lock (immutable) for 30–90 days against ransomware; quarterly restore drills.

### 6.2 Access control & sharing model

- **Auth**: passkeys (WebAuthn) primary, OIDC (Google/Apple) secondary, mandatory 2FA for admins. Short-lived access tokens, refresh rotation, device list with remote revoke.
- **Roles per family**: Owner, Steward (curation rights), Contributor (upload + own edits), Viewer, Guest (time-limited link).
- **Resource-level ACL** on top of roles, enforced in **PostgreSQL Row-Level Security** keyed on `family_id` + a `visible_resources` function — so a retrieval bug can't leak across the boundary; the AI layer can only retrieve what the asker could open by hand.
- **Sensitivity labels**: `normal`, `family-private` (e.g. hidden from in-laws/guests), `restricted` (named members only), `sealed` (vault; no AI access).
- **Conditional grants**: time-locks ("open in 2040"), posthumous release ("visible to children after my death", confirmed by two stewards), age-gated content for minors.
- **Living people have a veto**: a living person can restrict content *about them* (not just content they uploaded). This is both an ethical and a legal requirement in practice.
- **Audit**: append-only, hash-chained log of every read of restricted content and every AI query (query text, retrieved IDs, not the generated answer unless the user saves it). Visible to the family Owner.

### 6.3 Compliance considerations (EU/EEA, incl. Norway)

- **GDPR applies to living persons** mentioned in the archive, even in a "private family" app operated as a service — the household exemption covers the family, not you as the operator. You are a **processor** for family-uploaded content (DPA with each family Owner) and a **controller** for account data.
- **Special category data** (health, religion, sexual orientation, ethnicity) is common in family stories → default extraction to tag these and apply `family-private` minimum; never use them for anything but display/retrieval.
- **Data subject rights**: export (full archive as originals + JSON-LD/GEDCOM 7 for the tree), erasure (crypto-shred + purge derivations + re-index), rectification (claims workflow covers this).
- **Deceased persons** are outside GDPR, but national laws (and family conflict) still apply — the sharing model above handles it.
- **Biometrics**: face and voice embeddings are biometric data when used for identification → explicit opt-in per family, per-person opt-out, processed locally (never sent to third-party APIs).
- **Data residency**: EU hosting (Hetzner, Scaleway, OVH, or AWS/GCP EU regions); LLM provider with EU-compatible DPA and SCCs; document every subprocessor.
- **Minors**: parental controls, no profiling, care with sharing minors' images to Guests.
- **Children's future rights**: a child appearing in the archive today may want removal at 18 — the living-person veto covers this.

---

## 7. MVP Implementation Roadmap

Effort assumes 1–2 experienced full-stack engineers with ML familiarity. "wk" = engineer-weeks.

### Phase 1 — Core memory storage + basic retrieval (8–10 wk)

**Goal:** a family can upload photos, voice notes and text stories from a phone, and search them.

- PWA shell, passkey auth, family/member model, roles.
- tus uploads → S3-compatible storage, envelope encryption, dedupe by SHA-256.
- Postgres schema: family, member, person, relationship, artifact, derivation, chunk, place, event (claims table created but manually populated).
- Workers: exiftool/ffprobe metadata, thumbnails, Whisper ASR for audio, plain text ingest, PDF text extraction.
- Embeddings (multilingual) + pgvector HNSW + FTS; hybrid search with RRF (no reranker yet).
- UI: upload, timeline (by captured date), person pages (manual tagging), search results with playback-at-timestamp.
- Manual family tree editor; GEDCOM import.
- Ops: Docker Compose on one host with one GPU (or Modal/Replicate for ASR bursts), nightly encrypted backups, OpenTelemetry.

**Exit criteria:** 5k artifacts ingested; search p95 < 500 ms; restore drill passed.

### Phase 2 — Conversational AI integration (8–12 wk)

**Goal:** ask questions and get cited, grounded stories.

- Haiku extraction pass: entities, events, claims with source spans; entity resolution with review queue.
- Contextual chunk headers + re-embedding; reranker; MMR diversity.
- Entity cards, artifact and person-era summaries (hierarchical).
- Conversation orchestrator: query understanding → ACL-filtered retrieval → T0–T3 assembly with prompt caching → Sonnet streaming → citation verification.
- Chat UI with citation chips and inline media; Story and Timeline modes.
- Guided interview flow (record → transcribe → auto-link to prompt and speaker); gap-driven question suggestions.
- RLS-enforced ACL, sensitivity labels, audit log.
- **Evaluation harness** (non-negotiable): 100–200 family-curated Q&A pairs with gold sources; track retrieval recall@k, citation precision, unsupported-claim rate; run on every change to prompts, models or chunking. Langfuse for traces.

**Exit criteria:** ≥ 90% citation precision, < 3% unsupported sentences on the eval set; families rate stories "accurate" in blind review.

### Phase 3 — Full multimedia + advanced features (12–16 wk)

- Video pipeline: scene detection, keyframes, HLS ladder, transcript-synced playback.
- Diarization + voice-to-person linking (opt-in biometrics).
- Face detection/clustering + review flows; image embeddings for visual search.
- Handwriting OCR via vision model; document layout anchors with region highlighting.
- Biography chapters (Opus, long-form, map-reduce over era summaries), exportable to PDF/EPUB with citations as footnotes.
- Agentic retrieval mode (tool use) for multi-hop questions.
- Conditional grants (time-lock, posthumous), vault tier, Guest links.
- Offline pinned sets, encrypted IndexedDB cache, background capture queue.
- Local-model mode (vLLM) behind the model adapter.
- Collaborative narrative editing (Yjs).
- Hardening: pen test, DPA templates, subprocessor list, export/erasure automation, Temporal for media DAGs if queue complexity warrants.

### Indicative running costs (single family, ~1 TB, 50k artifacts)

| Item | Order of magnitude |
|---|---|
| Object storage (R2/B2) incl. derivatives | ~$10–20/month |
| Postgres (managed small instance or self-hosted VPS) | $20–60/month |
| One-time ingestion (ASR + extraction + embeddings) | GPU hours dominate; tens to low hundreds of dollars for a large backlog, plus LLM extraction tokens |
| Conversational LLM usage | Driven by context size; prompt caching on T0–T2 cuts repeated-context cost substantially |

Re-check current API pricing before committing to a budget; it moves.

---

## 8. Alternative Approaches & Trade-offs

### 8.1 Architectural patterns

| Pattern | Pros | Cons | Use when |
|---|---|---|---|
| **Plain RAG (chunks + vectors)** | Simplest, fast to build | Weak on kinship, multi-hop and time; repeats itself | Prototype only |
| **Hybrid RAG + structured graph (recommended)** | Handles "who/when/related-to" via SQL; vectors for fuzzy recall; citations natural | Entity resolution effort; review UX required | Default for family archives |
| **GraphRAG (LLM-built community summaries)** | Great for broad, thematic questions ("what themes recur across generations?") | Expensive indexing, opaque summaries, costly to update incrementally | Add as an offline enrichment job later, not the core |
| **Long-context "stuff everything"** | Zero retrieval engineering for small corpora | Cost per query, degraded attention in very long contexts, no ACL granularity, doesn't scale past a few hundred documents | Single-person memoir with a small corpus |
| **Fine-tuning on family data** | Can mimic style | Hallucinates confidently, can't cite, can't forget (GDPR erasure), retraining on every upload | Not recommended; style comes from retrieved quotes instead |
| **Agentic tool-use retrieval** | Best for complex multi-hop questions | Latency, cost and variance per query | Opt-in "deep research" mode on top of the deterministic pipeline |

### 8.2 Proprietary vs self-hosted

| Component | Hosted/proprietary | Self-hosted | Recommendation |
|---|---|---|---|
| Generation LLM | Claude API: best narrative quality, multilingual, low ops | Open-weights via vLLM: full data control, weaker quality, needs GPU | Hosted by default with ZDR terms; local mode for `restricted` content or privacy-maximal families |
| ASR | Hosted APIs: fast, no GPU | WhisperX / NB-Whisper: free per minute, better dialect control, audio never leaves | **Self-host.** Raw voice is the most sensitive data and this runs well on one GPU |
| Embeddings | Voyage/OpenAI/Cohere: strong, simple | BGE-M3 / e5: good multilingual, cheap at scale, local | Self-host if biometrics/sensitive text dominate; hosted is fine otherwise. Pick one and version it — switching means re-embedding everything |
| Faces/voice ID | Cloud vision APIs | InsightFace / pyannote | **Always self-host** (biometric data) |
| Vector store | Pinecone/Turbopuffer | pgvector / Qdrant | pgvector — one ACL boundary, one backup |
| Object storage | R2/B2/S3 | MinIO/Garage on own disks | Hosted with own encryption keys; self-host only with a real off-site backup plan |
| Whole platform | Build on Immich (photos) + Paperless-ngx (docs) and add the AI layer | Fully custom | Worth studying their ingestion pipelines; building on them saves time on media handling but couples you to two data models. Custom is justified once the unified Chunk/Claim model is the product |

### 8.3 Key risks

1. **Entity resolution quality** decides everything downstream. Budget real time for the review UX.
2. **Evaluation drift**: prompt or model changes silently increase hallucination. The eval harness is a Phase-2 deliverable, not a nice-to-have.
3. **Family politics**: contested memories, estrangement, secrets. The disputed-claims model, living-person veto and sealed vault are product features, not edge cases.
4. **Embedding lock-in**: changing embedding models means re-processing the whole corpus; keep `derivation` lineage so it's a background job, not a migration crisis.
5. **Long-term durability**: the archive must outlive the app. Guarantee a full, open-format export (originals + JSON-LD + GEDCOM + Markdown narratives with citations) from day one.
