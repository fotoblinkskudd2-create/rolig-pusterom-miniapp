# PART 1: FIVE AI-POWERED PRODUCT CONCEPTS

## Phase 1 — Research & Discovery

### Method

1. **Signal scan.** Public health data (WHO, OECD, national statistics), consumer-finance regulators, climate and energy agencies, education outcome data, app-store category rankings, and 2024–2026 venture funding by category.
2. **Problem validation filter.** A need moves forward only if it passes all five tests:
   - **Frequency.** The pain recurs weekly or more, or it is rare but costs a lot each time.
   - **Severity.** It costs money, health or time the person can measure.
   - **Workaround evidence.** People already patch it with spreadsheets, forums, paying humans, or simply giving up.
   - **AI leverage.** An LLM, speech model or vision model is at least 5× cheaper or faster than the current human workaround.
   - **Reachable buyer.** There is a payer and a channel that cost less than one year of customer value.
3. **Scoring.** Each need is scored 1–5 on Severity, Frequency, Willingness-to-Pay (WTP), AI Feasibility and Competitive Whitespace.

### Five unmet needs

| # | Unmet need | Key evidence (verify before deck use) | Sev | Freq | WTP | AI fit | Whitespace | Total |
|---|-----------|----------------------------------------|----|----|----|----|----|----|
| 1 | **Everyday stress and loneliness support that does not harvest your data.** It should sit below the clinical threshold, live on the device, and nudge you toward real people. | WHO Commission on Social Connection (2025): roughly 1 in 6 people worldwide affected by loneliness. US Surgeon General advisory (2023) puts its mortality risk on par with other major risk factors. Mozilla's *Privacy Not Included* reviews repeatedly flagged mental-health apps for data sharing. | 4 | 5 | 3 | 5 | 4 | **21** |
| 2 | **Fighting wrongful medical claim denials.** | KFF analyses of ACA marketplace data: in-network denial rates around 17–20%, with **under 1%** of denials appealed. Appeals that are filed succeed at high rates. Insurers increasingly use automated review. | 5 | 2 | 4 | 5 | 4 | **20** |
| 3 | **Household energy cost and retrofit paralysis.** People face dynamic tariffs, heat pumps, solar and grants, and cannot decide. | Hourly spot pricing (Nordics, UK Agile-type tariffs, US time-of-use) makes optimization valuable. Retrofit subsidy programs (Enova in Norway, the US IRA credits as amended in 2025, UK schemes) are underused because they are complex. | 3 | 4 | 3 | 4 | 4 | **18** |
| 4 | **Debt triage before collections spirals.** | Consumer debt is at record nominal levels in most OECD markets. In Norway, Gjeldsregisteret makes unsecured debt visible, and collection fees escalate on statutory steps. Debt advisory services have long waiting lists. | 5 | 3 | 2 | 5 | 3 | **18** |
| 5 | **Reading fluency for early readers without a 1:1 tutor.** | Post-pandemic reading gaps persist (NAEP 2022/2024 reading declines). Oral reading practice needs a listener, and teachers cannot listen to 25 children each day. | 4 | 5 | 3 | 4 | 3 | **19** |

**Gap thesis.** In all five, the expensive, scarce resource is a patient expert who listens: a therapist, a claims specialist, an energy advisor, a debt counselor, a reading tutor. In 2025, LLMs and speech models became good enough, and inference cheap enough (falling several-fold per year at a fixed capability tier), to provide the *first 80%* of that expert for well under $1 per user per month in compute.

---

## Concept 1 — **Rolig Companion**
*Local-first stress and loneliness companion that measures success by how often it sends you to a real person.*

### Problem statement
Hundreds of millions of adults live with sub-clinical stress, low mood and loneliness. They do not qualify for (or cannot reach) therapy. The market offers them three options, and none works well:
- **Meditation apps** (Calm, Headspace) are content libraries with high churn. They are generic, and they do nothing about isolation.
- **AI companions** (Replika, Character.AI) maximize engagement and can deepen isolation. Some face regulatory scrutiny, for example Italy's Garante action against Replika and US state bills on companion chatbots.
- **Clinical digital therapeutics** are gated by prescription, slow, and sold B2B.

The unmet need: *a private, daily, 2-minute tool that lowers arousal right now and helps rebuild human contact over weeks.*

