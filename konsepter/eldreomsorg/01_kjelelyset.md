# 1. Kjelelyset

**Tagline:** Morgenkaffen sier fra til familien, uten kamera og uten knapp.
**Rolle:** rask gevinst · hybrid (IoT, lav terskel)

## 2. Målgruppe og kontekst
- Hjemmeboende over 75 år som bor alene.
- Pårørende som bor langt unna.
- Hjemmetjenesten, for brukere med vedtak om tilsyn.

## 3. Problemstilling
- **Ensomhet og avstand:** Kontakten blir til kontroll («Har du stått opp?»), ikke til samvær.
- **Langvarig liggetid etter fall** (*long lie*): Mange eldre bruker ikke trygghetsalarmen fordi den føles stigmatiserende `[skjønn]`. Den virker heller ikke hvis de er bevisstløse.
- **Kamera oppleves krenkende,** og smartklokker blir liggende i skuffen.
- **Smertepunkt:** «Jeg vil ikke være til bry», sier den eldre. «Jeg ligger våken og lurer», sier den pårørende.

## 4. Konsept og brukerreise
Vannkokeren eller kaffetrakteren er det mest stabile hverdagsritualet vi har. En smartplugg under den merker når den brukes. Hos den pårørende står en liten lampe som gløder varmt når mamma har laget kaffe.

1. **Oppstart:** Hjemmetjenesten eller familien setter inn pluggen og to lamper, og det er alt. De første 14 dagene lærer systemet hva som er normal rytme.
2. **Morgen klokken 07.40:** Ragnhild koker kaffe. Pluggen registrerer strømtrekket, og Livs lampe i Oslo gløder gult i én time.
3. **Ingen kaffe innen to timer etter vanlig tid:** Livs lampe pulserer svakt, og appen foreslår: «Ring gjerne mamma.»
4. **Ingen aktivitet etter tre timer og ingen svar på telefon:** Hvis familien har valgt det, går det varsel til kommunens responssenter.
5. **Toveis hilsen:** Liv trykker på sin lampe, og Ragnhilds lampe på kjøkkenbenken lyser («tenker på deg»). Ragnhild kan trykke tilbake. Det blir små hilsener i stedet for kontrollsamtaler.
6. **Borte-modus:** Ragnhild holder lampen inne i tre sekunder når hun reiser til hytta. Da kommer det ingen varsler.

## 5. Nøkkelfunksjoner og fordeler
- **Helt passivt:** ingenting å bære og ingenting å huske.
- **Lærer normal rytme,** slik at varslene gjelder avvik fra *hennes* normal og ikke fra en standard.
- **Toveis lyshilsen:** skaper nærhet, ikke bare kontroll.
- **Eskaleringstrapp:** først lys, så forslag om å ringe, så responssenteret, og bare hvis familien har valgt det.
- **Varsler når pluggen er tatt ut** eller strømmen har gått.
- **Virker uten bredbånd og smarttelefon** hos den eldre, fordi huben har innebygd mobilnett.
- **Kan utvides:** dørsensor, TV-strøm og kjøleskapsdør.

## 6. Teknologi og komponenter
- **Smartplugg med effektmåling** (Zigbee eller Matter), som kjenner strømtrekket fra vannkoker eller trakter.
- **Hub med LTE-M** (mobilnett for små enheter), fordi mange eldre ikke har Wi-Fi. Den har reservebatteri.
- **Lampe:** ESP32-mikrokontroller, varm LED (2200–2700 K), berøringsflate på toppen, keramisk eller trelampe.
- **Logikk:** enkel statistisk modell for tidsvinduer, ikke dyp AI. Den er forklarbar og robust med lite data.
- **Sky:** server i EU/EØS, kryptert kommunikasjon, og standardprotokoll mot responssenter (for eksempel SCAIP) `[antakelse: må avklares med kommunens mottak]`.
- **Hvorfor disse valgene:** Komponentene er billige, kan hentes fra hyllen og stigmatiserer ikke. Hverdagsobjektet fungerer selv som sensor.

## 7. TRL og gjennomførbarhet
- **TRL:** Komponentene ligger på 8–9 og systemet på 5–6. **Gjennomførbarheten er høy.**
- **Barriere: falske varsler** ved ferie, besøk eller sykdom. Mottiltak: borte-modus og at systemet lærer på nytt.
- **Barriere: integrasjon** mot ulike responssentre.
- **Barriere: mobildekning** i grisgrendte strøk. Mottiltak: reserve via SMS.

## 8. Prototype (MVP)
- **Bygg** av hyllevare: smartplugg, Home Assistant på Raspberry Pi med 4G-modem og to smartlamper (IKEA eller Hue). Byggetid er to uker.
- **Test** med **10 par** (eldre og pårørende) i 8 uker. Mål:
  - om de bruker den og liker den
  - hvor mange falske varsler som kommer per uke
  - hvor mange kontrollsamtaler som faller bort
  - om de bruker lyshilsenen

## 9. Kostnadsoverslag: lav
| Post | Anslag | Antakelse |
|---|---|---|
| Utvikling | 1,5–3 MNOK | Industridesign, fastvare, pårørendeapp, CE- og RED-merking |
| Produksjonskost per sett | 600–900 kr | Hub, plugg og to lamper ved 5 000 sett i året |
| Pris | 1 990 kr + 99 kr/mnd | Inkluderer mobilnett, sky og support |
| Drift | 40–60 kr/mnd per bruker | Mobilnett, server og brukerstøtte |

