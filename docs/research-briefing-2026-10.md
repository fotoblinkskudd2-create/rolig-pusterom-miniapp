# R&D-briefing: Local-first stress-regulation micro-apps (Rolig Pusterom)

**Date:** 24 October 2026 · **Intended use:** internal strategy development for the Rolig Pusterom roadmap (version 1.1 to 2.0). This is not investor material and not legal advice.
**Domain:** consumer digital self-help for everyday stress and low mood: guided breathing, mood check-ins and micro-actions, delivered as a single-file, no-account web app. Primary market Norway/EU, US as a reference jurisdiction.

> **Field note (voice, not evidence).** I'm sitting with `index.html` open. A circle that swells for 4 seconds, holds for 2 and shrinks for 6. That's the whole product. Out there, an $8-billion market is screaming for "engagement", while the only independent study that actually measured breathing apps found median day-30 retention of **0.0 %** [S7]. Zero. Not low. Zero. So the question isn't whether the circle works (it does, a bit [S5][S6]). The question is whether anyone comes back to it. Everything below is about that question, with a source on every claim.

**Labels used throughout:** **[F]** = established fact with a cited source · **[I]** = inference (reasoning stated) · **[E]** = estimate (basis stated) · **[S]** = speculative idea.

---

## 1. Executive Summary

- **The evidence for the core mechanism is real but modest.** A meta-analysis of 12 RCTs found small-to-medium effects of breathwork on self-reported stress (g ≈ −0.35), anxiety and depression [F, S5]. A one-month RCT found that 5 minutes of daily exhale-weighted "cyclic sighing" improved mood more than mindfulness meditation [F, S6]. Rolig's current 4-2-6 pattern is already exhale-weighted (the code uses 4 s inhale, 2 s hold, 6 s exhale) [F, `index.html`].
- **The real bottleneck is retention, not efficacy.** Median 15-day retention for mental health apps is 3.9 %. For breathing apps, median day-30 retention is 0.0 %, below that of tracker apps (6.1 %) and meditation apps (4.7 %) [F, S7].
- **The market is large, unevenly reported, and shifting towards B2B.** Vendor estimates put mental health apps at about USD 8.0–8.5 billion in 2025 [F, S8–S10], but with wide spread between vendors. The leading consumer players saw revenue fall in 2023 and are moving to employer and insurer channels [F, S11–S13].
- **Patents are a weak tool here; trust is a strong one.** Guided-breathing UIs are a crowded prior-art field (e.g. Apple US 12,217,620, granted 4 Feb 2025) [F, S14]. Local-first operation with no account is a differentiator that is easy to verify and hard for cloud players to copy [I].
- **AI cannot be an inventor in any of the major jurisdictions** (US, EPO, UK, DE, JP). AI-assisted inventions are patentable if a human made a significant contribution to conception [F, S16–S21]. For Rolig, this means the Labben/Isolation Mirror workflow must document human contribution if anything is ever to be filed.
- **Generative AI as a "therapist" is a red zone.** Documented safety failures [F, S27], a state-level ban on autonomous AI therapy (Illinois, Aug 2025) [F, S25], and Woebot's consumer shutdown citing FDA costs [F, S24]. A constrained, on-device, non-therapeutic AI is the only defensible path [I].
- **Top 3 recommendations** (details in §7): (1) build retention around *triggers*, not streaks, with a measurable day-30 target; (2) make "zero network traffic" technically provable (CSP + open source) and use it as the product promise; (3) publish a defensive disclosure instead of patenting the breathing mechanics.

---

## 2. Scope & Method

**Key questions**
1. Which inventions and patents define the field, and what does that mean for freedom-to-operate (FTO) for Rolig?
2. Can AI-assisted ideas (Labben/Grok-bot workflow) be patented, and in which jurisdictions?
3. Which design and development methods fit a one-person, local-first project?
4. Market size, segments, competition, drivers and barriers, especially in Norway.
5. Which AI architectures are useful, and where do they fail?
6. Which concrete white spaces exist?

**Method.** Desk research, 24 Oct 2026: web search against court decisions, patent office and authority pages, peer-reviewed literature, law-firm commentary and market reports. A code review of this repo (`index.html`, `isolation-mirror.html`, `HULL.md`, `RUN.md`) anchors the recommendations in the actual product.

