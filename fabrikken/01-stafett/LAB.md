# LAB — produkt 01

> Grok-bot runtime. /lab. Klasse M. Seed 7. Drepe minst 3. IRP på overlevende #1.

Klokka er 15:04 UTC, tirsdag 20. oktober 2026, og jeg sitter i en container som blir revet når du lukker lokket. Ingen fjord her. Bare en tom `fabrikken/`-mappe og et repo som allerede vet hva du vil ha: **lokal-first, ingen sky, ingen konto, ingen marketplace, 48 timer, passiv mekanikk, fototerapi.** Det står i Isolation Mirror-prompten din. Det står i HULL.md. Du har skrevet det samme kravet fire ganger på fire forskjellige måter. Jeg tar det som lov.

Det jeg vet om problemet, fra deg (i profilen og i repoet):

- En del tar over kl 14. Kjøper Lego på Klarna. Neste del våkner med pakker på døra og bank-appen som eneste vitne.
- 250k gjeld. Renter som tikker.
- Isolasjon. Vind som uler.
- Påstander skal merkes DOKUMENTERT / BEREGNET / HYPOTESE / MOTBEVIST / UAVKLART. Helsepåstander trenger kilde.

Problemet er ikke at du mangler en budsjett-app. Det finnes hundre. **Problemet er at budsjett-appen antar at det er én person som bruker den.**

---

## Seed 7

| # | Frø | Én setning |
|---|-----|------------|
| 1 | **Stafett** | E-ink-tavle på pulten som viser hva forrige del gjorde: siste note, tid, kjøp, og hva som ligger i 48-timers kjølerom. |
| 2 | **Kortlåsen** | En NFC-hylse rundt bankkortet som «låser» kjøp i 48 timer. |
| 3 | **Rentebomba** | En fysisk teller som viser renta tikke i kroner per sekund. |
| 4 | **Kodak-stempel** | Nettleser-utvidelse som tvinger merking av påstander før du deler noe. |
| 5 | **Mørkerom** | Kamera uten skjerm. Bildene «fremkalles» først etter 48 timer. Fototerapi med passiv mekanikk. |
| 6 | **Morfarhånda** | Tungt jordingsobjekt med haptisk hjerteslag for dissosiasjon og panikk. |
| 7 | **Pakkevakt** | Sensor på døra/postkassa som logger pakker og kobler dem til kjøpslogg. |

## Drap

**#2 Kortlåsen — DREPT.** Teater. En NFC-hylse kan ikke stoppe et Klarna-kjøp på nett; kortnummeret er lagret i nettleseren lenge før hylsa kommer i nærheten. Et produkt som lover kontroll det ikke har, er verre enn ingenting: det gir skam når det feiler. (HYPOTESE, ikke kildesjekket her: Klarna-kjøp på nett trenger ikke det fysiske kortet i det hele tatt.)

**#3 Rentebomba — DREPT.** Skam-maskin. Den gjør gjelda til en sirene på pulten for en hjerne som allerede har alarm nok. HYPOTESE: synlig, konstant trussel øker unngåelse, og da åpner man ikke inkassobrevet. Tallet beholdes, men det går inn i #1 som en *plan* («neste forfall: 28. okt, 1 412 kr»), ikke som en bombe.

**#4 Kodak-stempel — DREPT (for nå).** Godt verktøy, men det er et verktøy for deg-som-redaktør, ikke for deg-som-system. Ingen CAD, ingen hardware, og løser ikke problemet over. Parkert.

**#6 Morfarhånda — DREPT.** Markedet er fullt av vektede objekter og haptiske «calm»-dingser, og jeg kan ikke kildebelegge en helseeffekt jeg ville måtte love for å selge den. Helsepåstand uten kilde = ikke lov.

**#7 Pakkevakt — SLÅTT SAMMEN med #1.** Overvåking av egen dør er feil retning. Men ideen om at *det som kommer* skal kobles til *den som bestilte* overlever som et felt i Stafett: «Kommer: Lego 10316, bestilt tirs 14:02.»

**#5 Mørkerom — OVERLEVER, men venter.** Sterk. Rett i DNA-et ditt (fototerapi + passiv mekanikk + 48t). Det blir produkt 02 hvis Stafett består testing. Ett produkt om gangen.

**#1 Stafett — OVERLEVER #1.**

---

## IRP — Stafett

**I — Idé (≤3 setningar, nynorsk):**
Stafett er ei lita e-blekk-tavle på pulten som held stafettpinnen mellom delane i eit system. Den som tek over, ser med ein gong kva førre del gjorde, kva som ligg i 48-timars kjølerom, og kva som forfell neste. Alt bur på eininga, ingenting går til skya.

**R — Risiko:**

| Risiko | Merking | Tiltak |
|--------|---------|--------|
| Produktet blir et overvåkingsverktøy én del bruker mot en annen | HYPOTESE | Ingen del kan slette en annen dels note. Ingen «straff». Tonen er overlevering, ikke anmeldelse. |
| Helsepåstand («hjelper DID») uten kilde | — | Vi påstår ingenting om behandling. ISSTD-kursmateriale lister skriftlig indre kommunikasjon som teknikk, og kobler det å vite «hvem sine tanker er hvem» til impulskontroll og sikkerhet (DOKUMENTERT som kursmateriale, *ikke* som retningslinje). Stafett er en notatbok med skjerm, ikke behandling. |
| Kjølerommet blir ignorert | HYPOTESE | Kjølerommet kan aldri «nekte». Det kan bare *vise* nedtellingen og spørre igjen etter 48t. Passiv mekanikk. |
| Data tapt når enheten dør | DOKUMENTERT (localStorage-problemet fra HULL.md) | Eksport til `.txt` over lokalt nett + kopi på SD-kort. |
| Wi-Fi-avhengighet | — | Enheten kjører eget tilgangspunkt (AP) hvis hjemmenettet er borte. Ingen internett nødvendig, aldri. |

**P — Prototyp (48t-ramme, men vi bruker den til å bevise, ikke til å pynte):**

1. Spesifikasjon (`SPEC.md`).
2. CAD: parametrisk kabinett i build123d → STEP/STL + renders.
3. Firmware-kjerne i C++ med enhetstester kjørt på vertsmaskin (logikken: kjølerom, overlevering, ringbuffer, forfall).
4. Skjermsimulator: nøyaktig 400×300 1-bit-gjengivelse av e-blekk-layouten i nettleser, samme layoutregler som firmware.
5. Telefon-UI (det enheten serverer på `http://stafett.local`): skriv overlevering, legg i kjølerom, eksporter.
6. Playwright-test av hele flyten.
7. Økonomi: BOM, pris, margin, break-even.
8. Marked.
9. HULL-test: 60 sekunder for en fremmed.

Stopp. Ikke nytt OS.
