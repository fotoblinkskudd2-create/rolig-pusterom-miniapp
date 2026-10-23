# PART 5: DEEP RESEARCH REPORTS

> Thematic research, not investment advice. Figures are directional and should be checked against primary sources (company filings, agency statistics, named research houses) before any capital decision.

---

## 5.1 AI Technology Trends & Investment Thesis

**Thesis: value is moving from model training to *applied workflows with proprietary feedback loops*. The best risk-adjusted returns at seed to Series B are in vertical applications that own an outcome, not in horizontal model layers.**

**Trend 1 — Capability commoditization at each tier.** Since 2023, the price of a given capability level (e.g. "GPT-4-class on standard benchmarks") has fallen by roughly an order of magnitude per year or faster. Open-weight models (Llama, Qwen, DeepSeek, Mistral families) trail the frontier by months, not years. *Implication:* a startup whose only edge is "we use model X" has none. Model choice is a procurement decision, re-made quarterly.

**Trend 2 — Agents moved from demo to production in narrow domains.** 2025 was the year agentic coding (Claude Code, Cursor, Codex-style tools) became a mainstream developer workflow, with several of these tools reportedly reaching hundreds of millions of dollars in annualized revenue. Tool use, computer use and the Model Context Protocol (MCP) gave agents standard ways to act. *Implication:* the next wave targets other text-heavy professional workflows: claims, compliance, procurement, legal intake, accounting close. These domains have clear success criteria and expensive human labor.

**Trend 3 — On-device inference became real.** Apple's Foundation Models framework, Gemini Nano, Qualcomm/MediaTek NPUs and WebGPU let ~1–4B parameter models run locally at useful speed. *Implication:* privacy-sensitive categories (health, finance, children) can now ship AI without a data-processing liability. This is the basis for the Rolig Companion recommendation.

**Trend 4 — Inference demand, not training, drives infrastructure.** Reasoning models and agents consume many more tokens per task than chat. Data-center capex by hyperscalers reached hundreds of billions of dollars annually by 2025. Power and grid interconnection, not GPUs alone, became the binding constraint.

**Trend 5 — Regulation becomes a moat for the prepared.** The EU AI Act's obligations phase in from 2025 to 2027. Sector regulators (health, finance, employment) are adding AI-specific guidance. Compliance-by-design is expensive for incumbents to retrofit and cheap for new builders to start with.

**Where to invest (ranked)**
1. **Vertical agents with outcome pricing.** The company is paid per resolved claim, closed ticket or recovered dollar. Watch for gross margin above 70% after inference, and proprietary outcome data from every completed task.
2. **AI-native services businesses.** Firms that use agents to deliver a service at software margins (bookkeeping, appeals, tax prep). This is a roll-up opportunity in fragmented professional services.
3. **Evaluation, observability and safety tooling.** Every production AI system needs regression testing, cost control and auditability.
4. **Privacy-preserving and on-device AI** for regulated consumer categories.
5. **Energy and cooling for inference** (see 5.5).

**Avoid:** thin wrappers without workflow depth; consumer chat companions optimized for engagement (regulatory and reputational tail risk); foundation-model plays below frontier scale without a distribution advantage.

**Diligence questions:** What happens to gross margin if the best model's price drops 80%? (It should rise.) What data does each customer interaction produce that a competitor cannot get? Can the product survive switching model vendors in a week?

---

## 5.2 Autonomous Systems & Drone Applications in Commercial Markets

**Thesis: commercial autonomy is splitting into two markets. One is *bounded-environment* autonomy, profitable now (warehouses, mines, farms, inspection). The other is *open-world* autonomy, capital-intensive and winner-take-most (robotaxis, urban delivery). Early-stage capital earns its best returns in the first.**

**Robotaxis.** Waymo moved from pilot to scaled commercial service in several US cities in 2024–25, reportedly serving hundreds of thousands of paid rides per week by 2025. Baidu Apollo Go and others operate at scale in China, and Tesla launched a limited robotaxi service in Austin in 2025. This segment needs billions in capital, regulatory approval city by city, and a huge safety data advantage. It is not a seed-stage game. Adjacent opportunities include remote assistance operations, fleet depot automation, insurance and claims for autonomous fleets, and simulation/validation tooling.

