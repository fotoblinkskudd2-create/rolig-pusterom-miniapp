# Seks konsepter — fra prototype til radikal idé

Seks distinkte, tverrfaglige konsepter. Ingen av dem er ferdigvarer — de er tekniske og kunstneriske utgangspunkt, skrevet for noen som skal bygge videre.

---

## Steg 1 — Fra Idé til Prototype: NATTVAKT

**Problemet:** Bruksisme (nattlig tannpress/gnissing) rammer anslagsvis en av fem voksne. Standardløsningen — en passiv plastskinne fra tannlegen — beskytter tennene, men gjør ingenting med årsaken, som ofte er uregulert stressrespons i lett søvn. Skinnen er et dødt objekt: den registrerer ikke, lærer ikke, varsler ikke.

### 1. Konseptualisering
NATTVAKT er en biteskinne som måler trykk og frekvens i sanntid og responderer med et gradert, ikke-vekkende signal — en mikrovibrasjon i kjevebeinet — som bryter presseepisoden før den eskalerer, samme prinsipp som biofeedback-terapi for tinnitus. Kjernebehov: (a) beskytte tannemaljen mekanisk, som i dag, (b) samle et objektivt trykk/frekvens-datasett natt for natt, (c) gi kroppen et signal den kan lære av uten at brukeren våkner. Ingen dashboard-avhengighet, ingen varsler på dagtid — appen skal aldri konkurrere om oppmerksomhet, i tråd med at dette er et verktøy for søvn, ikke enda en skjerm.

### 2. Design & tegninger
Skinnen er termoformet i medisinsk silikon (Shore A 60, samme klasse som idrettsmunnvern), 1,4 mm i tykkelse over premolarene der belastningen er størst. Langs bittflaten er det støpt inn en piezoresistiv sensorfilm i tre soner (fortann, premolar, molar) koblet til en fleksibel PCB som løper ut mot kinnsiden, usynlig under normal munnstilling. En bone-conduction-aktuator på 3×3 mm sitter i skinnens ytterste hjørne, mot kjevevinkelen, og gir vibrasjonspulser i 180–220 Hz-området — under hørselsterskelen for de fleste ved lav intensitet, men tydelig følbar i beinvev. Strøm kommer fra en induktiv ladeplate (basestasjon på nattbordet) som skinnen legges i om dagen; ingen kabel går inn i munnen om natten. Basestasjonen er selve UI-et: ett lys som pulserer sakte grønt ("god natt bak deg") eller rolig gult ("aktiv natt, se trend"). Ingen app-varsler; data synkroniseres passivt over Bluetooth LE når skinnen lades, og trend vises kun hvis brukeren aktivt åpner appen.

### 3. Visualisering
Se for deg et makrofotografi tatt rett ovenfra, på matt, mørkegrå betong. Skinnen ligger halvåpen, som en avstøpning fanget midt i bevegelse. Silikonet er halvgjennomsiktig honningfarget med et anstrøk av kjølig blått der sensorfilmen skinner gjennom — de tre sonene tegner seg som svakt mørkere skygger under overflaten, som årer i bergkrystall. Lyset kommer lavt og skrått fra venstre, én eneste myk kilde, slik at kantene på tannavtrykkene kaster tynne linjeskygger og materialets mikroskopiske overflatetekstur (en svak, nesten porøs matthet fra formstøpingen) blir synlig. Den fleksible kretsen er en tynn gyllen tråd som forsvinner inn i silikonen ved kinntanngrensen — presist, nesten kirurgisk, ingen synlig lodding. I bakgrunnen, uskarpt, står basestasjonen: en lav, avrundet skive i børstet aluminium med ett enkelt lyspunkt, akkurat synlig nok til å gi skala — skinnen er på størrelse med en tommel bøyd i vinkel.

---

## Steg 2 — AI-Konsept: SLAKK

