# 01 Research – fag og teknologi

Søk gjort 2026-10-27. Merking: `[kilde: …]` = fra lenke under, `[modell]` = egen beregning i `problem.py`,
`[antakelse]` = skjønn.

## 1. Fysikken som avgjør ytelsen

Kaffe er i praksis vann: 300 ml lagrer 1 257 J/K. Å holde den over 60 °C fra 85 °C i 3 t med
romtemperatur 20 °C betyr at gjennomsnittlig varmetap må være under ≈ 25 K × 1 257 J/K / 10 800 s ≈ **2,9 W**
uten slurker `[modell]`. Med slurker forsvinner også varmekapasitet. Ved siste slurk er bare 120 ml igjen, og den
kjøles 2,5 ganger så raskt per watt. Derfor er grensen i praksis **≈ 1,5 W ved 64 °C**.

| Varmevei | Fysikk | Typisk størrelse (Ø70 mm kopp, 64 °C) |
|---|---|---|
| **Åpen overflate** (uten lokk) | Naturlig konveksjon h ≈ 1,52·ΔT^⅓ + stråling ε≈0,95 + **fordamping** (Lewis-analogi) | ≈ 3 000 W/m² ved 70 °C → 10–12 W, mest fordamping `[modell]` |
| Stråling over vakuumspalten | σA(T₁⁴−T₂⁴)/(1/ε₁+1/ε₂−1). Polert stål ε≈0,1, kobberbelegg ε≈0,03–0,05 | 0,2 W med kobber `[modell]` |
| **Halsen** (der indre og ytre vegg er sveiset sammen) | Ledning i 0,35 mm rustfritt (k≈16 W/mK), i serie med ytterveggen som kjøleribbe | **≈ 1,0 W = 2/3 av tapet** `[modell]` |
| Lokket | U-verdi × åpningsareal. Kondens under lokket gir høy indre varmeovergang | Skyvelokk i PP ≈ 1,6 W, vakuumlokk ≈ 0,2 W `[modell]` |
| Restgass i vakuum | Getter holder trykket nede. Tap av vakuum gir ×10–100 | 0,1 W `[antakelse]` |

**Konklusjoner fra fysikken:**
1. **Uten lokk er 3 t umulig.** En åpen kopp mister 10+ W. Fordamping alene kjøler 300 ml med ≈ 1 K/min
   ved 85 °C `[modell]`, i samme størrelsesorden som et regneeksempel med 0,13 K/s i vind `[kilde: GeoGebra]`.
2. Vakuumveggen er allerede så god at stråling er en liten post. **Hals og lokk avgjør.** Lokket kan stå for
   «opptil 40 %» av tapet `[kilde: LAMOSE-blogg, produsent, ikke uavhengig]`.
3. **PCM gir ikke mer energi, men mindre tap.** Et faseendringsmateriale (smeltepunkt ≈ 62–64 °C) suger
   opp varmen fra 85 °C-kaffen de første minuttene. Da står kaffen på ≈ 64 °C i stedet for 80 °C. Varmetapet
   er proporsjonalt med (T − T_rom), så kaffen taper ≈ 25 % mindre i den første timen, og PCM-et gir
   varmen tilbake når kaffen synker under smeltepunktet. Bonus: kaffen er drikkeklar raskt og
   kommer under IARC-grensen på 65 °C `[kilde: IARC 2016]`.
4. Preferert drikketemperatur er i snitt ≈ 60 °C (spenn 37–88 °C) `[kilde: Lee & O'Mahony 2002]`. Senere
   studier gir 58–66 °C for best aksept. Burn-modell gir ≈ 58 °C `[kilde: oversikt i PMC9712614]`.
   → **Drikkevindu 55–66 °C** brukes i modellen.
5. PCM i 55–60 °C-klassen (Rubitherm RT-serien) har 144–179 kJ/kg latent varme `[kilde: oversiktstabell, academic.oup.com]`.
   Modellen bruker 170 kJ/kg ved 64 °C `[antakelse]`. Det må verifiseres med DSC-måling av valgt materiale.

## 2. Eksisterende løsninger og hvorfor de er som de er

