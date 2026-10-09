# KONTROLLPUNKT — Small Wins Lab (byggerun 02)

- Prosjekt: Small Wins Lab, `small-wins-lab/`
- Starttid: 2026-10-09T16:38:58Z
- Registrert tidsbruk: ca. 23 min (til ca. 17:02Z). Pausetid: 0 min (føres separat).
- Resterende budsjett: ca. 277 av 300 min (ikke brukt opp med vilje; ingen påfyll av kosmetikk)
- Nye kostnader: 0 NOK. Ingen nye avhengigheter, ingen eksterne tjenester.
- Gjeldende milepæl: 275–300 frys og lever — FERDIG
- Ferdige oppgaver: regelmotor, 30 oppgaver, lagring/gjenopptakelse, eksport/import, grensesnitt, utskrift + fasit + PDF, service worker, logikktest 17/17, e2e 20/20, demo-manus, kontrollbevis
- Åpne feil: ingen kjente kritiske
- Siste beståtte kontroll: `node --test tests/logic.test.js` 17/17 og `node tests/e2e.js` 20/20 (2026-10-09 ~16:58Z)

## Kjente begrensninger

1. Ikke testet på fysisk telefon eller i iOS Safari/Firefox. Mobil er simulert i Chromium (320 og 375 px).
2. Offline (service worker) er kontrollert i Chromium. Ved `file://` virker appen uten nett, men uten service worker.
3. Angre-historikk for signaler, rekkefølge, mønstre og maskiner lever bare i minnet. Etter reload er forsøket bevart, men kan bare angres som «Start på nytt». Ruter kan angres steg for steg også etter reload.
4. Ingen dra-og-slipp. Kort flyttes med trykk + knapper eller piltaster.
5. Signalkretsen vises som en portliste med verdier, ikke som grafisk koblingsskjema.
6. En åpen fane skriver sin egen gyldige tilstand til lagring. Ødelagt lagring blir derfor bare oppdaget ved ny innlasting.
7. Ikke testet med skjermleser eller med barn. Prototypen viser mekanismen; den dokumenterer ingen læringseffekt og er ikke ADHD-behandling.
8. eple: om barn forstår portnavnene NOT/AND/OR/XOR og ordet «kontrollpunkt» uten en voksen som forklarer. Det avgjør om Signaler og Ruter nivå 3 fungerer alene.

## Neste konkrete handling

Brukertest på fysisk telefon: kjør `./start.sh` (endre `--bind 127.0.0.1` til `0.0.0.0` for lokalnett), åpne på telefonen og la 2–3 barn prøve SIG-01, SIG-04, REK-03 og RUT-05 med `docs/DEMO.md` som manus. Noter hvor de stopper opp uten hjelp. Det svarer på «eple»-punktet over.
