# 2. FEM FORSKNINGSPROSJEKTER MED EKSTREMT HØY VERDI

> Kriterium som drepte 40 kandidater før disse fem overlevde: *Kan én person med en laptop, AI og åpne data faktisk gjøre dette — og ville en ledende forsker i feltet bli overrasket over svaret?*
> Ingen «analyser sentiment på Twitter». Ingen «tren en modell på MNIST». Bare prosjekter der dataene allerede ligger der og venter, og ingen har stilt det riktige spørsmålet ennå.

**Rangert etter forholdet verdi / gjennomførbarhet:**

| # | Prosjekt | Felt | Data | Hovedrisiko |
|---|---|---|---|---|
| 2.1 | **Konkursnettverket** | Økonomi / kriminologi / nettverksvitenskap | Brønnøysundregistrene (åpne API-er) | Personvern, feiltolkning |
| 2.2 | **Statistisk obduksjon** | Metaforskning | PubMed Central OA + Retraction Watch-databasen (åpen via Crossref) | Uttrekkskvalitet |
| 2.3 | **Kvikkleire fra verdensrommet** | Geofag / samfunnssikkerhet | InSAR Norge + NVEs skreddata | Fysikken kan si nei |
| 2.4 | **Skammens semantikk** | Digital humaniora / sosialhistorie | Nasjonalbibliotekets korpus (DH-lab) | Tolkning, tilgang |
| 2.5 | **Kuldeaktive peptider mot Listeria** | Mikrobiologi / beregningsbiologi | MGnify, AMPSphere, UniProt | Krever våtlab-partner |

---

## 2.1 KONKURSNETTVERKET
### Kartlegging av seriekonkurs som et nettverksfenomen i norsk næringsliv

**Forskningsspørsmål**
Er seriekonkurser i Norge konsentrert i et lite antall *nettverk* av personer og roller (styreleder, daglig leder, revisor, regnskapsfører, aksjonærer), og kan nettverksstrukturen forutsi nye konkurser og tap for staten og arbeidstakere — før de skjer?

**Original hypotese [S]**
1. En liten andel av rolleinnehavere (< 1 %) står bak en uforholdsmessig stor andel av konkursene med størst udekkede krav — en tung hale som ikke vises når man teller *personer*, men blir synlig når man teller *nettverk*.
2. Nettverkene har en gjenkjennelig *signatur* som kan oppdages tidlig: rask rolle-rotasjon, nye selskaper registrert i samme adresse/regnskapsfører før det gamle går konkurs, samme NACE-bransje (bygg, renhold, transport, servering), og aksjekapital på minimumsnivå.
3. Konkurskarantene (konkursloven § 142 **[F]**) treffer personene, men ikke nettverket — derfor «flytter» aktiviteten seg til stråmenn i samme klynge.

**Metodikk**
1. **Datainnhenting:** Hele Enhetsregisteret (bulk-nedlasting, åpne data **[F]**), roller per enhet (Brreg roller-API **[F]**), konkursstatus (`konkurs`, `underAvvikling` er felter i Enhetsregisteret **[F]**), kunngjøringer, og regnskapstall der tilgjengelig.
2. **Grafbygging:** Bipartitt graf person ↔ selskap, projisert til person–person (felles selskap) og selskap–selskap (felles personer, adresse, regnskapsfører).
3. **Entitetsoppløsning:** Personer identifiseres i rolle-data med navn og fødselsdato **[A: verifiser hva som eksponeres åpent]**. AI brukes til å løse tvetydighet.
4. **Analyse:**
   - Fordeling av konkurser per person og per klynge (Lorenz-kurve, Gini).
   - Fellesskapsdeteksjon (Leiden-algoritmen).
   - Overlevelsesanalyse (Cox-modell / gradient boosting) for å predikere konkurs innen 24 mnd basert på nettverksegenskaper — sammenlignet med en baseline uten nettverksvariabler. **Kjerneresultatet er differansen.**
   - Tidsserie: Endret konkurskarantenepraksis atferden?
