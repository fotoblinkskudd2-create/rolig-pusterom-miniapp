# Stille Verksted: plan for en multiagent-drevet design- og oppfinnerbedrift

Status: utkast 1. Alle tall er hypoteser til de er testet. Kodegrunnlaget ligger i `multiagent/`.

---

## 1. Sammendrag og anbefaling

Stille Verksted lager små, stille produkter for folk som er slitne, isolerte eller overbelastet. Hvert produkt skal være lokal-først, uten skjerm der det går an, og uten innsamling av biometriske eller personlige data.

**Anbefaling i korte trekk:**

1. **Start med «Små grep»-kortstokken.** Den er billigst å lage, raskest å teste og har lavest risiko. Den skårer høyest i simuleringen (8,31), men den er ikke den sterkeste konkurransemessige posisjonen. Den finansierer læring og bygger merkevare.
2. **Gjør «Pust-lampen» til flaggskipet.** Den har den tydeligste forsvarbare posisjonen: ingen skjerm, ingen sensor, ingen konto. Det siste er det nærmeste konkurrenten ikke kan si. Den skårer 7,40, nesten likt med neste idé, så den må bevises med prototype før verktøy kjøpes inn.
3. **Parker «Klinikk-enheten».** Den skårer 7,84, men skåren er kunstig hevet. Å fjerne helsespråket endrer ikke at enheten håndterer pasientdata. Den krever juridisk vurdering før noe annet arbeid.
4. **Hold «Pausekontor-kit» som B2B-spor etter piloter.** Skåren (7,37) er praktisk talt lik Pust-lampen, og den er avhengig av salg til arbeidsgivere, som er en lengre salgssyklus.

Gate-kriteriene for hvert steg finnes i seksjon 7.

---

## 2. Selskapskonsept

**Visjon:** Verktøy som gjør rommet rolig, ikke mer av alt.

**Kjerneprinsipper (regler agentene må følge):**

| # | Prinsipp | Hvorfor |
|---|---|---|
| P1 | Lokal-først. Data forlater ikke enheten. | Samme tillitsgrunnlag som Rolig-appen i repoet. |
| P2 | Ingen biometri og ingen helsepåstander. | Det holder produktet utenfor de strengeste reglene for helsedata. |
| P3 | Fysisk før digitalt der det gir ro. | Skjerm er det som stresser. |
| P4 | Ingen abonnement som gisler fra første dag. | Tillit først, inntekt senere. |
| P5 | Ingen kopi av det som finnes. Hver idé må ha minst tre særtrekk. | Oppgaven er originalitet, ikke en billigere variant. |

---

## 3. Multiagent-arkitektur

### 3.1 Agentene

Hver agent har én ekspertise, én dimensjon den eier og én type innvending den kan reise. I dag er agentene regelbaserte og gjennomsiktige (`multiagent/agents.py`). Samme grensesnitt kan senere brukes av LLM-baserte agenter, uten å endre orkestreringen.

| Agent | Ekspertise | Eier dimensjon | Typisk innvending | Foreslår endring |
|---|---|---|---|---|
| Ideegenerator | Kreativ idéutvikling | Kreativitet | Mettet kategori, færre enn tre særtrekk | «differensier» |
| Industridesigner | Form, enkelhet, ro | Kreativitet | For mange komponenter, skjerm i lampe | «forenkle» |
| Tekniker | Komponenter, leverandører, utvikling | Gjennomførbarhet | Lav tilgjengelighet, over 6 mnd | «kutt_scope», «bytt_komponent» |
| Produktleder | Tid til første test | Gjennomførbarhet | Ingen test med brukere før om lang tid | «kutt_scope» |
| Markedsanalytiker | Segment, konkurranse | Marked | Uklart segment, mange konkurrenter | «nisjeskifte» |
| Forretningsstrateg | Margin, skalering, gjentakende inntekt | Kommersiell | Margin under 50 % | «prisjustering» |
| Rødt lag | Juridisk og etisk risiko | Risiko | Helsepåstander, helsedata | «fjern_helseløfte» |

Rødt lag er kritikeren. Den har ingen oppgave om å være hyggelig, og den har rett til å stoppe en idé i prosessen.

