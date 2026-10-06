# FIVEFOLD: Product & Technical Specification

**A life transformation app with an AI coach across five domains: fitness, cycling, finance, wardrobe and career**
Version 0.1 · Draft for build planning

---

## 1. Product Vision Statement

Fivefold is a paid AI coaching platform for 25–45-year-olds who already use three to six single-purpose apps (Strava, MyFitnessPal, YNAB, LinkedIn, a notes app full of outfit screenshots) and still don't feel they're changing. The core idea is that **these life domains share one budget of time, energy, money and willpower**, and no existing app plans across them. Fivefold runs a single daily plan across fitness, cycling, finances, wardrobe and career. It adjusts difficulty using your actual recovery, spending and workload data. It wraps that plan in structured 90-day and 12-month programs with friends and community holding you accountable. The promise: *one coach, one plan, one score: measurable change in 90 days.*

---

## 2. Core Features by Domain

All domains write to the same **Unified Event Model** (see §6.3), so every action is a timestamped, typed event that the coach and the analytics layer can correlate.

### 2.1 Fitness (Strength & General Conditioning)
- **Tracked metrics:** sessions/week, volume load (sets × reps × kg) per muscle group, estimated 1RM (Epley/Brzycki), bodyweight and waist trend (7-day rolling average), resting HR, HRV, sleep duration, subjective readiness (1–5).
- **Data sources:** Apple HealthKit, Google Health Connect, Garmin/Whoop/Oura via aggregator, plus manual logging with a fast "repeat last session" entry.
- **AI integration:**
  - Auto-progression: suggests the next session's load from the last RPE and the readiness score.
  - Deload detection: three or more days of falling HRV combined with flat volume triggers a suggested deload.
  - Conflict awareness: avoids putting heavy leg days within 24h of planned cycling intervals.

### 2.2 Cycling Performance
- **Tracked metrics:** FTP (and W/kg), weekly TSS/CTL/ATL/TSB (fitness/fatigue/form), time-in-zone, ride count and distance, critical power curve points (5s/1m/5m/20m), cadence, indoor vs. outdoor split.
- **Data sources:** Strava API (activity import), Garmin Connect, Wahoo, Zwift export (.fit files), direct .fit upload.
- **AI integration:**
  - Periodized weekly structure (base / build / peak / recovery) built from the program goal (e.g. "+20W FTP in 90 days", "first 150 km gran fondo").
  - Ramp-rate guardrail: keeps the CTL increase at or below 5–7/week to limit injury and burnout.
  - Post-ride debrief prompt: "Your 20-min power was 4% above target, so threshold sessions move up next week."
- **Positioning:** Fivefold does not replace Strava's social feed. It imports from Strava and adds coaching and cross-domain context.

### 2.3 Personal Finance
- **Tracked metrics:** net worth, savings rate (%), monthly spend by category, debt balance and payoff ETA, emergency-fund months, no-spend days, discretionary-spend volatility.
- **Data sources:**
  - Open banking: Plaid (US/CA), Tink or GoCardless Bank Account Data (EU/Nordics, PSD2).
  - Manual CSV import as a fallback.
  - Manual quick-log for cash.
- **AI integration:**
  - Auto-categorization with user correction (the model learns per user).
  - Impulse-spend detection: flags late-night or high-stress-day purchases and links them to sleep/HRV data. This is the clearest example of cross-domain coaching (§7.3).
  - Debt strategy simulation (avalanche vs. snowball) with payoff dates.
  - Budget envelopes that link to other domains: "Wardrobe envelope: 600 kr left this quarter. The jacket you saved is 1,400 kr."
- **Constraint:** read-only access. Fivefold never moves money, which keeps it out of payment regulation.

### 2.4 Wardrobe Optimization
- **Tracked metrics:**
  - Item count, cost-per-wear (CPW), wear frequency, and dormant items (unworn for 90+ days).
  - Capsule completeness (% of a target capsule owned) and outfit repeat rate.
  - Quarterly wardrobe spend against the budget envelope.
- **Data sources:**
  - Photo capture with on-device background removal and auto-tagging (category, color, season).
  - Outfit-of-the-day logging with one tap from the home screen widget.
