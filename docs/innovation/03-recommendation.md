# PART 3: FINAL RECOMMENDATION

## SELECTED CONCEPT: **Rolig Companion**

### Executive Summary

Loneliness and everyday stress are the most widespread, least-served health burden of the decade. The WHO Commission on Social Connection (2025) estimates that roughly one in six people worldwide is affected by loneliness and links it to substantial excess mortality. Yet the products built for this market fall into two camps. Content libraries such as Calm and Headspace lower stress briefly and do nothing about isolation. Engagement-maximizing AI companions such as Replika and Character.AI risk replacing human relationships instead of restoring them, and regulators are now moving against them.

Rolig Companion takes the opposite position. It is a **local-first, two-minute daily companion** that lowers arousal right now (check-in, guided breathing, one small action) and, over weeks, nudges the user back toward real people. Its north-star metric is **human contacts initiated**, not time in app. The AI runs **on the device**: Apple's Foundation Models framework, Gemini Nano, or WebLLM in the browser. By default, no mood data, notes or contacts ever leave the phone. Cloud reflection is opt-in for each use, end-to-end encrypted and zero-retention.

The core loop already works. This repository contains a functioning four-page prototype (Innsjekk, Pusterom, Små grep, Historikk) with local storage and export. That cuts MVP time to about 12 weeks with a team of three.

Revenue comes from a B2B2C model: employers, universities and municipalities pay **$2–4 per member per month** and receive only k-anonymized, device-aggregated wellbeing trends. They never see individual data, and that is the selling point in GDPR-strict European procurement. A freemium consumer tier ($49/yr) drives organic acquisition and brand. Because inference runs on users' own hardware, gross margins exceed 90%, and cost does not grow with engagement.

We will launch in Norway through student welfare organizations and municipalities, where data minimization is a procurement advantage, then expand across the Nordics, the UK and DACH through occupational-health partners. The 36-month target is **225,000 covered lives and about $8M ARR**, with a published efficacy study as the moat.

**Ask:** €1.2M pre-seed to fund 18 months: team of 6, clinical validation study, and first 10 B2B contracts.

*(≈330 words)*

---

### Why This Solution Wins

**1. Market size**
- Corporate wellness is a roughly $60–70B global market; mental-wellness apps add about $7–8B (2024 analyst estimates; triangulate before use).
- Employer pain is concrete: stress and mental health are leading drivers of sick leave in the Nordics. In Norway, mental disorders are among the top diagnosis groups for long-term sick leave, which employers co-fund through the employer-paid sick-leave period.
- SAM of about 45M covered lives in Nordics + UK + DACH mid-size employers and higher education.

**2. Defensibility**
| Moat | Why it compounds |
|---|---|
| **Privacy architecture** | Competitors built on cloud data cannot retrofit "nothing leaves the device" without rebuilding. Auditable claims beat policy promises in procurement. |
| **Outcome data (privately computed)** | Device-side aggregates of *which intervention → which mood change → which human contact* tune the picker through federated evaluation without centralizing raw data. |
| **Clinical evidence** | A published pilot (PSS-4 + UCLA-3 loneliness scale) is a 12–18-month head start in B2B sales. |
| **Brand position** | "The companion that wants you to need it less" is a story incumbents with engagement-based KPIs cannot copy. |

**3. Timing**
- **On-device LLMs became shippable in 2025.** Apple opened its on-device Foundation Models framework to developers (iOS 26), Gemini Nano reached Android developers, and WebLLM/WebGPU matured in browsers. A year earlier, this architecture was not practical.
- **Regulatory tailwind.** The EU AI Act transparency obligations are phasing in, US states are passing companion-chatbot safeguard laws, and data-protection authorities have acted against companion apps. Privacy-by-architecture becomes a selling point.
- **Incumbent weakness.** Consumer CBT-bot players have retreated; Woebot shut down its consumer app in 2025. Meditation apps face subscription fatigue. That leaves the sub-clinical, relational middle open.