**Source types and quality**

| Type | Examples | Reliability |
|---|---|---|
| Court decisions / authorities | UKSC, BGH, IP High Court Japan, EPO, USPTO, FDA | High (some read via law-firm summaries; see caveats) |
| Peer-reviewed research | Sci Rep 2023, Cell Rep Med 2023, JMIR 2019, FAccT 2025 | Medium–high (single studies, small samples) |
| Patent documents | USPTO publications | High as documents; claim scope not legally assessed |
| Market reports | GMI, TBRC, Roots, Market.us, Mordor | **Low–medium**: paywalled, methods unknown, large spread |
| Industry news / app analytics | Appfigures, STAT, MobiHealthNews | Medium; estimates |

**Evidence gaps (stated up front)**
- No Norway-specific market size for stress or breathing apps was found. Section 5 uses a clearly labelled estimate.
- No Norwegian court decision or Patentstyret practice on AI inventors was found. The Norwegian position is inferred from EPC membership [I].
- The Fincham, Balban and Stanford figures are partly read via secondary summaries. Verify against the original articles before external use.
- No independent retention data newer than 2019 was found for breathing apps specifically.
- No FTO analysis by a patent attorney has been done. §3 is a screening, not a clearance.

---

## 3. Inventions & Patent Landscape

### 3.1 Notable inventions and techniques (existing → emerging)

| Invention / technique | Status | What it means for Rolig |
|---|---|---|
| Visual paced breathing (expanding/contracting element) | Mature; patented in variants, e.g. Apple US 12,217,620: breath ratio from a "breathing profile" plus a fluctuating UI element [F, S14] | Rolig's circle is in this category. See FTO below. |
| Haptic breathing guidance from smartphone to wearable | Granted, e.g. US 12,296,108 [F, S14] | Relevant only if Rolig adds vibration or watch support. |
| Breath measurement + adaptive exercise | Granted, e.g. "System for measuring breath and for adapting breath exercises" US 12,676,225 [F, S14] | Blocks the obvious path to "adaptive pace". Read the claims before building. |
| Exhale-weighted protocols (cyclic sighing) | Scientific method, published 2023 [F, S6] | Methods published in the literature are prior art and free to use [I]. |
| GenAI conversation agents for mental health | No GenAI device FDA-authorised for any clinical purpose (as of Nov 2025) [F, S26] | High regulatory risk; see §6. |

### 3.2 Patent trends
- GenAI patents are growing explosively: more than 56,000 new GenAI patent families were published in 2024–2025, more than in all of 2014–2023 combined. China dominates by volume [F, S22, S23].
- **[I]** For an app in the "AI + wellness" field, this means rising density of third-party patents on generic AI features (e.g. LLM-based coaching), and increasing FTO risk the more Rolig uses standard AI patterns.

### 3.3 Freedom-to-operate and prior art (screening)
- **Current product (fixed 4-2-6 rhythm, CSS animation, no sensors):** **[I]** Low assumed risk. Fixed pacing with a pulsing figure has been widespread for many years, and Apple's claims (per the abstract) involve a breath ratio derived from a breathing profile [S14]. This is an inference from abstracts, not a claim analysis.
- **Planned features that raise risk:** an adaptive rhythm based on measured breathing or heart rate (cf. US 12,676,225), haptic synchronisation (US 12,296,108), and a UI that sets the ratio from a user profile (US 12,217,620) [F on the existence of the patents, I on the risk].
- **Action:** before building any adaptive or sensor feature, order a targeted FTO search for NO/EP/US. Budget: **[E]** a few working days of patent attorney time. This is an assumption; get a quote.

### 3.4 Patentability of AI-generated and AI-assisted inventions

**Main rule across all jurisdictions examined: only natural persons can be inventors. AI is a tool.**

