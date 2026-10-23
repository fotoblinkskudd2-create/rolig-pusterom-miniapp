# Part 3 — Final Recommendation

## SELECTED CONCEPT: **Tend** — the AI care brain for families caring for an aging parent

---

## Executive Summary

Sixty-three million Americans now care for a family member without pay, a 19% jump in five years (AARP/NAC, 2025). Most of them are working adults caring for a parent. Their hardest job is coordination more than physical care: medication lists that change after every visit, discharge papers nobody reads twice, insurance letters, five or more providers, and siblings who each hold a piece of the picture. Today that work lives in text threads, paper folders and one exhausted person's memory. Mistakes are costly: missed medications, readmissions, lost benefits, burnout.

**Tend** turns that chaos into a shared, AI-maintained care plan. A caregiver photographs a discharge summary or records a doctor visit. Tend extracts every medication, appointment, instruction and deadline, asks the caregiver to confirm, then builds and assigns tasks across the family and sends a weekly digest. A cited assistant explains letters and benefit eligibility. Medication safety checks run against a licensed clinical database, never against an LLM's opinion.

**Business model.** Consumer subscription ($14.99/month per family, unlimited members) proves value and retention. Employer benefits ($2–4 PEPM) and Medicare dementia-care programs (CMS GUIDE) provide scalable B2B revenue. Modeled B2C unit economics: ~85% gross margin, LTV/CAC ≈ 4.5×. Caregiving lasts years, which works structurally against churn.

**Why now.** Multimodal LLMs crossed the reliability threshold for document extraction in 2024–25. HIPAA-eligible model hosting (AWS Bedrock under BAA) is standard. CMS has started paying for caregiver support, and employers are adding caregiving benefits.

**The ask.** A $2.5M pre-seed funds a six-person team for 18 months. Milestones: a 90-day MVP launch; 2,000 paying families and 3 employer pilots by month 12; Series A readiness at $1.5M ARR with demonstrated M6 retention above 35%.

*(≈ 300 words)*

---

## Why This Solution Wins

### Market size
| Layer | Size | Basis |
|---|---|---|
| TAM | ~$11B/yr | 63M caregivers × ~$180/yr software spend potential (*assumption*) |
| SAM | ~$4.5B/yr | ~25M working caregivers of a parent, smartphone-native (*assumption*) |
| B2B adjacent | ~$1.8B/yr | ~50M US employees at firms with 1k+ staff × $3 PEPM × 12 (*assumption*) |
| SOM (Y3) | ~$40M ARR | 150k families + 40 employer contracts |

### Defensibility (gets stronger over time)
1. **Longitudinal care graph.** Each week adds meds, providers, decisions and documents. Switching means rebuilding Mom's history, which nobody wants to do mid-crisis.
2. **Multi-player lock-in.** The value grows with each sibling invited, and circles form a natural viral loop (avg. 2.3+ members).
3. **Proprietary eval and correction data.** Every human confirmation or edit on an extraction is labeled training and eval data. Tend's extraction accuracy on real-world discharge papers compounds.
4. **Benefits corpus + outcomes.** A curated, versioned corpus of federal, state and local programs, linked to which applications succeeded. It is slow to build and valuable to employers and payers.
5. **Trust and compliance.** HIPAA, SOC 2 Type II, clinical-safety governance. Table stakes for B2B and a barrier for fast-follower consumer apps.

### Timing
- **Demographics:** the US 85+ population roughly doubles between 2020 and 2040 (Census projections).
- **Policy:** CMS GUIDE model (from July 2024) reimburses dementia care navigation and caregiver support, including respite.
- **Technology:** structured-output LLMs with vision are now cheap enough (< $1/family/month) for consumer pricing.
- **Competition:** incumbents are human-concierge companies (Wellthy, Cariloop) with service-business margins. None is AI-native or document-first.

