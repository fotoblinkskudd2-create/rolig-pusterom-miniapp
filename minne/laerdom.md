# Lærdom på tvers av produkter

Hvert punkt er en regel som har gjort et design bedre. Les dem før hvert oppdrag. Legg til 1–3 nye
på slutten av hver kjøring, med produkt og dato. Slå sammen eller stryk regler som viser seg feil.

## Modell og optimalisering
1. **Fysisk konsistens først.** Optimaliseringen finner gjerne noe som er umulig å lage, for eksempel et skaft på 8–14 mm
   som ikke har plass til motor og batteri. Legg slike koblinger inn i `score()` eller `rydd()`. *(tannbørste, 2026-10-27)*
2. **Krav må holde også når modellen tar feil.** Kjør alltid en pessimistisk variant der den viktigste antakelsen
   er 20–40 % dårligere. Holder kravet bare i den optimistiske varianten, foreslå en variant som har margin,
   for eksempel 10,5″ i stedet for 10″. *(propell, 2026-10-27)*
3. **Finn ut hvor gevinsten kommer fra.** Fjern ett trekk av gangen. Da viser det seg ofte at én antakelse bærer
   alt, for eksempel at profilet ga hele gevinsten for propellen. *(propell)*
4. **Den intuitive løsningen er ofte feil.** En sløv kniv er farligere, ikke tryggere, fordi den sklir. Modeller selve
   mekanismen for skade og ikke bare egenskapen. *(barnekniv)*
5. **Det største tapet sitter ofte ett sted.** Kaffekoppen tapte 67 % av varmen i halsen. Del opp tapet før du optimaliserer. *(kaffekopp)*

## System og tjenester
6. **Arbeidsmåten slår teknologien.** I eldreomsorg ga endret arbeidsmåte (behovsstyrt tilsyn og kontakttid)
   10 ganger mer enn valg av sensor, og den japanske robotpakken ga minst livskvalitet per krone. *(Stille vakt)*
7. **Det frigjorte tas ofte ut som kutt.** Når teknologi sparer tid, må det modelleres hva tiden brukes til.
   Kutt i bemanningen fjernet om lag 30 % av livskvalitetsgevinsten. *(Stille vakt)*
8. **Det billigste tiltaket kan ha størst effekt.** Former for most mat og et oppdragsbibliotek slår roboter på effekt per krone. *(eldreomsorg-konsepter)*

## Prosess
9. **Se på hvert bilde du lager.** Deler som stikker ut, gale vinkler og overlappende tekst ble bare oppdaget slik.
10. **Påstander i markedsføring må skilles fra modell.** Ha en egen liste over påstander vi ikke kan bruke før de er testet.
11. **Lagre underveis.** Containeren kan starte på nytt, og `--oppdater` fullfører manglende steg.