- **AI integration:**
  - Gap analysis: "Your capsule is 80% complete. A neutral mid-layer would unlock 14 new outfits."
  - Buy/no-buy coach: checks a planned purchase against CPW projection, the budget envelope and redundancy with owned items.
  - Body-change aware: when the fitness waist trend drops more than about 4 cm, it suggests a fit review rather than more purchases.
  - Context outfits: suggests what to wear for tomorrow's calendar events (interview, client meeting) using career-module data.
- **Scope guard:** no shopping marketplace at launch. Affiliate links are optional and clearly labelled (§8).

### 2.5 Career Advancement
- **Tracked metrics:**
  - Deep-work hours per week, skill-practice hours per target skill, and portfolio/output artifacts shipped.
  - Applications, networking touches and interviews (pipeline funnel).
  - Compensation trajectory, certification progress, and weekly self-rated "career momentum" (1–10).
- **Data sources:** calendar read access (Google/Microsoft) for focus-block detection, manual logging, and optional pasting of LinkedIn/CV text for skills-gap analysis.
- **AI integration:**
  - Skills-gap map: compares the target role's requirements (parsed from 3–5 user-supplied job postings) with the current profile and builds a learning plan.
  - Weekly "career sprint" with one visible output (a post, a project, a conversation).
  - Interview prep mode: mock-question drills generated from the target posting, scored against a rubric.
  - Energy-aware scheduling: hard cognitive tasks go on high-readiness mornings.

---

## 3. AI Coaching Engine

### 3.1 Architecture
Use a **deterministic planner plus an LLM narrator**. Don't let a language model decide training load or financial advice on its own.

| Layer | Responsibility | Implementation |
|---|---|---|
| **Signal ingestion** | Normalize events from wearables, banks, manual logs | Event pipeline → feature store (daily per-user features) |
| **State model** | Per-domain readiness, adherence, trend, risk | Rules plus lightweight gradient-boosted models (e.g. churn/lapse risk, impulse-spend risk) |
| **Planner** | Chooses today's actions across domains under constraints (time budget, recovery, money) | Constraint solver / scored rule engine. Deterministic and testable |
| **Narrator** | Turns the plan into a personal, motivating message; handles chat Q&A | LLM (Claude API) with structured context, tool calls to read user data, strict output schema |
| **Safety & guardrails** | Medical/financial red flags, tone limits, no fabricated numbers | Pre/post validators; numbers only come from the planner, never invented by the LLM |

**Why this split:**
- Load prescriptions and money numbers must be reproducible and auditable.
- The LLM provides empathy, framing and conversation.
- It also keeps inference costs predictable: one structured call per user per day plus on-demand chat.

### 3.2 Daily Prompt Logic ("The Daily Five")
Every morning, at a time the user picks or one learned from first app open, the user receives:
1. **One focus action per active domain**, at most 5, with a time estimate. The planner caps the total at the user's declared daily time budget (e.g. 75 min).
2. **One "keystone" action.** This is the highest-leverage action today, chosen by expected impact × adherence probability.
3. **A short context line** explaining why: "HRV is down 12%, so today's ride is Zone 2 instead of intervals. Use the saved energy for your portfolio task."

**Selection algorithm (per action candidate):**
- `score = goal_impact × adherence_probability × readiness_fit − conflict_penalty`
- `goal_impact` measures distance-to-milestone reduction.
- `adherence_probability` comes from the user's history for this action type, time of day and weekday.
- `conflict_penalty` covers collisions in recovery, time, budget or calendar.
- Keep the highest-scoring set within the time budget (a knapsack problem; greedy is good enough at 5 items).

**Evening check-in (30 seconds):**
- Tick done/skipped for each action and rate energy 1–5.
- One optional free-text reflection; the LLM extracts tags such as "stressed", "work deadline" or "slept badly".

### 3.3 Adaptation Algorithm
- **Difficulty band per domain** (levels 1–10). The system aims for a 70–85% completion rate. This range follows the motivation research idea of challenge just above current skill.
  - Above 85% for 7 days: raise one level.
  - Below 60% for 5 days: drop one level and simplify (fewer actions, smaller steps).
  - Two zero-completion days in a row: switch to **"Minimum Viable Day"**, one 2-minute action per domain, to protect the streak and identity.
