# Bamsen – hjernen

En 58 cm bamse med én knapp i poten og en høyttaler i magen. Ingen skjerm. Ingen kamera. Ingen app å lære.

| Hun gjør | Bamsen gjør |
|---|---|
| ingenting | sier fra om medisin/mat/vann til faste tider, spør igjen, varsler familien hvis ingen svar |
| klemmer poten | bekrefter påminnelsen, eller sender klem tilbake til den som skrev, ellers småprat |
| holder poten 2 sek | **familien får varsel: «Ingrid vil prate NÅ. Ring.»** |
| ingen kontakt før 10:30 | familien får alarm (urgent) og beskjed når hun klemmer igjen |

Familien bruker **ntfy**-appen (gratis, iOS/Android): de abonnerer på `topic_ut` og får varsler og en dagsrapport kl 20. De skriver på `topic_inn`, og bamsen leser det høyt. Tittelen blir avsendernavnet («Kari»).

## Kjør nå (terminal, simulert klokke)

```bash
cp config.eksempel.json config.json
python3 bamse.py --config config.json --sim 07:58 --fart 60   # 1 sek = 1 min
# k = klem · r = hold poten · m <tekst> = melding · s = status · q = slutt
python3 -m unittest test_bamse
```

## Kjør i bamsen (Raspberry Pi)

```bash
sudo apt install espeak-ng python3-gpiozero
# sett topic_ut/topic_inn til lange, tilfeldige navn: alle som kjenner navnet kan lese
python3 bamse.py --config config.json --gpio 17
```
Knapp mellom GPIO17 og GND. Kjør som systemd-tjeneste med `Restart=always`.

**Deler (anslag, ikke prissjekket):** Pi Zero 2 W, I2S-forsterker + 3 W høyttaler, trykkbryter i poten, 5 V-strømforsyning med lang ledning, 58 cm bamse med glidelås i ryggen. Rundt 1 000–1 300 kr i deler.

## Beslutninger som er tatt i koden

1. **Bamsen kontrollerer ikke medisin. Den minner deg på det og spør.** Den kan ikke se at en tablett ble svelget. Hvis du selger «kontroll», blir den et medisinsk utstyr (MDR) med ansvar for det. Purringen spør «har du tatt dem?», ikke «ta dem nå». Starter bamsen for sent, sier den ingenting om medisinen og varsler familien i stedet. Begge deler skal hindre dobbeldose.
2. **Bamsen er ikke vennen. Den er en bro.** En bamse kurerer ikke ensomhet. Den sørger for at et menneske ringer. Derfor finnes «hold poten» og «klem tilbake». Derfor står det i dagsrapporten «Ingen sendte Ingrid en melding i dag.» Rapporten er laget for å stikke litt i familien.
3. **Den som betaler, er ikke den som bruker den.** Familien kjøper, Ingrid bor med den. Ingen mikrofon som lytter, ingen kamera. Ingrid må si ja selv og kunne trekke ut kontakten.

## Konkurrenter du må slå
Komp (No Isolation, Oslo): én-knapps skjerm for eldre, familien betaler. Hyodol (Sør-Korea): snakkende dukke for eldre med medisinpåminnelser. ElliQ (USA). Hvis du ikke kan si i én setning hvorfor bamsen slår Komp i Norge, har du ikke et produkt.
