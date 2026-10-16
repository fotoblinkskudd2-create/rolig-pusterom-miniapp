# 250 ideer → prototype → pitch

Hele løypa fra oppdraget, steg 1–8, kjørt i ett repo.

| Steg | Hva | Fil |
|---|---|---|
| 1 | Research: fem kamper, topp 5 udekkede behov, 5 eksisterende løsninger med svakheter, underbrukt teknologi og kilder | [`01-research.md`](01-research.md) |
| 2 | 250 ideer, 50 per kategori: navn, én linje, målgruppe, kjernefunksjon og stack | [`02-250-ideer.md`](02-250-ideer.md) · [`data/ideas250.json`](data/ideas250.json) |
| 3 | Topp 15 med full brief, inkludert etikk og sikkerhet | [`03-topp15-briefs.md`](03-topp15-briefs.md) · [`data/top15.json`](data/top15.json) |
| 4 | **Fungerende MVP av #1, Varsellys** (bipolar: signal → plan → handling) | [`mvp-varsellys/`](mvp-varsellys/) |
| 5 | Landingsside: hero, fem tall, filtrerbare topp 15, MVP, alle 250 søkbare og et forslag-skjema | [`landing/`](landing/) (bygg: `python3 landing/build.py`) |
| 6 | Hero-illustrasjon som SVG (skalerbar, animert på landingssiden) og PNG | [`promo/hero.svg`](promo/hero.svg) · [`promo/hero-1600x900.png`](promo/hero-1600x900.png) |
| 7 | 30 s promovideo, 16:9, rendret bilde for bilde fra HTML | [`promo/promo-30s.mp4`](promo/promo-30s.mp4) · kilde [`promo/promo.html`](promo/promo.html) + [`promo/render.js`](promo/render.js) |
| 8 | 30 s musikk: piano + strykepute, 70 BPM, C–Am–F–G, bygger forsiktig opp | [`promo/music.wav`](promo/music.wav) · kilde [`promo/music.py`](promo/music.py) |

## Avvik fra oppskriften

- Perplexity, ChatGPT, v0, Midjourney, Runway og Eleven Music ble ikke brukt. Alt er laget her: research med websøk, bilde som kode, video med Playwright og ffmpeg, musikk med numpy. Fordelen er at alt kan bygges på nytt og redigeres.
- «salmbod» er tolket som **kronisk smerte og sorg**, slik oppdraget foreslo.
- Musikken er syntetisert og enkel. Vil du ha produksjonskvalitet, kan du bruke Eleven Music-prompten fra oppdraget og bytte ut `music.wav`, så kjører du ffmpeg-linjen under på nytt.
- Videoen har ingen voiceover ennå. Steg 8 i oppdraget ba om musikk.

## Bygg video på nytt

```bash
cd pipeline/promo
python3 music.py
NODE_PATH=$(npm root -g) node render.js
ffmpeg -framerate 25 -i frames/f%04d.png -i music.wav -c:v libx264 -pix_fmt yuv420p -crf 20 -c:a aac -b:a 160k -shortest -movflags +faststart promo-30s.mp4
```
