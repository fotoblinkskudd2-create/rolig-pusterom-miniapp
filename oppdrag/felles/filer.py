"""Hash, CSV og små filhjelpere."""
import csv
import hashlib
import io
import json
import os


def sha256_fil(sti, blokk=1 << 16):
    h = hashlib.sha256()
    with open(sti, "rb") as f:
        while True:
            b = f.read(blokk)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


def sha256_bytes(data):
    return hashlib.sha256(data).hexdigest()


def les_csv(sti):
    """Returnerer liste av (radnummer, dict). Radnummer er linjen i filen (header = 1)."""
    with open(sti, newline="", encoding="utf-8-sig") as f:
        les = csv.DictReader(f)
        return [(i + 2, rad) for i, rad in enumerate(les)]


def skriv_csv(sti_eller_none, rader, felt=None):
    felt = felt or (list(rader[0].keys()) if rader else [])
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=felt, extrasaction="ignore")
    w.writeheader()
    for r in rader:
        w.writerow(r)
    tekst = buf.getvalue()
    if sti_eller_none:
        os.makedirs(os.path.dirname(os.path.abspath(sti_eller_none)), exist_ok=True)
        with open(sti_eller_none, "w", encoding="utf-8", newline="") as f:
            f.write(tekst)
    return tekst


def skriv_json(sti, data):
    os.makedirs(os.path.dirname(os.path.abspath(sti)), exist_ok=True)
    with open(sti, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        f.write("\n")


def les_json(sti):
    with open(sti, encoding="utf-8") as f:
        return json.load(f)
