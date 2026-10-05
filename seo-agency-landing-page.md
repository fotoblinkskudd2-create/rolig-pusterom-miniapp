# Landing page: SEO + Loading Optimization + ASO agency

Copy deck and structure for a high-intent B2B landing page.

**How to use this doc.** Anything in `[BRACKETS]` is a slot for the agency's own verified data. Do **not** ship placeholder numbers. Every claim on the page needs an evidence anchor: a named case study, a dashboard screenshot, a signed testimonial, or a cited third-party study. If the agency can't prove a number, cut the claim.

**Conversion goals**
- **Primary A:** book a call (calendar embed: Calendly, SavvyCal or HubSpot Meetings)
- **Primary B:** lead form ("Revenue Leak Audit" request)
- **CTA placements:** Hero (top), after Services (middle), after Social Proof (middle), Pricing, Final (bottom), plus a sticky header button.

**Page order follows the brief's priority: ROI → proof → credibility.**

---

## 0. Sticky header (global)

**Copy**
- Logo · `Services` · `Results` · `Pricing` · `FAQ`
- Right-aligned button: **Book a Revenue Call**

**Rationale.** High-intent visitors decide fast. A booking button that's always visible catches them the moment they're convinced, wherever they are on the page.

**Design/UX.** Header shrinks on scroll (64px → 52px). On mobile, keep only the logo and the button; move the nav into a menu.

---

## 1. Hero section

**Eyebrow:** SEO · Site Speed · App Store Optimization

**Headline (primary):**
# Your traffic is leaking revenue. We find the leak, fix it, and show you the money.

**Headline variants for A/B testing:**
- A: *Slow pages and invisible listings are costing you sales every day. We put a number on it, then we fix it.*
- B: *Search, speed and app store growth, reported in revenue, not rankings.*

**Subheadline:**
We tie every SEO, performance and ASO change to pipeline and revenue. [CLIENT COUNT]+ companies, [$X]M in tracked client revenue gained, median payback in [N] months.

**Primary CTA:** `Get My Revenue Leak Audit →`
**Secondary CTA (text link):** `or book a 20-min call`

**Trust strip under CTA:**
`[Logo] [Logo] [Logo] [Logo] [Logo]` · ★ [4.9]/5 on Clutch ([N] reviews) · Google Partner / [certification]

**Rationale.**
- Leads with *loss* (a leak), since loss aversion beats gain framing for profit-focused buyers.
- "Show you the money" promises the thing competitors avoid: revenue attribution.
- The subheadline packs three proof numbers into one line so the claim has an anchor before the visitor scrolls.
- The audit CTA is low-commitment and high-value. The call link is there for visitors who are already ready to buy.

**Design/UX.**
- Two columns on desktop: copy on the left, a **revenue-impact visual** on the right (an annotated real client chart: "Organic revenue +[X]% in [N] months"). No stock photos.
- CTA button in a high-contrast color used *nowhere else* on the page.
- Logo strip in grayscale at 60% opacity.
- Mobile: headline ≤ 3 lines, CTA above the fold at 375px width.

---

## 2. Value proposition: why us

**Section header:** Most agencies report rankings. We report revenue.

**Three differentiators (icon + bold line + one sentence):**

- **Revenue-attributed reporting.** Every monthly report ties our work to sessions, conversions and revenue in *your* analytics, not a vanity dashboard we control.
- **One team for search, speed and store.** SEO, Core Web Vitals and ASO work together. A faster page ranks better and converts better, so you don't pay three agencies to argue about it.
- **Engineers, not account managers.** Our specialists ship the fixes: code-level performance work, technical SEO and store metadata. No "recommendations PDF" that sits in your backlog.

**Proof line:** [X]% of clients renew after year one. Average engagement length: [N] months.

**Rationale.**
- The header names the category's main frustration (vanity reporting) and positions against it, with no need to name competitors.
- "Engineers, not account managers" answers the unspoken objection: *"Agencies just send me audits I can't implement."*
- Retention rate is the most honest proof of ROI. Clients don't renew agencies that don't pay for themselves.

**Design/UX.** Three equal cards in a row (stacked on mobile). One line-icon per card, no illustrations. The proof line sits centered below in smaller, muted text.

---

## 3. Services breakdown (each with an ROI angle)