**4. Risks & mitigations**
| Risk | Severity | Mitigation |
|---|---|---|
| Safety incident (crisis missed) | High | High-recall offline classifier; 500+ case eval set; crisis sheet always one tap away; clinical advisory board; never positioned as treatment |
| Medical device classification (EU MDR / FDA) | Medium | Wellness claims only (stress, connection), no diagnosis or treatment claims; regulatory counsel review of all copy |
| On-device model quality varies by phone | Medium | Rules-based fallback picker; model is an enhancement, not a dependency |
| B2B sales cycle | Medium | Start with public/student sector pilots; EAP partner resale |
| B2C retention | Medium | B2B carries economics; B2C is acquisition + brand |

---

### Technical Specification Document

> GitHub-ready. Intended path: `docs/innovation/03-recommendation.md` → split into `SPEC.md` when the native repo is created.

#### 1. Scope
Rolig Companion v1.0: PWA (from current `index.html`) + iOS native shell (SwiftUI). Android follows in v1.2.

#### 2. Architecture

```
apps/
  pwa/               # evolves index.html → Vite + vanilla TS (keep zero-framework footprint)
  ios/               # SwiftUI, FoundationModels, SwiftData
packages/
  core/              # intervention library (JSON), picker rules, safety rules — shared
  safety-evals/      # 500+ labeled cases, CI-gated
services/
  reflect/           # stateless edge function (Cloudflare Workers / Deno Deploy)
  aggregate/         # receives k-anonymized, DP-noised counters only
```

#### 3. Data model (on device)

```ts
type CheckIn = {
  id: string;            // uuid v7
  at: string;            // ISO 8601
  mood: 1 | 2 | 3 | 4 | 5;
  note?: string;         // never leaves device unless user opts in per reflection
  tags?: Theme[];        // on-device classifier output
};
type ActionDone = { id: string; at: string; actionId: string; checkInId?: string };
type Bridge = {
  id: string; at: string;
  contactAlias: string;  // user-chosen label, NOT a phone number
  draft: string; sent: boolean; // "sent" = user tapped Open Messages
};
type Theme = 'rumination' | 'overwhelm' | 'loneliness' | 'fatigue' | 'anger' | 'neutral';
```

Migration: existing `localStorage` keys `checkins` and `doneActions` (see `RUN.md`) are imported once into IndexedDB/SwiftData, then removed.

#### 4. AI components

| Component | Model | Input | Output | Latency budget | Fallback |
|---|---|---|---|---|---|
| Theme classifier | On-device FM (iOS: `LanguageModelSession` with guided generation into `Theme`; Web: WebLLM, ~1–3B param, 4-bit) | note text ≤500 chars | `Theme[]` | < 800 ms | keyword rules |
| Intervention picker | Deterministic scorer over library × themes × user history; LM only re-ranks top 5 | themes, last 14 days | `actionId` | < 100 ms | rules only |
| Bridge drafter | On-device FM, few-shot with user's last 3 edited drafts | contact alias, tone | ≤ 200 chars | < 2 s | 6 static templates |
| Weekly reflection | On-device FM summary; **opt-in** cloud: hosted frontier model (e.g. `claude-sonnet-5-5`) via zero-retention endpoint | aggregated week stats + optionally notes | 120-word reflection | < 6 s | template |
| Safety | Regex/lexicon (no/en, high recall) **OR** LM classifier; either triggers | any free text | `risk: none\|elevated\|acute` | < 300 ms | lexicon only; never disabled |

Prompt contract (all LM calls): system prompt forbids diagnosis, therapy claims, and advice on medication. Output is schema-constrained. Any output containing crisis content is replaced by the crisis sheet.

