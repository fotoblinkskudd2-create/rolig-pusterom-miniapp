# AI Product Innovation Pipeline — 2026

Investment-ready discovery → validation → recommendation package. Five AI product concepts, prototype specs, one selected lead concept with a GitHub-ready technical spec, five VibeCode app builds, and five deep research reports.

| Part | File | Contents |
|------|------|----------|
| 0 | this file | Method, scoring, headline answer |
| 1 | [01-concepts.md](01-concepts.md) | Five unmet needs → five concepts, business model canvases, GTM, competition, MVP architecture |
| 2 | [02-prototype-specs.md](02-prototype-specs.md) | Wireframes / user flows, AI capabilities, KPIs, 90-day roadmaps |
| 3 | [03-recommendation-tend.md](03-recommendation-tend.md) | **Selected concept: Tend** — exec summary, why it wins, technical spec, GTM milestones, 90-day launch plan |
| 4 | [04-vibecode-apps.md](04-vibecode-apps.md) | Five VibeCode iOS/Web apps with paste-ready build prompts |
| 5 | [05-research-reports.md](05-research-reports.md) | Five 500-word research reports |
| — | [`../../prototypes/tend.html`](../../prototypes/tend.html) | Clickable, single-file prototype of the lead concept (open in a browser, no server) |

---

## Headline answer

**Build Tend: an AI care-coordination copilot for family caregivers of aging parents.** Launch it consumer-first in the US, and sell it to employers as a benefit once retention data exists.

Why Tend over the other four:

1. **The pain is acute and it lasts.** 63M US adults are unpaid caregivers (AARP/NAC, *Caregiving in the US 2025*). The job runs for years, so retention comes from the situation itself, not from habit design.
2. **The money exists already.** Employers lose productivity to caregiving. CMS's GUIDE dementia model (live since July 2024) pays for caregiver support. Families already spend out of pocket.
3. **The AI is ready.** The core jobs are reading documents, summarizing, extracting tasks and drafting messages. 2025–26 LLMs do these reliably when the output is checked against structured data. No frontier research is needed.
4. **It gets harder to copy over time.** A longitudinal family care graph (meds, providers, documents, decisions) gets more valuable every week and is painful to leave.

## Method

**Phase 1 discovery** combined (a) secondary research: AARP, NY Fed, UNEP, NAEP, EU EPBD, peer-reviewed retention literature; (b) trend analysis: on-device models, agentic workflows, voice-native interfaces; (c) a problem-validation screen applied to every candidate need:

| Criterion | Weight | Question |
|-----------|-------:|----------|
| Severity | 20% | How much does the problem cost the person (money, time, health)? |
| Frequency / duration | 15% | Daily? Weekly? For how many years? |
| Willingness to pay | 20% | Does an identifiable budget holder already spend money on it? |
| Market gap | 15% | Do current solutions leave the core job undone? |
| AI leverage | 15% | Does AI change the cost curve 10×, or just add a feature? |
| Feasibility / risk | 15% | Can a 4–6 person team ship a safe MVP in ≤ 16 weeks? |

**Scores (1–5, weighted):**

| Concept | Sev. | Freq. | WTP | Gap | AI lev. | Feas. | **Weighted** |
|---------|----:|----:|----:|----:|----:|----:|----:|
| **Tend** — caregiver coordination | 5 | 5 | 4 | 4 | 4 | 4 | **4.35** |
| Ledger — household debt & paperwork copilot | 5 | 4 | 3 | 4 | 5 | 3 | 4.00 |
| Readwell — AI reading tutor (K-3) | 4 | 5 | 3 | 3 | 4 | 3 | 3.65 |
| Rolig — local-first stress micro-coach | 4 | 5 | 2 | 3 | 3 | 5 | 3.60 |
| Retrofit — home energy renovation planner | 3 | 2 | 4 | 4 | 4 | 3 | 3.35 |

## Data provenance

Figures cite public sources available through mid-2026. Market-sizing and unit-economics numbers marked *assumption* are modeling inputs, not observed data. Re-verify every external figure before you put it in a data room. Product names are working titles and have not had trademark clearance.

Nothing in Part 5 is investment advice.
