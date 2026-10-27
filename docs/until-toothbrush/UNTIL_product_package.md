# UNTIL — Closed-Loop Plaque-Guided Toothbrush

### Full product development package: research → concept → spec → drawings → brand → launch → pitch

> Labels used on every claim:
> **[FACT]** = established in published literature, standards or public record ·
> **[PROBABILITY]** = strong inference from data, likely but not proven ·
> **[SPECULATION]** = reasoned bet, must be validated.
>
> No user constraints were supplied. Full creative and technical freedom applied.

---

## SCRATCHPAD

### 1. State of the art — what the literature actually says

**Powered vs manual**
- Cochrane review (Yaacob et al., 2014; 56 trials, ~5,000 participants): powered brushes reduce plaque **11% more at 1–3 months** and **21% more at >3 months** vs manual; gingivitis **6%** and **11%** more respectively. Oscillating-rotating heads carry the most consistent evidence. **[FACT]**
- Translation: twenty years of motor engineering bought roughly a **one-fifth** improvement over a €2 stick of nylon. The motor is not the bottleneck. **[PROBABILITY]**

**What a single brushing actually removes**
- Systematic review of manual brushing exercises (Slot, Wiesmeijer & Van der Weijden, 2012): mean single-session plaque reduction **≈42%**. Brushing for 2 min removed ≈41% vs ≈27% at 1 min. **[FACT]**
- Equivalent review for powered brushes (Rosema et al., 2016): single-session reduction in the mid-40s %. **[PROBABILITY — exact pooled figure varies by index used]**
- Conclusion: after brushing, **more than half the plaque is still in the mouth**. Under lab conditions with full coverage, the same brushes remove far more. The gap between lab and bathroom is the product opportunity. **[PROBABILITY]**

**Duration and coverage**
- Observed mean brushing time in adults ≈ **46 seconds** (Beals et al., 2000), against the 2-minute recommendation. **[FACT]**
- Brushing is non-uniform: lingual surfaces of lower molars and buccal surfaces of the side the dominant hand crosses over to are systematically under-brushed. **[FACT — consistent across video-observation studies]**
- Built-in 2-minute timers improve average duration but enforce *time*, not *coverage*. A user can spend 90 of 120 seconds on the front teeth. **[FACT — timer logic; PROBABILITY — on typical distribution]**

**Where disease actually starts**
- Gingivitis develops within **10–21 days** of plaque accumulation at the gingival margin (Löe, Theilade & Jensen, 1965 — experimental gingivitis model). **[FACT]**
- Periodontitis affects **42.2%** of US adults ≥30, severe in **7.8%** (Eke et al., 2018, NHANES 2009–2014). **[FACT]**
- WHO Global Oral Health Status Report 2022: ~**3.5 billion** people affected by oral disease; severe periodontal disease ~**1 billion**; untreated caries in permanent teeth ~**2 billion**. **[FACT]**
- Interproximal surfaces and the gingival sulcus are the two zones where caries and periodontal disease concentrate and where brushes perform worst. **[FACT]**
- Only ~**32%** of US adults floss daily; ~**32%** never floss (Fleming et al., 2016). **[FACT]** Any solution that requires a second device or habit loses two-thirds of the population at the door. **[PROBABILITY]**

**Force**
- Excessive force (well above ~2.5–3 N) correlates with abrasion and recession; brands set pressure-sensor thresholds in the ~2–3 N band. **[PROBABILITY — thresholds are proprietary]**

**Connected brushes / apps**
- Oral-B iO (2020) and Sonicare Prestige track position via IMU + app. **[FACT]**
- App engagement for connected health devices decays sharply after the first weeks; position tracking that requires a phone propped on the sink does not survive month two. **[PROBABILITY]**
- Crucially: these systems track **where the brush was**, not **whether the tooth is clean**. They are motion loggers, not outcome sensors. **[FACT — by architecture]**

**Plaque optical signature**
- Mature dental plaque emits **red fluorescence** (≈620–690 nm) under ~405 nm excitation, driven by bacterial porphyrins (e.g., protoporphyrin IX); healthy enamel emits **green** autofluorescence (~500–540 nm). This is the basis of QLF (Quantitative Light-induced Fluorescence) used in dental research. **[FACT]**
- Red fluorescence intensity correlates with plaque maturity and with gingival inflammation risk better than with *fresh* (<24 h) plaque. **[PROBABILITY]**
- Prior art: a Dutch product (Plaqless Pro) has brought fluorescence-based plaque sensing into a toothbrush, signalling plaque presence to the user. **[PROBABILITY — product existence; clinical outcome data limited]**

### 2. Top unsolved problems

| # | Problem | Evidence of size |
|---|---|---|
| P1 | **No feedback on outcome.** Users brush blind; devices measure time and motion, never cleanliness. | >50% plaque left after a session **[FACT]** |
| P2 | **Coverage failure.** Same zones missed every day (lower lingual molars, distal surfaces of last molars). | Consistent across observation studies **[FACT]** |
| P3 | **Gumline miss.** Bass technique (45° into sulcus) is taught, almost never executed. Gingivitis starts exactly here. | Löe 1965; ~42% periodontitis prevalence **[FACT]** |
| P4 | **Interproximal neglect.** Two-thirds don't floss daily; brushes barely enter embrasures. | Fleming 2016 **[FACT]** |
| P5 | **Compliance decay.** Every engagement feature (apps, gamification) fades. | **[PROBABILITY]** |

### 3. Concept directions (≥5), assessed

**A. Full-mouth U-shaped "10-second" mouthpiece brush**
- Mechanism: brushes all teeth simultaneously.
- Feasibility: high. Novelty: low. Market fit: viral, then refunds.
- **Verdict — KILL.** One fixed geometry cannot match 7–8 billion different arches. Amabrush (Kickstarter 2018, ~€3.5M raised) collapsed amid reports of poor cleaning; independent evaluations of U-shaped automatic brushes found them **inferior to manual brushing**. **[FACT — Amabrush insolvency; PROBABILITY — inferiority generalizes across the category]** A product that cleans *worse* and sells on convenience is a lawsuit with a charger.