### 1. Navn og formål
**SLAKK** (fra norsk «slakk» — det motsatte av stram/anspent) er en kognitiv belastningsregulator: en agent hvis eneste jobb er å redusere antallet ganger et menneske må bryte konsentrasjon for noe som ikke fortjente det. Eksistensberettigelsen er ikke produktivitet, men bevaring av sammenhengende oppmerksomhet — SLAKK måler suksess i antall *ikke*-avbrutte tankerekker, ikke i oppgaver fullført.

### 2. Agent Skills
- **Avbruddstriage:** Klassifiserer hver innkommende hendelse (e-post, melding, kalenderinvitasjon, systemvarsel) langs to akser — reversibel/irreversibel konsekvens av forsinket respons, og hvorvidt et menneskelig skjønn faktisk kreves. Kun hendelser i kvadranten «irreversibel + krever skjønn» slipper gjennom umiddelbart.
- **Forhandling på vegne av bruker:** Kan selvstendig svare på lavrisiko-koordinering (møteflytting, tilgjengelighetsbekreftelse, purringer) ved å forhandle direkte med avsenderens agent via et delt intensjonsprotokoll-format (strukturert JSON-utveksling, ikke naturspråk-scraping), og logger alt for etterhåndsgjennomsyn.
- **Kronotype- og energimodellering:** Bygger en rullerende modell av brukerens kognitive kapasitet gjennom dagen fra passive signaler (skrivehastighet, appbytte-frekvens, kalendertetthet — aldri biometrisk overvåkning uten eksplisitt opt-in) og forskyver ikke-hastende varsler til lavintensitetsvinduer.
- **Eskaleringslogikk:** En eksplisitt, brukerredigerbar regelgraf (ikke skjult i vekter) avgjør hva som *alltid* går gjennom umiddelbart — helse, sikkerhet, navngitte personer — slik at brukeren aldri må stole blindt på modellens skjønn for det som faktisk haster.

### 3. Tekniske spesifikasjoner
Arkitekturen er topartsdelt: en liten, kvantisert lokal modell (≈2–4 mrd. parametere, kjører on-device) håndterer triage i under 200 ms per hendelse, mens en større skymodell kun kalles ved genuint tvetydige tilfeller — estimert til under 5 % av trafikken. Kontekstvinduet trenger ikke være stort i tradisjonell forstand; i stedet holder agenten et komprimert, viktighetsvektet rullerende minne på rundt 50 000–100 000 tokens som representerer «hva som er relevant akkurat nå», med eldre kontekst destillert til korte sammendrag snarere enn beholdt rått. Output er bevisst kort: en triage-avgjørelse er typisk under 50 tokens (kategori + ett-linjes begrunnelse), mens en forhandlingsutveksling med en annen agent er strukturert data, ikke fritekst. Personvern er arkitektonisk, ikke en tilleggsfunksjon: rådata forlater aldri enheten, kun destillerte, ikke-reidentifiserbare mønstre synkroniseres om brukeren aktiverer tverr-enhets-kontinuitet.

---

## Steg 3 — Kunstkonsept: PALEO-EKKO

### 1. Tema
Den emosjonelle kjernen er sorg over tid selv — ikke over et spesifikt tap, men over det faktum at mennesker lever på en tidsskala som er fullstendig uforenlig med den geologiske skalaen vi former irreversibelt (klima, utryddelse, sedimentavsetning). PALEO-EKKO stiller spørsmålet: kan et publikum føle konsekvensene av handlinger som utspiller seg over hundretusener av år, komprimert til minutter i et rom?

