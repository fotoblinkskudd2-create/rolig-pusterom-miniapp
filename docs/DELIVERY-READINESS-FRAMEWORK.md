# Delivery Readiness Framework (Sprint Hours 42–48)

## 1. Overview

This framework helps the sprint coordinator check that the team's work is ready to hand off in the last six hours of the sprint. It makes sure every required artifact exists by hour 46, that each claim is labeled as fact, interpretation or assumption, that a human approves scope, design direction and the final handoff, and that someone who was never on the team can pick up the work and act on it. Start using it at hour 42. Walk through it in order. If you skip a gate, write down that you skipped it and why.

---

## 2. Delivery Artifacts Checklist

Every artifact must be finished, stored in the shared delivery location, and openable by someone outside the team **by hour 46**.

| # | Artifact | Acceptance criteria | Owner | Approver | Done |
|---|----------|---------------------|-------|----------|------|
| 1 | **Prototype** | • Runs from start to finish along the primary user journey with no dead ends<br>• Opens from one link or file, with no special setup (or the setup is written down)<br>• Fake, stubbed or placeholder parts are visibly marked<br>• Version is frozen and tagged; later edits go to a copy | Prototyping lead | Coordinator | ☐ |
| 2 | **Concept brief** | • Fits on 1–2 pages: problem, target user, proposed solution, why now<br>• Names the single primary user journey in scope<br>• Lists what is out of scope (links to the "Later" backlog)<br>• Readable by a non-designer without a walkthrough | Design lead | Scope approver | ☐ |
| 3 | **User flow** | • Shows every step of the primary journey, including entry and exit points<br>• Covers at least one error or "unhappy" path<br>• Each step maps to a screen or state in the prototype<br>• Steps the prototype does not build are marked as such | Design lead | Coordinator | ☐ |
| 4 | **Design decision log** | • Each decision has: what was decided, options considered, reason, evidence type (fact / interpretation / assumption)<br>• Each entry names who made or approved the decision<br>• Conflicts between agents are recorded with how they were resolved<br>• No decision rests only on "the team felt" without a label | Coordinator | Design direction approver | ☐ |
| 5 | **Findings summary** | • Every claim is tagged **[F] Fact**, **[I] Interpretation** or **[A] Assumption**<br>• Each fact links to its source (research note, session log, data)<br>• Heuristic evaluation results are labeled "Internal assessment — not user validation"<br>• Sample sizes and method limits are stated | Research lead | Coordinator | ☐ |
| 6 | **Assumptions register** | • Lists every unvalidated assumption in one place<br>• Each one has: risk if wrong (high/medium/low), how to test it, suggested owner<br>• Sorted by risk, highest first<br>• Cross-referenced from the findings and decision log | Research lead | Coordinator | ☐ |
| 7 | **Next steps & open questions** | • The top 2–3 critical risks, each with a mitigation plan and owner<br>• Concrete next actions (test, build, pivot, stop) with suggested sequence<br>• "Later" backlog of out-of-scope ideas, clearly separated<br>• Named contact for questions after the team disbands | Coordinator | Handoff approver | ☐ |
| 8 | **Sign-off record** | • All three gates recorded (scope, design direction, final handoff)<br>• Each gate shows approver name, date/time, decision, conditions<br>• Approvals come from named humans, never inferred by an agent | Coordinator | — | ☐ |

---

## 3. Hours 42–46: Integration & Documentation Phase

### 3.1 Coordinator activities, in order

1. **Hour 42 — Freeze inputs.** Tell all agents: no new research, no new features. Only finishing, fixing and documenting.
2. **Hour 42 — Confirm Gate 1 (Scope)** is signed. If it isn't, stop and get it signed before anything else (see the decision tree in 4.3).
3. **Hours 42–43 — Collect raw outputs** from every agent into one shared folder. Note anything missing.
4. **Hours 43–44 — Build the decision log** (see 3.2).
5. **Hours 44–45 — Draft the findings summary and assumptions register.** Tag every claim.
6. **Hour 45 — Get Gate 2 (Design direction)** approved.
7. **Hours 45–46 — Package everything** (see 3.3) and freeze the prototype version.

