# ARVEBOKSEN: Commercial & Regulatory Framework (14-Day Sprint)

**Status:** Operating document v1.0. For the internal alignment call, then derived into the investor brief and the legal intake pack.
**Sprint window:** Day 1 (kickoff) → Day 14 (go/no-go review).
**Owners (roles, assign names at kickoff):**
- **CEO / Commercial Lead (COM):** pilot families, pricing, investor narrative
- **CTO (TECH):** consent mechanism, archive proof-of-concept, data sovereignty
- **Compliance Owner (REG):** internal owner of the regulatory workstream; the single interface to external counsel
- **External Counsel (EXT):** MDR scoping, GDPR/privacy, inheritance and consent law. Advisory only; decisions stay internal.

**Rule for reading this document:** every section ends in a person, a task, a decision or a conversation. If a paragraph doesn't, it gets cut at the Day 14 revision.

---

## Executive Summary (one page, for leadership alignment)

**What we are building.** One product: a voice-first conversation archive. It lives with one person while she is alive and becomes her family's inheritance when she dies. We have been describing it as three products: a daily companion for the elderly, a post-mortem legacy platform and a family coordination tool. Those are three views of one data asset at two points in one life. From Day 1 we stop describing three products.

**What we are selling.** One recurring household subscription called ARVEBOKSEN. It is paid jointly by 1–5 family members. One customer cohort, one revenue line. The subscription doesn't change when she dies. Only the archive's access rules change, and she sets those rules herself while she is alive.

**Where we actually are.** Six prompt engines. Zero paying customers. Product-market fit hasn't been validated. The bottleneck is not technology. It is the distance between a working pipeline and three families who have paid. No new engine gets started in this sprint.

**The three tensions, resolved at the level of a decision:**

| Tension | Decision for this sprint |
|---|---|
| Selling presence without becoming a medical device | We sell conversation, connection and her own words relayed by her choice. The system computes **no** inferences about her health, cognition or mood that it surfaces to anyone. That is enforced in the engine schemas, not only in the messaging. Counsel confirms where the line sits. |
| "Nothing stored permanently" vs. "family inheritance" | We retire the claim "nothing stored permanently". The default is ephemeral. Permanence exists only for what she has explicitly chosen to keep, in a consent act recorded in her own voice and tied to named heirs. |
| Generative "in her voice" content | Not built, not demoed, not sold in this sprint. The pilot archive is authentic recordings only. Generative content is an option we hold, gated on separate consent from her while she is alive and on evidence from families who have lived with the authentic archive. |

**Day 14 success criteria (all four required for "go"):**
1. **Commercial:** at least 12 discovery conversations completed, and **3 families committed to a paid pilot**: first payment received, or a signed pilot agreement with a payment date no later than Day 30.
2. **Technical:** a consent and archive proof-of-concept that passes every "Must" row in the acceptance criteria table (Section 6.5) in a recorded demo with synthetic data.
3. **Regulatory:** counsel intake held. Written questions submitted for every "Blocking" item in Section 6.4. An MDR scoping opinion and a DPIA scope commissioned, with delivery dates.
4. **Alignment:** the internal, customer, investor and legal narratives (Section 2) signed off by COM, TECH and REG, with no contradictions between them.

**Decisions leadership must take on Day 1:**
- **D1.** Retire the three-product framing in every internal and external document.
- **D2.** Freeze engine scope. No new engines. Assign each of the six engines to a product function or park it (Section 2.1).
- **D3.** Retire "nothing stored permanently" as a claim.
- **D4.** Generative post-mortem content is out of pilot scope and out of all external materials.
- **D5.** No real user audio is processed until REG has signed off the pilot consent package (Section 6.4, item B1).

**Deliverables inside this document:**
- Customer conversation template: Section 5.3
- Regulatory checkpoint summary: Section 6.4
- Technical acceptance criteria table: Section 6.5

---

## 1. Product Vision (the collapse)

ARVEBOKSEN is one subscription that a family buys to surround one person, usually a parent or grandparent, with a voice-first conversation partner. Over months and years it quietly turns what she says into a structured, searchable archive in her own words. While she is alive she owns that archive. She decides, item by item, what stays private, what her family can see now and what is kept for later. When she dies, the parts she chose to keep pass to the people she named, under rules she set herself. The "companion", the "family coordination tool" and the "legacy platform" are not three products. They are the same archive at two stages: **accumulation** while she lives and **inheritance** after she dies. The family pays once, as a household, across both stages. Xff-flow structures what she says, PIRAT and HERMES organize it, and the compliance tooling holds the consent chain that makes it inheritable. That pipeline is the product. The conversation is how the archive gets filled.

---

## 2. The Four Narratives

The same product, read by four audiences. The **internal narrative is the source of truth**. Each of the other three is a projection of it. If an external narrative says something the internal one doesn't, the external narrative is wrong.

### 2.1 Internal team: what we are actually building and why

**The single sentence everyone on the team must be able to say unprompted:**
*We turn a person's spoken life into an archive she controls and her family inherits.*

**What this means for the six engines.** Each engine gets one product function. If it can't be assigned one, it is parked. Parked means no further development this sprint. It doesn't mean deleted.

| Engine | Product function in ARVEBOKSEN | Sprint status |
|---|---|---|
| **Xff-flow** | Turns her spoken conversation into structured notes: topics, people, places, time references, and stories marked as stories. This is the ingestion layer for the whole archive. | **Critical path.** Schema change required (see below). |
| **PIRAT** | Organizes the archive: links notes into people, places, eras and recurring stories, and deduplicates retellings. | **Critical path.** Needed for the archive proof-of-concept. |
| **HERMES** | Routes and governs access: what is private, shared now, or kept for heirs, and who can see what. Packages archive views for each heir. | **Critical path.** Becomes the enforcement layer for consent states. |
| **Compliance tooling** | Holds the consent ledger: versioned consent texts, her recorded affirmations, state transitions, audit log. | **Critical path.** This is the inheritability mechanism. |
| **Reasoning motor 5** | TECH to confirm. Proposed: retrieval and Q&A over the archive for family members ("what did she say about the farm in Valdres"), returning only authentic excerpts. | Keep **only if** it can return cited, verbatim excerpts. Otherwise park. |
| **Reasoning motor 6** | TECH to confirm. Proposed: the conversational layer that talks with her (prompts, follow-up questions, memory of prior conversations). | Keep. Constrained by the health-inference rule below. |

**Two engineering rules that follow from the vision. Both are non-negotiable this sprint:**

1. **No health-state fields.** Xff-flow's output schema, PIRAT's entity model and every reasoning motor's output must not contain fields that score, classify or trend her cognition, memory, mood or health. That includes fields that are computed and never displayed. Why: the MDR risk lives in what the system does, not only in what we say about it (Section 3.1). TECH audits all six engines' schemas by Day 3.
2. **No generative output in her voice or style.** Nothing in the pilot build produces text or audio presented as hers that she didn't actually say. Summaries and indexes are allowed if they are labeled as system-generated and link back to the source recording.