**B. Ultrasonic cavitation / microbubble brush**
- Mechanism: acoustic cavitation or driven microbubbles detach biofilm beyond bristle contact.
- Feasibility: low–medium. Novelty: medium. Market fit: niche.
- **Verdict — KILL (for now).** Effective cavitation needs acoustic intensities that raise soft-tissue safety, heating and regulatory questions; existing "ultrasonic" consumer brushes (~1.6 MHz) have thin, mostly manufacturer-linked evidence. **[PROBABILITY]** Great physics, not a 2027 product. **[SPECULATION]**

**C. Integrated brush + water-jet hybrid**
- Mechanism: pulsed water stream for interproximal + sonic brush.
- Feasibility: high. Novelty: **none** — Waterpik Sonic-Fusion has shipped since 2018. **[FACT]**
- **Verdict — KILL.** Countertop reservoir, splash, cleaning burden, low daily-use compliance. Solves P4 for the 30% who already floss. **[PROBABILITY]**

**D. Photocatalytic / ionic / "antibacterial bristle" brush**
- Mechanism: TiO₂ semiconductor rods, silver/copper-infused bristles.
- **Verdict — KILL, explicitly as weak.** Plaque removal is mechanical; antimicrobial bristle surfaces do nothing to the biofilm on the tooth. Ionic brush evidence is small, old and inconsistent. **[PROBABILITY]** This is marketing chemistry.

**E. Gumline-and-embrasure geometry head ("Bi-Bass" head)**
- Mechanism: bristle architecture that executes Bass technique automatically regardless of how the user holds the brush, plus extended tapered tufts for embrasures.
- Feasibility: high (tufting/injection molding). Novelty: medium. Market fit: strong, but a head alone is easy to copy. **[PROBABILITY]**
- **Verdict — KEEP as a component.** Necessary, not sufficient.

**F. Closed-loop plaque-guided brush**
- Mechanism: optical plaque sensing in the head + IMU position tracking → per-zone "clean/not clean" map → the session **ends when the mouth is clean**, not when a timer expires. Feedback lives on the handle, no phone required.
- Feasibility: medium (optics + firmware + foam interference are the real problems). Novelty: high as a full closed loop. Market fit: very strong — it attacks P1, P2, P5 at once and is demonstrable on camera. **[PROBABILITY]**
- **Verdict — KEEP as core.**

**G. Subscription/coaching platform around an ordinary brush**
- **Verdict — KILL.** Changes the business model, not the cleaning. Not this brief.

### 4. Selection

**Winner: F + E fused — a closed-loop plaque-guided sonic brush with a Bi-Bass gumline/embrasure head.**

Hard reasoning:
1. The data say the deficit is **behavioral and positional**, not motor power: lab-capable brushes leave >50% plaque in real use, and powered motors only buy ~11–21% over manual. **[FACT]** The highest-leverage innovation therefore closes the loop on *outcome*. **[PROBABILITY]**
2. Every incumbent tracks *position*. None ties session control to a *measured cleanliness signal* per zone. That is a defensible gap. **[PROBABILITY — FTO search required]**
3. The Bi-Bass head fixes P3/P4 mechanically for users who will never learn technique — and makes the high-margin consumable (heads) proprietary, because the optical light-guide lives in the head. **[PROBABILITY]**
4. It is **demonstrable**: a violet-light demo where red plaque zones visibly disappear and the handle map goes dark sells itself in 6 seconds of video. **[PROBABILITY]**
5. Main risk is honest and testable: toothpaste foam and fresh plaque weaken the optical signal. Mitigation is sensor fusion (optics + dwell time + IMU coverage) and a conservative "zone clear" rule. **[PROBABILITY]**

Rejected fusion add-ons: water jet (C), ultrasonics (B), app-first coaching (G). Each adds cost and failure modes without attacking the measured bottleneck.

---

<product_package>

## SECTION 1: PROBLEM STATEMENT

### 1.1 What best-in-class fails to solve

| Failure | Quantified | Label |
|---|---|---|
| **Brushing is blind.** No device tells the user whether a tooth is actually clean. | Single session removes ≈42% (manual) to mid-40s% (powered) of plaque — the majority stays. | [FACT] |
| **Timer ≠ coverage.** 2-min timers fix duration on average, not distribution. | Mean unassisted duration ≈46 s; zones are missed systematically. | [FACT] |
| **Motor gains have plateaued.** | Powered vs manual: −11% plaque (1–3 mo), −21% (>3 mo); −6% / −11% gingivitis. | [FACT] |
| **Gumline technique never happens.** Bass technique requires 45° sulcular angulation the user cannot see or feel. | Gingivitis develops in 10–21 days of marginal plaque. 42.2% of US adults ≥30 have periodontitis. | [FACT] |
| **Interproximal zones abandoned.** | ~32% floss daily, ~32% never. | [FACT] |
| **Engagement decays.** App-tethered position tracking demands a phone at the sink. | Majority of users stop using companion apps within weeks. | [PROBABILITY] |

### 1.2 Who suffers most (target segments)

1. **Gingivitis-prone adults 30–60** (the bleeding-gums cohort, ~40%+ of adults) — highest willingness to pay, dentist-referred. **[PROBABILITY]**
2. **Orthodontic patients** (brackets/aligners: plaque traps, demineralization white-spot lesions). Parents pay. **[FACT — white-spot lesions are a common ortho complication; PROBABILITY — on WTP]**
3. **Implant and periodontal-maintenance patients** — clinical stakes are high, treatment is expensive, compliance is poor. **[PROBABILITY]**
4. **Reduced-dexterity users** (elderly, arthritis, caregiving) — feedback replaces technique. **[PROBABILITY]**
5. **Children 6–12** (later SKU) — the "brush until the red is gone" mechanic is native gamification. **[SPECULATION]**

---

## SECTION 2: THE CONCEPT

### 2.1 Working title
**Project CLOSED LOOP** (codename: *Sentinel*).

### 2.2 Core innovation, one sentence
A sonic toothbrush that **measures plaque optically at every zone of the mouth and refuses to finish until each zone reads clean**, using a head that physically forces bristles into the gumline and between teeth.

### 2.3 Mechanism — why it cleans better