## 10. Implementeringsplan
| Fase | Måneder |
|---|---|
| Konsept og brukerinnsikt | 2 |
| Prototype (MVP og designet lampe) | 3 |
| Pilot | 6 |
| Utrulling, første kommuner | 6–12 |
| **Totalt til marked** | **≈ 18** |

## 11. Pilot og suksesskriterier
- **Utvalg:** 40 husstander i to kommuner, rekruttert gjennom hjemmetjenesten, pluss 40 som får tilbudet etter seks måneder og er kontrollgruppe.
- **Tid:** 6 måneder.

| KPI | Mål for å fortsette |
|---|---|
| Ensomhet (UCLA-3, 3–9) | −1 poeng i snitt mot kontrollgruppen |
| Pårørendes bekymring (1–5) | −1 poeng |
| Falske varsler | < 0,3 per uke |
| Fortsatt i bruk etter 6 mnd | > 80 % |
| Liggetid over 1 t etter fall | Registreres (for lite tall til å påvise effekt i pilot) |
| Hjemmetjenestens tid til kontrollbesøk | −20 % for brukere med tilsynsvedtak |

## 12. Etikk, personvern og regelverk
- **Data:** tidspunkt for strømtrekk (ikke innhold), lampetrykk og avvik i rytmen. Avledet kan dette si noe om helse, så det behandles som særlig kategori etter **GDPR art. 9**. Det må gjøres en personvernkonsekvensvurdering (DPIA).
- **Samtykke:** Den eldre samtykker selv og bestemmer hvem som får se. Uten samtykkekompetanse kreves vurdering etter pasient- og brukerrettighetsloven, og bruk krever vedtak. Kjelelyset er ikke laget for de som ikke kan samtykke.
- **Lagring:** rådata i 30 dager, deretter bare ukessammendrag. Serverne står i EU/EØS.
- **Dilemma:** Det kan oppleves som om familien overvåker. Mottiltak:
  - Den eldre kan pause systemet.
  - Varslene er nøytrale («ring gjerne»), og det brukes aldri rødt lys.
  - Det finnes en logg over hvem som har sett hva.

## 13. Barrierer og risikoer
| Risiko | Mottiltak |
|---|---|
| Falsk trygghet (vannkokeren flyttes) | Huben varsler «sensor frakoblet», og flere kilder kan legges til |
| Pårørende blir overbelastet | Valgfri deling med søsken. Kommunen tar nivå 3 |
| «Jeg vil ikke» (kultur) | Lampen er en gave og ikke et hjelpemiddel. Selges som hilsen, ikke som alarm |
| Leverandørbinding | Åpen API og standardprotokoller |

## 14. Forretningsmodell og skalering
- **Betalere:** privat abonnement der pårørende betaler, og kommunen for brukere med tilsynsvedtak, som erstatning for noen kontrollbesøk.
- **Partnere:**
  - el-kjede som salgskanal
  - teleoperatør for mobilnett
  - kommunale responssentre
  - Pårørendealliansen
- **Beskyttelse:** Det er lite som kan patenteres, fordi Zojirushi i-POT (2001) er kjent teknikk. Bruk designregistrering av lampen og varemerke.

## 15. Bærekraft og materialer
- Pluggen er hyllevare, og lampen er laget av resirkulert keramikk eller lokalt tre.
- Elektronikken kan skiftes ut. Levetiden er 8–10 år, med fastvareoppdateringer i 10 år (EUs Cyber Resilience Act).
- Det er returordning, og lampene oppgraderes og leies ut på nytt.

## 16. Samarbeidspartnere og kompetanse
Elektronikk- og fastvareingeniør, industridesigner, ergoterapeut, hjemmetjenesten, responssenter, personvernombud og en pårørendeorganisasjon.

## 17. UI/UX og fysisk design
- **Lampen:** håndflatestor «lykt» i matt glasur, uten skjerm og knapper.
  - Ett trykk sender hilsen.
  - Holdes den inne i tre sekunder, går den i borte-modus.
  - Lysene betyr:
    - fast varmt gult: «i dag er alt som vanlig»
    - langsom puls: «ring gjerne»
    - kort glød: «hilsen mottatt»
- **Pårørendeappen** har én side: «I dag: kaffe 07.42 ✓ · hilsen sendt 09.10». En ukesstripe viser rytmen. Den har ingen grafer med helsespråk.

```
   .-""-.      lampe hos Liv
  /  ☼   \     (gløder når
  \______/      mamma har
   |____|       laget kaffe)
```

## 18. Hvorfor uventet
Den snur trygghetsalarmen fra en nødknapp til en daglig hilsen. Den bygger på Zojirushis i-POT og *mimamori*-tanken om å se til noen uten å se på dem.

## Scenario: Ragnhild, 84
Ragnhild får lampen i julegave av Liv. Hun ler av den, men liker at den lyser når Liv trykker på sin. Morgensamtalene klokken 08 blir borte. Liv ringer heller på kvelden for å prate.

En tirsdag i mars kommer ikke kaffen. Livs lampe pulserer klokken 09.50, og Ragnhild svarer ikke på telefonen. Hjemmetjenesten er der klokken 10.40 og finner henne på badegulvet, der hun har ligget i to timer, ikke i to døgn.