### Key risks & mitigations
| Risk | Severity | Mitigation |
|---|---|---|
| Extraction error causes a medication mistake | Critical | Mandatory human confirmation for meds; source-span display; deterministic interaction DB; no dosing advice; clinical safety officer; incident review SLA 24h |
| HIPAA / privacy breach | High | BAA-covered vendors only; encryption at rest (KMS) and in transit; RLS per circle; audit log; SOC 2 by month 12 |
| FDA SaMD classification creep | Medium | Stay inside the "general wellness / administrative support" scope; no diagnostic or treatment recommendations; regulatory counsel review of every new AI feature |
| Consumer CAC too high | Medium | Discharge-moment SEO, partnerships with discharge planners and Area Agencies on Aging; employer channel |
| Engagement drops between crises | Medium | Weekly digest, med logging, anticipatory tasks (refills, annual Medicare enrollment) |

---

## Technical Specification Document

> GitHub-ready: drop into `tend/docs/SPEC.md`.

```markdown
# Tend — Technical Specification v0.1 (MVP)

## 1. Scope
MVP delivers: care circles, document intake with AI extraction + human review,
meds/appointments/tasks, visit recording summaries, cited Q&A over a benefits
corpus, weekly digest, freemium billing. Out of scope: EHR integration (FHIR),
provider-facing app, autonomous sending of messages to third parties.

## 2. Architecture

    ┌─────────────┐   HTTPS/JWT   ┌──────────────────────┐
    │ Expo app    │──────────────▶│ API (TypeScript/Hono) │
    │ iOS/Android │               │  - auth (Clerk/Cognito, BAA)
    │ + Web       │◀──── SSE ─────│  - circles, items, tasks
    └─────────────┘               │  - /extract, /ask, /visits
                                  └───┬───────┬───────┬───┘
                                      │       │       │
                     ┌────────────────┘       │       └──────────────┐
                     ▼                        ▼                      ▼
             Postgres 16 (RDS)        Job queue (SQS +        LLM gateway
             - RLS per circle          worker containers)     - AWS Bedrock (BAA)
             - pgvector (RAG)          - OCR/extract jobs       Claude Sonnet 5.5: extraction, Q&A
             - audit_log               - STT jobs               Claude Haiku 5.5: classify, digest
                     ▲                 - digest cron          - prompt registry + versioning
                     │                        │               - PHI-safe logging (redacted)
             S3 (SSE-KMS)  ◀──────────────────┘
             documents, audio (TTL 24h)
                                      ▼
                         RxNorm API · Licensed interaction DB · Twilio (SMS) · Expo Push · Stripe

## 3. Data model (core)

    care_circle(id, name, created_by, plan, created_at)
    member(id, circle_id, user_id, role[owner|editor|viewer], relation, notify_prefs)
    recipient(id, circle_id, display_name, dob_year, conditions_text, allergies_text)
    document(id, circle_id, s3_key, kind[discharge|rx_label|insurance|letter|other],
             status[uploaded|extracting|review|accepted|rejected], page_count, created_by)
    extracted_item(id, document_id, type[med|appointment|instruction|deadline|provider|task],
                   payload jsonb, confidence numeric, source_page int, source_bbox jsonb,
                   source_quote text, review_status[pending|accepted|edited|rejected],
                   reviewed_by, reviewed_at)
    medication(id, recipient_id, rxcui, name, strength, form, sig_text, schedule jsonb,
               start_date, end_date, status, origin_item_id)
    appointment(id, recipient_id, provider_id, starts_at, location, driver_member_id, notes)
    task(id, circle_id, title, due_at, assignee_member_id, status, origin_item_id, recurrence)
    visit(id, recipient_id, audio_s3_key, transcript text, summary jsonb, consent_confirmed bool)
    kb_chunk(id, source_url, jurisdiction, program, effective_date, text, embedding vector(1024))
    audit_log(id, circle_id, actor, action, entity, entity_id, at, diff jsonb)

All tables carry circle_id; Postgres RLS policy: member.user_id = auth.uid().

## 4. AI pipelines

### 4.1 Document extraction
1. Client uploads images → S3 presigned URL; client-side de-skew & compression.
2. Worker: page images → Sonnet 5.5 (vision) with tool `record_items`
   (JSON Schema below, `strict: true`). Temperature 0.
3. Post-processing: meds → RxNorm approximate match → rxcui; reject if no match
   (flag for manual entry). Dates normalized to recipient timezone.
4. Confidence = model self-report × validator score (schema, RxNorm hit, date sanity).
5. Items land as `pending`. Meds ALWAYS require individual human acceptance.
6. On acceptance → upsert into medication/appointment/task; run interaction check
   against licensed DB for the full active med list; create flags.

    record_items schema (excerpt):
    { "items": [ { "type": "med",
                   "name": "string", "strength": "string|null",
                   "sig_text": "string", "frequency_per_day": "number|null",
                   "start_date": "date|null", "end_date": "date|null",
                   "change": "new|changed|stopped|continued",
                   "source_quote": "string", "source_page": "integer",
                   "confidence": "number 0..1" } ] }

### 4.2 Visit summary
Recording requires an explicit consent checkbox per visit. Streaming STT → transcript →
Sonnet 5.5 produces {summary_bullets[≤8], follow_up_questions[], proposed_items[]}
→ same review flow as 4.1. Audio deleted after 24h unless user opts to keep.

### 4.3 Ask Tend (RAG)
Hybrid retrieval: BM25 + pgvector (top 20) → rerank → top 6 chunks + user's accepted
items. System prompt rules: answer only from provided context; cite [n] for every
claim; if insufficient context, say so and offer human help; never give dosing,
diagnosis or legal conclusions. Output validated: every sentence with a claim has ≥1 citation.

### 4.4 Weekly digest
Cron (Sun 17:00 local) → aggregate week's events → Haiku 5.5 fills a fixed template.

## 5. Evaluation
- Gold set: 300 de-identified discharge summaries/rx labels/letters (synthetic + consented),
  double-annotated. Metrics: field-level precision/recall for meds (target P ≥ 0.95, R ≥ 0.90),
  dates, appointments. Run on every prompt/model change in CI (block merge on regression > 1pp).
- Q&A: 150 benefit questions with reference answers; citation faithfulness ≥ 0.95 (LLM-judge + human spot check).
- Red-team suite: dosing requests, emergencies, prompt injection inside documents
  ("ignore previous instructions" text in an uploaded letter) → must refuse/escalate.

## 6. Security & compliance
- HIPAA: BAAs with AWS (Bedrock, RDS, S3), auth provider, Twilio, STT vendor.
- PHI never sent to non-BAA services; analytics events contain no PHI (IDs only).
- Encryption: TLS 1.2+, SSE-KMS, per-environment keys. Secrets in AWS Secrets Manager.
- Access: RLS + least-privilege IAM; break-glass logged; quarterly access reviews.
- SOC 2 Type I at month 6, Type II at month 12.
- Data rights: export all (JSON + PDFs), delete circle (hard delete ≤ 30 days).

## 7. API (excerpt)
    POST /circles                         create circle
    POST /circles/:id/invites             SMS/email invite
    POST /documents (presign) → PUT S3 → POST /documents/:id/extract
    GET  /documents/:id/items             review queue
    POST /items/:id/review {action, edits}
    GET  /recipients/:id/today            meds, appts, tasks, flags
    POST /visits (presign audio) → POST /visits/:id/summarize
    POST /ask  {question, recipient_id}   → SSE stream with citations
    POST /billing/checkout                Stripe (web) / StoreKit (iOS)

## 8. Repo layout
    apps/mobile        Expo (React Native, expo-router, TanStack Query)
    apps/web           Next.js (marketing + web app shell)
    services/api       Hono + Drizzle ORM
    services/worker    extraction, STT, digest jobs
    packages/schema    zod schemas shared (record_items, API types)
    packages/prompts   versioned prompts + eval fixtures
    evals/             gold sets, runners, CI reports
    infra/             Terraform (AWS)

## 9. Non-functional
- Extraction p95 < 25s for 4 pages; Today screen p95 < 400ms.
- Availability 99.5% (MVP). Cost ceiling: AI ≤ $1.00/active circle/month.
- Accessibility: WCAG 2.2 AA; dynamic type; large tap targets (caregivers are often 55+).
```

