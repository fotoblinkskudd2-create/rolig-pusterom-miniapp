"""Designhjernens minne: innspill, lærdom og produktindeks, lagret som filer i minne/.

  python3 -m maskin.minne husk "tekst" [--type tilbakemelding|preferanse|ide|notat] [--produkt mappe]
  python3 -m maskin.minne sok "eldre sensor"          # mest relevante innspill og produkter
  python3 -m maskin.minne indeks                      # bygg minne/produkter.json fra produkter/
  python3 -m maskin.minne kontekst "idé"              # det designmaskinen bør lese før den starter

Filene er ren tekst og JSON, så de kan leses av mennesker, av Claude og av Git.
"""
import argparse
import json
import os
import re
import time

ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MINNE = os.path.join(ROT, "minne")
INNSPILL = os.path.join(MINNE, "innspill.jsonl")
INDEKS = os.path.join(MINNE, "produkter.json")
TYPER = ("ide", "tilbakemelding", "preferanse", "notat", "fil")
STOPP = set("og i på å en et ei som for med til av at det er de den du jeg vi kan skal må ikke har the a of to "
            "in and is for på fra om eller men så seg sin sitt ved ut opp".split())


def ord_i(tekst):
    tekst = tekst.lower().replace("æ", "ae").replace("ø", "o").replace("å", "a")
    return [w for w in re.findall(r"[a-z0-9]{3,}", tekst) if w not in STOPP]


def likhet(a, b):
    """Andel ord i a som finnes i b. Ordstammen (5 første tegn) kan stå hvor som helst i et ord i b,
    så «kniv» og «barn» treffer det sammensatte ordet «barnekniven»."""
    stammer = {w[:5] for w in ord_i(a)}
    ord_b = set(ord_i(b))
    treff = sum(1 for st in stammer if any(st in w for w in ord_b))
    return treff / (len(stammer) or 1)


def husk(tekst, type_="notat", produkt=None, kilde="bruker"):
    if type_ not in TYPER:
        raise ValueError(f"type må være en av {TYPER}")
    os.makedirs(MINNE, exist_ok=True)
    rad = {"tid": time.strftime("%Y-%m-%d %H:%M"), "type": type_, "tekst": tekst.strip(), "kilde": kilde}
    if produkt:
        rad["produkt"] = produkt
    with open(INNSPILL, "a") as f:
        f.write(json.dumps(rad, ensure_ascii=False) + "\n")
    return rad


def innspill():
    if not os.path.exists(INNSPILL):
        return []
    with open(INNSPILL) as f:
        return [json.loads(l) for l in f if l.strip()]


def _kortbeslutning(mappe):
    for fil in ("RAPPORT.md", "SPESIFIKASJON.md", "00_oversikt.md"):
        sti = os.path.join(mappe, fil)
        if not os.path.exists(sti):
            continue
        with open(sti) as f:
            tekst = f.read()
        m = re.search(r"\*\*Kortbeslutning:\*\*\s*(.+?)(?:\n>?\s*\*\*Status|\n\n)", tekst, re.S)
        if m:
            return " ".join(m.group(1).replace(">", " ").split())[:600]
        avsnitt = [a for a in tekst.split("\n\n") if a.strip() and not a.startswith("#")]
        return " ".join(avsnitt[0].split())[:600] if avsnitt else ""
    return ""


def oppdater_indeks():
    rader = []
    for base in ("produkter", "konsepter"):
        d = os.path.join(ROT, base)
        if not os.path.isdir(d):
            continue
        for navn in sorted(os.listdir(d)):
            mappe = os.path.join(d, navn)
            if navn.startswith(("_", ".")) or not os.path.isdir(mappe):
                continue
            st = {}
            if os.path.exists(os.path.join(mappe, "status.json")):
                try:
                    with open(os.path.join(mappe, "status.json")) as f:
                        st = json.load(f)
                except ValueError:
                    pass
            rader.append({
                "mappe": f"{base}/{navn}",
                "ide": st.get("ide", navn.replace("_", " ")),
                "status": st.get("status", "ferdig"),
                "sammendrag": _kortbeslutning(mappe),
                "filer": sorted(f for f in os.listdir(mappe) if f.endswith(".md")),
            })
    os.makedirs(MINNE, exist_ok=True)
    with open(INDEKS, "w") as f:
        json.dump(rader, f, ensure_ascii=False, indent=2)
    return rader


def produkter():
    if not os.path.exists(INDEKS):
        return oppdater_indeks()
    with open(INDEKS) as f:
        return json.load(f)