**(a) Optical outcome sensing — the "eye"**
- A 405 nm LED in the handle tip pulses light through a molded cyclic-olefin-copolymer (COC) light guide in the replaceable head, exiting through a 2.2 mm window in the center of the bristle field. **[Engineering design]**
- Two filtered photodiodes measure returning **red (620–690 nm)** plaque fluorescence and **green (500–540 nm)** enamel autofluorescence. The **R/G ratio** is the plaque index proxy; ratioing cancels distance and angle variations to first order. **[FACT — QLF principle; PROBABILITY — robustness of ratio in-brush]**
- The LED is modulated at 2 kHz and demodulated by lock-in detection to reject bathroom light and the 265 Hz motor vibration. **[FACT — standard technique]**

**(b) Position fusion — the "map"**
- A 6-axis IMU classifies the brush into **16 zones** (6 sextants × buccal/lingual + 4 occlusal quadrants). Magnetometer omitted (motor magnet interference). **[PROBABILITY — 16-zone IMU classification is shipped tech]**
- Each zone holds a state: *unvisited → dirty → clearing → clear*.

**(c) Closed-loop session control — the "rule"**
- A zone turns **clear** when: dwell ≥ 6 s **AND** R/G ratio has dropped below the user's personal clean-baseline + margin for ≥ 2 s cumulative. If optics are unreliable (foam saturation, confidence flag), the zone falls back to dwell ≥ 10 s. **[Engineering design]**
- The session ends when all 16 zones are clear (minimum 90 s, cap 240 s). The motor emits a distinct haptic double-pulse at each zone clear and a "done" pattern at the end. **[Engineering design]**
- A **6-dot mouth-map** on the handle (sextant LEDs) glows amber for dirty sextants and goes dark as they clear. No phone required. **[Engineering design]**
- Behavioral principle: closing an action-outcome loop with immediate, visible feedback produces stronger habit formation than abstract targets (timers). **[FACT — well-established in behavioral psychology; PROBABILITY — magnitude in this context]**

**(d) Bi-Bass head — the "hands"**
- The outer two bristle rows on each long side splay outward at **±18°** in a V profile. Whichever way the user tilts the head against upper or lower teeth, one row enters the gingival sulcus near the Bass angle. A single fixed angle cannot do this because the sulcus faces opposite directions on upper and lower arches. **[Engineering design; PROBABILITY — sulcular access gain]**
- **Six interproximal "spear" tufts** of tapered PBT filaments stand **1.5 mm proud** of the main field at the head tip and along one long edge, entering embrasures under sonic sweep. **[Engineering design]**
- Main field: end-rounded PA6.12 filaments, Ø 0.15 mm, medium-soft. **[FACT — industry-standard material]**

**(e) Force guard**
- Hall-effect sensing of actuator deflection; above **2.2 N** the motor drops amplitude 40% and the handle ring flashes. **[Engineering design]**

### 2.4 How much better — realistic estimate

| Metric (vs leading oscillating-rotating / sonic brush in normal home use) | Estimate | Reasoning | Label |
|---|---|---|---|
| Single-session whole-mouth plaque removal | **+15–25% relative** (e.g., from ~46% to ~55–58% removed) | Coverage enforcement removes the systematic zone misses; longer average sessions (~150 s vs typical <120 s) follow the duration-effect curve. | [PROBABILITY] |
| Gingival-margin plaque at 4 weeks | **−20–30% relative** | Bi-Bass rows target the sulcus every stroke; optics flag marginal plaque, which is mostly mature (red-fluorescent). | [SPECULATION] |
| Interproximal plaque | **−10–20% relative** vs non-spear heads | Spear tufts penetrate embrasure entrance only; will **not** replace floss in tight contacts. | [SPECULATION] |
| Bleeding on probing at 12 weeks | **−15–25% relative** | Follows from margin-plaque reduction via Löe model. | [SPECULATION] |
| 6-month continued daily use | **>70%** of buyers | No app dependency; feedback is intrinsic to the brush. | [SPECULATION] |

**Honest ceiling:** fresh (<24 h) plaque fluoresces weakly and toothpaste foam attenuates signal. The optics therefore reliably detect the plaque that matters most clinically (mature, marginal) and rely on dwell rules for the rest. Claims must be built on the clinical trial, not on the sensor physics. **[PROBABILITY]**

---

## SECTION 3: MARKET ANALYSIS

### 3.1 Market size
| Segment | Size (2024–25) | Growth | Label |
|---|---|---|---|
| Global oral care | ~USD 45–55 bn | ~4–6% CAGR | [PROBABILITY — analyst estimates vary] |
| Global toothbrushes (all) | ~USD 8–10 bn | ~5% CAGR | [PROBABILITY] |
| Electric toothbrushes | ~USD 3.5–4.5 bn | ~6–8% CAGR | [PROBABILITY] |
| Premium electric (>USD 150 retail) | ~15–25% of electric value | Fastest-growing tier | [SPECULATION] |
| Replacement heads | Recurring stream; typically 3–4 heads/user/year | — | [PROBABILITY] |

### 3.2 Buyers
- **B2C (primary, ~75% revenue Y3):** premium electric buyers, gingivitis cohort, ortho parents. Channels: DTC web, Amazon, premium electronics/pharmacy retail (Boots, Elkjøp/Power, Best Buy, Apotek 1). **[SPECULATION — mix]**
- **B2B (~25% revenue Y3, strategic beyond its size):**
  - Dental clinics and periodontists: "prescribe and dispense" with clinic margin; optional clinic dashboard showing patient zone-history at recall visits (opt-in data). **[SPECULATION]**
  - Orthodontic practices: bundled into treatment fee. **[SPECULATION]**
  - Dental insurers / employer wellness: periodontal treatment is expensive; a measurable-hygiene device is underwritable. **[SPECULATION]**
  - Care homes: caregiver mode (session ends only when clean = auditable care). **[SPECULATION]**

