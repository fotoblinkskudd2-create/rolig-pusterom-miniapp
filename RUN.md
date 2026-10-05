# RUN

## Åpne lokalt

1. Last ned alle filene i samme mappe.
2. Åpne `index.html` i Safari eller Chrome.
3. På iPhone: Del → Legg til på Hjem-skjerm (valgfritt).

Ingen server. Ingen konto. (Offline-modus via service worker virker bare når siden serveres over http/https, ikke fra `file://`.)

## Hva som lagres lokalt

| Nøkkel | Innhold |
|--------|---------|
| `checkins` | tid, humør 1–5, valgfri note |
| `doneActions` | hvilke «små grep» som er merket i dag |
| `systemrom.front` | hvem som var her, når, valgfri note |
| `systemrom.lapper` | lapper mellom deler: fra, til, tekst, hvem som har sett den |
| `systemrom.brems` | kjøpsbrems: hva, pris, betalingsmåte, stemmer, avgjørelse |

Ingenting går på nett. Når siden serveres fra containeren, håndhever CSP (`connect-src 'self'`) dette i nettleseren.

## Systemrommet

- **Hvem er her nå?** Skriv navn, alder eller «vet ikke». Tidligere navn blir knapper.
- **Mens du var borte:** Når et navn logger seg inn igjen, vises alt som skjedde siden sist det navnet var her: bytter, lapper, kjøpsønsker og sjekk-ins.
- **Lapper:** Beskjed til ett navn eller til alle. Den som leser, kvitterer.
- **Kjøpsbrems:** Skriv ønsket i stedet for å trykke kjøp. Det låses i 48 timer. Alle kan stemme. Etter 48 timer: slipp det eller kjøp det. Pengene som ble værende, telles, også gjeld på avbetaling som aldri ble til.

## Eksport

- Historikk → «Ta historikken med deg» → `pusterom-historikk.txt`
- Systemrommet → «Last ned» → `systemrom-ÅÅÅÅ-MM-DD.json` (alt, inkludert sjekk-ins)

## Isolation Mirror → Grok-bot

Skriv note → Generer → Kopier prompt → lim inn i Labben eller i Grok-bot med `/lab`.

## Container

```sh
docker build -t pusterom .
docker run --rm --read-only --tmpfs /tmp --tmpfs /var/cache/nginx --cap-drop ALL -p 8080:8080 pusterom
# http://localhost:8080
```

nginx-unprivileged, uid 101, port 8080, `/healthz`. Ingen tilgangslogg.

## Kubernetes

```sh
kubectl apply -k k8s/base            # namespace, deployment, service, networkpolicy, pdb
kubectl apply -k k8s/overlays/prod   # + ingress med TLS (bytt host og image-tag først)
```

- Pod Security `restricted` på namespace
- Ikke-root, read-only rotfilsystem, alle capabilities fjernet, seccomp RuntimeDefault
- Ingen service account-token montert
- NetworkPolicy: inn bare på 8080, **ingen utgående trafikk**
- 2 replikaer, PDB, rolling update uten nedetid

## Test

```sh
npm install && npx playwright install chromium
npm run smoke -- http://localhost:8080
```

CI (`.github/workflows/ci.yml`) validerer manifestene med kubeconform, bygger imaget, kjører det låst slik Kubernetes gjør, kjører røyktesten, og pusher til GHCR ved merge til `main`.
