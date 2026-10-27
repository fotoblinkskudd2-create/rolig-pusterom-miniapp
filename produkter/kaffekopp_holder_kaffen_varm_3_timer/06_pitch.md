# 06 Pitch – «Tretimer» og stresstest

Merking: `[målt]` · `[kilde: …]` · `[modell]` · `[antakelse]`. **Ingenting er målt ennå.** Pitchen under har
derfor to versjoner: *investor/partner* (modelltall er lov når de merkes som modell) og *forbruker* (bare
påstander fra listen «lov nå» nederst). Forbrukerversjonen oppdateres etter T1–T3 i `05_testplan.md`.

## Enlinjer (≤ 15 ord)
- **Investor:** «Kaffekoppen som holder kaffen drikkeklar i tre timer – uten batteri og lading.» (12 ord, *mål*, testes i T1)
- **Forbruker, lov nå:** «Drikkeklar kaffe uten batteri. Laget for den som drikker sakte.» (10 ord)

## 30-sekunders pitch (investor/partner)
> Halvparten av oss drikker kaffen ved PC-en, og den er lunken før vi er halvveis. Ember løser det med batteri
> til over 1 000 kroner og holder ≈ 80 minutter før den må på laderen `[kilde: Slickdeals/ShopSavvy]`.
> Vi har gjort det motsatte: ingen elektronikk. En vakuumkopp med et voksaktig faseendringsmateriale som suger
> opp overskuddsvarmen og gir den tilbake, og en hals og et lokk som er konstruert mot den største varmelekkasjen.
> Modellen vår gir kaffen drikkeklar etter 17 minutter og over 55 °C ved siste slurk etter tre timer, selv med
> 40 % mer varmetap enn antatt `[modell]`. En YETI-kopp ligger på 39 °C `[modell]`. Neste steg er en prøveserie
> på 130 000 kroner som avgjør om tallene holder. Holder de, selger vi til 599 kroner med ≈ 4× kost.

## 3 sterkeste argumenter (PEEL)

### 1. Riktig temperatur – ikke bare «varm lenge» · *logos + ethos*
- **Poeng:** Problemet er ikke bare at kaffen blir kald, men at vakuumkopper er *for varme* i timevis og så for kalde.
- **Evidens:** Folk foretrekker ≈ 60 °C, best aksept 58–66 °C `[kilde: Lee & O'Mahony 2002; PMC9712614]`.
  IARC klassifiserer drikke > 65 °C som sannsynlig kreftfremkallende (2A) `[kilde: IARC 2016]`. Modellen gir
  kaffen i drikkevinduet 91 % av tre timer, mot 19 % uten PCM og 24 % for YETI `[modell]`.
- **Forklaring:** PCM-et smelter ved 64 °C, tar opp varmen fra 85 °C-kaffen på minutter og gir den tilbake når
  kaffen kjøles. Fordi kaffen holder 64 °C i stedet for 80 °C, taper den også mindre varme.
- **Link:** «Du slipper å vente 40 minutter på å kunne drikke, og du slipper lunken kaffe i det siste møtet.»

### 2. Ingen batteri, ingen lading, ingen elektronikk · *logos + pathos*
- **Poeng:** Samme jobb som Ember for halve prisen, uten noe som kan gå tomt eller dø.
- **Evidens:** Ember Mug 2 holder ≈ 80–90 min på batteri og koster $80–150 `[kilde: Slickdeals 2026]`. Batterier
  har begrenset levetid og koppen tåler ikke oppvaskmaskin `[kilde: 02_marked.md]`. Tretimer har 0 W, ingen
  CE/batteri-/WEEE-krav `[kilde: 01_research.md]`.
- **Forklaring:** Energien er kaffens egen varme. Fysikken krever bare at den ikke lekker ut.
- **Link:** «Du skal ikke huske på å lade koppen din.» (følelse: frihet fra enda en dings)

### 3. Bygget mot den største lekkasjen, ikke bare tykkere vegger · *ethos + logos*
- **Poeng:** I en god vakuumkopp lekker ≈ 2/3 av varmen gjennom halsen der veggene møtes, ikke gjennom veggen.
- **Evidens:** Varmetap ved 64 °C: hals 67 %, lokk 14 %, stråling 13 % `[modell]`. Uten lokkskjørt over halsen
  faller designet −0,12 i poeng, med skyvelokk −0,36 `[modell, robusthet.md]`. Lokket står for opptil 40 % av
  tapet i vanlige tumblere `[kilde: LAMOSE, produsentblogg – ikke uavhengig]`.
- **Forklaring:** Lang rullet hals, vakuumlokk med plugg og et skjørt som pakker inn sveisesonen.
- **Link:** «Den siste slurken skal være like god som den første.» (pathos)

## Stresstest

