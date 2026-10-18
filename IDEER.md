# IDEER — input midt

Seed 13. Drepe minst 3. IRP på overlevende #1.

Jeg sitter midt i repoet ditt kl 15:08 en søndag i oktober. Fire sider HTML, en pustesirkel som puster for folk som ikke klarer det selv, og en speilfil som heter *Isolation Mirror*, fordi selvfølgelig heter den det. Ingen sky. Ingen konto. Det er det eneste ærlige produktet i hele App Store-økonomien, og det ligger i en mappe på 40 kilobyte. Greit. Da kjører vi.

---

## Seeds

**1. Lapp på kjøleskapet.**
En side i Rolig der delene legger igjen beskjeder til hverandre. Tid, navn (fritt felt, ingen diagnose-dropdown), tekst. «Jeg kjøpte Lego kl 14. Unnskyld. Den er til oss.» Du våkner, og i stedet for bare bank-appen som bevis har du et vitne. Alt lokalt.

**2. Venteværelset.**
Før Klarna får fingrene i deg: lim inn det du har lyst på og prisen. Appen låser det i 24 timer og viser hva det koster med renter. Ikke forbud, bare et rom med en klokke. Den delen som kjøper skal få lov til å ville. Den skal bare vente.

**3. Rentemåleren.**
Én skjerm. 250 000 kroner. Renten din. Et tall som tikker opp per sekund, i sanntid, uten pynt. Bomben du skrev om, som aldri smeller. Nå kan du *se* den. Det er grusomt, og det er poenget. Det gir også en knapp: «Hva betalte jeg ned i dag?» Da tikker den andre veien.

**4. Kvitteringsmuseet.**
Fotografer hvert inkassobrev. Heng dem opp som utstilling, hvit vegg, små messingskilt med beløp og dato. Kall den noe beskjedent, som *Gjeld, 2024–2026, blandet teknikk*. Astrup Fearnley tar 818 mill for en Bacon. Du tar 0 kroner for sannheten. Hvem er den egentlige kunstneren?

**5. 48 bilder.**
Isolation Mirror, utvidet: ett bilde i timen i 48 timer av noe ekte. Ikke til Instagram, til deg. Etterpå ser du kontaktarket, og du ser at du var der hele tiden, selv de timene du ikke husker.

**6. Vind + humør.**
Logg vinden ved siden av innsjekken. 53 mph utenfor, humør 2. Etter en måned vet du om fjorden styrer deg mer enn du trodde. Lokalt, én ekstra knapp.

**7. Morfars hånd.**
En side uten tekst. Ett bilde du velger, og stillhet. Ingen pusteøvelse, ingen tips, ingen «du er sterk». Bare et sted å holde.

**8. Batsverk 4 — zinen.**
Gonzo-tekstene dine, skrevet ut på kopimaskinen på Rema, stiftet, delt ut gratis. Tolv sider. Inkassobrevet på forsiden. Papir kan ikke shadowbannes.

**9. Rasepust.**
Pusterom-modus for når du ikke er nedstemt, men *forbanna*. Kort inn, langt og hardt ut, gjerne med lyd. Sirkelen blir rød og krymper i stedet for å vokse. Ikke alle trenger å roe seg ned. Noen trenger å få det ut.

**10. Del-kalender.**
Hvem var foran hvilke dager? Fargekoder du velger selv, hentet fra lapp-loggen. Mønstre kommer fram: hvem kjøper, hvem rydder, hvem skriver.

**11. Inkasso-svar-generator.**
Skriv tilbake til inkassoselskapet i gonzo-stil.

**12. Systemkart i FigJam.**
Alle pengestrømmene du raser mot, på ett lerret: kunststøtte, barnevern, landbruk, import. Piler, tall, kilder.

**13. Rolig for to.**
Del pusterom med én annen person via fil. Ingen server, du sender JSON på Messenger.

---

## Drept

- **11. Inkasso-svar-generator.** Død. Gonzo i et brev til inkasso gjør deg morsom i ti sekunder og part i en sak etter det. Raseri hører hjemme i zinen, ikke i rettssaken.
- **12. Systemkart.** Død. Det er et livsverk, ikke 48 timer, og det er ett nytt OS. Regelen sier ikke nytt OS.
- **13. Rolig for to.** Død. Øyeblikket du deler fil, har du en sky med ekstra steg. Lokal-first betyr lokal.
- **10. Del-kalender.** Lagt på is, ikke drept. Den trenger data fra #1 først. Kom tilbake om en måned.

---

## Overlevende #1: Lapp på kjøleskapet + Venteværelset

De er samme ide. Den ene delen kjøper, den andre våkner og finner pakker. Mellom dem er det ingenting, bare bank-appen som anklager. Det mangler en **korridor**.

## IRP — 48 timer

**Time 0–6: Lapper**
- Ny side i `index.html`: «Lapper». Nav-knapp nummer fem.
- `localStorage`-nøkkel `lapper`: `{ tid, fra, tekst }`.
- `fra` er fritt tekstfelt, og appen husker de siste navnene som knapper. Ingen kategorier, ingen etiketter, ingen klinikk.
- Liste, nyeste øverst. Ingen sletting de første 24 timene (en del skal ikke kunne viske ut en annen i panikk).

**Time 6–12: Venteværelset**
- Samme side, egen boks. Felt: *hva*, *pris*, *rente % (valgfritt)*.
- `localStorage`-nøkkel `venter`: `{ tid, hva, pris, rente }`.
- Låst i 24 t med nedtelling. Etter at tiden er ute: «Vil du fortsatt?» → *Ja* (logges som lapp: «Vi bestemte oss.») / *Nei* (logges: «Vi lot den gå. Spart: X kr.»).
- Viser totalpris over 12 måneder hvis rente er fylt inn. Kun tall, ingen moral.

**Time 12–24: Koble på**
- Export i Historikk tar med lapper og venteværelse i `.txt`.
- Teller på forsiden: «Spart ved å vente: X kr». Bare positive tall, aldri «du brukte».

**Time 24–48: Ekte iPhone**
- Test på hjemskjerm (står fortsatt i HULL.md som manglende).
- Én uke bruk før neste patch. Ingen nye funksjoner før lapp-loggen har 20 lapper.

**Ikke i denne patchen:** Rentemåleren (#3). Den er sterk, men den kan bite. Den får bare komme etter at Venteværelset har vist at appen også kan telle det du *vant*.

---

Jeg har ikke kodet dette. Det er ditt kjøleskap.

Så hvem skriver den første lappen?
