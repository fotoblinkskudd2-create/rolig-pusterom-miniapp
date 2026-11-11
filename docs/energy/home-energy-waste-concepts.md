# Localized Heat, Recovered Heat, Borrowed Light
### Buildable product concepts against household energy waste — Norway / EU, 2026

*Status: research brief, November 2026. Figures are ranges, not promises. Every concept states its confidence level.*

---

## 1. The situation

**The crisis has become a permanent condition.** EU household electricity averaged about **€0.28/kWh in H1 2026**. That is down 2.2% year on year but still well above pre-2022 levels ([Brussels Times / Eurostat](https://www.brusselstimes.com/2384846/eu-electricity-prices-ease-in-2026-but-remain-elevated-after-energy-crisis)). The Iran-war gas shock pushed residential gas prices in EU capitals up 6.8% between February and April 2026, and 28.8% in Brussels ([Euronews](https://www.euronews.com/business/2026/05/14/europes-household-energy-prices-surge-after-iran-war-which-capitals-were-hit-hardest)). The IEA says affordability "remains under strain" for vulnerable households ([IEA](https://www.iea.org/reports/household-energy-affordability/executive-summary)). The EU energy commissioner warned of "a painful winter" without an actual supply shortage ([Euronews](https://euronews.com/2026/09/29/no-energy-shortage-but-a-painful-winter-looms-for-europe-top-eu-energy-leader-warns)).

**Norway is a special case.** A household uses on average **~14,700 kWh/yr**, including home EV charging but not cabins ([SSB](https://www.ssb.no/energi-og-industri/energi/artikler/hva-er-gjennomsnittlig-stromforbruk-i-husholdningene)). An estimated **~64% of that is space heating**, mostly direct electric ([CICERO FLEXEFFECT, based on SSB](https://xp.cicero.oslo.no/no/api/_/attachment/download/e7d05a6f-fba9-43e3-b357-b8d6676a181b:846f573308572f90215181bc4f7e3870eed0741f/FLEXEFFECT%20prosjektrapport_Ny%20nettleiemodell%20for%20norske%20husholdninger.pdf); medium confidence). Two policy facts shape what a product can sell on:

- **Norgespris** is a fixed **40 øre/kWh excl. VAT** (50 øre incl.), opt-in, from 1 Oct 2025 to 31 Dec 2026. There is a monthly cap on how much power gets this price. A rise to 45 øre has been proposed for 2027 ([Regjeringen](https://www.regjeringen.no/no/aktuelt/norgespris-skal-sikre-forutsigbare-og-stabile-strompriser-for-folk/id3090849/), [Huseierne](https://www.huseierne.no/alt-om-bolig/strom-og-energi/22-ting-du-ma-vite-om-norgespris/)). **This weakens the per-kWh price signal.** Saving a kWh is worth roughly **0.9–1.5 NOK all-in** once grid tariff and taxes are added. That is the working assumption below.
- **The capacity tariff** (*kapasitetsledd*, in force since 1 July 2022) bills the grid fee by the **average of the three highest hourly peaks on separate days each month** ([NVE/RME](https://publikasjoner.nve.no/rme_eksternrapport/2025/rme_eksternrapport2025_08.pdf), [SINTEF](https://blogg.sintef.no/energi/effektariff-redusere-belastningen-stromnettet)). So **kW is now a sellable product benefit**, not just kWh.

Norway has a national target of **10 TWh lower electricity use in buildings by 2030** ([NVE note](https://www.nve.no/media/16914/endelig-versjon-10-twh-redusert-stroembruk-i-bygningsmassen-til-2030_notat-19feb24.pdf)). Grid capacity, not just price, is the bottleneck.

### The design rule behind every concept below

> **In a Nordic heating season, electricity that ends up as heat inside the envelope is not wasted. It replaces heater output.**

A standby TV, an LED bulb or a hot oven in January effectively *is* a panel heater, at least in a home with resistive heating. The real waste streams are therefore:

1. **Heat delivered to the wrong place or time**: empty rooms, always-on bathroom floors, a whole house heated for one seated person.
2. **Heat that leaves the envelope**: shower water down the drain, air leaks, windows at night.
3. **Low-quality heat where high-quality heat is available**: panel heaters (COP 1) running next to an air-to-air heat pump (COP ~2.5–4) that only serves the living room.
4. **Peaks**, which cost money and grid capacity even when the kWh total is unchanged.

Lighting and standby savings in Norway are **mostly summer savings**. This is the core reason lighting concepts rank low below. Elsewhere in Europe, with gas heating or air conditioning, the ranking shifts somewhat.

### Regulatory and incentive context (applies to all concepts)

| Instrument | What it means for a maker |
|---|---|
| **EU EPBD recast, Dir. (EU) 2024/1275** | Transposition was due 29 May 2026. All 27 member states received formal notice for incomplete transposition in July 2026. It introduces voluntary renovation passports and a fossil-boiler phase-out by 2040 ([Commission](https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-buildings/energy-performance-buildings-directive_en), [ESG Today](https://www.esgtoday.com/?p=24765)). This creates a renovation wave and demand for retrofit add-ons. Norway's EEA incorporation of the recast is not confirmed here. |
| **EU Energy Efficiency Directive (EU) 2023/1791** | Binding national savings obligations, which in practice means more utility and municipal efficiency programmes able to buy simple retrofit products. |
| **Ecodesign standby, Reg. (EU) 2023/826** | Applies from 9 May 2025: off mode ≤0.50 W, networked standby ≤2 W (≤8 W for high-availability network devices). From 9 May 2027: off mode ≤0.30 W, HiNA ≤7 W ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/826/oj/eng), [Nemko](https://www.nemko.com/blog/changing-eu-requirements-for-standby-mode)). This covers **new** products only. The legacy stock is the opportunity, and your own device must comply. |
| **Ecodesign water heaters, Reg. (EU) 814/2013** | Caps tank standing loss (watts) by volume ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2013/814/2017-01-09/eng)). |
| **ESPR, Reg. (EU) 2024/1781** | Coming product-passport and repairability rules. Design for disassembly from day one. |
| **Enova (NO)** | No support for ordinary air-to-air heat pumps. Air-to-water: 25%, max NOK 20,000. Ground-source: max NOK 40,000. Accumulator tank: NOK 5,000. You must **apply before ordering** ([Enova](https://enova.no/nb/privat/bolig/stotte/akkumulatortank/vilkar-for-stotte-akkumulatortank), [Bytt summary](https://www.bytt.no/varmepumpe/tilbyder/a-avwm/enova-stotte-til-varmepumpe-og-solceller-i-2026-slik-sikrer-du-deg-opptil-40-000-kroner); verify on enova.no). Small add-on products are **not** subsidised, so the payback must stand on its own. |
| **Norwegian electrical rules** | Work on fixed installations requires a registered electrical contractor (*elektroforetak*). **Plug-in products avoid this barrier.** Hard-wired ones need an installer channel. |
| **CE marking** | LVD 2014/35/EU, EMC 2014/30/EU, RED 2014/53/EU (anything with radio), RoHS. Budget NOK 30–150k for test-lab pre-compliance per product family. |

---

## 2. Comparison table

Impact is **kWh per household per year** unless noted. The baseline is a typical Norwegian electrically heated detached house or large flat.

| # | Concept | Waste stream | Complexity | Impact (range) | Feasibility | Confidence |
|---|---|---|---|---|---|---|
| 1 | **Romvakt**: presence-aware setback plug for panel heaters | Heat in empty rooms | Low | 200–800 per room retrofitted (10–25% of that room) | **High** | Medium |
| 2 | **Varmeøy**: personal radiant comfort station | Whole-room heating for one seated person | Low–Med | 300–1,200 (room setpoint −2 to −3 °C) | **High** | Medium |
| 3 | **Varmeflyt**: smart heat-pump heat distributor | COP-1 heaters next to a COP-3 heat pump | Low | 400–900 | **High** | Medium |
| 4 | **Gulvvakt**: bathroom floor-heating controller | 24/7 bathroom floor heat | Low (installer needed) | 300–1,000 per bathroom | Medium–High | Medium–Low (forum data) |
| 5 | **Nattskodde**: magnetic insulating window panels | Night-time window heat loss | Low | 300–1,500 (5–20% of heating in treated rooms) | **High** | Medium–High (PNNL) |
| 6 | **Trekkjeger**: leak-hunting kit and sealing service | Air infiltration | Low | 500–1,500 (highly variable) | High | Medium–Low |
| 7 | **DrainLoop**: shower drain-water heat recovery | Hot water down the drain | Med–High | 400–900 | Medium–Low | High (physics) / Medium (NO install) |
| 8 | **Effektvakt**: open HAN peak guard and tank manager | Peaks (kW), tank standing loss | Medium | **NOK 1,000–3,000/yr** grid fee; ~50–250 kWh tank loss | High | Medium |
| 9 | **Nullwatt**: idle-load hunter | Always-on loads | Low | 150–600 gross; ~40–60% of that net in heated homes | High | Medium |
| 10 | **Restvarme**: retained-heat cooking box | Cooking heat to air and exhaust | Low | 30–150 | High | Medium |
| 11 | **Lysfelle**: daylight sill and reflective reveal kit | Daytime artificial light | Low | 30–150, mostly summer | High | High (that it's small) |

---

## 3. Concepts

### 1. Romvakt: *"Your panel heater finally knows if anyone's home."*

- **Waste problem.** Norwegian homes run plug-in panel heaters (*panelovner*) in bedrooms, offices and guest rooms at a fixed 20–22 °C around the clock. The Wi-Fi heaters from Mill and Adax and Nordic thermostat plugs offer **schedules**, which people set once and abandon. None reliably drops a room to 15–16 °C when it is empty and pre-heats it when someone is about to use it.
- **Mechanics.**
  - **Hardware.** A 16 A smart plug relay (Schuko), an mmWave presence sensor (e.g. LD2410/LD2450, which detects a still, seated person, unlike PIR) and a temperature/RH sensor on a 1.5 m lead, so it does not read the heater's own heat. Controlled by an ESP32. Housing is a 3D-printed or injection-moulded plug-through body.
  - **Logic.** "Away" setpoint 16 °C, "present" 20 °C. It learns typical arrival times per weekday and pre-heats about 30 minutes ahead. A falling-temperature slope detects open windows. Works offline, with optional Home Assistant/Matter.
  - **Cost tier.** BOM NOK 350–500, retail NOK 900–1,300. **Low.**
- **Evidence base.** Heating-setpoint reduction saves roughly **7–14% per °C** in simulation ([Hoyt et al., CBE Berkeley](https://escholarship.org/content/qt13s1q2xc/qt13s1q2xc.pdf)). A room held at 16 °C instead of 21 °C for ~60% of hours yields 10–25% of that room's heating, net of pre-heat. Space heating is ~64% of household use ([CICERO](https://xp.cicero.oslo.no/no/api/_/attachment/download/e7d05a6f-fba9-43e3-b357-b8d6676a181b:846f573308572f90215181bc4f7e3870eed0741f/FLEXEFFECT%20prosjektrapport_Ny%20nettleiemodell%20for%20norske%20husholdninger.pdf)). Being plug-in, it needs no electrician. It also cuts capacity-tariff peaks if pre-heats are staggered.
- **Feasibility: high.** **Risks:**
  - A 16 A continuous relay needs real thermal design and certification. Plug-in heaters max out at ~2 kW, but cheap relays fail. This is the main safety risk.
  - Heat lost from an unheated room into adjacent heated rooms reduces savings. Thermal mass slows recovery.
  - mmWave sensors raise privacy concerns. Keep processing on the device and say so loudly.
- **Differentiation.** Existing plugs are timer- or app-driven. Romvakt is **occupancy-driven and learns the pre-heat**, with no app required. It is a retrofit for the millions of panel heaters already on Norwegian walls.

### 2. Varmeøy: *"Heat the person, not the room."*

- **Waste problem.** A home-office worker or evening sofa-sitter keeps a 25–40 m² room at 21–22 °C to warm one body. Patio-style IR heaters are crude, glaring and usually 1–2 kW. Heated blankets are not designed for desks.
- **Mechanics.**
  - **Hardware.** Three low-power radiant surfaces:
    1. a **heated footrest** (carbon-film heater, 40–60 W, plywood or cork top);
    2. an **under-desk radiant panel** aimed at the knees and shins (80–150 W, aluminium plate on carbon film, low surface temperature);
    3. optionally, a **desk-edge or sofa-arm panel** for the hands (20–40 W).
  - **Control.** An mmWave presence sensor (off within 2 minutes of leaving) and a single comfort dial. It can signal Romvakt or the room thermostat to drop the background setpoint to 18 °C.
  - **Cost tier.** BOM NOK 700–1,400, retail NOK 2,500–4,000. **Low–medium.**
- **Evidence base.** Berkeley's Center for the Built Environment (CBE) has run footwarmer and personal-comfort-system studies. In one, lowering the heating setpoint from 21.5 °C to 19 °C kept comfort equivalent and saved **>30% heating energy over winter** ([CBE Personal Comfort Systems](https://cbe.berkeley.edu/research/personal-comfort-system/)). Widening the setpoint band saves 5–15% per °C ([CBE](https://cbe.berkeley.edu/project/personal-comfort-system/)). Simulations show 32–73% HVAC savings with personal control ([Hoyt, Arens & Zhang 2015](https://escholarship.org/content/qt13s1q2xc/qt13s1q2xc.pdf)). The device uses ~100–250 W while occupied, against ~400–1,000 W of background heat avoided.
- **Feasibility: high.** **Risks:**
  - Savings materialise **only if the room setpoint is actually lowered**. Bundling or auto-linking with a thermostat is essential.
  - Surface-temperature limits (EN 60335-2-30 / -2-81) and burn risk for elderly users.
  - The comfort perception of cool air plus warm legs is personal. Offer a 30-day trial.
- **Differentiation.** Office heated footrests and IR panels exist separately. This is an **integrated, presence-gated, low-wattage station tied to a setback**, sold on "turn the house down 3 °C" rather than "a warm gadget".

### 3. Varmeflyt: *"Spread the heat pump's cheap heat to the rooms it can't reach."*

- **Waste problem.** Norway has some of Europe's highest heat-pump density ([TU](https://www.tu.no/artikler/slik-vil-svenske-produsenter-gjore-varmepumpene-mer-effektive/565856)). Most are **single-head air-to-air units in the living room**, while bedrooms, office and hallway run on panel heaters at COP 1. Doors are closed, so the cheap heat stays put. Generic "room-to-room fans" are noisy, always on, and blind to temperature.
- **Mechanics.**
  - **Hardware.** A **door-top or through-wall transfer unit**: a quiet 120–140 mm EC fan (3–10 W) in an acoustic-lined duct box (MDF or EPP foam) with a transfer grille.
  - **Control.** Two temperature sensors, one in the heat-pump room and one in the target room. The fan runs only when ΔT exceeds about 1.5 °C and the target room needs heat, which it can learn from Romvakt or a local setpoint. A night quiet mode keeps it under 25 dB(A). Optionally, it signals the heat pump (IR blaster) to raise its setpoint slightly while distributing.
  - **Cost tier.** BOM NOK 500–900, retail NOK 1,800–3,000. **Low.**
- **Evidence base.** Each kWh of panel heat replaced by heat-pump heat at a seasonal COP of ~3 saves ~0.67 kWh of electricity (first-principles). Displacing 30–50% of ~1,500–2,500 kWh of secondary-room panel heating yields **~400–900 kWh/yr**. Enova does not subsidise air-to-air heat pumps ([Bytt summary](https://www.bytt.no/varmepumpe/tilbyder/a-avwm/enova-stotte-til-varmepumpe-og-solceller-i-2026-slik-sikrer-du-deg-opptil-40-000-kroner)), so getting more out of units already installed is the cheap lever.
- **Feasibility: high.** **Risks:**
  - Fire-door and fire-cell rules (TEK17) forbid openings in some walls, especially between flats or to stairwells in multi-storey homes. Door-top units avoid this issue in most houses.
  - Noise complaints in bedrooms.
  - Heat-pump capacity limits on very cold days.
- **Differentiation.** Existing transfer fans are dumb. Varmeflyt is **ΔT- and demand-controlled, quiet, and sold specifically as a "heat-pump multiplier"**, with an honest kWh estimate in the box.

### 4. Gulvvakt: *"Warm bathroom floor when you're on it, not 8,760 hours a year."*

- **Waste problem.** Electric floor heating in Norwegian bathrooms (*varmekabler*) commonly runs **24/7, all year**. Forum measurements suggest **~2.7–4.8 kWh/day** per bathroom, roughly **1,000–1,750 kWh/yr** ([byggebolig.no](https://byggebolig.no/energiforbruk-enok/hvor-blir-det-av-elektronene-mine-og-hvor-mye-bor-varmekabler-dra-av-strom), [byggebolig.no](https://byggebolig.no/energiforbruk-enok/varmekabler-pa-bad-om-sommeren-hvor-mye-strom); **anecdotal, low–medium confidence**). Existing floor thermostats have schedules that people do not program, and they keep heating in summer.
- **Mechanics.**
  - **Hardware.** A replacement wall thermostat with a floor sensor (re-using the existing probe), a humidity sensor (to detect showers) and an mmWave presence sensor.
  - **Logic.**
    - Base floor temperature of 17–19 °C instead of 24–28 °C.
    - **Comfort burst** to 24 °C, learned from shower times (RH spikes) and triggered on presence.
    - Post-shower drying cycle based on RH, so moisture safety is preserved.
    - Summer mode: drying-only.
    - Capacity-tariff awareness: it defers the burst if the house is near its peak.
  - **Cost tier.** BOM NOK 300–500, retail NOK 1,200–1,800, plus installation (fixed wiring needs an **elektroforetak**). **Low** technically.
- **Evidence base.** The setback physics above applies, and the forum consumption data indicates the size of the baseline. **Caveat:** in winter, part of the floor heat warms the house, so the net saving is mainly in non-heating months plus overheating hours. Estimated **300–1,000 kWh/yr net per bathroom.**
- **Feasibility: medium–high.** **Risks:**
  - It requires an electrician, so it needs a partner channel (electrical wholesalers, installers, power companies).
  - Wet-room moisture: a floor that is too cold in a poorly ventilated bathroom risks mould. RH-driven drying is non-negotiable.
  - Heatit, Futurehome and Nobø thermostats already offer schedules.
- **Differentiation.** It is **behaviour-learning (RH and presence) rather than schedule-based**, has a summer drying-only mode, and is aware of the capacity tariff. A first pilot step is to measure real bathroom consumption across 30 homes and publish the result. No good public dataset exists, so the data itself is marketing.

### 5. Nattskodde: *"A magnetic insulating shutter you click on at dusk."*

- **Waste problem.** Windows are the weakest part of the envelope. Older double glazing has U ≈ 2.6–3.0 W/m²K, against ~0.1–0.2 for an insulated wall. In a Norwegian winter, nights last 15–18 hours. Curtains help little because air circulates behind them, and new windows cost NOK 10–25k each.
- **Mechanics.**
  - **Hardware.** Cut-to-fit panels: 20–30 mm of **PIR/XPS foam or honeycomb polycarbonate**, faced with a reflective low-e foil on the glass side and fabric, felt or printed paper on the room side. They are held by **magnetic tape** on the window frame, with a compressible EPDM edge seal that stops convective loops.
  - Panels stay up all day in unused rooms. In living spaces, they go up at dusk and come down at dawn.
  - **Kit or service.** Measure via a phone photo with a reference card, then CNC- or hand-cut. Fits a workshop and laser-cutter business model.
  - **Cost tier.** NOK 300–700 per window. **Low.**
- **Evidence base.** In PNNL Lab Homes experiments, cellular shades reduced HVAC energy by **14.4 ± 2.0%** against standard blinds ([PNNL-24857](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-24857Rev1.pdf)), with **~5–9% in later automated tests** ([PNNL-27663](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-27663Rev1.pdf)), and up to 20% against no shades ([DOE fact sheet](https://www.energy.gov/sites/default/files/2021-12/bto-cellular-shades-factsheet-112221.pdf)). A rigid, edge-sealed insulating panel should outperform a cellular shade at night. This is a physics inference, not measured here, so confidence is medium.
- **Feasibility: high.** **Risks:**
  - **Condensation and frost** between the panel and the glass, which can rot wooden frames. Mitigations: a warm-side vapour seal, a removal routine, and guidance against use on single glazing without testing.
  - The user has to remember to fit them each night.
  - Fire load of foam: use flame-retardant grades and test.
- **Differentiation.** WindowDressers (US, non-profit) and UK magnetic secondary glazing exist. Nordic products of this type are scarce. The angle is a **night-insulation and dark-season product**, sold through municipalities, housing co-ops (*borettslag*) and energy advisors.

### 6. Trekkjeger: *"Find every draught in an hour, seal it the same afternoon."*

- **Waste problem.** Older Norwegian houses leak through sill plates, attic hatches, plumbing penetrations, sockets on exterior walls, and the chimney or open fireplace (*peis*) dampers. Owners cannot see the leaks. Professional blower-door tests plus thermography cost NOK 5–15k, which is too much for a "maybe".
- **Mechanics.**
  - **Rental kit:** a phone thermal camera (e.g. 160×120 class), a cheap **door-frame depressurisation fan** (fabric panel plus a 150–250 mm fan, enough to amplify leaks, not a calibrated test), a smoke pencil, and a guided app checklist.
  - **Consumables pack:** foam gaskets for sockets, attic-hatch seal kit, EPDM strips, a chimney balloon for unused fireplaces, acrylic sealant.
  - Rented for NOK 300–500 per weekend, with consumables sold at margin. **Low** complexity.
- **Evidence base.** Air sealing is consistently ranked among the most cost-effective retrofit measures by energy authorities, and reported savings vary widely by building age. The impact range here, **5–15% of heating**, is an estimate. **Confidence is medium–low**, and I did not verify a Norway-specific study in this pass. Some municipalities already lend out thermal cameras, which validates demand but also means competition.
- **Feasibility: high.** **Risks:**
  - **Over-sealing a house that has only natural ventilation** leads to moisture and indoor-air problems. The kit must include ventilation guidance and an RH logger.
  - Results depend on effort, so savings are hard to guarantee.
- **Differentiation.** It turns an expert service into a **DIY weekend kit plus consumables subscription**. It can also act as a lead generator for Nattskodde, Romvakt and Varmeflyt.

### 7. DrainLoop: *"Your shower pre-heats your shower."*

- **Waste problem.** Shower water leaves at ~30–37 °C, and essentially all that heat is lost. Hot water is the second-largest load after space heating. Commercial drain-water heat recovery (DWHR) units are vertical copper pipes that need ~1–1.5 m of vertical drain, which most Norwegian bathrooms, especially in flats and slab-on-grade houses, do not have.
- **Mechanics.**
  - **Option A (houses with a basement):** a vertical gravity-film exchanger, made of a copper drain pipe with a coiled double-wall cold-water jacket, installed in the basement drain stack. Pre-heated cold water feeds the shower mixer and/or the tank inlet (balanced flow).
  - **Option B (renovation):** a **horizontal, low-profile counter-flow plate exchanger** under the shower floor or integrated in a linear drain channel. It must be cleanable (hair and soap film) and **double-walled** to prevent contamination.
  - **Cost tier.** BOM NOK 1,500–4,000, installed NOK 8–15k. **Medium–high.**
- **Evidence base.**
  - A DOE-sponsored gravity-film study found **~50% water-heating savings for showers** with balanced flow ([DOE/GOVPUB](https://www.govinfo.gov/content/pkg/GOVPUB-E-PURL-LPS99193/pdf/GOVPUB-E-PURL-LPS99193.pdf)).
  - Typical installations save **20–35%** ([WSU Energy Program](https://e3tnw.org/ItemDetail.aspx-72.html?id=157)), and households of four reduce water heating by **15–40%** ([Natural Resources Canada](https://natural-resources.canada.ca/energy-efficiency/drain-water-heat-recovery)).
  - Plumbing configuration strongly affects results ([U. Waterloo thesis](https://uwspace.uwaterloo.ca/items/45b42ce8-8989-4443-89e1-35c984229cef/full)).
- **Feasibility: medium–low for a small maker.** **Risks:**
  - Norwegian wet-room rules: membrane integrity and documentation under TEK17 and the industry wet-room standard (*våtromsnorm*) make retrofit risky. Installation needs a certified plumber.
  - Fouling, cleanability and potable-water approval (double-wall).
  - Payback of 8–15 years at Norgespris-level prices.
- **Differentiation.** Horizontal units exist (Zypho, Joulia, Showersave), but few are approved and marketed in Norway. The realistic play is **design for the Norwegian bathroom-renovation market**, partnered with a plumbing or wet-room firm. This is not a garage product. Ranked high on impact, low on founder-friendliness.

### 8. Effektvakt: *"An open, subscription-free peak guard that reads your own meter."*

- **Waste problem.** The capacity tariff charges for your three worst hours per month. Water heater, floor heating, EV and oven overlap at 17:00–19:00. The HAN port on Norwegian smart meters (*AMS*) provides real-time data, but Forbrukerrådet found that **real-time readers are tied to supplier subscriptions** ([Forbrukerrådet 2024](https://storage02.forbrukerradet.no/media/2024/02/rapport-sanntidsmalere-060224.pdf)). The tank also loses heat 24/7. EU ecodesign caps a 200 L tank's standing loss at roughly **~86 W**, using the 814/2013 formula S ≤ 16.66 + 8.33·V^0.4 ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2013/814/2017-01-09/eng); formula from memory, verify). Old tanks are often worse.
- **Mechanics.**
  - **Meter reader.** A HAN reader (M-Bus/RJ45 to an ESP32; open-source designs exist) that **works offline and locally**.
  - **Load control.** Up to 3 contactor channels for the tank, floor heating and EV. Priority logic sheds the tank first, the floor second, and limits the EV third whenever a rolling hour-average approaches the user's chosen kW step.
  - **Tank management.** It runs a **weekly 70 °C legionella cycle** and never sets the tank below the safe temperature. FHI and Helsedirektoratet advise ≥70 °C in the tank or regular shock heating ([Helsedirektoratet](https://www.helsedirektoratet.no/veiledere/legionella/bakgrunn-metode-og-prosess), [IFI quoting FHI](https://www.ifi.no/artikkel/577390/last-ned)).
  - **Add-on.** A fitted **tank insulation jacket** for tanks in unheated basements or garages.
  - **Cost tier.** BOM NOK 600–1,200 plus contactors, retail NOK 2,500–4,000. **Medium.** Contactors need an electrician.
- **Evidence base.** The capacity-tariff mechanics are confirmed by RME ([NVE/RME](https://publikasjoner.nve.no/rme_eksternrapport/2025/rme_eksternrapport2025_08.pdf)). Each tariff step is typically worth ~NOK 100–250/month depending on the grid company ([Bytt](https://www.bytt.no/strom/strompriser/a-mpdv/slik-knekker-du-koden-pa-nettleien-og-unngar-stromregningens-felle); verify against the local price list). **It saves money and grid capacity, not much energy.** The jacket saves 20–40% of standing loss only where the tank sits outside the heated envelope.
- **Feasibility: high.** **Risks:**
  - HAN port activation is required, and the grid company must open it.
  - Crowded market: Tibber Pulse, Futurehome, Ngenic, Høiax Connected.
  - Norgespris reduces the value of price arbitrage. The capacity tariff remains.
- **Differentiation.** It is **local, open, subscription-free and supplier-agnostic**, which answers the lock-in Forbrukerrådet criticised, and it is legionella-safe by design. Sell through installers, not app stores.

### 9. Nullwatt: *"Find the 100 W your house burns while you sleep."*

- **Waste problem.** In NRDC's study of 70,000 Northern California homes, **always-on idle load averaged ~23% of household electricity** ([NRDC](https://www.nrdc.org/experts/pierre-delforge/always-devices-may-cost-americans-19-billion-annually-when-were-not-actively)). That share is lower in heating-dominated Norway, but absolute idle loads of 50–150 W, about **440–1,300 kWh/yr**, are plausible. The 2023/826 limits apply only to new products.
- **Mechanics.**
  - **Detection.** It uses Effektvakt's HAN data, or a standalone clamp, to measure the night baseline. A guided "breaker walk" in an app attributes the load: flip a circuit, see the drop.
  - **Hardware.** **Master/slave power strips** (the TV cuts its peripherals) and **schedule plugs** for routers, consoles, printers and the second fridge in the garage.
  - **Cost tier.** Low.
- **Evidence base.** NRDC as above. **Critical caveat:** in a resistive-heated Norwegian home, standby heat replaces heater output for ~7 months a year, so **net savings ≈ 40–60% of gross**. With a heat pump, the offset is smaller, so net savings are larger.
- **Feasibility: high.** **Risks:**
  - The savings are modest and need behaviour change.
  - Generic smart plugs are a commodity.
- **Differentiation.** It is a **diagnosis-first product, measuring the baseline from the meter**, with honest heat-offset maths. It works best as a software feature bundled into Effektvakt, not a separate SKU.

### 10. Restvarme: *"Bring it to a boil, then let the box finish dinner."*

- **Waste problem.** Simmering rice, stews, porridge and beans for 20–90 minutes holds a hob at 300–1,000 W mostly to replace heat lost from the pot. Old Norwegian households used a hay box (*høykasse*) for this. In summer, kitchen heat is pure waste and the hood exhausts it.
- **Mechanics.** A **nesting insulated box**: an EPP or cork shell with a wool or felt liner, sized for 2–5 L pots, and a reflective lid insert. It is optionally paired with an insulated lid for the pot itself. **Low** complexity. Retail NOK 400–900.
- **Evidence base.** Retained-heat cookers are documented to cut cooking-fuel use substantially in development programmes, but I did not verify recent EU/NO studies, so **confidence is medium**. Cooking is a small share of Norwegian electricity, so the absolute impact is **30–150 kWh/yr**.
- **Feasibility: high.** **Risks:**
  - Food safety: food must stay above 60 °C or be eaten promptly. Print guidance on the box.
  - Niche, lifestyle adoption.
- **Differentiation.** It is a design and lifestyle object, with a Nordic heritage story, rather than an aid product. Low kWh, but cheap and good for brand-building. **Not a lead product.**

### 11. Lysfelle: *"Bounce the daylight you already have deeper into the room."*

- **Waste problem.** Deep Nordic rooms with small windows switch lights on at midday. However, LED lighting is already efficient, and in winter it is heat that offsets heating anyway.
- **Mechanics.**
  - **Hardware.** A **high-reflectance window sill and reveal liner** (white or semi-specular aluminium composite or film, ~85–95% reflectance) and a **small interior light shelf** above eye level that throws daylight onto the ceiling.
  - Optional **daylight-linked task lamp**: lux sensor plus presence, dimming to the minimum needed.
  - **Low** complexity, NOK 300–1,500.
- **Evidence base.** For a typical Norwegian LED household, lighting is a few hundred kWh/yr. Daylighting can trim 10–30% of daytime lighting, which gives **~30–150 kWh/yr**, mostly in spring and summer when daylight is abundant and the heating offset is gone. Confidence that the impact is **small** is high. Elsewhere in Europe, in office or south-European settings, the case is stronger.
- **Feasibility: high.** **Risks:** glare, aesthetics, low willingness to pay for kWh this small.
- **Differentiation.** Its value is in **well-being and seasonal light quality, not kWh**. It belongs in a wellbeing or interior-design portfolio, not an energy pitch. Included here because the brief asked, and flagged honestly.

---

## 4. Prioritized shortlist

Scoring weights: energy or NOK impact (35%), consumer cost and payback (25%), founder buildability without a factory or installer (25%), scalability (15%).

| Rank | Concept | Why |
|---|---|---|
| **1** | **Romvakt + Varmeøy (bundle)** | They attack the biggest stream: space heating at ~64% of use, delivered to empty rooms or to a whole room for one person. They are **plug-in, so no electrician is needed**, and they can be built with ESP32, mmWave and carbon film. Payback is under 2 years at 1.0–1.5 NOK/kWh. Sold together, Varmeøy makes the occupied room comfortable at 18 °C and Romvakt makes the empty ones cheap. This is the most defensible founder product. |
| **2** | **Varmeflyt** | It uses the heat-pump stock Norway already has. Each kWh moved saves ~0.67 kWh. It is cheap, quiet and buildable in a workshop. The pitch, "get 30% more out of your heat pump without Enova paperwork", is easy to sell. |
| **3** | **Nattskodde** | It has the strongest third-party evidence (PNNL), is a low-tech workshop product, and suits municipal and housing co-op procurement and EPBD-driven renovation programmes. Condensation is the risk that has to be engineered out first. |
| **4** | **Gulvvakt** | It addresses a specifically Norwegian and very visible waste, the always-hot bathroom floor. The installer requirement means it needs a channel partner (power company or electrical wholesaler). Run a 30-home measurement pilot first: the data alone is worth publishing. |
| **5** | **Effektvakt (with Nullwatt as software)** | It saves NOK and grid capacity rather than kWh. It is a crowded market, but the **open, local, subscription-free** position addresses a documented consumer complaint. Best as the "hub" that ties 1–4 together later, not as the opening product. |

**Not shortlisted, with reasons:**
- **DrainLoop** has high physics confidence but is a poor fit for Norwegian wet rooms and a small maker. Partner with plumbing or wet-room firms instead.
- **Trekkjeger** is a great lead generator, but its savings are hard to guarantee.
- **Restvarme and Lysfelle** have low kWh impact. They are brand and wellbeing plays.

### Next steps (founder-sized)

1. **Weeks 1–4.** Build 10 Romvakt and 5 Varmeøy prototypes. Log room temperature, presence and plug kWh in 5 homes against a baseline week.
2. **Weeks 4–8.** Varmeflyt door-top prototype. Measure the ΔT reduction and panel-heater runtime avoided.
3. **In parallel.** Nattskodde condensation test on 3 window types through one cold spell.
4. **Before sale.** CE pre-compliance (LVD/EMC/RED), 16 A relay thermal test, and a privacy statement for mmWave.
5. **Publish the measured numbers.** In this category, credible data is the differentiator.

---

### Confidence key

- **High**: peer-reviewed or regulator data that matches the use case.
- **Medium**: credible data from an adjacent context (US lab homes, simulations), transferred by physics.
- **Low**: anecdotal or forum data, or founder estimates. Flagged inline.

### Sources

- [SSB: average household electricity use](https://www.ssb.no/energi-og-industri/energi/artikler/hva-er-gjennomsnittlig-stromforbruk-i-husholdningene)
- [CICERO FLEXEFFECT report (heating share)](https://xp.cicero.oslo.no/no/api/_/attachment/download/e7d05a6f-fba9-43e3-b357-b8d6676a181b:846f573308572f90215181bc4f7e3870eed0741f/FLEXEFFECT%20prosjektrapport_Ny%20nettleiemodell%20for%20norske%20husholdninger.pdf)
- [NVE: 10 TWh reduced electricity use in buildings by 2030](https://www.nve.no/media/16914/endelig-versjon-10-twh-redusert-stroembruk-i-bygningsmassen-til-2030_notat-19feb24.pdf)
- [Regjeringen: Norgespris](https://www.regjeringen.no/no/aktuelt/norgespris-skal-sikre-forutsigbare-og-stabile-strompriser-for-folk/id3090849/) · [Huseierne: 22 things about Norgespris](https://www.huseierne.no/alt-om-bolig/strom-og-energi/22-ting-du-ma-vite-om-norgespris/) · [TU: Norgespris cap](https://www.tu.no/artikler/norgespris-maksgrense-pa-4000-kwh-i-maneden/558704)
- [RME external report 2025/08 (capacity tariff)](https://publikasjoner.nve.no/rme_eksternrapport/2025/rme_eksternrapport2025_08.pdf) · [SINTEF blog on the capacity tariff](https://blogg.sintef.no/energi/effektariff-redusere-belastningen-stromnettet)
- [Enova: accumulator tank terms](https://enova.no/nb/privat/bolig/stotte/akkumulatortank/vilkar-for-stotte-akkumulatortank) · [Bytt: Enova 2026 summary](https://www.bytt.no/varmepumpe/tilbyder/a-avwm/enova-stotte-til-varmepumpe-og-solceller-i-2026-slik-sikrer-du-deg-opptil-40-000-kroner)
- [Forbrukerrådet 2024: real-time meters report](https://storage02.forbrukerradet.no/media/2024/02/rapport-sanntidsmalere-060224.pdf) · [NVE: HAN port OBIS codes](https://www.nve.no/Media/4748/201603500-6-om-informasjon-til-kunden-via-han-porten-på-strømmåleren-obis-koder-1840798_2_0.pdf)
- [Helsedirektoratet: Legionella guide](https://www.helsedirektoratet.no/veiledere/legionella/bakgrunn-metode-og-prosess) · [IFI quoting FHI on 70 °C](https://www.ifi.no/artikkel/577390/last-ned)
- [European Commission: EPBD](https://energy.ec.europa.eu/topics/energy-efficiency/energy-performance-buildings/energy-performance-buildings-directive_en) · [ESG Today: infringement letters](https://www.esgtoday.com/?p=24765) · [EP summary](https://oeil.europarl.europa.eu/oeil/en/document-summary?id=1784741)
- [EUR-Lex: Reg. 2023/826 standby](https://eur-lex.europa.eu/eli/reg/2023/826/oj/eng) · [Nemko on the 2023/826 changes](https://www.nemko.com/blog/changing-eu-requirements-for-standby-mode)
- [EUR-Lex: Reg. 814/2013 water heaters](https://eur-lex.europa.eu/eli/reg/2013/814/2017-01-09/eng)
- [Brussels Times: EU prices H1 2026](https://www.brusselstimes.com/2384846/eu-electricity-prices-ease-in-2026-but-remain-elevated-after-energy-crisis) · [Euronews: price surge after Iran war](https://www.euronews.com/business/2026/05/14/europes-household-energy-prices-surge-after-iran-war-which-capitals-were-hit-hardest) · [Euronews: painful winter](https://euronews.com/2026/09/29/no-energy-shortage-but-a-painful-winter-looms-for-europe-top-eu-energy-leader-warns) · [IEA: household energy affordability](https://www.iea.org/reports/household-energy-affordability/executive-summary) · [IEEFA](https://ieefa.org/resources/europes-reliance-gas-power-could-increase-electricity-bills-eu120-year)
- [CBE Berkeley: Personal Comfort Systems](https://cbe.berkeley.edu/research/personal-comfort-system/) · [Hoyt et al. (eScholarship)](https://escholarship.org/content/qt13s1q2xc/qt13s1q2xc.pdf)
- [PNNL-24857 cellular shades](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-24857Rev1.pdf) · [PNNL-27663](https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-27663Rev1.pdf) · [DOE cellular shades fact sheet](https://www.energy.gov/sites/default/files/2021-12/bto-cellular-shades-factsheet-112221.pdf)
- [DOE gravity-film DWHR study](https://www.govinfo.gov/content/pkg/GOVPUB-E-PURL-LPS99193/pdf/GOVPUB-E-PURL-LPS99193.pdf) · [WSU Energy Program](https://e3tnw.org/ItemDetail.aspx-72.html?id=157) · [NRCan DWHR](https://natural-resources.canada.ca/energy-efficiency/drain-water-heat-recovery) · [U. Waterloo thesis](https://uwspace.uwaterloo.ca/items/45b42ce8-8989-4443-89e1-35c984229cef/full)
- [NRDC: Home Idle Load](https://www.nrdc.org/experts/pierre-delforge/always-devices-may-cost-americans-19-billion-annually-when-were-not-actively)
- [byggebolig.no: floor-heating consumption threads](https://byggebolig.no/energiforbruk-enok/hvor-blir-det-av-elektronene-mine-og-hvor-mye-bor-varmekabler-dra-av-strom) (anecdotal)
- [TU: Norway's heat-pump density](https://www.tu.no/artikler/slik-vil-svenske-produsenter-gjore-varmepumpene-mer-effektive/565856)