### 3.2 Merging agent findings into one decision log

- **Pull, don't summarize from memory.** Copy each agent's decisions and findings word for word into one table first. Edit after.
- **Remove duplicates.** If two agents report the same thing, merge them and keep both sources.
- **Show conflicts.** When agents disagree, record both positions, the evidence behind each, and who resolved it. If nobody has resolved it, it is an open question, not a decision.
- **Tag evidence type** on every row:
  - **Fact** — directly observed or measured, with a source you can point to.
  - **Interpretation** — a conclusion drawn from facts. Name the facts it rests on.
  - **Assumption** — believed but not checked. It goes into the assumptions register automatically.
- **Check the trail.** Pick three random decisions and trace each one back to its source. If any trail breaks, check every row.

### 3.3 Preparing the delivery package

- One entry point: a single index document that links to every artifact in reading order.
- Put a "Read this first" paragraph at the top of the index: what this is, what state it is in, what it is *not*.
- Use consistent file names and versions across all artifacts.
- Check access: open every link from an account outside the team.
- Remove working drafts, or move them to a clearly labeled archive folder.

### 3.4 Red flags: the work is not ready

- ☐ The prototype only works when a team member drives it.
- ☐ Findings use words like "users want" or "validated" without data from real users.
- ☐ The decision log has decisions with no owner or reason.
- ☐ The assumptions register is empty or has fewer entries than the decisions marked "assumption".
- ☐ Scope has grown since Gate 1 without a new approval.
- ☐ Two artifacts describe the primary journey differently.
- ☐ Any artifact still contains placeholder text such as "TBD" or "fill in".

**One red flag** means fix it before hour 46. **Three or more** means warn the approvers now that the handoff may slip.

---

## 4. Hours 46–48: Quality Control & Sign-Off Phase

### 4.1 Critical review checklist

Ideally someone who did not build the artifacts runs this review.

**Prototype**
- ☐ Runs end to end on a clean device or browser, three times in a row
- ☐ Primary journey completes without help
- ☐ Simulated or fake parts are labeled on screen or in the notes
- ☐ The "key moment" (the step the concept depends on) works reliably

**Claims**
- ☐ Every claim in the findings has an F / I / A tag
- ☐ Every fact links to a source that opens
- ☐ No interpretation is written as if it were a fact
- ☐ Heuristic results are never called "validation" or "user testing"

**Assumptions**
- ☐ Every assumption has a risk level and a test method
- ☐ High-risk assumptions show up in next steps

**Clarity**
- ☐ A person outside the team read the concept brief and repeated the main idea back correctly
- ☐ Jargon is removed or explained the first time it appears

### 4.2 Heuristic evaluation guidance (when users could not be recruited)

- **Label it.** Every page that shows results carries the line: *"Internal assessment by the sprint team. Not validated with users."*
- **Use a known set of heuristics** (for example, a standard usability heuristics list). Name the set you used.
- **Use at least two evaluators** working on their own, then merge results. Record how many evaluators there were.
- **Rate severity** for each issue on a simple scale (e.g. 0–4) and note where evaluators disagreed.
- **Stick to the primary journey.** Only score screens that are in scope.
- **Turn findings into assumptions.** Every "users will probably…" conclusion goes into the assumptions register with a user-test method attached.
- **State the limits:** evaluators know the design, can't stand in for real user context, and may share the same blind spots.

### 4.3 Approval gates and sign-off template

**Decision tree for every gate:**