**Why this framing, in operator terms.** Three value propositions meant three buyer journeys, three pricing logics and three sets of claims to keep compliant. Collapsing them gives us one buyer: the adult child, usually 45–65, who already coordinates a parent's care. It gives us one pricing logic (a household subscription) and one claims surface to defend. It also makes the post-mortem phase a retention mechanism instead of a separate product launch.

**What changes for the team on Day 1:**
- The pitch deck, website copy and repository READMEs stop describing three products. COM owns the rewrite. Draft by Day 4.
- Feature requests are triaged with one question: *does this make the archive richer, more trusted, or more inheritable?* If not, it goes in the backlog.
- "Seventh engine" proposals are closed without discussion during the sprint.

**Decision owner:** CEO. **Moment:** the Day 1 alignment call. Exit criterion: every team member restates the sentence and the two rules without notes.

### 2.2 Prospective customers: families considering the service

This section describes **what the customer story must contain and in what order**. It is not copy. Messaging gets written after the pilot conversations, from the families' own language (Section 5).

**Who the buyer is.** The adult child coordinating a parent's life from a distance, often with siblings. The parent is the user, not the buyer. Both must say yes. Her yes is the one that matters legally (Section 6).

**What the family is buying, in order of how they will feel it:**
1. **Now (living phase):** she has someone to talk to every day. The family hears what she chooses to share, in her own words, without having to interrogate her on the weekly phone call.
2. **Over time:** her stories stop being lost. The ones she wants kept are gathered, organized and findable.
3. **Later (inheritance phase):** when she is gone, the family gets her voice and her stories, arranged and in her own words, under rules she set herself.

**What the customer story must never contain** (COM enforces this in every customer conversation during the sprint):
- Any claim or implication that the service detects, monitors, tracks, predicts or flags changes in memory, cognition, mood or health. That includes softened versions like "notices if something's off".
- Any suggestion that she can be "talked to" after death, or that the service can produce new messages from her.
- "Nothing is stored." It is false for the archive tier, and retracting it later costs more trust than never saying it.

**The emotional engine of the story is consent, not technology.** The differentiator families should come away with is that *she decides*. Competitors in the grief-tech space lead with what the technology can generate. We lead with whose archive it is. That framing does three jobs at once: it lowers the creepiness reflex, it pre-loads the consent ceremony as a feature rather than a form, and it keeps the claims surface clear of MDR territory.

**Price hypothesis to test, not announce:** one household subscription in the NOK 290–490/month range, split among the paying family members, with no separate post-mortem fee. Validate willingness to pay and the split mechanism in Section 5.

**Decision owner:** COM. **Moment:** the first customer conversation, no later than Day 3.

### 2.3 Investors and board: viability, unit economics, moat

**The thesis in one line:** a recurring household subscription whose churn event, death, is designed to be a retention event, sitting on a consented longitudinal archive that competitors cannot recreate.

**What we can say truthfully on Day 14:**
- The product is a single subscription with a single buyer cohort, replacing three unvalidated propositions.
- The pipeline (Xff → PIRAT → HERMES plus the compliance ledger) exists and runs end to end on synthetic data, with a recorded demo.
- N discovery conversations held. 3 families committed with payment. That is the only traction we will claim.
- The regulatory scoping has been commissioned. What we know and don't know is set out in Section 6.4.

**What we must not say:** that product-market fit is validated, that the generative capability is on a dated roadmap, or that MDR "doesn't apply". We don't know that yet. We have designed the product to stay outside it and asked counsel to confirm.

**Unit economics: the model to build by Day 10 (COM + TECH).** Every number is a hypothesis, labeled as one in the investor brief:

| Line | Driver | Owner | Source by Day 10 |
|---|---|---|---|
| ARPU per household | Price point × households converting from pilot | COM | Pilot commitments + discovery willingness-to-pay data |
| Inference cost per active user/month | Minutes of conversation/day × Xff + reasoning-motor token cost | TECH | Metered run on 30 days of synthetic conversation volume |
| Storage cost per archive/year | Audio retention policy (Section 3.2) × structured note volume | TECH | Measured on the proof-of-concept |
| CAC | Channel: adult-child direct, eldercare partners, estate/funeral partners | COM | Cost per discovery conversation from this sprint as a floor |
| Gross churn, living phase | Disengagement, moves to care homes, cost sensitivity | COM | Unknown. State it as unknown. |
| Post-mortem retention | Share of households that keep paying after death | COM | Unknown. This is the core bet. Name it as one. |

**The honest weakness to put on the table before an investor finds it:** the post-mortem retention assumption is the hinge of the LTV model, and nobody has evidence for it. Our answer is a design choice, not a number. The subscription continues after death because the archive needs a steward, access governance and continued organization (PIRAT keeps working as heirs add context). If families won't pay for that, the model collapses to a companion subscription with a natural churn event. Section 5 tests this directly.

**Decision owner:** CEO. **Moment:** investor brief drafted Day 11, reviewed against Section 2.1 on Day 12.

### 2.4 Regulatory and legal counsel: what we need them to scope

This narrative is **not** a compliance claim. It is a precise brief so counsel can scope quickly. The full question list is in Section 6.4.

**What we tell counsel the product is:**
- A voice-based conversational service for an adult user (typically 70+). It structures her conversation into notes, lets her share selected notes with named family members, and lets her designate selected content to be kept and passed to named heirs after her death.
- Intended purpose, as we intend to define it: social conversation, personal memory archiving, and user-directed family communication.
- Explicitly **not** intended for diagnosis, prevention, monitoring, prediction, prognosis, treatment or alleviation of any disease or condition, including cognitive decline.

**What we tell counsel the risks are, without softening:**
- The user population has an elevated prevalence of cognitive decline. That bears on consent capacity, on how a reasonable reader interprets our claims, and on whether family-facing features could be construed as monitoring.
- Conversation content will routinely include health information she volunteers, information about third parties, and possibly voice data that could be processed as biometric data.
- The post-mortem phase involves data about a deceased person. That data contains personal data about living people, and transfer of access follows her instructions rather than statutory inheritance.
- We operate in Norway (EEA) and will sell into the Nordics. Some engines may call model providers whose processing location TECH must confirm (Section 4, T1).

**What we want from counsel in this sprint:** scoping, a question-by-question view of what is blocking versus what can be iterated, and a timeline for a written opinion. We don't want a finished compliance programme in 14 days, and we won't ask for one.

**Decision owner:** REG. **Moment:** counsel intake session, Day 4 or 5.

### 2.5 Commercial defensibility: why the stack is the moat, not the marketing

**Why this isn't vulnerable to the "creepy" competitors.** The visible competition clusters at two ends. One end is memoir-prompt services, which are cheap, text-first, and stop at a book. The other is griefbot and voice-clone products, which are technically impressive, legally exposed and reputationally fragile. Voice cloning and style imitation are commodity capabilities. Any competitor can generate. What no competitor can generate after the fact is **years of authentic, structured, consented speech from a specific person, with a provable chain of her own permission attached**.

**The moat, in order of strength:**