### 3.2 Kommunikasjon

- **Blackboard:** Alle agenter leser samme idé og samme vurdering. De skriver ikke direkte til hverandre.
- **Kryss-kritikk:** Hver agent kan foreslå én endring. Endringen tas bare hvis den gir målbar forbedring (minimum +0,05 i totalskåre).
- **Avveininger:** Hver endring har en pris som er synlig i logget. Kutt i scope gir mindre segment. Nisjeskifte gir mindre adresserbart marked. Uten dette vil systemet optimalisere seg til en tom idé.

### 3.3 Prosess (fem faser, itereres)

1. **Divergens.** Ideegenerator produserer minst fem idéer per tema. Ingen vurdering i denne fasen.
2. **Kritikk.** Alle agenter vurderer alle idéene uavhengig av hverandre. Rødt lag leser alt før videre arbeid.
3. **Konvergens.** Turnering etter vektet totalskåre. Bare topp to til tre går videre.
4. **Forbedring.** Revisjonsløkken fra `orchestrator.improve`: svakeste agent foreslår først, endringen beholdes bare ved målbar gevinst.
5. **Feltprøve.** Det som ikke kan testes med ekte mennesker, er ikke ferdig. Resultatene fra feltprøvene mates tilbake som nye tall i modellen.

Stoppkriterier: maks fem runder per idé, og stopp når ingen endring gir minst +0,05.

---

## 4. Vurderingsrammeverk

| Dimensjon | Vekt | Hva den måler | Hovedkilde til skåre |
|---|---|---|---|
| Kreativitet | 20 % | Skiller idéen seg fra kategorien? | Antall særtrekk, konkurrenter, form |
| Teknisk gjennomførbarhet | 25 % | Kan vi bygge det, og raskt? | Utviklingstid, komponenttilgang |
| Markedspotensial | 25 % | Finnes det kjøpere som bryr seg? | Segmenthypotese, konkurranse |
| Kommersiell verdi | 20 % | Blir det lønnsomt? | Bruttomargin, gjentakende inntekt, skalering |
| Risiko | 10 % | Hva kan gå galt juridisk og etisk? | Helsepåstander, helsedata |

**Skåreskala:** 0–10. Totalskåre er vektet snitt.

**Begrensning:** Vektene er et valg. De bør justeres etter hva selskapet faktisk vil optimalisere. Hvis dere heller vil ha inntekt tidlig, øk kommersiell-vekten.

---

## 5. Markedsanalyse

### 5.1 Størrelse og trend

Markedsestimatene for meditasjons- og pusteapper spriker mye:

