# PROMPTS — 10 ideer, ferdig promptet

Hver prompt er skrevet så du kan lime den rett inn i Claude, Cursor, Lovable, Bolt eller hva du nå vibe-coder i,
og få ut det samme som ligger i `apps/<id>/`. De deler et felles grunnlag. Lim det inn først:

```
FELLES GRUNNLAG (lim inn før hver app-prompt)
Bygg en mobil-først React 19-app (Vite) som installeres som PWA på iPhone.
- Norsk bokmål i hele UI-et. Kort, varm, direkte tone. Ingen «Vennligst».
- Lokal-først: all data i localStorage (bilder i IndexedDB). Ingen konto, ingen server, ingen analytics.
- iOS-meta: viewport-fit=cover, apple-mobile-web-app-capable, apple-touch-icon 180 px, manifest med display standalone.
- Respekter safe-area-inset (topp og bunn). Bunn-fane-meny med 3–4 faner. Sticky header med tittel + én primærknapp.
- Input-felt i 16 px (hindrer iOS-zoom). Knapper minst 44 px høye. Lys + mørk modus via prefers-color-scheme.
- Ark (bottom sheet) for skjemaer, ikke egne sider.
- «Dine data»-kort med Ta backup (JSON via navigator.share / nedlasting) og Gjenopprett.
- Service worker som forhåndscacher alt → virker i flymodus.
- Påminnelser lages som .ics-filer med VALARM (Apple Kalender), ikke web push.
- Tomme tilstander skal forklare hva man gjør, med én emoji og én setning.
```

---

## 1. Prøvefella ⏳ — abonnement- og prøveperiode-dreper
**Smerte:** 69 % har blitt trukket etter glemt prøveperiode. Alle trackerne tar selv abonnement.

```
Lag «Prøvefella». Brukeren legger inn abonnementer og gratis prøveperioder: navn, pris, syklus (uke/måned/år),
neste trekk-dato eller sluttdato for prøven, og valgfri lenke til oppsigelsessiden. Hurtigvalg-chips for vanlige
norske tjenester (Netflix 159, Spotify 139, Viaplay 149, TV 2 Play 129, HBO Max 129, Disney+ 119, iCloud+ 39,
YouTube Premium 149, ChatGPT Plus 240, Storytel 229, Strava 89, Adobe 289).
Faner: Aktive / Kirkegård / Innstillinger.
- Aktive: hero-kort med kostnad per måned og år, pluss kort med «arbeidstimer i året» (timelønn i innstillinger).
  Liste sortert etter neste dato. Betalte abonnementer ruller automatisk fram til neste fremtidige trekk.
  Prøveperioder med ≤3 dager igjen blir røde. Knapp: «Legg alle varsler i Kalender» (.ics, prøver varsles
  3 dager før, 1 dag før og samme dag kl 09).
- Trykk på en rad: endre, legg varsel i Kalender, åpne oppsigelsessiden, «💀 Jeg har sagt opp» (flytter til
  Kirkegården med dato), eller slett.
- Kirkegård: oppsagte abonnementer med totalt spart siden oppsigelse og spart per år framover.
Toast ved oppsigelse: «💀 Viaplay er død. 1 788 kr spart i året.»
```

## 2. Gjeldsradar 📉 — én plan, én gjeldsfri-dato
**Smerte:** Personvern-folket vil ikke koble banken. ADHD-folk mister oversikt over Klarna-delbetalinger.