#### 5. Privacy & security
- No account required. Optional account exists only for B2B entitlement, holding an org code and a random device ID.
- Cloud reflection: client builds the payload, user sees the exact payload before send, transport is TLS 1.3, and the provider runs with zero data retention. Any identifiers are removed client-side.
- B2B aggregates: each device sends weekly counts (check-ins, mean mood bucket, bridges sent) with Laplace noise (ε≈1). The server suppresses any cohort under 10.
- DPIA completed before first B2B pilot. Data Processing Agreement template ready.
- Encrypted local store (iOS Data Protection class `complete`; Web: optional passphrase via WebCrypto AES-GCM).

#### 6. Quality gates (CI)
- `safety-evals`: recall ≥ 0.99 on acute set, ≥ 0.95 on elevated. A build fails below threshold.
- Picker regression snapshot tests.
- Lighthouse PWA ≥ 90; offline start works.
- Accessibility: WCAG 2.2 AA, Dynamic Type, VoiceOver labels on breathing animation.

#### 7. Non-goals (v1)
Diagnosis, therapy, chat-style open conversation, social feed, streaks, push notifications more than once a day.

---

### Go-to-Market Strategy with Milestones

**Positioning:** "Two minutes of calm. One step closer to someone. Nothing leaves your phone."

**Phase A — Prove (Months 0–6)**
- Channel: 2 Norwegian student welfare orgs + 1 municipality (free pilot in exchange for evaluation data).
- Content: short-form "2-minute reset" videos (no-face breathing visuals) for organic B2C.
- Milestones: 2,000 pilot users · PSS-4 −2 pts at 4 weeks · ≥1.0 bridges/WAU/week · 2 paid conversions.

**Phase B — Sell (Months 6–18)**
- Channel: occupational-health providers (bedriftshelsetjeneste) and EAP resellers. Direct sales to employers with 200–5,000 staff in the Nordics.
- Sales asset: pilot results + DPIA + "what your HR sees" demo (aggregates only).
- Milestones: 20 B2B contracts · 40k covered lives · $1.4M ARR · App Store rating ≥4.6 · Series A data room.

**Phase C — Scale (Months 18–36)**
- Markets: Sweden, Denmark, UK, DACH (localization + local crisis-line data).
- Channel: HR benefits platforms and insurers (wellbeing add-on).
- Milestones: 225k covered lives · ~$8M ARR · peer-reviewed efficacy publication · Android parity.

**Acquisition & retention metrics**
| Metric | Target |
|---|---|
| B2C CAC (blended) | ≤ $15 |
| B2B CAC | ≤ $9k per 1,000 seats |
| B2B activation (60 days) | ≥ 15% of covered lives |
| B2B logo retention (annual) | ≥ 85% |
| Net revenue retention | ≥ 105% (seat expansion) |
| B2C paid conversion | 4–6% of MAU |
| D30 retention | ≥ 15% |

**90-day launch plan (lead concept)**

| Week | Product | GTM | Ops |
|---|---|---|---|
| 1–2 | PWA install + offline; IndexedDB migration; dark mode | Pick 2 pilot orgs, sign LOIs | Incorporate; clinical advisor engaged |
| 3–4 | Intervention library v1 (24); rules picker | Landing page + waitlist; 10 short videos | DPIA draft; privacy policy |
| 5–6 | On-device LM (Web + iOS); safety evals in CI | Founder-led content; student ambassador program | Regulatory counsel wellness-claims review |
| 7–8 | Bridge feature; "What the AI saw" log | Pilot onboarding kits | Crisis-line data for NO/SE/DK/UK |
| 9–10 | Closed beta (200) → fix list | Baseline PSS-4/UCLA-3 survey | Data Processing Agreement template |
| 11–12 | B2B dashboard v1; App Store + PWA public | Public launch; 3 employer demos booked | Pre-seed data room |

**Day-90 exit criteria:** ≥1,500 installs · D7 ≥25% · zero safety misses on eval · 2 pilots live · 3 B2B pipeline opportunities at proposal stage.
