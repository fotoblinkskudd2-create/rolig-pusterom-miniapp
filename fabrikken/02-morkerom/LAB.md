# LAB — produkt 02

> Grok-bot runtime. /lab. Klasse M. PROBLEM: Isolasjon. DNA: fototerapi + passiv mekanikk + 48t. Seed 7. Drepe minst 3. IRP på overlevende #1.

Det står i din egen Isolation Mirror, linje 62. Jeg har bare kjørt prompten du skrev.

Stafett er ferdig, og klokka er 15:55 UTC. Kroppen min er en container og har ikke spist. Ut vinduet: ingenting, for jeg har ikke vindu. Det har du. Fjorden som fryser. Og hele poenget med neste produkt er at du skal se på den i stedet for på skjermen.

**Ett ord først.** «Fototerapi» betyr lysbehandling i norsk helsespråk (UV, lysbokser). Det du mener, heter på fagspråket *terapeutisk fotografi* (Judy Weiser skiller mellom «PhotoTherapy», som ledes av en terapeut, og «therapeutic photography», som du gjør selv; hun sammenligner det med vitaminer mot reseptmedisin. [Weiser, *Arteterapia* 2014](https://doaj.org/article/bd9d6d68dc0f4b0797d8179f681210d7)). Jeg bruker *terapeutisk fotografi*, så ingen tror vi selger en lysboks.

## Seed 7

| # | Frø | Én setning |
|---|-----|------------|
| 1 | **Mørkerom** | Kamera uten skjerm. Hvert bilde ligger i mørket i 48 t før det fremkalles på en liten e-blekk-rute bak. Ett oppdrag om dagen. |
| 2 | **Vindusvakt** | Kamera fast i vinduet, ett bilde i timen av fjorden, ukentlig tidsforløp: verden fortsetter. |
| 3 | **Brevdue** | Kamera som sender ett bilde til én valgt person etter 48 t. Mot isolasjon. |
| 4 | **Speilet 2** | Isolation Mirror som maskinvare: speil med kamera og spørsmål. |
| 5 | **Kontaktark** | Termoskriver som skriver ut ukas bilder som ett kontaktark. |
| 6 | **Lysbord** | 10 000 lux-lampe for vintermørket. |
| 7 | **Rull** | App-only: 24 bilder per rull, 48 t fremkalling, i Pusterom. |

## Drap

**#3 Brevdue: DREPT.** Å sende krever nett og en mottaker, og da er vi tilbake i sky, konto og ventetid på svar som ikke kommer. For et isolert hode er det verste du kan bygge en knapp som sender noe ut i stillheten og så *ingenting*. HYPOTESE, men jeg tar ikke sjansen.

**#4 Speilet 2: DREPT.** Et kamera som ser på *deg* er feil retning. Terapeutisk fotografi handler om å se ut, ikke inn i et speil som dømmer.

**#6 Lysbord: DREPT.** Det er ekte fototerapi, og den er godt dokumentert mot vinterdepresjon. Men markedet er fullt av billige lysbokser, det er en medisinsk påstand, og det er ikke ditt DNA. Ikke vårt bord.

**#5 Kontaktark: SLÅTT SAMMEN med #1** som eksport: kontaktark som bilde på telefonen.

**#7 Rull: SLÅTT SAMMEN med #1** som fremtidig gratisversjon. Gudak gjorde det i 2017 (24 bilder, 72 t). En app kan ikke stoppe deg fra å se på bildene i kamerarullen. Et kamera uten skjerm *kan* det.

**#2 Vindusvakt: OVERLEVER, venter.** Vakker og helt passiv. Kandidat til produkt 03.

**#1 Mørkerom: OVERLEVER #1.**

## IRP — Mørkerom

**I: Idé (≤3 setningar, nynorsk):**
Mørkerom er eit lite kamera utan skjerm: du ser gjennom eit glasvindauge, trykkjer, og biletet forsvinn inn i mørkret i 48 timar. Når det er framkalla, kjem det fram som eit grovkorna e-blekkbilete på baksida, og den fulle versjonen kan hentast til telefonen over lokalt nett. Kvar morgon står det eitt oppdrag på ruta: «noko som er varmt».

**R: Risiko:**

| Risiko | Merking | Tiltak |
|---|---|---|
| Helsepåstand («hjelper mot isolasjon») uten kilde | — | Vi påstår ingenting. Brewster & Cox (2019, *Health*) fant at foto-hver-dag virket som egenomsorg hos deltakerne, men det er en liten kvalitativ studie, ikke en kontrollert studie. DOKUMENTERT som det den er. |
| Bilder kommer på avveie hvis kameraet mistes | HYPOTESE | Bilder krypteres med AES-256 på minnekortet. Nøkkelen bor i ESP32-ens eFuse/NVS. Kortet alene er ubrukelig. |
| Mørket føles som straff («hvorfor får jeg ikke se?») | HYPOTESE | Ingen sperre er absolutt: «Fremkall nå» finnes bak et hold-i-10-sekunder, og den teller. Passiv mekanikk, ikke fengsel. |
| Bildene blir dårlige (billig sensor) | DOKUMENTERT at OV-sensorer er middels | Det er en *egenskap*: vi gjengir dem som 1-bit e-blekk, korn er stemning. Fullversjonen er fortsatt der. |
| Camp Snap finnes til $69 | DOKUMENTERT | Camp Snap har ingen fremkalling, ingen oppdrag, ingen e-blekk og ingen kryptering. Vi konkurrerer ikke på pris. |

**P: Prototyp:** samme metode som Stafett. Kjerne i C++ testet på vertsmaskin (rull, fremkallingsklokke, oppdrag, dithering, kryptering, lagring), skjermsimulator, telefon-UI, e2e, CAD, firmware som kompilerer, økonomi, marked, HULL.

Stopp. Ikke nytt OS.
