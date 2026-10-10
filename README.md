# rolig-pusterom-miniapp

Rolig mini-app. 4 sider: Innsjekk, Pusterom, Små grep, Historikk. Pluss Isolation Mirror. Ren HTML. Alt blir på enheten.

Åpne `index.html`. Les `RUN.md`.

## Versjoner

**1.2 (10.10.2026)** — 1.1 på ekte. Commit `3cc07de` beskrev nav-fix, lokal-first og export, men endret bare dokumentasjonen. `index.html` var fortsatt 1.0. Nå:

- Nav-fix: «Pust med meg» markerer riktig fane. Ingen `event.currentTarget`.
- «Alt blir på denne enheten» står på forsiden.
- Ingen `alert()`. Mild beskjed i stedet.
- Historikk → `.txt`, og sikkerhetskopi `.json` som kan hentes inn igjen (slår sammen, overskriver ikke).
- «Slett alt på denne enheten» (to trykk).
- Humørkurve siste 14 dager.
- Ukesoppsummering fra mandag: sjekk-inn + pusteøkter + små grep.
- Pusterom: sirkelen følger 4-2-6 riktig, teller runder, stopper når du bytter side, holder skjermen våken.
- Isolation Mirror lenket fra forsiden. Kopier gir beskjed. Bilde kan fjernes.
- Dark mode. PWA: ikon, hjemskjerm, virker offline (over http/https).
- Tilgjengelighet: zoom tillatt, `aria`-merking, fokusring, `prefers-reduced-motion`.
- Notater vises som tekst, ikke HTML.
- Gamle data fra 1.0 flyttes automatisk.

**1.1 (29.08.2026)** — dokumentasjon (`RUN.md`, `HULL.md`), Isolation Mirror med forhåndsvisning og Labben-prompt.

**1.0** — fire sider, lokal lagring, pustesirkel.

## Test

```
node test/smoke.mjs
```

Krever `playwright` og `http-server`. Går gjennom alle sider, lagring, export/import, offline, dark mode og `file://`.
