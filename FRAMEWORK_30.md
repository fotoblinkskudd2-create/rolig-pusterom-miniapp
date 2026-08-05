# Pusterom 30 – 30-dagers rammeverk

## Oversikt

Dette er et fullstendig nytt rammeverk for mentalt velvære over 30 dager. Systemet er designet for å:

- Spore din mentale helse daglig
- Identifisere mønstre og trends
- Bygge gode rutiner
- Gi deg innsikt i hva som fungerer for deg

## Nye funksjoner

### 1. **Automatisk 30-dagers tracking** 
- Systemet starter en 30-dagers periode første gang du bruker det
- Lagrer start-datoen i lokal lagring
- Viser hvor mange dager du har igjen
- Automatisk nedtelling fra dag 1 til dag 30

### 2. **Framgang-dashboard**
Fem viktige KPIer som oppdateres i sanntid:
- **Sjekk-ins**: Totalt antall ganger du har sjekket inn
- **Dagers strek**: Hvor mange dager på rad har du sjekket inn
- **Gjennomsnittsmood**: Beregnet gjennomsnitt av alle dine mood-rapporter
- **Dager gjort**: Din progresjon på 30-dagers turen (1-30)
- **Ukestatistikk**: Visuell progressbar for inneværende uke

### 3. **30-dagers visuell kalender**
- Alle 30 dagene vises i et rutenett
- Fargekoding basert på mood:
  - 😔 Rød - Veldig vanskelig
  - 😕 Beige - Vanskelig
  - 😐 Blå - Nøytral
  - 🙂 Grønn - Bra
  - 😌 Mørkegrønn - Veldig bra
- Tydelig markering av "i dag"
- Dager uten sjekk-in viser bare nummeret

### 4. **Innsikt og mønstre**
Systemet analyserer automatisk:
- **Best dag i uken**: Hvilken dag pleier du å ha det best?
- **Strek-milestone**: Feiring når du oppnår 5+ dagars strek
- **Trend-analyse**: Er det blitt bedre eller vanskeligere?
- **Gjennomføringsprosent**: Hvor mange % av dagene sjekker du inn?
- **Samlet vurdering**: Gjennomsnittsmood med tolking

### 5. **Utvidet mini-tips**
- 10 daglige aktiviteter (ikke bare 7)
- Variasjon for å holde det interessant
- Daglige reset som gjør at du kan oppnå nye tips hver dag

### 6. **Forbedret navigasjon**
Fem hovedsider:
1. 🏠 **Hjem** - Daglig sjekk-in
2. 🌬️ **Pusterom** - Guidet pusting
3. ✋ **Små grep** - Daglige tips
4. 📊 **Framgang** - Din 30-dagers oversikt
5. 💡 **Innsikt** - Mønstre og lærdommer

## Datastruktur

Systemet lagrer alt lokalt i din nettleser:

### `thirtyDayStart`
```json
"2026-08-05T10:30:00Z"
```
Når du startet din 30-dagers tur.

### `checkins`
```json
[
  {
    "date": "2026-08-05T10:30:00Z",
    "mood": "5",
    "note": "Deilig dag i solen"
  }
]
```
Alle dine sjekk-ins, sortert nyest først.

### `doneActions`
```json
{
  "2026-08-05": [0, 2, 4]
}
```
Hvilke tips du har gjort hver dag.

## Hvordan det fungerer

### Dag 1: Start
1. Du åpner appen
2. Systemet lagrer startdatoen automatisk
3. Du gjør din første sjekk-in
4. Dashboard viser "Du har 30 dager foran deg"

### Dag 2-30: Bygge rutine
1. Sjekk inn daglig med mood + notat
2. Gjør noen små grep
3. Putt når du trenger det
4. Se framgangen i dashboard og kalender

### Dag 30+: Se resultatene
- Full måned med alle sjekk-ins
- Mønstre som har dukket opp
- Dager strek du klarte å oppnå
- Trend fra start til slutt

## Forbedringer fra original

| Feature | Original | Ny versjon |
|---------|----------|-----------|
| Tidsperiode | Åpen | 30 dager strukturert |
| Kalender | Ingen | Full måned visuell |
| KPIer | Bare ukentlig | 4 sanntids-metriker |
| Innsikt | Minimal | Automatisk mønstre-analyse |
| Trend | Ingen | Sammenligninger over tid |
| Tips | 7 faste | 10 varierende |
| Streak | Ingen tracking | Automatisk dag-for-dag strek |
| Gjennomsnittsmood | Beregnet hver gang | Sanntids-beregning |

## Teknisk implementasjon

### Datoer
- ISO 8601 format for konsistens
- Lokal tid brukes for sjekk-ins
- Automatisk reset av tips hver midnatt

### Farger
- Rikelig bruk av farger for rask visuell lesing
- Mønstre er umiddelbar synlige
- Tilgjengelig design

### Offline-first
- Alt fungerer uten internett
- Data lagres i localStorage
- 30 MB plass available (mer enn nok)

## Bruksscenarioer

### Scenario 1: Daglig bruker
- Sjekker inn hver morgen
- Gjør 2-3 små grep
- Bruker pusterom når stresset
- Ser progresjon uke for uke

### Scenario 2: Sporadisk bruker
- Sjekker inn 3-4 ganger i uken
- Bruker tips når hen trenger det
- Ser at selv lite er bedre enn ingenting
- Mønstre viser når hen trenger mest hjelp

### Scenario 3: Analytiker
- Fokuserer på innsikt-siden
- Følger trends nøye
- Justerer rutine basert på mønstre
- Bruker 30 dager for å forstå seg selv

## Neste steg (ikke implementert ennå)

- [ ] Eksport som PDF-rapport
- [ ] Påminnelser (push notifications)
- [ ] Deling av framgang (anonym)
- [ ] Egendefinerte tips
- [ ] Mørkt modus
- [ ] Synkronisering på tvers av enheter
- [ ] Eldre 30-dagers perioder (arkiv)
- [ ] Lydfiler for guidet pusting
- [ ] Integrering med helse-app
- [ ] Flerbrukerstøtte

## Tips for best resultat

1. **Vær konsistent**: Sjekk inn omtrent samme tid hver dag
2. **Skriv kort notat**: Selv "stresset dag" eller "kjempe dag" hjelper
3. **Eksperimenter**: Prøv ulike tips for å finne hva som fungerer for deg
4. **Se mønstre**: Etter dag 7-10 vil mønstre begynne å dukke opp
5. **Fira små seiere**: 5 dagars strek er topp!

## Feilsøking

### "Min kalender ser tom ut"
- Du må gjøre minst én sjekk-in for at dag skal fargekodes
- Dager uten sjekk-in viser bare nummeret

### "Gjennomsnittsmood er -"
- Du trenger minst én sjekk-in før gjennomsnitt kan beregnes

### "Data forsvant"
- All data lagres lokalt i din nettleser
- Hvis du sletter browser-data, forsvinner det
- Backup: Lagre din historikk før du sletter cookies

### "Streaken tilbakestilles"
- Streaken brytes hvis du hopper over en dag
- En sjekk-in per dag = +1 på streaken

---

**Laget for å hjelpe deg ta vare på deg selv over 30 dager. Lykke til! 🍀**
