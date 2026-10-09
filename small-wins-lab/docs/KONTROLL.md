# Kontrollbevis

Kjørt 2026-10-09 i skymiljø (Linux, Node 22.22, Python 3.13, Playwright 1.56 + medfølgende headless Chromium).
Alle mobilkontroller er **simulert** (Chromium med 320/375 px viewport). Ingen test på fysisk telefon.

## 1. Logikk og data — `node --test tests/logic.test.js` → 17/17 bestått

Testene bruker egne evaluatorer og håndskrevne fasiter. Motoren brukes bare som det som testes.

| Kontroll | Metode | Resultat |
|---|---|---|
| 30 oppgaver, unike ID-er SIG/REK/MON/RUT/FEI-01..06, 2 per nivå per tema | opptelling | ✓ |
| Alle 14 obligatoriske felt, regeltekst, instruksjon ≤ 2 setninger | feltkontroll | ✓ |
| Signaler: alle 2ⁿ kombinasjoner | egen portevaluator + håndskrevet sannhetstabell | ✓ (1, 1, 2, 2, 1, 2 løsninger) |
| Rekkefølge: alle permutasjoner (6–720) | egen permutasjonsgenerator + egen regelsjekk | ✓ (2, 2, 2, 2, 2, 3) |
| Mønstre: alle brikkekombinasjoner; hver tom plass bundet av hver regel | egen periodisitetssjekk | ✓ (1 hver) |
| Ruter: korteste rute | egen Bellman-Ford-avslapping vs. motorens BFS vs. håndtall | ✓ 6, 6, 8, 10, 12, 16 |
| Ruter: kontrollpunkt i RUT-05 gir faktisk omvei | samme søk uten punkt = 8 | ✓ |
| Feilsøking: alle enkeltbytter | egen maskinkjøring + regelsjekk | ✓ (2, 2, 1, 2, 1, 2) |
| Eksempelløsning består, starttilstand avvises | alle 30 | ✓ |
| Kjente ugyldige forsøk avvises med konkret melding | f.eks. FEI-04 × 3 («under 0»), FEI-05 «over 20», RUT-02 lengre rute, REK-01 plassering | ✓ |
| Alternative løsninger godtas | SIG-03/04/06, REK alle, RUT-02/05 alternative ruter, RUT-04 lengre rute (korteste ikke krevd), FEI-01/02/04/06 | ✓ |
| Lagring: rens, streng import, minne-fallback | ødelagte felt, XSS-streng, feil versjon, for stor fil, ukjente ID-er | ✓ |

Full liste over søkerom og alle løsninger: `docs/losbarhet.md`.

## 2. Ende-til-ende — `node tests/e2e.js` → 20/20 bestått

Rålogg: `docs/e2e-resultat.txt`.

1. Én inngang «Prøv en oppgave» → SIG-01.
2. Feilforsøk → «Prøv igjen.» + konkret portforklaring + «Se hva denne brikken gjør»; brettet bevart.
3. Korrekt → «Det virket.» + «Du fant en løsning.» + forklaring; dobbeltklikk på «Sjekk» trygt.
4. Alternativ løsning godtas (SIG-03 bare B; REK-01 ■ ● ▲).
5. Hint 1 og 2 midt i forsøk; forsøket uendret; «Ingen flere hint».
6. Angre etter feil (FEI-01): feil bytte → avvist → angre → riktig bytte → godkjent.
7. Ruter: utenfor brettet, stein og skrått steg forklares; angre fjerner siste steg; **reload** gjenoppretter oppgave og rute; startsiden sier «fortsetter på RUT-02».
8. Bytte tema og komme tilbake bevarer forsøket (MON-02).
9. **Tastatur uten mus**: REK-03 med piltaster (fokus følger kortet), RUT-01 med piltaster, «Sjekk» med Enter.
10. **Alle 30 oppgaver** i grensesnittet: start → «Prøv igjen», eksempelløsning → «Det virket».
11. Ugyldig import (ugyldig forsøk, ikke-JSON) avvises; lagret framdrift byte-for-byte uendret.
12. Eksport (nedlastet fil) → slett alt → import fra fil: løste, forsøk, hint og gjeldende oppgave like.
13. Ødelagt forsøk i lagring: forståelig melding, resten reddet, oppgaven starter fra gyldig start.
14. Lagring som ikke er JSON: melding og ny start.
15. `localStorage` kaster feil: appen virker i minnet, banner sier at framdrift ikke lagres.
16. 320 px: ingen vannrett rulling på startside, temaside, framdrift, alle 30 oppgaver og utskrift; ingen synlige knapper under 44 × 44 px.
17. Utskrift (print-media): 30 kort, 30 fasitposter, fasit med sideskift, ingen fasit i kortene. PDF skrevet: `docs/oppgavekort.pdf` (22 A4-sider; side 12 kontrollert visuelt som stikkprøve).
18. `file://` uten server: app og utskrift virker.
19. **Offline**: side lastet via http, service worker aktiv og kontrollerer siden → testserveren **stoppet** (bekreftet: tilkobling nektes) og nettleserkonteksten satt offline → reload av appen, løse en oppgave og åpne `print.html` virker.
20. Ingen JavaScript-feil i hovedkonteksten.

## 3. Feil funnet og rettet under kontroll

| Funn | Årsak | Rettelse | Kontroll |
|---|---|---|---|
| MON-03 godtok tre svar | Periode 6 i en sekvens på 10: plass 6 var ikke bundet | Sekvensen forlenget til 12; ny test krever bundne plasser | logikktest |
| Rutenettet viste `[object HTMLButtonElement]` | DOM-hjelper flatet bare ett nivå | `flat(Infinity)` | skjermbilde + e2e |
| Temafaner skjulte lenkerollen | `role="listitem"` på `<a>` | `<nav>` med vanlige lenker | e2e |
| Utskrift 37 px for bred på 320 px | `nowrap`-spenn uten bruddpunkt | `inline-block` | e2e |
| RUT-05: kontrollpunktet ga ingen omvei | Punktet lå på korteste vei | Flyttet; korteste 12 (8 uten) | logikktest |

## 4. Ikke kontrollert

- Fysisk telefon, iOS Safari, Firefox. Service worker kun kontrollert i Chromium.
- Skjermleser (VoiceOver/NVDA). Bare ARIA-attributter og tastaturflyt er kontrollert.
- Utskrift på fysisk skriver (bare PDF fra Chromium).
- Brukertest med barn. Ingen påstand om læringseffekt.
