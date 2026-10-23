# Part 5 — Deep Research Reports

Five briefings, about 500 words each. Facts reflect public information available through mid-2026. Re-verify anything time-sensitive before acting on it. **Not investment advice.**

---

## 5.1 AI Technology Trends & Investment Thesis

**Where we are.** Generative AI has moved from novelty to infrastructure. AI took the largest share of global venture funding in 2024 (Crunchbase put it at roughly a third of all VC dollars) and an even larger share in 2025, driven by mega-rounds for frontier labs. Hyperscaler capex on data centers ran in the hundreds of billions per year. The bottleneck has moved from models to **power, chips and distribution**.

**Five trends that matter for builders:**
1. **Agents that finish work.** Models now use tools, browse, write and run code, and complete multi-step tasks over hours. Coding agents were the first category with clear product-market fit. Customer support, back-office operations (claims, invoicing, KYC) and research follow. The product shift: buyers pay for **outcomes** (tickets resolved, claims processed), not seats.
2. **Inference cost deflation.** Price per unit of capability has fallen roughly an order of magnitude per year for comparable quality. Use cases that were uneconomic in 2023, such as reading every document or summarizing every call, are now trivially cheap. Consumer apps can afford AI at $5–15/month price points.
3. **On-device and small models.** Apple's Foundation Models framework (iOS 26) gives every developer a free on-device LLM. Gemini Nano does the same on Android, and open-weight small models (Llama, Qwen, Gemma, Mistral) run on laptops. Privacy-sensitive categories such as health, finance and journaling can now ship AI with zero marginal cost and no data egress.
4. **Multimodal and voice-native.** Realtime speech-to-speech models make voice a primary interface for coaching, tutoring, customer service and accessibility. Vision lets phones read the physical world: documents, labels, broken objects.
5. **Evaluation and reliability as the moat.** Raw model quality commoditizes quickly. Durable advantage comes from proprietary eval sets, human-correction loops, domain workflows, and trust/compliance (HIPAA, SOC 2, EU AI Act readiness).

**Regulation.** The EU AI Act's obligations phase in from 2025 to 2027, with general-purpose AI model duties from August 2025 and high-risk system rules later. US policy has moved toward federal preemption and lighter regulation, with active state-level activity (Colorado, California). Copyright litigation is producing large settlements; Anthropic's $1.5B authors settlement in 2025 was the landmark. This raises the value of licensed data.

**Investment thesis (where risk-adjusted returns sit):**
- **Avoid:** thin wrappers on general chat, horizontal "AI for everything" assistants competing with OpenAI/Google/Anthropic/Apple distribution, and model training without a compute or data edge.
- **Favor:**
  - **Vertical AI with workflow lock-in** in regulated, document-heavy domains (healthcare admin, insurance, legal ops, public-sector casework, eldercare). Incumbent software there is old and the buyers have budgets.
  - **"Services-as-software."** AI-native firms that replace outsourced labor (BPO, bookkeeping, medical coding) and price on outcomes. Gross margins of 60–75% are achievable and rising as inference costs fall.
  - **AI infrastructure picks-and-shovels with clear moats:** power and cooling, inference optimization, eval/observability, data licensing marketplaces.
  - **Physical-world AI** (robotics, autonomy, industrial inspection) where models finally generalize enough to cut deployment cost.

**Key metrics to underwrite:** net revenue retention > 120% (B2B), gross margin trajectory as inference falls, proportion of revenue tied to outcomes, eval-driven accuracy improvement per quarter, and the share of data that is proprietary versus scraped.

**Bottom line:** the value is migrating from model builders to the companies that own a workflow, a dataset and a trust relationship. Tend (Part 3) is built on that thesis.

---

## 5.2 Autonomous Systems & Drone Applications in Commercial Markets

**The inflection.** Commercial drones spent a decade stuck on regulation: most operations required visual line of sight (VLOS). That is changing. In August 2025 the FAA published its long-awaited **Part 108** proposed rule to normalize beyond-visual-line-of-sight (BVLOS) operations, and a final rule is expected to unlock routine BVLOS delivery and inspection. Europe's U-space framework and EASA's "specific category" already allow scaled BVLOS under risk assessments (SORA).

