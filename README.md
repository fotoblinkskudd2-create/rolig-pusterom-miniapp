# Oppfinnelsesmaskinen

Finn gode produktdesign før du lager ett eneste fysisk eksemplar.
Du beskriver **hva som kan endres** og **hva som er bra**. Maskinen prøver
tusenvis av kombinasjoner og gir deg de beste konseptene.

Den er bare vanlig Python 3.8+, uten noe som må installeres.

## Kom i gang

```bash
python3 -m maskin produkter/tannborste                      # balansert
python3 -m maskin produkter/tannborste --fokus rengjøring   # maks rengjøring
python3 -m maskin produkter/tannborste --topp 5 --lagre beste.json
python3 -m unittest discover tester                         # sjekk at alt virker
```

## Nytt produkt på 5 steg

1. `cp -r produkter/_mal produkter/mitt-produkt`
2. **ROM** i `problem.py`: alt du kan endre, med lovlige verdier.
   `Tall(lo, hi)`, `Heltall(lo, hi)` eller `Valg([...])`.
3. **score(d)**: gi hvert delmål en poengsum mellom 0 og 1. Nøkler som begynner med `_`
   (som `_pris_kr`) blir vist, men teller ikke.
4. **FOKUS**: én profil per mål eller kundegruppe, med vekter per delmål.
5. Kjør `python3 -m maskin produkter/mitt-produkt`.

Valgfritt:
- `rydd(d)` gjør designet fysisk mulig, for eksempel slik at en manuell børste ikke får timer.
- `NOKKEL` sier hvilke parametre som skiller to konsepter fra hverandre.
- `REFERANSE` er et kjent produkt du vil sammenligne med.

## Arbeidsflyten

```
regler/antakelser ──► score() ──► maskin ──► topp-konsepter
        ▲                                         │
        │                                         ▼
   målinger  ◄── test på folk ◄── prototype ◄── tegning/CAD
```

Den viktigste regelen: **maskinen blir aldri bedre enn `score()`**. Hver gang du har
målt noe på en ekte prototype, legger du inn tallet i stedet for antakelsen. Det er
slik verdien bygges opp fra produkt til produkt.

## Før du bruker penger

- **Patentsøk** på [Espacenet](https://worldwide.espacenet.com) og hos Patentstyret.
- **Snakk med kunder.** Hvilket problem har de egentlig?
- **Regelverk:** CE-merking, batteri, materialer som er i kontakt med mat eller munn.

## Produkter

| Mappe | Status |
|---|---|
| `produkter/tannborste` | P1 «Ren»: tegning, OpenSCAD-modell, STL-filer, spesifikasjon. Ikke testet. |
| `produkter/_mal` | Mal (eksempel: drikkeflaske) |
