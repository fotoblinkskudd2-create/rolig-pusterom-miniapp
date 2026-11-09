# DEVIN — destillat + byggeordre

## Destillat (hva repoet faktisk er)

- **Kjerne:** `index.html`. Rolig app med fire sider: Innsjekk (humør 1–5 + note), Pusterom (4-2-6-pust), Små grep (7 handlinger, avkrysses per dag) og Historikk (20 siste + ukestall). Ren HTML, `localStorage`, ingen server.
- **Sidearm:** `isolation-mirror.html`. Note og bilde blir til en privat 3-stegs protokoll og en ferdig `/lab`-prompt til Grok-bot.
- **Filosofi (HULL.md):** lokal-first, ingen sky, ingen konto, én bruker.

### Løgnen i loggen
Commit `3cc07de` («1.1: nav-fix, lokal-first, historikk-export …») endret **bare** `README.md`, `HULL.md` og `RUN.md`. `index.html` er fortsatt 1.0:

| HULL.md sier fikset | Virkeligheten i `index.html` |
|---|---|
| nav-fix | `event.currentTarget` står fortsatt (linje 303). «Pust med meg» lar fanen Hjem stå markert |
| «Alt blir på denne enheten» | finnes ikke |
| ingen `alert()` | `alert()` står fortsatt (linje 279) |
| eksport av historikk | finnes ikke |
| lenke til Isolation Mirror | finnes ikke |

I tillegg: `e.note` settes rett inn i `innerHTML` (XSS mot deg selv, og koden knekker på `<`). Det finnes ingen PWA, ingen dark mode og ingen tester.

---

## Byggeordre til Devin (lim inn én om gangen)

Devin fungerer best med små, avgrensede økter som har en klar definisjon av ferdig. Lag Knowledge-oppføringen først, så gjelder reglene i alle øktene.

### 0. Knowledge (lim inn under Settings → Knowledge)
```
Repo fotoblinkskudd2-create/rolig-pusterom-miniapp: lokal-first. ALDRI legg til server,
konto, analytics, tredjeparts-script eller nettverkskall med brukerdata. Kun vanilla
HTML/CSS/JS, ingen build-steg. All brukertekst er på norsk bokmål, rolig og kort.
Brukerdata skrives med textContent, aldri innerHTML. Test med Playwright i mobilviewport.
```

### 1. Gjør 1.1 sant (fiks først, det er en blokker)
```
I index.html: (a) switchPage(name) skal markere nav-knappen ut fra name, ikke
event.currentTarget, legg data-page på nav-knappene. (b) Erstatt alert() med inline
tekst under humørskalaen. (c) Legg til linjen «Alt blir på denne enheten.» på Hjem.
(d) Historikk: knapp «Ta historikken med deg» som laster ned pusterom-historikk.txt
(dato, humør, note). (e) Lenke nederst på Hjem til isolation-mirror.html.
(f) renderHistory: bruk textContent for note. Skriv Playwright-test for a–f. Åpne PR.
```

### 2. PWA, så den kan ligge på hjemskjermen i iPhone
```
Gjør appen til en installerbar PWA: manifest.webmanifest (navn «Pusterom», farge
#a8c5b0), ikon 192/512 (enkel sirkel, generer som SVG→PNG), service worker med
cache-first for index.html og isolation-mirror.html, slik at den virker helt offline.
Apple-touch-icon og meta-tags for iOS. Test offline i Playwright. Ingen nye avhengigheter.
```

### 3. Dark mode + nattmodus
```
Legg til prefers-color-scheme: dark med fargene fra isolation-mirror.html (#1a1f1c osv).
Etter kl. 22 gir Pusterom automatisk tilbud om lengre utpust (4-2-8). Ingen innstillingsside.
```

### 4. Mønster-speil («intelligent», men lokalt)
```
Ny seksjon på Historikk: «Det jeg ser». Ren JS-analyse av checkins + doneActions:
snitt per ukedag, hvilket små grep som oftest går foran bedre humør neste innsjekk,
dager uten innsjekk. Maks 3 setninger, aldri diagnose, aldri «du bør». Vis det
kun ved ≥7 innsjekker. Enhetstester for beregningene.
```

### 5. Kryptert backup (lokal-first uten å miste alt)
```
«Lag sikkerhetskopi»: eksporter checkins+doneActions som JSON kryptert med passord
(WebCrypto, PBKDF2 + AES-GCM). «Gjenopprett»: les fil + passord og slå sammen uten
duplikater. Ingen sky. Test rundtur og feil passord.
```

### 6. Valgfritt AI-lag (eksplisitt opt-in)
```
Isolation Mirror: legg til knappen «Spør en modell» som er av som standard. Brukeren
limer inn sin egen API-nøkkel (lagres kun i sessionStorage). Bare noten sendes, aldri
bildet. Tydelig advarsel før sending. Svaret vises som et nytt kort. Uten nøkkel
fungerer alt som før.
```

### 7. Kriseknapp (bør være med før appen deles)
```
Fast, diskret lenke «Trenger du noen nå?» på alle sider med Mental Helse 116 123,
Kirkens SOS 22 40 00 40 og 113. Vises tydeligere hvis humør 1 er valgt 3 ganger på rad.
```

**Rekkefølge:** 1 → 7 → 2 → 3 → 4 → 5 → 6. Ikke start 2 før 1 er merget.
