# PART 2: PROTOTYPE SPECIFICATIONS

Low-fidelity wireframes use ASCII and are mobile-first at 390×844pt (iPhone 15/16 class). Each concept has: user flow → key screens → core features & AI capabilities → KPIs → 90-day roadmap.

---

## 1. Rolig Companion

### User flow
```
Open app ─► [Hjem] "Hvordan har du det?" ─► mood 1–5 (+ optional note)
                │
                ├─ mood ≤2 ─► Breathing (60–120s) ─► "One small thing" (AI-picked) ─► done
                ├─ mood 3   ─► Small action list (AI-ranked) ─► done
                └─ mood ≥4  ─► "Want to share this with someone?" ─► Bridge draft ─► open Messages
Weekly (Sun) ─► Reflection card (on-device) ─► [optional] Deep reflection (cloud, consent per use)
Any text ─► Safety check ─► if risk: Crisis sheet (local numbers, offline)
```

### Key screens
```
┌──────────────────────────┐  ┌──────────────────────────┐  ┌──────────────────────────┐
│ Rolig            ⚙︎       │  │ ← Pusterom               │  │ Bridge                   │
│                          │  │                          │  │ You felt lighter on 3 of │
│ Hvordan har du det nå?   │  │        ◯  (expands 4s)   │  │ 4 days you talked to     │
│ 😞  🙁  😐  🙂  😊        │  │      Pust inn…           │  │ Kari. Send her a line?   │
│                          │  │                          │  │ ┌──────────────────────┐ │
│ [ Note (valgfri)       ] │  │   ◉ ◉ ◉ ○ ○  cycle 3/5   │  │ │ "Hei! Tenkte på deg. │ │
│                          │  │                          │  │ │ Kaffe på torsdag?"   │ │
│ [   Sjekk inn   ]        │  │   [ Ferdig ]             │  │ └──────────────────────┘ │
│ 🔒 Alt blir på enheten   │  │                          │  │ [Edit] [Open Messages]   │
│ Hjem│Pust│Grep│Historikk │  │                          │  │ [Not now]                │
└──────────────────────────┘  └──────────────────────────┘  └──────────────────────────┘
```
Layout notes: one primary action per screen; minimum 44pt touch targets; dark-mode first (the `#1a1f1c` palette already in `isolation-mirror.html`); persistent lock line on Home.

### Core features & AI capabilities
| Feature | AI | Runs where |
|---|---|---|
| Intervention picker | Small LM classifies note → {rumination, overwhelm, loneliness, fatigue, anger} → maps to intervention library | Device |
| Bridge drafts | LM drafts 1-sentence message in user's own tone (few-shot from user-edited past drafts) | Device |
| Weekly reflection | Pattern summary over local history (mood × action × contact) | Device; deeper version cloud opt-in |
| Safety layer | Keyword rules + LM classifier, tuned for high recall | Device, offline |
| "What the AI saw" log | Plain-text record of every model input/output | Device |

### Success metrics & KPIs
- **North star:** human contacts initiated per weekly active user (WAU) per week (target ≥1.0 by week 8).
- PSS-4 stress score change at 4 weeks (target −2 points on a 0–16 scale; validate in pilot).
- D1/D7/D30 retention: 45% / 25% / 15% (above category medians).
- Session length median about 2 min. *Longer is not better.*
- Safety: 100% of seeded crisis phrases surface resources (zero misses on eval set).
- B2B: covered-employee activation ≥15% in 60 days (EAP benchmark is low single digits).

### 90-day roadmap
| Weeks | Milestone |
|---|---|
| 1–2 | PWA wrap of `index.html` (manifest, icon, offline service worker), IndexedDB migration, JSON export |
| 3–4 | Intervention library v1 (24 items, clinically reviewed); rules-based picker baseline |
| 5–6 | On-device LM integration (WebLLM in the PWA; Apple FM in the native SwiftUI shell), safety eval set (500 cases) |
| 7–8 | Bridge feature + contact consent model; "What the AI saw" log |
| 9–10 | Closed beta: 200 users (students via welfare org); PSS-4 baseline |
| 11–12 | B2B aggregate dashboard (k-anonymized); 2 signed pilot LOIs; App Store submission |

---

## 2. ClaimPilot

### User flow
```
Landing ("Got denied?") ─► Upload denial/EOB (photo/PDF) ─► Extraction review ("Is this right?")
 ─► Plan doc upload (or "I don't have it" → request-letter generator)
 ─► Strategy screen (3 ranked arguments with citations) ─► Draft letter ─► Clinician LMN template
 ─► E-sign / print / fax-send ─► Deadline tracker ─► Outcome capture (won/lost/partial)
```

### Key screens
```
┌──────────────────────────┐  ┌──────────────────────────┐
│ Denial found             │  │ Your strongest arguments │
│ Insurer: ████ Health     │  │ 1. Medical necessity ★★★ │
│ Code: CO-50 (not med.    │  │    Plan §4.2 + criteria  │
│ necessary)               │  │ 2. Prior auth was given  │
│ Service: MRI L-spine     │  │    ★★ (ref #…)           │
│ Amount: $2,340           │  │ 3. Timely filing ★       │
│ Deadline: 164 days left  │  │ [Draft my appeal]        │
│ [Looks right] [Edit]     │  │ Every claim is cited ↗   │
└──────────────────────────┘  └──────────────────────────┘
```