1. **The archive is non-reproducible after death.** Every month of the living phase adds material that can't be recreated later. That makes switching costs rise over time. They come from the value of continuity, not from holding data hostage.
2. **The consent chain is an asset competitors will have to build backwards.** Every kept item in ARVEBOKSEN carries a ledger entry: which consent text version, her recorded affirmation, the named heirs, the time. Competitors who grew by skipping that step hold a liability: archives whose inheritability can be challenged. As regulation tightens around synthetic content and deceased persons' data, the consented archive gains value relative to the unconsented one.
3. **Xff → PIRAT → HERMES makes the archive navigable.** A pile of recordings isn't an inheritance. Structured notes, linked into people, places, eras and recurring stories, with access governed per heir, are. The pipeline is what turns raw speech into something a grandchild will actually open. A competitor can buy transcription. They can't buy the organizational layer tuned on this use case, or the governance layer built around consent states.
4. **The household is the account.** Five paying family members across two generations are a stickier unit than one subscriber. When she dies, the account passes to the next generation instead of closing.

**What is explicitly NOT the moat:**
- Generative capability. It is a commodity, and in this category it is closer to a liability than an advantage.
- Data lock-in. Data portability rights apply. Export must work (Section 6.5, TC-11). If retention depends on the family being unable to leave, the model is wrong.
- Marketing language. "Heritage", "legacy" and "presence" are available to everyone.

**Where defensibility is weakest:** before the first archive has depth. A household three weeks into the subscription has very little to lose by leaving. The commercial implication is that the first 90 days need a visible early-value moment, such as the first organized story collection she chooses to share. Section 5 tests whether that moment lands.

---

## 3. The Three Core Tensions & Proposed Resolutions

Each tension is set out in the same structure: the problem stated precisely, the proposed resolution, the residual risk, what goes to counsel, and what gets validated with families.

### 3.1 Tension 1: selling "conversation and presence" without triggering medical device classification

**The problem, precisely.**
- Under MDR, software qualifies as a medical device on the basis of its **intended purpose**. That purpose is read from the manufacturer's labeling, instructions, promotional and sales materials and statements, not only from the product's own description. Monitoring, prediction or prognosis of a disease or condition is a medical purpose. If software qualifies, the classification rules for software tend to push it above the lowest class. That means notified-body involvement, which we can't absorb pre-revenue.
- The trap has two sides:
  - **Claims side:** families will *want* cognitive monitoring, and salespeople drift toward what buyers want. One sales email saying "you'll notice if her memory changes" can reframe intended purpose.
  - **Function side:** even with clean claims, a system that computes signals about cognitive change (repetition rates, lexical decline, disorientation markers) and makes them available to family is exposed. A regulator or competitor can point to the function. Clean marketing doesn't cure a monitoring function.
- The gray zone is real. Some features families will reasonably expect sit near the line:
  - **Verbatim relay:** she says "I fell yesterday" and that note is shared with her daughter.
  - **Activity absence:** "no conversation today".
  - **Keyword alerts:** distress words trigger a notification.

**Proposed resolution: a three-tier feature rule.**

| Tier | Definition | Pilot status |
|---|---|---|
| **A. User-directed relay** | She decides to share something, and the system passes on *her words*. No interpretation, no scoring, no selection by health relevance. | **In pilot.** Core feature. |
| **B. Non-health activity signals** | Facts about use of the service ("she hasn't used the service since Tuesday") with no inference about why. | **Hold for counsel.** Built behind a feature flag, off by default, not mentioned to families. |
| **C. Derived health or cognitive inference** | Anything that scores, classifies, trends or flags her state, whether computed in the background or displayed. | **Out.** Not computed, not stored, not displayed. Enforced in the schemas (Section 2.1, rule 1). |

**Operational controls, each with an owner:**
1. **TECH, by Day 3:** schema audit of all six engines. Remove or confirm the absence of Tier C fields. Write the audit up as a one-page record. It becomes evidence of intended purpose.
2. **TECH, by Day 6:** Xff-flow's note selection must not rank or select by health relevance. A note mentioning a fall is structured like a note mentioning a birthday. It reaches the family only if she shares it.
3. **COM, by Day 2:** a claims boundary list (internal, one page). It lists the words and implications that are off-limits in any channel: email, deck, website, investor update, LinkedIn post. Every external-facing team member reads it before their first customer conversation.
4. **REG, ongoing:** reviews every external document before it leaves the building during the sprint. Turnaround of 24 hours or less, or the document waits.

**Residual risk:** families will ask for Tier B and Tier C. Refusing Tier C is a commercial cost we accept. Tier B is the open question. If counsel clears it, it is the most requested safety feature that stays on the right side of the line. If counsel doesn't clear it, we need to know before families build expectations around it.

**To counsel (Section 6.4):** where Tier A ends and monitoring begins. Whether Tier B is acceptable and under what framing. Whether the population and the sales context (selling to adult children worried about a parent) change how a regulator would read intended purpose even with clean claims.

**To families (Section 5):** how much of their purchase intent rests on Tier B and Tier C. If the answer is "most of it", that is a product-market fit finding, not a messaging problem.

### 3.2 Tension 2: "nothing stored permanently" vs. "family archive inheritance"

**The problem, precisely.** The privacy promise that makes the companion phase acceptable, "we don't keep what you say", directly contradicts the value proposition of the inheritance phase, "your family gets what you said". Both can't be true for the same data. Leaving both claims in circulation guarantees that some family member eventually feels deceived, and that is the end of a household subscription.

**Proposed resolution: ephemeral by default, permanent by her explicit act.**
- **Retire the claim.** "Nothing stored permanently" is replaced in all internal and external language by a rule: *nothing is kept beyond the default window unless she has chosen to keep it*. (This is a product rule, not copy. COM writes the customer phrasing after the pilot conversations.)
- **Default retention (companion phase):** raw audio is deleted after structuring, within a window TECH proposes and REG confirms (a starting hypothesis is 72 hours). Structured notes are retained on a rolling window (starting hypothesis: 30 days), visible only to her unless she shares them. After the window, unkept notes are deleted.
- **The keep act:** she marks a conversation, story or note as *kept*. This is a consent event recorded in her voice against a versioned consent text (Section 6.2). Kept items leave the rolling window and enter the archive.
- **Heir designation:** a separate consent event. She names who receives kept items after her death, and she can name different heirs for different collections, or seal items.
- **Ownership model (proposed, for counsel review):**
  - **During her life:** she is the person in control of the archive. The paying family members are customers and, if she chooses, recipients of shared content. Payment buys no access rights.
  - **After her death:** access passes per her designation, administered by a named *archive steward*. That is one heir she designates, with a fallback order.
  - **Company role:** the company's role (controller vs. processor, per phase) is **a legal determination, not a product decision**. It is flagged for counsel.
- **Raw audio of kept items:** retained only for kept items, because voice is the inheritance. It is stored separately with stricter access controls. Whether retained voice counts as biometric data, and under what conditions, is flagged for counsel.

