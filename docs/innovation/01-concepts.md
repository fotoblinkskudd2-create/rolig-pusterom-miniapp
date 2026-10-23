# Part 1 — Five AI-Powered Product Concepts

Each concept covers: Problem → Solution → Business Model Canvas → Target Market & GTM → Competitive Landscape → Technical Feasibility & MVP Architecture.

Unit economics are *assumptions* for modeling. Sources for external figures are listed inline.

---

## Concept 1 — Tend · AI care coordination for family caregivers
**Sector:** Healthcare / eldercare · **Lead concept (see Part 3)**

### Problem statement
- **63M** US adults give unpaid care to an adult or a child with complex needs, up from 53M in 2020 (AARP/NAC, *Caregiving in the US 2025*). Most of them care for an aging parent while holding a job.
- The hard part of caregiving is **coordination, more than physical care**. A caregiver juggles 5–10 providers, a changing medication list, discharge papers, insurance letters and siblings who disagree. All of it lives in text threads and someone's head.
- Out-of-pocket spend averages about **$7,200/yr** per caregiver (AARP, 2021). Unpaid care is valued at roughly **$600B/yr** (AARP *Valuing the Invaluable*, 2023).
- **The unmet job:** "Make sure nothing falls through the cracks for Mom, and stop me being the only one who knows everything."

### Solution overview
A shared family "care brain" with three AI layers:
1. **Intake.** Photograph a discharge summary, pill bottle or insurance letter, or record a voice memo after a doctor visit. Multimodal LLMs pull out structured entities (medications, appointments, instructions, deadlines, providers) into a care graph.
2. **Coordination.** An agent turns the entities into tasks, assigns them across the care circle by availability, sends reminders and writes a weekly family digest.
3. **Navigation.** A retrieval-grounded assistant answers "what does this letter mean / what are we entitled to". It draws on a curated benefits corpus (Medicare, Medicaid HCBS waivers, FMLA, GUIDE model, state programs) and cites every source.

**Safety design:** The AI never gives dosing or diagnostic advice. Drug-interaction flags come from a licensed deterministic database, not from the LLM. Red-flag symptoms route to "call the care team / 911" scripts.

### Business Model Canvas

| Key Partners | Key Activities | Value Proposition | Customer Relationships | Customer Segments |
|---|---|---|---|---|
| Employers & benefits brokers; GUIDE-model dementia programs; Area Agencies on Aging; home-care agencies; drug DB licensor (e.g., FDB/Medi-Span); cloud with BAA (AWS Bedrock) | Care-graph extraction quality; benefits-corpus curation; safety review; employer sales | **"One place for everything about Mom's care — and the AI keeps it current."** 3–5 hrs/week saved; fewer missed meds and appointments; less sibling conflict | Self-serve app; weekly digest as habit loop; human "care guide" escalation in premium tier | **B2C:** working adult children (40–65) caring for a parent. **B2B:** employers with 1k+ staff. **B2B2C:** GUIDE participants, Medicare Advantage plans |
| | **Key Resources** | | **Channels** | |
| | Longitudinal care graph; benefits corpus; clinical safety lead; HIPAA-grade infra | | App stores; caregiver communities (Facebook groups, AgingCare, Reddit); hospital discharge planners; HR benefits platforms | |
| **Cost Structure** | | | **Revenue Streams** | |
| LLM inference (~$0.40–0.90/active family/month, *assumption*); drug-DB license; compliance (SOC 2, HIPAA); care-guide labor (premium tier); paid acquisition | | | B2C **$14.99/mo** family plan (unlimited members); B2B **$2–4 PEPM** employer benefit; premium with human care guide **$79/mo**; per-member fees from GUIDE programs | |

**Unit economics (*assumption*):** B2C ARPU $14.99 · gross margin ~85% · blended CAC $70 · monthly churn 4% → LTV ≈ $319 · LTV/CAC ≈ 4.5×. Caregiving episodes average ~4.5 years (AARP 2020), which supports low structural churn.

### Target market & GTM
- **TAM:** 63M US caregivers. **SAM:** ~25M working caregivers of a parent who own smartphones (*assumption* from AARP employment share). **SOM (Y3):** 150k paying families + 40 employer contracts ≈ **$40M ARR** (*assumption*).
- **Wedge:** the hospital-discharge moment. It is the highest-stress event in caregiving and documents arrive in bulk. Run a "Hospital-to-home kit" landing page and SEO on discharge questions.
- **Motion:** consumer-led growth (free tier: 1 care recipient, 3 members). Use the cohort data to sell to employers through benefits brokers.

