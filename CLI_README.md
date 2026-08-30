# Pusterom CLI

En liten, rolig terminal-følgesvenn til `index.html`-appen i dette repoet.
Samme tema (humør, pust, små grep), men som en CLI med lokal JSON-lagring —
for deg som heller vil sjekke inn fra terminalen.

Ingen server, ingen nett, ingen avhengigheter utover Python 3 sin
standardbibliotek.

## Kjøre

```bash
python3 main.py --help
python3 main.py sjekk-inn --humor 3 --notat "litt slitsom dag"
python3 main.py pust
python3 main.py grep liste
python3 main.py status
python3 main.py historikk --dager 14 --eksporter historikk.txt
```

Data lagres i `pusterom_data.json` i mappen du kjører fra (kan overstyres med
`--data-file sti/til/fil.json`). Logg skrives til `pusterom.log`. Begge er
git-ignorert — det er dine data, ikke kildekode.

## Kommandoer

| Kommando | Hva den gjør |
|---|---|
| `sjekk-inn --humor N [--notat "..."]` | Registrer humør 1–5 og valgfritt notat. |
| `pust [--minutter N] [--monster auto\|478\|box\|coherent] [--tempo normal\|rask]` | Guidet pusteøkt med levende terminal-animasjon. |
| `grep liste` | Vis alle små grep og dagens status. |
| `grep gjort <id>` | Merk et grep som gjort i dag. |
| `grep ny --navn "..."` | Legg til ditt eget grep. |
| `status` | Rask oversikt: streak, siste innsjekk, foreslått pusteøkt. |
| `historikk [--dager N] [--eksporter fil.txt]` | Humørtrend som sparkline, statistikk, og eksport. |

## Den geniale biten: pust som følger trenden, ikke øyeblikket

`pust --monster auto` velger ikke pustemønster ut fra bare siste innsjekk.
Den regner ut et **eksponentielt tidsvektet snitt** av nylige innsjekk — i
dag teller mest, gårsdagen litt mindre, og eldre dager fases gradvis ut
(halveringstid ~2 dager). Det gir to fordeler man ikke får med "bruk siste
verdi":

1. **Ett dårlig øyeblikk rett etter gode dager** trekker ikke automatisk
   inn det mest intense roende mønsteret (4-7-8) — snittet holder deg
   nærmere der du faktisk har vært.
2. **En sakte glidning nedover** over flere dager (f.eks. 4 → 3 → 3 → 2)
   blir fanget opp selv om ingen enkeltdag isolert sett ser alarmerende ut.

Snittet mappes til et pustemønster der forholdet mellom inn- og utpust
matcher fysiologien: jo mer relativ tid på utpust, jo sterkere aktiveres
det parasympatiske ("hvile og fordøy") systemet. Derfor er 4-7-8 (lengst
utpust) reservert for når det målte stressnivået faktisk er høyt, mens et
jevnt vedlikeholdsmønster brukes når trenden er god. Se
`pusterom_cli/breathing.py` for implementasjonen (`ewma_mood`,
`choose_pattern`).

## Arkitektur

- `pusterom_cli/models.py` — datamodeller og validering (humør, notat, navn).
- `pusterom_cli/storage.py` — atomisk JSON-lagring; en skadet datafil blir
  automatisk satt i karantene (omdøpt) og appen starter friskt i stedet for
  å krasje.
- `pusterom_cli/stats.py` — streak (med "nåde" ut dagen hvis du sjekket inn
  i går), humørtrend, sparkline, grep-statistikk.
- `pusterom_cli/breathing.py` — mønstervalg og terminal-animasjon for
  pusteøkter.
- `pusterom_cli/logging_setup.py` — logging til fil (DEBUG) og konsoll
  (WARNING, eller DEBUG med `--verbose`).
- `pusterom_cli/cli.py` — argparse-kommandoer, feilhåndtering, output.
- `main.py` — tynn inngang: `python3 main.py <kommando>`.

## Tester

Ingen testrammeverk kreves — alt kjører på standardbiblioteket:

```bash
python3 -m unittest discover -s tests -v
```

35 tester dekker validering, lagring (inkludert gjenoppretting fra skadet
fil), streak/trend-beregning, og pustemønster-logikken (inkludert at en
sakte nedadgående trend faktisk fanges opp).

## Antakelser

- Domenet (humør, pust, små grep) er valgt fordi det passer temaet i resten
  av repoet (`rolig-pusterom-miniapp`) — dette er en CLI-følgesvenn, ikke en
  erstatning for `index.html`-appen, og rører ingen av de eksisterende
  filene.
- Én bruker, én maskin, lokal fil — ingen flerbrukerstøtte eller sync er
  forsøkt løst.
- "Rask" tempo i `pust` er ment for demo/test, ikke faktisk pustetrening.