### 3.3 Competitive landscape
| Player | Position | Threat to them | Likely response |
|---|---|---|---|
| **P&G Oral-B** (iO, Genius) | Global electric leader; oscillating-rotating + AI position tracking | Our loop makes their position tracking look like a motion logger | Fast-follow with optical module in 24–36 months; patent challenges; retail shelf pressure. **[PROBABILITY]** |
| **Philips Sonicare** (Prestige, DiamondClean) | #2 electric; sonic, premium | Directly in our tech family | Same as above; also likely to cite its own plaque-detection patent estate. **[PROBABILITY]** |
| **Colgate-Palmolive** (hum, manual dominance) | Weak in premium electric | Low direct threat | Possible acquirer/licensee. **[SPECULATION]** |
| **Plaqless** (fluorescence brush) | Proven-concept niche player | Closest prior art; we differentiate on full closed loop + head + no-app UX | Partnership or IP collision — must be resolved pre-launch. **[PROBABILITY]** |
| **Waterpik** | Interproximal water flossing | Spear tufts + clean-map reduce perceived need | Marketing "brush can't do interproximal". **[PROBABILITY]** |
| **Cheap DTC sonic (Quip, Chinese ODMs)** | Price | None at premium tier | Will copy the "violet light" aesthetic without real sensing — fake-feature risk. **[PROBABILITY]** |

**Moat:** (1) method patents on session termination by per-zone optical state; (2) head light-guide design that locks consumables; (3) clinical trial data incumbents must replicate; (4) personal-baseline calibration dataset. **[SPECULATION — strength depends on FTO]**

### 3.4 Pricing and margin
| Item | Retail | Target COGS (mass) | Gross margin | Label |
|---|---|---|---|---|
| Starter kit (handle + 2 heads + charger + travel case) | **USD 199 / EUR 199 / NOK 2,290** | USD 32–38 | ~55–62% after retail margin | [SPECULATION] |
| Replacement head 3-pack | **USD 29** (USD 9.67/head) | USD 1.10–1.50/head | ~75–80% after retail | [SPECULATION] |
| Head subscription (DTC, quarterly) | USD 24/3-pack | same | ~85% DTC | [SPECULATION] |
| Clinic dispense price | USD 129 (sell at 199) | — | Clinic earns ~USD 70 | [SPECULATION] |

Logic: price at parity with Oral-B iO 9 / Sonicare Prestige, not above — the differentiator must win the comparison, not the price tag. Lifetime value is in heads: ~USD 90–115/user/year. **[PROBABILITY]**

### 3.5 Regulatory
| Market | Classification | Path | Timeline | Label |
|---|---|---|---|---|
| **USA** | Powered toothbrush, 21 CFR 872.6865, **Class I, 510(k)-exempt**, if claims stay at "removes plaque / helps prevent gingivitis via plaque removal" and "detects plaque" for hygiene guidance | Registration + listing, QSR/QMSR (21 CFR 820) | 3–6 months | [FACT — classification; PROBABILITY — exemption holds with our claims] |
| USA — **if** claims become diagnostic ("detects gum disease") | Likely Class II → 510(k) or De Novo | Avoid at launch | 9–18 months | [PROBABILITY] |
| **EU/EEA** | Consumer electrical product (not MDD/MDR at hygiene claims) → CE via **LVD / EMC / RED** (Bluetooth), **RoHS**, **WEEE**, **GPSR** | Self-declaration with notified-body optional | 3–6 months | [PROBABILITY] |
| EU — **Battery Regulation (EU) 2023/1542**, Art. 11: user-removable portable batteries from **18 Feb 2027**; derogation exists for appliances designed for wet environments (replacement by independent professionals) | Design for screw-access battery door with tool-replaceable cell to be safe on both readings | Design-in now | [FACT — regulation & date; PROBABILITY — derogation applicability] |
| **Standards** | **IEC 60335-2-52** (oral hygiene appliances safety); **ISO 20127** (powered toothbrushes, physical requirements); **IEC 62471** (photobiological safety — the 405 nm LED; target Exempt/RG0); **IPX7** (IEC 60529); Qi/inductive charging EMC | Third-party lab testing | 2–4 months parallel | [FACT — standards exist; design targets are ours] |
| **ADA Seal (US)** | Voluntary, requires clinical data | After RCT | 6–12 months | [FACT — program exists] |

**Overall regulatory difficulty: 4/10** if marketing claims are disciplined. **[PROBABILITY]**

---

## SECTION 4: PRODUCTION ANALYSIS

### 4.1 Materials and processes
| Component | Material | Process |
|---|---|---|
| Handle shell | PC/ABS (UL94 V-0 rated grade), glossy | Injection molding, 2-cavity |
| Grip overmold | TPE (SEBS), Shore 50A | 2K overmolding |
| Inner chassis | PA66-GF30 | Injection molding |
| Light window (handle tip) | Optical-grade PMMA, AR-coated | Injection molding + dip coat |
| Head body | PP homopolymer (head) with COC light-guide insert | **Insert molding** (COC guide placed, PP over-molded) |
| Light guide | COC (e.g., Topas/Zeonex grade), polished faces Ra < 0.05 µm | Precision injection molding, diamond-turned mold inserts |
| Main bristles | PA6.12 (Tynex-class), Ø 0.15 mm, end-rounded | Anchor-free tufting (AFT) or in-mold tufting |
| Spear tufts | PBT, chemically tapered to ~0.02 mm tips | AFT |
| Actuator | Linear resonant actuator: NdFeB magnet, Cu coil, spring steel torsion bar | Sub-supplier (sonic motor ODMs exist in Shenzhen/Dongguan) |
| Battery | Li-ion 14500-class, 3.7 V, 800 mAh | Purchased cell, BMS on PCB |
| Electronics | MCU (BLE SoC, Cortex-M4F), 6-axis IMU, 405 nm LED, 2× Si photodiode + bandpass filters, TIA + lock-in front-end, Hall sensor, 6 LED mouth-map, Qi receiver coil | SMT, 4-layer FR4, conformal coat |
| Seals | Silicone O-rings + ultrasonic-welded seam | Ultrasonic welding |