5. **Validering:** Sammenlign med offentlige dommer om konkurskarantene og økonomisk kriminalitet.

**Verktøy:** Python, DuckDB, NetworkX/igraph, `leidenalg`, lifelines/scikit-survival, LLM for entitetsoppløsning og klassifisering av kunngjøringstekst.

**Gjennomførbarhet:** Høy. Data er åpne og strukturerte. Én person, 3–4 måneder til første resultat.

**Etikk og risiko:**
- Publiser **aggregerte** funn og metodikk. Ikke publiser «svartelister» over enkeltpersoner — det er både etisk og juridisk problematisk (GDPR, ærekrenkelse).
- Prediktiv modell må vurderes for skjevhet (f.eks. bransjer med mange innvandrereide småbedrifter).

**Ny kunnskap og verdi:**
- **Vitenskapelig:** Første nettverkskartlegging av seriekonkurs i et helt land med full populasjon **[A: må verifiseres mot litteratur, f.eks. arbeid fra Skatteetaten, Økokrim, NHH]**.
- **Samfunn:** Grunnlag for målrettet tilsyn (Skatteetaten, Arbeidstilsynet), bedre utforming av karantenereglene.
- **Kommersielt:** Risikoscore for leverandører/kreditorer (B2B SaaS), journalistisk verktøy.

---

## 2.2 STATISTISK OBDUKSJON
### Kan matematisk umulige tall i publiserte artikler forutsi tilbaketrekking?

**Forskningsspørsmål**
Hvor stor andel av publiserte artikler i biomedisin og psykologi inneholder rapporterte tall som er *matematisk umulige* — og kan en tetthet av slike umuligheter forutsi senere tilbaketrekking?

**Bakgrunn [F]**
- **GRIM-testen** (Brown & Heathers, 2017) sjekker om et gjennomsnitt av heltallsdata er mulig gitt utvalgsstørrelsen.
- **SPRITE** rekonstruerer mulige datasett fra gjennomsnitt og standardavvik.
- **statcheck** (Nuijten mfl., 2016) fant at omtrent halvparten av psykologiartikler i utvalget hadde minst én inkonsistent p-verdi, og omtrent 1 av 8 hadde en grov inkonsistens som kunne endre konklusjonen.
- **Retraction Watch-databasen** ble kjøpt av Crossref og gjort åpent tilgjengelig i 2023.

**Hull i kunnskapen [A]:** Disse testene har vært begrenset av at tallene måtte trekkes ut manuelt eller med regex fra et smalt format (APA). Moderne språkmodeller kan trekke ut tabeller og deskriptiv statistikk fra fritekst og tabeller *i alle formater*. Det åpner for en skala ingen har kjørt.

**Original hypotese [S]**
Tetthet av matematisk umulige tall (GRIM/GRIMMER/SPRITE-inkonsistenser + p-verdi-inkonsistens) per artikkel er en sterkere prediktor for senere tilbaketrekking enn tidsskriftets impact-faktor, forfatterantall og felt — og effekten er sterkest for tilbaketrekking grunnet *fabrikkering*, ikke ærlige feil.

**Metodikk**
1. **Korpus:** PubMed Central Open Access-delsett (fulltekst XML **[F]**). Stratifisert utvalg: ~50 000 artikler i psykologi, ernæring, onkologi, anestesi.
2. **Uttrekk:** LLM trekker ut (n, gjennomsnitt, SD, testobservator, frihetsgrader, p) fra tekst og tabeller til strukturert JSON. **Validering:** 1 000 artikler håndkodes; mål precision/recall for uttrekket.
3. **Tester:** Kjør GRIM, GRIMMER, statcheck-logikk, og grenseverdi-sjekker (f.eks. umulig SD gitt skala-grenser).
4. **Kobling:** DOI → Retraction Watch-databasen (tilbaketrekking + årsak).
5. **Analyse:** Kasus–kontroll-design: tilbaketrukne artikler vs. matchede kontroller (tidsskrift, år, felt). Logistisk regresjon / overlevelsesanalyse.
6. **Falske positiver:** Avrundingskonvensjoner, likert-skalaer med flere items (GRIM gjelder ikke direkte), skrivefeil i tabeller. Dette må modelleres eksplisitt — ellers blir prosjektet en maskin som anklager ærlige forskere.