- **Life-load detection:** calendar density, sleep debt and spending spikes raise a "high load" flag. The system then cuts total volume by 30–50% across domains rather than letting the user fail everywhere.
- **Personal learning:** the system tracks per-user response curves (e.g. "this user's adherence drops after 3 hard days in a row") and feeds them back into `adherence_probability`.

### 3.4 Motivational Mechanisms
- **Identity framing:** progress is phrased as "you are becoming someone who…", tied to the user's stated identity goal from onboarding.
- **Coach personas:** three tone presets (Direct, Supportive, Analytical) that change only the narrator's style, not the plan.
- **Implementation intentions:** every action gets a when/where cue ("After coffee, at desk").
- **Loss-aversion streak shields** (§4).
- **Weekly review:** each Sunday the AI writes a summary covering wins, one pattern noticed and the plan for next week. It can be shared.
- **Hard guardrails:**
  - Detected disordered-eating language, overtraining signs, or a debt crisis trigger a soft escalation to professional resources and stop aggressive targets.
  - No shame-based messaging, ever.

---

## 4. Social & Gamification Layer

### 4.1 Core Currency: The Fivefold Score
- **Daily score of 0–100.** It is a weighted adherence across active domains, multiplied by a consistency factor.
- Scored on **effort relative to your own plan, not absolute performance.** A beginner and an elite cyclist compete fairly, which is the main difference from Strava leaderboards.
- Domain sub-scores feed a **radar chart profile** ("your pentagon"), the product's visual signature.

### 4.2 Challenge Types
| Type | Format | Example |
|---|---|---|
| **1v1 Duel** | 7 days, head-to-head score | "Beat Martin's Fivefold Score this week" |
| **Squad Challenge** | 3–8 friends, shared goal, team total | "Squad saves a combined 20,000 kr in 30 days" |
| **Domain Sprint** | Single domain, 14 days | "No-spend fortnight", "500 km in October" |
| **Cross-Domain Combo** | Multi-domain challenge | "Ride 3×, log every expense, one portfolio piece/week" |
| **Community Season** | 90-day global season aligned with program cohorts | Season leaderboards, badges, end-of-season recap |

### 4.3 Leaderboards
- **Scopes:** friends, squad, cohort (people who started the same program the same week), and global (opt-in).
- **Normalized metrics:** Fivefold Score, adherence %, improvement % vs. baseline. Leaderboards never rank absolute net worth or salary.
- **Leagues:** weekly promotion/relegation in 30-person brackets matched by activity level. This keeps competition close and retains mid-tier users.

### 4.4 Streaks & Community Mechanics
- **Personal streak:** at least one action completed per day.
- **Streak shields:** earned by weekly consistency (max 2 banked) and used automatically on a missed day.
- **Squad streak:** extends only if every member completes their Minimum Viable Day. This adds peer accountability without public shaming.
- **Kudos & nudges:** one-tap "push" to a friend, rate-limited to avoid spam.
- **Privacy by default:**
  - Finance and wardrobe data are never shared by default. Only scores and percentages are visible.
  - Each domain has its own visibility setting: private, friends or public.

### 4.5 Badges & Progression
- Milestone badges tied to program milestones (§5), not trivial actions.
- User level based on cumulative consistency. It unlocks cosmetic profile themes, not pay-to-win advantages.

---

## 5. Program Framework

### 5.1 Program Structure
Programs are **versioned templates** (JSON definitions stored server-side) made of:
- **Goal set:** 1–5 domain goals with a target metric, baseline and deadline.
- **Phases:** ordered blocks with focus, intensity range and duration.
- **Milestones:** measurable checkpoints auto-generated from goal and baseline.
- **Habits:** the daily/weekly action pool the planner picks from.
- **Rules:** progression and regression conditions.