**Commercial segments ranked by near-term revenue:**
1. **Inspection & industrial data.** Power lines, wind turbines, pipelines, rail, telecom towers, solar farms. Buyers (utilities, energy majors) have budgets and safety mandates. Drones plus computer vision cut inspection costs 50–80% versus helicopters or rope teams. Docked "drone-in-a-box" systems (Skydio, DJI Dock, Percepto) enable remote, scheduled flights. **This is the most mature profit pool.**
2. **Public safety (Drone as First Responder).** US police and fire departments deploy docked drones that reach 911 calls before officers do. Flock Safety, Skydio and Brinc lead. Recurring SaaS-plus-hardware revenue with municipal procurement.
3. **Agriculture.** Spray drones (DJI Agras, XAG, Hylio) are scaling fast in Asia and Latin America and increasingly in the US. Precision spraying cuts chemical use and reaches terrain tractors can't.
4. **Delivery.** Zipline (medical and retail; P2 platform), Wing (Walmart expansion across US metros in 2025–26), Amazon Prime Air (restarted). Unit economics improve with density and BVLOS rules. Expect consolidation around 2–3 networks partnered with big-box retail.
5. **Mapping, construction, insurance.** Photogrammetry and LiDAR for progress monitoring and claims are mature and commoditizing. Value shifts to analytics software.

**Geopolitics as a market shaper.** DJI holds the majority of global commercial drone share. The US FY2025 NDAA set up a process that can add DJI to the FCC's Covered List, restricting new equipment authorizations. Several US states ban Chinese drones for public agencies. That creates a protected demand window for **NDAA-compliant / "Blue UAS"** manufacturers (Skydio, Teal/Red Cat, Inspired Flight) and for European makers. Ukraine's battlefield has turned cheap FPV and autonomous drones into a mass-production category, accelerating defense-tech capital into Anduril, Shield AI, Helsing, Quantum Systems, Tekever and many startups. Dual-use spillover (autonomy stacks, counter-UAS, resilient comms) reaches commercial markets quickly.

**Autonomy beyond drones.** Robotaxis reached real commercial scale. Waymo operates driverless paid service in multiple US cities, with hundreds of thousands of weekly rides reported in 2025, and others pursue licensed expansion. Autonomous trucking (Aurora began driverless Texas freight in 2025), yard and mining autonomy, and warehouse robotics are the next profit pools. Humanoid robots attract big capital but remain pre-commercial at scale.

**Where startups win:**
- **Software layers on commoditized hardware:** fleet ops, airspace/UTM integration, AI inspection analytics, digital twins.
- **Vertical solutions:** "drone + AI + report" sold per asset inspected (per km of line, per turbine).
- **Counter-UAS and airspace security** for airports, prisons, stadiums and critical infrastructure.
- **Compliance-as-a-service** for BVLOS waivers and SORA documentation.

**Risks:** regulatory delays, hardware margin compression, insurance and liability, public acceptance (noise, privacy) and supply chains (motors, batteries and sensors are often still China-sourced).

**Takeaway:** buy exposure to **recurring-revenue software and services on top of autonomous hardware**, in segments with mandated spend (utilities, public safety, defense). Avoid pure hardware bets without a protected niche.

---

## 5.3 Emerging Product Categories & Market Opportunities

Seven categories where demand, technology and timing converge for 2026–2028:

**1. Caregiving & longevity tech.** Aging populations (Japan, Europe, US, China) create rising demand for remote monitoring, care coordination, fall detection, cognitive support and family-facing software. Payers now reimburse some of it: remote patient monitoring codes and CMS GUIDE. **Opportunity:** AI coordination layers (Tend), passive sensing (radar/Wi-Fi fall detection without cameras), and companion voice agents with clinical guardrails.

**2. AI-native personal admin ("life ops").** Agents that handle paperwork: bills, benefits, insurance claims, subscriptions, taxes, debt letters. People spend hours a month on admin, and the cost hits low-income households hardest. **Opportunity:** document-understanding apps with deterministic rules engines (LetterLens, Ledger), distributed through banks, employers and governments.

**3. Metabolic health & GLP-1 ecosystem.** GLP-1 drugs (semaglutide, tirzepatide) reshaped obesity care, and oral formulations and cheaper generics are coming. Adjacent markets: nutrition coaching for muscle preservation, continuous glucose monitors for non-diabetics (OTC CGMs since 2024), protein-forward food, employer program management. **Opportunity:** AI coaching attached to prescriptions, and adherence/side-effect management.

**4. Climate adaptation and electrification at home.** Mitigation money is shifting toward adaptation: heat, flooding, wildfire. In Europe, EPBD renovation mandates and heat-pump subsidies keep demand alive while US federal home-energy credits ended in 2025. **Opportunity:** retrofit planning software (Retrofit), home battery and solar aggregation into virtual power plants, climate-risk scoring for insurance and mortgages.

**5. Voice-first and ambient interfaces.** Realtime voice models, AI glasses (Meta Ray-Ban sold in the millions; more entrants in 2026) and earbuds with assistants. **Opportunity:** hands-busy workflows (field service, nursing, cooking, repair: FixItCam), language learning, and conversation coaching (Rehearse).