**Section header:** Three revenue levers. One accountable team.

### SEO: own the searches that buy
- Technical SEO, content strategy, and digital PR and link acquisition
- Built around **commercial-intent keywords**, not traffic for its own sake
- **ROI math:** *If 30% more qualified organic visitors convert at your current 2% rate with a $500 average order, every 10,000 extra monthly visits = **$100,000/month** in revenue.* (Calculator below lets visitors plug in their own numbers.)
- **Typical client result:** [+X% organic revenue in N months, Client/industry]

### Loading optimization: stop paying for visitors who leave
- Core Web Vitals (LCP, INP, CLS), image and JS weight reduction, CDN and caching, checkout speed
- **Evidence anchor:** Deloitte & Google's *Milliseconds Make Millions* (2020) found a **0.1s mobile speed improvement lifted retail conversions by 8.4%** and average order value by 9.2%.
- **ROI math:** *On $2M/year online revenue, an 8% conversion lift is about **$160,000/year**, from the traffic you already pay for.*
- **Typical client result:** [LCP 4.1s → 1.8s, conversion rate +X%, Client]

### ASO: win the App Store search box
- Keyword and metadata optimization, screenshot and icon A/B tests, ratings strategy, localization
- **Evidence anchor:** Apple reports that **about 65% of App Store downloads happen directly after a search.** If you don't rank, you don't exist.
- **ROI math:** *A 20% lift in organic installs at $3 blended CPI means **$X saved per month** on paid user acquisition.*
- **Typical client result:** [+X% organic installs, store conversion rate from X% to Y%, Client]

**Mid-page CTA:** `See What Your Leak Is Costing You →` (opens audit form)

**Rationale.**
- Each service is framed as a **revenue lever** with simple, transparent math. Profit-focused buyers trust arithmetic they can check more than adjectives.
- Third-party citations do the heavy lifting where the agency's own data is thin; client results then make it specific.
- Bullet scope lists qualify the buyer by answering *"do they do X?"* without a call.

**Design/UX.**
- Tabs on desktop (SEO | Speed | ASO) or three stacked panels. Tabs keep the page short; panels help SEO. Recommended: **stacked panels with a sticky sub-nav.**
- Highlight the ROI math in a tinted callout box with monospace numbers.
- **Interactive ROI calculator** (strongly recommended): inputs for monthly traffic, conversion rate and AOV. Output: "Revenue from +X% traffic" and "Revenue from +Y% conversion rate". Put the CTA directly under the result. This is the highest-intent moment on the page.
- Cite sources in small footnote links.

---

## 4. Social proof: case studies and testimonials

**Section header:** Results, in our clients' numbers.

### Case study card structure (3 cards, one per service)

| Field | What to show | Example format |
|---|---|---|
| Client | Name + logo (or "B2B SaaS, Series B" if under NDA) | `[Client] · E-commerce · $40M ARR` |
| Problem | One line, in money terms | "Organic stalled for 18 months while CAC rose 40%" |
| What we did | 2–3 bullets max | "Rebuilt site architecture, 90 commercial pages, fixed CWV" |
| **Headline metric** | **A revenue or profit number, in large type** | **+$1.2M annual organic revenue** |
| Supporting metrics | 2–3 numbers | Organic sessions +X% · Conversion rate +X% · LCP −X s |
| Timeframe | Always | "in 7 months" |
| Payback | If available | "Engagement paid for itself in month 3" |
| Link | Full case study | `Read the breakdown →` |

**Metric priority to highlight (in this order):**
1. Revenue / pipeline gained (in $)
2. ROI multiple or payback period
3. Conversion rate change
4. Cost savings (reduced paid-media spend, lower CPI)
5. Traffic, installs, rankings, *only* as supporting numbers, never as the headline

### Testimonial structure (2–3)
> "[Specific outcome with a number]. [What was different about working with them]."
> **[Full name], [Title] at [Company]** · [headshot] · [LinkedIn link]

**Example of the right shape:**
> "Organic went from 18% to 41% of our revenue in a year. They're the first agency that reported in dollars instead of keyword positions."
> *(Use only real, approved quotes.)*

**Second CTA after proof:** `Get Results Like These → Book a Call`