```
Lag «Gjeldsradar». Brukeren legger inn gjeld: navn, type (Klarna/delbetaling, kredittkort, forbrukslån, inkasso,
billån, studielån, privat, annet), saldo, effektiv rente og minstebeløp per måned.
Simulering måned for måned: renter legges på, minstebeløp betales på alt, resten av et fast budsjett
(sum minstebeløp + «ekstra» fra en slider 0–10 000 kr) går til målgjelda. Snøball = minst saldo først,
Skred = høyest rente først. Nedbetalt gjeld frigjør minstebeløpet sitt til de andre.
Oppdag «aldri»: hvis saldoen ikke synker over 12 måneder, vis «Aldri 😬 – renta spiser betalingen».
Faner: Plan / Gjeld / Betalt / Data.
- Plan: hero med gjeldsfri måned og år, total gjeld, totale renter, månedlig betaling. Chip som viser hvor mange
  måneder og kroner ekstrabeløpet sparer. Strategivelger som også sier hvor mye den andre strategien sparer eller koster.
  SVG-kurve av total saldo over tid. Nummerert nedbetalingsrekkefølge med måned. Kort med NAV økonomisk rådgivning
  (55 55 33 39) og Gjeldsregisteret.
- Gjeld: liste med fremdriftsbar (nedbetalt i % av startsaldo) og «Betal»-knapp som registrerer betaling og
  trekker fra saldoen.
- Betalt: logg med totalt nedbetalt.
```

## 3. Kjøpebrems 🧊 — fryser impulskjøpet
**Smerte:** Klarna gjør det for lett. En del av hodet kjøper Lego kl 14, resten betaler i et halvt år.

```
Lag «Kjøpebrems». I stedet for å kjøpe noe, «fryser» brukeren det: navn, pris, lenke, «hvorfor vil du ha den?»
og en følelses-chip (Kjedelig, Stressa, Trist, Sliten, Feiring, Så en annonse, Klarna fristet, Vet ikke).
Nedkjøling: 24 t / 3 dager / 1 uke / 30 dager. Pris vises live som arbeidstimer (timelønn i innstillinger).
Avkrysning: «Varsle meg i Kalender når den tiner» (.ics).
Faner: Fryseren / Resultat / Innstillinger.
- Fryseren: hero «reddet» (sum droppet), sum som ligger i fryseren. Hvert kort viser fremdriftsbar og «Tiner om 2d 3t».
  Mens den er låst: lenke «Vil ikke ha den likevel». Når den er tint: brukerens egen begrunnelse vises igjen, og
  to knapper «Nei, dropp» (primær) og «Ja, kjøper».
- Resultat: % av fryste kjøp droppet, sum kjøpt, søylediagram over hvilke følelser som trigger kjøpslyst, historikk.
Tonen: aldri moraliserende. Å kjøpe etter nedkjøling er lov.
```

## 4. Startknappen ▶️ — ADHD-oppgavestarter med kroppsdobbel
**Smerte:** «Jeg vet hva jeg skal gjøre, jeg klarer bare ikke å begynne.»

```
Lag «Startknappen». Faner: Nå / Hjernedump / Rekke.
- Nå: «Hva er det du unngår?» + input + Start. Mal-chips med ferdige mikrosteg: Åpne posten/regninger,
  Rydde rommet, Oppvask, Dusje, Svare på en melding, Ringe noen. Under: de 6 siste fra hjernedumpen + «🎲 Velg for meg».
- Fokusvisning: oppgavetittel, SVG-ring med nedtelling (2/5/10/25 min, standard 2), tidsstempel-basert så den tåler
  at iOS pauser fanen. «🫂 Kroppsdobbel»: brun støy generert med WebAudio (lages ved trykk, iOS krever det) og en
  pulserende figur. Lydsignal (tre sinustoner) når tida er ute. Avkryssbare mikrosteg, «Neste: …», legg til steg
  («så lite at det er flaut»). Knapper: «Ikke nå» og «✅ Ferdig».
- Hjernedump: rask innlegging, liste med ▶︎ og slett.
- Rekke: fullført i dag, dager på rad 🔥, siste seire.
Regelen står i appen: du skal ikke gjøre oppgaven, bare første steg i 2 minutter.
```

## 5. Doombrems 🛑 — stopper TikTok-hånda
**Smerte:** 186 telefonsjekker om dagen. Native «one sec»-apper tar betalt.

