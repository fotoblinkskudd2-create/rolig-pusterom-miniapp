# Agentbedrift

En liten bedrift av agenter som tar en idé helt til prototype: research, design, oppfinning,
CAD, tegning, prototype, debugging (QA), markedsføring og loggføring. Den lager egne nye
produkter ved å kombinere ferdige, så den kan kjøre lenge.

## Kjøre

```bash
# 48 timer, avbryt med Ctrl+C når som helst (køen lagres)
python3 agentbedrift/bedrift.py --timer 48

# Én full runde og stopp
python3 agentbedrift/bedrift.py --en-runde

# Med Claude som tekstforfatter (valgfritt)
ANTHROPIC_API_KEY=... python3 agentbedrift/bedrift.py --timer 48
```

Ingen avhengigheter utenom standardbiblioteket. Python 3.10 eller nyere.

## Hva du får

- `produkter/<slug>/` per produkt:
  - `01-research.md`, `02-design.md`, `03-oppfinnelse.md`
  - `04-cad.scad` (kun fysiske produkter, OpenSCAD-kilde)
  - `05-tegning.svg`
  - `06-prototype.html` (fungerer i nettleseren, ingen byggesteg)
  - `07-qa.md` (debugging-rapport)
  - `08-markedsforing.md`
- `produkter/INDEKS.md`: oversikt over alle produkter
- `kjoring/logg.jsonl`: hendelseslogg, én linje per handling
- `kjoring/tilstand.json`: kø og produktliste, brukes til å gjenoppta

## Begrensninger

- Uten API-nøkkel er tekstene malbaserte. Research gjør ingen websøk, og det står i filene.
- `.scad`-filene er ikke rendret. Det krever OpenSCAD, som ikke er installert her.
- Tegningene er skisser, ikke målskalerte produksjonstegninger.
- Taket er `--maks` (standard 60). Uten API-nøkkel blir det ikke uendelig variasjon, bare kombinasjoner av de ferdige produktene.