| Løsning | Prinsipp | Hvorfor slik | Begrensning |
|---|---|---|---|
| **Ember Mug 2** | Batteri + varmeelement + app | Holder nøyaktig temperatur | Bare ≈ 80–90 min på batteri, så må den stå på laderen. $80–150 `[kilde: Walmart/Slickdeals 2026]` |
| **YETI Rambler 14 oz Mug** | Vakuum-dobbelvegg, skyvelokk | Billig, robust, hank | Skyvelokket er «not leakproof», har ventil og tynn PP. Modellen gir **≈ 39 °C** ved siste slurk etter 3 t `[modell]` |
| **Fellow Carter Everywhere** | Vakuum + keramisk belegg, tett lokk | Smak, tett | Oppgir «12 t varm» uten definisjon `[kilde: crema.fi]`. Høy, smal, ingen hank |
| **Stanley Classic Trigger-Action 350 ml** | Vakuum, smal munn, trykklokk | Reise/bil | Oppgir «varm i 5 t» `[kilde: Cotswold Outdoor]`. Ikke kopp-form, kan ikke drikkes fra kanten |
| **Temperfect (Joeveo), 2013** | **Trippelvegg: vakuum + PCM (60 °C)** | Samme idé som vår | Kickstarter-produkt, liten utbredelse. Opprinnelig reisekopp `[kilde: NC State 2013, Smithsonian]` |
| **Coffee Joulies** | PCM-«bønner» (60 °C) som legges i koppen | Ettermontering | Testet: liten effekt i vanlig kopp, **stor effekt i reisekopp** (60 °C i 2 t) `[kilde: Cook's Country]`. Det støtter at PCM bare hjelper når tapene allerede er lave |

## 3. Skademekanismer og feilmoder
- **Tap av vakuum** (sveisefeil, fallskade, korrosjon i sveisen) → tapet ×10. Dette er den vanligste reklamasjonen på vakuumbeger `[antakelse]`. Mottiltak: heliumlekktest 100 %, getter, ytre vegg ≥ 0,45 mm.
- **Lekkasje fra PCM-kappen** → parafin i vakuumrommet. Det ødelegger vakuumet, og i verste fall siver PCM inn i drikken ved en sprekk i innerveggen. Mottiltak: PCM-kappen sveises tett *før* vakuumsveis, trykk- og syklustest, matvaregodkjent parafin. **Ikke salthydrat-PCM** (korrosivt, giftigere).
- **PCM-volumendring** ≈ 10 % ved smelting → buffer (luftlomme) kreves `[kilde: Thero-patentet beskriver buffer-lag]`.
- **Brannskade** ved søl av 85 °C kaffe. PCM-et senker temperaturen til ≈ 67 °C på ett minutt `[modell]`, noe som reduserer skåldingsrisikoen.
- **Varm kant:** Halsen leder varme ut og ytre kant kan bli 45–55 °C. Lokkskjørtet dekker den.
- **Belegg flasser** (keramisk sol-gel) etter oppvaskmaskin → test EN 12875-1.
- **Mikrobølgeovn:** Metall gir gnister. Merk tydelig.

## 4. Standarder og regelverk
| Område | Regel | Gjelder oss fordi |
|---|---|---|
| Matkontakt, ramme | **(EF) 1935/2004** + (EF) 2023/2006 GMP; i Norge forskrift om materialer og gjenstander i kontakt med næringsmidler | Alt som berører kaffen `[kilde: Thermos/alfi samsvarserklæringer]` |
| Plast (lokk, PP) | **(EU) 10/2011** + migrasjonstest EN 1186 | Lokk, skyver `[kilde: alfi DoC]` |
| Silikon (pakning) | Ingen harmonisert EU-regel. Bruk BfR XV / LFGB eller fransk regel `[antakelse]` | Pakning |
| Rustfritt stål | Ingen EU-spesifikk regel. Europarådets resolusjon CM/Res(2013)9 og EDQM-veileder `[antakelse]` | Kropp |
| Isolerte beholdere | **EN 12546-1:2000**. Varmetapskravet (3.4.1) gjelder flasker og kanner, **ikke kopper** `[kilde: Global Sources testrapport]` | Kan brukes frivillig som testmetode |
| Produktsikkerhet | **GPSR (EU) 2023/988**, gjelder fra 13.12.2024: risikovurdering, sporbarhet, ansvarlig aktør i EU ved salg på nett `[kilde: Baker McKenzie, Belgisk økonomidep.]` | Alle forbrukerprodukter |
| Oppvaskmaskin | EN 12875-1 (mekanisk oppvaskbestandighet) | Påstand «tåler oppvaskmaskin» |
| Kjemikalier | REACH (PCM-stoffet, kobberbelegg). Prop 65 ved salg i USA | PCM |
| **CE-merking** | **Ingen.** Ikke elektrisk, ikke leketøy | Stor forenkling mot Ember (RED, batteriforordningen 2023/1542, WEEE) |