```
Lag «Doombrems». Siden har to moduser:
1) Brems-modus når URL-en har ?fra=<App>: fullskjerm, pustesirkel med 6 sek nedtelling, «Du åpnet TikTok.
   4. gang i dag.» Deretter grunn-chips (Kjedelig, Unngår noe, Ren vane, Ensom, Stressa, Skal sjekke én ting).
   Primærknapp «Nei. Jeg lar det være.» → viser et forslag til noe annet å gjøre. Sekundær «Gå videre til TikTok»
   (krever valgt grunn) → åpner appens URL-skjema. Alt logges (app, valg, grunn, tid).
2) Dashbord ellers: Statistikk (ganger du lot være, bremsrate, i dag, 7-dagers stablet søyle, per app, grunner),
   Oppsett, Data.
Oppsett: velg app (TikTok snssdk1233://, Instagram instagram://, Snapchat snapchat://, YouTube youtube://,
X twitter://, Reddit reddit://, Facebook fb://, skjema kan endres), kopier brems-lenka, og steg-for-steg
Snarveier-automasjon: Når <app> åpnes → Hent fil doombrems.txt → Tid mellom datoer i minutter → Hvis < 5 stopp →
Arkiver gjeldende dato til doombrems.txt → Åpne URL. Forklar at loggen ligger i Safari fordi Snarveier åpner URL-er der.
```

## 6. Garantiboksen 🧾 — kvitteringer og reklamasjonsrett
**Smerte:** Vaskemaskinen dør etter 3 år, kvitteringen er borte, butikken sier «garantien er ute».

```
Lag «Garantiboksen». Legg inn kjøp: bilde av kvittering (kamera, skaleres til maks 1400 px JPEG og lagres
i IndexedDB), produkt, butikk, pris, dato, kategori, reklamasjonsfrist (2 år eller 5 år for ting som skal
vare vesentlig lenger, forhåndsvalgt ut fra kategori), valgfri produsentgaranti i år, notat.
Faner: Boksen / Rettigheter / Data.
- Boksen: hero med antall ting som fortsatt har reklamasjonsrett og samlet verdi, antall som går ut innen 60 dager.
  Søk. Rader med miniatyrbilde og chip (grønn, rød ≤60 dager, grå utløpt). «Varsle meg før fristene går ut»
  (.ics 30 og 7 dager før).
- Detalj: stort bilde, alle datoer, og ferdig reklamasjonsbrev (forbrukerkjøpsloven § 27 og § 29) med kopier-knapp.
- Rettigheter: reklamasjon ≠ garanti, 2/5 år, si fra innen rimelig tid (2 måneder er alltid i tide), klag til butikken.
  Lenke til Forbrukerrådet. Ikke juridisk rådgivning.
Backup-fila tar med bildene som data-URL-er.
```

## 7. Spleiselapp 🍕 — del regninga uten konto
**Smerte:** Splitwise strupet gratisversjonen. Ingen gidder å laste ned en app for én hyttetur.

```
Lag «Spleiselapp». Lag en spleis (navn + deltakere skilt med komma). Utlegg: hva, beløp, hvem betalte (chips),
delt på hvem (chips, standard alle) med live «x kr hver».
Oppgjør: saldo per person, deretter grådig matching av største skyldner mot største kreditor → færrest mulig
overføringer. Hver overføring har 💬-knapp som kopierer «Hei Ola! Du skylder Meg 1 080 kr for «Hyttetur». Vipps meg gjerne 🙏».
«Marker alt som oppgjort» lager motpostene automatisk.
DELING UTEN SERVER: JSON → CompressionStream('deflate-raw') → base64url → #g=… i URL-en. navigator.share,
ellers kopier. Åpnes lenka: ark «Spleis delt med deg» → «Åpne og lagre» (samme id erstatter gammel versjon).
```

## 8. Kjøleskapet 🥚 — hva kan jeg lage med det jeg har?
**Smerte:** r/SomebodyMakeThis-klassikeren. 100k+ nedlastinger på en MVP.