### 5.2 The 90-Day Template ("Transformation Sprint")
| Phase | Weeks | Focus | Intensity |
|---|---|---|---|
| **Foundation** | 1–2 | Baseline, habit installation, logging reliability | Levels 1–3 |
| **Build I** | 3–6 | Progressive overload across domains | Levels 3–6 |
| **Consolidate** | 7 | Deload week, review, re-baseline | Drop 2 levels |
| **Build II** | 8–11 | Targeted push on 1–2 priority domains | Levels 5–8 |
| **Prove** | 12–13 | Test week: FTP test, 1RM/AMRAP, net-worth snapshot, wardrobe audit, career artifact ship | Peak, then taper |

### 5.3 The 12-Month Template ("Year of Five")
- **4 × 90-day sprints.** Each quarter has a different primary domain, chosen by the user or recommended from baseline gaps. The other domains run in maintenance mode.
- **Annual anchors:** January baseline, quarterly re-assessment, and a December "Year in Review" report.
- Rolling goals: each sprint's end metrics become the next sprint's baseline.

### 5.4 Auto-Generated Milestones
- **Input:** baseline value, target value, deadline, and the domain's realistic improvement curve. Curves come from published norms, e.g. FTP +5–15% in 12 weeks for an untrained-to-trained rider.
- **Generation:**
  1. Interpolate along a **front-loaded concave curve**, not linear, because early gains are faster.
  2. Place milestones at weeks 2, 4, 6, 9 and 13.
  3. Each milestone gets a pass threshold of 85% of target.
- **Realism check:** if the target exceeds the 90th percentile for the given baseline, the coach pushes back before the program starts ("A 40% FTP jump in 90 days is unlikely. Here's an ambitious but achievable target.").
- **Examples:**
  - Finance: "Emergency fund 1 → 3 months" turns into monthly transfer targets.
  - Career: "Senior role offer" turns into skill hours, three portfolio artifacts, 20 networking touches, eight applications and interviews.

### 5.5 Progression Logic
- **Milestone hit:** celebration, badge, and an optional target raise.
- **Milestone missed by under 15%:** extend 1 week with no penalty.
- **Missed by over 15%:** the coach runs a short "recalibration" conversation and the target is re-forecast. The program goal is never silently lowered; the user confirms.
- **Life pause:** freeze a program for up to 14 days (illness, travel) without losing progress.

---

## 6. Technical Architecture

### 6.1 Stack
| Layer | Choice | Rationale / Trade-off |
|---|---|---|
| **Mobile** | React Native (Expo, New Architecture) + native modules for HealthKit/Health Connect, widgets, Live Activities | One codebase; native modules where it matters. Trade-off: widgets/watch need Swift/Kotlin anyway. Budget for it |
| **Web dashboard** | Next.js (React) + shared TypeScript domain package with mobile | Shared types/validation; dashboard can be heavy on charts |
| **API** | Node.js (TypeScript) on NestJS *or* Go for ingestion workers | TS for product velocity; Go for high-throughput webhook/ingestion services |
| **API style** | REST (OpenAPI 3.1) for public/partner API + GraphQL BFF for clients | Platform-agnostic, versionable; GraphQL reduces dashboard over-fetching |
| **Primary DB** | PostgreSQL (managed: AWS RDS/Aurora or Neon) | Relational integrity for users, programs, social graph |
| **Time-series** | TimescaleDB extension on Postgres | Avoids a second datastore in v1; migrate hot paths to ClickHouse at scale |
| **Cache / queues** | Redis (leaderboards via sorted sets, rate limits) + SQS/Kafka for event pipeline | Sorted sets make real-time leaderboards cheap |
| **Object storage** | S3 + CDN | Wardrobe images, report exports |
| **AI** | Claude API (current Sonnet-class for daily narration and chat; Haiku-class for categorization/tagging); on-device Core ML / ML Kit for image segmentation | Mix models by task to control cost; on-device vision keeps wardrobe photos private and cheap |
| **ML (non-LLM)** | Python service (LightGBM/scikit-learn) for adherence and lapse prediction | Small, explainable, cheap |
| **Push** | APNs + FCM via a notification service (OneSignal or custom on top of SNS) | Need per-user send-time optimization and quiet hours. Custom gives control |
| **Auth** | Sign in with Apple/Google + email magic link; OAuth tokens for integrations stored in KMS-encrypted vault | Apple requires SIWA if other social logins exist |
| **Payments** | RevenueCat (wraps App Store / Play Billing) + Stripe for web | Handles cross-platform entitlement sync |
| **Observability** | OpenTelemetry → Datadog/Grafana; Sentry for clients | |