### Solution overview
- **Core loop** (already prototyped in this repo): check in (mood 1–5 + note) → guided breathing → one small action → local history.
- **AI layer:**
  1. An **on-device small model** (Apple Foundation Models framework on iOS 26+, Gemini Nano on Android, WebLLM in the browser) reads check-in notes and picks the right micro-intervention. Nothing leaves the device by default.
  2. **"Bridge" prompts.** The model notices patterns, such as "you felt better on days you texted someone". It drafts a low-pressure message to a person the user chose, and the user sends it from their own messaging app.
  3. **Opt-in cloud reflection.** With explicit consent each time, an end-to-end encrypted request goes to a frontier model for a deeper weekly reflection. Zero retention applies, and the request carries no identifiers.
  4. **Safety layer.** A deterministic classifier plus an LLM check detect crisis language and show local crisis lines (e.g. Mental Helse 116 123 in Norway, 988 in the US). The product never acts as a therapist.
- **Anti-engagement design.** The product's north star is *human contacts initiated*, not minutes spent in the app.

### Business Model Canvas

| **Key Partners** | **Key Activities** | **Value Propositions** | **Customer Relationships** | **Customer Segments** |
|---|---|---|---|---|
| Employers/EAPs, occupational health providers, student welfare orgs (e.g. SiO in Norway), NGOs (Mental Helse, Røde Kors), Apple/Google (on-device AI) | Intervention design with clinical advisors; on-device model tuning; safety evals; privacy audits | **"Calm in 2 minutes, closer to people in 2 months, and your data never leaves your phone."** Measurable stress reduction (PSS-4), measurable social contact increase | Self-serve app; weekly reflection; no streak-shaming; transparent "what the AI saw" log | **B2C:** stressed adults 20–45, students, remote workers. **B2B2C:** employers (200–5,000 staff), universities, municipalities |
| **Key Resources** | | | **Channels** | |
| Local-first codebase (this repo); intervention library; safety eval set; privacy brand | | | App stores, TikTok/IG short-form "2-minute reset" content, university welfare offices, EAP marketplaces, HR benefits platforms | |
| **Cost Structure** | | | **Revenue Streams** | |
| Engineering (70%); clinical/safety review; content; cloud inference for opt-in reflections only (~$0.02–0.05 per reflection); security audits | | | Freemium B2C at **$5.99/mo or $49/yr**. B2B at **$2–4 per employee per month**, with aggregate-only, k-anonymized wellbeing dashboard (k≥10) | |

**Unit economics (model):**
- B2C: blended ARPU about $3.20/mo after the free tier. Gross margin above 90%, because most inference runs on the device. CAC target $12–18 through organic and short-form content. LTV at 9-month average life is about $29. LTV:CAC ≈ 1.8–2.4 for B2C alone, which is **not enough alone**, so B2B carries the model.
- B2B: 1,000-seat employer at $3/seat/mo = $36k ARR. Sales cycle 60–120 days. CAC about $9k. Payback under 4 months. LTV:CAC above 8 at 85% logo retention.

### Target market & GTM
- **TAM:** global corporate wellness, about $60–70B (various analyst estimates, 2024). Mental wellness apps, about $7–8B.
- **SAM:** Nordic + UK + DACH employers with 200–5,000 staff, plus higher education. About 45M covered lives.
- **SOM (36 months):** 0.5% of SAM ≈ 225k covered lives × $3 × 12 ≈ **$8M ARR**, plus B2C.
- **GTM wedge:** start with Norwegian student welfare organizations and municipalities. Norwegian public procurement rewards data minimization, and the privacy story beats US incumbents there. Then expand to Nordic employers through occupational health partners.

### Competitive landscape

| Competitor | Model | Weakness Rolig exploits |
|---|---|---|
| Calm / Headspace | Content subscription, B2B | Generic content, no relational outcome, cloud data |
| Wysa / Woebot-style CBT bots | B2B / clinical | Cloud-dependent; Woebot shut down its consumer app in 2025; clinical positioning slows sales |
| Replika / Character.AI | Engagement companion | Builds dependence; regulatory and reputational risk |
| Finch | Gamified self-care pet | Strong B2C retention, no B2B, no human-bridge loop |
| EAP phone lines | Human counseling | Typically low single-digit % utilization; stigma; slow |

**Differentiation:** (1) on-device by default, so it can be marketed and audited as "no data leaves your phone"; (2) a *human-contact* outcome metric no competitor reports; (3) a 2-minute session format.

