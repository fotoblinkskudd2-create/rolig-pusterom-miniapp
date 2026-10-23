# PART 4: FIVE VIBECODE iOS/WEB APPLICATIONS

**VibeCode format:** each app is small enough for one builder to ship with AI coding tools (Claude Code, Cursor, Vibecode/Expo-style app builders) in 1–4 weeks. Each has one screen that matters, one AI call that does the work, and one way to pay. Stack default: **Expo (React Native) + Expo Router** for iOS/Android/Web from one codebase, **Supabase** (auth, Postgres, storage, edge functions), **RevenueCat** for subscriptions, hosted LLM API called only from edge functions (keys never in the client).

None of these duplicates the five Part 1 concepts. Each solves a different human problem.

---

## App 1 — **BillBuddy**
**Core problem:** Utility, telecom and subscription bills are confusing, and overcharges go unnoticed. People pay for services they cancelled, outdated plans, and "temporary" promo prices that quietly expired.

**User journey & key features**
1. Snap or forward any bill (email-forward address per user).
2. Vision LLM extracts line items, then flags: price increases vs. last bill, expired promos, duplicate services, plans above usage.
3. "Fix it" button generates a call script or a cancellation/renegotiation email in the user's language.
4. Savings ledger: "BillBuddy found you 1,840 kr this year."

**AI technology stack**
- Vision-capable LLM (e.g. `claude-sonnet-5-5`) with JSON-schema output for extraction.
- Diff engine (deterministic) across bills of the same provider.
- Small, cheap model (e.g. `claude-haiku-5-5`) for script/email drafting.
- Supabase pgvector store of provider plan catalogs for "cheaper plan" suggestions.

**Monetization:** Free for 2 bills/month. **$3.99/mo** unlimited. Optional success fee (20% of first-year verified savings, user opt-in).

**Development priority timeline:** Week 1 extraction + diff · Week 2 scripts/emails + ledger · Week 3 email-forward ingestion + paywall · **Ship: 3 weeks.**

---

## App 2 — **Second Shift**
**Core problem:** Family caregivers (an estimated tens of millions of people worldwide caring for an aging parent or ill relative) juggle meds, appointments, siblings and paperwork with no shared system. The work is invisible and unevenly shared.

**User journey & key features**
1. Create a "care circle" for one person; invite siblings and helpers.
2. Voice note after each visit ("Mom seemed confused, ran out of blood pressure pills"). AI turns it into tasks, med alerts and a log entry.
3. Fair-share view: who did what this month (hours, drives, tasks).
4. One-tap "doctor summary": the last 30 days condensed into a one-page brief for the next appointment.

**AI technology stack**
- Speech-to-text (Whisper-class API, or on-device via iOS Speech framework).
- LLM structured extraction → tasks/meds/events schema.
- Summarization with citations back to source notes (each claim links to the note it came from).
- Push notifications via Expo; Supabase row-level security per circle.

**Monetization:** Free for 1 circle up to 3 members. **$7.99/mo per circle** for unlimited members + doctor summaries. B2B: home-care agencies at $15/client/mo.

**Development priority timeline:** Week 1–2 circles + voice → tasks · Week 3 fair-share + summaries · Week 4 notifications + billing · **Ship: 4 weeks.**

---

## App 3 — **FridgeFirst**
**Core problem:** Households waste a large share of the food they buy. UNEP's Food Waste Index (2024) estimates over 1 billion tonnes wasted globally in 2022, most of it in households. People throw it away because they forget what is there and don't know what to cook from leftovers.

**User journey & key features**
1. Snap the receipt or the open fridge. AI builds an inventory with estimated expiry dates.
2. Each evening: "Use these 3 things tonight" with a 20-minute recipe from what is actually there.
3. Weekly waste score in kroner/dollars and CO₂e saved.
4. Shopping list that subtracts what you already have.

**AI technology stack**
- Vision LLM for receipt parsing and fridge photo item detection (with user confirmation chips).
- Shelf-life lookup table (deterministic, from food-safety agency guidance), *not* LLM-guessed.
- Recipe generation constrained to inventory + dietary profile.
- Local notifications at user's dinner-decision time.