| Jurisdiction | Key decision / rule | Status | Practical consequence |
|---|---|---|---|
| **USA** | *Thaler v. Vidal* (Fed. Cir. 2022): inventor = natural person [F, S16]. USPTO revised guidance (late Nov 2025) rescinded the Feb 2024 guidance. The traditional *conception* test now applies; the Pannu factors apply only between multiple humans; claims based solely on AI inventorship are not accepted [F, S17] | Applicable | A human must have conceived the claimed invention. Keep logs. |
| **USA (eligibility)** | *Ex parte Desjardins* (ARP, Sept 2025, precedential Nov 2025): ML improvements can be a "practical application" under §101 [F, S18] | Applicable in USPTO examination | Easier to get ML architecture claims through examination; courts are not bound by it. |
| **EPO** (incl. Norway as an EPC state) | J 8/20 and J 9/20 (oral proceedings 21 Dec 2021): designated inventor must be a human being [F, S19] | Established | A human user can be named. |
| **UK** | *Thaler v Comptroller* [2023] UKSC 49 (20 Dec 2023): DABUS is not an "inventor" [F, background knowledge, widely documented]. *Emotional Perception* [2026] UKSC 3 (11 Feb 2026): Aerotel abandoned, EPO "any hardware"/Comvik adopted for ANN inventions [F, S20] | Established | The UK now aligns with the EPO on software and ANN claims. |
| **Germany** | BGH X ZB 5/22 (11 June 2024): only natural persons. A human can be named even if the AI made the main contribution [F, S21] | Established | Commentators disagree on whether an "AI was used" addendum is harmless [S21]. |
| **Japan** | IP High Court, 30 Jan 2025: inventor = natural person. The policy question is referred to the legislature (IP Strategic Program 2025) [F, S15] | Established; legislation possible | Watch for amendments. |
| **Norway** | No specific decision found. **[I]** Norway is bound by the EPC, and Norwegian practice will most likely follow J 8/20 | Uncertain | Assume a human inventor is required. |
| **Copyright (US)** | *Thaler v. Perlmutter*: D.C. Cir. 18 Mar 2025; certiorari denied 2 Mar 2026. Human authorship is required [F, S28] | Established | AI-generated images and text in the app may not be protected. |

**Legal uncertainties that remain**
1. **Threshold for "significant contribution"** when AI does most of the work. The USPTO has dropped its examples, so there is less guidance [F, S17]. How courts will assess this is uncertain [I].
2. **Disclosure duty:** whether and how AI use must be described differs, and the German commentary disagrees on addenda [F, S21].
3. **Legislative change:** Japan has put this on the political agenda [F, S15]. Similar processes elsewhere are possible [S].
4. **Inventive step against AI-generated prior art:** as AI floods the literature with publications, the bar for "obvious" may rise [S]. No decisions found.

**For Rolig specifically:** the Labben/Grok-bot prompts ("Seed 7. Drepe minst 3", i.e. seed 7 ideas and kill at least 3) produce idea candidates. **[I]** If an idea is ever filed, the human selection, modification and concrete technical solution must be documented with a date, because the AI output on its own gives no basis for inventorship.

---

## 4. Design & Product Development

### 4.1 User-centred methods (adapted to a one-person team)
| Method | Concrete use in Rolig | Basis |
|---|---|---|
| "60 seconds for a stranger" test | Already done (`HULL.md`): found nav bug, missing privacy statement, `alert()` | [F, repo] |
| Experience sampling | Measure mood before/after each breathing session in the app (1–5), stored locally | [I] Mirrors Balban's daily-survey design [S6] |
| Diary study, 2 weeks, 5–8 users | Recruit via a student network; look for *when* people would want a calm-down moment | [I] |
| Accessibility review | `user-scalable=no` in the viewport blocks zoom, which is a WCAG problem | [F, `index.html`]; [I] fix it |
| Safety design | Crisis route always visible: Mental Helse 116 123, Kirkens SOS 22 40 00 40 | [I] Standard practice; verify the numbers before release |

### 4.2 Prototyping
- **Current level:** working hi-fi prototype in plain HTML/JS with localStorage [F, repo].
- **Next step:** a PWA (manifest + service worker) for offline use and a home-screen icon. `HULL.md` already lists this as missing [F].
- **Small technical observation:** the CSS `transition` is 4 s, while the exhale phase lasts 6 s, so the circle stops shrinking 2 s before the text changes [F, code]. Fix it so the animation follows the phase (one-line change).