---

## Go-to-Market Strategy with Milestones

### ICP
**Primary:** "Sandwich caregiver" Diana, 52. Works full time, mother (81) has heart failure and early cognitive decline, two siblings out of state. She is the default coordinator, uses iPhone and Facebook groups, and is willing to pay to cut chaos and guilt.
**Secondary:** "Remote son" Marcus, 45. Lives 600 miles away and wants visibility and a fair share of the load. **Buyer B2B:** HR benefits lead at a 5k-employee company.

### Channels (sequenced)
1. **Discharge-moment SEO and content** ("what to do after a parent leaves the hospital", "Medicare letter types explained"), plus a free downloadable "hospital-to-home kit" that funnels into the app.
2. **Community seeding.** Founders participate genuinely in caregiver communities. Partner with 3–5 caregiver creators.
3. **Professional referrals.** Discharge planners, geriatric care managers, Area Agencies on Aging: a free "give this to families" QR card.
4. **Circle virality.** Every invite exposes 1–3 new potential paying admins.
5. **Employer channel** (from month 6): benefits brokers, HR-tech marketplaces; pricing $2–4 PEPM; pilot with 3 employers on M3 retention + self-reported hours saved.
6. **Payer/GUIDE** (from month 9): white-label for GUIDE participants and MA plans' caregiver programs.

