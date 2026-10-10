# rolig-pusterom-miniapp

Rolig mini-app. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Pure HTML. Lokal lagring. Ingen konto, ingen sky.

Åpne `index.html`. Les `RUN.md`.

## Versjoner

**1.2 (10.10.2026):** 1.1 var bare dokumentert – `index.html` var aldri endret. Nå er det gjort, pluss:
nav-fix, lokal-først-linje, hint i stedet for `alert()`, eksport til `.txt`, slett-alt (to trykk),
lenke til Isolation Mirror, 14-dagers humørgraf, uke-oppsummering (sjekk-inn + pusteøkter + små grep),
to pustemønstre (Rolig 4·2·6 og Boks 4·4·4·4) med rundeteller, hjelpetelefoner, mørk modus,
PWA (ikon, offline, Hjem-skjerm), skjermleser-støtte, redusert bevegelse, og notater kan ikke lenger kjøre kode (XSS).
Isolation Mirror: kopier-knappen sier fra, virker uten Clipboard API, bildet kan fjernes.

**1.1 (29.08.2026):** dokumentasjon for nav-fix, lokal-først, export, Isolation Mirror → Labben/Grok-bot.

## Test

```
node test/smoke.mjs
```

Krever Playwright. Starter en lokal server og klikker gjennom alle fire sider + Isolation Mirror i Chromium.
`SHOTS=mappe node test/smoke.mjs` lagrer skjermbilder i lys og mørk modus.