**Verktøy:** Python, LLM-API med strukturert output, `statcheck`-logikk reimplementert, egne GRIM/GRIMMER-funksjoner, R/Python for statistikk.

**Kostnad [A]:** 50 000 artikler × noen kroner per uttrekk = sannsynligvis noen titusen kroner i API-kostnad. Kan skaleres ned til 5 000 for pilot.

**Gjennomførbarhet:** Høy. Ingen våtlab, ingen tilgangsproblemer.

**Ny kunnskap:**
- Første storskala estimat av forekomsten av matematisk umulige tall på tvers av felt med LLM-uttrekk **[A: sjekk litteraturen 2024–2026 grundig — feltet beveger seg raskt]**.
- Et åpent verktøy (`obduksjon.py`) som tidsskrifter kan kjøre *før* publisering.
- **Kommersielt:** Forlag betaler for integritetsverktøy (markedet for «research integrity»-verktøy vokser **[A]**).

---

## 2.3 KVIKKLEIRE FRA VERDENSROMMET
### Finnes det målbare forvarsler før kvikkleireskred i satellittdata?

**Forskningsspørsmål**
Viser satellittbasert radarinterferometri (InSAR) systematisk bakkedeformasjon i månedene/årene før kvikkleireskred i Norge — og kan en modell skille slike signaler fra normal setning?

**Bakgrunn [F]**
- Gjerdrum-skredet 30. desember 2020 tok 11 liv. Det skjedde i et område med kvikkleire.
- **InSAR Norge** (NGU, NVE, Norsk Romsenter, lansert 2018) gir fritt tilgjengelige bevegelsesdata fra Sentinel-1 for hele landet.
- NVE har åpne kart over kvikkleiresoner og en nasjonal skreddatabase.

**Ærlig utgangspunkt [A]:** Kvikkleireskred utløses ofte av erosjon i bekkeløp, menneskelige inngrep (fylling, graving) eller progressiv brudd-mekanisme, og kan gå svært raskt. Det er *ikke* gitt at det finnes målbare forvarsler i InSAR-data med 6–12 dagers revisitt og millimeteroppløsning. **Et negativt svar er også et viktig resultat** — det forteller hvor overvåkingsressurser *ikke* bør brukes.

**Original hypotese [S]**
I en delmengde av kvikkleireskred (særlig retrogressive skred utløst av erosjon) finnes det et svakt, akselererende deformasjonssignal i InSAR-punkter nær skredkanten i ukene–månedene før, som skiller seg statistisk fra sesongvariasjon og konsolideringssetning i samme sone.

**Metodikk**
1. **Hendelser:** Alle registrerte kvikkleireskred i Norge etter 2015 (Sentinel-1-æra) fra NVEs skreddatabase.
2. **Kontroller:** Tilfeldige punkter i kvikkleiresoner uten skred, matchet på jordart, helning, avstand til vassdrag.
3. **Tidsserier:** InSAR-punktmålinger innenfor buffer (f.eks. 50–500 m) rundt utløsningsområdet.
4. **Analyse:**
   - Akselerasjonsdeteksjon (inverse-velocity-metoden, kjent fra skredvarsling i fjell **[F]**).
   - Change-point-analyse (Bayesian online changepoint detection).
   - Klassifisering skred vs. kontroll (gradient boosting / tidsserie-transformer), med streng *tidsbasert* kryssvalidering for å unngå lekkasje.
5. **Kontrollvariabler:** Nedbør og snøsmelting (MET Frost API, seNorge), grunnvann der tilgjengelig.
6. **Fysisk tolkning:** Samarbeid med en geotekniker for å vurdere om signalene gir fysisk mening.