### 4.2 Difficulty to produce at scale: **6 / 10**
Justification:
- Handle, motor, battery, charging: commodity sonic-brush supply chain — **2/10**. **[FACT — mature ODM base]**
- Head with insert-molded COC light guide + optical-quality face under bristle tufting heat and stress: **the hard part — 8/10**. Bristle tufting and light-guide optical faces must coexist without scratching or misalignment; head is a consumable that must hit ~USD 1.30. **[PROBABILITY]**
- Optical calibration per unit (photodiode gain trim) at end of line: adds ~20 s/unit test time. **[PROBABILITY]**
- Firmware sensor fusion: hard engineering, zero marginal cost. **[PROBABILITY]**

### 4.3 Supply chain risks
1. **NdFeB magnets** — rare-earth supply concentrated in China; export-control exposure. Mitigation: dual-source, consider ferrite-based actuator variant (−15% amplitude). **[FACT — concentration; PROBABILITY — mitigation viability]**
2. **COC resin** — few global suppliers. Mitigation: qualify optical PMMA fallback (lower chemical resistance to toothpaste surfactants — must be tested). **[PROBABILITY]**
3. **405 nm LEDs** — commodity, but binning for wavelength ±5 nm needed. **[PROBABILITY]**
4. **Bristle filament** — PA6.12 is dominated by a small number of suppliers. **[PROBABILITY]**
5. **Li-ion transport/certification** (UN 38.3) — standard but schedule-critical. **[FACT]**
6. **Head counterfeits** — high-margin consumables attract fakes; the light guide is functional anti-counterfeit (fakes break sensing). Add NFC/ID resistor in head for authentication + wear tracking. **[PROBABILITY]**

### 4.4 Unit cost
| Stage | Handle | Head | Notes | Label |
|---|---|---|---|---|
| **Prototype (EVT, 20–50 units)** | USD 220–380 | USD 25–60 | SLA/CNC housings, hand-assembled optics, purchased dev-kit electronics | [PROBABILITY] |
| **Pilot (DVT/PVT, 1–5k units)** | USD 55–75 | USD 3–5 | Soft tooling, semi-manual assembly | [PROBABILITY] |
| **Mass (≥250k units/yr)** | **USD 24–30** BOM + assembly | **USD 1.10–1.50** | Hard steel tooling, automated tufting | [PROBABILITY] |
| Tooling CAPEX | — | — | ~USD 0.9–1.4 M (handle + head multi-cavity + tufting) | [PROBABILITY] |

Handle mass-BOM breakdown (USD, target): actuator 4.20 · battery 2.10 · PCB+components 7.40 (MCU 1.60, IMU 0.70, optics front-end 1.90) · housings/overmold 2.60 · charger base + coil 2.30 · packaging 1.80 · assembly/test 2.40 · misc 1.20 → **≈24.00**. **[SPECULATION]**

---

## SECTION 5: TECHNICAL SPECIFICATIONS

### 5.1 Spec sheet — UNTIL S1

| Parameter | Value | Tolerance / note |
|---|---|---|
| Overall length (handle + head) | 248 mm | ±0.5 mm |
| Handle length | 182 mm | ±0.3 mm |
| Handle cross-section | 27 × 24 mm elliptical (max), tapering to 16 mm at neck | ±0.2 mm |
| Head length (neck to tip) | 66 mm | ±0.3 mm |
| Bristle field | 21.0 × 10.5 mm | ±0.2 mm |
| Head back thickness | 4.2 mm | ±0.1 mm |
| Bristle trim height — main field | 10.0 mm | ±0.3 mm |
| Spear tufts | 6 tufts, 11.5 mm (1.5 mm proud), Ø 1.4 mm tuft | ±0.3 mm |
| Bi-Bass rows | 2 rows/side, splay ±18° from head normal | ±2° |
| Optical window | Ø 2.2 mm, centered at 9.0 mm from tip | ±0.05 mm position |
| Mass (with head) | 118 g | ±5 g |
| Ingress protection | IPX7 | — |
| Actuator | Linear resonant, 265 Hz (≈31,800 strokes/min) | ±3 Hz, auto-tuned to head resonance |
| Tip sweep amplitude | 3.0 mm p-p nominal (modes 2.0 / 3.0 / 3.6) | ±0.3 mm |
| Force guard threshold | 2.2 N → amplitude −40%, ring alert | ±0.2 N |
| Excitation | 405 nm LED, 2 kHz modulated, ≤ 8 mW optical at window | IEC 62471 Exempt Group target |
| Detection | Red band 620–690 nm, green band 500–540 nm, OD4 blocking at 405 nm | Filter stack |
| Optical sampling | 200 Hz demodulated output | — |
| Plaque index proxy | R/G ratio, personal baseline (auto-calibrates on first 3 sessions + clinic calibration option) | — |
| IMU | 6-axis, ±8 g / ±1000 dps, 400 Hz | — |
| Zones | 16 (6 sextants × buccal/lingual + 4 occlusal) | Target ≥90% zone classification accuracy |
| Session logic | Min 90 s, cap 240 s, zone clear = dwell ≥ 6 s + optical clear ≥ 2 s (fallback dwell ≥ 10 s) | Firmware-updatable |
| Feedback | 6-LED mouth map, status ring (RGB), haptic patterns via actuator | — |
| Battery | Li-ion 800 mAh, 3.7 V | Tool-replaceable (EU 2023/1542 design) |
| Runtime | ≥ 21 days at 2 × 2.5 min/day | — |
| Charging | Inductive 5 W, full in 3 h | — |
| Connectivity | BLE 5.3 (optional app, OTA firmware); device fully functional offline | — |
| Head ID | Resistor/NFC ID + wear counter (prompt at 90 days or bristle-splay detected via resonance shift) | — |
| Operating temp | 5–45 °C | — |
| Head life | 3 months | — |

### 5.2 Performance targets (validation gates)
| Gate | Target | Method |
|---|---|---|
| Optical plaque detection, in vitro | AUC ≥ 0.85 vs disclosing-agent ground truth on 72 h biofilm models | Bench, hydroxyapatite discs + saliva-derived biofilm |
| Detection through foam | AUC ≥ 0.75 with 3 reference toothpastes | Bench + in vivo |
| Zone classification | ≥ 90% accuracy, 20 users, video ground truth | In vivo |
| Single-use plaque removal | Non-inferior to Oral-B iO at fixed 2 min; ≥ +15% relative in free-use closed-loop mode | Crossover, n=40, Turesky-modified Quigley-Hein |
| 4-week RCT | Statistically superior MGI and plaque index vs leading sonic | n=120, parallel, examiner-blind |
| Abrasion | RDA-equivalent dentin wear ≤ comparator | ISO-style abrasion rig |
| Durability | 10,000 sessions handle; head 180 sessions w/o filament loss | ISO 20127 / ISO 22254-type tuft retention |