### 4.3 Feasibility (TELOS, short version)
| Dimension | Assessment |
|---|---|
| Technical | High. No backend, no dependencies [F, repo] |
| Economic | Very low operating cost (static hosting) [I]. Revenue is uncertain (§5) |
| Legal | Low as long as only general wellness claims are made (outside the MDR) [F, S29]; see §8 |
| Operational | Vulnerable: one person, no test pipeline [I] |
| Schedule | PWA + measurement in 1–2 weeks [E, based on code size ~11 kB HTML] |

### 4.4 Go-to-market
- **B2C first** (organic, no marketing budget): weak on its own given retention data [I, S7].
- **B2B2C** (student welfare organisations, municipal low-threshold services, occupational health): this is where the market is moving. Headspace via Cigna to 7 million people from Jan 2026, Calm Health in the Solera network [F, S12, S13].
- **[I]** Rolig's no-account, no-data model is particularly easy to approve for public buyers (no data processing agreement needed when no personal data leaves the device). This should be verified with a legal adviser or the Norwegian Data Protection Authority's guidance.

---

## 5. Market Analysis

### 5.1 Size and growth
| Segment | 2025 estimate | Growth (CAGR) | Source |
|---|---|---|---|
| Mental health apps, global | USD 8.03–8.54 billion | 14–17 % | [F, S8–S10] |
| Mental health apps (low estimate) | USD 4.2 billion (2024) | 19.6 % | [F, S10b], outlier |
| Meditation apps | USD 2.1–5.7 billion | n/a | [F, S11] large spread |

**Interpretation [I]:** the spread (factor ~2–3) shows differing definitions. Use the numbers only as an order of magnitude, never in external materials without the original reports.

### 5.2 Norway: estimate
- **[F, S30]** FHI: around 40 % of women and 25 % of men aged 18–79 reported mental health complaints in 2023–2024; around 60 % of women and 40 % of men aged 20–29.
- **[E]** If ~4.2 million Norwegians are aged 18–79 (an assumption based on a total population of ~5.6 million; check against SSB) and ~32 % have complaints (the average of 40/25), that gives **~1.3 million adults with complaints**, the theoretical target group. Willingness to pay is unknown and no source was found. Do not use this as a revenue estimate.

### 5.3 Segments
1. Young adults and students (20–29), with the highest prevalence [F, S30]. Primary segment [I].
2. Employees through occupational health, the B2B trend [F, S12, S13].
3. People who actively avoid cloud services and accounts (privacy-conscious users). Size unknown [S].

### 5.4 Competitive landscape
| Player | Position | Signal |
|---|---|---|
| Calm, Headspace | Consumer leaders moving to B2B | 2023 revenue estimates fell to ~USD 77 m and 49 m; layoffs in 2023 [F, S11] |
| Woebot | Rules-based chatbot | Consumer app shut down 30 Jun 2025 [F, S24] |
| Apple (Breathe/Mindfulness) | Built into the OS, free | Patented UI [F, S14]; **[I]** sets a free baseline |
| General-purpose chatbots | De facto used for emotional support | Safety failures documented [F, S27] |

### 5.5 Drivers and barriers
- **Drivers:** high prevalence [S30], waiting lists [I], cheap distribution, B2B purchasing [S12, S13].
- **Barriers:** very low retention [F, S7], a free OS baseline [I], privacy distrust (the FTC fined BetterHelp USD 7.8 m in 2023 for sharing health data [F, background knowledge]), and regulatory risk as soon as there are health claims [F, S29].

---

## 6. AI Systems & AI Inventions

### 6.1 Relevant architectures
| Architecture | Use in Rolig | Capability | Limitation |
|---|---|---|---|
| Large cloud LLMs (Grok, Claude etc.) | Ideation in Labben (as today) | Broad idea generation | Hallucination, no clinical safety [F, S27]. Sending user text to the cloud breaks the local-first promise [I] |
| Small on-device LLMs (WebGPU in the browser) | Optional reframing of a journal note, offline | Privacy kept [I] | Weaker quality, large download, varying device support [I] |
| Classical rules/scripts | Choosing "small steps", crisis routing | Predictable, testable | Rigid |
| Signal processing / ML on sensor data (HRV, breathing via microphone) | Adaptive pace | Personalisation | Patent-dense [F, S14], measurement uncertainty [I] |