**Why this resolves the tension rather than hiding it:** both promises become true for different data with a clear boundary between them, and she is the one who moves data across that boundary. The ephemeral promise holds for everything she hasn't chosen to keep. The inheritance promise holds for everything she has.

**Residual risks:**
- **Capacity drift.** If her cognitive capacity declines, can she still make valid keep and heir decisions? Proposed default for the pilot: new keep acts require the standard ceremony. If the ceremony can't be completed, no new items enter the archive, and nothing already kept is affected. Whether a lasting power of attorney (fremtidsfullmakt) holder can act for her in this context is flagged for counsel.
- **Third parties in the archive.** Her kept stories will contain other people: neighbors, ex-spouses, children's private matters. Heirs will hear them. Flagged for counsel. Product mitigation under consideration: heir-side views flag named third parties. No automatic redaction this sprint.
- **Family members who object.** A sibling who disagrees with her heir designation has no product-level recourse. That is intended, because her choice governs. The dispute hold in Section 6.2 gives a cooling window, not a veto.

**To counsel:** retention periods, the company's role per phase, the legal status of a deceased person's data in Norway and target Nordic markets, enforceability of her heir designation versus statutory inheritance, biometric status of retained voice, and third-party data in inherited content.

**To families:** whether the keep act feels natural or bureaucratic, whether she (the user, not the buyer) accepts recording consent in her own voice, and whether families understand and accept that paying gives them no automatic access.

### 3.3 Tension 3: generative post-mortem content as future capability, validated on real recordings first

**The problem, precisely.** Content generated in the deceased's voice or style is the most emotionally powerful thing this stack could do. It is also the feature most likely to:
- harm a grieving family, for example through dependency, distortion of memory, or words she never said being taken as hers;
- attract regulatory attention (transparency obligations for AI-generated and manipulated content now apply in the EU);
- define us publicly as one more griefbot company.

It is also the feature investors will ask about first. If we pitch it, families anchor on it, and every authentic-archive conversation becomes a waiting room for the "real" product.

**Proposed resolution: a three-stage gate. Only Stage 1 runs in this sprint.**

| Stage | What exists | Gate to enter |
|---|---|---|
| **1. Authentic archive** | Her real recordings and structured notes, organized, searchable, inherited. System-generated summaries and indexes are labeled as such and always link to source audio. | Current stage. |
| **2. Assisted curation** | System-proposed collections, timelines and thematic compilations of *her actual words*, with no new content attributed to her. | Pilot families have used Stage 1 for at least 3 months, and the evidence shows assisted curation increases use without confusing authorship. |
| **3. Generative in-style content** | New text or audio in her style or voice. | All of the following:<br>(a) a **separate, explicit consent from her while she is alive**, specific to generative use, revocable by her;<br>(b) a family-level veto mechanism after death;<br>(c) a written legal opinion on transparency and deceased-person rights in each market;<br>(d) evidence from Stage 1–2 families that they want it, gathered after they have lived with the authentic archive, not before;<br>(e) a board decision. |

**Operational rules for the sprint:**
1. **COM:** generative content doesn't appear in the deck, the website, customer conversations or investor materials. The single exception is the investor Q&A, where the answer is the gate table above, verbatim in substance.
2. **TECH:** no prototype, no internal demo, no "quick experiment" on any real person's recordings. That includes team members' own family recordings.
3. **REG:** add generative content to the counsel question list as a *future-scope* item (non-blocking), so counsel's scoping can include it without the sprint depending on it.

**How we validate without selling it.** In customer conversations, generative content is probed late, neutrally, and only if the family raises "AI" or "talking to her" themselves (Section 5.3, Block E). We are measuring three things:
- Is it a pull? Would they pay more?
- Is it a repel? Would its existence make them trust us less?
- Is it a split? Does one sibling want it and another find it abhorrent?

A split matters most commercially, because the household is the account.

**Residual risk:** a competitor ships the generative feature first and wins attention. We accept that. Being second to generative and first to the consented authentic archive is the position the moat argument (Section 2.5) depends on.

---

## 4. 14-Day Execution Roadmap

Three workstreams, sequenced on dependencies. **The regulatory workstream is run and reported separately. Its content never appears in sales conversations.** Its *outputs*, such as the claims boundary list and the consent package, are used by the other two.

**Cadence:**
- 15-minute daily standup at 09:00 (COM, TECH, REG).
- Gate reviews on Days 3, 7, 10 and 14. Each takes 45 minutes and produces a written go/hold per item.

### 4.1 Day 0 / Day 1: decisions before anything moves

| # | Decision | Owner | Output |
|---|---|---|---|
| D1 | One product, one narrative; the three-product framing is retired | CEO | Recorded in the Day 1 call notes |
| D2 | Engine scope frozen; each engine assigned or parked (Section 2.1 table) | CTO | Table confirmed with TECH's corrections |
| D3 | "Nothing stored permanently" retired | CEO + REG | Removed from all live materials by Day 4 |
| D4 | Generative content out of pilot and out of external materials | CEO | Recorded |
| D5 | No real user audio before REG signs off the pilot consent package | CEO + REG | Recorded. TECH works on synthetic data only until then. |
| D6 | Pilot definition: 3 households, paid, 3 months, reduced price, refundable if the legal review blocks launch | COM | One-page pilot terms by Day 3 |

### 4.2 Commercial workstream (owner: COM)

| Day | Action | Output / decision |
|---|---|---|
| 1 | Build the prospect list: 30+ households from three channels: (a) personal networks of the team and advisors, (b) one eldercare or home-care partner, (c) one estate-planning, funeral or "fremtidsfullmakt" advisor channel. Target buyer: an adult child actively coordinating a parent's life. | List with channel tags. Channel (c) tests whether the legacy entry point converts better than the care entry point. |
| 2 | Write the claims boundary list (with REG). Prepare the discovery conversation guide (Section 5.3). Decide how interview notes are captured. **Do not run interviews through Xff-flow** unless the interviewee has consented to AI processing of the call. | Claims list signed by REG. Note-taking protocol. |
| 2–3 | Book 15+ discovery conversations for Days 3–10. Aim for at least 3 that include the parent (the user) as well as the buyer. | Calendar. |
| 3 | First 3 discovery conversations. Debrief each the same day against the assumption register (Section 5.1). | First evidence logged. **Gate 3:** does the buyer persona hold? If 0 of 3 recognize the problem, change channel before booking more. |
| 4 | Rewrite live materials (deck, site, READMEs) to the single narrative, with no claims beyond the boundary list. REG reviews. | Materials consistent with Section 2. |
| 4–9 | Discovery conversations 4–12. Introduce pilot terms in conversations 6+ to households with a strong problem signal. | Running tally: problem confirmed / price tested / pilot interest. |
| 7 | **Gate 7:** pricing and pilot terms reviewed against evidence so far. Adjust price band or split mechanism if needed. | Revised pilot terms if required. |
| 8–12 | Close pilot commitments. "Committed" means payment received or a signed agreement with a payment date no later than Day 30. Pilot start is conditional on the consent package (Section 6.4, B1). Tell families that explicitly. | Target: 3 committed households. |
| 10 | Unit economics model populated (with TECH costs). | Model v1 with labeled hypotheses. |
| 11 | Investor brief drafted from Section 2.3 plus sprint evidence. | Draft brief. |
| 12 | Cross-check against Section 2.1: no claim in the brief or customer materials exceeds the internal narrative. | Signed off by COM, TECH and REG. |
| 13 | Synthesize discovery findings: which assumptions held and which broke (Section 5.2). | One-page findings memo. |
| 14 | Go/no-go review. | Decision recorded. |

