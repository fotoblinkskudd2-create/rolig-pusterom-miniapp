# 03 Patent – kjent teknikk, nyhetsanalyse og utkast til krav

> **Ikke juridisk rådgivning.** Dette er en teknisk forstudie for å prioritere arbeid og budsjett.
> Patentstatus fra Google Patents (2026-10-27). Google merker selv status som «antakelse, ikke juridisk konklusjon».
> FTO og eventuell søknad skal gjøres av norsk patentrådgiver (og kinesisk fullmektig for CN).

Merking: `[kilde: …]` · `[modell]` · `[antakelse]`.

## 1. Kjent teknikk

| # | Patent/produkt | Nummer/lenke | Status (land) | Hva det dekker |
|---|---|---|---|---|
| D1 | Thero/Sello «Temperature control cup» | [US11350778B2](https://patents.google.com/patent/US11350778) | **Bortfalt** (US), ubetalt avgift. Lapse-hendelser 2026-07-13/08-04, effektiv 2026-06-07. Kan i prinsippet gjenopprettes ved begjæring `[antakelse]` | Ytter-, mellom- og innervegg. Vakuum ytter/midt, **PCM mellom midt og inner**, getter i bunnen, **bunnhull forseglet med smeltet glassperle**, **bufferlag** over PCM, **gjenget lokk** |
| D1b | Samme familie, Kina | [CN111642950B](https://patents.google.com/patent/CN111642950B/en) (+ bruksmodell CN212546488U) | **Aktiv i Kina**, forventet utløp 2040-06-11. Innehaver nå Shenzhen Senruo New Material Technology | Som D1. Krav 1 inkluderer også fremstillingstrinn S1–S6 og faseendringstemperatur 35–65 °C |
| D2 | Booska «Thermal receptacle with phase change material» | [US9181015](https://patents.google.com/patent/US9181015), [US9974402B2](https://patents.google.com/patent/US9974402), US10595654, [US11206938B2](https://patents.google.com/patent/US11206938) | **Aktiv** (US), utløp 2033. Ingen EP/WO funnet | **Separat rørformet innsats** med PCM-kammer som henges ned i en isolert kopp. US11206938: metodekrav, krever separat innsats |
| D3 | Eldre PCM-kopper («Thermal receptacle with PCM») | [US6634417](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6634417), US6968888, US7059387, US7934537 | Prioritet ≈ 1997–2002 → **utløpt** `[antakelse: 20 år]` | PCM-kammer (parafin) i koppvegg, vakuumisolert ytterskall, innervegg trukket ned fra kanten for å unngå varm kant |
| D4 | «Thermodynamic container» | [US8205468](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8205468) | Ikke verifisert (skannet PDF, Google 503). Utgitt 2012 → aktiv til ≈ 2029–31 hvis avgift betalt `[antakelse]` | Trippelvegg; rom mellom inner og midt helt/delvis fylt med PCM |
| D5 | Ember «Heated or cooled drinkware» | [US10995979](https://patents.google.com/patent/US10995979), US9863695, US10383476 | **Aktiv** (US), utløp 2038. Ingen EP i Google | Beholder med PCM **og** varmeelement, styrekrets, batteri, sensorer |
| D6 | Served «Temperature-conserving containers» | [US20230146911A1](https://patents.google.com/patent/US20230146911A1/en) | **Henlagt** (US) | Dobbelvegget lokk med isolerende hulrom og leppe som tetter mot kanten |
| D7 | Lokk med ytre skjørt mot beholderen | [US12440066](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12440066), US12484736 | Aktiv (US), nylig utgitt `[antakelse]` | Lokk med indre og ytre skjørt; ytre skjørt ligger mot yttersiden av dobbeltvegget kar (feste/beskyttelse, ikke varme) |
| D8 | Temperfect / Joeveo (produkt, 2013) | [NC State](https://news.ncsu.edu/2013/12/wms-hot-coffee), [Smithsonian](https://www.smithsonianmag.com/innovation/this-mug-keeps-coffee-warm-not-piping-hot-for-hours-on-end-180948285/) | Publisert = kjent teknikk | Trippelvegg: vakuum + PCM (60 °C). Reisekopp |
| D9 | PCM-kopp fra 1960-tallet | Omtalt i [ceramics.org](https://ceramics.org/ceramic-tech-today/phase-change-material-in-coffee-and-beer-mugs/) | Utløpt | Selve konseptet PCM-kopp |
| D10 | Vanlige vakuumkopper (YETI, Fellow, Stanley) | Produkter, se `02_marked.md` | Kjent teknikk | Vakuum-dobbelvegg, rullet kant, kobberbelegg, skyvelokk/trykklokk, keramisk belegg |
| D11 | Kobberbelagt vakuumbeholder | [US10476089](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/10476089) | Ikke verifisert | Lavemissivt belegg i vakuumspalten |

**Ikke funnet:** EP/WO-familie for D1, D2 eller D5. Ikke søkt i Espacenet med CPC A47G19/2288 og A47J41/0055 – gjøres av rådgiver.

## 2. Nyhetsanalyse (førsteprinsipper)

Designet brutt ned i tekniske trekk:

| # | Trekk | Kjent fra | Nytt? |
|---|---|---|---|
| T1 | Vakuum-dobbelvegg i stål, getter | D1, D3, D10 | Nei |
| T2 | Fast PCM-kappe mellom innervegg og vakuum, smeltepunkt 62–66 °C | D1 (35–65 °C), D3, D4, D8 | Nei |
| T3 | Kobberbelegg i vakuumspalten | D10, D11 | Nei |
| T4 | **Lang ledningsvei i halsen** (rullet kant + nedtrekk, ≥ 18 mm fra innervegg til sveis) | Delvis: D3 trekker innerveggen ned fra kanten (≥ 1/4″) for berøringskomfort | Delvis. Ingen kilde knytter halslengden til at PCM-et kan virke |
| T5 | **Lokk med kantskjørt som dekker sveisesonen** (≥ 10 mm av ytterveggen) **og isolerer den termisk** | D7 har skjørt for feste/beskyttelse, D6 har isolert lokk uten skjørt | Delvis. Skjørt kjent; skjørt som *termisk barriere over halsens sveisesone* ikke funnet |
| T6 | Vakuumlokk med plugg ned i halsen + pakning, **ikke gjenget** | D6 (isolert lokk), D10 | Nei |
| T7 | Dimensjonering: PCM-masse og smeltepunkt valgt slik at kaffen er ≤ 66 °C innen 20 min og ≥ 55 °C etter 3 t med slurker | D8 (markedsført effekt), D1 | Nei som effekt. Tallgrensene er en parametervalg-avgrensning, svak alene |

**Kombinasjonen som gir en teknisk effekt ingen kilde viser:** T2 + T4 + T5. Modellen viser at halsen er
≈ 67 % av tapet i en PCM-kopp med vakuumlokk `[modell]`, og at uten skjørt og lang hals blir tapet så stort at
PCM-et er brukt opp før 3 t (−0,12 poeng uten skjørt, se `robusthet.md`). Ingen funnet kilde beskriver at
*halsen* er flaskehalsen for PCM-kopper eller tiltak rettet mot den. Det er det eneste stedet vi kan ha et
oppfinnelseshøyde-argument. **Svakheten:** en fagperson kan si at «isoler det som er varmest» er nærliggende
(D3 + D7). Sannsynlighet for at et krav av denne typen blir godkjent med nyttig bredde: **≈ 25–35 %** `[antakelse]`.

## 3. Utkast til krav

**Krav 1 (selvstendig).** Drikkebeholder for varm drikke, omfattende en innervegg (1) som avgrenser et
drikkerom, en yttervegg (2), et vakuumisolert rom (3) mellom innerveggen og ytterveggen, et
faseendringsmateriale (4) i varmeledende kontakt med innerveggen, en hals (5) der innerveggen og ytterveggen er
forbundet, og et avtakbart lokk (6), **karakterisert ved at** ledningsveien gjennom halsen fra drikkeromets
øverste væskenivå til forbindelsen med ytterveggen er minst 15 mm, og at lokket omfatter et skjørt (7) som
omslutter ytterveggen i hele forbindelsessonen med en varmemotstand mellom forbindelsessonen og omgivelsene som
er minst like stor som lokkets varmemotstand per flateenhet.

**Uselvstendige krav:**
2. Drikkebeholder ifølge krav 1, der halsen er dannet av en rullet kant på innerveggen som brettes over toppen og
   ned på utsiden før den føyes til ytterveggen.
3. Drikkebeholder ifølge krav 1 eller 2, der faseendringsmaterialet har smeltepunkt 60–66 °C og en masse
   på 0,15–0,35 g per ml nominelt drikkevolum.
4. Drikkebeholder ifølge et av kravene 1–3, der lokket omfatter en plugg som går ned i halsen med en
   elastisk pakning, og pluggen er dobbeltvegget med vakuum eller luft.
5. Drikkebeholder ifølge et av kravene 1–4, der skjørtet er av et materiale med varmeledningsevne under
   0,5 W/mK og har en luftspalte mot ytterveggen.
6. Drikkebeholder ifølge et av kravene 1–5, der den vendte siden av en vegg mot det vakuumisolerte rommet har
   et belegg med emissivitet under 0,06.
7. Drikkebeholder ifølge et av kravene 1–6, der faseendringsmaterialet er innesluttet i en sveiset kappe med et
   ekspansjonsvolum på minst 10 % av PCM-volumet, og kappen er tett før det vakuumisolerte rommet lukkes.

**Kontroll mot hver rad i kjent teknikk:**

| Rad | Treffer krav 1? | Hvorfor ikke |
|---|---|---|
| D1/D1b | Nei | Ingen hals ≥ 15 mm, intet isolerende skjørt; gjenget lokk |
| D2 | Nei | Separat innsats, ikke fast i vegg; ingen hals/skjørt |
| D3 | Nei (nærmest) | Innervegg trukket ned for komfort, men intet lokkskjørt som isolerer sveisesonen. **Risiko: D3 + D7 som nærliggende kombinasjon** |
| D4 | Nei | Ingen hals/skjørt beskrevet `[antakelse, ikke lest]` |
| D5 | Nei | Krever ikke trekket; aktive elementer uansett utenfor vårt krav |
| D6 | Nei | Isolert lokk uten skjørt over sveisesone |
| D7 | Nei | Skjørt, men ingen PCM, ingen varmemotstandskrav |
| D8–D11 | Nei | Ingen av de karakteriserende trekkene |

## 4. FTO-risiko (frihet til å operere)

| Patent | Kan treffe oss? | Sannsynlighet `[antakelse]` | Mottiltak |
|---|---|---|---|
| **CN111642950B** (aktiv til 2040) | **Ja, ved produksjon i Kina.** Å *fremstille* et produkt som faller under kravet i Kina er inngrep selv om alt eksporteres. Krav 1 krever *alle* trekk: glassperleforseglet bunnhull, getter i bunn, bufferlag, **gjenget lokk** og fremstillingstrinn | **Lav–middels, 10–20 %** hvis OEM bruker sin standard prosess (glassperle-/loddeperle-forsegling av bunnhull er vanlig i Kina) | (1) **Design rundt**: lokket festes med plugg/bajonett, *ikke* gjenger (allerede valgt). (2) Krev i OEM-kontrakten annen vakuumforsegling enn glassperle, eller dokumentert avvik fra S1–S6. (3) Skriftlig vurdering fra kinesisk fullmektig (≈ 15–30 kNOK). (4) Alternativt OEM i Vietnam/Taiwan |
| US11350778B2 | Bare ved salg i USA, og bare hvis gjenopprettet | < 5 % | Overvåk status før USA-lansering |
| US9974402B2 / US11206938B2 (Booska) | Nei, krever separat innsats | < 5 % | Ingen. Ikke selg PCM-innsats som tilbehør i USA |
| US10995979 (Ember) | Nei, krever varmeelement/elektronikk `[antakelse, krav ikke lest]` | < 5 % | Rådgiver bekrefter |
| US8205468 (Thermodynamic container) | Mulig i USA hvis aktiv og krav er bredt (trippelvegg + PCM) | 10–15 % (bare USA) | Les krav og status før USA. Ikke relevant for Norden/EU (ingen EP funnet) |
| Ukjente EP/CN-patenter | Mulig | 10 % | Espacenet-søk A47G19/2288, A47J41/00 hos rådgiver |

**Samlet FTO-risiko for Norden/EU-salg: lav. For produksjon i Kina: middels inntil glassperle/gjenger er dokumentert unngått.**

## 5. Anbefaling

| Alternativ | Kost | Tid | Vurdering |
|---|---|---|---|
| **A. Prioritetssøknad NO** på krav 1–7 (T4 + T5 + PCM), deretter beslutte PCT innen 12 mnd etter T1/T4 | ≈ 40–70 kNOK med rådgiver `[antakelse]`; PCT senere ≈ 50–80 kNOK | Søknad 4–6 uker; nyhetsrapport fra Patentstyret ≈ 6–7 mnd `[antakelse]` | **Anbefalt.** Billig opsjon. Søknaden kan trekkes før publisering (18 mnd) hvis granskingen er negativ, og innholdet forblir da hemmelig |
| B. Designregistrering (EU, RCD) av koppform + lokk | ≈ 350 € grunnavgift `[kilde: Pinsent Masons, ikke verifisert for 2026]` + rådgiver ≈ 10 kNOK | 1–2 mnd | **Anbefalt i tillegg**, rett før lansering. Billig vern mot kopier av utseendet |
| C. Forretningshemmelighet | 0 | – | Passer for PCM-resept, fyllprosess og sveisesekvens (ikke synlig i produktet). Hals/skjørt *er* synlig, så det kan ikke holdes hemmelig |
| D. Defensiv publisering | ≈ 0–5 kNOK | Dager | Hvis A får negativ nyhetsrapport: publiser hals/skjørt-løsningen så ingen andre kan patentere den |
| E. Ingen beskyttelse | 0 | – | Akseptabelt hvis merkevare/tid til marked er strategien. Konseptet vakuum + PCM er uansett fritt |

**Anbefaling:** A + B + C, med D som plan B. **Konfidens 65 %.** Det trekker ned at oppfinnelseshøyden er
svak (D3 + D7) og at verdien av et snevert krav i et marked med 2,6 MNOK SOM er begrenset. Hovedverdien er
å hindre at en OEM eller konkurrent patenterer *vår* løsning og blokkerer oss. **FTO for Kina er viktigere enn
egen søknad (konfidens 85 % at den trengs før verktøybestilling).**

## Kilder (lest 2026-10-27)
- Google Patents: [US11350778](https://patents.google.com/patent/US11350778), [CN111642950B](https://patents.google.com/patent/CN111642950B/en), [US9974402](https://patents.google.com/patent/US9974402), [US11206938](https://patents.google.com/patent/US11206938), [US10995979](https://patents.google.com/patent/US10995979), [US20230146911A1](https://patents.google.com/patent/US20230146911A1/en)
- USPTO PDF: [US6634417](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6634417), [US8205468](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/8205468), [US12440066](https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/12440066)
- [ceramics.org om PCM-kopper](https://ceramics.org/ceramic-tech-today/phase-change-material-in-coffee-and-beer-mugs/), [GlobalSpec](https://insights.globalspec.com/article/3971/keeping-that-cuppa-joe-hot-all-day)
- EU-design gebyr: [Pinsent Masons](https://pinsentmasons.com/out-law/guides/registering-a-design-in-the-eu), [EUIPO COM-3-24](https://euipo.europa.eu/tunnel-web/secure/webdav/guest/document_library/contentPdfs/law_and_practice/communications_president/COM-3-24_en.pdf)