**Drones — the regulatory unlock.** Beyond-visual-line-of-sight (BVLOS) operations are the gate to drone economics. The US FAA proposed its Part 108 BVLOS rule in 2025. EASA's U-space framework and specific-category approvals are maturing in Europe. Norway, with long coastlines, offshore assets and sparse settlements, has been an active test market (e.g. medical sample delivery and offshore logistics pilots).

**Highest-value commercial drone applications**
| Segment | Why it works now | Business model |
|---|---|---|
| **Infrastructure inspection** (power lines, wind turbines, bridges, pipelines) | Replaces helicopters and rope access; vision AI auto-detects defects | Per-asset inspection contracts + defect analytics SaaS |
| **Drone-in-a-box security & site monitoring** | Docked drones launch automatically on alarms; one remote pilot oversees many sites | Monthly per-site subscription |
| **Precision agriculture** | Spraying drones are already mainstream in Asia; spot-spraying cuts chemical use | Hardware + per-hectare service |
| **Emergency response / DFR (drone as first responder)** | Drone on scene before officers in many calls; growing adoption by US police departments | Municipal SaaS contracts |
| **Medical & critical logistics** | Zipline and others proved scaled delivery of blood and medical supplies | Per-delivery fees with health systems |
| **Defense & dual-use** | Ukraine war reshaped doctrine; European defense budgets rising toward NATO targets | Government procurement; long cycles, large contracts |

