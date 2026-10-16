# 9. SAMLET VURDERING — DE TI STERKESTE

> Klokka er 05:15. Kaffen er tom. Vinden har gitt opp å flytte Norge.
> Nå skal jeg være brutal mot mine egne barn. Femti konsepter inn, ti ut. Resten er gode nok til å drømme om og for dårlige til å bruke de neste tolv månedene av livet ditt på.

## Kriterier (1–5)

| Kode | Kriterium | Hva 5 betyr |
|---|---|---|
| **O** | Originalitet | Finnes knapt i denne formen |
| **G** | Gjennomførbarhet | Én person + AI kan få en ekte versjon på 1–3 måneder |
| **S** | Samfunnsverdi | Kan redde liv eller endre livet til mange |
| **K** | Kommersielt potensial | Tydelig betalingsvillig marked eller finansieringsvei |
| **R** | Lav ressurs | Under 10 000 kr og ingen kritisk partner for å komme i gang |

## Topp ti

| # | Konsept | Kategori | O | G | S | K | R | **Sum** |
|---|---|---|---|---|---|---|---|---|
| 1 | **Brevknuseren → KONTRADIKSJON** | App + multiagent | 4 | 5 | 5 | 4 | 5 | **23** |
| 2 | **Isrøsten** | Oppfinnelse | 5 | 4 | 5 | 4 | 5 | **23** |
| 3 | **Konkursnettverket** | Forskning | 4 | 5 | 4 | 4 | 5 | **22** |
| 4 | **Impulsbremsen** | App | 4 | 5 | 4 | 3 | 5 | **21** |
| 5 | **OBDUKSJON** | SoMe | 4 | 5 | 3 | 4 | 5 | **21** |
| 6 | **Statistisk obduksjon** | Forskning | 4 | 4 | 5 | 3 | 4 | **20** |
| 7 | **Dosevakt** | Oppfinnelse | 4 | 4 | 5 | 4 | 3 | **20** |
| 8 | **Pulsspeil** | App (prototype finnes) | 3 | 5 | 4 | 3 | 5 | **20** |
| 9 | **Protokoll fra et indre ting** | Bok | 5 | 4 | 3 | 4 | 4 | **20** |
| 10 | **Kontoutskrift** | Bok | 5 | 4 | 3 | 3 | 5 | **20** |

**Rett utenfor:** Kvikkleire fra verdensrommet (18 — viktig, men fysikken kan si nei og n er lite), Kapillær (18 — stor verdi, men tung regulering), *Fondet* (19 — stort filmpotensial, men satiren krever lang modning).

**Raskest å realisere av alt:** Sangene. «Renter på renter» og «Ryggen min er min» kan være ute på strømmetjenester om en uke. Det er ikke en strategi. Det er en ventil. Bruk den.

### Hvorfor rekkefølgen er som den er

1. **Brevknuseren** vinner fordi den er den eneste som er *billig, rask, ekte nyttig og en trapp*: Dag 1 er den en app. År 1 er den et multiagent-system. År 3 er den infrastruktur for rettshjelp. Den løser et problem du selv kjenner fra innsiden, og det er en urettferdig fordel.
2. **Isrøsten** er den mest originale ideen i hele samlingen og har billigst prototype. Den taper tiebreaken bare fordi fysikken ennå ikke er bevist, og fordi den krever patentdisiplin *før* man kan snakke høyt om den.
3. **Konkursnettverket** har åpne data, et tydelig spørsmål og et svar som noen (Skatteetaten, journalister, kreditorer) vil betale for. Risikoen er etisk, ikke teknisk.
4–5. **Impulsbremsen** og **OBDUKSJON** kan begge startes i morgen uten penger.
6–10. Sterke, men hver med én tung hindring: lisens og uttrekkskvalitet, regulering, nøyaktighet, eller lang skrivetid.

---

# 30-DAGERS HANDLINGSPLANER FOR TOPP TRE