### 6.2 Documented limitations in mental health
- LLMs showed stigma (e.g. GPT-4o in ~38 % and Llama 3.1-405B in ~75 % of the test responses) and mishandled suicidal ideation, e.g. by giving bridge heights to a user in crisis [F, S27].
- FDA DHAC (6 Nov 2025): hallucination, drift and monitoring of suicidal ideation were the main concerns; no GenAI device was authorised for any clinical purpose [F, S26].
- Illinois HB 1806 (Aug 2025) bans AI that makes independent therapeutic decisions; publicly available self-help is exempted [F, S25].
- EU AI Act: the transparency duties in Art. 50 apply from 2 Aug 2026; the omnibus deal (May 2026) postpones high-risk obligations to Dec 2027 / Aug 2028 [F, S31]. Final adoption could not be confirmed [S31].

### 6.3 AI in invention and R&D workflows
- **[F, S22, S23]** GenAI is now a large share of patent activity (8.7 % of AI patent families).
- **Caution:** the much-cited claim that AI increased materials discoveries and patent filings in an R&D lab is based on a preprint that MIT stated in May 2025 it had "no confidence" in [F, S32]. **[I]** Robust evidence that AI raises the *quality* of inventions is thinner than the hype suggests.
- **[I]** For Rolig, Labben works as a divergent idea generator. The value comes from the human kill and selection step, which is also what gives a basis for inventorship [S17].

---

## 7. Opportunities & Recommendations

| # | Opportunity | Novelty | Feasibility | Risk | Label |
|---|---|---|---|---|---|
| 1 | Trigger-based retention | Medium | High | Low | [I] |
| 2 | Provable zero-network app | Medium–high | High | Low | [I] |
| 3 | 5-minute "Sukk" protocol (cyclic sighing) with personal before/after measurement | Low (method published) | High | Low | [I] |
| 4 | Defensive publication instead of patents | n/a | High | Low | [I] |
| 5 | B2B2C pilot with a student welfare organisation | Low | Medium | Medium | [I] |
| 6 | On-device "reflection mirror" with no therapy role | Medium | Low–medium | **High** | [S] |
| 7 | Inventor log for the Labben workflow | Low | High | Low | [I] |

**1. Trigger-based retention (do first).**
*Why:* breathing apps lose almost everyone by day 30, and trackers retain better [F, S7]. *What:* (a) a PWA with a home-screen icon and an app shortcut straight to "Pust nå" (Breathe now); (b) "If–then" plans in the check-in ("If I get stressed before a lecture, then I open Pusterom"); (c) combine breathing with tracking (mood before and after), since trackers performed better [S7]. *Metric:* local, anonymous day-30 return indicator shown to the user themselves. Target: beat the tracker benchmark of 6.1 % in a pilot with ≥30 users [E, the target is chosen relative to S7].

**2. Make "Alt blir på denne enheten" (everything stays on this device) technically provable.**
*What:* add `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'none'">` so the browser blocks all network calls. Publish the source code and a one-page "how to verify" guide (DevTools → Network). *Why:* trust is the main barrier after the BetterHelp case [F], and a no-account model can't be copied by competitors whose business model requires data [I]. *Note:* the link to Labben/Grok happens through copy/paste the user does themselves. Say so explicitly.

**3. "Sukk" mode: 5 minutes of cyclic sighing.**
*What:* a new rhythm with a double inhale and a long exhale, a fixed 5 minutes, and a mood check before and after. *Basis:* the only RCT with this exact protocol showed better mood than mindfulness [F, S6]. *Caveat:* a single study; one author has a commercial profile [S6]. Avoid health claims (§8).

**4. Defensive publication of Rolig's design.**
*What:* publish a dated technical description (in this repo, plus e.g. a defensive publication service) of the combination: fixed exhale-weighted rhythm + local check-in + before/after measurement + export, with no network. *Why:* patenting is expensive, the field is crowded [S14], and the goal is to avoid being *blocked*, not to block others [I].