def sok(tekst, n=5):
    """Mest relevante innspill og produkter for en tekst, sortert etter likhet."""
    inn = sorted(((likhet(tekst, r["tekst"]), r) for r in innspill()), key=lambda x: -x[0])
    prod = sorted(((likhet(tekst, p["ide"] + " " + p["sammendrag"]), p) for p in produkter()),
                  key=lambda x: -x[0])
    return ([r for s, r in inn[:n] if s > 0], [p for s, p in prod[:n] if s > 0])


def kontekst(ide, n=5):
    """Kort tekst med det mest relevante fra minnet, til starten av en designkjøring."""
    inn, prod = sok(ide, n)
    pref = [r for r in innspill() if r["type"] == "preferanse"][-8:]
    deler = ["## Fra minnet (maskin.minne)"]
    if pref:
        deler.append("Eierens preferanser (nyeste sist):")
        deler += [f"- {r['tekst']}" for r in pref]
    if prod:
        deler.append("Lignende tidligere produkter – les RAPPORT/SPESIFIKASJON der før du starter:")
        deler += [f"- {p['mappe']}: {p['sammendrag'][:220]}" for p in prod]
    if inn:
        deler.append("Relevante innspill fra eieren:")
        deler += [f"- [{r['tid']}, {r['type']}] {r['tekst'][:220]}" for r in inn if r["type"] != "preferanse"]
    deler.append("Les også minne/profil.md og minne/laerdom.md.")
    return "\n".join(deler)


def eksporter_md(sti):
    """Skriv innspillene som Markdown (nyeste først), til visning på nettsiden."""
    rader = list(reversed(innspill()))
    linjer = ["# Innspill i minnet", "", f"{len(rader)} innspill, nyeste først. Typer: idé, tilbakemelding, preferanse, notat og fil.", "",
              "| Tid | Type | Innspill | Produkt |", "|---|---|---|---|"]
    for r in rader:
        tekst = r["tekst"].replace("|", "/").replace("\n", " ")
        linjer.append(f"| {r['tid']} | {r['type']} | {tekst} | {r.get('produkt') or ''} |")
    with open(sti, "w") as f:
        f.write("\n".join(linjer) + "\n")


def importer(rader):
    """Ta inn innspill skrevet på nettsiden (dokumenter fra artefaktens db-samling «innspill»).
    Hopper over dem som allerede er importert (samme dokument-id). Returnerer antall nye."""
    finnes = {r["web_id"] for r in innspill() if r.get("web_id")}
    nye = 0
    for d in rader:
        tekst = (d.get("tekst") or "").strip()
        typ = d.get("type") if d.get("type") in TYPER else "notat"
        tid = (d.get("tid") or "")[:16].replace("T", " ")
        nokkel = d.get("id") or tekst          # dokument-id fra nettsiden, ellers teksten
        if not tekst or nokkel in finnes:
            continue
        finnes.add(nokkel)
        os.makedirs(MINNE, exist_ok=True)
        rad = {"tid": tid or time.strftime("%Y-%m-%d %H:%M"), "type": typ, "tekst": tekst, "kilde": "nettside",
               "web_id": nokkel}
        if d.get("produkt"):
            rad["produkt"] = d["produkt"]
        with open(INNSPILL, "a") as f:
            f.write(json.dumps(rad, ensure_ascii=False) + "\n")
        nye += 1
    return nye


def main():
    p = argparse.ArgumentParser(prog="python3 -m maskin.minne")
    sub = p.add_subparsers(dest="kmd", required=True)
    h = sub.add_parser("husk")
    h.add_argument("tekst")
    h.add_argument("--type", default="notat", choices=TYPER)
    h.add_argument("--produkt")
    s = sub.add_parser("sok")
    s.add_argument("tekst")
    sub.add_parser("indeks")
    e = sub.add_parser("eksporter")
    e.add_argument("fil")
    i = sub.add_parser("importer", help="importer innspill fra nettsiden (JSON-liste med tekst/type/produkt/tid)")
    i.add_argument("fil")
    k = sub.add_parser("kontekst")
    k.add_argument("tekst")
    a = p.parse_args()
    if a.kmd == "husk":
        print("Husket:", json.dumps(husk(a.tekst, a.type, a.produkt), ensure_ascii=False))
    elif a.kmd == "sok":
        inn, prod = sok(a.tekst)
        for r in inn:
            print(f"[{r['tid']} {r['type']}] {r['tekst'][:160]}")
        for pr in prod:
            print(f"{pr['mappe']}: {pr['sammendrag'][:160]}")
    elif a.kmd == "eksporter":
        eksporter_md(a.fil)
        print("Skrev", a.fil)
    elif a.kmd == "importer":
        with open(a.fil) as f:
            print(importer(json.load(f)), "nye innspill importert")
    elif a.kmd == "indeks":
        print(f"{len(oppdater_indeks())} produkter og konsepter i {INDEKS}")
    else:
        print(kontekst(a.tekst))


if __name__ == "__main__":
    main()