Regel for alle tre: **Hver uke ender med noe som kan vises til et annet menneske.** Og hver plan har et *drepekriterium*: et ærlig punkt der du legger den bort.

---

## #1 BREVKNUSEREN (første steg mot KONTRADIKSJON)

**Mål etter 30 dager:** En fungerende PWA som 8 ekte brukere har testet på syntetiske brev, med en testet regelmotor for inkassofrister og gebyrsjekk, og én avtale med en rettshjelps- eller gjeldsrådgivningsaktør om å se på resultatet.

**Budsjett:** < 2 000 kr (API-kall, domene).

### Uke 1 — Fundament og data
| Dag | Oppgave | Leveranse |
|---|---|---|
| 1 | Opprett Vite + React + TS-prosjekt, PWA-oppsett, IndexedDB via `idb`. Gjenbruk Pusterom-designtokens. | Tom app på mobilen |
| 2 | Lag 30 **syntetiske** testbrev: inkassovarsel, betalingsoppfordring, NAV-vedtak, forhåndsvarsel, utleggsvarsel. Bruk offentlige maler og lovens minstekrav, og fiktive navn. | `testdata/` |
| 3 | Fasit-JSON for alle 30 (avsender, type, beløp, frister). | Gullstandard |
| 4–5 | Ekstraksjon via vision-LLM med JSON-schema + evalueringsskript som måler treffsikkerhet per felt. | Første tall: X % korrekt |
| 6–7 | Forbedre prompt og schema til ≥ 90 % på feltnivå. Logg alle feil. | Feillogg |

### Uke 2 — Regelmotoren (den delen ingen kan kopiere)
| Dag | Oppgave |
|---|---|
| 8–9 | Fristregler som ren TypeScript: klagefrister (folketrygdloven § 21-12, forvaltningsloven § 29) og betalingsfrister i inkassoloven (§§ 9–10 **[A: verifiser ordlyd og frister]**). Helg- og helligdagsforskyvning. |
| 10–11 | `satser/2026.json` med maksimalsatser fra inkassoforskriften (med kilde-URL og hentedato). Gebyrsjekk som flagger beløp over maks. |
| 12 | Foreldelsessjekk (veiledende, med tydelig forbehold). |
| 13–14 | **100+ enhetstester** og property-based tester (`fast-check`). CI på GitHub Actions. |

### Uke 3 — Brukeropplevelse og mennesker
| Dag | Oppgave |
|---|---|
| 15–17 | Risikokort, nedtelling, «Hva vil de?», kalendereksport (.ics), opplesning med Web Speech API. |
| 18 | Svarutkast-maler: be om nedbetalingsavtale, innsigelse, be om spesifikasjon. |
| 19 | **Kontakt:** Send én e-post hver til Jussbuss, JURK, Jusshjelpa i Nord-Norge og NAVs økonomi- og gjeldsrådgivning. Be om 30 minutter til å gå gjennom malene. |
| 20–21 | Personvernerklæring + forenklet DPIA. Bilder sendes ikke videre og lagres ikke hos proxy. |

### Uke 4 — Test, sannhet, beslutning
| Dag | Oppgave |
|---|---|
| 22–25 | Brukertest med 5–8 personer (via en frivillig organisasjon eller nettverk), **med syntetiske brev**. Mål: Forstår de fristen på < 30 sek? Hva skremmer dem? |
| 26–27 | Rett opp de tre største problemene. |
| 28 | Skriv en side: «Hva vi lærte». |
| 29 | Søk Stiftelsen Dam / Sparebankstiftelsen / Innovasjon Norge oppstartsmidler (skisse). |
| 30 | **Beslutning.** |

**Suksesskriterier:** ≥ 90 % korrekt uttrekk av frister og beløp · 0 feil i regelmotortester · ≥ 6 av 8 testbrukere forstår fristen på under 30 sekunder · minst én fagperson har gitt skriftlig tilbakemelding på malene.