**Ground and industrial autonomy.** Autonomous haulage in mining is mature (Caterpillar, Komatsu). Autonomous yard trucks, airport tugs, and agricultural tractors (Deere's autonomy kits) are scaling. Warehouse AMRs are mainstream. Humanoid robots attracted large funding rounds in 2024–25, but commercial deployments remain pilots. Unit economics are not yet proven outside tightly scripted tasks.

**AI's role.** Vision-language-action models and foundation models for robotics improve generalization. In the near term, though, the value sits in *perception + analytics* (defect detection, change detection, digital twins). Flight autonomy itself is largely solved.

**Risks:** regulatory delays (BVLOS), public acceptance (noise, privacy), supply-chain politics (US restrictions on Chinese drone makers such as DJI shift share to Western suppliers, which raises costs but creates openings), and capital intensity in hardware.

**Investment view:** Overweight software and analytics on top of commodity airframes, docked autonomy for recurring revenue, and dual-use inspection platforms. Underweight new airframe makers without a defensible niche and anything that depends on urban delivery economics.

---

## 5.3 Emerging Product Categories & Market Opportunities

**Thesis: the most attractive 2026–2028 categories share three traits. AI removes a scarce human expert from the critical path. Trust or regulation keeps generic players out. Someone with a budget already pays for the bad status quo.**

**1. Healthcare: administrative AI before clinical AI.** Ambient clinical documentation (Abridge, Nuance DAX, Nabla and others) became one of the fastest-adopted health IT categories in 2024–25, because it saves clinician time without making diagnostic claims. *Next:* prior-authorization automation on both sides, patient-side claim appeals (Concept 2), care navigation for chronic conditions, and on-device mental wellness (Concept 1). Clinical decision AI follows more slowly behind regulatory evidence requirements.

**2. Fintech: agents that act, not dashboards that inform.** Budgeting apps showed users charts and saw them churn. The next generation *does* things: negotiates bills, cancels subscriptions, disputes fees, files paperwork, moves money on rules. Opportunities: debt triage (Concept 4), SMB back-office agents (bookkeeping, invoicing, collections), and compliance automation (KYC/AML review). Open-banking regimes (PSD2/PSD3 in the EU, the CFPB's 1033 open-banking rule in the US, though its future became uncertain in 2025) are the enabling infrastructure.

**3. Climate: software for the electrified home and grid.** Heat pumps, EVs, home batteries and dynamic tariffs create an optimization problem no person can solve by hand (Concept 3). Virtual power plants that aggregate home devices into grid services are growing as grids add variable renewables. Adjacent opportunities: AI for permitting (interconnection queues hold enormous renewable capacity), building-retrofit planning, and supply-chain carbon accounting driven by EU CSRD (whose scope was narrowed by the 2025 Omnibus package).

**4. Education: AI tutors with evidence.** Khanmigo and similar tools showed demand. Schools now want proof of learning gains. Winners will publish efficacy, integrate with school systems, and serve underserved languages (Concept 5). Adult reskilling for AI-changed jobs is a parallel B2B market funded by employers.

**5. Human connection: anti-loneliness infrastructure.** Loneliness is now a public-health priority (WHO 2025; UK and Japan appointed ministers for loneliness). Products that *create* human contact (local group formation, intergenerational matching, structured friendship formats such as Timeleft's dinners with strangers) are growing. AI's role is matching and gentle nudging, not replacing people.

**6. Creative and personal software ("vibe-coded" niche apps).** AI coding tools collapse the cost of building small apps (Part 4). This produces a long tail of profitable micro-SaaS products serving niches too small for venture-funded companies, and a market for templates, backends and payments infrastructure aimed at those builders.

**Opportunity scoring heuristic (use for any new idea)**
| Signal | Strong |
|---|---|
| Current workaround cost | > $50/month or > 2 hours/month per user |
| AI cost per task | < 5% of price |
| Data flywheel | Each task improves the next |
| Trust barrier | Privacy, regulation or safety keeps generic chatbots out |
| Payer clarity | Named budget line (HR wellness, claims, energy bill) |

**Market timing signals:** incumbent product shutdowns or pivots; new regulation that creates compliance work; a hardware cost crossing a threshold (NPUs in mid-range phones); a public API opening (meter data, open banking, health records via FHIR).

---

## 5.4 Creative Industries + AI: Art, Music, Design Revenue Models

**Thesis: generative AI is deflationary for *generic* creative output and inflationary for *provenance, taste, community and live presence*. Revenue migrates from selling files to selling identity, rights and experiences.**

**State of play (2025–26)**
- **Image and design.** Midjourney, Adobe Firefly, and image generation inside major chat assistants made "good enough" visuals nearly free. Adobe positioned Firefly as commercially safe (trained on licensed content) and charges via generative credits inside Creative Cloud. Canva expanded its AI suite and acquired Leonardo.ai (2024). Stock-image businesses consolidated (Getty and Shutterstock agreed to merge) and launched licensed-model offerings.
- **Music.** Suno and Udio enabled text-to-song. Major labels sued both in 2024. Through 2025 the industry shifted toward licensing deals and settlements, including label agreements with AI music companies. Streaming platforms are dealing with floods of AI-generated tracks and have tightened policies on spam and impersonation.
- **Video.** OpenAI's Sora, Google's Veo, Runway and Kling brought short-form AI video to production quality for ads and previs. Studios use it mostly for previsualization and VFX rather than final frames, partly because of guild agreements (the 2023 WGA and SAG-AFTRA contracts include AI provisions).
- **Law.** The US Copyright Office's 2025 reports affirmed that purely AI-generated works lack copyright protection; human authorship matters. Fair-use litigation over training data is ongoing, with mixed early rulings. The EU AI Act requires training-data transparency summaries from general-purpose model providers.

**Revenue models that work**
| Model | Example | Who captures value |
|---|---|---|
| **Licensed training & opt-in style models** | Artists license their style or catalog for a revenue share | Rights holders with large, clean catalogs |
| **Voice and likeness licensing** | Artist-approved voice models with per-use royalties | Known artists; requires identity verification and tracking |
| **AI-assisted production SaaS** | Stem separation, mastering, design-to-code, video editing (e.g. Descript) | Tool makers that sell to professionals by seat |
| **Provenance & authenticity** | C2PA content credentials; "human-made" certification | Infrastructure providers; premium for verified-human work |
| **Fan participation** | Official remix tools, personalized merch, interactive releases | Artists with communities |
| **Live and physical** | Concerts, exhibitions, limited prints, workshops | Artists; AI cannot replace presence |
| **Commissioned taste** | Creative direction, curation, brand systems | Senior creatives; AI raises their output per hour |

**Where the money is leaving:** generic stock imagery, background music libraries, entry-level graphic design, simple copywriting, and voice-over for corporate video. Prices there are falling sharply.

**Opportunities for builders**
1. **Rights and royalty infrastructure.** Tracking which licensed works influenced an output and paying holders. This is a hard technical problem with high value.
2. **Creator-owned models.** Tools for an illustrator to fine-tune a private model on their own work and sell access to clients under license.
3. **Authenticity marketplaces** for human-made art with verified process (time-lapse, credentials).
4. **Professional co-pilots** inside existing tools (Figma, DAWs, NLEs) that take over repetitive work and leave creative decisions to the artist.

**Risks:** unresolved training-data litigation; platform policy changes; oversupply driving attention costs up; reputational backlash against undisclosed AI use.

**Bottom line:** Bet on rights, provenance, professional tooling and community. Bet against commodity content production as a standalone business.

---

## 5.5 Alternative Asset Classes & Tech Stock Outlook

> Educational overview. Not a recommendation to buy or sell any security. Past performance does not predict future results. Consult a licensed adviser for personal decisions.

**Framing: the AI build-out is a capex cycle. Capex cycles reward the suppliers of scarce inputs early and the efficient users of the new capability later. Valuations then decide whether a good business is a good investment.**

**Public tech equities — structural view**
- **Compute and semiconductors.** GPU and accelerator demand (NVIDIA, AMD, custom silicon from Google, Amazon, Microsoft and Meta), advanced foundry capacity (TSMC) and high-bandwidth memory (SK hynix, Samsung, Micron) were the clearest beneficiaries of 2023–25. *Key risk:* concentration. A small number of hyperscalers drive most demand, so any pause in their capex guidance hits the whole chain. Export controls on China add policy risk.
- **Hyperscalers and platforms.** Microsoft, Alphabet, Amazon and Meta are spending at historic capex levels. The investor question for 2026–27 is *return on AI capex*: whether cloud AI revenue and productivity gains grow fast enough to justify depreciation. Watch cloud growth rates, AI revenue disclosures and free-cash-flow conversion.
- **Software.** Seat-based SaaS faces pressure if agents reduce headcount, the very thing seats are priced on. Winners shift to usage or outcome pricing and own proprietary data or workflows. Expect valuation dispersion across the sector to stay wide.
- **Index concentration.** The largest US tech companies make up an unusually high share of the S&P 500. Diversification within "tech" is lower than it looks.

**Alternative asset classes linked to the AI and energy transition**
| Asset class | Thesis | Key risks |
|---|---|---|
| **Data-center real estate & infrastructure** (listed REITs, private infra funds) | Long-term leases to hyperscalers; power-secured sites are scarce | Overbuild; tenant concentration; interest-rate sensitivity |
| **Power generation & grid** (utilities, transmission, nuclear including SMR developers, gas turbines) | Inference demand + electrification push electricity demand growth after years of flat consumption in many markets | Regulation; project delays; SMR technology and cost risk |
| **Critical minerals & materials** (copper, lithium, rare earths, uranium) | Grid build-out, EVs, chips; supply concentration (China dominates rare-earth processing) | Commodity cycles; policy shocks; long mine lead times |
| **Private credit for infrastructure** | Banks retreated; data-center and energy projects need debt | Opaque valuations; liquidity; credit cycle |
| **Venture / growth secondaries** | Late-stage private companies staying private longer; discounts on secondary stakes | Valuation marks; information asymmetry |
| **Digital assets** | Spot Bitcoin and Ether ETFs (US, 2024) brought institutional access; stablecoin regulation advanced (US GENIUS Act 2025, EU MiCA) | Extreme volatility; regulatory change; custody and counterparty risk |
| **Farmland & timberland** | Inflation hedge, low correlation | Illiquidity; climate exposure |
| **Collectibles & art** | Low correlation; fractional platforms widened access | High fees; illiquidity; opaque pricing; the art market contracted in 2023–24 |

**Scenario map (12–36 months)**
- **Base case.** AI capex growth slows but stays high. Leadership broadens from chips to power, infrastructure and AI-native software with proven revenue.
- **Bull case.** Agentic AI produces measurable enterprise productivity gains; software earnings re-accelerate; capex is validated.
- **Bear case.** A digestion phase: hyperscalers cut capex guidance, semiconductor inventory corrects, highly valued AI names de-rate sharply (the 2000 telecom capex cycle is the cautionary parallel). Power and grid assets hold up better because electrification demand is not AI-only.

**Portfolio principles for an AI-era allocator**
1. Separate *exposure to the AI theme* from *concentration in five stocks*.
2. Pair compute exposure with power and grid exposure. The bottleneck shifts.
3. Size illiquid alternatives to the capital you will not need for 7–10 years.
4. In private markets, prefer companies whose margins *improve* as model prices fall.
5. Rebalance on rules, not narratives.

**Signals to monitor quarterly:** hyperscaler capex guidance; cloud AI revenue disclosures; token price trends at fixed capability; data-center power interconnection queues; HBM supply and pricing; enterprise AI adoption surveys; the regulatory calendar (EU AI Act milestones, export-control updates).
