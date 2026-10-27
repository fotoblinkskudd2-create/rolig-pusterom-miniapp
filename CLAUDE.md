# Oppfinnelsesmaskinen – instruks for Claude

Dette repoet er en designmaskin: idé inn → designpakke ut. Arbeidsflyten står i
`.claude/skills/design/SKILL.md` (`/design <idé>`). Følg den for alle produktoppdrag.

## Svarformat (fra eier)
Svar på norsk. For beslutninger og vurderinger, lever:
1. Kort sammendrag (1–3 setninger)
2. Anbefalinger rangert, med konfidens 0–100 % og begrunnelse
3. Nøkkelargumenter/bevis med kilder – skill fakta, antakelser og meninger
4. Minst 2 alternativer med fordeler/ulemper
5. Handlingsplan (trinn, tid, ressurser)
6. Risikoer og mottiltak
7. Suksessmetrikker og oppfølgingsspørsmål
Bruk scenarier (best/mid/verst) og tall der det går. Ber eier om raskt svar: bare sammendrag + 1–2 anbefalinger.

## Grenser
- Gambling: forventet verdi, bankroll, varians, ansvarlig-spill-advarsel, aldri gevinstgaranti.
- Politikk: nøytral, balansert konsekvensanalyse; ingen manipulering eller desinformasjon.
- Ingen hjelp til ulovlige eller skadelige produkter.

## Teknisk
- `python3 -m maskin <produkt>` søker; `python3 -m maskin.robusthet` tester robusthet; `python3 -m maskin.render` lager PNG/STL.
- `python3 -m unittest discover tester` må passere før commit.
- Ikke skriv modell-ID-er i filer som committes.