### 5.3 Novel mechanisms in engineering terms

**M1 — Head-integrated optical path.** 405 nm emission from the handle LED is coupled across a 0.3 ± 0.1 mm air gap into a COC light guide (NA ≈ 0.5) molded into the replaceable head. A 45° TIR facet at the head turns the beam through the Ø 2.2 mm window. Return fluorescence travels the same guide (bidirectional) to a dichroic split in the handle tip. Coupling efficiency target ≥ 45% each way. Keying ribs on the head shank hold rotational alignment to ±1.5°.

**M2 — Lock-in fluorescence front-end.** LED driven at 2 kHz square wave; transimpedance amplifiers (10 MΩ) on each photodiode; synchronous demodulation in the MCU; 4th-order low-pass at 50 Hz; motor-drive harmonics at 265 Hz and multiples notched out. SNR target ≥ 20 dB at 1 mm tooth distance on mature plaque.

**M3 — Personal-baseline R/G classifier.** Per-user, per-zone clean baseline learned from the lowest-decile R/G readings in each zone over the first 3 sessions, continuously updated with exponential forgetting (τ = 14 days). Zone clear when R/G < baseline × 1.15 for ≥ 2 s cumulative within that zone. Confidence flag drops optical weight when signal amplitude indicates foam saturation or window occlusion.

**M4 — Bi-Bass V-splay.** Outer rows tufted into holes drilled at ±18° in the head plate. Under 3 mm sonic sweep and 1.5 N load, the splayed filaments' tips trace ~0.8–1.2 mm into the sulcal entrance on the gingival side whichever direction the head is tilted. **[SPECULATION — to be validated with typodont and pressure-film studies]**

**M5 — Resonance-based head health.** Actuator drive current and frequency auto-tune detect head mass/stiffness change (bristle splay, missing tufts) as resonance shift > 2 Hz → replace prompt. Zero added BOM.

---

## SECTION 6: LINE DRAWINGS

### 6a. Full product overview (scale ≈ 1 char : 3 mm)

```
            FRONT VIEW                    SIDE VIEW                 TOP VIEW (looking down on head)

               ___                          ___
              /   \  <-- [1] head tip      |   \__  <-- [2] spear tufts (1.5 mm proud)
             | ::: | <-- [3] bristle field |  ||||       
             | :O: | <-- [4] optical window|  |||| <-- bristles (10.0 mm)            ______________
             | ::: |                       |  ||||                                 /  . . . . . .  \
             | ::: |                       |  ||_/                                | : : : O : : : : |  <-- [4] window Ø2.2
              \___/                        |  |  <-- [5] head back 4.2 mm         | : : : : : : : : |
               | |   <-- [6] neck          |  |                                    \__.__.__.__.__ /
               | |       Ø 7 mm            |  |                                      ^           ^
               | |                         |  |                                 [2] spear   [7] Bi-Bass
              _| |_  <-- [8] head/handle   _|  |_                                  tufts      rows ±18°
             |     |     interface + key  |     |
             |  o  | <-- [9] status ring  |     |
             |-----|                      |     |
             | . . | <-- [10] 6-dot       |     |                               HANDLE TOP (head removed)
             | . . |      mouth map       |     |                                  _______
             | . . |                      |     | <-- [11] TPE grip                /       \
             |     |                      | ||| |      overmold                   |  (o)    | <-- [12] optical port
             | ( ) | <-- [13] power/mode  | ||| |                                 |  [=]    | <-- drive shaft
             |     |      button          | ||| |                                  \_______/
             |     |                      |     |                                  27 x 24 mm
             |     |                      |     |
             |     |                      |     |
             |_____| <-- [14] base, Qi    |_____|
               27 mm      coil inside        24 mm

        Overall length 248 mm  |  Handle 182 mm  |  Head 66 mm  |  Mass 118 g
```

### 6b. Close-up: brush head and innovation zone

```
   HEAD CROSS-SECTION (A-A, through optical window)                 BRISTLE MAP (face view, 21.0 x 10.5 mm)

          sulcus-entering row                    sulcus-entering row        TIP
               \ 18°                               18° /                ____________________
                \                                     /                / S  S  S            \      S = spear tuft
         \\\     \ ||||  ||||  |  ||||  |||| /     ///               | B  m  m  m  m  m  B  |     (PBT, tapered,
          \\\     \||||  ||||  |  ||||  ||||/     ///                | B  m  m  m  m  m  B  |      11.5 mm)
           \\\_____|||||_|||||_|__|||||_|||||____///                 | B  m  m [O] m  m  B  |     m = main field
           |      PP head body          |          |                 | B  m  m  m  m  m  B  |     (PA6.12 Ø0.15,
           |   ________________________ |          |                 | B  m  m  m  m  m  B  |      10.0 mm)
           |  |  COC LIGHT GUIDE  --->  |\ <-- 45° |                 | B  m  m  m  m  m  B  S |   B = Bi-Bass rows
           |  |________________________ | \  TIR   |                 | B  m  m  m  m  m  B  S |     (±18° splay)
           |____________________________|__\_______|                  \  S        neck     S /    O = optical window
                                            |                          \___________________/        Ø 2.2 mm
                         window Ø 2.2 mm -> O  (no tufts within Ø 3.0 mm keep-out)

   OPTICAL PATH (schematic)

   [handle LED 405 nm]==>(dichroic)==>| 0.3 mm gap |==> COC guide ==> 45° TIR facet ==> WINDOW ==> tooth surface
                            ^                                                                         |
   [PD-red 620-690 nm] <----+---- (filters, OD4 @405) <==== COC guide <==== return fluorescence <=====+
   [PD-green 500-540 nm] <--+

   Plaque (porphyrins) -> RED     Clean enamel -> GREEN     Index = R/G vs personal baseline
```

### 6c. Exploded view

