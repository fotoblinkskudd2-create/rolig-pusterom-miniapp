# Dokumentert feilforløp (faktisk kjøring mot lokal testserver)

Terskel: 2 påfølgende feil. Timeout 1,0 s. Treg-grense 500 ms.

| Tid | Servermodus | Utfall | Status | ms | Årsak | Åpen hendelse | Merknad |
|---|---|---|---|---:|---|---|---|
| 10:00:00 | frisk | ok | 200 | 1 |  | – |  |
| 10:00:10 | feilende | http_feil | 503 | 1 | HTTP 503 Service Unavailable | – | første feil – under terskel |
| 10:00:20 | feilende | http_feil | 503 | 1 | HTTP 503 Service Unavailable | #1 | andre feil – hendelse åpnes |
| 10:00:30 | treg | timeout | – | 1002 | ingen svar innen 1.0 s | #1 | treg > timeout |
| 10:00:40 | nede | tilkoblingsfeil | – | 3 | RemoteDisconnected: Remote end closed connection without response | #1 | tilkobling lukket |
| 10:00:50 | frisk | ok | 200 | 1 |  | – | gjenoppretting – hendelse lukkes |
| 10:01:00 | treg | treg | 200 | 701 | svar etter 701 ms (grense 500 ms) | – | treg men innen timeout |
| 22:10:00 | feilende | http_feil | 503 | 1 | HTTP 503 Service Unavailable | – | i vedlikeholdsvindu |
| 22:10:10 | feilende | http_feil | 503 | 1 | HTTP 503 Service Unavailable | – | i vedlikeholdsvindu |
| 23:00:10 | feilende | http_feil | 503 | 1 | HTTP 503 Service Unavailable | – | etter vindu – første feil |
| 23:00:20 | frisk | ok | 200 | 1 |  | – |  |