### Technical feasibility & MVP architecture

```
┌─────────────── Device ───────────────┐
│ UI (SwiftUI / PWA from index.html)   │
│ Local store (SQLite / IndexedDB)     │
│ On-device LLM (Apple FM / WebLLM)    │──► intervention picker, bridge-message drafts
│ Safety classifier (rules + small LM) │──► crisis resources (offline list)
│ Export (.txt / .json)                │
└───────────────┬──────────────────────┘
                │ opt-in only, E2E, no IDs
       ┌────────▼────────┐
       │ Reflection API  │ stateless edge function → frontier LLM (zero-retention)
       └────────┬────────┘
       ┌────────▼────────┐
       │ B2B aggregate   │ device-computed, k-anonymized counts (k≥10), differential-privacy noise
       └─────────────────┘
```

- **Feasibility: High.** Every component shipped in 2025. The hardest part is the safety evaluation, not the model.
- **MVP:** 10–12 weeks with 2 engineers + 1 designer + part-time clinical advisor.

---

## Concept 2 — **ClaimPilot**
*AI that turns a medical claim denial into a winning appeal in 15 minutes.*

### Problem statement
US insurers deny a meaningful share of in-network claims. KFF analyses of ACA marketplace plans put this around 1 in 5. Fewer than 1% of denials are appealed, even though many appeals succeed. Patients face denial codes, plan documents of 100+ pages, and deadlines (typically 180 days for internal appeal under ACA rules). Insurers, meanwhile, use algorithmic review at scale.

### Solution overview
- The patient photographs or uploads the EOB, denial letter and plan documents. A vision LLM extracts the denial reason code, CPT/ICD codes and dates.
- Retrieval over the user's plan document, the state's insurance code, the federal ACA/ERISA appeal rules, and public medical-necessity criteria.
- The tool drafts an appeal letter with citations, plus a letter-of-medical-necessity template for the clinician to sign. It tracks deadlines and reminds the user about external review.
- A human-in-the-loop tier lets patient advocates review complex cases. This keeps the product on the right side of unauthorized-practice-of-law rules.

### Business Model Canvas

| **Key Partners** | **Key Activities** | **Value Propositions** | **Customer Relationships** | **Customer Segments** |
|---|---|---|---|---|
| Patient advocacy orgs, certified patient advocates, independent clinics' billing teams, rare-disease foundations | Document parsing; regulatory corpus upkeep (50 states); outcome tracking | "Appeal any denial in 15 minutes, with the law and your plan cited." | Self-serve + concierge; outcome notifications | Chronic illness patients, caregivers, independent practices |
| **Key Resources** | | | **Channels** | |
| Appeal outcome dataset (the moat); regulatory knowledge base | | | Disease communities (Reddit, Facebook groups), foundations, SEO on denial codes ("CO-50 denial appeal") | |
| **Cost Structure** | | | **Revenue Streams** | |
| LLM inference (~$0.30–1.00/case); HIPAA-grade infra; advocate network | | | **$29 per appeal** or **$12/mo** unlimited for chronic patients. Contingency option: 15% of recovered amount, capped. B2B: clinics at $299/mo | |

**Unit economics:** average case revenue about $35. Variable cost about $3 (inference + infra + payment). CAC through communities and SEO about $20. Gross margin above 85%.

### Target market & GTM
- **Market:** tens of millions of denied claims per year in the US. If 2M appeals per year are filed at $30, that is a $60M direct-to-patient SOM. The B2B clinic billing-assist segment is larger.
- **GTM:** SEO landing pages per denial code and procedure; partnerships with rare-disease foundations whose members face repeated denials; a free "denial decoder" tool as lead magnet.

### Competitive landscape
| Competitor | Gap |
|---|---|
| Patient advocates (human, $100–300/hr) | Expensive, scarce |
| Counterforce Health, Claimable and other 2024–25 AI appeal startups | Early; narrow verticals; the race is on outcome data |
| Provider RCM tools (Waystar, Experian Health) | Serve providers, not patients |

**Differentiation:** a patient-side outcome data flywheel (which arguments win against which insurer for which code) plus a regulatory citation engine.

### Technical feasibility & MVP architecture
- Stack: Next.js + HIPAA-eligible cloud (AWS with a BAA). LLM provider under a BAA (Anthropic, OpenAI and Google all offer HIPAA-eligible configurations). Document AI/OCR → structured extraction → RAG over pgvector corpus → draft → human review flag.
- **Risk:** legal (UPL), accuracy, and HIPAA. **Mitigation:** position the product as document preparation; the user is the author; advocate review is available.
- **MVP:** 12–14 weeks; start with 5 states and the 20 most common denial codes.