**Drepekriterium:** Hvis ingen fagperson vil se på malene, og testbrukerne ikke forstår mer enn de gjorde med brevet alene, er problemet et annet enn du tror. Snu da mot rådgiver-verktøyet i stedet for publikumsappen.

---

## #2 ISRØSTEN

**Mål etter 30 dager:** Prinsippbevis i en kontrollert analog modell, nyhetssøk gjennomført, møte med patentrådgiver booket, og en feltplan klar til første is.

**Budsjett:** < 5 000 kr (materialer, eventuelt første rådgivningstime).

**Absolutt regel: Ingenting om metoden publiseres, postes, pitches eller pushes til offentlig repo før søknad er vurdert.** Bruk taushetserklæring i alle samtaler.

### Uke 1 — Teori og nyhetssøk
| Dag | Oppgave |
|---|---|
| 1–2 | Simulering i Python: dispersjonsmodell for flytende plate (inkludert vannkobling), generer syntetiske opptak og test om tykkelsen kan estimeres og hvor robust det er mot støy. |
| 3–5 | **Nyhetssøk:** Espacenet + Google Patents (søkeord: ice thickness acoustic, flexural wave dispersion, smartphone ice, singing ice) + Google Scholar (sea ice seismology, lake ice acoustics). Lag en tabell over alt som ligner. |
| 6–7 | Skriv en fortrolig oppfinnelsesbeskrivelse med dato (oppfinnerjournal). |

### Uke 2 — Analog modell på kjøkkenbenken
| Dag | Oppgave |
|---|---|
| 8–10 | Bygg analog: plater i kjent materiale og tykkelse som flyter i et stort kar eller basseng. Tykkelse og stivhet er kjent, så fasiten er sikker. |
| 11–13 | Ta opp 100+ slag på ulike avstander og platetykkelser med mobil. |
| 14 | Analyse: Gjenfinner metoden kjent tykkelse? Hvor stor er feilen? |

### Uke 3 — Beskyttelse og partnere
| Dag | Oppgave |
|---|---|
| 15 | Bestill et første møte med patentrådgiver (mange tilbyr gratis eller rimelig første samtale **[A]**). Vurder Patentstyrets nyhetsgransking. |
| 16–17 | Forbered møtet: oppfinnerjournal, analogresultater, prior art-tabell. |
| 18–19 | Identifiser partnere under NDA: en isforsker eller glasiolog (NTNU, UiT, UNIS), en redningsorganisasjon og en skøyteklubb med lang erfaring i å lese is. |
| 20–21 | Utkast til søknad om Innovasjon Norge-oppstartsmidler (uten metodedetaljer). |

### Uke 4 — Første is
| Dag | Oppgave |
|---|---|
| 22–25 | Følg isforholdene (høyfjell, Røros, Finnmarksvidda, Nord-Sverige). Hvis det finnes trygg, tykk is: feltforsøk med bor hver 10. meter som fasit, med følge og redningsutstyr. Hvis ikke: utvid analogforsøkene med vannkoblings- og temperaturvariasjon. |
| 26–28 | Analyse og ærlig evaluering: feil og spredning, og hvilke forhold som ødelegger målingen. |
| 29 | Patentmøte. |
| 30 | **Beslutning:** søke, utvikle videre eller legge bort. |

**Suksesskriterier:** Gjenfinner kjent tykkelse i analogen med ≤ 20 % feil · prior art-søk finner ikke en identisk løsning · patentrådgiver ser en reell kravmulighet.

**Drepekriterium:** Hvis feilen i analogen er > 50 % selv under ideelle forhold, eller nyhetssøket finner en identisk metode, legg patentsporet bort. Ideen kan fortsatt leve videre som åpen kildekode eller som forskning.

---

## #3 KONKURSNETTVERKET

**Mål etter 30 dager:** Et ferdig datasett, de første deskriptive funnene om hvordan konkurser fordeler seg på personer og nettverk, en baseline-modell, og et 6–8 siders forskningsnotat som er klart for faglig tilbakemelding.

