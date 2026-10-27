# Mimamori: fem konsepter

Alle konseptene bygger på samme japanske grunnidé: *mimamori*, å våke over noen uten å overvåke dem. Rammen er hjemmeboende og sykehjemsbeboere, uten kameraer der det kan unngås, og uten medisinske påstander.

---

## 1. Rutinesporet – kjelen som sier «god morgen»

- **Problem:** Hjemmeboende eldre kan bli liggende syke eller falne i timevis uten at noen merker det. Kameraer og alarmknapper føles som overvåking, og alarmknappen ligger ofte i skuffen.
- **Målgruppe:** Hjemmeboende over [alder] som bor alene, og pårørende som bor langt unna.
- **Slik virker det:** Små sensorer settes på ting som allerede brukes hver dag, som vannkoker, kjøleskapsdør, kaffetrakter og toalettspyling. Systemet lærer døgnrytmen i 2–3 uker. Pårørende får en grønn prikk når dagen ser normal ut, og et varsel når rytmen brytes (for eksempel ingen kjele innen kl. 11). Den eldre har en enkel lampe som lyser når en pårørende har «tittet innom» digitalt, så oppmerksomheten går begge veier.
- **Livskvalitet, selvstendighet og sikkerhet:** Ingen bærbar dings, ingen kamera og ingen endring i hverdagen. Lampen gjør tilsynet til omsorg som synes, ikke kontroll.
- **Gjennomførbarhet:** Hyllevare som Zigbee-kontaktsensorer og smartplugger, pluss en enkel regelmotor. Mulige partnere er kommunal velferdsteknologi og strømselskaper med smarthjem-plattform.
- **Implementering:** Fase 1 med [10] hjem i [fase_varighet]. Fase 2 med pårørendeapp og lampe. Fase 3 med kommunal pilot.
- **Validering:** Tid fra hendelse til oppdagelse, andel falske varsler per uke, og intervjuer om opplevd trygghet med både eldre og pårørende.
- **Risiko og tiltak:** Varsler som roper ulv for ofte. Det løses med adaptiv baseline og «snooze»-dager (hyttetur, besøk). Personvern sikres med lokal prosessering, og bare avvik sendes ut.
- **Japansk inspirasjon:** Zojirushis i-Pot fra 2001, en vannkoker som varsler familien når den brukes. Nyheten her er tilbakekanalen, altså at den eldre ser at noen bryr seg.

---

## 2. Smaksløftet – bestikk som gir maten smaken tilbake

- **Problem:** Smak og lukt svekkes med alderen. Maten blir kjedelig, folk spiser mindre, og saltfattig kost gjør det verre. Underernæring er et kjent problem på norske sykehjem.
- **Målgruppe:** Sykehjemsbeboere, med en undergruppe som går på saltredusert kost. Hjemmeboende kommer i fase 2.
- **Slik virker det:** En skje og gaffel sender en svak elektrisk strøm som forsterker opplevd salt- og umamismak uten mer salt. Bestikket logger antall løft per måltid og gir pleierne en enkel oversikt over hvem som spiser mindre enn vanlig denne uka.
- **Livskvalitet, selvstendighet og sikkerhet:** Måltidet er dagens høydepunkt på et sykehjem, og bedre smak er livskvalitet man merker umiddelbart. Spiselogging fanger nedgang før den synes på vekta.
- **Gjennomførbarhet:** Teknologien finnes kommersielt i Japan. Det som trengs er tilpasning til grovmotorikk (tykt skaft, vektet) og oppvaskmaskintåleligheten. Mulige partnere er kjøkkenleverandører til sykehjem og ergoterapimiljøer.
- **Implementering:** Fase 1 med smakstester på [2] sykehjem. Fase 2 med spiselogging. Fase 3 med innkjøpsavtale med kommune.
- **Validering:** Andel tallerken spist, beboernes egen vurdering av måltidet, og pleiernes tid brukt på matregistrering.
- **Risiko og tiltak:** Pacemakerbrukere må vurderes, så det trengs en klinisk avklaring før pilot. Hygiene sikres med avtagbar elektronikkdel.
- **Japansk inspirasjon:** Kirins elektriske saltskje, utviklet med Meiji-universitetet. Nyheten her er koblingen til spiselogging og omsorgsdata.

---

## 3. Fortellerradioen – sykehjemmet som snakker med barnehagen

- **Problem:** Ensomhet og følelsen av å være unyttig. Sykehjemsbeboere har livserfaring som ingen spør etter.
- **Målgruppe:** Sykehjemsbeboere, inkludert personer med mild til moderat demens, og en partnerbarnehage.
- **Slik virker det:** En retro radio med én stor knapp. Beboeren trykker og forteller («Da jeg var sju, fant jeg en hval i fjæra…»). Opptaket spilles av i barnehagens radio, og barna spiller inn spørsmål og tegninger som kommer tilbake. Teknologien er usynlig, men stoffet er ekte.
- **Livskvalitet, selvstendighet og sikkerhet:** Det gir en rolle og et formål, det japanerne kaller *ikigai*. Beboeren gir noe i stedet for bare å motta.
- **Gjennomførbarhet:** Raspberry Pi, mikrofon og høyttaler i et treskap, lav kostnad. Mulige partnere er kommunale barnehager, frivilligsentraler og Den kulturelle spaserstokken.
- **Implementering:** Fase 1 med ett sykehjem og én barnehage i [fase_varighet]. Fase 2 med fysiske møter som oppstår naturlig. Fase 3 med nettverk og et lokalhistorisk arkiv (med samtykke).
- **Validering:** Antall opptak per uke, pleiernes observasjoner av humør og deltakelse, og tilbakemeldinger fra barnehageansatte.
- **Risiko og tiltak:** Samtykkekompetanse ved demens krever pårørendesamtykke og at personalet lytter gjennom før utsending. Upassende innhold fanges av samme gjennomlytting.
- **Japansk inspirasjon:** Kotoen i Tokyo, som har kombinert eldreinstitusjon og barnehage siden 1976. Nyheten er at det fungerer uten at noen må bygge om bygget.

