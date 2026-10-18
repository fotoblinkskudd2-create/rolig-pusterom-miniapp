# PHASE 1: RESEARCH SCOPING & FEASIBILITY

Status: **OPEN — awaiting user inputs (Q1–Q12)**
Pipeline: P1 Scoping → P2 Evidence/Literature → P3 Methodology → P4 Design spec → P5 Prototype → P6 Validation → P7 Handoff
Repo baseline: `rolig-pusterom-miniapp` v1.1 (4 pages, pure HTML, localStorage, Isolation Mirror → Labben/Grok prompt). Known gaps per `HULL.md`: PWA/icon, iOS home screen, dark mode, real-iPhone test.

---

## Objective

Decide, in writing, **what question this project answers, for whom, inside which boundaries, and whether it is feasible with the available people, time, tools and data constraints.** Nothing gets built or researched in depth until these five are locked:

1. Research question (one sentence, falsifiable or at least evaluable)
2. Target user + context of use
3. In-scope / out-of-scope list
4. Go / Conditional-go / No-go feasibility verdict
5. Resource + timeline envelope

---

## Required User Inputs

Answer inline. Short answers are fine. "Unknown" is a valid answer — it becomes a flagged risk.

| # | Question | Why it matters |
|---|----------|----------------|
| Q1 | **Domain/category.** Is this project *Rolig 2.0* (evolving this app), a different project, or research *around* the app (e.g. "does a 60-sec breathing check-in reduce self-reported stress")? | Sets everything downstream. Default assumption if unanswered: Rolig 2.0. |
| Q2 | **Team expertise.** Who is on it and at what level? (dev / UX / psychology-clinical / research methods / writing). Solo? | Determines method complexity and which phases need external review. |
| Q3 | **AI coordination model.** Pick one: (a) Claude leads, you hand off to Grok manually; (b) Claude = architecture/code, Grok = ideation/critique/"Labben"; (c) parallel — both get same brief, you merge. | Defines what every `[FOR GROK]` block must contain. |
| Q4 | **Research type.** Exploratory (what do users need?), design research (build → test → iterate), or evaluative (does X work, measured)? | Choose method family in Phase 3. |
| Q5 | **Target user.** Who opens this app, when, in what state? (e.g. adults with stress/low mood; people with dissociation/DID; general public). Age floor? | Drives UX, risk level, and ethics. |
| Q6 | **Health claim boundary.** Is Rolig a *wellbeing tool* (no clinical claims) or will it claim to *treat/reduce* a condition? | A treatment claim can push it toward medical-device territory (EU MDR) — a large scope change. |
| Q7 | **Data boundary.** Must "Alt blir på denne enheten" stay absolute? Is sending notes/prompts to Grok or any cloud acceptable, and if so with what consent? | Isolation Mirror → Grok already implies data leaving the device via the user's own copy-paste. Need an explicit rule. |
| Q8 | **Crisis handling.** Should the app surface crisis resources (e.g. 113, Mental Helse 116 123, Kirkens SOS 22 40 00 40) when check-ins are consistently low? | Non-negotiable risk item for any mood app; affects scope. |
| Q9 | **Prototype definition.** What does "working prototype" mean at the end? (installable PWA on iPhone / tested with N real users / measurable outcome / demo only) | This is the success criterion for the whole pipeline. |
| Q10 | **Time + budget.** Hours per week, hard deadline, money for tools/hosting/participants (NOK, can be 0). | Feasibility math. |
| Q11 | **Evidence bar.** Do you want claims backed by peer-reviewed sources, or is practitioner/user feedback enough? | Sizes Phase 2. |
| Q12 | **Output language + audience.** Norwegian, English, both? Who reads the final output (you, users, funder, clinician, public)? | Format of all deliverables. |

---

## Deliverables from This Phase

| Deliverable | Format | Done when |
|-------------|--------|-----------|
| D1 Research question statement | 1 primary RQ + ≤3 sub-questions | Answerable with the chosen method within the time envelope |
| D2 Scope boundaries | In / Out / Parked lists | Every feature idea from v1.1 notes is sorted into one of the three |
| D3 Preliminary feasibility assessment | Scored matrix (below) + verdict | No dimension scored 1 without a mitigation |
| D4 Resource & timeline estimate | Phase table, hours, NOK, owner (you/Claude/Grok) | Sums fit inside Q10 |
| D5 Decision log v1 | `[FOR GROK]` block | Grok can continue without reading this chat |

---

## Sub-steps

1. **Classify the project** (from Q1, Q4) — Outcome: one of `PRODUCT-EVOLUTION`, `USER-RESEARCH`, `EFFICACY-STUDY`, `HYBRID`.
2. **Draft the research question** (from Q1, Q4, Q5) — Outcome: RQ in PICO-light form: *Population · Intervention · Comparison (or none) · Outcome*.
3. **Draw scope lines** (from Q6, Q7, Q9) — Outcome: In/Out/Parked lists; health-claim and data rules stated as hard constraints.
4. **Run risk screen** (from Q5–Q8) — Outcome: risk register with severity × likelihood and a mitigation per item.
5. **Score feasibility** (from Q2, Q10, Q11) — Outcome: matrix + Go / Conditional-go / No-go.
6. **Estimate resources** — Outcome: hours/NOK per phase, split Claude / Grok / you.
7. **Freeze decision log** — Outcome: `[FOR GROK]` block v1, versioned `P1-v1`.