```
Lag «Kjøleskapet» med ~30 innebygde billige hverdagsoppskrifter (eggerøre, pasta aglio e olio, taco, stekt ris,
kyllingkarri, shakshuka, pannekaker, grøt …). Hver oppskrift: navn, minutter, påkrevde ingredienser,
valgfrie «kan legge til», kort fremgangsmåte. Salt, pepper, olje og vann antas.
Faner: Kan lage / Har / Handle / Data.
- Har: ingrediens-chips gruppert (Kjøleskap, Grønt, Skap) + egne varer. Trykk = har/har ikke.
- Kan lage: hero «retter du kan lage NÅ», «mangler bare 1–2». Lister sortert etter færrest manglende, deretter flest
  bonus-ingredienser, deretter tid. Oppskriftsark: grønne/røde chips, «Legg manglende i handlelista», «Jeg lagde den!».
- Handle: liste med «Kjøpt» per vare (flytter til Har), «Kopier», «Kjøpt alt».
- Data: måltider laget hjemme og estimert spart mot take-away.
```

## 9. Minnehull 🫧 — logg for tid som forsvant
**Smerte:** For DID/OSDD-systemer og alle med dissosiasjon: tid forsvinner, sporene ligger i bank-appen.
Ingen kommersiell app tar dette på alvor.

```
Lag «Minnehull». Respektfullt, ikke-klinisk språk. Fungerer for systemer (deler/alters) og for én person.
Faner: Hvem er her / Hull / Tavle / Innstillinger.
- Hvem er her: «Sist logget: 🧸 Lille siden 18:42» med delens farge som ramme. Stort rutenett med knapper per del
  (emoji, navn, farge) + «❔ Vet ikke». Valgfritt notat. Dagens tidslinje.
- Hull: «🕳 Jeg mangler tid» → dato, sist jeg husker, kom tilbake, spor jeg fant (kjøp, meldinger, pakker),
  hvordan jeg har det. Toast: «Logget. Det er ikke din feil.»
- Tavle: beskjeder mellom deler («Ikke kjøp mer Lego denne måneden ❤️»), med avsender-chip og farget kant.
- Innstillinger: legg til/endre deler (navn, emoji, farge). PIN-lås med EKTE kryptering: PBKDF2 (250k, SHA-256)
  → AES-GCM 256, hele datasettet kryptert i localStorage. Feil PIN = «Feil PIN», ingen bakdør.
  Backup. Krisenummer: Mental Helse 116 123, Legevakt 116 117, 113.
```

## 10. Inkasso-skjold 🛡️ — når regningene angriper
**Smerte:** Strutsen. Brevene blir liggende uåpnet til de blir dyre.

```
Lag «Inkasso-skjold». Sak = ett krav: opprinnelig kreditor, inkassoselskap, beløp, saksnr, steg
(Faktura → Purring → Inkassovarsel → Betalingsoppfordring → Varsel om rettslig → Utlegg/trekk; hvert steg har
standard fristdager og et kort, rolig råd), mottatt-dato, frist (foreslås automatisk, «sjekk brevet!»), status
(Åpen/Avtale/Bestridt/Betalt), notater.
Faner: Saker / Veiviser / Data.
- Saker: stor rød knapp «😰 Jeg fikk et skummelt brev» → ark med 5 rolige steg (pust, er kravet ditt / svindelsjekk,
  finn fristen, velg én handling, svar skriftlig) → «Legg inn brevet nå». Hero: total åpen gjeld, frister innen 7 dager.
  Liste sortert etter frist. «Legg alle frister i Kalender» (.ics 3 og 1 dag før).
- Sak: detaljer, råd for steget, status-chips, brevmaler med kreditor/saksnr/beløp fylt inn: Be om
  nedbetalingsavtale, Bestrid kravet, Be om dokumentasjon, Be om betalingsutsettelse. Kopier-knapp.
- Veiviser: stegene forklart. Inkassovarsel gir minst 14 dager (inkassoloven § 9). NAV økonomirådgivning 55 55 33 39,
  Gjeldsregisteret. «Generell informasjon, ikke juridisk rådgivning.»
```
