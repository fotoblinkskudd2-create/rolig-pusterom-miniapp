# PROMPTS — ti ferdige vibe-code-prompter

Lim inn i Claude Code, Cursor, Lovable, Bolt eller hva du nå bruker. Hver prompt står på egne bein. Start alltid med **grunnmuren**, lim så inn app-prompten under.

Det er disse promptene appene i `src/apps/` er bygd fra.

---

## Grunnmuren (lim inn først, hver gang)

```
Bygg en installerbar iOS-webapp (PWA) i React 19 + Vite. Krav:

- Lokal-først: ingen konto, ingen backend, ingen analytics. All data i localStorage
  (JSON, eget nøkkelprefiks per app), bilder i IndexedDB. Pakk alle localStorage-kall
  i try/catch – privat modus kan kaste.
- iOS: viewport-fit=cover, apple-mobile-web-app-capable, status-bar black-translucent,
  apple-touch-icon 180px PNG, manifest med display: standalone. Respekter
  env(safe-area-inset-*). Alle input/select/textarea har font-size 16px (ellers zoomer iOS).
  Trykkflater minst 44px. Bunnmeny med faner, fast nederst med blur.
- Offline: service worker som precacher alle byggfiler.
- Design: systemfont, mørk/lys via prefers-color-scheme, én aksentfarge per app,
  store tall, kort med 18px radius. Norsk bokmål i all tekst. Formater kroner med
  Intl.NumberFormat('nb-NO', { style: 'currency', currency: 'NOK' }).
- Backup: kort med «Ta backup» (JSON via navigator.share med fil, ellers nedlasting)
  og «Gjenopprett» (filvelger). Tekst: «Alt ligger kun på denne enheten.»
- Ingen alert() for validering – deaktiver knappen i stedet. Toast for bekreftelser.
- Tomme tilstander skal ha en setning med personlighet, ikke «Ingen data».
```

---

## 1. Abo-Liket

```
App: «Abo-Liket» – abonnementene som spiser deg levende. Aksent #e5484d.

Data: abonnement { id, name, price, cycle: week|month|quarter|year, next (ISO-dato
for neste trekk), trialEnd?, cancelHow?, killedAt? }. Innstilling: timelønn etter skatt.

Faner: Aktive · Drept · Mer.

Aktive:
- Stort tall: «Du blør hver måned» = sum normalisert til måned (uke ×52/12, kvartal /3, år /12).
  Under: per år, på ti år, og timer arbeid per måned hvis timelønn er satt.
- Rødt varselkort hvis en prøveperiode slutter innen 7 dager.
- Liste sortert på neste trekk. Neste trekk rulles automatisk fremover fra lagret dato
  til første dato ≥ i dag. Badge «i dag/i morgen/om 2 dager» når ≤ 3 dager.
- Hver rad: «Drep»-knapp → setter killedAt, toast: «Netflix er drept. 1 908 kr i året tilbake i lomma.»
- Trykk på rad → redigeringsark. Nytt-ark har hurtigvalg-chips med vanlige norske
  tjenester og typisk pris (Netflix, Spotify, Viaplay, TV 2 Play, Storytel, iCloud+, ChatGPT Plus …).
- Knapp: «Påminnelser i kalenderen (.ics)» – én VEVENT per abonnement med RRULE etter
  syklus og VALARM 2 dager før, pluss egen hendelse for trialEnd. Forklar at dette
  virker selv om web-push svikter.

Drept: «Spart siden du begynte å drepe» = sum av månedspris × måneder siden killedAt.
Liste med gjennomstreket navn og «Gjenoppliv».

Mer: timelønn, korte tips om oppsigelse (App Store: Innstillinger → navn → Abonnementer),
backup.
```

## 2. Dump

