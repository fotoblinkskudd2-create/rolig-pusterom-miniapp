# 01 — Research: fem kamper, virkelige hull

Grunnlag for alt som følger. Tall merket **[kilde]** er hentet i dette søket (okt 2026). Tall merket **[lit.]** er etablert i fagfeltet, men ikke verifisert på nytt her — sjekk primærkilde før du siterer offentlig.

---

## 1. Aldersomsorg

**Bakgrunn**
- Over tre av fire omsorgspersoner opplever utbrenthet, mange ukentlig eller daglig (A Place for Mom 2025, via Stacker) **[kilde]**.
- Gjennomgang av 21 apper for pårørende: bare 57 % hadde grunnleggende nyttige funksjoner (opplæring, medisinpåminnelse, delt kalender), og snittvurderingen var 2,7/5. Klagene gikk på tidsbruk, krav til teknisk kunnskap og innhold som ikke passet brukeren (JAGS-kommentar via Northwestern) **[kilde]**.
- Ensomhet blant eldre med dårlig psykisk helse: 75 % (2024, Univ. of Michigan via PYMNTS) **[kilde]**.
- Fall er den viktigste årsaken til skadedød hos personer over 65 år. Det mangler gode effektdata for fallapper **[lit.]**.

**Topp 5 udekkede behov**
1. Pårørende har ingen felles oversikt. Søsken, hjemmetjeneste og fastlege jobber i hver sin kanal.
2. Ingen får varsel om gradvis forfall: mindre mat, mindre bevegelse, endringer i søvn. Folk merker det først når noe har skjedd.
3. Teknologien krever at den eldre lærer noe nytt. Skjermer, passord og oppdateringer stenger dem ute.
4. Omsorgspersonens egen helse er ingen sin oppgave.
5. Ensomheten mellom besøkene: lange dager uten én samtale.

**Eksisterende løsninger og svakheter**
| Løsning | Svakhet |
|---|---|
| Trygghetsalarm (kommunal) | Reaktiv knapp. Ingen trend og ingen forebygging. Brukeren må bære den og huske å trykke. |
| Apple Watch fallvarsel | Dyr, krever iPhone og lading. Mange eldre slutter å bruke den. |
| CaringBridge / Lotsa Helping Hands | USA-orientert, tungt og laget for akutte kriser, ikke for omsorg over år. |
| Komp (No Isolation) | God på enveis deling, men gir lite data tilbake og koster abonnement. |
| Medisindispensere (Evondos, Pilly) | Løser medisiner, men ikke resten av hverdagen. Kommunal tildeling. |

**Underbrukt teknologi:** stemmegrensesnitt med LLM (ingen skjerm å lære), passive sensorer for strøm og bevegelse (trendanalyse heller enn alarm), og delte omsorgskalendere med AI-oppsummering.

---

## 2. Bipolar lidelse

**Bakgrunn**
- Søvnendring er blant de mest robuste tidlige varselsignalene for mani og hypomani **[lit.]**.
- Omtrent halvparten har perioder der de ikke følger medisineringen **[lit.]**.
- Taiwansk app for tilbakefallsvarsel (passiv GPS og seks selvrapporterte mål): brukerne hadde blandede erfaringer, og kostnad og barrierer styrte bruken (Lin & Chiou, *Eur Psychiatry* 2022) **[kilde]**.
- Forskning ved Nottingham på selvsporing med passiv og aktiv sensing: verktøyene mangler ofte kliniske retningslinjer og evidens (Majid, PhD) **[kilde]**.
- VA-studien NCT06204705 bruker maskinlæring på GPS for å forutsi mani og depresjon dager i forveien **[kilde]**. Et RADAR-basert passivt verktøy ble samprodusert med brukere (JMIR Form Res 2025) **[kilde]**.

**Topp 5 udekkede behov**
1. **Personlige** varselsignaler i stedet for generiske. Mitt varsel er «jeg sover 5 timer og føler meg genial», ikke en standardskala.
2. Et forhåndsavtalt handlingsløp når signalet slår ut: hvem ringes, hva gjøres, hvilke kort fryses.
3. Pårørende som kan se et signal uten å overvåke personen.
4. Datautdrag til psykiater som faktisk blir lest, på én side.
5. Beskyttelse mot impulsive kjøp og beslutninger i manisk fase.