## 5. Patenter (Google Patents, 2026-10-27, ikke juridisk vurdering)
| Patent | Hva | Status | Betydning |
|---|---|---|---|
| **US11350778B2** (Thero Inc., prioritet 2019-09-05) | Kopp med yttervegg, mellomvegg og innervegg. Vakuum mellom ytter og midt, **PCM mellom midt og inner**, getter, glassforseglet hull, bufferlag, gjenget lokk | **Falt bort** pga. ubetalt avgift (lapse 2026-06-07 ifølge Google). Familie: CN111642950A/B, CN212546488U. **Ingen EP/WO** | Nærmeste teknikk. Krav 1 er snevert (glassperle-forsegling, gjenget lokk). Ingen beskyttelse i Europa ifølge familieoversikten |
| US9974402B2, US7934537, US10595654, US11206938, US9181015 (Booska) | PCM-hus som stikkes ned i en isolert kopp, flere PCM-kamre | US9974402B2 oppført som aktiv | Gjelder innsats/flere kamre. Vi har fast kappe og ett kammer, men FTO må sjekkes |
| Temperfect/Joeveo (2013) og PCM-kopp-patenter fra 1960-tallet | Trippelvegg med vakuum og PCM | Publisert = **kjent teknikk** | Konseptet «vakuum + PCM» er ikke nytt og kan trolig ikke patenteres av oss. Det kan heller ikke stoppe oss |

**Patentbart hos oss (mulig):** kombinasjonen lang rullet hals (≥ 20 mm ledningsvei) + lokk med
kantskjørt som isolerer sveisesonen + lokkplugg. Trolig svakt. Budsjetter en nyhetssøk hos patentkontor (≈ 15–25 kNOK).
**FTO-analyse hos patentrådgiver er et krav før verktøybestilling.**

## Hva dette betyr for designet
1. **Tett lokk er obligatorisk.** Uten lokk, eller med et skyvelokk med åpen ventil, går kaffen under 45 °C på 3 t `[modell]`.
2. **Halsen er hovedfienden.** Lang ledningsvei (rullet kant), tynn plate i halsen, og et lokkskjørt som isolerer sveisesonen.
3. **Smal munn hjelper**, men koppen må fortsatt være ≤ 125 mm høy. Ø70 mm innvendig er kompromisset.
4. **PCM ved 62–65 °C** gjør to jobber: drikkeklar fort, og under 65 °C (IARC). Den gjør også 3 t mulig, fordi tapet blir lavere.
5. **Kobberbelegg** på kappen er billig (≈ 3 kr) og fjerner halvparten av strålingstapet.
6. **Påstanden må testes mot et definert scenario.** Konkurrentenes «varm i X t» er udefinert. Vi definerer vårt (00_brief).
7. Ingen CE og ingen batteri gir enkel regulatorisk vei: matkontakt + GPSR.