### Competitive landscape

| Player | Model | Gap Tend fills |
|---|---|---|
| Wellthy, Cariloop | Employer-paid human care concierge | Expensive, human-gated, slow turnaround; not a daily tool |
| CaringBridge | Free journaling / updates | Broadcast only; no tasks, meds or documents |
| ianacare, Carely | Care-circle task apps | Manual entry; little AI; thin document intelligence |
| Honor, Papa | In-home care / companionship marketplaces | Supply businesses, not coordination software |
| EHR portals (MyChart) | Per-health-system record | Siloed per system, patient-centric, no family coordination |

**Differentiation:** Tend is the first **AI-native, document-first** care graph that is *family-centric* (many caregivers, one recipient) and *cross-provider*.

### Technical feasibility & MVP architecture
- **Feasibility: high.** Document extraction, summarization and task generation are mature LLM capabilities. Accuracy risk is handled by structured outputs, human confirmation of every extracted medication, and deterministic interaction checks.
- **MVP stack:** Expo (iOS/Android/Web) → API (TypeScript, Hono on Fly.io/AWS) → Postgres with row-level security per care circle → LLM via AWS Bedrock (Claude Sonnet 5.5 for extraction/reasoning, Haiku 5.5 for classification/digests; HIPAA-eligible under BAA) → object storage (S3, KMS-encrypted) → RxNorm normalization plus licensed interaction DB → push/SMS (Twilio).
- **Full spec in Part 3.**

---

## Concept 2 — Ledger · AI copilot for household debt and paperwork
**Sector:** Fintech / productivity

### Problem statement
- US household debt hit **$18.4T** in Q2 2025, with credit cards at **$1.21T** (NY Fed Household Debt & Credit Report). Serious delinquency on cards and student loans rose through 2025.
- In Norway the debt registry (Gjeldsregisteret) shows persistent unsecured consumer debt despite 2019 regulation. Debt-collection letters (*inkasso*) and public-benefit letters (NAV) carry legal deadlines that people miss.
- Distressed households face **administrative overload**: letters in legal language, deadlines, creditors who will negotiate but only if asked correctly, and the shame that stops people opening envelopes.
- **The unmet job:** "Tell me what this letter means, what I can do and by when, then help me do it."

### Solution overview
1. **Letter decoder.** Photograph any financial or official letter. The LLM gives a plain-language summary, the deadline, the amount, legal status (e.g., *betalingsoppfordring* vs *inkassovarsel*), the options, and the consequence of doing nothing.
2. **Debt map.** Aggregate obligations through open banking (PSD2 in the EU; aggregators such as Plaid/MX in the US) plus the debt registry. Optimize payoff (avalanche/snowball plus hardship programs).
3. **Negotiation drafts.** Generate hardship, payment-plan and dispute letters from templates grounded in jurisdiction-specific law (FDCPA/Reg F in the US; *inkassoloven* in Norway). The user always reviews and sends. No autonomous submission in the MVP.

### Business Model Canvas

| Key Partners | Key Activities | Value Proposition | Customer Relationships | Customer Segments |
|---|---|---|---|---|
| Open-banking aggregators; nonprofit credit counselors (NFCC members); municipal debt advisers (NAV økonomisk rådgivning); banks (early-delinquency programs) | Jurisdictional legal corpus; letter-template QA; partner integrations | **"Open the envelope without fear."** Deadlines never missed; $ saved through negotiated plans; time saved on paperwork | App plus warm handoff to human counselors; weekly "money calm" digest | Households with ≥2 delinquent obligations; gig/variable-income workers; banks' early-delinquency segment (B2B) |
| | **Key Resources** | | **Channels** | |
| | Legal template library; outcome data (which letters work) | | Bank partnerships (white-label); counselor referrals; TikTok/YouTube finance creators; SEO on letter types | |
| **Cost Structure** | | | **Revenue Streams** | |
| LLM + OCR inference; aggregator fees (~$0.30–1.50/connected user/mo); legal review; compliance | | | Freemium decoder; **$7.99/mo** Pro; **bank white-label** ($0.50–1.50 per eligible customer/mo); success-share on negotiated savings only where lawful | |