**Eksisterende løsninger og svakheter**
| Løsning | Svakhet |
|---|---|
| eMoods | God logging og PDF, men ingen varsling og ingen kriseplan. |
| Daylio | Generell humørdagbok uten bipolar-logikk. |
| Bearable | Fleksibel, men overveldende. Brukeren må selv finne mønstrene. |
| MoodTools / Moodpath | Laget for depresjon og overser mani. |
| Forskningsapper (MONARCA, RADAR) | Ikke tilgjengelige for vanlige brukere. |

**Underbrukt teknologi:** regelbasert pluss enkel statistisk avviksdeteksjon på søvn og aktivitet, søvndata fra wearables, kriseplan som kode («hvis X i 2 døgn → gjør Y»), og forhåndssamtykke til økonomisperre.

---

## 3. Ensomhet

**Bakgrunn**
- WHO Commission on Social Connection (30.06.2025): omtrent én av seks i verden er ensom, og ensomhet knyttes til rundt 871 000 dødsfall i året (modellert). 17–21 % av 13–29-åringer er ensomme, og ungdom som er ensom får 22 % oftere svakere karakterer **[kilde]**.
- Opptil én av tre eldre og én av fire ungdommer er sosialt isolert **[kilde]**.

**Topp 5 udekkede behov**
1. Det er en terskel å ta første kontakt. Folk trenger strukturerte, lavrisiko-grunner til å møtes.
2. Gjentatt kontakt med de samme folkene. Engangsmøter bygger ikke vennskap.
3. Skam: «ensom» er et stigmatisert ord. Appene må ikke hete det.
4. Hjemmekontorarbeidere mister de svake båndene, småpraten ved kaffemaskinen.
5. Det mangler bro mellom generasjoner. Eldre og unge er ensomme hver for seg.

**Eksisterende løsninger og svakheter**
| Løsning | Svakhet |
|---|---|
| Meetup | Event-basert og engangspreget. Krevende for introverte. |
| Bumble BFF | Dating-mekanikk fører til swipe-tretthet. |
| Replika / AI-venner | Kan erstatte heller enn bygge bro til mennesker. Risiko for avhengighet. |
| Nabolagsgrupper (Facebook) | Støy og konflikt. Lite som skaper relasjon. |
| Frivillige besøkstjenester | Ventelister og avhengige av frivillige. |

**Underbrukt teknologi:** LLM som bro til mennesker (øving på samtaler og forslag til møter), ikke som erstatning. Faste gjentatte smågrupper styrt av algoritme. Hyperlokal matching med geofence.

---

## 4. Kronisk smerte og sorg (tolkning av «salmbod»)

**Bakgrunn**
- 2019-gjennomgang i JMIR mHealth: Curable var blant de beste på selvhåndteringsfunksjoner (8/14), men ingen av appene var testet på personer med vedvarende smerte **[kilde]**.
- Manage My Pain: engasjement og bedring i angst og katastrofetenkning, men mye av evidensen er leverandørrapportert **[kilde]**.
- «My Grief» (Uppsala): KBT-basert app med RCT på foreldre som har mistet barn og høy tilfredshet. mGAGE: 100 % etterlevelse de første to ukene i en liten pilot **[kilde]**.

**Topp 5 udekkede behov**
1. Det tar lang tid å forklare smerten for lege eller NAV. Det mangler strukturert dokumentasjon.
2. Smertefluktuasjoner skaper boom-bust: for mye på gode dager og kollaps etterpå (pacing).
3. Sorgstøtte etter at begravelsen er over, når alle andre har gått videre.
4. Praktisk etterlatt-logistikk: kontoer, abonnementer og papirer midt i sorgen.
5. Merkedager som treffer uforberedt (dødsdag, bursdag, jul).

**Eksisterende løsninger og svakheter**
| Løsning | Svakhet |
|---|---|
| Curable | Abonnement, mest lyd, og evidensen er uavklart. |
| Manage My Pain | God logging, men tung og klinisk. |
| Bearable | Generisk. |
| My Grief | Smal målgruppe (foreldre), forskningsapp. |
| Sorgstøttegrupper | Tidsfaste, geografiske og med høy terskel. |

**Underbrukt teknologi:** pacing-algoritmer basert på aktivitet og smerte, LLM som skriver legeoppsummeringer, og merkedagsmotor med forhåndsplanlagt støtte.

---

## 5. Dårlig privatøkonomi