### Core features & AI
Vision extraction with confidence scores; RAG over plan + state + federal rules; argument ranking (initially rules + LLM, later learned from outcomes); citation verifier (every quote checked against source span); deadline engine (deterministic).

### KPIs
Appeal completion rate from upload ≥40%; overturn rate on filed appeals (measure; target above 50%); time-to-letter under 15 min; citation hallucination rate 0 on audit sample; NPS ≥50.

### 90-day roadmap
| Weeks | Milestone |
|---|---|
| 1–3 | HIPAA infra + BAA vendors; extraction for top-20 denial codes |
| 4–6 | Regulatory corpus (federal + CA, TX, NY, FL, IL); citation verifier |
| 7–9 | Letter + LMN generation; advocate review queue |
| 10–12 | Launch with 2 patient foundations; 300 appeals; outcome tracking live |

---

## 3. Strømvett

### User flow
```
Onboard: address ─► connect meter (Elhub/retailer OAuth) ─► connect devices (EV, heat pump, water heater)
 ─► Daily: price curve + auto-schedule ("EV charges 01–05, saves 34 kr")
 ─► Monthly savings report (verified vs. baseline)
 ─► "Plan my house": photos + energy label + bills ─► ranked retrofit plan ─► subsidy check ─► get 3 quotes
```

### Key screen
```
┌──────────────────────────┐
│ Today  ▁▂▂▃▅▇█▇▅▃▂▁       │
│ cheapest 02–05 · peak 18 │
│ ⚡ EV      01:00–05:00 ✓  │
│ 🔥 Heater  pre-heat 04 ✓  │
│ Saved this month: 412 kr │
│ ───────────────────────  │
│ Your next upgrade:       │
│ Attic insulation         │
│ Payback 4.1 yrs · grant ✓│
│ [See plan] [Get quotes]  │
└──────────────────────────┘
```

### Core features & AI
Price forecasting (day-ahead + 7-day probabilistic); constraint scheduler (comfort bounds, departure time); vision intake of house features; LLM explanation layer over a deterministic heat-loss model; quote analyzer (flags outlier pricing).

### KPIs
Verified savings ≥10% vs. baseline; scheduled-load share ≥60%; installer lead conversion ≥8%; monthly churn under 3%.

### 90-day roadmap
| Weeks | Milestone |
|---|---|
| 1–4 | Nord Pool price ingestion + forecasting; one EV and one thermostat integration |
| 5–8 | Scheduler + savings verification; beta with 100 households |
| 9–12 | Retrofit planner v1 (subsidy rules for Norway); 5 installer partners |

---

## 4. Gjeldsguide

### User flow
```
"Open one letter with me" ─► photo ─► extraction (creditor, amount, step, deadline)
 ─► "Here's what this is" (plain language, 3 lines) ─► "The one thing to do" ─► draft letter/plan request
 ─► Add more letters (optional) ─► Ranked list by cost-of-inaction ─► Export case file for counselor
```

### Key screen
```
┌──────────────────────────┐
│ This is a                │
│ BETALINGSOPPFORDRING     │
│ Step 2 of 3 before court │
│ Due in 14 days           │
│                          │
│ If you do nothing:       │
│ +fees, then legal step   │
│                          │
│ The one thing:           │
│ Ask for a payment plan   │
│ [Draft it for me]        │
│ [I can't pay anything →] │
│ No total shown unless    │
│ you ask. 🔒              │
└──────────────────────────┘
```

### Core features & AI
Vision extraction; deterministic jurisdiction rules engine (fees, steps, deadlines); LLM phrasing *only* over rules-engine output; letter generator; counselor export (PDF + JSON); emotional-load-aware UX (progressive disclosure).

### KPIs
Letters opened per user (vs. self-reported backlog); deadlines met ≥80%; fee disputes filed; counselor intake time reduction (target −50%); user-reported avoidance score improvement.

### 90-day roadmap
| Weeks | Milestone |
|---|---|
| 1–3 | Norwegian rules engine reviewed by a lawyer; 15 letter types |
| 4–6 | Vision extraction + plain-language explainer |
| 7–9 | Letter drafts + counselor export; pilot with 1 municipality |
| 10–12 | Union/employer pilot (500 seats) |

---

## 5. LesLytt

### User flow
```
Teacher creates class (roster import) ─► parent consent (digital) ─► child login (picture password)
 ─► Read text aloud (highlight follows voice) ─► instant gentle feedback ─► star + next text
 ─► Teacher dashboard (WCPM trend, error patterns, "needs help" list) ─► parent weekly email
```

### Key screen
```
┌──────────────────────────┐
│  🐻 Bamse og båten        │
│                          │
│  Bamse ▓▓▓▓ gikk ned til │
│  bryggen. Han så en      │
│  [liten] båt.  ← stuck   │
│                          │
│     🎤 listening…        │
│  [ Help me with a word ] │
└──────────────────────────┘
```

### Core features & AI
Child-tuned ASR + forced alignment; miscue classification; LLM feedback (≤12 words, positive-specific); generative decodable texts constrained by phoneme set; teacher analytics.

### KPIs
Reading minutes per student per week ≥40; WCPM growth vs. control (efficacy study); teacher weekly active ≥70%; ASR word error rate on child speech below 12%.

### 90-day roadmap
| Weeks | Milestone |
|---|---|
| 1–4 | Consent + data partnership with 2 schools; collect 50h consented child speech |
| 5–8 | ASR fine-tune + alignment; 60 levelled texts |
| 9–12 | Classroom pilot (4 classes); teacher dashboard v1 |