### 2. Mediekombinasjon
Fysisk installasjon: ekte sedimentkjerner (boret, lovlig anskaffet fra forskningssamarbeid) støpt inn i klare resinsøyler, hver merket med et geologisk tidsvindu. Kjernene henger i et mørkt rom og er utstyrt med trykksensorer i gulvet rundt hver søyle. Generativ video: en modell trent på fossildata og sedimentlag-kjemi «hallusinerer» utdødde arter og landskap som tilhørte hvert lag — projisert direkte inn i og gjennom resinen, slik at bildene ser ut til å bevege seg inne i steinen selv. Statiske bilder: langtidseksponerte makrofotografier av selve kjerneflatene, trykt på transparent velur-papir og hengt fysisk foran skjermene, slik at digital projeksjon og fysisk fotografi lag-på-lag skaper dybde. Tekstlig narrativ: fiktive feltdagbok-fragmenter fra en geolog, projisert i tynn, nesten uleselig skrift langs søylenes kant — leselig kun på nært hold, i et tempo som tvinger besøkende til å senke farten fysisk.

### 3. Opplevelse
Besøkendes bevegelse i rommet styrer «avsetningshastigheten» i videoen — stillstand ved en søyle får det hallusinerte laget til å bygge seg sakte, detaljert, nesten geologisk sakte; rask bevegelse forbi får hele epoker til å komprimeres og glimte forbi på under et sekund, en direkte kroppslig metafor for hvor lite tid menneskelig utålmodighet gir naturen til å tilpasse seg. En separat stasjon lar besøkende hviske en setning inn i en mikrofon; stemmen pitches ned og strekkes over flere minutter, og legges inn som et nytt, permanent lag i rommets ambiente lydbilde for resten av utstillingsperioden — hver besøkende etterlater bokstavelig talt et sedimentlag av lyd som de neste besøkende hører, men aldri kan identifisere som menneskelig tale.

---

## Steg 4 — Nye musikkstiler

### 4.1 Glacial Dub
**Teoretisk fundament:** Fusjon av dub reggae (rom, ekko, mikset som instrument) med drone/ambient og infralyd-opptak av faktiske isbrekalvinger — brefronter som knekker og faller, tidsstrukket og tonalt sentrert rundt de naturlige subharmonene i opptaket. Delay-tidene er ikke faste musikalske verdier, men synkronisert til reelle kalvingshendelsers etterklangstid (ofte 8–40 sekunder), slik at ekkoet føles geofysisk snarere enn produsert.
**Rytmikk og tonalitet:** 30–45 BPM, ren intonasjon (just intonation) fremfor tempererte skalaer for å unngå den kunstige spenningen i vestlig harmonikk. Bass ligger delvis under hørselsterskelen (25–40 Hz), «hørt» som trykk i brystet snarere enn tone. Atmosfæren er ikke avslappende i konvensjonell forstand — den er tung, med en underliggende uro fra bevisstheten om hva lydkilden faktisk representerer.

### 4.2 Algo-Hardingfele (Circuit Hardanger)
**Teoretisk fundament:** Norsk hardingfele-tradisjon — med sine understrenger som resonerer sympatisk og aldri spilles direkte — kobles til et modulært synth-system der understrengenes resonansmønster (fanget med piezo-mikrofoner) driver generativ, mikrotonal algoritmisk syntese live. Fela styrer altså en digital tvilling av seg selv i sanntid; instrumentet blir en biofeedback-sløyfe mellom akustisk tradisjon og algoritme.
**Rytmikk og tonalitet:** Bygger på springar-tradisjonens asymmetriske taktarter (ofte notert 3/4, men med ujevn varighet på hvert slag — kort-lang-lang eller lang-kort-lang), krysset med IDM-glitch-estetikk der algoritmen bevisst destabiliserer taktens forutsigbarhet ytterligere etter noen gjentakelser. Tonalt ligger stykkene i skjæringspunktet mellom hardingfelas naturlige, litt «skjeve» stemming og mikrotonal syntetisk harmonikk — verken rent folkemusikalsk eller rent elektronisk, men en tredje ting.

---

## Steg 5 — Høyverdi research

