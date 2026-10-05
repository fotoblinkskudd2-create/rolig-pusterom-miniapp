# Arkitektur — forebygging for unge, laget for gutter

Systemnivå. Ikke terapi. Bygger videre på det Rolig allerede er: lokal-first, ingen konto, ingen sky.

Utgangspunkt: Rundt 2 av 3 som tar livet sitt i Norge er menn. Gutter søker hjelp sjeldnere og senere. Det er ikke fordi de «ikke skjønner sitt eget beste». Det er fordi tilbudene er laget for noen andre.

---

## 1. Kulturbarrierer (analyse)

Motstanden er rasjonell. Ta den på alvor, ellers bygger du nok en kampanje ingen bruker.

**Hva gutter faktisk unngår, og hvorfor:**

| Barriere | Hva det egentlig er | Konsekvens for design |
|---|---|---|
| «Jeg er ikke en sånn som trenger hjelp» | Identitetsvern. Hjelp = svak = tap av status | Ikke kall det hjelp. Kall det verktøy, oppsett, plan |
| «Det blir notert et sted» | Reell frykt: journal, foreldre, skole, førerkort, Forsvaret | Ingen konto. Ingenting lagres utenfor enheten. Si det på første skjerm |
| «Jeg vil ikke snakke om følelser» | Mange gutter prosesserer gjennom handling, ikke prat | Gi noe å *gjøre*: pust, gå, skriv én linje, send én melding |
| «Voksne skjønner ikke» | Erfaring. De har møtt helsesykepleier med brosjyre | Ungdomsstemmer, ikke fagstemmer, i frontlinja |
| «Det hjelper ikke uansett» | Lært hjelpeløshet etter dårlige møter med systemet | Lav innsats, rask effekt. 60 sekunder, ikke 6 uker venteliste |
| Kompisen merker noe, men sier ingenting | Frykt for å gjøre det verre eller bli den rare | Gi kompisen et manus, ikke et ansvar |

**Hva som ikke virker** (og hvorfor dere ikke skal gjøre det):
- Kampanjer med «Det er lov å gråte» og bilde av en trist gutt i hettegenser. Det bekrefter stigmaet: sårbar = offer.
- Faktaark om symptomer. Ingen 16-åring leser seg selv inn i en diagnose frivillig.
- «Snakk med noen!» uten å si hvem, hvordan og hva som skjer etterpå.

**Hva som virker oftere:**
- Skjult inngang: verktøyet ser ut som noe annet (treningslogg, fokus-timer, gaming-overlay).
- Sideveis samtale: gutter snakker lettere skulder ved skulder (bil, game, trening) enn ansikt til ansikt. Digitalt betyr det asynkront, tekst og ingen øyekontakt.
- Kompetanse framfor følelser: «Slik får du hodet ditt tilbake etter en dårlig uke» lander bedre enn «Hvordan har du det egentlig?»

Konkret test: Hvis en 17-åring ikke kan ha appen åpen på mobilen i garderoben uten å bli spurt om noe, har dere bommet.

---

## 2. Kjernearkitektur (teknisk + funksjonell)

```
┌──────────────── INNGANGER ─────────────────┐
│ PWA (Rolig) · Discord-bot · Twitch-panel    │
│ QR i garderobe/frisør · lenke i bio · SMS   │
└───────────────┬────────────────────────────┘
                │ ingen konto, ingen sporing
┌───────────────▼────────────────────────────┐
│ KLIENTKJERNE (kjører på enheten)            │
│  Verktøy   Innsjekk   Plan   Kompis-modus   │
│  Lokal signalmotor (regler, ikke AI-sky)    │
│  Kryptert lokal lagring + eksport           │
└───────┬───────────────────────┬────────────┘
        │ valgfritt, brukerstyrt │ alltid synlig
┌───────▼─────────┐   ┌─────────▼────────────┐
│ INNHOLDSLAG     │   │ VIDEREKOBLING        │
│ statisk CDN,    │   │ chat/telefon til     │
│ signert, åpent  │   │ hjelpetjenester,     │
│ (CC BY-SA)      │   │ 113 ved akutt fare   │
└─────────────────┘   └──────────────────────┘
```