```
App: «Dump» – én boks, ingen tags. For ADHD-hjerner. Aksent #f5a524.

Data: items { id, text, at, doneAt? }.

Faner: Dump · Én ting · Mer.

Dump:
- Textarea med autofocus. Enter = legg til (Shift+Enter = ny linje). Flere linjer
  limt inn = flere oppgaver. Teller: «4 dumpet · 2 ferdig i dag».
- Liste over åpne, nyeste først: ✓-knapp til venstre, tekst, klokkeslett, ✕ til høyre.
- «Ferdig i dag»-seksjon med gjennomstreking og «Angre».
- Les ?add=tekst fra URL ved oppstart, legg inn, fjern parameteren med
  history.replaceState, toast «Dumpet fra snarvei».

Én ting: fullskjerm, kun én oppgave i gigantisk tekst (clamp 2–3.4rem). Knapper:
«Ferdig» (stor, aksent) og «Ikke nå – vis neste» (flytter den bakerst).
Tekst: «Bare denne. Resten finnes ikke akkurat nå.»

Mer: steg-for-steg for iOS Snarveier («Be om inndata» → URL med ?add= → «Åpne URL-er»),
kopier-URL-knapp, «Fjern ferdige fra tidligere dager», «Kopier åpne som liste», backup.
```

## 3. Kvitt

```
App: «Kvitt» – kvitteringer og reklamasjonsrett. Aksent #12a594.

Data: items { id, name, store, price, date, years: '2'|'5', cat, notes, photos: [idb-nøkler] }.
Bilder: <input type=file accept=image/* capture=environment multiple>, krymp med
canvas til maks 1400px JPEG 0.8, lagre Blob i IndexedDB.

Hovedside: «Verdier du fortsatt kan reklamere på» (sum av ikke-utløpte), antall som
utløper innen 60 dager. Søk + «+ Ny». Liste sortert på utløp: miniatyrbilde, navn,
butikk · pris, og nedtelling «3 år 4 mnd igjen» (grønn), «41 dager igjen» (rød <60), «Utløpt».
Utløp = kjøpsdato + years × 12 måneder.

Redigering: stor kameraknapp først, miniatyrer med ✕, chips «2 år» / «5 år – skal vare lenge»
med forklaring (hvitevarer, PC, mobil, møbler, sykkel).

Detaljark: bildekarusell (trykk = fullskjerm), fakta, og «Noe er galt? Lag reklamasjon»:
textarea for feilbeskrivelse → genererer ferdig reklamasjonsbrev etter forbrukerkjøpsloven
§ 27 (frist), krav om retting/omlevering, ellers prisavslag/heving, svar innen 14 dager.
Knapper: «Kopier brev» og «Del».

Mer: .ics med varsel 30 dager før hver frist, kort rettighetsoversikt (2/5 år, si fra
innen rimelig tid – 2 mnd er alltid tidsnok, selger ikke produsent, Forbrukerrådet mekler),
backup som inkluderer bildene som data-URL-er.
```

## 4. Splitt

```
App: «Splitt» – del regninga uten konto, paywall eller dagsgrense. Aksent #3e63dd.

Data: groups { id, name, people: [navn], expenses: [{ id, desc, amount, paidBy, among: [navn], at }] }.

Regnestykke i øre (heltall): betaler får +beløp, hver i among får −andel; rest-øre
fordeles én og én. Oppgjør: grådig – største skyldner betaler største kreditor til alt er 0.

Gruppeliste → gruppe-visning:
- Totalt brukt, oppgjør «Per → Ola 450,00 kr», «Kopier oppgjør (til Vipps/chat)».
- Folk med saldo (grønn +, rød −) og felt for å legge til navn.
- Utgifter; ark med beløp, «Betalt av» (chips, én), «Deles på» (chips, flere, alle på som standard),
  viser «300,00 kr hver».
- VIKTIG: chips skal ikke ligge inni <label> – da aktiverer et trykk på etiketten første chip.

Deling uten server: «Del lenke» = JSON → CompressionStream('deflate-raw') → base64url →
#g=… i URL. Åpnes lenka: ark «Importer» (erstatter hvis samme id). Hash sendes aldri til server.
```