### 4.3 Technical workstream (owner: TECH)

| Day | Action | Output / decision |
|---|---|---|
| 1 | **T1, data flow inventory.** For each of the six engines, record where inference runs, which model providers are called, where data is stored, and the retention of every intermediate artifact (transcripts, embeddings, logs). Any processing outside the EEA is flagged to REG the same day. | One-page inventory. This is the single most important technical input to the regulatory workstream. |
| 1–3 | **T2, schema audit** for Tier C fields across all engines (Section 3.1). Remove anything found. | Audit record, signed by CTO. |
| 2–5 | **T3, consent ledger proof-of-concept** in the compliance tooling. Includes versioned consent texts, recorded voice affirmation capture, state machine (Section 6.2), append-only audit log, and hash of each affirmation recording linked to the consent text version. | Working on synthetic data. |
| 3–7 | **T4, retention enforcement:** raw audio auto-deletion after structuring; rolling-window deletion for unkept notes; deletion verified, not just scheduled. | Deletion demonstrable with logs. |
| 4–8 | **T5, HERMES as access enforcer.** Every read path checks consent state and heir designation. Default deny. | Access tests passing. |
| 5–9 | **T6, archive proof-of-concept:** Xff-flow → PIRAT → kept-item archive with people/place/era linking and per-heir views, on 30 days of synthetic conversation from one synthetic user. | Navigable archive demo. |
| 7 | **Gate 7:** T1–T4 status. If the consent ledger isn't working, T6 is cut to minimal scope. Consent comes before archive richness. | Go/hold. |
| 8–10 | **T7, post-mortem transition flow:** death notification by the steward, second-heir confirmation, dispute hold, release per designation. Synthetic only. | Flow demonstrable end to end. |
| 9–10 | **T8, export:** a complete archive export in an open format (audio files plus structured notes plus consent records). | Export file opens outside our system. |
| 10 | Cost metering for the unit economics model: inference and storage per synthetic user-month. | Numbers to COM. |
| 11–12 | Run the acceptance criteria table (Section 6.5) in full. Fix failures. | Test record. |
| 13 | Recorded demo of all "Must" criteria passing. | Video plus test log. |
| 14 | Go/no-go review. | Decision recorded. |

**Explicitly out of the technical workstream this sprint:**
- new engines;
- generative features;
- Tier B or Tier C features, apart from the Tier B flag scaffold left off;
- UI polish beyond what the demo needs;
- scaling work.

### 4.4 Regulatory workstream (owner: REG; reported separately)

| Day | Action | Output / decision |
|---|---|---|
| 1 | Select and engage external counsel with MDR, GDPR and Nordic inheritance competence. If one firm can't cover all three, appoint a lead firm that coordinates. Agree budget and a scoping-only mandate. | Engagement letter. |
| 1–2 | Co-write the claims boundary list with COM. | Signed list. |
| 2–3 | Assemble the intake pack: Section 2.4 narrative, Section 3 tensions, T1 data flow inventory (preliminary), consent architecture (Section 6.2), question list (Section 6.4). | Intake pack sent no later than Day 3. |
| 4–5 | **Counsel intake session** (90 min). Goal: counsel classifies each question as blocking, sprint-iterable or deferrable. Delivery dates agreed for written opinions. | Classified question list with dates. |
| 5–8 | Draft the pilot consent package (consent texts v0.1 for each consent event, pilot participant information, pilot agreement terms) for counsel review. | Draft package to counsel by Day 8. |
| 6–9 | Scope the DPIA. The processing almost certainly requires one: vulnerable data subjects, likely special-category content, novel technology. Commission it or start it internally, as counsel advises. | DPIA scope and timeline. |
| 7 | **Gate 7:** is anything counsel has flagged blocking for pilot recordings? If yes, COM is told the same day so pilot terms reflect the delay. | Go/hold on pilot start date. |
| 10 | Review all sprint external materials against the claims boundary list. | Clean or a fix list. |
| 12 | Regulatory status memo: decided, pending (with dates), deferred (with rationale). | Memo for Day 14. |
| 14 | Go/no-go review. REG holds a veto on pilot start, not on the sprint verdict. | Decision recorded. |

### 4.5 Day 14 decision tree

```
Day 14 review
│
├─ Did 3 households commit with payment?
│   ├─ YES ──► Did the consent/archive PoC pass all "Must" criteria?
│   │           ├─ YES ──► Is the pilot consent package cleared by counsel (B1)?
│   │           │           ├─ YES ──► GO: start pilot recordings. Next sprint = pilot operations.
│   │           │           └─ NO  ──► GO (conditional): hold pilot start; fix consent package;
│   │           │                      keep families warm with a dated start; no audio until cleared.
│   │           └─ NO  ──► HOLD: one-week technical extension, scope cut to consent + retention only.
│   │                      Families informed of the start date shift.
│   │
│   └─ NO  ──► Did discovery confirm the problem (≥ 60% of buyer conversations)?
│               ├─ YES ──► Problem real, offer wrong. Revisit price/split/entry point
│               │          (care vs. legacy channel). Second 14-day commercial sprint.
│               │          Technical work paused at the PoC level.
│               └─ NO  ──► STOP-AND-REFRAME: the household-buyer thesis didn't hold.
│                          Board review of which life phase (if any) carries demand.
│
└─ Independently: did counsel identify an MDR exposure that clean claims and the
    Tier C exclusion cannot resolve?
        ├─ YES ──► Escalate to board before any pilot start, whatever the commercial result.
        └─ NO / PENDING ──► Proceed per the branch above; pending items carry dates.
```

---

## 5. Customer Validation Priorities

### 5.1 Assumption register: what must hold or break in two weeks

Ranked by how much of the business depends on each assumption, multiplied by how little we currently know.