### 6.2 Core Services
- **Identity & Entitlements**
- **Integration Hub:** OAuth connectors, webhooks and polling for Strava, Garmin, Plaid/Tink, calendar. Isolated so a third-party outage never takes down core.
- **Event Ingestion:** normalize into Unified Events, dedupe, write to Timescale.
- **Feature Builder:** nightly plus incremental daily aggregates per user.
- **Coach Service:** planner, narrator and guardrails.
- **Program Service:** templates, milestones, progression.
- **Social Service:** graph, challenges, leaderboards, feeds.
- **Notification Service:** scheduling, send-time optimization, quiet hours, frequency caps.
- **Analytics/Insights Service:** correlation jobs, forecasts.

### 6.3 Database Schema Priorities (Unified Data Model)
**Core entities:**
- `users`, `profiles` (timezone, time budget, coach persona, privacy settings)
- `domains` (enum: fitness, cycling, finance, wardrobe, career) and `user_domain_settings` (active, level, visibility)
- **`events`** (hypertable) is the backbone:
  - `id, user_id, domain, type, occurred_at, source, value_numeric, unit, payload_jsonb, ingest_id`
  - Typed by `type` (e.g. `workout.set`, `ride.completed`, `txn.posted`, `outfit.logged`, `focus.block`).
  - `payload_jsonb` holds domain detail, validated by versioned JSON schemas.
- `daily_features` (user_id, date, domain, feature_key, value) is the feature store the planner reads.
- `programs`, `program_templates`, `phases`, `milestones`, `program_enrollments`
- `plans` and `plan_actions` (the Daily Five as generated, plus completion status)
- `challenges`, `challenge_participants`, `squads`, `friendships`, `score_daily`
- `wardrobe_items` (relational: wear counts, CPW need joins), `accounts` / `transactions` (finance, mirrored from aggregator)
- `coach_messages` (conversation history, with retention policy)

**Priorities:**
1. Event model and idempotent ingestion first. Everything else derives from it.
2. Row-level tenancy via `user_id` on every table; encrypt finance payloads at the column level.
3. Treat scores and features as **derived data that can always be rebuilt** from events, so formulas can change without migrations.

### 6.4 API Design
- **Versioned REST** (`/v1/...`) defined OpenAPI-first and code-generated into clients for iOS, Android, web and future partners.
- **Resource groups:** `/events`, `/plans/today`, `/programs`, `/milestones`, `/challenges`, `/leaderboards`, `/insights`, `/coach/messages` (streaming via SSE), `/integrations`.
- **Idempotency keys** on all writes, which matters for offline sync.
- **Webhooks out** (future): let coaches or employers (B2B2C) subscribe to anonymized cohort data, with user consent.
- **Rate limiting** per user and per integration.

### 6.5 Mobile-Specific Considerations
- **Offline-first logging:**
  - Local SQLite (WatermelonDB or op-sqlite) with a sync queue, so gym and ride logging works without signal.
  - Conflicts are resolved last-write-wins per event. Events are append-only, so real conflicts are rare.
- **Background sync:** HealthKit background delivery; Health Connect WorkManager jobs. Respect battery budgets and batch work.
- **Widgets & glanceables:** Daily Five widget (iOS WidgetKit / Android Glance), Lock Screen streak, Live Activity during a ride or workout.
- **Watch:** Apple Watch / Wear OS check-off only in v1.0, with no standalone workout tracking. Defer the rest.
- **Push strategy:**
  - At most 3 per day (morning plan, contextual nudge, evening check-in).
  - Per-user send-time model.
  - Quiet hours, and automatic throttling if the user ignores 5 in a row.
- **Privacy:**
  - Wardrobe segmentation runs on-device.
  - Finance data never reaches the LLM raw. The narrator gets aggregates ("discretionary spend +23% vs 4-week avg"), never merchant-level lines unless the user asks in chat.