## 5. Doom-Brems

```
App: «Doom-Brems» – ti sekunder mellom deg og feeden. Aksent #8e4ec6.

Åpnes med ?app=Instagram → bremseskjerm (fullskjerm, ingen faner):
1. «Du åpnet Instagram. Hvorfor? Ærlig.» Valg: «Jeg har et konkret ærend» → pust,
   «Kjedsomhet / flukt» → foreslå tilfeldig alternativ (redigerbar liste), «Ingen grunn. Lukk.» → vunnet.
2. Pust: sirkel som skalerer inn/ut hvert 4. sekund, nedtelling (5/10/20/30 s, valgbart).
   «Ja – åpne Instagram selv» er deaktivert til nedtellingen er ferdig. «Nei. Jeg slipper.» = vunnet.
Logg { app, result: won|lost, note, at }.

Faner: Stats (vunnet/tapt i dag, 7-dagers stablet søylediagram, logg, test-knapper per app) ·
Oppsett · Mer (alternativ-liste, backup).

Oppsett: velg app → vis URL med ?app=… + kopier. Steg-for-steg iOS Snarveier-automasjon:
App → Er åpnet → Kjør umiddelbart. For å unngå loop: Hent fil brems.txt fra iCloud; hvis den
ikke finnes eller er eldre enn 10 min → Lagre fil (overskriv) og Åpne URL. Si ærlig at
handlingsnavn kan variere mellom iOS-versjoner.
```

## 6. Strømvakt

```
App: «Strømvakt» – spotpris nå, i morgen, og når vaskemaskina bør gå. Aksent #ffc53d.

API: https://www.hvakosterstrommen.no/api/v1/prices/{YYYY}/{MM}-{DD}_{NO1..NO5}.json
→ [{ NOK_per_kWh, time_start, time_end }] eks. mva. Kan være 15-minutters eller timesoppløsning –
skriv koden så den tåler begge. 404 for i morgen = ikke publisert ennå (ca. kl. 13).
Hent i dag + i morgen, cache i localStorage, vis cachen ved nettfeil.

Pris = spot → (strømstøtte: over terskel trekkes dekning% av overskytende) → ×1.25 mva
(ikke NO4) → + nettleie. Alternativ modus «Norgespris» = fast pris. Alle satser redigerbare
med tekst om at staten endrer dem.

UI: sone-chips øverst. «Akkurat nå» i gigantisk øre-tall. «Når bør maskina gå?» –
chips Tørketrommel 1t / Oppvask 2t / Vask 3t / Elbil 6t → billigste sammenhengende vindu
fremover på tvers av i dag og i morgen. SVG-søylediagram for i dag/i morgen
(nåværende periode uthevet, under snitt = full aksent), lavest/høyest/snitt.
```

## 7. Kjøpekarantene

```
App: «Kjøpekarantene» – impulskjøp i bur. Aksent #f76b15.

Data: items { id, name, price, url, why, hours: 24|72|168|720, at, decision?: buy|drop, decidedAt }.

Buret: «Penger reddet» (sum droppet) og «I buret nå». Stor knapp «Jeg vil kjøpe noe …».
Kort per vare med fremdriftslinje og live nedtelling (oppdateres hvert sekund), timer arbeid
hvis timelønn. Når tiden er ute: «Bestem». Bestem-ark: dato + «hvorfor nå»-sitatet, fem
refleksjonsspørsmål, lenke. Før tiden er ute kan man bare droppe, ikke kjøpe.
Avgjort-liste med badge Droppet/Kjøpt.

Delbetaling-fane: pris, måneder, nominell rente, gebyr/mnd, etableringsgebyr →
annuitet per måned, totalt betalt, «Ekstra for å slippe å vente: 2 140 kr (21 %)» i rødt.
```

## 8. Gjeld-Snøball

