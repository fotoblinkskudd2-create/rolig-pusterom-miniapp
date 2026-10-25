# 🧵 Konspirasjonslabben

**Seks oppgaver. Én stjålet time. Null sannhet.**

Et satirisk kursopplegg der deltakerne bygger konspirasjonsteorier selv, av en helt vanlig nyhet fra i dag: natt til **søndag 25. oktober 2026** ble klokka stilt fra 03:00 tilbake til 02:00. Samtidig var det farevarsel om storm på Vestlandet. En time forsvant, og en storm kom samme natt. *Tilfeldig?*

Hvert nivå lærer bort én manipulasjonsteknikk ved å la deltakerne bruke den. Til slutt går de inn i **bakrommet**, der teknikken får sitt ordentlige navn.

## Nivåene

| # | Nivå | Hva du gjør | Hva du egentlig lærer |
|---|------|-------------|------------------------|
| 1 | **Den stjålne timen** | Snurrer Cui Bono-maskinen (mistenkt + motiv + «bevis») og skriver teorien | Cui bono-feilslutningen |
| 2 | **Tallmagi i Justervesenets kjeller** | Mater maskinen med datoer og navn. Den finner *alltid* 666, 1814 eller 42 | Texas-skarpskytteren. Maskinen viser åpent hvilke juksekonstanter den brukte |
| 3 | **Den røde tråden** | Kobler lapper på en korktavle, og hver tråd krever et «fordi» | Konjunksjonsfeilen: sannsynligheten ganges ned for hver tråd. Bonus for å lage en sirkel |
| 4 | **Sitatsmia** | Sladder ord fra en kjedelig (fiktiv) pressemelding til den blir uhyggelig | Sitatfisking: hvert ord er ekte, men meningen er falsk |
| 5 | **Motbevis-immunforsvaret** | Forklarer hvorfor hvert motbevis egentlig bekrefter teorien | Ufalsifiserbarhet (Popper) |
| 6 | **Viralovnen** | Skriver det endelige innlegget, får delingsprognose og publiserer til Arkivet | Usannhet sprer seg raskere (Vosoughi m.fl., *Science* 2018) |

Hele veien vises **to målere som går hver sin vei**: *Overbevisningskraft* stiger med retorikken, mens *Sannsynlighet for at alt stemmer* stuper med hvert ledd. Det er hovedpoenget i opplegget.

**Arkivet** er en felles vegg der alle deltakerne kan se hverandres teorier. Der kan du stemme «👁 Åpnet øynene mine» eller «🔍 Jeg sjekket kilden». Bare den ene er en dyd.

**Avsløringen** samler alle seks teknikkene og gir deltakerne fem spørsmål de bør stille seg før de deler noe.

## Kjør

```bash
cd konspirasjonslabben
npm start            # http://localhost:3000
npm test             # 15 tester: motor + API
```

Krever Node 18 eller nyere, og ingen avhengigheter. `PORT` og `ARKIV_FIL` kan settes som miljøvariabler. Arkivet lagres i `data/arkiv.json`.

## Arkitektur

```
server.js        HTTP-server (node:http), statiske filer + JSON-API, enkel rate limit
lib/engine.js    All logikk: saken, nivåene, tekstanalyse, tallmagi, graf-sirkler, sitat, viralitet
lib/arkiv.js     Arkivet: JSON-fil med atomisk skriving
public/          index.html, style.css, app.js (vanilla JS, kun textContent, ingen innerHTML)
test/            node:test – motor og API
```

| Endepunkt | |
|---|---|
| `GET /api/sak` | Dagens sak, nivåer, brikker, pressemelding, motbevis |
| `GET /api/cuibono` | Ett spinn på maskinen |
| `POST /api/tallmagi` `{input}` | Finner Det Hemmelige Tallet |
| `POST /api/vurder` `{nivaa, data}` | Vurderer `cuibono`, `traad`, `sitat`, `immun`, `viral` |
| `GET /api/teorier?sort=topp\|nye` | Arkivet |
| `POST /api/teorier` `{alias, tekst}` | Publiser |
| `POST /api/teorier/:id/stem` `{type: aapnet\|sjekket}` | Stem |

## For kursholdere

- Ca. 45–60 minutter. Deltakerne kan jobbe i par.
- Del ut lenken og la Arkivet stå på storskjerm. Teoriene dukker opp der etter hvert.
- Les opp den mest «øyeåpnende» teorien til slutt, og gå så gjennom Avsløringen sammen.
- Vil du bytte til en annen nyhet, endrer du `SAK`, `MISTENKTE`, `MOTIVER`, `BEVIS`, `BRIKKER`, `PRESSEMELDING` og `MOTBEVIS` i `lib/engine.js`.

*Satire. Alle mistenkte, motiver, rådgivere og stekeovner er oppdiktet. Klokkeskiftet er dessverre ekte.*