**Verktøy:** Python, xarray, `ruptures`/BOCPD, scikit-learn, QGIS/GeoPandas. InSAR-data lastes fra InSAR Norge-tjenesten **[A: sjekk API/nedlastingsvilkår]**.

**Gjennomførbarhet:** Middels. Datamengden er håndterbar. Den store risikoen er at antall hendelser med god InSAR-dekning er lite (n kan bli < 50).

**Ny kunnskap og verdi:**
- Svar på et konkret, livsviktig spørsmål med åpne data.
- Hvis positivt: grunnlag for et automatisert varslingslag på toppen av InSAR Norge.
- Hvis negativt: dokumentasjon av grensene for satellittovervåking av kvikkleire — og argument for andre metoder (f.eks. bekkeerosjon-overvåking).

---

## 2.4 SKAMMENS SEMANTIKK
### Hvordan norsk offentlighet har snakket om gjeld, fattigdom og psykisk sykdom 1850–2025

**Forskningsspørsmål**
Hvordan har den moralske ladningen i norsk avisspråk om gjeld, fattigdom og psykisk sykdom endret seg over 175 år — og *går endringer i språket foran eller etter* lovendringer (f.eks. gjeldsordningsloven 1992, psykisk helsevernloven, NAV-reformen 2006)?

**Original hypotese [S]**
1. Moralisering av gjeld («ødsel», «lettsindig», «skyld») har ikke sunket lineært, men har en **U-form**: lav i perioder med kollektive kriser (1930-tallet, bankkrisen rundt 1990), høy i oppgangstider — og har økt igjen etter 2010 i takt med forbrukslån og «bare-ta-deg-sammen»-diskurs.
2. Språklige skifter *kommer før* lovendringer med 3–8 år — det vil si at språket er en målbar tidlig indikator på politisk endring.

**Metodikk**
1. **Korpus:** Nasjonalbibliotekets digitaliserte aviser og bøker via DH-lab-verktøyene (`dhlab`-pakken for Python **[F]**), som gir konkordanser, kollokasjoner og frekvenser uten at man trenger full tekst av opphavsrettsbeskyttet materiale.
2. **Målebegreper:**
   - **Moraliseringsindeks:** andel kollokater rundt nøkkelord (gjeld, fattig, trygd, nerver/psykisk syk) som tilhører et validert moral-leksikon (utvikles på norsk, med LLM-assistert ekspansjon og manuell validering).
   - **Agens:** blir personen omtalt som aktør («han satte seg i gjeld») eller offer for strukturer («rammet av rentehopp»)? Klassifiseres med LLM på konkordanslinjer.
   - **Diakrone embeddinger** per tiår (aligned Word2Vec eller kontekstuelle embeddinger) — hvordan flytter «gjeld» seg i semantisk rom relativt til «skam», «uflaks», «system»?
3. **Kausalitetsgranskning:** Granger-tester og hendelsesstudier rundt lovendringer (med tydelige forbehold — dette er ikke kausal identifikasjon).
4. **Validering:** Historikere vurderer stikkprøver. Interrater-reliabilitet mellom LLM og menneske.

**Verktøy:** Python, `dhlab`, gensim, LLM for klassifisering, R/Python for tidsserier.

**Gjennomførbarhet:** Middels–høy. NB-korpuset er blant verdens mest komplette nasjonale korpus **[F: NB har digitalisert det meste av norsk trykt materiale]**. Tilgangsvilkår må sjekkes for hvert uttrekk.

**Ny kunnskap og verdi:**
- En kvantitativ sosialhistorie om skam — publiserbar i digital humaniora, sosiologi, historie.
- **Formidling:** Perfekt råstoff for SoMe-konseptene (kap. 4) og for bok/podkast.
- **Politisk:** En «moraliseringsmåler» som kan følges år for år.

---

## 2.5 KULDEAKTIVE PEPTIDER MOT LISTERIA
### AI-søk etter antimikrobielle peptider i polare mikrobiomer — rettet mot et konkret norsk problem