**Rationale.**
- Revenue as the headline metric matches what the buyer is paying for; traffic-first case studies signal vanity.
- Timeframe and payback period remove the biggest hidden objection: *"How long until this pays off?"*
- Full names, titles, faces and LinkedIn links make the proof verifiable. Anonymous quotes convert worse and erode trust with skeptical B2B buyers.

**Design/UX.**
- Case studies as three cards with the headline metric at 40–48px. Optional: before/after chart thumbnails (real screenshots from GA4, Search Console, App Store Connect, with sensitive data blurred).
- Testimonials in a two-column grid, not a carousel. Carousels hide proof.
- Add a G2/Clutch rating badge that links to the live profile.

---

## 5. Pricing / offer

**Section header:** Clear pricing. Clear payback.

**Intro line:** No setup fees. No 12-month lock-in. We earn the renewal.

| | **Audit** | **Growth** (most chosen) | **Scale** |
|---|---|---|---|
| Price | **$[X] one-time** (credited to retainer if you sign within 30 days) | **from $[X]/mo** | **from $[X]/mo** |
| Who it's for | Need to know where the money is leaking | One revenue channel to fix fast | Web + app, multiple markets |
| Includes | Full SEO, speed and ASO diagnostic · revenue-impact estimate per fix · prioritized 90-day roadmap | One service line (SEO *or* Speed *or* ASO) · implementation included · monthly revenue reporting | All three services · dedicated specialist team · weekly reporting · quarterly business review |
| Minimum term | n/a | 3 months | 6 months |
| CTA | `Order Audit` | `Book a Call` | `Book a Call` |

**Risk reversal (below table):**
> **The Payback Promise:** if your Growth engagement hasn't shown measurable lift in the agreed KPI by month [4], we keep working at no fee until it does. *(Only include if the agency will honor it in the contract. Define the KPI in writing.)*

**Capacity note (honest scarcity):**
> We cap active engagements so the specialists doing the work aren't stretched thin. **Currently onboarding [N] new clients for [Month].** [N] slots left.

**Rationale.**
- Publishing prices pre-qualifies leads and builds trust. Hiding prices signals "expensive and evasive" to profit-focused buyers.
- The paid audit is a **tripwire offer**: low risk, high perceived value, and crediting it toward the retainer turns it into a natural upgrade path.
- Anchoring: Scale makes Growth look reasonable. "Most chosen" uses social proof inside the pricing table.
- Scarcity is **real and explained** (team capacity), which keeps it credible rather than manipulative.

**Design/UX.**
- Three columns, middle card raised with a colored border and a "Most chosen" badge.
- Slot counter must be **manually updated and truthful**. Never a fake countdown timer.
- Mobile: cards stacked, Growth first.

---

## 6. FAQ: objection handling

**Section header:** Straight answers.

**How fast will we see results?**
Speed fixes show up in conversion rate within weeks of deployment. ASO metadata changes typically show in [2–6] weeks. SEO compounds: expect early movement in [2–3] months and meaningful revenue impact in [4–9] months, depending on competition and your starting point.

**How do you prove ROI?**
We work in *your* GA4, Search Console and App Store Connect / Google Play Console. Every report shows the change, the revenue attributed to it, and how we calculated it. You can audit our math.

**Do you guarantee rankings?**
No. Anyone who guarantees #1 rankings is lying or buying risky links. We commit to process, transparency, and the Payback Promise above.

**We already have an in-house team / another agency.**
Good. We often work alongside in-house teams on the specialist work they lack time or depth for (performance engineering, technical SEO, ASO testing). Many clients start with the Audit to get a second opinion.

**Do you need access to our code?**
For speed work, yes, or we work through your developers with ready-to-merge tickets. Your choice. We sign NDAs and follow your deployment process.

**What if it doesn't work?**
No long lock-in. Growth is a 3-month minimum, then month-to-month. If we're not delivering, you leave.

**Rationale.** These six questions cover the main B2B objections: time-to-value, proof, risk, existing vendors, implementation friction and exit. The "no guaranteed rankings" answer turns honesty into a credibility advantage.