| # | Assumption | If it breaks… | Evidence threshold by Day 14 | Owner |
|---|---|---|---|---|
| **A1** | The adult child coordinating a parent's life recognizes "her stories are being lost" and "I don't know how her days are" as **real, felt problems**, not nice-to-haves. | No buyer. Everything else is moot. | At least 60% of buyer conversations describe one of these unprompted or confirm it with a concrete example | COM |
| **A2** | **The parent will talk to it.** A voice-first companion is acceptable to the user, not only to the buyer. | The archive never fills, and the moat never forms. | At least 2 of 3 conversations that include the parent end with her willing to try | COM |
| **A3** | Families will pay **as a household** and can agree on a split. | Revert to single-payer pricing; CAC economics change. | At least 2 of 3 committed pilots involve 2+ payers, or a clear reason why not | COM |
| **A4** | Purchase intent does **not** depend mainly on health or cognitive monitoring (Tier B/C). | The thing families want is the thing we can't sell without MDR. Product-market fit problem. | Fewer than 1 in 3 buyers make monitoring their primary reason after the boundary is explained | COM |
| **A5** | The parent accepts **recording consent in her own voice** and the keep act as meaningful, not bureaucratic. | The consent architecture is technically sound and practically dead. | Reaction captured in every parent conversation. No more than 1 strong rejection out of 3 | COM + REG |
| **A6** | Families accept that **paying gives no automatic access**; her choices govern. | Buyers expect a surveillance product; misaligned expectations churn the account. | At least 2 of 3 committed households state this back correctly | COM |
| **A7** | Families see value in **continuing to pay after death** (steward, access governance, continued organization). | LTV model loses its core differentiator. | Directional only: count yes / no / "depends" and the reasons. No threshold, because two weeks can't validate this. | COM |
| **A8** | The legacy entry point (estate and funeral advisors) converts at least as well as the care entry point. | Channel strategy changes; legacy-first positioning may be wrong or right. | Conversion to pilot interest compared by channel. Directional. | COM |
| **A9** | Generative content is not the primary pull, and its existence doesn't repel. | If it's the primary pull, the authentic archive is a waiting room. If it repels, it must stay out of the brand entirely. | Reactions logged as pull / repel / split, only where the family raises it | COM |

### 5.2 What counts as a result

- **Held:** the threshold is met. The assumption moves into the investor brief as "early evidence (n = X)", never as "validated".
- **Broke:** below threshold with a consistent reason. It goes to the Day 14 decision tree.
- **Inconclusive:** below threshold without a consistent reason, or too few conversations. The assumption stays open and gets its own slot in the next sprint.

A broken A1 or A2 triggers the stop-and-reframe branch on its own. A broken A4 goes to the board even if three families commit, because those families may have committed for a feature they can't have.

### 5.3 Customer conversation template: the first three pilot families (and every discovery conversation)

**Format:**
- 45–60 minutes, in person or by video, with COM plus one note-taker.
- The parent is present in at least 3 conversations; the buyer is present in all of them.
- **No product demo before Block D.** We are testing problems before solutions.

**Before the conversation:**
- Tell the participants how notes are taken and stored. Get consent for notes. No AI processing of the call without explicit consent.
- The interviewer has read the claims boundary list.

**Block A: their situation (10 min). Tests A1, A8.**
1. Tell me about how you keep in touch with [parent] today: who calls, how often, who organizes what.
2. When did you last feel you didn't know how her days actually go? What happened?
3. Is there a story of hers you realize you've never heard properly, or one you'd hate to lose? What have you done about it, if anything?
4. Among your siblings or family, who carries the most of this? How is that split?
5. (Channel probe) How did you hear about us, and what made you take this call?

**Block B: her, from her side (10 min; with the parent present). Tests A2, A5.**
1. (To the parent) Who do you talk to on a normal day? Are there days when you don't talk to anyone?
2. (To the parent) Have you ever wanted to tell your stories properly, to someone who would keep them? What has stopped you?
3. (To the parent) How do you feel about talking to a device or a voice service? What would make it feel wrong?
4. (To the parent) If you said something you didn't want your children to hear, how would you want that handled?

