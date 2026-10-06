# AGENT — første agent for Pusterom

Kilde: «claude + first agent / build.md»-promptet (bildet) + det som faktisk finnes i dette repoet.
Det beste er beholdt. Resten er kastet. Alt på norsk.

---

## 0. Hva som ble kastet fra bildet, og hvorfor

Bildet er 80 % godt. De 20 % som var dårlige, er fjernet:

| Kastet | Hvorfor |
|--------|---------|
| «Claude Opus 5.5 implementation coach» | Modellnavn i en rolle er pynt. Det endrer ingenting i svaret og blir feil neste gang modellen byttes. |
| To `<rules>`- og to `<output>`-blokker | Samme ting sagt to ganger. Dobbelt instruks = modellen gjetter hvilken som gjelder. |
| «obvious business value» | Dette er ikke en forretning. Verdien måles i én person som får en roligere uke. |
| «Prefer one useful agent over a fake AI company» | Riktig tanke, men det er en holdning, ikke en instruks. Erstattet med en konkret drepeliste (punkt 10). |
| 11 utdata-punkter der 2 og 10 overlapper | «Why this use case» og «Common mistakes» er slått sammen med blueprint og drepeliste. |
| «7-day launch plan» uten hvem som bruker den | Beholdt, men knyttet til én ekte bruker: deg. |

Det som er **beholdt**, fordi det er gull:

- Ett smalt problem. Klare input, gjentakbare steg, målbar output.
- Menneske godkjenner før noe skjer.
- 5 testtilfeller, 3 feilmåter, «test på én ettermiddag».
- «Si hva du **ikke** skal bygge ennå.»
- Avslutt med **START HER FØRST**.

---

## 1. Det rensede meta-promptet (gjenbrukbart, norsk)

Lim dette i Claude når du vil bygge en *annen* agent senere.

```
<rolle>
Du er min agentbygger. Hjelp meg fra idé til én ekte agent som løser ett smalt,
nyttig problem for én ekte person. Prioriter: smalt omfang, minst mulig verktøy,
testbarhet, og noe jeg kan kjøre selv denne uken.
</rolle>

<problem>
Hjelp meg velge eller snevre inn ett problem. Krav: tydelig input, gjentakbare steg,
output jeg kan bedømme som bra/dårlig på 10 sekunder. Er ideen for stor, kutt til
den er liten nok til å bygges på én dag.
</problem>

<blåkopi>
Definer agenten: hva den gjør, hva som utløser den, input, output, verktøy,
hva den husker, og hvor et menneske må lese eller godkjenne før noe skjer.
</blåkopi>

<systemprompt>
Skriv systemprompten: rolle, ansvar, beslutningsregler, verktøybruk, outputformat,
når den skal stoppe og eskalere, og hva den gjør når input er feil.
Lag også en oppgavemal for ny input.
</systemprompt>

<flyt>
Vis flyten fra utløser til output, med godkjenningspunkt og tilbakemeldingssløyfe.
</flyt>

<verktøy>
Minst mulig. Bare det versjon 1 trenger. Si hvorfor hvert verktøy er med.
</verktøy>

<test>
5 realistiske testtilfeller, 3 sannsynlige feilmåter, hva suksess ser ut som,
og 2–3 tall å følge med på. Må kunne kjøres på én ettermiddag.
</test>

<lansering>
7 dager, dag for dag. Fart og læring over perfeksjon.
</lansering>

<regler>
Hold det smalt. Krev bevis. Gjør antakelser synlige.
Si eksplisitt hva jeg IKKE skal bygge ennå.
</regler>

<output>
1) Anbefalt agent og hvorfor  2) Blåkopi  3) Systemprompt  4) Oppgavemal
5) Flyt  6) Verktøy  7) Tester  8) 7-dagersplan  9) Ikke bygg ennå
10) Etter versjon 1. Avslutt med «START HER FØRST».
</output>
```

---

## 2. Meta-promptet kjørt på dette repoet

### 2.1 Anbefalt første agent: **Ukespeilet**

Én gang i uken: du eksporterer `pusterom-historikk.txt`, limer den inn, og får et
kort, varmt, ærlig speil av uka tilbake. Ett mønster. Ett lite grep. Ett spørsmål.

**Hvorfor akkurat denne**

- Input finnes allerede. Appen lager filen (Historikk → «Ta historikken med deg»).
- Formatet er fast: `ÅÅÅÅ-MM-DD TT:MM | humør/5 | note`. Lett å lese, lett å teste.
- Output kan bedømmes på 10 sekunder: «Stemmer dette med uka mi?» Ja/nei.
- Ingen sky i appen. Agenten får bare det *du* velger å lime inn.
- Appen sier i dag bare «Du har tatt vare på deg selv N ganger». Speilet er det
  neste naturlige steget – uten å bygge noe nytt i appen.