**Funksjonelle moduler:**

1. **Verktøy** — det Rolig har: pust, små grep, innsjekk. Utvides med søvn-reset, «dårlig dag-protokoll», 5-minutters gåtur med lyd.
2. **Min plan** — en enkel sikkerhetsplan i brukerens egne ord: varseltegn jeg kjenner igjen, hva som roer meg, hvem jeg kan sende melding til, hvor jeg ringer. Ligger offline. Kan låses med PIN.
3. **Kompis-modus** — for den som er bekymret for en annen: tre meldingsmaler, hva du gjør hvis svaret er skummelt, og hvem du ringer selv. Dette er trolig den viktigste modulen. Mange gutter hjelper heller en kompis enn seg selv.
4. **Signalmotor** — lokal, regelbasert. Fanger opp ord og mønstre i innsjekk/notater (f.eks. flere dager på bunn, bestemte formuleringer). Gjør *ikke* noe bak ryggen på brukeren. Viser bare viderekoblingskortet tydeligere. Ingen data forlater enheten.
5. **Viderekobling** — alltid én trykk unna, på hver skjerm. Varm overlevering: «Du kommer til en chat. Det er en voksen som svarer. Du trenger ikke si navn. Ventetid nå: ca. X min» (der tjenesten eksponerer det).

**Teknisk:**
- PWA, vanilla JS eller Preact. Fungerer offline. Ingen tredjeparts-SDK, ingen analytics-pixels.
- Lagring: IndexedDB kryptert med WebCrypto-nøkkel fra PIN. Eksport til fil (finnes allerede som `.txt`).
- Innhold som signerte JSON-pakker fra statisk hosting, slik at innhold kan oppdateres uten app-release og verifiseres mot åpen repo.
- Bots (Discord/Twitch) er tynne: de gir lenker og verktøy, lagrer ingenting om brukeren, og logger ikke meldingsinnhold.
- Valgfri AI-samtale (se Labben/Isolation Mirror): kun lokal modell eller eksplisitt opt-in, med harde rammer (seksjon 4).

---

## 3. Engasjementsstrategi for gutter

Prinsippet er å møte dem der de allerede er, med noe de faktisk vil ha, og la hjelpen ligge innbakt.

**Posisjonering:** Ikke «psykisk helse-app». Heller «Systemet for når hodet går i stykker». Mindre terapi, mer verktøykasse. Tenk vedlikehold, ikke reparasjon.

**Språk som funker vs. ikke:**

| Ikke | Heller |
|---|---|
| «Hvordan føler du deg?» | «Status på batteriet? 1–5» |
| «Søk hjelp» | «Ring inn forsterkninger» |
| «Du er ikke alene» | «847 andre sjekket inn i går» (aggregert, anonymt, opt-in) |
| «Psykiske plager» | «Dårlig periode», «hodet er fullt», «alt er grått» |
| «Mestringsstrategier» | «Ting som funker» |

Ord velges sammen med gutter i målgruppa, ikke av kommunikasjonsbyrå. Test hvert ord med 10 stykker. Stryk alt som får dem til å himle med øynene.

**Konkrete grep:**

1. **Garderobe-QR.** Klistremerke inne i garderobeskap i idrettshaller og på treningssentre: «Hodet tungt etter trening/kamp? 60 sek.» Ingen logo fra helsevesenet.
2. **Frisør-modellen.** Frisører og barberere får et kort med tre setninger å si og en QR å vise fram. Gutter snakker i frisørstolen. Lignende modeller er prøvd ut internasjonalt.
3. **Gaming-integrasjon.** Discord-bot med `/pause` (pust), `/status`, `/kompis`. Streamere med stort guttepublikum snakker åpent om egne dårlige perioder, uten manus fra oss, med lenke i panelet.
4. **Kompis først.** Lansering via «Slik sjekker du en kompis uten at det blir rart». Det gir inngang uten å måtte innrømme noe selv. Mange oppdager underveis at de selv er målgruppa.
5. **Ekte stemmer.** Korte tekst- og lydklipp fra gutter 16–25 om hvordan de kom seg gjennom en dårlig periode. Fokus på hva de *gjorde*, ikke detaljer om hvor ille det var. Ingen glorifisering av krisen, ingen «heltehistorie».
6. **Null mas.** Ingen push-varsler med mindre brukeren selv har slått det på. Ingen streaks som straffer. En app som maser blir slettet.

