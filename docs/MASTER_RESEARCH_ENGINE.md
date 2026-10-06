# MASTER RESEARCH ENGINE — MR ART (herdet versjon)

Originalprompten er god på *hva* den vil ha. Den kommer til å feile på *hvordan*.
Denne fila er samme motor, skrudd sammen så den faktisk går i NotebookLM.

---

## 0. Hvorfor originalen havarerer i én kjøring

| # | Feil | Konsekvens | Fiks |
|---|------|-----------|------|
| 1 | 10 områder + 5 outputs + tverranalyse i ett svar | NotebookLM har et svartak. Du får 40 tynne avsnitt i stedet for 10 tykke. Alt blir «spennende område» – nøyaktig det prompten forbyr. | Del i **pass** (se §2). Én kjøring = ett pass. |
| 2 | «Finn nye metoder fra 2025–2026» + «arbeid kildebasert» | Notebooken ser bare kildene du har lastet opp. Den kan ikke finne det som ikke er der. Den vil enten si «finnes ikke i kildene» eller hallusinere. | Skill mellom **INTERN** (hva kildene sier) og **EKSTERN** (hva som må hentes inn). Eksterne hull går til OUTPUT 3, ikke inn i svaret. |
| 3 | Ingen definisjon av «verdi» | Modellen premierer det som er mest skrevet om – ikke det som er mest verdt. Lengste dokument vinner. | Fast poengskala (§3). |
| 4 | Ingen kilde-ID | «Kildebelegg hvert funn» uten ID gir vage henvisninger. | Hver kilde får en kort ID i filnavnet: `[AGENT-03]`, `[DRONE-11]`. Krev ID i hver påstand. |
| 5 | Fire sikkerhetsnivåer er definert, men ikke påtvunget | De forsvinner etter første side. | Hver påstand får en tagg: `[F]` fakta, `[I]` inferens, `[H]` hypotese, `[S]` spekulasjon. Mangler tagg = ugyldig. |
| 6 | «Ikke vær høflig» uten mal for DREP | Modellen blir høflig likevel. | DREP krever begrunnelse i én setning + hva som skulle vært sant for å redde det. |

---

## 1. SYSTEMINSTRUKS (lim inn som Notebook-instruks / første melding)

```
Du er MR ART: en granskende analysemotor, ikke en sammendragsmaskin.

KILDER
- Bruk kun kildene i denne Notebooken. Hver kilde har en ID i filnavnet ([OMRÅDE-NN]).
- Hver påstand skal ha kilde-ID. Påstand uten ID = ikke skriv den.
- Det kildene ikke dekker, skriver du under «EKSTERNT HULL», aldri som svar.
- Flere kilder som bygger på samme opprinnelse teller som ÉN kilde.

SIKKERHET (tagg hver påstand)
[F] dokumentert fakta  [I] sterk inferens  [H] hypotese  [S] spekulasjon

STATUS (eneste lovlige verdier)
IDÉ → UTKAST → BYGGET → TESTET → FERDIG → PUBLISERT → SOLGT
«Nesten ferdig», «under arbeid», «lovende» er ikke status.

BESLUTNING (hver analyse slutter med nøyaktig én)
BYGG | TEST | UNDERSØK MER | DREP
DREP krever: én setning hvorfor + hva som måtte vært sant for å redde det.

FORBUDT
- «Spennende område», «stort potensial», «verdt å utforske» uten tall eller test.
- Nye ideer som ikke finnes i kildene, med mindre de eksplisitt kobler to eksisterende.
- Å premiere originalitet alene.
- Å telle artikler som bevis.

FORMAT
Tabeller der det er sammenligning. Korte avsnitt. Ingen innledning. Ingen oppsummering til slutt.
```

---

## 2. KJØREREKKEFØLGE — ett pass per melding

Kjør i denne rekkefølgen. Lim resultatet av hvert pass inn som ny kilde (`[PASS-N]`) før neste pass, så motoren bygger på seg selv i stedet for å glemme.

| Pass | Innhold | Hvorfor her |
|------|---------|-------------|
| **P1 Inventar** | List hvert prosjekt/idé i kildene: navn, kilde-ID, status, én setning. Ingen vurdering. | Alt annet avhenger av at listen er komplett. Duplikater blir synlige her. |
| **P2 Område 1+2+10** | Agenter, produktstudio, arbeids-OS | Dette er *motoren* som bygger resten. Vurderes først. |
| **P3 Område 3+4** | Fysiske prototyper, droner/biomimetikk | Samme mal (PROBLEM→TEST). Krever modenhetsskala: lab / prototype / feltprøvd / kommersiell. |
| **P4 Område 5** | SMB-AI | Eneste område med kort vei til penger. Får eget pass. |
| **P5 Område 6+7** | Bok/film/tekst + granskningsmotor | Granskningsmotoren er faktasjekken for bøkene. Kjør sammen. |
| **P6 Område 8+9** | Helse/trygghet + eldreteknologi | Felles regulatorisk landskap (MDR, GDPR art. 9). |
| **P7 Tverranalyse** | Komponentkart + OUTPUT 1 verdikart | Krever P1–P6. |
| **P8 Topp 10 + OUTPUT 2** | De 10 beste + 20 ikke-åpenbare funn | |
| **P9 OUTPUT 3+4+5** | Researchhull, BYGG NÅ, kildekrav | Siste. Avslutter med beslutninger. |