```
                          ____
                         /____\        [A] HEAD ASSEMBLY (consumable)
                         |::::|            A1  PA6.12 main bristles (AFT)
                         |:O:|             A2  PBT spear tufts (x6)
                         |::::|            A3  Bi-Bass splayed rows (x4)
                          \__/             A4  PP head body (overmold)
                           ||              A5  COC light guide insert, 45° TIR facet
                           ||              A6  Head ID resistor / NFC tag
                           ||              A7  Keying rib (rotational alignment ±1.5°)
                          _||_             A8  Drive-shaft socket (stainless clip)
                           ..
                           ..
                         ======        [B] TIP WINDOW + SEAL
                                           B1  PMMA AR-coated window
                                           B2  Silicone O-ring (front seal)
                           ..
                     _____________     [C] OPTICS MODULE
                    | LED  DICH  PD |      C1  405 nm LED on flex
                    |_____PD________|      C2  Dichroic beamsplitter
                                           C3  2x Si photodiode + bandpass filters
                           ..              C4  TIA/lock-in front-end board
                     _____________
                    |  ~~~~||~~~~  |   [D] LINEAR RESONANT ACTUATOR (265 Hz)
                    |  NdFeB  coil |       D1  Drive shaft (stainless)
                    |_____________|        D2  Torsion spring bar
                           ..              D3  NdFeB magnet + Cu coil
                                           D4  Hall sensor (force + resonance)
                     _____________
                    |[MCU][IMU]   |    [E] MAIN PCB (4-layer)
                    |[BMS]  [LEDs]|        E1  BLE SoC MCU
                    |_____________|        E2  6-axis IMU
                           ..              E3  6-dot mouth-map LEDs + RGB status ring
                                           E4  Button + BMS
                     _____________
                    |  Li-ion     |    [F] BATTERY (800 mAh, tool-replaceable)
                    |  14500      |        F1  Cell + nickel tabs
                    |_____________|        F2  Battery door, 2x Torx screws + gasket
                           ..
                     _____________     [G] INNER CHASSIS (PA66-GF30)
                    |_____________|
                           ..
                     _____________     [H] HANDLE SHELL (PC/ABS + TPE 2K overmold)
                    |   light pipes |      H1  Light pipes for mouth map / ring
                    |   button cap  |      H2  Ultrasonic-weld seam
                    |_____________|
                           ..
                     _____________     [I] BASE CAP + Qi RECEIVER COIL
                    |___(coil)____|
                           ..
                     _____________     [J] CHARGING STAND (5 W inductive, USB-C in)
                    |_____________|
```

---

## SECTION 7: PRODUCT NAME & BRAND

### 7.1 Final name: **UNTIL**

Justification:
- **Meaning:** the product's mechanism *is* the name — you brush *until* it's clean. Every competitor sells minutes; UNTIL sells an end-state. **[Design rationale]**
- **Phonetics:** two syllables, stress on the second (un-TIL), no hard-to-pronounce clusters; works in English, Norwegian, German, Spanish, Japanese katakana (アンティル). **[PROBABILITY]**
- **Memorability:** a common function word made into a brand is distinctive precisely because it is unexpected in the category (cf. "Apple" for computers). **[PROBABILITY]**
- **IP:** arbitrary (not descriptive) for toothbrushes in Nice **Class 21** (toothbrushes) and **Class 10/9** (sensing devices) → registrable in principle; full clearance search (USPTO, EUIPO, WIPO Madrid) required before spend. Fallback marks: **TILL**, **UNTIL CLEAN**. **[SPECULATION — clearance not yet run]**
- Product naming: UNTIL **S1** (launch), UNTIL **Ortho**, UNTIL **Kids**, UNTIL **Clinic**.

### 7.2 Brand positioning statement
**For people who are done guessing, UNTIL is the only toothbrush that measures plaque while you brush and stops only when your mouth is actually clean.**

### 7.3 Tagline
**Done when it's clean.**

---

## SECTION 8: ADVERTISING & LAUNCH COPY

### 8.1 Hero ad concept — "The Light"
- **Visual:** Black frame. Extreme macro of a mouth lit only by violet 405 nm light. The teeth glow green; along the gumline and between molars, rust-red patches burn like embers. The UNTIL head enters frame. As it sweeps, the red goes out zone by zone. Final shot: all-green teeth, the handle's six amber dots dark, one haptic pulse visualized as a ripple. Super: *"Done when it's clean."*
- **Message:** your current brush has never once known whether you're clean. This one does.
- **Media:** 6 s and 15 s vertical video (TikTok, Reels, YouTube Shorts) built on the visible-plaque reveal; out-of-home in transit hubs with UV-reactive ink panels; dental-clinic waiting-room screens; dentist-seeding program (5,000 clinics) with a demo unit + disclosing tablets. **[SPECULATION — media mix]**
- **Claim discipline:** every efficacy line in market is tied to the RCT result; the "light" is shown as real device output, never CGI-enhanced. **[Brand rule]**

### 8.2 Headline variants (print / digital)
1. **"Your timer has been lying to you for two minutes a day."**
2. **"The first toothbrush that knows when you're done."**
3. **"More than half your plaque survives brushing. Not anymore."**

### 8.3 30-second video script

| Time | Visual | Audio / VO |
|---|---|---|
| 0:00–0:03 | Bathroom, morning. Man brushes on autopilot, scrolling phone. Brush buzzes: 2-minute timer done. | SFX: buzz. VO: "Two minutes. Done… right?" |
| 0:03–0:07 | Hard cut: same mouth under violet light. Red plaque glowing along gums and between back teeth. | SFX: low drone. VO: "Most brushing leaves more than half the plaque behind." |
| 0:07–0:10 | Title card, white on black: *Brushing has always been blind.* | Silence. |
| 0:10–0:18 | UNTIL in hand. Macro: violet window under bristles. Red patches fade in sequence; handle's amber dots go dark one by one. Haptic double-pulse ripple. | VO: "UNTIL sees plaque while you brush. Zone by zone. It tells you where you missed — on the handle, no phone." |
| 0:18–0:23 | Split screen: lower back molars — old brush (red remains) vs UNTIL (green). | VO: "And it doesn't stop at two minutes. It stops when you're clean." |
| 0:23–0:27 | All six dots dark. Final "done" pulse. He puts it down, smiles with no-bleed gums. | SFX: single clean tone. |
| 0:27–0:30 | Product hero, logo, tagline. | VO: "UNTIL. Done when it's clean." |