**Budsjett:** ~0–1 000 kr (alt kjører lokalt; LLM bare til tvetydig entitetsoppløsning).

### Uke 1 — Data
| Dag | Oppgave |
|---|---|
| 1 | Last ned Enhetsregisteret (åpne data fra data.brreg.no) til DuckDB. |
| 2–3 | Hent roller (Brregs åpne API, eventuelt totalbestand **[A: sjekk tilgjengelige bulkfiler og bruksvilkår]**). Respekter rate limits. |
| 4 | Kartlegg hvilke personidentifikatorer som faktisk er åpne (navn og fødselsdato?) og hva vilkårene sier om bruk. **Juridisk sjekk før videre arbeid.** |
| 5–7 | Datamodell: `person`, `enhet`, `rolle(fra, til, type)`, `hendelse(konkurs, avvikling)`. Rens og dedupliser. |

### Uke 2 — Nettverket
| Dag | Oppgave |
|---|---|
| 8–9 | Bygg en bipartitt graf (person–enhet) og projiser den. |
| 10–11 | Deskriptiv statistikk: konkurser per person, Lorenz-kurve og Gini, topp 1 % sin andel. **Første kjernefunn.** |
| 12–13 | Fellesskapsdeteksjon (Leiden), klyngestatistikk per bransje (NACE) og geografi. |
| 14 | Visualiser 3–5 anonymiserte klyngeeksempler. |

### Uke 3 — Prediksjon
| Dag | Oppgave |
|---|---|
| 15–16 | Kohorter: alle selskaper aktive 1.1.2020, utfall = konkurs innen 24 mnd. |
| 17–18 | Baselinemodell uten nettverk (bransje, alder, kapital, størrelse) mot modell med nettverkstrekk (tidligere konkurser i klyngen, rollerotasjon, felles regnskapsfører). |
| 19–20 | Tidsbasert validering, kalibrering og skjevhetsanalyse per bransje og region. |
| 21 | Tolk: Hvor mye forklarer nettverket? |

### Uke 4 — Formidling og validering
| Dag | Oppgave |
|---|---|
| 22–25 | Skriv notat: spørsmål, data, metode, funn, begrensninger og etikk. **Kun aggregerte resultater, ingen navn.** |
| 26 | Send til 2–3 fagpersoner (NHH, BI, Handelshøyskolen ved UiT) og be om kritikk. |
| 27 | Ta kontakt med én datajournalist (E24, DN, NRK) om et mulig samarbeid på aggregert nivå. |
| 28–29 | Vurder preprint (SSRN/OSF) og en åpen kodebase *uten* persondata. |
| 30 | **Beslutning:** forskningssporet, det journalistiske sporet eller B2B-risikoverktøy, eller alle tre. |

**Suksesskriterier:** Komplett graf med ≥ 95 % av konkursene dekket · tydelig mål på konsentrasjon (for eksempel hvor stor andel av konkursene topp 1 % av rolleinnehaverne står for) · nettverksmodellen slår baseline målbart (AUC eller Brier-skår) · minst én fagperson sier at det er nytt.

**Drepekriterium:** Hvis åpne data ikke gjør det mulig å identifisere personer pålitelig på tvers av selskaper, eller vilkårene forbyr bruken, må prosjektet omdesignes til selskap–selskap-nettverk (adresse, regnskapsfører) eller gjøres i samarbeid med en institusjon som har lovlig tilgang.

---

## Til slutt

Du ba om ideer som er verdt å bruke tid på. Her er den ærlige versjonen: **Ingen av disse er verdt noe før noen har brukt dem.** Brevknuseren er verdt null kroner til den første personen åpner et brev de har gruet seg til i tre uker, og forstår det på 30 sekunder.

Start der. I morgen. Klokka ni.

Eller klokka 03:12, når hodet uansett ikke sover. Det funker også.