**Block C: boundaries and expectations (10 min). Tests A4, A6.**
1. If a service like this existed, what's the first thing you'd want it to tell you? (Listen for monitoring language. Don't correct it yet.)
2. (After the answer) We've made a deliberate choice: the service never assesses her health or memory, and it only passes on what she chooses to share. How does that change your interest?
3. If you were paying for it, would you expect to see what she says? How would you feel if the answer was: only what she chooses?
4. (To the parent) Is that how you'd want it?

**Block D: the offer (10–15 min). Tests A3, A5, A7.** Show the consent and keep flow here, and only here (synthetic demo).
1. Walk through the keep act and the heir designation. (To the parent) What would you need in order to feel comfortable recording your consent in your own voice?
2. Who in the family would pay for this, and how would you split it? What has happened before when your family has shared a cost?
3. What would you expect to pay per month as a household? At [price band], is this a yes, a no or a "depends"? Depends on what?
4. After [parent] is gone, the archive needs someone to look after it and decide who can see what. Would you expect to keep paying for that? Why or why not?
5. We're running a paid pilot with three families. [Pilot terms.] Is this something you'd want to be part of? What would stop you?

**Block E: only if they raise AI, "talking to her" or synthetic voice themselves (5 min). Tests A9.**
1. What did you have in mind?
2. Would that make you more or less interested in what we've described? Why?
3. (If more than one family member is present) Do you all feel the same about that?

Don't describe a generative capability, don't confirm it's coming, and don't raise it unprompted.

**After the conversation (same day, 15 min):**
- Log the evidence per assumption, A1–A9, using quotes and not interpretations.
- Rate the problem signal: strong / weak / absent.
- Record the pilot status: committed / interested / declined, with the reason.
- Flag any moment where the interviewer drifted over the claims boundary. That is a process failure to fix, not a judgment on the interviewer.

---

## 6. Regulatory Flag & Consent Architecture

### 6.1 The compliance problem, stated without resolving it

Each of the following is a requirement area where we need a legal position. None is decided in this document.

1. **Medical device scope (MDR).** Whether the product, given its functions, claims, user population and sales context, has a medical intended purpose. Specifically: where user-directed relay of health-related content (Tier A) and non-health activity signals (Tier B) fall. What evidence of intended purpose we should keep (the Tier C schema audit, the claims boundary list). Whether qualification analysis must be documented before the pilot.
2. **Lawful basis and special categories (GDPR, via EEA).**
   - **Content:** conversation content will include health data she volunteers and possibly data revealing other special categories.
   - **Voice:** retained voice may or may not be processed in a way that makes it biometric data. The lawful basis for each processing purpose has to be determined (companion conversation, structuring, sharing, archiving, post-mortem transfer).
   - **Consent:** whether explicit consent is the right basis for each purpose, and what that implies for withdrawal.
3. **Consent capacity.** The validity of consent from users who may have, or develop, reduced capacity. The role of a lasting power of attorney (fremtidsfullmakt) or guardianship. What happens to existing consents and to the archive if capacity declines.
4. **Controller and processor roles.** The company's role in each phase and for each purpose. The family members' role, if any. Who the data subject is after death for the purposes that still involve living people.
5. **Data of deceased persons.** The legal status in Norway and each target Nordic market. Whether national rules extend protection to the deceased. How her pre-mortem instructions interact with statutory inheritance and the estate (dødsbo). Whether the archive or its contents form part of the estate.
6. **Third-party data in the archive.** Living people mentioned in, or audible on, kept recordings. Their rights once heirs get access.
7. **International transfers.** Any engine calling model providers or storage outside the EEA (dependent on the TECH T1 inventory).
8. **AI-specific obligations.** Transparency duties for the conversational AI towards the user. For the future generative stage: transparency and labeling obligations for synthetic content, and rights over a deceased person's voice and likeness.
9. **DPIA.** Almost certainly required, given vulnerable data subjects, systematic processing of sensitive content and novel technology. Its scope and timing relative to the pilot need to be set.
10. **Consumer law.** A subscription that continues after the user's death, paid by family members. The contract structure, cancellation rights, and what is owed to heirs if the company ceases to operate (archive continuity and escrow).

### 6.2 Proposed consent mechanism and architecture

This is a proposal for counsel to review, not a compliance claim. It is built to make both poles true: ephemeral by default, inheritable by choice.

**Principles:**
- **She is the only person who can move data toward permanence.** Family members, payers and the company cannot.
- **Every consent is an event, not a checkbox.** Each one records the versioned text, her affirmation in her own voice, a timestamp, a witness if applicable, and a hash linking the affirmation to the text version.
- **Consents are granular by purpose.** Using the service, sharing, keeping, designating heirs and (future) generative use are separate events. One does not imply another.
- **Default deny.** HERMES serves nothing that a consent event does not explicitly permit.
- **Withdrawal is always possible while she is alive**, and its effects are defined in advance, per state.

**State machine for each user:**

```
S0  Not enrolled
 │   (consent event C1: use of the service — conversation + structuring + default retention)
 ▼
S1  Companion (ephemeral)
 │   Raw audio deleted after structuring [window: counsel to confirm].
 │   Notes visible only to her; deleted after rolling window unless kept.
 │
 ├──(C2: share — per note or per category, to named family members)──► Shared items visible to named
 │                                                                      recipients while she lives.
 │                                                                      Revocable per item.
 │
 ├──(C3: keep — per conversation/story/collection)──► Kept items leave the rolling window and enter the archive.
 │                                                     Raw audio retained for kept items only.
 │
 └──(C4: heir designation — named heirs per collection, steward, fallback order, sealed items)
      │
      ▼
S4  Legacy-designated (living)
 │   Archive accumulates; she can change C3/C4 at any time.
 │
 │   [C5: generative permission — NOT AVAILABLE in pilot; state exists in the model, locked]
 │
 │   Death notification by steward + confirmation by a second heir + documentation
 ▼
S5  Transition hold  [duration: counsel to confirm; proposal: 30 days]
 │   Archive frozen. No access changes. Any heir may lodge a dispute;
 │   a dispute extends the hold; the product does not adjudicate.
 ▼
S6  Inherited
     Access per C4. Steward administers. Heirs can add context (annotations, not edits).
     Her recordings are immutable. Export available to each heir for their designated collections.
```

**Withdrawal and capacity rules (proposed, all flagged for counsel):**

| Event | Proposed effect |
|---|---|
| She withdraws C1 | Service stops. Unkept data is deleted. **Open question:** do kept items and heir designations survive? Proposal: she is asked explicitly at the moment of withdrawal, and her answer is recorded. |
| She withdraws C2 (one item) | The item disappears from recipients' views immediately. |
| She withdraws C3 (one item) | The item returns to the rolling window, or is deleted at once if older than the window. |
| She changes C4 | The new designation replaces the old one. The ledger keeps history; HERMES enforces only the current version. |
| She can't complete a consent ceremony (possible capacity decline) | No new C2, C3 or C4 events are possible. Existing states are preserved. Companion conversation continues if C1 is valid. **Open question:** whether a fremtidsfullmakt holder can act, and for which events. |
| She dies without C4 | **Open question.** Proposal: kept items are held by the company for a defined period and then deleted, unless the law requires otherwise. No default access for payers. |

**The consent ceremony (pilot version):**
1. The consent text is read to her by the service, or by a family member, in plain language at a fixed version.
2. She affirms verbally, and the affirmation is recorded.
3. For C1 and C4 only, a named family member or independent witness is present and is recorded as such. Whether witnessing is needed, and whether it should be independent, is flagged for counsel.
4. A written confirmation goes to her, and to recipients or heirs where relevant.
5. A ledger entry is created: text version hash, affirmation recording hash, timestamp, witness, resulting state.

**Data sovereignty controls (proposal):**
- All storage and inference inside the EEA, subject to the T1 inventory. Every exception is documented and sent to counsel.
- Raw audio of kept items is stored separately from structured notes, with separate access keys.
- The consent ledger is append-only and exportable, so each heir can prove the provenance of what they hold.
- Deletion is verifiable: TECH can show that deleted data is gone from primary storage, and has documented the timeline for backups.

### 6.3 What must be decided before customer conversations vs. what can be iterated with families

| Item | Before discovery conversations (Day 3) | Before pilot commitments (Day 8) | Before pilot recordings (after sprint) | Iterate with families |
|---|---|---|---|---|
| Claims boundary list | **Required** | | | |
| Note-taking protocol for interviews (no AI processing without consent) | **Required** | | | |
| "Nothing stored permanently" removed from all materials | **Required** | | | |
| Pilot terms state that the start is conditional on legal review, and the money is refundable | | **Required** | | |
| Consent texts v1 (C1–C4) cleared by counsel | | | **Required** | Wording, tone and ceremony length |
| Retention windows confirmed | | | **Required** | How they're explained |
| DPIA completed or scoped to counsel's satisfaction | | | **Required** (per counsel) | |
| MDR qualification position (at least preliminary, in writing) | | | **Required** | |
| Data flow inventory: no unresolved non-EEA transfers | | | **Required** | |
| Tier B activity signals | | | Off unless cleared | Demand level (A4) |
| Heir designation UX | | | | **Iterate** (A5, A6) |
| Post-death pricing | | | | **Iterate** (A7) |
| Withdrawal-of-C1 handling for kept items | | | Counsel input needed | Families' expectations |
| Generative stage | | | | Probe only (A9). Never offered. |

### 6.4 Regulatory checkpoint summary: questions for counsel

Classification:
- **Blocking:** the pilot cannot record real audio without an answer.
- **Sprint-iterable:** we proceed on a stated assumption and counsel corrects it.
- **Deferrable:** future scope, no sprint dependency.

**B: Blocking (answers needed before pilot recordings; target a written answer within 3–4 weeks of intake)**

| # | Question |
|---|---|
| B1 | Is the pilot consent package (C1–C4 texts, ceremony, participant information, pilot agreement) adequate for the pilot? What must change? |
| B2 | Given the functions in Tier A, the exclusion of Tier C, the user population and the fact that we sell to adult children of elderly users: does the product qualify as a medical device? If there is residual risk, which specific features or statements create it? What qualification documentation should exist before the pilot? |
| B3 | Is Tier B (non-health activity signals) compatible with a non-medical intended purpose? If so, under what constraints? |
| B4 | What is the lawful basis for each processing purpose (conversation, structuring, sharing, keeping, post-mortem transfer)? Does health content she volunteers make explicit consent necessary for structuring? |
| B5 | Is retained voice of kept items biometric data in our processing context? What follows if it is? |
| B6 | What is the company's role (controller or processor) per phase and purpose? What contract structure follows with the user and with paying family members? |
| B7 | How do we handle consent capacity for this population? Is the proposed ceremony (verbal affirmation, witness for C1 and C4) adequate? What is the role of a fremtidsfullmakt holder? |
| B8 | Is a DPIA required before the pilot? What is its scope? Must it be completed before the first recording, or can it run in parallel with a limited pilot? |
| B9 | Do any non-EEA processing locations identified in the T1 inventory need a transfer mechanism before the pilot, or must they be removed? |

**I: Sprint-iterable (we proceed on the stated assumption; counsel corrects)**

| # | Question | Working assumption |
|---|---|---|
| I1 | Retention windows for raw audio and unkept notes | 72 hours / 30 days |
| I2 | Duration and mechanics of the post-mortem transition hold | 30 days; a dispute extends it; the company does not adjudicate |
| I3 | Is the claims boundary list sufficient as an internal control? What should be added? | The list as drafted on Day 2 |
| I4 | Effect of C1 withdrawal on kept items and heir designations | Ask her at withdrawal and record the answer |
| I5 | Handling of third-party data in inherited content | Heir-side views flag named third parties; no automatic redaction |
| I6 | Consumer law treatment of pilot terms (refundable, conditional start) | Standard refundable prepayment |

**F: Deferrable (future scope; include in the engagement, no sprint dependency)**

| # | Question |
|---|---|
| F1 | Legal status of deceased persons' data and her pre-mortem instructions in each target Nordic market. How her designation interacts with statutory inheritance and the estate. |
| F2 | Requirements for any generative stage: transparency and labeling of synthetic content, rights over a deceased person's voice and likeness, the consent standard for C5. |
| F3 | Archive continuity if the company ceases to operate: escrow, and transfer obligations to heirs. |
| F4 | A subscription contract that continues after the user's death, paid by family members: structure and consumer protections. |
| F5 | Cross-border sale within the Nordics: any national divergence that affects the consent architecture. |

**What REG brings to the intake session:**
- The narrative from Section 2.4.
- The data flow inventory from T1.
- The state machine and ceremony from Section 6.2.
- This question list.
- The claims boundary list.

**What REG leaves with:**
- Each question classified as B, I or F by counsel. Counsel may reclassify.
- Dates for written answers.
- An estimate of fees and timeline to pilot readiness.

### 6.5 Technical acceptance criteria table: what the consent and archive system must do by Day 14

Testing is on **synthetic data only**. "Must" criteria are required for a go. "Should" criteria are reported but not gating.

| ID | Criterion | Priority | Test | Owner |
|---|---|---|---|---|
| TC-01 | The data flow inventory covers all six engines: processing location, model providers, storage, and retention of every intermediate artifact. | Must | Document reviewed and signed by CTO and REG | TECH |
| TC-02 | No engine schema contains, computes or stores fields that score, classify or trend cognition, memory, mood or health. | Must | Schema audit record. Code search for prohibited field categories. Sample outputs inspected. | TECH |
| TC-03 | Each consent event (C1–C4) creates an append-only ledger entry: consent text version hash, affirmation recording hash, timestamp, witness field, resulting state. | Must | Create, attempt to modify (must fail), export | TECH |
| TC-04 | The state machine enforces transitions. No state can be reached without the required consent event, and no API path bypasses it. | Must | Negative tests: direct calls attempting to keep, share or designate without a consent event are rejected | TECH |
| TC-05 | Raw audio is deleted after structuring within the configured window for all unkept content. | Must | Time-advanced test; storage inspected; deletion log | TECH |
| TC-06 | Unkept structured notes are deleted at the end of the rolling window. | Must | Time-advanced test; storage inspected | TECH |
| TC-07 | Kept items and their raw audio are excluded from deletion jobs, and stored separately with separate access keys. | Must | Keep an item, run deletion jobs, verify it survives; verify key separation | TECH |
| TC-08 | HERMES denies by default. Every read path checks current consent state and recipient or heir designation. | Must | Access matrix test: each role × each item state. The only allowed reads are those permitted by consent. | TECH |
| TC-09 | Payers without a C2 share or C4 designation can't access any content. | Must | Payer-role access test returns nothing | TECH |
| TC-10 | Withdrawal of C2 for an item removes it from recipient views immediately. Withdrawal of C3 returns the item to the rolling window. | Must | Withdraw, then query as recipient and as user | TECH |
| TC-11 | A full export of an archive (audio, structured notes, consent ledger) in open formats can be read without our system. | Must | Export, then open with standard tools on a clean machine | TECH |
| TC-12 | Post-mortem flow: a steward notification plus second-heir confirmation enters the hold; the archive is frozen during the hold; a dispute extends the hold; release follows C4 exactly. | Must | End-to-end synthetic run, including the dispute path | TECH |
| TC-13 | Sealed items in C4 are not accessible to any heir, including the steward. | Must | Access test as steward and as each heir | TECH |
| TC-14 | No generative endpoint exists. The system can't produce text or audio attributed to the user that she did not say. | Must | Endpoint inventory. Summaries are labeled as system-generated and link to source audio. | TECH |
| TC-15 | System-generated summaries and indexes always cite their source recording, and the UI distinguishes them from her words. | Must | Sample inspection of the per-heir view | TECH |
| TC-16 | Xff → PIRAT produces a navigable archive (people, places, eras, recurring stories) from 30 days of synthetic conversation. | Should | Demo; 10 retrieval queries return correct, cited, verbatim excerpts | TECH |
| TC-17 | Reasoning motor 5 (if kept) returns only verbatim, cited excerpts, with no paraphrase attributed to her. | Should | 20 queries; any uncited or paraphrased-as-hers answer fails the test | TECH |
| TC-18 | The Tier B activity signal exists only behind a feature flag that defaults to off, with no family-facing UI. | Should | Flag state verified in config; UI inspected | TECH |
| TC-19 | Cost metering: inference and storage cost per synthetic user-month is recorded and reported to COM. | Should | Number delivered to the unit economics model | TECH |
| TC-20 | A capacity hold blocks new C2–C4 events while preserving existing states, and is recorded in the ledger. | Should | Set the hold, attempt C3 (rejected), verify existing kept items are unchanged | TECH |

**The Day 13 demo script follows the order of this table.** A failure on any "Must" row is reported as a failure, with the fix date. It is not reframed as partial success.

---

## Appendix: Sprint Rules of Engagement

1. **The internal narrative governs.** Any external statement that goes beyond Section 2.1 gets retracted, not defended.
2. **No real audio until B1 is cleared.** No exceptions for "just our own family".
3. **No seventh engine.** Proposals go to a parked list and are reviewed after the pilot starts.
4. **Generative content does not exist externally.** The single exception is the gate table, used in investor Q&A when someone asks.
5. **Evidence over enthusiasm.** Every claim on Day 14 carries its n. "Families love it" is not evidence; "2 of 3 parents agreed to try, 1 declined because…" is.
6. **REG reviews before anything leaves the building.** The turnaround commitment is 24 hours. Missing it is REG's failure, not permission to skip the review.
7. **Day 14 ends in a recorded decision:** go, conditional go, hold, or stop-and-reframe. "Let's keep going and see" is not an option.