**Måling uten overvåking:** Telle opp åpninger av viderekoblingskortet og bruk av Kompis-modus som anonyme tall, opt-in, med differensielt personvern. Ikke spor enkeltpersoner. Aldri.

---

## 4. Åpen kildekode & etikk-rammer

«No censor» betyr her: ingen tema er tabu, ingen spørsmål blir avvist, ingen blir moralisert. Det betyr *ikke* at systemet deler informasjon som øker risiko. Det er heller ikke sensur, det er det forskningen på mediedekning (Werther-/Papageno-effekten) faktisk viser.

**Harde grenser (ikke forhandlingsbare, dokumentert åpent i repo):**
- Ingen informasjon om metoder, doser, steder eller «hvordan».
- Ingen innhold som framstiller selvmord som løsning, heltemodig eller romantisk.
- Viderekobling er aldri skjult, aldri betalt, aldri bak et skjema.

**Åpent om alt annet:** Du kan skrive at du vil dø. Systemet blir ikke redd, låser ikke skjermen og sender deg ikke bort. Det svarer rolig, tar det på alvor og viser hvor du kan få en ekte stemme nå.

**Lisenser:**
- Kode: AGPL-3.0. Hvem som helst kan bruke den, men forks som kjører som tjeneste må dele endringene. Dette hindrer lukkede, kommersielle «data-høster»-varianter.
- Innhold: CC BY-SA 4.0.
- Varemerke/navn beskyttes separat, så en fork som fjerner sikkerhetsgrensene ikke kan kalle seg det samme.

**Ansvarlighet uten sensurstyre:**
- **Ungdomsråd** (gutter 15–24, betalt for tiden sin) med vetorett på språk og design.
- **Fagråd** (selvmordsforebygging, klinikk, jus/personvern) med vetorett kun på de harde grensene.
- **Offentlig endringslogg** for alt innhold og alle regler i signalmotoren. Hvem endret hva, og hvorfor.
- **Hendelsesrutine:** Hvis systemet kan ha bidratt til skade, gjøres en åpen gjennomgang (anonymisert) innen 30 dager.

**Juss og personvern:**
- Helseopplysninger er særlige kategorier etter GDPR art. 9. Løsningen: samle dem ikke inn. Alt lokalt.
- Aldersgrense for samtykke til informasjonssamfunnstjenester i Norge er 13 år. Uten konto og innsamling blir dette i stor grad irrelevant, men dokumentér vurderingen.
- Unngå diagnostiske påstander («oppdager depresjon»). Da kan programvaren regnes som medisinsk utstyr (MDR). Hold det på verktøy- og viderekoblingsnivå.

---

## 5. Implementeringsveikart

**Fase 0 — Grunnmur (mnd 0–2)**
- Etabler ungdomsråd (8–12 gutter, spredt på by/bygd, yrkesfag/studiespes, med og uten egen erfaring).
- Avtale med minst én fagmiljø-partner for kvalitetssikring av harde grenser og viderekoblingstekster.
- Skriv `SIKKERHET.md`: grenser, viderekoblingsliste, hendelsesrutine.

**Fase 1 — Rolig 2.0 (mnd 2–5)**
- PWA med ikon, offline og dark mode (de manglene står allerede i `HULL.md`).
- Moduler: Verktøy, Min plan, Viderekobling på hver skjerm.
- Kryptert lokal lagring med PIN.
- Test på ekte telefoner med 30 gutter. Mål: kan de finne viderekoblingen på under 5 sekunder? Ville de hatt den liggende?

