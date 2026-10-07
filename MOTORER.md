# MOTORER — oppgave 8 og 10

To motorer bygd i Python (stdlib + pyyaml), oppå `grokkjerne/`.

> **Om grokkjerne:** Oppgave 0 fantes ikke i dette repoet. `grokkjerne/` er en tynn
> adapter (`spor(prompt, system, json_svar=...)` mot xAI). Bytt den ut med den ekte
> kjernen, så følger motorene med uten endringer.

```bash
pip install -e .          # gir kommandoene `kontroll` og `slusen`
export XAI_API_KEY=...    # valgfritt. Uten nøkkel: lag 1 + offline-maler
python -m unittest discover -s tests
```

## 8 · KONTROLLMOTOR (`kontroll/`)

All output passerer `kontroll.vurder()` eller `@kontrollert` før den lagres eller vises.

| Lag | Hva | Hvor |
|---|---|---|
| 1 deterministisk | regex/nøkkelord, Merke-felt, strukturerte `handlinger` | `kontroll/regler.yaml` |
| 2 Grok-dommer | `{status: SLIPP\|STOPP\|RETT, grunn, linje, fiks}`; kjører kun hvis lag 1 slipper | instruks i `regler.yaml` |

- **Regler** (i yaml, ikke i prompt): våpen, jamming og skjult sporing i drone/ROV-spor. Sporet slås også på når teksten nevner drone eller ROV. I tillegg: udokumenterte helsepåstander (unntak: URL eller `Kilde:` på samme linje) og eksterne handlinger uten `--autorisert`.
- **STOPP** → `kontroll/avvist.jsonl` (tid, spor, regel, linje, linjetekst, hash, utdrag).
- **RETT** → `dom.fiks` inneholder foreslått rettet output (f.eks. Merke-feltet lagt inn).
- **Fail closed:** hvis dommeren svarer søppel eller kallet feiler, blir det STOPP. Uten `XAI_API_KEY` hoppes lag 2 over.
- **Autorisering:** argument, `KONTROLL_AUTORISERT=1` eller `--autorisert` i argv. Gjelder bare handlingsregelen. Våpen og helse kan ikke autoriseres bort.

```python
from kontroll import kontrollert

@kontrollert(spor="satire")                 # STOPP → KontrollStopp, RETT → KontrollRett(.fiks)
def skriv_manus(sak): ...

@kontrollert(spor="slusen", ved_rett="fiks") # RETT → returnerer fiksen
def skriv_epost(k): ...
```

```bash
kontroll sjekk fil.md --spor drone_rov      # exit 0 SLIPP · 2 STOPP · 3 RETT
kontroll sjekk ut.json --json --autorisert
kontroll eval                               # testsett 20+20, exit 1 under 95 %
kontroll avvist --siste 20
```

CI (`.github/workflows/motorer.yml`) kjører enhetstestene og `kontroll eval --min 0.95`.

## 10 · SLUSEN (`slusen/`)

SANNHETSMOTOREN i kode: et prosjekt kan ikke få status `tooling` før 3 kontakter står på LOI eller betalt. Reglen ligger i `Slusen.sett_prosjektstatus()` og i `Slusen.krev_tooling()`, som annen kode kan kalle før den bruker penger.

```bash
slusen prosjekt beskriv ISHUD "Isvarsling for kaier og havner."
slusen prosjekt malkunde ISHUD "Havnevesen i Nord-Norge"
slusen hypoteser ISHUD                     # Grok → slusen/utkast/, gjennom kontroll
slusen kontakt ny ISHUD "Kari Nordmann" --org "Tromsø Havn" --epost k@x.no --varm
slusen utkast 1                            # e-postutkast, SENDES ALDRI
slusen kontakt flytt 1 sendt               # du sendte selv → purring settes +5 dager
slusen idag                                # maks 3, høyest svarsjanse først
slusen status
slusen rapport --mappe ~/medieflyt --lagre # produsert vs sendt vs svar, det vonde tallet øverst
slusen prosjekt status ISHUD tooling       # exit 4 til 3 LOI/betalt
```

Kontaktstatus: `kald → sendt → svar → møte → LOI → betalt`.
Svarsjansen i `idag` er en heuristikk (status × varm × purre-timing × forfall), ikke statistikk.

Data (`slusen/data/`), utkast og rapporter er gitignored fordi repoet er **offentlig**.
