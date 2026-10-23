# Part 2 — Prototype Specifications

Low-fidelity wireframes in description format (layout, top to bottom), primary user flows, AI capabilities, KPIs and a 90-day roadmap per concept. Tend is specified in most depth. A clickable version is in [`prototypes/tend.html`](../../prototypes/tend.html).

---

## 2.1 Tend — care coordination

### Primary flow: "Mom just got discharged"
```
Onboard (who are you caring for?) → Invite siblings (SMS link)
  → Snap discharge papers (multi-page) → AI extraction review screen
  → Confirm meds / appointments / instructions (tap to accept/edit)
  → Auto-generated task list → assign to circle → push reminders
  → Sunday: weekly family digest
```

### Wireframes

**W1 · Today (home)**
- Header: care-recipient avatar + name ("Mom · Ruth"), circle avatars, settings gear.
- Card stack (scroll):
  1. **Next up**: next appointment (time, provider, who's driving; "Directions" / "Swap").
  2. **Meds today**: timeline chips (08:00 ✓, 13:00 ○, 20:00 ○). Tap to log.
  3. **Open tasks** grouped by owner, overdue in amber.
  4. **AI flag** (rare, dismissible): "New prescription Lisinopril overlaps with existing Losartan; ask Dr. Patel." Source: interaction DB; never an LLM opinion.
- Bottom bar: Today · Care log · **＋ Capture** (center, large) · Docs · Circle.

**W2 · Capture sheet**
- Three large tiles: 📷 *Scan a document* · 🎙 *Record a visit* · ✍️ *Quick note*.
- Under the tiles: "Tend reads it, you confirm it. Nothing is saved until you approve."

**W3 · Extraction review** (the trust-critical screen)
- Split view: document thumbnail (pinch-zoom; highlighted source spans) | extracted items.
- Each item: type icon, value, confidence dot (green/amber), source quote, ✓ / ✎ / ✕.
- Amber items (low confidence or medication) **must** be confirmed one by one. Green ones can be bulk-accepted.
- CTA: "Add 4 meds, 2 appointments, 3 tasks to Ruth's care plan".

**W4 · Visit recorder**
- Consent banner (local laws on recording; "Ask the clinician first").
- Waveform, timer, pause. After stopping: summary (≤ 8 bullets), "Questions you said you'd follow up on", proposed tasks. Same accept/edit pattern as W3.

**W5 · Ask Tend (navigation)**
- Chat input with suggestion chips: "What does this Medicare letter mean?", "Are we eligible for respite?", "Draft a message to my brother about this week".
- Every answer ends with **Sources** (benefit program pages, the user's own documents) and an "Is this right? Talk to a human" link (premium).

**W6 · Weekly digest** (push + email + in-app)
- "This week for Ruth": meds adherence %, appointments done/upcoming, open decisions, who did what (positive framing), next week's three priorities.

### Core features & AI capabilities

| Feature | AI capability | Model / method | Guardrail |
|---|---|---|---|
| Document intake | Multimodal OCR + entity extraction to JSON schema | Sonnet 5.5 vision, tool-use with strict schema | Human confirmation; source-span grounding; confidence thresholds |
| Med list | Normalization | RxNorm API (deterministic) | No dosing advice; pharmacist-review prompt on change |
| Interaction flags | — (not AI) | Licensed drug DB | Shown with source; "ask your clinician" |
| Visit summaries | Speech-to-text + summarization + task extraction | Streaming STT (e.g., Deepgram/Whisper) → Sonnet 5.5 | Recording-consent gate; audio deleted after transcription by default |
| Task delegation | Assignment suggestion | Haiku 5.5 + heuristics (availability, distance, history) | Suggest only; user assigns |
| Benefits Q&A | RAG over curated corpus + user docs | Hybrid search (pgvector + BM25) → Sonnet 5.5 with citations | Answer only if retrieved sources support it; otherwise "I don't know" + human route |
| Digest | Summarization over the week's events | Haiku 5.5 | Template-constrained |

### Success metrics & KPIs

| Stage | KPI | Target (MVP, day 90) |
|---|---|---|
| Activation | % new circles that capture ≥1 document within 48h | ≥ 55% |
| Accuracy | Field-level extraction precision on meds (post-review edit rate) | ≥ 95% precision; edit rate < 10% |
| Network | Avg. active members per circle | ≥ 2.3 |
| Engagement | Weekly active circles / total circles | ≥ 60% |
| Retention | M1 / M3 circle retention | ≥ 55% / ≥ 40% |
| Monetization | Free → paid conversion by day 30 | ≥ 6% |
| Safety | Clinical-safety incidents (harmful AI output reaching a user) | 0. Every flagged event reviewed in < 24h |

### 90-day roadmap (MVP)
Detailed launch plan in Part 3. Summary: **Weeks 1–4** foundation and extraction eval set → **Weeks 5–8** closed beta with 50 families → **Weeks 9–12** public iOS/web launch, paid tier, first employer pilot LOI.

---

## 2.2 Ledger — debt & paperwork copilot

**Flow:** Snap letter → plain-language card (What it is · Amount · Deadline · What happens if you ignore it · Your options) → "Add to my debt map" → connect bank (optional) → payoff plan → draft letter → user sends.

**Wireframes**
- **L1 Inbox:** list of letters as cards sorted by deadline; color by urgency (red ≤ 7 days). Big floating "Scan letter" button.
- **L2 Letter card:** top band with deadline countdown. Sections: *In plain words* (≤ 60 words), *Amount* (principal/fees/interest split), *Legal stage* (step indicator: invoice → reminder → debt collection notice → collection → enforcement), *Options* (3 buttons: Pay · Ask for payment plan · Dispute).
- **L3 Debt map:** stacked bar by creditor; toggle avalanche/snowball; "Months to debt-free" slider tied to monthly budget.
- **L4 Draft letter:** editable letter, inline citations ("Inkassoloven § 9"), "Copy / Email / Print" (no auto-send).

**AI capabilities:** letter classification + field extraction (Sonnet 5.5) · deterministic stage/deadline rules per jurisdiction · template-grounded drafting with citations · tone control ("firm", "polite", "hardship").

**KPIs:** letters decoded/week · % deadlines met (self-reported plus bank-detected payments) · payment plans obtained · M3 retention ≥ 30% · bank pilot: +X pp cure rate at 90 days vs control.

**90 days:** W1–4 Norway letter-type corpus (top 25 types) + rules → W5–8 decoder web app with SEO pages, counselor-partner beta → W9–12 debt map with open banking, Pro tier, one bank LOI.

---

## 2.3 Readwell — reading tutor

**Flow:** Parent setup (age, interests, quick placement read) → child daily session (warm-up phonics game 2 min → story read-aloud 6 min → comprehension 2 min) → celebration → parent weekly report.

**Wireframes**
- **R1 Child home:** big avatar, today's story cover (generated around interests: "Dino the Bus Driver"), one giant ▶ button. No text-heavy UI.
- **R2 Reading screen:** large-print text, current word highlighted (karaoke-style). Miscue: word turns soft orange, then a gentle audio prompt. Mic indicator; "Help" owl icon.
- **R3 Parent report:** WCPM trend line, phonics pattern grid (mastered / practicing / not yet), "Try this at dinner" tip.
- **R4 Teacher dashboard:** class roster heatmap by phonics pattern; small-group suggestions.

**AI capabilities:** streaming child-tuned ASR + forced alignment · miscue classification · LLM decodable-story generation with grapheme–phoneme validator · adaptive scheduling (spaced repetition of weak patterns).

**KPIs:** ASR word-level miscue F1 ≥ 0.85 on held-out child speech · sessions/week ≥ 4 · WCPM gain vs norm at 8 weeks · parent NPS ≥ 50 · zero COPPA findings.

**90 days:** W1–4 consented child-speech data collection (200 kids) and ASR fine-tune baseline → W5–8 iPad beta with 100 families → W9–12 consumer launch plus a 3-classroom pilot with pre/post DIBELS.

---

## 2.4 Rolig — local-first stress micro-coach

**Flow (exists in v1.1):** Check-in (😣😕😐🙂😌 + note) → Pusterom (breathing circle 4-4-6) → Små grep (one action) → Historikk (local, exportable).
**Added in 2.0:** after the check-in, the on-device model reads the note and picks one of ~40 clinician-written micro-interventions, then shows a two-sentence reflection.

**Wireframes (2.0 delta)**
- **G1 After check-in:** soft card "Det høres ut som en lang dag. Vil du prøve 60 sekunder med lengre utpust?" + [Start] [Noe annet].
- **G2 Weekly pattern (local):** "De siste 4 ukene: tyngre etter kl 15 på mandager." Button: "Sett en mild påminnelse".
- **G3 Safety screen:** deterministic trigger on crisis lexicon → calm full-screen card with helpline numbers and "Ring nå".

**AI capabilities:** on-device classification and generation (Apple Foundation Models `@Generable` struct `{interventionId, reflection}`; Gemini Nano on Android) · local pattern detection (simple stats, not ML) · deterministic crisis screen.

**KPIs:** time-to-calm (check-in → finished exercise) < 2 min · self-rated mood delta after session ≥ +0.7 · D30 retention ≥ 10% (3× category median) · zero network calls (verified by an automated test).

**90 days:** W1–4 PWA + icon + dark mode + intervention library (with a psychologist) → W5–8 SwiftUI shell + Foundation Models + TestFlight 100 users → W9–12 App Store, first student-welfare B2B pilot.

---

## 2.5 Retrofit — home energy planner

**Flow:** Address + year built → 15-min scan (rooms, windows, heating system label, meter) → connect consumption (optional) → ranked plan (3 measures, cost after subsidy, payback, comfort gain) → request quotes → adviser call for big projects.

**Wireframes**
- **E1 Scan guide:** step checklist with camera overlay ("Point at the heat pump label"). Progress ring.
- **E2 Plan:** three cards ranked by payback. Each has before/after kWh bar, € after subsidy, CO₂, "Why this first" explanation.
- **E3 Subsidy panel:** eligible programs, amounts, deadlines, application checklist.
- **E4 Quotes:** standardized scope sent to 3 vetted installers; comparison table.

**AI capabilities:** LiDAR/photo geometry · multimodal label reading · physics model calibrated on consumption (deterministic) · LLM explanation and subsidy-document parsing.

**KPIs:** model error vs metered consumption ≤ ±20% · plan completion ≥ 60% of scans · quote request rate ≥ 15% · project conversion ≥ 8%.

**90 days:** W1–4 Norway-only model + Enova rules → W5–8 beta with one utility partner (500 homes) → W9–12 installer network in 1 region, first referral revenue.