**5. B2B2C pilot.**
*What:* offer the app free to one student welfare organisation or one municipal low-threshold service for 8 weeks; measure use via voluntary local export. *Basis:* the B2B trend [F, S12, S13] and the highest prevalence among 20–29-year-olds [F, S30]. *Risk:* the buyer may want aggregated data, which conflicts with local-first [I]. Decide the principle up front.

**6. Isolation Mirror 2.0 with an on-device model (speculative, only after 1–4).**
*What:* an optional local model that suggests *one* true sentence back to the user, with no diagnosis, no advice and no conversation. Hard-coded crisis routing. *Risk:* high. Documented LLM failures [S27], Illinois-style regulation [S25], AI Act Art. 50 disclosure [S31]. **Decision criterion:** go ahead only if the feature can be described as self-help material with no therapeutic role, and after testing against crisis prompts like those in S27.

**7. Inventor log.**
*What:* a `LABBEN-LOGG.md` with columns for date, AI prompt, AI output, human decision/change, and the resulting technical solution. *Why:* the USPTO now requires a human conception contribution [F, S17], and EPO/DE require a human inventor [F, S19, S21].

---

## 8. Risks & Caveats

| Risk | Description | Mitigation |
|---|---|---|
| **Regulatory (MDR)** | Claims such as "treats anxiety" or "prevents depression" can make the app medical device software (Rule 11, Class IIa+); Rev. 1 of MDCG 2019-11 adds prevention software [F, S29] | Use only general wellbeing language ("a moment of calm"); have the wording reviewed |
| **Clinical safety** | Users in crisis may meet a breathing app instead of help | Crisis numbers always visible; never position the app as treatment |
| **AI safety** | See §6.2 [F, S26, S27] | No generative AI in the user flow until criteria are met (§7.6) |
| **Privacy** | localStorage disappears when browser data is cleared; export is plain text [F, repo] | Already mitigated by export (1.1); consider an encrypted export file [S] |
| **IP / FTO** | Adaptive or haptic features may infringe third-party patents [F on the patents, S14] | Targeted FTO search before building them |
| **Market data** | Vendor reports with unclear methods [S8–S11] | Order of magnitude only |
| **Evidence base** | Breathwork effects are small to medium and based on few RCTs [F, S5] | Measure your own before/after data; communicate cautiously |
| **Regulatory timeline** | AI Act omnibus not confirmed as finally adopted [S31] | Check EUR-Lex before planning for AI features |
| **One-person dependency** | No tests or CI [F, repo] | Simple Playwright smoke tests [I] |
| **Method caveat for this briefing** | Some legal findings are read via law-firm summaries; no legal or patent assessment has been done | Verify primary sources before decisions with legal consequences |

---

## 9. Sources (with dates)

All sources were accessed on 24 Oct 2026. "Summary" means the claim is read via a secondary source.

