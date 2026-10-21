# Dag 05 — Strømhalsbåndet: smerte med fjernkontroll

> Han står i lysløypa med en liten svart dings i hånda og tommelen på knappen. Hunden hans er 30 meter unna, ser på et rådyr. Klikk. Hunden hyler, krøker seg, ser seg rundt – hvor kom det fra? Mannen smiler fornøyd. «Han lærer.» Ja. Han lærer at verden kan bite ham fra løse luften. Det er ikke trening. Det er en skrekkfilm.

## Hva det er
Elektronisk treningshalsbånd (e-collar, «shock collar») som gir elektrisk støt, vibrasjon eller lyd via fjernkontroll – eller automatisk ved bjeffing (anti-bjeffe-halsbånd) eller når hunden krysser en usynlig grense.

## Sporet
| Felt | Verdi |
|---|---|
| Patentspor | CPC `A01K 15/021` (elektroniske treningsapparater for hund/katt) – tusenvis av patenter. Søk «remote training collar stimulus». |
| Hovedstudie | Cooper JJ et al. *The welfare consequences and efficacy of training pet dogs with remote electronic training collars in comparison to reward based training.* PLOS ONE 2014;9(9):e102722 (finansiert av britiske DEFRA) |
| Funn | E-halsbånd ga **ikke bedre** resultat enn belønningsbasert trening, og hundene viste flere tegn på stress. |
| Eldre studie | Schilder MBH, van der Borg JAM. *Training dogs with help of the shock collar: short and long term behavioural effects.* Appl Anim Behav Sci 2004 |
| Forbud | Wales (2010), Nederland (2020), England (forbud fra 1. feb. 2024). Flere andre europeiske land har forbud. **Norge: sjekk dyrevelferdsloven og Mattilsynets veiledning selv** *(verifiser – jeg fant ikke primærkilden)*. |

## Hvorfor det er dårlig
1. **Timing er nesten umulig.** Straff må komme innen ~1 sekund for å kobles til riktig handling. Mennesker bommer konstant.
2. **Hunden kobler smerten til feil ting** – til rådyret, til barnet som kom gående, til en annen hund → aggresjon og frykt.
3. **Lærer hunden hva den *ikke* skal gjøre, aldri hva den *skal* gjøre.**
4. **Automatiske bjeffe-halsbånd** kan utløses av andre hunders bjeff eller av hundens egne lyder ved smerte.
5. **Usynlige gjerder** stopper ikke andre dyr fra å komme *inn*, men straffer hunden for å forsvare seg eller flykte.

## Rotårsaken
Eieren har et kommunikasjonsproblem på avstand («hvordan får jeg hunden til å komme når den er langt unna?»). Produktet løser det med det billigste signalet som finnes: smerte.

## Tre nye løsninger
1. **Belønning på avstand** – fjernstyrt godbitautomat på hunden eller i hånda; hunden lærer at innkalling = jackpot.
2. **Varsling til eieren, ikke straff til hunden** – GPS-geogjerde som piper i *eierens* telefon, ikke i hundens nakke.
3. **Positivt markeringssignal** (lyd/vibrasjon som *kun* er koblet til belønning – en trådløs «klikker» i halsbåndet).

## Konsept: **KOM** – halsbånd for positiv innkalling på avstand
| Spesifikasjon | Verdi |
|---|---|
| Signal | Kort melodisk tone + mild vibrasjon. **Fysisk umulig å gi støt** (ingen elektroder, kun vibramotor + høyttaler) |
| Rekkevidde | 400 m (LoRa) + GPS via app |
| Belønning | Tilkoblet «godbit-bag» på eierens belte som avfyrer en godbit når hunden kommer innen 2 m (BLE-nærhet) |
| Treningsprogram | App med 14-dagers progresjon: tone = belønning (dag 1–3), tone på 5 m, 20 m, 50 m, med forstyrrelser |
| Geogjerde | Varsler eieren; hundesignalet er alltid innkalling, aldri straff |
| Batteri | 5 dager, USB-C, IP67 |
| Vekt | < 60 g |

## Konseptbilde-prompt
```
Pet tech product render, minimal soft-touch dog collar with small rounded module (no metal prongs), matching belt-worn treat dispenser pouch with a glowing ring, smartphone app screen showing recall training progress and GPS map, outdoor Norwegian forest trail background softly blurred, warm orange and charcoal palette, friendly and trustworthy
```

## Dagens oppgave
- [ ] Les sammendraget og diskusjonen i Cooper et al. 2014.
- [ ] Finn ut hva Mattilsynet og dyrevelferdsloven faktisk sier om strømhalsbånd i Norge. Skriv paragrafen ned med lenke.
- [ ] Test «tone = jackpot» med en hund du kjenner i 10 minutter (fløyte + godbit). Hvor mange repetisjoner før hunden snur seg mot lyden?

**Grav videre:** CPC `A01K 15/021`. Søk «positive reinforcement remote treat» – hvor få patenter finnes det sammenlignet med «stimulus»?