**6. Education: tutoring at near-zero marginal cost.** Learning-loss data (NAEP 2024 reading lows) plus AI tutors able to listen and adapt. Districts buy on evidence (ESSA tiers). **Opportunity:** voice-based literacy and math tutors with efficacy studies (Readwell), and teacher-time-saving tools (grading, IEP drafting).

**7. Trust, safety & authenticity infrastructure.** Deepfake fraud (voice-clone scams, synthetic IDs) is rising sharply. Content provenance (C2PA), liveness detection, agent identity and payments for AI agents. **Opportunity:** fraud-prevention APIs for banks and marketplaces, provenance tooling for media, "know your agent" standards.

**Cross-cutting opportunity patterns:**
- **Regulated + document-heavy + fragmented = AI wedge.** Look for domains where knowledge workers copy data between PDFs and portals.
- **New budget lines beat new behaviors.** Prefer categories where reimbursement, mandates or employer benefits already exist over ones that need consumers to adopt a new habit and pay for it.
- **Distribution partnerships are the new moat.** Banks, employers, insurers, utilities and municipalities reach the customer cheaply. Design products white-label-ready from day one.
- **Local-first privacy as a feature.** On-device AI makes privacy a selling point in sensitive categories (mental health, finance, kids).

**Screening checklist for a new category:** (1) Is there an identifiable payer? (2) Is the problem recurring for ≥ 12 months? (3) Does AI cut the cost to serve by ≥ 5×? (4) Can an MVP ship in ≤ 16 weeks with current models? (5) Does usage generate proprietary data that improves the product?

The five concepts in Part 1 were selected with this checklist. Tend scores highest on all five questions.

---

## 5.4 Creative Industries + AI: Art, Music, Design Revenue Models

**State of play.** Generative AI has hit every creative medium: image (Midjourney, Adobe Firefly, Google Imagen and Gemini image ("Nano Banana"), Flux), video (Google Veo, OpenAI Sora, Runway, Kling), music (Suno, Udio, ElevenLabs Music), voice (ElevenLabs) and design (Canva Magic Studio, Figma AI). Production costs for "good enough" assets have collapsed. The scarce things are now **taste, distribution, rights and authenticity**.

**The legal reset (2025–26).** The industry moved from litigation toward licensing:
- **Music:** In late 2025 Universal settled with Udio, and Warner settled with both Udio and Suno. The settlements turned lawsuits into licensed platforms with artist opt-ins and revenue shares.
- **Books/text:** Anthropic's $1.5B class settlement with authors (2025) set a price signal for training on pirated works. Courts have suggested that training on lawfully acquired works can be fair use.
- **Images:** In the UK, Getty v. Stability (Nov 2025) largely went Stability's way on the core claims. US cases continue.
- **EU AI Act** requires training-data summaries and opt-out respect for general-purpose models.
Net effect: **licensed training data and consented likeness are becoming a real revenue line** for rights holders.