- Towards Healthcare anslår 2,24 mrd USD i 2025, med prognose 8,83 mrd USD i 2035 ([kilde](https://www.towardshealthcare.com/insights/meditation-management-apps-market-sizing)).
- Market.us anslår 2,1 mrd USD i 2025 og 8,7 mrd USD i 2035 ([kilde](https://market.us/report/meditation-management-apps-market/)).
- Enkelte rapporter oppgir vekstrater på 21 % eller 55 % i året. Disse må behandles med forsiktighet.

Det er ikke gjort en egen verifisering av metodikken i rapportene. Bruk sentralområdet 2–2,5 mrd USD i 2025 som utgangspunkt, og ikke enkelttall.

**Viktig:** Markedet for apper er ikke markedet vårt. Vi selger fysiske objekter til en mindre, mer kjøpssterk gruppe. Egen størrelse må estimeres bottom-up: antall målgruppe × kjøpssannsynlighet × pris.

### 5.2 Konkurranselandskap for fysiske pustenheter

- **Ohm Resonance Lamp** (Ohm Health, Richmond): glasslampe som kombinerer lys, lyd og vibrasjon med pusting. Den bruker en PPG-sensor og akselerometer til å måle hjerterytmevariabilitet. Den er et direkte konkurrerende produkt i kategorien, men den samler biometriske data. ([kilde](https://richmondbizsense.com/2025/12/24/richmond-startup-ohm-health-launches-first-product-a-humming-glowing-breathing-lamp/), [kilde](https://athletechnews.com/wellness-startup-ohm-launches-resonance-lamp))
- **Moksha** (gamifisert pustedevice): kom på Kickstarter med over 400 forhåndsbestillinger, senere egen nettside. Pris rundt 150 USD. Abonnement på 8 USD i måneden. ([kilde](https://techcrunch.com/2024/09/21/moksha-gamified-meditation-device/))
- **Alveos One** (clip-on pustemonitor): over 70 000 USD på Kickstarter på under en uke i februar 2026. Viser at det finnes betalingsvilje for pusteprodukter. ([kilde](https://startupmap.iamsterdam.com/news/feed/alveos-one-raises-70k-in-under-a-week-for-ai-powered-breath-monitoring-wearable))
- **Lavpris-lamper** under 20 USD, for eksempel «Breathing Owl» og lignende. Dette setter prisgulvet for ren lampe.

**Innsikt:** Kategorien har to tydelige ender. Den ene er billige nyhetslamper, og den andre er premium biofeedback med sensorer. Ingen av dem tilbyr det vi vil tilby, nemlig en stille, ikke-målende lampe til midt-pris. Pust-lampen må posisjoneres som et alternativ til biofeedback, og ikke som en billigere kopi av den.

### 5.3 Forhold til regelverk

- Helsedata: Artikkel 29-gruppen har vist at data fra wellness- og livsstilsapper kan regnes som helsedata i enkelte tilfeller. ([kilde](https://www.hunton.com/privacy-and-cybersecurity-law-blog/article-29-working-party-clarifies-scope-health-data-processed-lifestyle-wellbeing-apps))
- Samtykke til helseopplysninger i Norge må være eksplisitt. Passivitet kan ikke være gyldig samtykke. ([kilde](https://www.helsedirektoratet.no/normen/formal-og-behandlingsgrunnlag-faktaark-56/alminnelig-behandlingsgrunnlag/samtykke))
- Designregel: Ingen sensor, ingen konto og ingen helsepåstander. Da faller de fleste krav utenfor. Dette må likevel bekreftes av jurist før lansering, særlig for enheter som brukes i helsetjenesten.

---

## 6. Idéene og resultatene

Simuleringen ble kjørt med `python3 -m multiagent`. Full rapport: `multiagent/rapport.md`.

| # | Idé | Start | Slutt | Kreativ | Gjennomf. | Marked | Kommersiell | Risiko |
|---|---|---|---|---|---|---|---|---|
| 1 | Små grep-kortstokken | 7,74 | **8,31** | 8,1 | 10,0 | 4,8 | 10,0 | 10,0 |
| 2 | Lokal sjekk-inn-enhet (klinikk) | 5,88 | **7,84** | 7,6 | 7,5 | 7,2 | 9,9 | 6,5 |
| 3 | Pust-lampen | 6,90 | **7,40** | 7,5 | 8,8 | 5,5 | 8,4 | 6,5 |
| 4 | Pausekontor-kit | 6,89 | **7,37** | 8,1 | 6,0 | 5,0 | 10,0 | 10,0 |

### 6.1 Tolkning av resultatene

- **Kortstokken vinner på kostnad og risiko, ikke på markedet.** Den har 15 oppgitte konkurrenter og det svakeste markedstallet. Den er et godt første produkt, men ikke et bærekraftig forsvar.
- **Klinikk-enheten er overvurdert.** Den fikk skåre etter at helsespråket ble fjernet. Men Rødt lag beholdt risikoen på 1 etter endringen, og den faktiske bruken (pasientdata i helsetjenesten) er uendret. Skåren skal ikke tas som et tegn på at idéen er god.
- **Pust-lampen og Pausekontor-kit er praktisk talt likeverdige (0,03 forskjell).** Den forskjellen er innenfor usikkerheten i modellen. Valget mellom dem må avgjøres av feltdata, ikke av simuleringen.
- **Pust-lampen har et særtrekk ingen andre har i denne listen:** ingen biometri. Det gir den lavere risiko enn Ohm Resonance Lamp uten å miste fysisk form.

### 6.2 Hva som er endret etter markedssøket

Ved første kjøring var Pust-lampen rangert lavere, fordi konkurransen var undervurdert. Etter søket ble antall konkurrenter satt til 9, og særtrekket «ingen biometri» ble lagt til. Det er et eksempel på at simuleringen er så god som antakelsene den får. Alle endringer er dokumentert i `multiagent/seeds.py`.

---

## 7. Anbefalt plan: 90 dager med porter

**Fase 0 (uke 1–3): Verifiser segmentet.**
- 20 intervjuer med målgruppen (slitne, isolerte, overbelastede voksne). Fokus på hva de faktisk gjør i stressøyeblikk, ikke hva de ønsker.
- Landingsside med to varianter (kortstokk og lampe). Mål konvertering til e-postliste.
- Juridisk vurdering av helsedata og helsepåstander. Dette er en forutsetning, ikke et tillegg.
- *Port:* minst 20 intervjuer gjennomført og klart svar på hvilken idé folk vil ha. Hvis ingen av idéene får interesse, revurderes segmentet før noe annet.

**Fase 1 (uke 4–8): Test med objekter.**
- Kortstokk: 30–50 eksemplarer produsert i liten serie. Salg via forhåndsbestilling.
- Pust-lampen: breadboard-prototype med 10 testere i to uker. Dagbok, ikke spørreskjema.
- Prisintervju for begge (Van Westendorp eller tilsvarende). Testet pris mot modellens antakelse på 990 kr.
- *Port:* minst 50 forhåndsbestillinger på kortstokken, og minst 7 av 10 testere bruker lampen i ukes-to. Hvis ikke, justeres eller stoppes idéen.

**Fase 2 (uke 9–13): Velg flaggskip og bygg videre.**
- Hvis porten for lampen er passert: bygg industriell prototype og kjør feltprøve med sikkerhetstesting.
- Hvis ikke: bruk det samme arbeidet på neste idé i turneringen (Pausekontor-kit), og oppdater antakelsene.
- Pilotavtale med én arbeidsplass for Pausekontor-kit, kun hvis Fase 1 gir et klart signal.

**Hva vi ikke gjør nå:** Ingen klinikk-enhet, ingen sky-tjenester, ingen abonnement, ingen ekstern kapital før porten for lampen er passert.

---

## 8. Risiko og åpne spørsmål

| Risiko | Sannsynlighet | Konsekvens | Tiltak |
|---|---|---|---|
| Ohm eller andre kopierer «ingen biometri» | Middels | Høy | Bygg merkevare på stillhet og tillit, ikke på en enkelt funksjon. Hold kostnaden lav. |
| Helsepåstander glir inn i markedsføring | Middels | Høy | Språkregler i designsystemet. Juridisk gjennomgang av alle tekster før publisering. |
| Kortstokken blir en lavmargin-gavebutikk | Høy | Middels | Bruk den til å bygge e-postliste og merkevare, ikke som hovedinntekt. |
| Produksjonskostnad for lampe blir høyere enn 380 kr | Middels | Høy | Få prisoffert fra leverandør før Fase 2. Kabinett i tre kan bli dyrt i små serier. |
| Modellen overtilpasses antakelsene | Høy | Middels | Oppdater tallene med feltdata etter hver port. Ikke bruk skåren alene. |

**Åpne spørsmål for dere:**
1. Hvem er den primære kjøperen: den som trenger ro selv, eller arbeidsgiveren?
2. Skal selskapet ha egen produksjon, eller bruke kontraktprodusent fra start?
3. Er det akseptabelt at første inntekt kommer fra kortstokk, som har lav margin per enhet?

---

## 9. Hvordan kjøre systemet

```bash
# Kjør turneringen og skriv ut rapporten
python3 -m multiagent

# Skriv rapport til fil
python3 -m multiagent --out multiagent/rapport.md

# Kjør tester
python3 -m unittest multiagent.test_system -v
```

**Utvidelser:**
- Bytt ut en agent med en LLM-basert versjon: implementer `assess(idea) -> Assessment` og gi den en `dimension`.
- Legg til nye idéer i `multiagent/seeds.py`. Alle tall skal kildebelegges eller markeres som hypotese.
- Legg til nye endringer i `multiagent/revision.py`. Hver endring må ha en pris.