### 6.6 Scaling & Trade-offs
- **LLM cost:**
  - Target ≤ $0.60/user/month: one daily narration (≈2k tokens in / 300 out) plus capped chat.
  - Use prompt caching for system/context prefixes.
  - Batch non-urgent jobs such as weekly reviews.
- **Integration fragility:** Strava/Garmin API terms and rate limits change. Use queue-based backoff, and treat manual logging as a first-class path, never an afterthought.
- **Finance aggregator cost** ($0.30–$1.50/connected user/month) is the biggest variable cost. Limit bank connections to paid tiers.
- **Timescale → ClickHouse migration** once events pass about 5B rows or dashboard queries pass the p95 budget (≤300 ms).
- **Leaderboards:** Redis sorted sets per scope, with nightly snapshots to Postgres. Partition global boards by league to avoid hot keys.

---

## 7. Analytics & Data Visualization

### 7.1 Dashboard Priorities (Web + Mobile "Progress" tab)
1. **Pentagon radar:** current vs. baseline vs. target across the 5 domains.
2. **Program timeline:** phases, milestones (hit/pending/missed) and a forecast line to the goal date.
3. **Domain panels:**
   - Fitness: volume and e1RM trends.
   - Cycling: CTL/ATL/TSB chart and power curve.
   - Finance: net worth, savings rate and spend by category.
   - Wardrobe: CPW distribution and dormant items.
   - Career: deep-work hours and pipeline funnel.
4. **Consistency heatmap:** calendar view of Fivefold Score.
5. **Insights feed:** ranked, plain-language findings (§7.3).

### 7.2 Key Metrics (User-Facing)
- Fivefold Score (7-day avg), adherence %, streak.
- Distance-to-goal per domain, and on-track probability (%).
- Domain velocity: rate of change vs. the plan curve.

### 7.3 Cross-Domain Insights (the core differentiator)
- **Method:**
  - Nightly per-user lagged correlation and simple regression across daily features, with ≥ 21 days of data required.
  - False-discovery control (Benjamini–Hochberg) so users aren't flooded with spurious patterns.
  - Only surface effects above a minimum effect size, phrased as associations, not causation.
- **Example insight types:**
  - "On days after < 6h sleep, your discretionary spending averages 41% higher."
  - "Weeks with 3+ rides correlate with 2.1 more deep-work hours."
  - "Your lifting volume drops 25% in weeks with 4+ evening meetings. Move strength sessions to mornings?"
  - "Wardrobe purchases cluster within 48h of stressful work events."
- **Actionability rule:** every insight ships with a one-tap experiment, e.g. "Try a no-spend rule after bad-sleep nights for 2 weeks." The system then measures the result, turning analytics into an n-of-1 experiment loop.

### 7.4 Predictive Insights
- **Goal forecasting:** Bayesian trend projection with a confidence band ("82% likely to hit 3-month emergency fund by Dec 14").
- **Lapse prediction:** the model flags a likely drop-off about 3 days ahead, and the coach pre-emptively lowers difficulty.
- **Burnout/overreach risk:** combined training load, sleep and calendar density.

---

## 8. Monetization & Pricing

### 8.1 Tier Structure
| Tier | Price | Includes |
|---|---|---|
| **Free** | $0 | Manual logging in all 5 domains, 1 active domain coached, basic daily plan (rules-only, templated text), friend leaderboards, 7-day history charts |
| **Pro** | $14.99/mo · $119/yr | Full AI coach (all domains, chat), 90-day programs, all integrations except bank sync, cross-domain insights, challenges & leagues, full history |
| **Elite** | $29.99/mo · $239/yr | Everything in Pro + bank sync, 12-month "Year of Five", predictive forecasts, interview prep mode, quarterly AI-generated transformation report (PDF), priority model access |
| **Squad add-on** | $5/mo per extra member on Elite | Private squad challenges with shared program and squad analytics |

### 8.2 Premium Levers
- **Hard paywall at program start.** A 7-day free trial of Pro starts at onboarding. This converts better than a soft freemium for intent-driven users.
- **Annual-first pricing** shown at about 33% savings, which improves retention economics and cash flow.
- **Seasonal cohorts:** program "seasons" start on fixed dates (January, April, September), creating urgency and community launch moments.