**1. Kontinuerlig læring uten katastrofal glemsel (vektromkonsolidering).**
Etter hvert som agenter og personaliserte modeller forventes å akkumulere erfaring over måneder og år uten fullstendig omtrening, blir evnen til å lære nytt uten å ødelegge gammel kompetanse den reelle flaskehalsen for agent-minne-infrastruktur — ikke rå modellstørrelse. Den aktøren som løser dette billig og robust, eier et lag i stacken alle agentplattformer må bygge på. Høy ROI fordi kostnaden i dag (full omtrening/fine-tuning per oppdatering) skalerer dårlig, og fordi løsningen er infrastruktur, ikke et enkeltprodukt — den selges én gang og brukes av alle over den.

**2. Syntetisk biologi for lukkede, karbonnegative materialsykluser.**
Programmerbare, myceliumbaserte og bakterielt syntetiserte biokompositter som erstatter petrokjemisk plast, med innebygd, tidsstyrt nedbrytning. Reguleringsvinduet åpner seg nå (EU-plastdirektiver, forsyningskjede-press), og konvergensen mellom materialvitenskap og klimapolitikk skaper en sjelden situasjon der teknisk modenhet og politisk vilje møtes samtidig. Høy ROI fordi first-movers setter standarder og patentlandskap før feltet konsolideres, og fordi materialer — i motsetning til programvare — har fysiske byttekostnader som låser markedsposisjon i tiår.

**3. Nevro-symbolske grensesnitt for å måle kognitiv avlastning (skill atrophy).**
Etter hvert som AI-assistanse blir allestedsnærværende, oppstår et udekket behov for å kvantifisere hvilke menneskelige ferdigheter som faktisk forvitrer ved konstant AI-støtte, og hvor grensen går mellom sunn avlastning og skadelig avhengighet. Dette blir uunngåelig et regulatorisk og utdanningspolitisk spørsmål innen 5–10 år. Høy ROI fordi den som definerer målemetodikken først, definerer standarden resten av feltet (skoleverk, sertifiseringsorganer, arbeidsgivere) må forholde seg til — en posisjon med enorm lisensierings- og normsettende verdi, langt utover selve forskningen.

---

## Steg 6 — Den «Sjette Sans»: SYMBIONT-C

Et biologisk gjennombrudd som tar «pusterommet» i denne appens navn og flytter det fra skjerm til kropp: en konstruert, kommensal tarmbakteriestamme som kolonialiserer tarmveggen og bærer et quorum-sensing-krets-system trent til å detektere lokale markører for kortisol og lavgradig inflammasjon — kroppens egne, kontinuerlige signaler på stress — og som, ved terskeloverskridelse, syntetiserer en kalibrert, kortvarig GABA-analog forløper på stedet.

Dette er ikke en pille man tar når man merker stress; det er en biologisk regulator som virker *før* stresset blir bevisst, fordi den leser de samme kjemiske signalene hjernen selv bruker, men lokalt og langt raskere enn et system som må gjennom munn–mage–blod–hjerne. En following ingesterbar mikrosensor (samme klasse som eksisterende medisinske kapselsensorer) logger aktiveringsfrekvens eksternt, slik at bæreren — eller en klinisk oppfølger — kan se mønsteret uten å måtte stole blindt på en usynlig prosess.

Det radikale er ikke syntesen i seg selv, men designprinsippet: en eksplisitt, innebygd reversibilitet. Stammen bærer et kill-switch-gen aktivert av et navngitt, ellers ubrukt antibiotikum — ett enkelt kurs fjerner kolonien fullstendig. Dette gjør SYMBIONT-C til det første forslaget i dette dokumentet som eksplisitt designer *angrefunksjonen* inn i selve biologien, ikke som en app-innstilling, men som en genetisk kontrakt bæreren alltid kan si opp.

---

*Seks konsepter, seks fagfelt, ett gjennomgående prinsipp: verktøy og systemer som griper inn minst mulig, og bare når det faktisk trengs.*