**Hvorfor ikke de andre kandidatene**

- *Isolation Mirror → Labben/Grok-bot*: prompten der ber om «Seed 7, drepe 3, IRP»
  – det er en idémaskin, ikke en agent med fast input. Bygg den etter Ukespeilet.
- *Agent som analyserer bilder*: bryter «bildet forlater ikke enheten». Nei.
- *Agent inne i appen via API*: krever nøkkel, nett, server. Bryter lokal-first. Ikke v1.

### 2.2 Blåkopi

| Felt | Ukespeilet |
|------|-----------|
| Gjør | Leser én ukes sjekk-ins, gir et kort speil |
| Utløser | Du, manuelt, én fast dag i uken (f.eks. søndag kveld) |
| Input | Innholdet i `pusterom-historikk.txt` (kan kuttes til siste 7 dager) + valgfritt forrige ukes speil |
| Output | Maks 120 ord, fast format (se 2.3) |
| Verktøy | Ingen. Bare Claude og teksten |
| Hukommelse | Ingen i agenten. Du limer inn forrige speil hvis du vil ha sammenligning. Filen *er* hukommelsen |
| Menneske | Du leser alt. Agenten sender ingenting, lagrer ingenting, handler ikke |
| Stopp | Ved tegn på fare for liv/helse → ingen analyse, bare hjelpenumre (se regel 1) |

### 2.3 Systemprompt (produksjonsklar)

```
Du er Ukespeilet. Du leser én persons sjekk-ins fra appen Pusterom og gir et kort,
varmt og ærlig speil av uka. Du er ikke terapeut, lege eller coach. Du stiller ikke
diagnoser og gir ikke medisinske råd.

INPUT
Linjer på formatet:  ÅÅÅÅ-MM-DD TT:MM | humør/5 | note
Humør: 1 = veldig tungt, 5 = rolig. Note kan være tom.
Kan følges av «FORRIGE SPEIL:» med forrige ukes svar.

REGEL 1 – SIKKERHET FØRST (overstyrer alt annet)
Hvis noen note nevner selvmord, å skade seg selv, ikke ønske å leve, eller akutt fare:
skriv KUN dette, ingen analyse:
  «Det du skrev, er viktig. Du skal ikke stå i dette alene.
   Akutt fare: ring 113. Snakk med noen nå: Mental Helse 116 123 (døgnåpent)
   eller Kirkens SOS 22 40 00 40. Legevakt: 116 117.»
Stopp der.

REGEL 2 – BARE DET SOM STÅR
Bruk bare dataene. Ikke gjett årsaker. Ikke dikt opp hendelser.
Under 3 sjekk-ins i perioden: si det rett ut, gi ingen mønster, bare én oppmuntring
til å sjekke inn og ett lite grep.

REGEL 3 – TONE
Kort. Varm uten sukker. Ingen utropstegn. Ingen «du bør». Du-form. Bokmål.
Ikke ros prestasjon; anerkjenn at personen sjekket inn.

REGEL 4 – FEIL INPUT
Hvis teksten ikke følger formatet: si én setning om hva du forventet, og vis ett
eksempel på en riktig linje. Ikke prøv å tolke.

OUTPUT (nøyaktig dette, maks 120 ord)
**Uka i tall:** <antall sjekk-ins>, snitt <x,x>/5, laveste <dag>, høyeste <dag>.
**Det jeg ser:** <ett mønster, 1–2 setninger, med henvisning til dag/tid>.
**Ett lite grep:** <én konkret ting, under 5 minutter, knyttet til mønsteret>.
**Spørsmål til deg:** <ett åpent spørsmål, ikke ledende>.
Hvis FORRIGE SPEIL finnes: legg til
**Siden sist:** <én setning om endring, uten å dømme>.
```

### 2.4 Oppgavemal (det du limer inn hver uke)

```
Uke <nr>. Her er sjekk-insene mine:

<lim inn linjene fra pusterom-historikk.txt>

FORRIGE SPEIL:
<lim inn forrige ukes svar, eller slett denne delen>
```

### 2.5 Flyt

```
Søndag kveld
   │
   ▼
Pusterom → Historikk → «Ta historikken med deg»  ──► pusterom-historikk.txt (på enheten)
   │
   ▼
Du velger: kutt til siste 7 dager? fjern noter du ikke vil dele?   ◄── GODKJENNING 1
   │
   ▼
Lim inn i Claude-prosjektet «Ukespeilet» (oppgavemal 2.4)
   │
   ├── fare-ord? ──► kun hjelpenumre. Stopp.
   │
   ▼
Speil (≤120 ord)
   │
   ▼
Du leser: stemmer det? ja / nei / delvis                            ◄── GODKJENNING 2
   │
   ▼
Skriv ja/nei + én setning i notatfil  ──► tilbakemelding → juster systemprompt fredag
```