### Decision tree — project class (Sub-step 1)

```
Q6 = clinical claim?
├─ YES → STOP: scope warning. Either drop claim (→ wellbeing) or
│        add regulatory track (MDR classification, ethics review). Re-answer Q6/Q10.
└─ NO
   └─ Q4 =
      ├─ "build → test → iterate"   → PRODUCT-EVOLUTION (Rolig 2.0)
      ├─ "what do users need?"      → USER-RESEARCH (interviews/diary study first)
      ├─ "does X work, measured?"   → EFFICACY-STUDY
      │    └─ Q2 lacks research-methods skill? → downgrade to pilot/feasibility study
      └─ mixed                       → HYBRID (research spike, then build)
```

### Decision tree — data boundary (Sub-step 3)

```
Q7: local-only absolute?
├─ YES → Grok handoff carries only user-copied, user-initiated text; app never transmits.
│        Prototype = static/PWA, no backend. Export stays .txt.
└─ NO  → What leaves the device?
         ├─ Anonymous usage stats only → consent screen + no free-text
         └─ Notes/mood data           → GDPR art. 9 (health data): explicit consent,
                                         DPIA, data processor terms. High cost → flag.
```

### Feasibility matrix (filled in Sub-step 5)

| Dimension | 1 = blocker · 3 = manageable · 5 = trivial | Score | Mitigation |
|-----------|---------------------------------------------|-------|------------|
| Technical (pure HTML/PWA ability) | | | |
| Expertise coverage (Q2) | | | |
| Time (Q10) | | | |
| Budget (Q10) | | | |
| Ethics / user safety (Q5, Q8) | | | |
| Regulatory (Q6, Q7) | | | |
| Access to test users (Q9) | | | |
| Evidence availability (Q11) | | | |

Verdict rule: any **1** → No-go until mitigated · any **2** → Conditional-go · otherwise Go.

---

## Dependencies, Risks, Resources

| ID | Risk | Sev | Note |
|----|------|-----|------|
| R1 | Health claim drift (wellbeing → treatment language) | High | Locks into Q6; copy review each phase |
| R2 | Privacy promise contradicted by Grok/cloud handoff | High | Locks into Q7 |
| R3 | No crisis path for users in acute distress | High | Locks into Q8 |
| R4 | Solo builder, no clinical reviewer | Med | Q2; plan one external review checkpoint |
| R5 | No real-device testing (HULL.md gap) | Med | Must be in Phase 5/6 plan |
| R6 | Claude ↔ Grok context loss | Med | Decision log versioned per phase |

Dependencies: Phase 2 cannot start without D1 + D2. Phase 3 cannot start without D3 verdict ≠ No-go.

---

## Quality checkpoint (exit criteria for Phase 1)

- [ ] RQ fits in one sentence and names population + outcome
- [ ] Health-claim rule and data rule written as hard constraints
- [ ] Crisis-resource decision made (yes/no + where)
- [ ] Feasibility verdict recorded with scores
- [ ] Time/NOK estimate ≤ Q10 envelope
- [ ] `[FOR GROK]` block updated and versioned

---

## [FOR GROK] — Project state P1-v0 (pre-input)

```xml
<project_state version="P1-v0" owner="user" lead_ai="claude" secondary_ai="grok">
  <project>rolig-pusterom-miniapp → candidate scope: Rolig 2.0 (UNCONFIRMED)</project>
  <baseline>
    v1.1: pure HTML, 4 pages (Innsjekk, Pusterom, Små grep, Historikk),
    localStorage only, .txt export, Isolation Mirror generates a prompt the user
    pastes into Labben/Grok-bot (/lab). No server, no account.
  </baseline>
  <phase current="1" name="Research Scoping and Feasibility" status="awaiting_user_input"/>
  <hard_constraints_proposed>
    <c id="HC1">No clinical/treatment claims unless user explicitly opts into regulatory track</c>
    <c id="HC2">User data stays on device; any off-device transfer is user-initiated and explicit</c>
    <c id="HC3">Mood app must define a crisis-resource path</c>
  </hard_constraints_proposed>
  <open_questions>Q1 domain · Q2 team · Q3 AI model · Q4 research type · Q5 target user ·
    Q6 health claim · Q7 data boundary · Q8 crisis handling · Q9 prototype definition ·
    Q10 time/budget · Q11 evidence bar · Q12 language/audience</open_questions>
  <grok_role>Do NOT advance phases. Allowed: critique the open questions, propose
    missing risks, stress-test HC1–HC3. Return findings as a bullet list tagged [GROK→CLAUDE].</grok_role>
</project_state>
```

---

**Next Step Trigger:** Answer Q1–Q12 (paste back in any order). Phase 1 deliverables D1–D5 get filled from your answers; Phase 2 starts only after you say so.