**Monetization:** Freemium; **$2.99/mo** premium (meal plans, household sharing). Affiliate revenue via grocery-delivery cart export (where APIs permit).

**Development priority timeline:** Week 1 receipt → inventory · Week 2 recipes + nightly nudge · Week 3 waste score + list · **Ship: 3 weeks.**

---

## App 4 — **Inkasso Navigator**
**Core problem:** A single debt collection letter triggers panic and avoidance. People don't know whether a fee is lawful, how many days they have, or what to write back. (This is the lightweight consumer front-door to the Part 1 Gjeldsguide concept, for the moment a letter arrives. It is a separate free app for one letter.)

**User journey & key features**
1. Photograph one letter. Get a three-line plain-language explanation: what this is, the deadline, what happens next.
2. "Is this fee legal?" check against statutory fee caps (deterministic table, updated yearly).
3. Pick a response: dispute, ask for documentation, request payment plan. Get a ready letter.
4. Deadline added to calendar. Done in under 3 minutes.

**AI technology stack**
- Vision LLM extraction to schema {creditor, amount, fees[], step, deadline, legalBasis}.
- Rules engine (TypeScript, unit-tested) computes legality and deadlines. LLM phrases results only.
- Templates reviewed by a lawyer; LLM fills fields, never invents legal claims.
- On-device processing option: images deleted after extraction.

**Monetization:** **Free to users** (users in debt are the wrong payer). Revenue: sponsorship by unions/municipalities/financial-wellness programs; white-label licensing for counseling services. Strictly no creditor funding.

**Development priority timeline:** Week 1 rules engine + tests · Week 2 extraction + explainer · Week 3 letters + calendar · Week 4 legal review fixes · **Ship: 4 weeks (Norway first).**

---

## App 5 — **SpeakEasy Rehearsal**
**Core problem:** Hard conversations (asking for a raise, setting a boundary with a parent, telling a landlord about a problem, a job interview) are avoided or botched because people never practice them. Coaching costs $100+ per hour.

**User journey & key features**
1. Pick a scenario or describe your own ("telling my manager I'm burnt out").
2. Voice role-play with an AI counterpart. User sets difficulty from "supportive" to "pushes back".
3. After each round: feedback on clarity, hedging words, interruptions, talk ratio and tone, with one concrete rewrite of your weakest line.
4. Confidence tracker across rehearsals; "go time" checklist before the real conversation.

**AI technology stack**
- Real-time voice: speech-to-speech realtime API (several providers shipped low-latency voice APIs in 2024–25), or STT → LLM → TTS pipeline for lower cost.
- LLM persona with scenario card (goals, constraints, difficulty).
- Post-hoc analysis: transcript → deterministic metrics (words per minute, filler-word count, talk ratio) + LLM qualitative feedback.
- Transcripts stored only on device unless user saves to cloud.

**Monetization:** 3 free rehearsals. **$9.99/mo** or **$59/yr**. B2B: HR/L&D teams for manager training, $8/seat/mo.

**Development priority timeline:** Week 1 text role-play + feedback · Week 2 voice pipeline · Week 3 metrics + tracker · Week 4 scenario library (30) + billing · **Ship: 4 weeks.**

---

## Build order across the portfolio

| Priority | App | Why first | Weeks |
|---|---|---|---|
| 1 | Inkasso Navigator | Shares the rules engine with Gjeldsguide; high urgency; fits Rolig's privacy brand | 4 |
| 2 | BillBuddy | Fastest to visible user value (money found) | 3 |
| 3 | FridgeFirst | Viral, visual, cheap to run | 3 |
| 4 | SpeakEasy Rehearsal | Highest ARPU; voice stack reusable | 4 |
| 5 | Second Shift | Strongest retention but needs multi-user infra | 4 |

**Shared foundations (build once):** Expo monorepo template · Supabase auth + RLS · edge-function LLM gateway with per-user rate limits, cost logging and prompt versioning · RevenueCat paywall component · eval harness (golden inputs → expected JSON) run in CI for every prompt change.