### Skeptisk investor
| Angrep | Ærlig svar |
|---|---|
| «Dette er Temperfect fra 2013. Hvorfor lykkes dere der de ikke slo gjennom?» | **Delvis riktig.** Konseptet er kjent og kan ikke patenteres (`03_patent.md`). Vår forskjell er kopp med hank for skrivebord og et definert, testet løfte. Vi vet ikke hvorfor Temperfect ikke skalerte; det er et åpent spørsmål vi må svare på før verktøy (intervju med OEM/forhandlere). Derfor er forsalg ≥ 300 stk et stoppkriterium |
| «Midscenarioet tjener 315 kNOK/år på 1 MNOK investering. Det er ikke en venture-case.» | **Riktig.** Dette er en lønnsom nisjeprodukt-case (tilbakebetaling ≈ 3,2 år mid), ikke hypervekst. Best-case (15 000 stk) gir 2,15 MNOK/år. Vi søker partner/OEM-finansiering eller forsalg, ikke VC |
| «141 kr kost er et tall dere har funnet på.» | **Riktig.** Det er en modell uten OEM-tilbud. ±30 kr endrer resultatet ±150 kNOK/år. Steg 0 i planen er 3 bindende tilbud; under 150 kr er krav for å gå videre |

### Kunde
| Angrep | Ærlig svar |
|---|---|
| «64 °C er for lunkent for meg, jeg vil ha den skikkelig varm.» | **Gyldig for noen.** Spennet i preferanser er 37–88 °C `[kilde: Lee & O'Mahony]`. For den som vil ha 75 °C+ er B-varianten (uten PCM) eller en termos bedre. Smeltepunkt testes 62/64/66 °C i T13 |
| «417 gram er tungt for en kopp.» | **Riktig**, ≈ 70–120 g tyngre enn keramikk. Kompromisset er PCM-et (73 g) og tre stålvegger. Spørsmålet stilles i T13; mål for P2 er ≤ 380 g |
| «Jeg må ha lokket på hele tiden? Da er det jo en termos.» | **Ja, mellom slurkene.** Uten lokk er tre timer fysisk umulig for *enhver* kopp uten strøm: en åpen kopp mister 10+ W, mest ved fordamping `[modell]`. Drikkeåpningen i lokket gjør at du kan drikke uten å ta det av. Vi lover ikke noe uten lokk |

### Fagekspert / myndighet
| Angrep | Ærlig svar |
|---|---|
| «PCM (parafin) i en drikkebeholder – hva skjer ved en sprekk?» | **Reell risiko.** Mottiltak: matvaregodkjent parafin, sveiset kappe heliumtestet 100 %, termisk sykling 1 000× (T11), migrasjonstest (T10). Salthydrat-PCM er utelukket. Lekker kappen i test, lanseres B uten PCM |
| «‘Varm i 3 timer’ er udefinert og vil være villedende etter markedsføringsloven § 6–7.» | **Riktig om udefinerte påstander** – derfor bruker vi den ikke. Løftet knyttes alltid til scenariet i `00_brief.md` (85 °C inn, 20 °C rom, 12 slurker) og først etter uavhengig test |
| «Modellen deres er bare en modell. Hvorfor tro på 62,7 °C?» | **Riktig, den er ikke bevis.** Derfor loves bare ≥ 55 °C, som holder ned til +40 % tap. Kalibreringssjekk mot Stanley tyder på at modellen er heller pessimistisk, men det er én indirekte sjekk. T4 måler tapet per varmevei |

**Feilslutninger å se etter hos motparten:** «Ember har milliarder i omsetning, så uten batteri kan det ikke
fungere» er et *autoritetsargument uten evidens* – fysikken avgjør, og den testes i T1. «Enten elektronikk eller
lunken kaffe» er en *falsk dikotomi*. Vi svarer ikke med «konkurrentene lyver også om timer» (*tu quoque*).

## Påstander vi IKKE kan bruke ennå
| Påstand | Hvorfor ikke | Hva som trengs |
|---|---|---|
| «Over 55 °C etter 3 timer» / «varm i 3 timer» | Bare `[modell]` | T1 bestått (18/18), rapport fra uavhengig lab, scenario oppgitt |
| «60 °C i 3 timer når koppen er forvarmet» | Bare `[modell]` | T1b bestått |
| «Drikkeklar på 17 minutter» | Bare `[modell]` | T3 |
| «20 °C varmere enn YETI» / sammenligning med navngitt konkurrent | Sammenlignende reklame krever dokumentasjon (mfl. § 8 / direktiv 2006/114) | T1 med YETI-referanse, samme oppsett |
| «Holder deg under kreftgrensen 65 °C» | Helsepåstand, lett å misforstå | Ikke bruk. Kan si «laget for 55–66 °C, temperaturen de fleste foretrekker» etter T3 |
| «Tåler oppvaskmaskin» | Ikke testet | T7 (EN 12875-1) |
| «Patentert» / «patent pending» | Ingen søknad levert | Søknad levert (`03_patent.md`) – først da «patent pending» |
| «Lekkasjesikker» | Ikke testet | T9; selv da «sølsikker ved velt», ikke «lekkasjesikker» |

## Påstander som er lov nå
- «Uten batteri, uten lading, uten elektronikk.» (konstruktivt faktum)
- «Vakuumisolert stål med faseendringsmateriale som smelter ved ≈ 64 °C.» (spesifikasjon – endres hvis DSC i T5 avviker)
- «De fleste foretrekker kaffe rundt 60 °C.» `[kilde: Lee & O'Mahony 2002]`
- «Tett vakuumlokk med drikkeåpning og kantskjørt.» (konstruktivt faktum)
- «Laget for den som drikker sakte ved skrivebordet.» (formål, ingen ytelsespåstand)