**Unit economics (*assumption*):** Pro ARPU $7.99 · GM ~75% · CAC $25 (high organic share from letter-type SEO) · churn 7%/mo → LTV ≈ $86 · LTV/CAC ≈ 3.4×. The B2B white-label drives the real economics: banks gain from lower charge-offs.

### Target market & GTM
- **TAM:** ~40M US adults with a delinquent account (*assumption* from NY Fed/CFPB ranges) plus ~1M Nordic adults with registered debt problems (*assumption*).
- **Wedge:** the free "what does this letter mean?" decoder, one page per letter type, for organic search. Upsell to the debt map.
- **B2B:** pilot with one regional bank's collections team, measured on cure rate at 60/90 days.

### Competitive landscape

| Player | Gap |
|---|---|
| Rocket Money, Trim | Subscription and bill negotiation; not built for delinquency or legal letters |
| Tally (shut down 2024), Cushion (wound down) | Showed that lending-adjacent or fee-recovery models are fragile, so Ledger stays software- and partner-led |
| Upsolve | Free bankruptcy filing; serves the end-state, not early intervention |
| NFCC counselors / NAV advisers | High quality but capacity-constrained with waitlists. Ledger is the triage layer that feeds them |

### Technical feasibility & MVP architecture
- **Feasibility: medium.** Letter understanding is strong. The risks are **regulatory**: UDAAP, the unauthorized-practice-of-law line, Norway's Finance Contracts Act. Liability from a wrong deadline is also a risk. Mitigation: deterministic deadline rules per letter type, the LLM only extracts and explains, and every legal claim cites a template plus a source.
- **Stack:** Expo app → on-device OCR (Apple Vision / ML Kit) → server LLM (Claude Sonnet 5.5, structured JSON output) → rules engine (jurisdiction × letter type → deadline/options) → Postgres → aggregator APIs.

---

## Concept 3 — Readwell · Voice-based AI reading tutor for K–3
**Sector:** Education

### Problem statement
- **40%** of US 4th graders scored *below NAEP Basic* in reading in 2024, the worst level in decades (NAEP 2024).
- One-to-one oral reading practice is the most effective intervention, and teachers can't give 25 children daily individual listening time. Parents don't know how to correct decoding errors.
- **The unmet job:** "Listen to my child read every day, correct them kindly, and tell me exactly what they need."

### Solution overview
- The child reads aloud from leveled, decodable texts. **Child-tuned ASR** aligns speech to text at word and phoneme level. It flags miscues (substitution, omission, self-correction) and gives immediate, gentle prompts grounded in the science of reading: "Look at the first sound…".
- An LLM generates **decodable stories personalized** to the child's interests and current phonics scope-and-sequence position, constrained by allowed grapheme–phoneme correspondences. A deterministic validator checks every story.
- Parents and teachers get a weekly skill map (phonemic awareness → phonics patterns → fluency WCPM).

### Business Model Canvas

| Key Partners | Key Activities | Value Proposition | Customer Relationships | Customer Segments |
|---|---|---|---|---|
| Children's ASR vendors or open models fine-tuned on child speech; curriculum publishers; districts; literacy nonprofits | Child-speech ASR accuracy; decodable-text generator plus validator; efficacy studies (ESSA evidence tiers) | **"A patient reading tutor, every day, for the price of a book."** Measurable WCPM gains; teacher time saved | Gamified daily sessions (10 min); parent weekly report; teacher dashboard | **B2C:** parents of 5–8 year olds. **B2B:** K–3 classrooms, tutoring orgs, districts (Title I funds) |
| | **Key Resources** | | **Channels** | |
| | Labeled child-speech data; efficacy evidence | | App stores; teacher-influencer channels; district procurement via ESSA evidence | |
| **Cost Structure** | | | **Revenue Streams** | |
| ASR compute (streaming); story generation; COPPA/FERPA compliance; efficacy research | | | B2C **$12.99/mo** or $89/yr; district **$15–25 per student/yr** | |

**Unit economics (*assumption*):** B2C ARPU ~$9/mo blended · GM ~80% · CAC $45 · churn 6%/mo → LTV ≈ $120 · LTV/CAC ≈ 2.7×. B2C alone is weak. District contracts (high retention, annual) are the path.