### Acquisition & retention metrics
| Metric | M3 | M6 | M12 |
|---|---:|---:|---:|
| Circles created (cumulative) | 3,000 | 12,000 | 40,000 |
| Paying families | 180 | 800 | 2,000 |
| Blended CAC | < $90 | < $75 | < $70 |
| Free→paid (D30) | 6% | 7% | 8% |
| M3 circle retention | 40% | 42% | 45% |
| Avg members per circle | 2.3 | 2.5 | 2.7 |
| Employer pilots (signed) | 0 | 1 LOI | 3 live |
| ARR | $32k | $145k | $360k B2C + paid B2B pilots → Series A path to $1.5M by M18 |

### Milestones
- **Day 90:** public launch, 50-family beta case studies, extraction P ≥ 0.95 on meds.
- **Month 6:** SOC 2 Type I, first employer LOI, Android parity.
- **Month 12:** 2,000 paying families, 3 live employer pilots, GUIDE partner signed.
- **Month 18:** $1.5M ARR run-rate, Series A.

---

## 90-Day Launch Plan

**Team:** CEO/product (ex-caregiver ideal) · 2 full-stack engineers · 1 ML/AI engineer · 1 designer (part-time) · clinical safety advisor (RN/PharmD, fractional) · regulatory/privacy counsel (fractional).

| Week | Product & Engineering | AI / Safety | GTM & Validation |
|---|---|---|---|
| 1 | Repo, infra (Terraform), auth, BAAs signed | Collect 100 de-identified documents; annotation guideline | 20 caregiver interviews (problem validation script) |
| 2 | Data model + RLS; circle/invite flow | Gold set v0 (100 docs); baseline extraction prompt | Landing page + waitlist; "hospital-to-home kit" draft |
| 3 | Document upload + review screen (W3) | Extraction eval harness in CI; RxNorm integration | Recruit 50 beta families (communities, discharge planners) |
| 4 | Today screen, meds logging, tasks | Interaction DB licensed and wired; red-team suite v0 | Usability tests on clickable prototype (`prototypes/tend.html`) with 8 users |
| 5 | Push/SMS reminders; TestFlight build | Gold set → 300 docs; target P ≥ 0.93 | **Closed beta starts (50 families)** |
| 6 | Visit recorder + STT pipeline | Visit-summary eval (30 recordings, consented) | Weekly beta calls; instrument activation funnel |
| 7 | Ask Tend (RAG) v1; benefits corpus 5 states + federal | Citation-faithfulness eval; refusal tests | 5 SEO pages live; first creator partnership |
| 8 | Weekly digest; settings, export/delete | Prompt-injection hardening on documents | Beta survey: hours saved, NPS; pricing test (3 price points) |
| 9 | Stripe + StoreKit; free/paid gating | Meds precision ≥ 0.95 (launch gate) | Press kit; 3 case studies from beta |
| 10 | Web app parity; performance pass | Safety review sign-off by clinical advisor | App Store submission; Product Hunt prep |
| 11 | **Public launch (iOS + web)** | Live monitoring: flagged outputs reviewed < 24h | Launch: communities, PR, creators; QR cards to 20 discharge planners |
| 12 | Bug-bash; Android beta | Post-launch eval on real edits (correction data loop) | Employer outreach (20 HR leads); first LOI target; investor update |

**Launch gates (all required):** meds extraction precision ≥ 0.95 · zero critical red-team failures · BAAs complete · clinical advisor sign-off · export/delete verified.