**Fase 2 — Kompis + første inngang (mnd 5–8)**
- Kompis-modus med maler og skript.
- Discord-bot (`/pause`, `/status`, `/kompis`) og pilot i 3–5 servere med moderatorer som har fått kort opplæring.
- Garderobe-QR i 2 idrettslag og 1 treningssenter.

**Fase 3 — Signalmotor + innhold (mnd 8–12)**
- Lokal regelbasert signalmotor, reglene åpent i repo og gjennomgått av fagråd.
- Ekte stemmer: 20–30 klipp.
- Opt-in anonym telling med differensielt personvern.

**Fase 4 — Skalering (år 2)**
- Twitch-panel, frisørpilot, samarbeid med førstegangstjenesten og lærlingeordninger.
- Uavhengig evaluering (ikke av de som bygde det).
- Oversettelse: nynorsk, samisk, engelsk, og språk som brukes av store grupper unge innvandrergutter.

**Beslutningsporter:** Hver fase avsluttes med et ja/nei fra ungdomsrådet *og* fagrådet. Rådet sier «dette ville jeg aldri brukt»? Da går dere tilbake, ikke videre.

**Hva dere ikke skal bygge (ennå):** Åpent forum, chat mellom brukere, eller AI-samtale uten grenser. Moderering av krisesamtaler 24/7 krever folk og penger dere ikke har i år 1. Halvveis moderering er verre enn ingen.

---

## 6. Samarbeidsmodeller & ressurser

Systemet er en inngangsdør, ikke et rom. Verdien ligger i hvor døra fører.

**Viderekobling (verifiser nummer og åpningstider før lansering, og legg dem i én konfigfil):**

| Tjeneste | Hva |
|---|---|
| 113 | Akutt fare for liv |
| 116 117 | Legevakt |
| Mental Helse Hjelpetelefonen 116 123 | Døgnåpen telefon og chat |
| Kirkens SOS 22 40 00 40 | Døgnåpen telefon, chat via nettsiden deres |
| Alarmtelefonen for barn og unge 116 111 | For under 18 |
| Røde Kors Kors på halsen | Chat/telefon for unge opp til 18 |
| ung.no | Spørretjeneste, statlig |

**Fagmiljøer for kvalitetssikring:**
- Nasjonalt senter for selvmordsforskning og -forebygging (NSSF): kunnskapsgrunnlag, harde grenser, evaluering.
- RVTS (regionale ressurssentre om vold, traumatisk stress og selvmordsforebygging): opplæring (f.eks. VIVAT-kurs) for moderatorer, trenere og frisører.
- Mental Helse Ungdom: ungdomsmedvirkning og nettverk.

**Inngangspartnere (der gutter er):**
- Idrettslag og særforbund: garderobe-QR, trenerkort.
- E-sport- og gamingmiljøer: Discord-servere, streamere, LAN-arrangører.
- Frisører/barberere: kort + QR + kort opplæring.
- Videregående yrkesfag og lærlingbedrifter: via fagforeninger og bransjeorganisasjoner, ikke via helsesykepleier alene.
- Førstegangstjenesten: tidlig i tjenesten, når mange er langt hjemmefra for første gang.

**Samarbeidsmodell:**
- Partnere får gratis tilgang til alt materiell, åpen lisens, og kan sette sin egen avsender på det. Ingen eksklusivitet.
- Fagpartnere signerer på de harde grensene, ikke på tone og design. Ungdom eier tonen.
- Avtal på forhånd hvem som tar telefonen når en partner (f.eks. en trener) står i en akutt situasjon. Kompis-modus må fungere for voksne også.

**Finansiering:** Helsedirektoratets tilskuddsordninger for psykisk helse og selvmordsforebygging, Stiftelsen Dam, Gjensidigestiftelsen og sparebankstiftelser. Ingen finansiering som krever brukerdata eller sporing som motytelse.

**Ressursbehov år 1 (minimum):** 1 utvikler, 1 innholds-/ungdomskoordinator, honorar til ungdomsråd, timer fra fagråd, budsjett for brukertesting. Ingen markedsføringsbudsjett. Distribusjon skjer gjennom partnere og ekte stemmer, ellers er det bortkastet.