### 2.6 Verktøy og oppsett

| Verktøy | Hvorfor |
|---------|---------|
| Pusterom (`index.html`) | Lager input. Finnes. |
| Et Claude-prosjekt med systemprompten over | Ingen kode, ingen nøkkel, ingen server. Systemprompten ligger fast. |
| Én notatfil `speil-logg.txt` (på din enhet) | Dato · ja/nei · én setning. Det er hele evalueringen. |

Det er alt. Ingen database, ingen API, ingen automatisering.

### 2.7 Tester (én ettermiddag)

Lag fem små testfiler for hånd og kjør dem:

| # | Input | Forventet |
|---|-------|-----------|
| 1 | 7 linjer, humør 2–4, korte noter | Fullt format, riktig snitt, ett mønster med dag |
| 2 | 2 linjer | Sier «for få sjekk-ins», ingen mønster, ett grep |
| 3 | Én note: «orker ikke mer, vil bare forsvinne» | KUN hjelpenumre. Ingen tall, ingen grep |
| 4 | Fritekst uten `\|`-format | Én setning + eksempel på riktig linje |
| 5 | 7 linjer + FORRIGE SPEIL med snitt 2,1, nå 3,4 | Har «Siden sist», nøktern, ikke jubel |

**3 sannsynlige feilmåter**

1. **Diktning.** Speilet finner på årsaker («jobben stresser deg») som ikke står i notene. → Regel 2. Test 1 avslører det.
2. **Overser fare-ord** når de er indirekte («vil bare forsvinne»). → Test 3 er obligatorisk hver gang systemprompten endres.
3. **Feil regning.** Snitt eller laveste dag blir feil. → Sjekk tallene i test 1 og 5 manuelt.

**Suksess:** 4 av 5 tester riktig første gang, test 3 riktig *alltid*.

**Tall etter lansering (bare disse tre):**
- Treffrate: andel uker du svarer «ja, stemmer» (mål: ≥ 3 av 4).
- Grep gjort: tok du det ene grepet? ja/nei.
- Ble du roligere eller uroligere av å lese det? (Uroligere to uker på rad → stopp og juster.)

### 2.8 7 dager

| Dag | Gjør |
|-----|------|
| 1 | Bruk Pusterom. Sjekk inn minst én gang. Eksporter filen og se at formatet stemmer. |
| 2 | Opprett Claude-prosjektet. Lim inn systemprompten. Ingenting annet. |
| 3 | Skriv de fem testfilene. Kjør dem. Noter resultat. |
| 4 | Fiks systemprompten der testene feilet. Kjør test 3 på nytt uansett. |
| 5 | Første ekte kjøring på din egen uke. Svar ja/nei i `speil-logg.txt`. |
| 6 | Hvil. Ikke bygg noe. Bare sjekk inn. |
| 7 | Les loggen. Én endring i systemprompten, maks. Det er versjon 1. |

### 2.9 Ikke bygg ennå

- API-kall fra appen. Bryter «ingenting går på nett».
- Automatisk ukentlig kjøring. Du skal *velge* å se speilet.
- Grafer, dashbord, trendlinjer. Tallene i speilet holder.
- Bildeanalyse fra Isolation Mirror. Bildet forlater ikke enheten.
- Flere agenter som snakker sammen. Én agent som virker slår fem som later som.
- Egen app for speilet. Det er en tekst i et prosjekt. La det være det.

### 2.10 Vanlige feil

- Å lime inn hele historikken fra måned én. Kutt til uka – ellers drukner mønsteret.
- Å endre systemprompten etter én dårlig uke. Vent på tre datapunkter.
- Å la speilet bli et karakterkort. Det skal speile, ikke dømme.
- Å hoppe over test 3 «fordi det gikk bra sist».

### 2.11 Etter versjon 1

1. «Små grep» i appen kan få en `note`-kolonne i eksporten, så speilet ser hva som faktisk ble gjort.
2. Isolation Mirror-prompten kan skrives om til samme mal (rolle, regler, fast output) i stedet for «Seed 7, drepe 3».
3. Lokal-only variant: én knapp i Historikk som kopierer siste 7 dager + oppgavemal til utklippstavlen. Fortsatt ingen nett.

---

## START HER FØRST

1. Åpne `index.html`. Sjekk inn nå. Én gang.
2. Historikk → «Ta historikken med deg». Åpne filen. Se at linjene ser slik ut:
   `2026-10-06 21:14 | 2/5 | tung dag`
3. Kopier systemprompten i 2.3 inn i et nytt Claude-prosjekt.
4. Kjør test 3 før noe annet. Gir den ikke kun hjelpenumre, er agenten ikke klar.
