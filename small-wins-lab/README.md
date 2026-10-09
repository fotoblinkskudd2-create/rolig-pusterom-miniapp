# Small Wins Lab

Lokalt læringsverksted: 30 små logikkutfordringer i fem temaer (Signaler, Rekkefølge, Mønstre, Ruter, Feilsøking), tre nivåer, hint, forklaringer, lokal framdrift og utskrivbare oppgavekort.
Prototype som viser mekanismen. Den lover ingen dokumentert læringseffekt, og den er ikke behandling av ADHD eller noe annet.

## Start (én linje)

```sh
./start.sh          # åpne så http://localhost:8080
```

Uten Python: åpne `index.html` direkte i nettleseren. Alt virker da også, bortsett fra offline-caching (service worker krever http).

Utskrift: knappen «Oppgavekort for utskrift» i appen, eller `print.html`. Ferdig PDF: `docs/oppgavekort.pdf`.

## Kontroller

```sh
node --test tests/logic.test.js   # regler, data, lagring (uavhengige evaluatorer)
node tests/e2e.js                 # ende-til-ende i Chromium via Playwright (finnes i miljøet)
node tests/rapport.js             # skriver docs/losbarhet.md
```

## Filer

| Fil | Innhold |
|---|---|
| `js/data.js` | De 30 oppgavene som data (felles format) |
| `js/engine.js` | Regelmotor: én avgrenset funksjon per regeltype. Ingen `eval`. |
| `js/storage.js` | Framdrift, opprydding, eksport/import med full validering |
| `js/tekst.js` | Tekstvisning av tilstander (deles av app og utskrift) |
| `js/app.js` | Grensesnitt. All tekst via `textContent`. |
| `print.html`, `js/print.js`, `css/print.css` | Oppgavekort + separat fasit |
| `sw.js`, `manifest.webmanifest` | Offline-caching |
| `docs/` | Kontrollbevis, løsbarhet, demo-manus, PDF |
| `CHECKPOINT.md` | Kjøringens tilstand, begrensninger, neste handling |

## Beslutninger (tatt uten rutinespørsmål)

- Vanlig HTML/CSS/JS, ingen avhengigheter, ingen byggesteg. Klassiske `<script>` (ikke moduler) slik at `file://` virker.
- Norsk bokmål, rolig grønn palett, trykkflater ≥ 44 px, maks bredde 640 px.
- Farge er aldri eneste signal: PÅ/AV skrives og markeres med ● / ○, kort har form + navn, valgt tilstand har tykk ramme + tekst.
- Mønsterregler er låst i instruksjonen (periode/syklus står eksplisitt), og en test krever at hver tom plass er bundet av hver regel.
- Ruter: tilbakegang til et besøkt felt er lov. «Korteste» sammenlignes med bredde-først-søk over (felt, besøkte kontrollpunkter).
- Feilsøking: maks ett bytte i alle seks maskiner; flere bytter kan gjøres i grensesnittet, men avvises med forklaring.
- Fasit er et eget, frivillig valg («Vis en løsning»), og forklaringen vises automatisk når oppgaven er løst.
- Dra-og-slipp er ikke laget. Kort flyttes med trykk + knapper eller piltaster.