**Bakgrunn**
- Gjeldsregisteret: rekordmange med forbruksgjeld, 3,43 mill. i mai 2024 (+240 000 på et år). Total forbruksgjeld var 176,3 mrd kr i mai 2026, drevet av kredittkort og avbetaling **[kilde]**.
- SSB: 7,1 % hadde minst ett betalingsproblem i 2025, mot 7,8 % i 2024. Usikret gjeld henger sammen med lav livstilfredshet, særlig hos unge **[kilde]**.
- Inkassoaktørene meldte om opptil 20 % flere saker (2025) **[kilde]**.

**Topp 5 udekkede behov**
1. Hjelp til å åpne posten. Unngåelse er den største driveren av gebyrer, og frykt gjør at brev blir liggende.
2. Kjøpsfriksjon for impulskjøp, særlig avbetaling og Klarna.
3. Én oversikt over all gjeld med en realistisk nedbetalingsrekkefølge.
4. Økonomisk kunnskap uten skam og uten finans-bro-stemme.
5. Kobling til gratis gjeldsrådgivning (NAV, kommunen) før det går til inkasso.

**Eksisterende løsninger og svakheter**
| Løsning | Svakhet |
|---|---|
| YNAB | Krevende metode og bratt læringskurve. Abonnement. |
| Bank-apper | Viser saldo, men styrer ikke adferd. Banken tjener på kreditten. |
| Spiir / Lunar-budsjett | Kategorisering uten handlingsplan. |
| NAV økonomirådgivning | God, men folk kommer for sent, ofte etter inkasso. |
| Gjeldsregisteret.com | Viser gjelden, men ingen plan. |

**Underbrukt teknologi:** LLM som oversetter inkassobrev til klarspråk med neste steg, open banking (PSD2) for automatisk friksjon, og gjeldssnøball/skred-kalkulator med emosjonell UX.

---

## Kryssmønster (det viktigste funnet)

Alle fem feltene har samme hull: **appene logger, men handler ikke.** Data samles, men ingen forhåndsavtalt plan slår inn når signalet kommer. Den største gevinsten ligger i *signal → plan → handling*, ikke i flere dagbøker.

## Kilder
- [Northwestern: Critical assessment of family caregiver support apps](https://breakthroughsforphysicians.nm.org/geriatrics-research-article-a-critical-assessment-of-family-caregiver-support-apps)
- [Stacker: 2026 caregiver burnout statistics](https://stacker.com/stories/parenting-family/2026-caregiver-burnout-statistics-how-stress-shows-family-caregiving)
- [PYMNTS: AI companion for aging Americans](https://www.pymnts.com/artificial-intelligence-2/2026/ai-is-becoming-the-new-companion-for-aging-americans/)
- [Lin & Chiou 2022, bipolar relapse warning app](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9566925/)
- [Majid, Nottingham eprints](https://eprints.nottingham.ac.uk/76071/)
- [NCT06204705](https://clinicaltrials.gov/study/NCT06204705)
- [JMIR Form Res 2025, RADAR passive mood tracking](https://pmc.ncbi.nlm.nih.gov/articles/PMC11845880/)
- [WHO Commission on Social Connection, oppsummering](https://www.som360.org/en/resources/loneliness-social-connection-charting-path-healthier-societies-report-who-commission-on)
- [Silicon Canals: WHO 1 in 6](https://siliconcanals.com/in-2025-the-world-health-organization-put-a-number-on-loneliness-and-it-was-grim-it-now-touches-about-one-in-six-people-on-earth/)
- [JMIR mHealth 2019, pain self-management apps](https://doaj.org/article/2d96ed4cd75c45d9b517c7718dfc2bd3)
- [Manage My Pain evidence](https://managinglife.com/evidence)
- [Uppsala: My Grief app](https://www.uu.se/en/press/press-releases/2024/2024-12-17-app-helps-alleviate-mental-health-symptoms-in-bereaved-parents)
- [mGAGE pilot](https://pmc.ncbi.nlm.nih.gov/articles/PMC8655571)
- [The Local: Norwegian consumer debt](https://www.thelocal.no/20250516/should-consumers-in-norway-be-worried-about-increased-debt)
- [The Local: 176,3 mrd mai 2026](https://www.thelocal.no/20260602/today-in-norway-a-roundup-of-the-latest-news-on-tuesday-240)
