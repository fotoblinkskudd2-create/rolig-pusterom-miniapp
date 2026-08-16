# Rolig Pusterom – Produktbrief & Veikart

*Stress- og nedstemthets-mestring, 100% lokal, ingen konto, ingen sporing.*

---

## 1. Konsept

Rolig Pusterom er en liten web-app (ren HTML/CSS/JS, ingen backend) med fire
skjermer: **Innsjekk**, **Pusterom**, **Små grep** og **Historikk**. Målet er å
senke terskelen for egenomsorg til under 10 sekunder – ingen registrering,
ingen nettverkskall, all data lagres i `localStorage` på brukerens egen enhet.

## 2. Forskningsgrunnlag (kort syntese)

- **Pustetrening som fysiologisk brems**: Forlenget utpust (lengre enn
  innpust) aktiverer parasympatisk respons via vagusnerven og senker
  hjertefrekvens raskere enn jevn pust. Dette er grunnen til at 4-2-6-mønsteret
  (kort hold, lang utpust) var appens opprinnelige standard.
- **Box breathing (4-4-4-4)**: Brukt av bl.a. militær/idrett for
  stressregulering under press – like faser gjør mønsteret lett å huske og
  følge visuelt.
- **4-7-8 ("avslapningspust")**: Popularisert for innsovning/angstdemping;
  lang holdefase og enda lengre utpust gir sterkere nedregulering, men er
  krevende for nybegynnere – derfor tilbys alle tre som valg, ikke tvang.
- **Mikro-handlinger ("Små grep")**: Korte, konkrete handlinger (5 min frisk
  luft, jording via føtter i gulvet) er lavterskel nok til å faktisk bli
  gjennomført, i motsetning til lengre øvelser som lett utsettes.
- **Selvregistrering (check-in)**: Regelmessig, enkel humørlogging er assosiert
  med økt egen-innsikt og er kjernen i mange evidensbaserte
  digitale intervensjoner – men effekten avhenger av at loggingen er rask nok
  til å bli en vane (derfor: 1 trykk + valgfri tekst, ikke skjema).
- **Streaks/visualisering**: Synlig fremgang (graf, streak) øker
  gjennomføringsgrad, men må designes varsomt – et brutt streak skal aldri
  fremstå som et nederlag i en app for sårbare brukere. Dagens implementasjon
  teller fra siste registrerte dag bakover, ikke fra "i dag", slik at brukeren
  ikke straffes hardt for én glemt dag.
- **Sikkerhetsnett**: Apper i denne kategorien bør aldri late som de er
  krisehjelp. Ved lav selvrapportert stemning bør appen synlig, men ikke
  påtrengende, vise vei til reelle hjelpelinjer (implementert: Mental Helse
  116 123, Kirkens SOS 22 40 00 40, nødnummer 113 ved akutt fare).

**Kjente hull / risiko:**
- Ingen server betyr ingen backup – sletter brukeren nettleserdata, er
  historikken borte. Bør kommuniseres tydelig, evt. tilby eksport.
- `localStorage` er enhetsspesifikt – ingen synk mellom telefon/PC per i dag.
- Appen er et mestringsverktøy, ikke en klinisk intervensjon, og bør aldri
  markedsføres som erstatning for behandling.

## 3. Nåværende funksjoner (implementert)

| Skjerm | Funksjon |
|---|---|
| Innsjekk | Humørskala (5 nivåer) + valgfri tekstnotat, lagres lokalt |
| Innsjekk | Varsom støttemelding med hjelpelinjer ved lav registrert stemning |
| Pusterom | Tre pustemønstre: Rolig (4-2-6), Box (4-4-4-4), 4-7-8 avslapning |
| Pusterom | Animert pustesirkel synkront med valgt mønster, husker siste valg |
| Små grep | 7 konkrete mikro-handlinger, avhukbare per dag |
| Historikk | Siste 20 innsjekk med dato og humør-emoji |
| Historikk | Streak-teller ("dager på rad") |
| Historikk | Ukentlig humørgraf (canvas-basert søylediagram, 7 dager) |
| Historikk | Ukesoppsummering ("tatt vare på deg selv X ganger denne uken") |

Alt kjører fra én `index.html`-fil, uten avhengigheter, offline-kapabel.
En separat prototype (`isolation-mirror.html`) utforsker et beslektet konsept
(journaling + generativ "mirror art"-prompt) og er ikke koblet til
hovedappen.

## 4. Neste steg / veikart

1. **Eksport/import av data** – knapp i Historikk for å laste ned egne
   check-ins som JSON, slik at brukeren ikke mister data ved nettleserbytte.
2. **PWA/offline-manifest** – legg til `manifest.json` + service worker slik
   appen kan installeres og brukes helt offline på mobil.
3. **Skånsom påminnelse** – valgfri lokal varsling (Notification API) for
   daglig innsjekk, av/på-styrt av bruker, aldri påtrengende.

---

*Dette dokumentet er skrevet for å være klart til PDF/Word-eksport
(f.eks. via Word/Google Docs "Importer" eller pandoc).*