### 8.4 E-commerce product description (≤150 words)

**UNTIL S1 — The toothbrush that stops when you're clean.**

Two-minute timers measure time. UNTIL measures plaque.

A violet sensor in the brush head detects plaque as you brush, while motion tracking maps all 16 zones of your mouth. Six lights on the handle show exactly where you've missed — no app, no phone at the sink. When every zone reads clean, UNTIL tells you you're done.

- **Real-time plaque sensing** in every zone
- **Bi-Bass head:** angled rows reach the gumline however you hold it; extended tufts reach between teeth
- **265 Hz sonic power**, three intensity modes
- **Pressure guard** protects gums and enamel
- **3-week battery**, wireless charging stand

Ideal for bleeding gums, braces, implants and anyone tired of guessing.

Includes handle, 2 heads, charging stand, travel case. 2-year warranty. 60-day clean-or-return guarantee.

*(146 words)*

---

## SECTION 9: DEMO-READY SUMMARY

### UNTIL — One-Page Pitch
*Presented to: dental industry investors / major retail buyers*

**THE PROBLEM**
Brushing is blind. A typical session removes **less than half** of dental plaque **[FACT — ≈42% single-session manual, mid-40s% powered]**. Twenty years of motor engineering bought only **11–21%** more plaque reduction over manual brushes **[FACT — Cochrane 2014]**. Meanwhile **42%** of US adults over 30 have periodontitis **[FACT]** and **3.5 billion** people live with oral disease **[FACT — WHO 2022]**. Today's "smart" brushes track *where* the brush is — never *whether the tooth is clean*.

**THE SOLUTION**
**UNTIL** is a sonic toothbrush with a 405 nm fluorescence plaque sensor built into the replaceable head, fused with 16-zone motion tracking. It shows uncleaned zones on the handle and ends the session only when every zone reads clean. A Bi-Bass head with ±18° splayed rows reaches the gumline regardless of grip; extended tapered tufts enter embrasures.
**Target: +15–25% relative plaque removal vs market leaders in real-world use [PROBABILITY]**, to be proven in a 120-subject RCT.

**WHY NOW**
- 405 nm LEDs, low-noise photodiodes and BLE MCUs now fit the BOM of a USD 199 brush. **[PROBABILITY]**
- Fluorescence plaque science (QLF) is validated in dental research and is clinically intuitive. **[FACT]**
- Incumbents are locked into position-tracking roadmaps and app ecosystems with fading engagement. **[PROBABILITY]**
- Dentists, insurers and orthodontists increasingly want *measurable* home care. **[SPECULATION]**

**WHY THIS PRODUCT WINS**
- **Outcome, not motion:** the only closed loop between sensing and session control. **[PROBABILITY — subject to FTO]**
- **Locked consumable:** the optical guide lives in the head → proprietary heads at ~USD 9.67 with ~USD 1.30 COGS. **[SPECULATION]**
- **Demonstrable on camera in six seconds:** the red-to-green reveal is the ad. **[PROBABILITY]**
- **Regulatory light:** US Class I exempt / EU consumer CE at hygiene claims. **[PROBABILITY]**

**ECONOMICS (target)**
- Retail USD 199 kit; heads USD 29/3-pack. Handle COGS ~USD 32–38 incl. accessories; heads ~USD 1.10–1.50. **[SPECULATION]**
- Head LTV ≈ USD 90–115/user/year. Breakeven on tooling (~USD 1.2 M) at ~45k kits. **[SPECULATION]**
- Year-3 target: 400k active users, ~USD 85 M revenue, 25% via clinics. **[SPECULATION]**

**ROADMAP**
| Phase | Months | Milestone |
|---|---|---|
| EVT | 0–6 | Optical bench validation (AUC ≥ 0.85), 50 functional prototypes, FTO opinion |
| DVT | 6–12 | Single-use crossover study (n=40), industrial design freeze, tooling kickoff |
| PVT + RCT | 12–20 | 4-week RCT (n=120) vs leading sonic, CE/FCC/IEC certification, 5k pilot units |
| Launch | 20–24 | DTC + 2 retail partners (Nordics + UK), 1,000 seeded clinics |
| Scale | 24–36 | US launch, Ortho SKU, ADA Seal submission |

**THE ASK**
- **Investors:** **USD 6.5 M seed/Series A** — 40% clinical program + optics R&D, 25% tooling/manufacturing, 20% IP/regulatory, 15% launch. Exit paths: strategic acquisition by an oral-care major seeking a sensing platform, or category leadership. **[SPECULATION]**
- **Retail buyers:** a **2-SKU premium launch slot** (S1 kit + head 3-pack) with in-store violet-light demo units, 12-month exclusivity in your region, against a co-funded clinic-referral program.

**THE ONE LINE**
Every toothbrush on the shelf stops when the clock says so. **UNTIL stops when you're clean.**

</product_package>

---

### Appendix — Key risks register (no hiding)
| Risk | Severity | Mitigation | Label |
|---|---|---|---|
| Foam/toothpaste fluorescence corrupts R/G signal | High | Confidence flag + dwell fallback; validate with top-10 pastes; publish compatible-paste list | [PROBABILITY] |
| Fresh plaque under-detected → false "clean" | Medium | Minimum dwell per zone; claims framed on measured clinical result, not sensor | [PROBABILITY] |
| Patent collision (Plaqless, Philips, P&G estates) | High | FTO opinion in EVT; design-around on optical path; licensing budget | [PROBABILITY] |
| Head light-guide cost overrun | Medium | Single-cavity → 16-cavity tooling; PMMA fallback | [PROBABILITY] |
| Incumbent fast-follow | High | Clinical data + clinic channel + 24-month IP head start | [PROBABILITY] |
| Users perceive longer sessions as burden | Medium | Session typically 120–170 s; "done" moment is the reward; 240 s hard cap | [SPECULATION] |
