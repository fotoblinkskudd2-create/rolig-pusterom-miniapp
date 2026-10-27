# 00 Brief – «Stille vakt»: japansk-inspirert eldreomsorg for norske sykehjem og hjemmetjeneste

Kjørt automatisk (headless) 2026-10-27. Ingen spørsmål stilt. Antakelsene er skrevet under.
Merking: `[kilde]` · `[modell]` · `[antakelse]` · `[målt]` (ingen målinger finnes ennå).

## Mål i én setning
Finne og designe **ett** system av teknologi, hjelpemidler og arbeidsmåte som gir eldre i sykehjem og
hjemmetjeneste mest mulig livskvalitet per krone, og som flytter pleietid fra rutinekontroller til menneskelig kontakt.
Kameraovervåking uten samtykke er utelukket.

## Målgruppe
- **Primær:** beboere på langtidsplass i sykehjem. Om lag 80 % har demens, og de fleste mangler samtykkekompetanse for teknologitiltak `[kilde: Husebø/COSMOS; Hdir]`.
- **Sekundær:** hjemmeboende med nattlig tilsyn fra hjemmetjenesten (fallrisiko, demens).
- **Kjøper:** kommunen (helse- og omsorgssjef, virksomhetsleder sykehjem).
- **Brukere av systemet:** nattevakter, sykepleiere, helsefagarbeidere, sykehjemslege.
- **Interessenter:** pårørende, verger, personvernombud, Statsforvalteren (tilsyn med vedtak).

## Jobben systemet gjør
1. Lar beboeren **sove uforstyrret** og fjerner rutinerunden med lommelykt hver 2. time. Tilsyn skjer når sensoren viser behov.
2. **Fanger smerte** hos personer med demens, som ikke kan si fra, gjennom fast MOBID-2-kartlegging og et ukentlig «mimamori-team».
3. **Reduserer fall og skade** ved sengekanten med varsel, rav gulvlys og individuell fallplan.
4. **Gir verdighet på toalettet** med vaske-tørke-toalett for dem som kan bli selvhjulpne.
5. **Flytter frigjort tid** til planlagt 1:1-kontakt («mitt kvarter») på kveld og dag.

## Harde krav (tall)
| # | Krav | Grense |
|---|---|---|
| K1 | Ingen kamera og ingen mikrofon på noen beboer uten eget, informert samtykke | 0 kamera i standardvarianten |
| K2 | Livskvalitet | ≥ 3 QALY per 100 beboere per år (mid), > 0 i pessimistisk scenario |
| K3 | Kostnadseffekt for samfunnet | ICER ≤ 275 000 kr/QALY også i pessimistisk scenario `[kilde: Meld. St. 34 (2015–2016), laveste alvorlighetsgrad]` |
| K4 | Netto kost for kommunen | ≤ 13 000 kr per beboer per år (≈ 1 % av driftskost per plass) `[antakelse]` |
| K5 | Fall | ≤ 3,0 per 1000 beboerdøgn (−20 % fra 3,75) og hoftebrudd −25 % |
| K6 | Pleietid | ≥ 15 t frigjort per beboer-år, og ≥ 50 % av den brukt til kontakt (≥ 3 min per beboer per døgn) |
| K7 | Alarmtretthet | ≤ 1 falsk alarm per beboer per uke (0,14 per natt) |
| K8 | Jus | DPIA (GDPR art. 35) før oppstart. Samtykke eller vedtak etter pbrl. § 4-6a. Tiltaket stoppes ved motstand (ellers hol. kap. 9). Dataminimering |
| K9 | Kantmodul (fysisk hjelpemiddel) | ≥ 90 døgn mellom lading · gulvlys 5–15 lux, ≤ 2200 K · ingen kabel på gulvet · IPX4 · tåler desinfeksjon · beboer kan ikke åpne batteriluken |

## Myke ønsker
- Bruke japanske løsninger der de gir mest per krone, ikke fordi de er høyteknologiske.
- Passe inn i eksisterende pasientvarsling, journal (EPJ) og nasjonale rammeavtaler (Hepro/KS).
- Kunne skaleres til hjemmetjenesten med samme utstyr.
- Lite synlig utstyr og ingen «robotfølelse» på rommet.

## Budsjett og prismål
- Utstyr ≤ 10 000 kr per seng (engangs) og ≤ 2 000 kr per seng per år i lisens og drift `[antakelse]`.
- Pilot (100 beboere + evaluering) ≤ 5 MNOK over 18 måneder, delvis finansiert med statlig tilskudd `[antakelse]`.

## Antakelser gjort (headless)
1. Enheten er **100 beboere i ett år**. Dagens praksis er fast nattrunde hver 2. time, ingen sensorer og ingen strukturert smertekartlegging.
2. Fall: 1,37 per beboer-år, og 2,1 % av fallene gir hoftebrudd `[kilde: tysk langtidsstudie, 1367 fall og 29 hoftebrudd per 1000 beboer-år]`. Norske tall kan være lavere eller høyere.
3. 35 % av fallene skjer når beboeren reiser seg fra sengen, og 15 % på vei til eller på toalettet `[antakelse]`.
4. Nattlig frigjort tid kan bare delvis flyttes til dag og kveld via turnus: **75 %** `[antakelse]`.
5. QALY-vekter for søvn, kontakt, smerte og verdighet er antakelser forankret i studier (se `problem.py`). **Disse er den største usikkerheten.**
6. Timekost for pleier er 550 kr inkl. sosiale kostnader og natt-tillegg `[antakelse]`. Gevinstrealisering for tid som tas ut som kutt er 70 % `[antakelse]`.
7. Kalkulasjonsrente 4 %, levetid 5 år (annuitet 0,2246).
8. Ca. 25 % av sykehjemsbeboerne har samtykkekompetanse for kamera `[antakelse]`. Kamera er bare et alternativ for dem.
9. Hjemmetjenesten modelleres som 100 brukere som i dag får 2 nattbesøk per natt à 20 min inkl. reise `[antakelse]`. Dette er en gunstig gruppe for systemet, ikke et snitt av alle hjemmetjenestebrukere.
10. Produktet markedsføres **ikke** som medisinsk utstyr. Smerte vurderes av mennesker med MOBID-2, ikke av algoritmen. Derfor gjelder ikke MDR klasse IIa `[antakelse, må bekreftes av DMP]`.

## Utenfor scope
- Utvikling av egen pasientvarsling eller EPJ (vi integrerer med eksisterende).
- Medisinsk diagnostikk fra sensordata (MDR). Det kan bli en senere versjon.
- Bemanningsnormer og lønn. Arbeidstidsavtaler må forhandles lokalt.
- Kamera og AI-video, også med samtykke. Alternativet er modellert og forkastet.
- Utvikling av ny forflytningsrobot. RIBA og ROBEAR er ikke kommersielt tilgjengelige.