### Target market & GTM
- ~15M US children in K–3 (*assumption* from NCES enrollment). Consumer launch to collect data and testimonials, then a district pilot that produces an ESSA Tier 3 → Tier 2 evidence package.

### Competitive landscape

| Player | Gap |
|---|---|
| Amira Learning | Strong district product; less parent/home-first; heavier implementation |
| Ello | Consumer AI reading coach with physical books; Readwell differentiates with generated interest-based decodables and a teacher layer |
| Microsoft Reading Coach, Google Read Along | Free and good; limited phonics diagnostics and parent insights. **Price pressure is the main risk** |
| Curriculum Associates (acquired SoapBox Labs child-ASR, 2024) | Incumbent with child-speech tech; validates the category, raises the bar |

### Technical feasibility & MVP architecture
- **Feasibility: medium.** General ASR (Whisper-class) degrades on child speech. You need fine-tuning on consented child speech or a licensed child-ASR model. Without it, false miscue flags will frustrate kids. Story generation with a decodability validator is straightforward.
- **Stack:** iPad-first Expo app → streaming ASR (fine-tuned Whisper/Parakeet on GPU or licensed vendor) → forced alignment → miscue classifier → LLM story generator (Haiku 5.5) plus grapheme validator → Postgres (COPPA: verifiable parental consent; no audio retention by default).

---

## Concept 4 — Rolig · Local-first AI stress micro-coach
**Sector:** Mental health / human connection · *Evolution of this repository's mini-app*

### Problem statement
- Stress and low mood are common, and most people won't open a therapy app when they need it. They want **90 seconds of relief, now, privately**.
- Retention is the category's structural problem. The median mental-health app keeps **~3.9% of users at day 15 and ~3.3% at day 30** (Baumel et al., *JMIR* 2019). Woebot closed its consumer app in mid-2025, which shows how hard the economics are.
- Trust matters too: people don't want their feelings in a cloud log.
- **The unmet job:** "Help me come down from this moment without making me feel like a patient or a data point."

### Solution overview
- Check in (mood 1–5 plus an optional note). Breathing room. One small, concrete action. History stays on the device. This is today's `index.html`.
- **The AI layer runs entirely on-device.** Apple's Foundation Models framework (iOS 26, ~3B-parameter on-device model, free inference) or Gemini Nano on Android:
  - reads the check-in note and picks the most fitting micro-intervention from a clinician-reviewed library (it does not generate therapy);
  - writes a two-sentence reflection in the user's own words;
  - spots a weekly pattern ("Mondays after 15:00") *locally*.
- **Isolation Mirror** (in the repo): a private visual-reflection mode with no uploads.
- Crisis language triggers a deterministic safety screen with local helplines (Norway: Mental Helse 116 123; US: 988).

### Business Model Canvas

| Key Partners | Key Activities | Value Proposition | Customer Relationships | Customer Segments |
|---|---|---|---|---|
| Psychologists for intervention library; employers/occupational health (*bedriftshelsetjeneste*); municipalities; student welfare orgs (SiO etc.) | Intervention library curation; on-device prompt engineering; privacy engineering | **"Ninety seconds of calm. Nothing leaves your phone."** | Zero-account, zero-shame; gentle streak-free design | Stressed working adults and students 18–40; Nordic employers and student unions (B2B) |
| | **Key Resources** | | **Channels** | |
| | Privacy brand; local-first architecture | | App Store; student welfare orgs; employer wellbeing programs | |
| **Cost Structure** | | | **Revenue Streams** | |
| Near-zero inference (on-device); content and clinical review; small team | | | **$3.99/mo / $29/yr** Plus (extra programs, export, widgets); **B2B site licenses** (NOK 20–40 per employee/yr) with aggregate-free reporting (only installs/opt-in counts) | |

**Unit economics (*assumption*):** ARPU ~$2.50/mo blended · GM ~95% (no inference cost) · CAC must stay < $10 · churn 12%/mo → LTV ≈ $20. **This is only viable with B2B distribution or as a founder's low-cost wedge**, which is why it scores below Tend.

### Competitive landscape