**Revenue models that work:**
1. **Licensing & data deals.** Stock libraries (Shutterstock, Getty), music catalogs and publishers license archives to model builders. Deal values run from millions to tens of millions annually per major licensor. Indie creators can join collective licensing pools.
2. **Voice and likeness licensing.** Artists license AI voice models with approval rights and revenue share (Grimes's Elf.Tech model; ElevenLabs voice marketplace payouts). Expect "likeness agents" to manage permissions and royalties, with legal backing from laws like Tennessee's ELVIS Act and the proposed federal NO FAKES Act.
3. **Creator tools as SaaS.** Subscription tools (Midjourney is profitable on subscriptions alone; Runway and Suno are subscription-led). Margins depend on inference cost and retention.
4. **Hybrid human + AI production studios.** Agencies use AI to produce 5–10× more ad variants, localization and storyboards. They price on output and performance, not hours, and win on speed.
5. **Fan participation & remix economies.** Licensed stems and official AI remix tools let fans create derivatives, with automatic royalty splits back to rights holders. Social video is the distribution layer.
6. **Authenticity premium.** As synthetic content floods feeds, verified human-made work (C2PA provenance, live performance, physical art, limited editions) commands a premium. The art market's top end has softened since 2022, but human provenance holds value.

**For independent artists and small studios (actionable):**
- Use AI for **throughput**: concept variations, mockups, mastering assistance, social cut-downs. Keep the signature creative decisions human and visible.
- **Own the audience directly** (email, community, Patreon/Substack). Platform algorithms favor volume, and owned channels favor identity.
- **Register and protect** works. Add provenance metadata. Opt out of training where it matters, or opt in for pay through licensing pools.
- **Sell process and access:** workshops, prompts and presets, behind-the-scenes, commissions with a human guarantee.
- **License your style ethically:** an official model or preset pack, with clear terms, beats unlicensed imitation you can't stop.

**Investment view:** favor **rights infrastructure** (royalty tracking, consent management, provenance), **vertical creative tools with workflow lock-in** (game assets, architecture visualization, ad production), and **catalog owners** that gain licensing revenue. Avoid undifferentiated generation apps competing with Google, OpenAI and Adobe on price.

**Risk watchlist:** appeals and new rulings on fair use, platform policies demonetizing AI content, voice-clone fraud, and creative-labor pushback (guild contracts in film, games and voice acting now set AI terms).

---

## 5.5 Alternative Asset Classes & Tech Stock Outlook

*Educational analysis, not investment advice. Markets move. Verify current prices and conditions.*

**Macro backdrop.** After the 2022–23 rate shock, central banks began easing in 2024–25, the Fed with cuts in late 2024 and again from September 2025. Inflation came down but stayed sticky above target in several economies. Tariffs and fiscal deficits added volatility. Equity markets were dominated by AI-linked mega-caps. That concentration is the defining feature, and the defining risk, of the current cycle.

**Tech stocks: the AI trade.**
- **Winners so far:** compute (NVIDIA hit multi-trillion-dollar valuations; TSMC; Broadcom for custom accelerators), hyperscalers (Microsoft, Alphabet, Amazon, Meta) and power/cooling suppliers.
- **The central question:** does AI revenue grow fast enough to justify $400B+ per year in hyperscaler capex? Bull case: agentic AI and enterprise adoption convert into cloud revenue, and inference demand compounds. Bear case: overbuild, price deflation in model access, circular financing between labs, chipmakers and clouds, and a capex digestion phase like 2001-style telecom.
- **Positioning ideas investors debate:** (1) the "second derivative" (utilities, grid equipment, transformers, nuclear/SMR developers, data-center REITs); (2) application-layer software that shows AI-driven margin expansion; (3) semicap equipment tied to advanced packaging. Valuation discipline matters. Concentration in the top 10 S&P 500 names reached record levels.

**Alternative asset classes:**
1. **Gold & precious metals.** Gold set repeated records in 2025, passing $4,000/oz in October 2025, driven by central-bank buying (especially emerging markets diversifying from the dollar), geopolitical risk and rate cuts. Role: portfolio insurance, not a growth asset.
2. **Bitcoin & digital assets.** US spot bitcoin ETFs (approved January 2024) brought institutional flows. The GENIUS Act (July 2025) created a federal framework for payment stablecoins. Volatility remains extreme. Treat crypto as a small, high-risk satellite allocation if at all.
3. **Tokenized real-world assets.** Tokenized Treasuries and money-market funds (BlackRock BUIDL, Franklin BENJI) grew to billions. Tokenization is a real infrastructure shift for settlement and collateral, more relevant to fintech builders than to retail speculation.
4. **Private credit.** It grew into a ~$1.5–2T market as banks retreated from leveraged lending. Yields are attractive, but liquidity is limited, valuations are opaque, and default stress could surface in a slowdown. Retail access via evergreen funds and interval funds is expanding; check fees and redemption terms.
5. **Infrastructure & energy transition.** Data-center power demand is creating long-duration contracted assets: power purchase agreements, grid, storage. This is the clearest real-asset link to the AI build-out.
6. **Collectibles & art.** The high-end art market contracted from its 2022 peak. Fractional platforms exist but carry high fees and illiquidity. Collect for passion, not returns.
7. **Farmland & timber.** Low correlation and inflation linkage. Access mostly via REITs or specialist funds.

**Framework for an individual investor (generic principles):**
- Core first: diversified, low-cost global index exposure. Alternatives are satellites (often ≤ 10–20% combined for those who use them at all).
- Match liquidity to needs. Never lock up emergency funds in private credit or illiquid tokens.
- **Pay down high-interest debt before chasing alternatives.** A credit card at 20%+ APR is a guaranteed negative return no asset reliably beats.
- Watch fees: alternatives often charge 1–2% plus performance fees.
- Concentration risk: an "AI portfolio" of mega-caps plus semis plus crypto is one correlated bet.

**12–24 month watchlist:** hyperscaler capex guidance and AI revenue disclosures; power-grid bottlenecks; Fed path and term premium; tariff policy; private-credit default rates; stablecoin and tokenization adoption by major banks; any repricing in AI-lab private valuations.