**Design/UX.** Accordion, first item open by default. Add `FAQPage` schema markup for rich results (the agency's own SEO should be visible here). End with the line: *"Question not here? `Ask us directly →`"* linking to the form.

---

## 7. Final CTA: scarcity-focused

**Header:** Every month you wait, the leak keeps running.

**Body:**
Your competitors are buying the same keywords, loading faster and taking your App Store searches. We take on **[N] new clients per month**, and [Month]'s slots are filling.

**Two-path conversion:**

| **Talk to a specialist** | **Get your Revenue Leak Audit** |
|---|---|
| 20-minute call. We review your site or app live and give you 3 fixes, whether or not you hire us. | Tell us your URL or app. Within [3] business days you get a prioritized list of leaks with an estimated revenue impact for each. |
| `Book My Call →` (inline calendar) | Form: Name · Work email · Website/App URL · Monthly revenue range (dropdown) · Biggest challenge (SEO / Speed / ASO / Not sure) → `Find My Leaks →` |

**Micro-copy under the form:** No spam. No sales sequence of 14 emails. A specialist, not a bot, will reply within 1 business day.

**Rationale.**
- The header reframes inaction as a *cost*, which is the urgency trigger profit-focused buyers respond to.
- Competitor framing adds pressure without fake deadlines.
- Two paths serve two buyer types: **ready now** (call) and **needs internal buy-in** (audit, which they can forward to their CFO).
- "3 fixes whether or not you hire us" gives value up front and lowers call anxiety.
- The revenue range field qualifies leads for sales routing without adding much friction.

**Design/UX.**
- Full-width section, dark background, the same CTA color as the hero.
- Calendar embedded inline; don't redirect away from the page.
- Form: 5 fields max, single column, inline validation, no CAPTCHA (use honeypot fields).
- After submission: thank-you page with a calendar embed ("Want to skip the queue? Book your call now.") so you capture a second conversion.

---

## 8. Copy notes for the copywriter

**Voice**
- Talk like a CFO who understands code. Short sentences. Numbers before adjectives.
- Write "you" and "your revenue", not "businesses" or "brands".
- One idea per sentence. Max 150 words per section, ideally under 100.

**Banned words and phrases**
passionate · industry-leading · cutting-edge · holistic · synergy · best-in-class · world-class · unlock · supercharge · game-changer · "we're a team of experts" · "results-driven" · "tailored solutions"

**Claim discipline (non-negotiable)**
- Every number needs a source: client case study (with permission), named third-party study, or the agency's own aggregate data with a defined method.
- Show timeframes on every result.
- Write "up to" or "median" accurately; never present best-case results as typical.
- Testimonials must be real, attributed and approved in writing. Never invent or "polish" quotes beyond light grammar fixes.
- Third-party stats: link the source and re-verify before launch. Studies age, and some figures (e.g., the Apple search share) are several years old.

**Urgency without manipulation**
- ✅ Real capacity limits, the cost of waiting expressed as lost revenue, seasonal timing ("Q4 traffic is set in Q3").
- ❌ Fake countdown timers, "only 2 left!" counters that never change, exploding discounts, pre-checked upsells.

**Formatting rules**
- Headers are statements of value, not labels ("Results, in our clients' numbers", not "Testimonials").
- Bold the number, not the adjective.
- Bullets: start with a verb or a number.
- CTAs: first person and outcome-driven (`Get My Audit`, `Find My Leaks`), never `Submit` or `Learn More`.

**CTA map**

| # | Location | Copy | Action |
|---|---|---|---|
| 1 | Sticky header | Book a Revenue Call | Calendar |
| 2 | Hero | Get My Revenue Leak Audit | Form |
| 3 | After Services / ROI calculator | See What Your Leak Is Costing You | Form (pre-filled from calculator) |
| 4 | After Social Proof | Get Results Like These | Calendar |
| 5 | Pricing cards | Order Audit / Book a Call | Checkout / Calendar |
| 6 | Final section | Book My Call / Find My Leaks | Calendar / Form |

**Tracking to set up before launch**
- Event per CTA (location-tagged) in GA4 / your tag manager.
- Calculator interactions as a micro-conversion.
- Form field drop-off analysis.
- The page must itself pass Core Web Vitals (LCP < 2.5s, INP < 200ms, CLS < 0.1). A slow page from a speed agency loses the deal before the visitor reads a word.

**First A/B tests (in priority order)**
1. Hero headline: loss framing vs. revenue-reporting framing
2. Primary hero CTA: Audit vs. Call
3. Pricing visible vs. "from $X" only
4. ROI calculator above vs. below the case studies
