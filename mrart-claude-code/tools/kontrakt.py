#!/usr/bin/env python3
"""Oppgavekontrakt: 12 felt, contract_hash og kontrollerte statusoverganger.

  python3 tools/kontrakt.py ny <id> "<mål>"        -> skriver .mrart/kontrakter/<id>.json
  python3 tools/kontrakt.py valider <fil.json>     -> sjekker felt og hash
  python3 tools/kontrakt.py status <fil.json> <NY_STATUS> [--bevis <sti>]
  python3 tools/kontrakt.py hash <fil.json>

Statusreglene følger Porteføljeregisteret. KLAR FOR GODKJENNING og LEVERT krever
at hvert akseptkriterium har bestått bevis. LEVERT krever i tillegg distribusjon != "ingen"
og godkjent_av satt (menneske).
"""
import hashlib, json, os, sys, datetime

FELT = ["id", "mal", "kilde", "input", "leveranse", "akseptkriterier", "motprove",
        "tillatelser", "stopp", "status", "neste", "eier"]
STATUSER = ["AVKLART", "RESEARCH", "BYGG", "KONTROLL", "RETTING",
            "KLAR FOR GODKJENNING", "LEVERT", "BLOKKERT", "EPLE"]
OVERGANGER = {
    "AVKLART": {"RESEARCH", "BYGG", "BLOKKERT", "EPLE"},
    "RESEARCH": {"BYGG", "AVKLART", "BLOKKERT", "EPLE"},
    "BYGG": {"KONTROLL", "BLOKKERT"},
    "KONTROLL": {"RETTING", "KLAR FOR GODKJENNING", "BLOKKERT"},
    "RETTING": {"KONTROLL", "BLOKKERT"},
    "KLAR FOR GODKJENNING": {"LEVERT", "RETTING"},
    "LEVERT": {"RETTING"},
    "BLOKKERT": {"AVKLART", "BYGG", "RETTING"},
    "EPLE": {"AVKLART", "BLOKKERT"},
}
SPEC_FELT = ["id", "mal", "kilde", "input", "leveranse", "akseptkriterier", "motprove", "tillatelser", "stopp"]

def contract_hash(k: dict) -> str:
    spec = {f: k.get(f) for f in SPEC_FELT}
    return hashlib.sha256(json.dumps(spec, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

def valider(k: dict) -> list:
    feil = [f"mangler felt: {f}" for f in FELT if f not in k]
    st = k.get("status", {})
    if not isinstance(st, dict) or set(st) != {"verdi", "arbeid", "artefakt", "kontroll", "distribusjon"}:
        feil.append("status må ha verdi/arbeid/artefakt/kontroll/distribusjon")
    elif st["verdi"] not in STATUSER:
        feil.append(f"ukjent status: {st['verdi']}")
    if not k.get("akseptkriterier"):
        feil.append("minst ett akseptkriterium kreves")
    if k.get("contract_hash") and k["contract_hash"] != contract_hash(k):
        feil.append("contract_hash stemmer ikke — SPEC er endret etter låsing")
    neste = str(k.get("neste", ""))
    if len(neste.split()) < 2:
        feil.append("neste må være ett verb + ett objekt")
    return feil

def ny(id_, mal):
    k = {
        "id": id_, "mal": mal, "kilde": [], "input": [], "leveranse": "",
        "akseptkriterier": [{"krav": "", "bevis": None, "bestatt": False}],
        "motprove": "", "tillatelser": ["les", "skriv lokalt"],
        "stopp": ["hemmelighet", "3 like feil", "kosttak", "operatør sier stopp"],
        "status": {"verdi": "AVKLART", "arbeid": "", "artefakt": "", "kontroll": "", "distribusjon": "ingen"},
        "neste": "fyll kontrakt", "eier": "operatør", "godkjent_av": None, "logg": [],
    }
    return k

def bytt_status(k, ny_status, bevis=None):
    gammel = k["status"]["verdi"]
    if ny_status not in STATUSER:
        raise ValueError(f"ukjent status {ny_status}")
    if ny_status not in OVERGANGER[gammel]:
        raise ValueError(f"ulovlig overgang {gammel} -> {ny_status}")
    if ny_status in ("KLAR FOR GODKJENNING", "LEVERT"):
        mangler = [a["krav"] for a in k["akseptkriterier"] if not (a.get("bestatt") and a.get("bevis"))]
        if mangler:
            raise ValueError(f"falsk ferdig: kriterier uten bestått bevis: {mangler}")
        k["contract_hash"] = contract_hash(k)
    if ny_status == "LEVERT":
        if not k.get("godkjent_av"):
            raise ValueError("LEVERT krever godkjent_av (menneske)")
        if k["status"]["distribusjon"] in ("", "ingen"):
            raise ValueError("LEVERT krever faktisk distribusjon")
    k["status"]["verdi"] = ny_status
    k["logg"].append({"tid": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
                      "fra": gammel, "til": ny_status, "bevis": bevis})
    return k

def main(a):
    if not a:
        print(__doc__); return 2
    cmd = a[0]
    if cmd == "ny":
        k = ny(a[1], a[2] if len(a) > 2 else "")
        os.makedirs(".mrart/kontrakter", exist_ok=True)
        sti = f".mrart/kontrakter/{a[1]}.json"
        if os.path.exists(sti):
            print(f"finnes allerede: {sti}"); return 1
        json.dump(k, open(sti, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(sti); return 0
    k = json.load(open(a[1], encoding="utf-8"))
    if cmd == "valider":
        f = valider(k)
        print("\n".join(f) if f else "KONTRAKT OK"); return 1 if f else 0
    if cmd == "hash":
        print(contract_hash(k)); return 0
    if cmd == "status":
        bevis = a[a.index("--bevis") + 1] if "--bevis" in a else None
        try:
            bytt_status(k, a[2], bevis)
        except ValueError as e:
            print(f"AVVIST: {e}"); return 1
        json.dump(k, open(a[1], "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        print(f"STATUS: {k['status']['verdi']}"); return 0
    print(__doc__); return 2

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