---

## 4. Nattstien – lyset som går foran deg til toalettet

- **Problem:** Nattlige toalettbesøk er en av de farligste stundene for eldre: mørke, svimmelhet når man reiser seg, og et ukjent rom.
- **Målgruppe:** Både sykehjem og hjem, særlig de med økt fallrisiko.
- **Slik virker det:** En sensormatte under madrassen merker at personen setter seg opp. LED-lister ved gulvet lyser opp en sti til toalettet trinnvis, og en rolig stemme sier: «Ta deg tid, sitt litt først.» Hvis personen ikke er tilbake i senga etter [X] minutter, får nattevakt eller pårørende et diskré varsel.
- **Livskvalitet, selvstendighet og sikkerhet:** Personen klarer seg selv om natta, og pleieren slipper unødvendige runder som vekker beboerne.
- **Gjennomførbarhet:** Madrass-sensorer finnes allerede, og LED-lister og høyttaler er billige. Det nye er koreografien mellom dem. Mulige partnere er hjelpemiddelsentraler og leverandører av sykehjemsenger.
- **Implementering:** Fase 1 med [5] rom på ett sykehjem. Fase 2 med hjemmeversjon. Fase 3 med integrasjon i eksisterende pasientvarslingssystemer.
- **Validering:** Antall nattlige fall per [1000] beboerdøgn, nattevaktenes tidsbruk, og søvnkvalitet målt med beboernes egen vurdering.
- **Risiko og tiltak:** Lyset kan forstyrre søvnen, så det brukes varmt og dempet lys under [lux-grense]. Teknisk feil håndteres ved at systemet aldri erstatter eksisterende alarm, bare legges oppå.
- **Japansk inspirasjon:** Paramount Beds sengesensor Nemuri SCAN og Japans lange tradisjon med passive tilsynssystemer. Nyheten er at systemet *handler* (lyser opp, snakker) i stedet for bare å varsle.

---

## 5. Samtaleboksen – din eldreboks, skjerpet

- **Problem:** Ensomhet, glemte avtaler og gradvis svekkelse som pårørende oppdager for sent.
- **Målgruppe:** Hjemmeboende eldre, betalt av 1–5 pårørende.
- **Slik virker det:** En vennlig boks på 50–80 cm som den eldre kan snakke med når som helst. Den prater om TV-programmer, minner om vaksinetimer og stiller over tid de samme hverdagsspørsmålene på nye måter. Svarmønstrene sammenlignes med personens egen baseline, ikke med en norm.
- **Livskvalitet, selvstendighet og sikkerhet:** Personen har noen å snakke med klokka tre om natta, og pårørende får et tidlig signal uten å mase.
- **Gjennomførbarhet:** Budsjettet på 15 000–25 000 kr holder for en prototype med lokal talegjenkjenning og en språkmodell. Mulige partnere er pårørendeorganisasjoner og fastleger som mottakere av rapporter etter samtykke.
- **Implementering:** Fase 1 med [3] familier i 8 uker. Fase 2 med pårørendeportal. Fase 3 med abonnementsmodell.
- **Validering:** Samtaler per dag, opplevd ensomhet (kort skala før og etter), og pårørendes vurdering av varslene.
- **Risiko og tiltak:** Tre ting må avklares:
  - *Svekkelsessporing kan gjøre boksen til medisinsk utstyr under MDR.* Den bør derfor rammes inn som «endringsvarsel til pårørende» og aldri som vurdering av hukommelse eller diagnose.
  - *«Ingenting lagres permanent» kolliderer med sporing over tid.* Løsningen er å lagre bare en liten rullerende oppsummering lokalt, og aldri råopptak.
  - *Følelsesmessig avhengighet.* Boksen bør aktivt dytte mot ekte mennesker («Har du snakket med datteren din denne uka?»).
- **Japansk inspirasjon:** Fuji Softs PALRO, som leder aktiviteter på japanske sykehjem, og LOVOT. Nyheten er at boksen er bygget for én person over år, ikke for en gruppe i én time.

---

## Krysssjekk

| Konsept | Nyhet | Kostnad | Tid til pilot |
|---|---|---|---|
| Rutinesporet | Tilbakekanal | Lav | Kort |
| Smaksløftet | Smak + spiselogg | Middels | Middels |
| Fortellerradioen | Rolle, ikke underholdning | Svært lav | Kort |
| Nattstien | Handler, ikke bare varsler | Lav–middels | Kort |
| Samtaleboksen | Personlig baseline over år | Middels | Middels (MDR-avklaring) |

Fortellerradioen er raskest å teste og billigst å feile med. Samtaleboksen har størst kommersielt potensial, men bare hvis den regulatoriske innrammingen er riktig fra første dag.