---

## Concept 3 — **Strømvett** (HomeVolt)
*An energy co-pilot that optimizes your hourly tariff today and plans your retrofit for the next decade.*

### Problem statement
Households on spot or time-of-use tariffs could cut bills by moving load to cheaper hours (EV charging, water heaters, heat pumps). Most never do. Retrofit decisions (heat pump vs. insulation vs. solar) involve €5–30k and subsidy rules most homeowners never finish reading.

### Solution overview
- **Daily:** connects to the meter or utility API (Elhub/Tibber/Nord Pool prices in Norway, Octopus API in the UK, Green Button in the US) and to smart devices (EV via Smartcar, thermostats via Matter). Forecasts prices and schedules loads.
- **Strategic:** the user photographs the house, the energy label and recent bills. A vision LLM plus a physics-based heat-loss model produces a ranked retrofit plan with subsidy eligibility (e.g. Enova support) and contractor quote checking.
- The AI explains each recommendation in plain language and shows its working (kWh, payback years).

### Business Model Canvas

| **Key Partners** | **Key Activities** | **Value Propositions** | **Customer Relationships** | **Customer Segments** |
|---|---|---|---|---|
| Utilities/retailers, smart-device APIs, installers, banks (green mortgages) | Price forecasting; device scheduling; retrofit modeling | "Save 10–20% on electricity without thinking. Know exactly which upgrade pays back first." | Automated + monthly savings report | Homeowners with EV or heat pump; landlords |
| **Key Resources** | | | **Channels** | |
| Device integrations; savings-verification data | | | Utility white-label, installer referrals, EV owner communities | |
| **Cost Structure** | | | **Revenue Streams** | |
| Integrations; cloud; modest inference | | | **€4.99/mo** consumer; installer **lead fees €50–150**; utility white-label licensing; demand-response revenue share | |

### Target market & GTM
- Nordics + UK + DE homeowners with EV/heat pump number in the many millions. Norway alone has a very high battery-electric share of the car fleet.
- **GTM:** white-label with energy retailers that need differentiation, plus installer lead-gen that monetizes from day one.

### Competitive landscape
Tibber, Octopus (in-house), Ohme, and Homey cover parts of the scheduling. Retrofit advice is fragmented across consultants and calculators. **Differentiation:** daily optimization *and* the retrofit plan in one product, with installer marketplace economics.

### Technical feasibility & MVP architecture
Time-series forecasting (gradient boosting on public spot data) + rules scheduler + vision-LLM house intake + heat-loss calculation (standard degree-day model). **Feasibility: high. Main risk: integrations.** MVP 12 weeks for one market (Norway).

---

## Concept 4 — **Gjeldsguide** (DebtLens)
*Debt triage copilot: photograph every letter, get a ranked plan and ready-to-send letters before fees snowball.*

### Problem statement
People in debt stop opening letters. In collections systems with statutory escalation steps (Norway: inkassovarsel → betalingsoppfordring → legal steps, with fees added at each step), avoidance is expensive. Free debt counseling (NAV in Norway, StepChange in the UK, nonprofit credit counseling in the US) is good but has waiting lists, and it does not open your mail with you at 23:00.

### Solution overview
- The user photographs each letter. A vision LLM extracts creditor, amount, step, deadline and legal basis.
- Ranks debts by **cost of inaction** (fee escalation, enforcement risk), not by size.
- Drafts letters: payment plan requests, disputes of unlawful fees, requests for documentation. It cites the relevant act, e.g. the Debt Collection Act (inkassoloven) in Norway.
- **Shame-free UX.** It never shows the total first. It shows "the next one thing".
- **Warm handoff** to public debt counseling, with an exported case file that cuts intake time.

### Business Model Canvas