### 8.3 Secondary Revenue (Careful, Brand-Safe)
- **Human coach marketplace (v2):** certified cycling coaches, financial planners and career coaches review the AI plan. Revenue share 20–25%.
- **B2B2C wellness:** employer licenses ($6–8/seat/mo) with anonymized, aggregate-only reporting. Employers never see individual finance or career data.
- **Affiliate (wardrobe/cycling gear):** only surfaced after the buy/no-buy coach approves, and always disclosed. The coach must never optimize for affiliate revenue, which is a trust rule written into the planner.
- **No ads, ever.** It conflicts with the premium positioning and the finance trust model.

### 8.4 Sustainability Model (Unit Economics Targets)
- **Blended ARPPU:** about $11/mo after annual discounts and store fees (15% small-business / subscription-year-2 rate where applicable).
- **Variable cost per paid user:** LLM ≤ $0.60, aggregator ≈ $0.80 (Elite only), infra ≈ $0.40. Gross margin target ≥ 80%.
- **Targets:** trial-to-paid ≥ 40%, month-12 retention ≥ 35% on annual plans, LTV:CAC ≥ 3:1.
- **Retention engine:** cohort seasons, squads (social lock-in) and accumulated cross-domain data (the insight value grows with tenure).

---

## 9. User Onboarding Journey

### 9.1 Goal-Setting Flow (≈ 6–8 minutes)
1. **Identity question:** "Who are you becoming in 90 days?" Free text, which the LLM extracts into an identity statement.
2. **Domain selection:** choose 2–5 domains. Recommend starting with 3 at most; the rest can be added in week 3.
3. **Goal per domain:**
   - Pick from smart presets (e.g. "Raise FTP", "Build emergency fund", "Build a 30-piece capsule", "Land a senior role") or write your own.
   - The AI converts it to a measurable target.
4. **Constraints:** daily time budget, training days available, monthly discretionary budget, and hard no-go times.
5. **Coach persona and notification times.**
6. **Realism review:** the coach shows the auto-generated milestones and adjusts any unrealistic goal with the user.

### 9.2 Baseline Assessment
- **Connect integrations** (each skippable, with a clear value message): Health, Strava/Garmin, bank (Elite trial), calendar.
- **Quick self-assessments** (under 60s each):
  - Fitness: training age, current lifts or a bodyweight test.
  - Cycling: known FTP, or a scheduled ramp test in week 1.
  - Finance: estimated savings rate and debts.
  - Wardrobe: "photograph your 10 most-worn items" (fast tagging).
  - Career: current and target role, plus 3 pasted job postings.
- **Imported history:** pull up to 90 days from integrations so day 1 already shows trends. This creates an immediate "aha" moment.
- **Baseline pentagon** is shown at the end. This is the "before" picture that the 90-day reveal will compare against.

### 9.3 First 7 Days
| Day | Experience | Purpose |
|---|---|---|
| **1** | First Daily Five at Level 1–2 (≤ 30 min total). Quick win guaranteed. Evening check-in introduced | Early success, habit loop |
| **2** | Coach references yesterday's data specifically ("You logged 4 expenses, so categorization is now 90% accurate") | Prove the AI is paying attention |
| **3** | Invite prompt: "Bring one accountability partner" → auto-creates a 1v1 friendly duel | Social commitment |
| **4** | First baseline test (FTP ramp or strength test) scheduled on a high-readiness day | Real data replaces estimates |
| **5** | First cross-domain mini-insight (from imported history if available) | Show the differentiator early |
| **6** | Wardrobe: first outfit suggestions from the 10 items; finance: first envelope set | Activate quieter domains |
| **7** | Week-1 review: score trend, streak, one adjustment to the plan, trial-conversion screen framed as "lock in your 90-day program" | Conversion at the moment of highest investment |

**Activation metric:** ≥ 5 of 7 days with a check-in and at least 1 integration connected. Users who hit it should be the main conversion cohort, so instrument it from day 1.

---

## 10. Competitive Differentiation