```
Is the gate artifact complete and reviewed?
├── No  → Fix it. Do not ask for approval yet.
└── Yes → Present it to the named human approver.
          ├── Approved             → Record it. Move on.
          ├── Approved with conditions → Record the conditions, give each an owner and deadline. Move on.
          └── Rejected / unsure    → Stop work on dependent items. Record why.
                                     Agree on a fix and a new review time. Re-run the gate.
```

An agent may **prepare** a gate. Only a named human may **pass** it. Silence or "no objections" is not approval.

**Sign-off template (copy one block per gate):**

```
Gate:            [ ] 1 Scope   [ ] 2 Design direction   [ ] 3 Final handoff
Artifacts reviewed (with version):
Approver name / role:
Date and time:
Decision:        [ ] Approved   [ ] Approved with conditions   [ ] Not approved
Conditions (owner, deadline):
Known open points accepted at this gate:
Approver signature / recorded confirmation:
```

### 4.4 Documenting open points honestly

- Use plain labels: **Not tested**, **Partly tested (internal only)**, **Tested with users (n = __)**.
- Never round up. "Two evaluators found it clear" is not "users found it clear".
- Put each open point next to the decision it affects, not only in a list at the end.
- If a deadline forced a shortcut, say what was cut and what that changes about confidence.

---

## 5. Post-Sprint Handoff Readiness (Quick Reference)

### 5.1 What the receiving team needs to know before touching the prototype

- What it is for: exploring the primary journey, not a production build
- Which parts are real, faked or hard-coded
- Known bugs and how to get around them
- Version tag and where the frozen copy lives
- What *not* to change if they want to keep it comparable to the sprint findings
- Who to contact with questions, and until when

### 5.2 Communicating assumptions and risks

- Lead with the top 2–3 risks, not the full list.
- For each one, say plainly: *what we believe*, *why we're not sure*, *what happens if we're wrong*, *how to find out*.
- Give the full assumptions register as a reference, sorted by risk.
- In live handoffs, ask the receiving team to repeat back the riskiest assumption in their own words.

### 5.3 "Next Steps & Open Questions" template

```
1. What we learned (3–5 bullets, each tagged F / I / A)

2. Critical risks (max 3)
   Risk:
   Why it matters:
   How we'll address it post-sprint:
   Owner:
   Check-in date:

3. Assumptions to test first (top 3 from the register)
   Assumption:
   Suggested test:
   What result would change our direction:

4. Recommended next actions (in order)
   Action / owner / target date

5. Open questions (no answer yet)
   Question / who can answer it / what it blocks

6. Later backlog (out of scope for this sprint)
   Idea / source / why it was deferred

7. Contacts and artifact links
```

---

## 6. Common Failure Modes

| Failure mode | How to catch it | Fix in the final hours |
|---|---|---|
| **Unlabeled assumptions** | Search the findings for "users want", "users will", "clearly", "obviously" | Tag the claim; if there's no source, mark it **A** and add it to the register |
| **Incomplete user flow** | Walk the flow and the prototype side by side, step by step | Add the missing steps or mark them "not prototyped" |
| **Prototype breaks at the key moment** | Run it three times on a clean device before hour 46 | Hard-code that path; document the workaround; keep a recorded walkthrough as backup |
| **Stakeholders confused about scope** | Ask an approver to name what is *out* of scope | Add an explicit "Not in this sprint" section to the brief and the index |
| **Heuristic review presented as validation** | Look for "validated", "tested" or "confirmed" near heuristic results | Reword the claim and add the internal-assessment label |
| **Agent-assumed approval** | Check every gate record for a named human and a timestamp | Get real sign-off, or record the gate as "not passed" |
| **Scope creep in the last hours** | Compare the current prototype to the Gate 1 scope | Move extras to the Later backlog or hide them in the frozen version |
| **Package can't be found or opened** | Open everything from an outside account | Fix permissions; make sure one index links to everything |
| **Conflicting stories across artifacts** | Read the brief, flow and findings back to back | Pick the version the decision log supports; update the rest |