## Kilder (alle lest 2026-10-27)
1. Lee, H.-S. & O'Mahony, M. (2002), preferert drikketemperatur ≈ 60 °C – [Oregon State, hot-bev-temp.pdf](https://foodsci.oregonstate.edu/sites/agscid7/files/foodsci/attachments/hot-bev-temp.pdf), [Ewha pure](https://pure.ewha.ac.kr/en/publications/at-what-temperatures-do-consumers-like-to-drink-coffee-mixing-met/)
2. Oversikt drikketemperatur, 58–66 °C, Brown & Diller ≈ 58 °C – [PMC9712614](https://pmc.ncbi.nlm.nih.gov/articles/PMC9712614)
3. IARC (2016), svært varme drikker > 65 °C gruppe 2A – [PAHO/IARC pressemelding](https://www.paho.org/en/news/15-6-2016-iarc-monographs-evaluate-drinking-coffee-mate-and-very-hot-beverages)
4. Ember Mug 2, 80 min batteri, pris – [Slickdeals 2026](https://slickdeals.net/f/18660235-79-99-10-oz-ember-ember-temperature-control-smart-mug-2-at-amazon), [ShopSavvy](https://shopsavvy.com/products/ember-smart-mug-2)
5. Stanley Trigger-Action 350 ml «varm 5 t» – [Cotswold Outdoor](https://www.cotswoldoutdoor.com/p/stanley-the-trigger-action-travel-mug-35l-B4BB390006.html)
6. YETI Rambler 14 oz Mug, pris, skyvelokk ikke lekkasjetett – [Scheels](https://www.scheels.com/p/yeti-rambler-14-oz-mug-with-magslider-lid/14394-21071300059.html), [Ace Hardware](https://www.acehardware.com/departments/home-and-decor/kitchen-utensils-and-gadgets/water-bottles-and-travel-mugs/8090203?x429=true)
7. Fellow Carter Everywhere Mug, pris og «12 t» – [Crema.fi](https://www.crema.fi/en/products/fellow/carter-everywhere-mug-16oz)
8. Lokkets andel av tapet, tester – [LAMOSE (produsentblogg)](https://lamose.com/blogs/recipes/5-things-that-kill-your-tumblers-temperature-performance), [Quality Logo Products test](https://www.qualitylogoproducts.com/blog/tumbler-heat-retention-test/)
9. Varmetransport fra kaffekopp: konveksjon, stråling og fordamping – [Ferreira, repositorio.ucp.pt](https://repositorio.ucp.pt/bitstreams/facfcba7-6c1c-4700-92ec-4d50ef8a2565/download), [GeoGebra fordampingseksempel](https://www.geogebra.org/m/PyKHzkFf)
10. Temperfect trippelvegg PCM (NC State 2013) – [NC State News](https://news.ncsu.edu/2013/12/wms-hot-coffee), [Smithsonian](https://www.smithsonianmag.com/innovation/this-mug-keeps-coffee-warm-not-piping-hot-for-hours-on-end-180948285/)
11. Coffee Joulies test – [Cook's Country](https://www.cookscountry.com/equipment_reviews/1409-coffee-temperature-regulator)
12. Patent US11350778B2 (Thero) – [Google Patents](https://patents.google.com/patent/US11350778); Booska US9974402B2 – [Google Patents](https://patents.google.com/patent/US9974402)
13. EN 12546-1 og matkontakt-samsvar – [BSI](https://knowledge.bsigroup.com/products/materials-and-articles-in-contact-with-foodstuffs-insulated-containers-for-domestic-use-specification-for-vacuum-ware-insulated-flasks-and-jugs), [Thermos DoC](https://thermos.eu/media/produkte/thv-thermos-carafe-66-oz-2-00-l/documents/declaration-of-conformity.pdf), [testrapport](https://p.globalsources.com/IMAGES/PDT/SPEC/851/K1201302851.pdf)
14. GPSR (EU) 2023/988 – [Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/general-product-safety-regulation), [Belgisk økonomidep.](https://economie.fgov.be/en/themes/quality-and-safety/safety-products-and-services/regulations/general-regulations-safety)
15. PCM 50–60 °C, latent varme 144–179 kJ/kg – [academic.oup.com tabell](https://academic.oup.com/view-large/11887416)
16. Kobber-/lavemissivitetsbelegg i vakuumbeholdere – [US10476089 (USPTO)](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10476089), [Illinois Physics Q&A](https://van.physics.illinois.edu/ask/listing/42930)