| Competitor | What they do well | Gap Fivefold fills |
|---|---|---|
| **Strava** | Activity social graph, segments | No coaching, absolute-performance leaderboards discourage beginners, no life context |
| **TrainingPeaks / TrainerRoad** | Structured cycling plans | Single-domain; ignores work stress, sleep debt from career, money |
| **MyFitnessPal / Fitbod** | Logging, workout generation | No cross-domain planning; logging fatigue |
| **YNAB / Copilot** | Budgeting discipline | Money in isolation; no behavioral link to stress/sleep, no social accountability |
| **Whoop / Oura** | Recovery data | Tells you you're tired; doesn't re-plan your day or your finances accordingly |
| **Habit apps (Streaks, Fabulous)** | Habit mechanics | Generic, no domain expertise, no real data integrations |

**Fivefold's defensible edges:**
1. **One planner across shared resources:** time, energy and money are budgeted across domains every day.
2. **Cross-domain insight engine:** correlations no single-domain app can compute, because none of them have the data.
3. **Effort-normalized competition:** friends at different levels can compete fairly.
4. **Structured, cohort-based programs:** a defined 90-day arc with a before/after reveal, not endless logging.
5. **Data moat:** value increases with tenure, as personal response models and the insight history accumulate.

---

## 11. Implementation Roadmap

### Phase 0: Validation (Weeks 0–6)
- Concierge MVP with 30–50 paying beta users: an AI-assisted human coach plus spreadsheets, Typeform and a WhatsApp group.
- **Goal:** validate willingness to pay ($15+/mo) and which domain pairs drive retention.
- **Exit criteria:** ≥ 60% of beta users still active at week 6; ≥ 50% say they would pay.

### Phase 1: MVP (Months 2–5)
- **Platforms:** iOS + Android (React Native), minimal web dashboard (read-only).
- **Domains:** Fitness, Cycling, Finance (manual + CSV only).
- **Features:**
  - Unified event model and Daily Five planner (rules-based).
  - LLM narrator for the morning message and evening check-in.
  - One 90-day template, auto-milestones, and basic streaks.
  - Friend duels.
- **Integrations:** HealthKit, Health Connect, Strava.
- **Monetization:** Pro tier only, via RevenueCat.
- **Success metrics:** D30 retention ≥ 30%, trial-to-paid ≥ 25%.

### Phase 2: Beta (Months 6–8)
- **Add domains:** Wardrobe (on-device tagging, CPW) and Career (calendar focus blocks, skills-gap).
- **Coaching:** adaptive difficulty bands, Minimum Viable Day, coach chat.
- **Insights:** cross-domain insights v1 (correlation engine with FDR control).
- **Social:** squads, squad streaks, cohort leaderboards.
- **Integrations:** Garmin, and bank sync (Plaid/Tink) for Elite.
- **Web:** full analytics dashboard.

### Phase 3: 1.0 Launch (Months 9–12)
- **Programs:** 12-month "Year of Five", seasonal cohort launches, leagues.
- **Coaching:** predictive forecasts and lapse prediction; interview prep mode; quarterly transformation report.
- **Platform:** widgets, Live Activities, Watch check-off.
- **Monetization:** full Elite tier, annual-first pricing, Squad add-on.
- **Hardening:**
  - SOC 2 Type I prep, GDPR DPIA (health and finance data are special-category/sensitive), and data export/delete self-service.
- **Success metrics:** 10k paying users, gross margin ≥ 80%, M12 annual retention ≥ 35%.

### Phase 4: Post-1.0 (Year 2)
- Human coach marketplace, B2B2C employer channel, public partner API, ClickHouse migration, more locales.

### Key Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Five domains feel overwhelming | Start with at most 3, unlock more later; the planner caps daily time |
| Integration API changes / access revocation | Manual-first logging, multi-provider abstraction, no hard dependency on any one source |
| LLM gives unsafe health/finance advice | Deterministic planner owns all numbers; guardrail validators; escalation to professional resources |
| Regulatory exposure (health + finance data) | Read-only finance, explicit consent per domain, EU data residency option, encryption at column level |
| Gamification encouraging overtraining/obsession | Ramp-rate caps, mandatory deloads, effort-based (not volume-based) scoring |