| ID | Source | Date | Type |
|---|---|---|---|
| S5 | Fincham, Strauss, Montero-Marin & Cavanagh, "Effect of breathwork on stress and mental health: a meta-analysis of RCTs", *Scientific Reports* 13:432. https://www.nature.com/articles/s41598-022-27247-y · summary: https://www.psypost.org/2023/02/breathwork-shows-promise-in-reducing-stress-anxiety-and-depression-according-to-new-meta-analysis-67636 | Jan 2023 | Peer-reviewed |
| S6 | Balban et al., "Brief structured respiration practices enhance mood and reduce physiological arousal", *Cell Reports Medicine*. https://pmc.ncbi.nlm.nih.gov/articles/9873947/ | Jan 2023 | Peer-reviewed RCT |
| S7 | Baumel, Muench, Edan & Kane, "Objective User Engagement With Mental Health Apps", *JMIR* 21(9):e14567. https://www.jmir.org/2019/9/E14567/ | Sep 2019 | Peer-reviewed |
| S8 | Global Market Insights, Mental Health Apps Market. https://www.gminsights.com/industry-analysis/mental-health-apps-market | Apr 2026 | Market report (summary) |
| S9 | The Business Research Company, Mental Health Apps Global Market Report (via GII). https://cn.gii.tw/report/tbrc1675991-mental-health-apps-global-market-report.html | 2025 | Market report (summary) |
| S10 | Roots Analysis, Mental Health Apps Market. https://www.rootsanalysis.com/reports/mental-health-apps-market.html | 2025 | Market report (summary) |
| S10b | Verified Market Research (press release). https://prnewswire.co.uk/news-releases/mental-health-apps-market-is-expected-to-generate-a-revenue-of-usd-17-5-billion-by-2031--globally-at-19-6-cagr-verified-market-research-302358269.html | 2024/25 | Market report (summary) |
| S11 | Appfigures, "Demand for Mental Health Apps is Almost Gone" https://app.appfigures.com/resources/insights/20231215?f=4 · MobiHealthNews, Calm layoffs https://www.mobihealthnews.com/news/meditation-app-calm-lays-20-workforce · Market.us meditation apps https://market.us/report/meditation-management-apps-market/ | Dec 2023 / Aug 2023 / 2025 | App analytics / news / market report |
| S12 | Fierce Healthcare, Headspace financing and enterprise. https://www.fiercehealthcare.com/digital-health/headspace-banks-105m-new-financing-it-eyes-potential-ma-and-expansion-enterprise | 2025 | News |
| S13 | Towards Healthcare, meditation apps (Calm Health/Solera, B2B shift). https://www.towardshealthcare.com/insights/meditation-management-apps-market-sizing | 2025 | Market report (summary) |
| S14 | USPTO: US 12,217,620 (Apple, breathing sequence UI, granted 4 Feb 2025) https://patents.google.com/patent/US12217620B2 (number from Justia's Apple listing https://patents.justia.com/assignee/apple-inc; check the claims) · US 12,296,108 https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12296108 · US 12,676,225 https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12676225 | 2023–2026 | Patent documents |
| S15 | IP High Court of Japan, DABUS judgment 30 Jan 2025. https://www.ip.courts.go.jp/app/files/hanrei_en/624/003624.pdf · AIPPI: https://www.aippi.org/news/ai-as-an-inventor-of-patents-ip-high-court-judgment-and-the-2025-ip-strategic-program/ | Jan 2025 | Court decision |
| S16 | *Thaler v. Vidal*, 43 F.4th 1207 (Fed. Cir.) | 5 Aug 2022 | Court decision (background knowledge, widely documented) |
| S17 | USPTO revised inventorship guidance for AI-assisted inventions (summaries): Foley Hoag https://foleyhoag.com/news-and-insights/publications/alerts-and-updates/2025/december/uspto-issues-superseding-guidance-on-inventorship-for-ai-assisted-inventions/ · Goodwin https://www.goodwinlaw.com/en/insights/publications/2025/12/alerts-lifesciences-uspto-issues-revised-inventorship-guidance | Nov/Dec 2025 | Authority guidance (summary) |
| S18 | Bloomberg Law, "AI Patent Eligibility Has Shifted With One Machine-Learning Case" (Ex parte Desjardins). https://news.bloomberglaw.com/ip-law/ai-patent-eligibility-has-shifted-with-one-machine-learning-case · Venable https://www.venable.com/insights/publications/2025/12/the-101-reset-for-2026 | Feb 2026 / Dec 2025 | Commentary |
| S19 | EPO, "AI cannot be named as inventor on patent applications" (J 8/20, J 9/20). https://www.epo.org/en/news-events/news/ai-cannot-be-named-inventor-patent-applications-0 | Dec 2021 / 2022 | Authority |
| S20 | *Emotional Perception AI v Comptroller* [2026] UKSC 3: CMS https://cms.law/en/gbr/legal-updates/emotional-perception-reaches-the-top-supreme-court-delivers-landmark-ruling-on-ai-patentability · GJE https://www.gje.com/resources/an-end-to-an-emotional-journey-the-uk-supreme-court-concludes-the-emotional-perception-saga/ | 11 Feb 2026 | Court decision (summary) |
| S21 | BGH X ZB 5/22 (DABUS): D Young https://dyoung.com/en/knowledgebank/articles/bgh-germany-inventor-dabus · Boehmert https://www.boehmert.de/en/bulletin-nov-2024-2/ | 11 Jun 2024 | Court decision (summary) |
| S22 | WIPO, Patent Landscape Report – Generative AI. https://www.wipo.int/web-publications/patent-landscape-report-generative-artificial-intelligence-genai/en/key-findings-and-insights.html | Jul 2024 | International organisation |
| S23 | WIPO, Top Generative AI Patent Trends 2025 https://www.wipo.int/en/web/patent-analytics/generative-ai/2025 · press release https://www.wipo.int/pressroom/en/articles/2026/article_0012.html | Jul 2026 | International organisation |
| S24 | STAT, Woebot shuts down app. https://www.statnews.com/2025/07/02/woebot-mental-health-chatbot-shuts-down-founder-says-ai-moving-faster-than-regulators/ · MobiHealthNews https://www.mobihealthnews.com/news/woebot-health-shutting-down-its-app | Apr–Jul 2025 | News |
| S25 | Illinois HB 1806 (WOPR Act): Healthcare Finance News https://www.healthcarefinancenews.com/news/illinois-bans-therapeutic-use-ai-without-clinician-input · Data Privacy + Security Insider https://www.dataprivacyandsecurityinsider.com/2025/08/illinois-enacts-act-prohibiting-ai-therapy/ | Aug 2025 | Legislation (summary) |
| S26 | FDA DHAC on GenAI mental health devices: Orrick https://www.orrick.com/en/Insights/2025/11/FDAs-Digital-Health-Advisory-Committee-Considers-Generative-AI-Therapy-Chatbots-for-Depression · Psychiatric Times https://www.psychiatrictimes.com/view/fda-committee-meets-on-generative-ai-digital-mental-health-devices | 6–13 Nov 2025 | Authority meeting (summary) |
| S27 | Moore et al., "Expressing stigma and inappropriate responses prevents LLMs from safely replacing mental health providers", FAccT 2025, arXiv:2504.18412 · Stanford HAI https://hai.stanford.edu/news/exploring-the-dangers-of-ai-in-mental-health-care | Apr–Jun 2025 | Peer-reviewed conference |
| S28 | *Thaler v. Perlmutter*, cert. denied: Baker Donelson https://www.bakerdonelson.com/supreme-court-denies-certiorari-in-thaler-v-perlmutter-ai-cannot-be-an-author-under-the-copyright-act | 2 Mar 2026 | Court decision (summary) |
| S29 | MDCG 2019-11 Rev. 1 (qualification/classification of software): OpenRegulatory https://openregulatory.com/mdcg/mdcg-2019-11 · Emergo https://www.emergobyul.com/news/european-revision-primary-software-guidance-mdcg-2019-11-revision-1-small-changes-meaningful | 2019 / Rev. 1 2025 | Authority guidance (summary) |
| S30 | FHI, "Psykiske plager og lidelser hos voksne" (Mental health complaints and disorders in adults), Folkehelserapporten. https://www.fhi.no/he/folkehelserapporten/psykisk-helse/psykiske-lidelser-voksne/ | Updated 2025 | Authority |
| S31 | EU AI Act Digital Omnibus: Gibson Dunn https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/ · Sidley https://datamatters.sidley.com/2026/06/22/eu-lawmakers-reach-provisional-agreement-to-delay-key-eu-ai-act-obligations/ | May–Jun 2026 | Legislation (summary) |
| S32 | TechCrunch, "MIT disavows doctoral student's paper on AI productivity benefits". https://techcrunch.com/2025/05/17/mit-disavows-doctoral-students-paper-on-ai-productivity-benefits | 17 May 2025 | News |
| Repo | `index.html`, `isolation-mirror.html`, `HULL.md`, `RUN.md` in this repo | Version 1.1, 2026 | Primary product data |

*Background knowledge without a retrieved source in this session (verify before external use):* UKSC *Thaler v Comptroller* [2023] UKSC 49 (20 Dec 2023); FTC v. BetterHelp (USD 7.8 m, March 2023); the Norwegian crisis line numbers.

---

*Ending.* The circle swells for four seconds. Nobody owns that. What can be owned is the promise that nothing leaves the phone, and the discipline to come back on day 30. The rest is noise. So: who opens Pusterom again on the thirty-first day?