| Player | Gap |
|---|---|
| Calm, Headspace | Content libraries, cloud accounts, subscription-heavy; not "in the moment" |
| Wysa | AI chat (cloud); clinical positioning |
| Finch | Gamified self-care; strong retention mechanics; cloud |
| Apple Health State of Mind (iOS 17+) | Free logging, no intervention. A platform risk and an integration opportunity |

**Differentiation:** real local-first AI with no account, Nordic-calm design, and micro-interventions instead of content libraries.

### Technical feasibility & MVP architecture
- **Feasibility: very high.** v1.1 already exists as pure HTML/localStorage. Next step: wrap it as a PWA, then a native SwiftUI shell calling `FoundationModels` (`LanguageModelSession` with `@Generable` structured output) for intervention selection. Fallback to a rules engine on devices without Apple Intelligence.

---

## Concept 5 — Retrofit · AI home energy-renovation planner
**Sector:** Climate / proptech

### Problem statement
- Buildings use ~40% of EU energy. The recast **EPBD (Directive (EU) 2024/1275)** requires average residential primary-energy use to fall **16% by 2030** and **20–22% by 2035**, with the worst-performing buildings tackled first.
- Homeowners stall at the first step. They don't know what to do first, what it costs, which subsidies apply (Enova in Norway, KfW/BEG in Germany, MaPrimeRénov' in France), or which contractor to trust. Energy audits cost €300–1,000 and take weeks.
- In the US, the federal 25C/25D residential credits end after 2025 (2025 budget reconciliation law), so focus on the EU/Nordics.
- **The unmet job:** "Tell me the 3 upgrades that matter for *my* house, what they cost after subsidies, and who can do them."

### Solution overview
- A **15-minute phone scan.** Apple RoomPlan (LiDAR) or a photo walkthrough gives floor area and window inventory. Multimodal LLM reads the meter and heat-pump labels. Optional smart-meter data (Elhub in Norway; utility APIs elsewhere).
- A **physics-informed model** (simplified ISO 52016 / degree-day calculation, calibrated on consumption data) ranks measures by €/kWh saved and payback. The LLM explains the result but does not compute it.
- A **subsidy engine** (rules per country/region) and a contractor marketplace with standardized scopes.

### Business Model Canvas

| Key Partners | Key Activities | Value Proposition | Customer Relationships | Customer Segments |
|---|---|---|---|---|
| Utilities; banks (green mortgages); installers (heat pumps, insulation, windows); subsidy agencies | Energy-model calibration; subsidy rules; installer network quality | **"Your renovation roadmap in 15 minutes, with real prices after subsidies."** | Self-serve plan, then human energy adviser for projects > €10k | Owner-occupiers of pre-1990 homes; banks and utilities (B2B lead-gen and portfolio EPC uplift) |
| | **Key Resources** | | **Channels** | |
| | Calibrated model; subsidy database; vetted installers | | Utility and bank white-label; SEO on subsidy queries; real-estate transactions | |
| **Cost Structure** | | | **Revenue Streams** | |
| Installer vetting/ops; model R&D; customer acquisition (high) | | | Free plan; **installer referral fees 3–8%** of project value; **bank/utility SaaS** (€1–3 per customer analyzed) | |

**Unit economics (*assumption*):** average project €12k × 5% take × 12% plan-to-project conversion ≈ €72 revenue per plan; CAC per plan €20 via partner channels → healthy but **ops-heavy** marketplace economics.

### Competitive landscape

| Player | Gap |
|---|---|
| Enpal, 1KOMMA5°, Otovo | Sell their own hardware (solar, heat pumps); not neutral whole-home planning |
| Octopus Energy | Vertical utility plus installer; strong in UK and Germany; Retrofit is the neutral layer for other utilities |
| Sealed, Rewiring America (US) | US-focused; policy tailwind weakened |
| Traditional energy auditors | Accurate but slow and expensive; Retrofit triages and hands them the complex cases |

### Technical feasibility & MVP architecture
- **Feasibility: medium.** Scanning and LLM explanation are mature. The real moat and risk is **model calibration accuracy** (±20% target) and installer-ops execution.
- **Stack:** native iOS (RoomPlan requires LiDAR; photo fallback) → Python energy-model service → subsidy rules engine (versioned YAML per region) → LLM (Sonnet 5.5) for explanation and document reading → Postgres/PostGIS → installer CRM.
