# rolig-pusterom-miniapp

Rolig mini-app. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Pure HTML. Lokal lagring.

**1.1 (29.08.2026):** nav-fix, lokal-first-linje, export av historikk, Isolation Mirror bundet til Labben/Grok-bot.

Åpne `index.html`. Les `RUN.md`.

**1.1 faktisk (19.10.2026):** 1.1-commiten endret bare dokumentene. Nå er fiksene i `index.html`: nav følger siden, `#pusterom`-lenker, ingen `alert()`, lokal-first-linje, eksport, escaping av notater. Verifisert av `node test/pusterom.test.mjs`.

## Produkter

| # | Navn | Hva |
|---|------|-----|
| 01 | [Kjølerom + Kortkappe](products/01-kjolerom/) | 48t-fryser for kjøp med overlevering mellom deler + 3D-printet kortkappe |
| 02 | [Pustestein](products/02-pustestein/) | Pusterom-rytmen (4–2–6) som tommelrille i en tung stein, bygd etter din tommel, med fotovindu |
| 03 | [Granatbelte](products/03-granatbelte/) | Gonzo-skrivemaskin: faktakort med kilde, rå-modus uten sletting, lint etter dine egne regler + kortstativ |
| 04 | [Brevvakt + Brevhylle](products/04-brevvakt/) | Lim inn inkassobrevet: lovlig maks salær og rente etter forskriften, overkrav, innsigelse. Hylle som ikke lar brev gjemmes |

Alle tester: `./test/alle.sh` · Felles renderer: `tools/render.py`