**Regel:** Når én notebook passerer ~30 kilder eller ett område tar over halve inventaret → splitt ut egen notebook (`DRONE`, `BØKER`, `AI-AGENTER`). Kjør P1 + relevant pass + P9 der.

---

## 3. POENGSKALA (brukes i P7 og P8)

0–3 per kriterium. Kriteriene er originalprompten sine ti, vektet:

| Kriterium | Vekt | 0 | 3 |
|-----------|------|---|---|
| Eksisterende fremdrift | ×3 | Bare idé | Bygget og testet |
| Dokumentert behov | ×3 | Ingen kilde | Kunde/bruker har sagt det |
| Mulighet for salg/publisering | ×2 | Ingen kjøper | Navngitt kjøper + pris |
| Gjennomførbarhet | ×2 | Krever team/kapital | Én person, < 30 dager |
| Gjenbrukbar teknologi | ×2 | Engangsløsning | ≥ 3 prosjekter bruker den |
| Økonomisk verdi | ×1 | | |
| Strategisk verdi | ×1 | | |
| Læringsverdi | ×1 | | |
| Prototype-mulighet | ×1 | | |
| Originalitet | ×1 | | |

Maks 51. Fremdrift og behov er bevisst tyngst: originalprompten sier at problemet er gjennomføring, ikke ideer. Da kan ikke originalitet veie like mye som at noe allerede finnes.

Verdikart-terskler: **≥ 36** høy verdi · **24–35** middels · **< 24** arkiver/drep · duplikat uansett score hvis > 60 % overlapp med noe som scorer høyere.

---

## 4. FASTE MALER (kopier ordrett inn i passene)

**Idé/produkt (område 3, 4, 8, 9):**
```
NAVN [kilde-ID] — STATUS
PROBLEM / HVEM: 
FINNES ALLEREDE: 
GAP: 
KJERNEINNOVASJON: 
MODENHET: lab | prototype | feltprøvd | kommersiell
BILLIGSTE TEST: 
KOSTNAD (NOK, [F]/[I]/[H]): 
RISIKO: teknisk / juridisk / regulatorisk / kommersiell
IP: 
FALSIFISERING: hva ville drept ideen?
BESLUTNING: BYGG | TEST | UNDERSØK MER | DREP
```

**SMB-løsning (område 5):**
```
NAVN — KJØPER (rolle med budsjett)
PROBLEMKOSTNAD I DAG (timer/kr per mnd): 
INPUT → OUTPUT: 
ROI-MÅL kunden selv kan telle: 
PRIS: engang + mnd
LEVERANSETID: 
FEILMODUS: 
BESLUTNING:
```

**Påstand (område 7):**
```
PÅSTAND | ORIGINALKILDE | PRIMÆR | SEKUNDÆR | MOTBEVIS | KILDEKJEDE (uavhengige: N) | DATO | INTERESSER | USIKKERHET
KONKLUSJON: bekreftet | sannsynlig | uklart | svakt dokumentert | feil | kan ikke avgjøres
```

**Topp-10-kort (P8):** originalens 10 spørsmål, uendret. Pluss: `SCORE: nn/51`.

---

## 5. FØRSTE KJØRING — dette repoet som kilde

Motoren skal kunne brukes på det som allerede ligger her. Rolig pusterom er det eneste i hele lista med kode som kjører.

```
ROLIG PUSTEROM [REPO-01] — BYGGET
PROBLEM / HVEM: Person med stress/nedstemthet som trenger noe som ikke krever konto,
  sky eller energi. [I] fra README/HULL.md
FINNES ALLEREDE: Headspace, Calm, Finch, Breathwrk – alle med konto, sky, abonnement. [I]
GAP: Lokal-first, null konto, null opplasting. HULL.md kaller sky «tillitsbrudd». [F: HULL.md]
KJERNEINNOVASJON: Ingen teknisk. Posisjonen er innovasjonen: personvern som produkt. [I]
MODENHET: prototype (fungerer i nettleser, ikke testet på ekte iPhone) [F: HULL.md]
BILLIGSTE TEST: 5 personer bruker den 7 dager. Telles: innsjekk per dag, eksport brukt.
KOSTNAD: 0 kr. [F]
RISIKO: regulatorisk lav så lenge den ikke påstår å oppdage/behandle noe (område 8-regel).
  Kommersiell høy: gratisalternativene er gode. [I]
IP: Ingen patenterbart. [I]
FALSIFISERING: Hvis < 2 av 5 sjekker inn mer enn 3 dager → appen løser ikke noe ingen
  andre allerede løser.
KOBLING: Lokal-first innsjekk = samme kjerne som PanicSafe-«minste nyttige prototype» og
  eldre-trygghetsboks nivå 1 (daglig livstegn). Én komponent, tre prosjekter. [I]
BESLUTNING: TEST
```

Mangler før FERDIG (fra HULL.md): PWA/ikon, iOS hjemskjerm, dark mode, test på ekte iPhone.

---

## 6. Det originalprompten ikke spør om, men burde

Én linje inn i P9:

```
Hvilket prosjekt har jeg brukt mest tid på i kildene uten at status har flyttet seg ett trinn?
Det er kandidat nr. 1 for DREP, uansett score.
```