| **Key Partners** | **Key Activities** | **Value Propositions** | **Customer Relationships** | **Customer Segments** |
|---|---|---|---|---|
| Municipal/NAV debt counseling, banks' hardship teams, unions, employers | Letter parsing; legal rules per country; letter generation | "Open one letter. Know what to do. Stop the fees." | Empathetic, asynchronous; weekly "one thing" | Indebted adults; financial-hardship employees |
| **Key Resources** | | | **Channels** | |
| Rules engine per jurisdiction; letter templates; trust brand | | | Employers/unions (financial wellness), counseling services, social media | |
| **Cost Structure** | | | **Revenue Streams** | |
| Legal review; inference; security | | | **Free to the indebted user**, always. B2B: employers/unions at $1–2/employee/mo; public-sector licenses for counseling intake; **never** creditor-paid lead-gen (conflict of interest) | |

### Target market & GTM
The user can't pay, so the payer is an employer, union or municipality. Financial stress shows up as lost productivity, which gives HR a business case. GTM: unions and municipal pilots.

### Competitive landscape
Debt management plan providers (often creditor-funded, so conflicted), Cleo/Albert-type budgeting chatbots (US, focused on prevention, not collections), and public counseling (capacity-constrained). **Differentiation:** collections-stage focus, a statutory rules engine, and no creditor money.

### Technical feasibility & MVP architecture
Mobile app + OCR/vision LLM + deterministic rules engine (fees/deadlines must be computed, never generated) + LLM drafting on top of verified facts. **Feasibility: high. Risk: legal accuracy.** Mitigation: rules are maintained by a lawyer, and the LLM is only allowed to phrase what the rules engine has already computed. MVP 10 weeks for Norway.

---

## Concept 5 — **LesLytt** (ReadAloud Coach)
*A patient AI listener for children practicing oral reading, with teacher dashboards.*

### Problem statement
Fluent reading by age 9 strongly predicts later outcomes. Oral reading practice with feedback is one of the best-evidenced interventions, but it needs an adult to listen. Teachers can't do this daily for every child, and parents vary in time and literacy.

### Solution overview
- The child reads a levelled text aloud. Speech recognition tuned for children's voices aligns the audio to the text and detects omissions, substitutions, self-corrections and words correct per minute (WCPM).
- The LLM generates gentle, specific feedback and picks the next text. It can generate decodable texts aligned to the phonics sequence and the child's interests.
- The teacher dashboard shows WCPM trends and error patterns (e.g. "struggles with vowel digraphs").
- Audio is processed and then discarded by default, with explicit parental consent flows (GDPR-K, COPPA).

### Business Model Canvas

| **Key Partners** | **Key Activities** | **Value Propositions** | **Customer Relationships** | **Customer Segments** |
|---|---|---|---|---|
| Schools, municipalities, publishers (licensed texts), literacy researchers | Child-speech ASR tuning; content generation; efficacy studies | "Every child reads aloud to a patient listener daily; teachers see who needs help." | Teacher onboarding; parent weekly summary | Primary schools (B2G); parents (B2C) |
| **Key Resources** | | | **Channels** | |
| Child speech eval set; efficacy evidence; curriculum alignment | | | Municipal procurement, teacher communities, edtech marketplaces | |
| **Cost Structure** | | | **Revenue Streams** | |
| ASR inference (~$0.006/min class pricing); content licensing; research | | | **$4–8/student/yr** school license; **$7.99/mo** family plan | |

### Competitive landscape
Amira Learning (US, strong), Google Read Along (free, limited classroom tooling), Microsoft Reading Coach (bundled), Lexia/IXL (broader platforms). **Differentiation:** non-English and smaller-language markets (Norwegian bokmål/nynorsk, Nordic languages) where incumbents are weak, plus generative decodable texts.

### Technical feasibility & MVP architecture
Whisper-class ASR fine-tuned on consented child speech (the main technical risk: children's ASR error rates are higher) + forced alignment + LLM feedback. **Feasibility: medium-high.** MVP 14–16 weeks, including a data-collection partnership.

---

## Phase 2 summary scorecard

| Concept | Market size | Defensibility | Time to MVP | Regulatory risk | Capital need | Founder-repo fit | **Score /30** |
|---|---|---|---|---|---|---|---|
| **1. Rolig Companion** | 4 | 4 (privacy architecture + outcome data) | 5 (prototype exists) | 3 | 5 | 5 | **26** |
| 2. ClaimPilot | 5 | 4 | 3 | 2 | 3 | 1 | 18 |
| 3. Strømvett | 4 | 3 | 3 | 4 | 3 | 1 | 18 |
| 4. Gjeldsguide | 3 | 4 | 4 | 3 | 4 | 3 | 21 |
| 5. LesLytt | 4 | 4 | 2 | 2 | 3 | 1 | 16 |