**Problemet [F]**
*Listeria monocytogenes* vokser ved kjøleskapstemperatur og er et kjent problem i kald røkt/gravet fisk og i fiskeforedlingsanlegg. Listeriose har høy dødelighet hos sårbare grupper.

**Bakgrunn [F]**
- Maskinlæring har de siste årene blitt brukt til å lete etter antimikrobielle peptider (AMP) i proteomer og metagenomer i stor skala (bl.a. de la Fuente-laboratoriet; AMPSphere-katalogen, Santos-Júnior mfl., *Cell* 2024).
- Polare og marine mikrobiomer er tilgjengelige i MGnify og andre åpne databaser.

**Hull [A]:** De store AMP-søkene optimaliserer generelt for aktivitet ved standard laboratorietemperatur (~37 °C). Lite er gjort for systematisk å søke etter peptider som er *aktive ved 0–4 °C* — som er nøyaktig der Listeria-problemet lever.

**Original hypotese [S]**
Mikroorganismer fra permanente kuldemiljøer (havis, polar sjøbunn, isbre-smeltevann) koder for AMP-er med fysikalsk-kjemiske egenskaper (f.eks. lavere hydrofobisitet, mer fleksible strukturer) som gir bedre aktivitet mot Listeria ved kjøletemperatur enn kjente AMP-er — og disse egenskapene kan læres og predikeres.

**Metodikk**
1. **Kandidatgenerering:** Hent små åpne leserammer (smORF) fra polare metagenomer (MGnify) og AMPSphere-kandidater med polar opprinnelse.
2. **Filtrering med AI:** Proteinspråkmodell-embeddinger (ESM-2) + klassifikatorer for AMP-sannsynlighet, toksisitet (hemolyse), stabilitet.
3. **Kuldeegenskaper:** Tren en modell som skiller proteiner fra psykrofile vs. mesofile organismer (merket data fra UniProt etter vertsorganismens optimale veksttemperatur) — bruk den som en *kulde-score*.
4. **Rangering:** Pareto-front over (AMP-sannsynlighet, kulde-score, lav toksisitet, syntetiserbarhet).
5. **Våtlab-validering:** 20–50 peptider syntetiseres (kommersiell peptidsyntese) og testes mot *Listeria* (ufarlig surrogat som *Listeria innocua* i første runde) ved 4 °C og 37 °C. MIC-bestemmelse.
   - **Dette krever partner** (universitet, Nofima, NMBU) med BSL-2-lab.

**Kostnad [A]:** Beregning: lav (GPU-timer i sky, noen tusen kroner). Peptidsyntese: typisk noen hundre til et par tusen kroner per peptid avhengig av lengde og renhet — 30 peptider kan koste ~50 000–100 000 kr. Labtid hos partner.

**Gjennomførbarhet:** Beregningsdelen: høy. Hele prosjektet: middels — avhenger av partner.

**Ny kunnskap og verdi:**
- En ny dimensjon (temperatur) i AMP-søk — publiserbart selv om få kandidater virker.
- **Kommersielt:** Biokonservering i sjømatindustrien er et reelt marked. Peptider med bekreftet effekt kan patenteres (sammensetning + anvendelse).
- **Samfunn:** Færre listeriautbrudd; potensielt mindre bruk av andre konserveringsmidler.

---

## Hva som ble forkastet (og hvorfor)

| Kandidat | Hvorfor ikke |
|---|---|
| «Omvendt farmakovigilans» i FDA FAERS (legemidler som *reduserer* rapporterte symptomer) | Rapporteringsskjevhet så stor at resultater blir nesten umulige å tolke uten registerdata |
| Tidlig psykose fra språk i sosiale medier | Etisk minefelt, data utilgjengelig etter API-stengninger |
| Tareskog-kartlegging fra Sentinel-2 | Tare er under vann — optisk satellitt ser dårlig i nordlige farvann; eksisterende arbeid fra NIVA |
| Klarna-bruk og psykisk helse | Ingen åpne individdata |