```
App: «Gjeld-Snøball» – se datoen du blir gjeldfri. Aksent #0090ff.

Data: debts { id, name, balance, rate (nominell % p.a.), min, fee/mnd }, extra, strategy.

Simulering per måned: rente (bal × r/12) + gebyr legges til; minstebeløp betales på alt;
resten av budsjettet (sum min + extra, inkl. frigjorte minstebeløp) går til mål-gjelda:
snøball = minste saldo først, skred = høyeste rente først. Stopp ved 600 mnd. Hvis totalen
ikke synker tre måneder på rad: «Du betaler ikke nok til å komme ned.»

Plan: total gjeld, «Gjeldfri: mai 2030» gigantisk, år/mnd, renter, gebyrer. Ekstra-felt +
chips (+0/+500/+1000/+2000/+5000). Sammenlign snøball vs skred side om side, med ærlig tekst
om at snøball gir seire og folk med seire gir ikke opp. «Ekstrabeløpet kutter 12 måneder og
19 932 kr i renter.» SVG-linje: bare minstebeløp (grå) vs plan (aksent). Rekkefølge med datoer.

Mer: Gjeldsregisteret, NAVs gratis økonomi- og gjeldsrådgivning, inkasso-tips. Backup.
```

## 9. Brunstøy

```
App: «Brunstøy» – brun støy, fokus-timer, kroppsdobbel. Aksent #a18072.

Lyd: generer 30 s støy i JS (hvit, rosa (Paul Kellet-filter), brun (integrert hvit), regn
(rosa + høypass + sakte amplitude + dråper)), krysstone endene for sømløs loop, skriv til
16-bit mono WAV-Blob og spill i et <audio loop>-element – IKKE Web Audio, fordi iOS demper
Web Audio med lydløs-bryteren og stopper den når skjermen låses. Sett mediaSession-metadata.
Volum: forklar at iOS bruker sideknappene.

Økt: «Hva skal du gjøre? Én ting.» + 15/25/50/90/Åpen → fullskjerm med oppgaven, stor
nedtelling, pulserende prikk, «Du er ikke alene. Andre sitter og jobber akkurat nå, de også.»
Screen Wake Lock hvis tilgjengelig. Bjelle (generert WAV) ved slutt. Logg økter; vis fokus i dag.
```

## 10. Systemtavla

```
App: «Systemtavla» – for plurale systemer / DID. Varm, ikke-klinisk tone. Aksent #d6409f.

Data: members { id, name, color, role, notes }, front [{ id, members: [ids], start, end }],
board [{ id, from, to ('alle' | id), text, at, pinned }], lost [{ id, at, where, found, note }].

Fremme: grounding-kort øverst (ukedag, dato, klokke stort, «Kjenn føttene mot gulvet. Nevn fem
ting du ser.»). Medlem-chips: trykk slår av/på (co-front støttes; hver endring lukker gjeldende
front-periode og åpner ny). «Vera + Lille fremme i 1t 12m.» Viser de siste beskjedene adressert
til alle eller til dem som er fremme. Dagens front-logg.

Tavla: Fra (default: den som er fremme) / Til, tekst, fest/løsne, fjern.

Tapt tid: stor knapp «Jeg kom til nå – logg det» → hvor, hva fant du, notat. Tekst: «Ingen skam.
Bare spor.»

Mer: PIN-gardin (SHA-256 med salt i localStorage – si tydelig at det er gardin, ikke
kryptering), medlemsliste, merknad om at dette er notatverktøy og ikke behandling, backup.
```

---

## Hvordan jeg ville kjørt dem

1. Lim inn grunnmuren + én app-prompt.
2. Når første versjon står: «Kjør gjennom appen som en sliten bruker kl. 23 på en iPhone. Hva er forvirrende? Fiks det.»
3. «Skriv en Playwright-røyktest i 390×844 som klikker gjennom kjerneflyten og feiler på konsollfeil.»
4. Deploy til hva som helst med HTTPS. Åpne i Safari. Del → Legg til på Hjem-skjerm.
