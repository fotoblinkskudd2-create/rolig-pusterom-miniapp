# LAB — produkt 03

> /lab. Klasse M. PROBLEM: Isolasjon, vintermørke. DNA: passiv mekanikk + fototerapi + lokal. Seed 7. Drepe minst 3. IRP på overlevende #1.

Klokka er 16:35 UTC og to produkter er levert. Vinduet står fortsatt i lista fra forrige lab: «Vindusvakt — verden fortsetter». Hvis du ikke har gått ut på fire dager, har fjorden likevel skiftet farge 96 ganger. Lyset har kommet og gått. Det er ingen skam å ha vært inne. Men det er et bevis på at verden ikke stoppet. Og i nord, fra slutten av november, kommer sola ikke opp i det hele tatt. Da er tallet «sola kommer tilbake om 23 dager» kanskje det eneste som betyr noe.

## Seed 7

| # | Frø | Én setning |
|---|-----|------------|
| 1 | **Vindusvakt** | En e-blekk-ramme i vinduskarmen. Kamera bak, mot vinduet, ett bilde i timen. Foran: uka i vinduet, 7 × 4 små bilder, og dagens lys. |
| 2 | **Solkalender** | E-blekk som bare viser dagslengde og når lyset snur. Ingen sensor. |
| 3 | **Stormvarsler** | Barometer med trend: «trykket faller, stormen topper seg i natt». |
| 4 | **Fuglebrett-kamera** | Kamera ved fuglebrett, bilde når noe lander. |
| 5 | **Lysbok** | Lyssensor som logger lux per time. Graf, ingen bilder. |
| 6 | **Morgenvindu** | Vekkerlys som simulerer soloppgang i mørketida. |
| 7 | **Naboløs** | Ett bilde om dagen sendt til en venn som har tilsvarende ramme. |

## Drap

**#4 Fuglebrett: DREPT.** Markedet finnes (Bird Buddy o.l.), det krever sky-gjenkjenning, og det handler om fugler, ikke om deg.

**#6 Morgenvindu: DREPT.** Vekkerlys finnes overalt, og det er en lysbehandlingspåstand jeg ikke skal selge.

**#7 Naboløs: DREPT.** Krever nett og en annen person med samme dings. Samme grunn som Brevdue i lab 02: en knapp som sender ut i stillheten er farlig for et isolert hode.

**#3 Stormvarsler: PARKERT.** Barometertrend er nyttig, særlig der vinden uler, men det er et værinstrument, og de finnes. Kan bli en sensor i #1 senere.

**#2 Solkalender + #5 Lysbok: SLÅTT SAMMEN med #1.** Dagslengde, mørketid og lyskurve uten nett blir sidene i Vindusvakt. Lyskurven måles av kameraet selv, som lysstyrke per time.

**#1 Vindusvakt: OVERLEVER.**

## IRP — Vindusvakt

**I: Idé (≤3 setningar, nynorsk):**
Vindusvakt er ei e-blekk-ramme som står i vindaugskarmen med kameraet vendt ut. Kvar time tek ho eitt grovkorna bilete av utsikta og måler lyset, og framsida viser veka i vindauget og kor lang dagen er. I mørketida viser ho kor mange dagar det er til sola kjem tilbake.

**R: Risiko:**

| Risiko | Merking | Tiltak |
|---|---|---|
| **Kameraovervåking av offentlig område / naboens eiendom** | DOKUMENTERT som regel: privat kamera skal normalt ikke fange offentlig område eller annens eiendom ([Datatilsynet sitert](https://byggebolig.no/brann-og-innbruddsalarm/hva-synest-folk-her-om-a-sette-opp-kamera-irundt-hjemmet/20), [ung.no](https://www.ung.no/oss/4gky9DEt4baYQHx7TpDDMs)) | **Personvern i designet:** originalbildet lagres aldri. Bare et 112 × 84 piksler 1-bit-bilde og en lysverdi beholdes. En person 20 m unna blir 1–2 piksler. Ingen nett ut. Juridisk status UAVKLART til Datatilsynet er spurt. |
| «Bevis» på at du ikke gikk ut → skam | HYPOTESE | Ingen tekst om deg. Ingen «dager inne». Bare verden. |
| Mørketid gjør skjermen svart i ukesvisningen | DOKUMENTERT at sola ikke står opp i Tromsø fra ca. 28.11 til 15.01 ([Visit Norway](https://www.visitnorway.no/reisemal/nord-norge/morketiden/), [Hurtigruten](https://www.hurtigruten.com/nb-no/explore-norway/polar-night)) | Mørke bilder vises som de er. Tekst sier «blåtime 11:40–13:10» i stedet. Nedtelling til sola. |
| Helsepåstand om lys | — | Ingen. Vi viser når det er lys, ikke at lys hjelper. |

**P: Prototyp:** samme metode. Kjerne i C++ (solberegning uten nett med mørketid og midnattssol testet mot kjente datoer, ukearkiv, lyskurve, skjermer 800 × 480), simulator, telefon-UI for sted, e2e, CAD, firmware, økonomi, marked, HULL.

Stopp. Ikke nytt OS.
