#!/usr/bin/env python3
"""Overleveringspakke for tekniske leveranser.

    python3 overlever.py PROSJEKTMAPPE [--kontrakt FIL] [--ut MAPPE] [--kjor-kontroller]

Leser kontrakten (standard: PROSJEKTMAPPE/leveranse.json), kontrollerer leveransen og skriver
  UT/rapport.html og UT/rapport.json, og – bare hvis alle obligatoriske krav er oppfylt – UT/<navn>_<versjon>.zip
  med manifest.json (sha256 per fil), kjente mangler og neste vedlikeholdshandling.

Kontrollkommandoer i kontrakten kjøres BARE med --kjor-kontroller (de er kode fra prosjektet).
Mulige hemmeligheter flagges med fil, linje og type – verdien skrives aldri ut.
"""
import argparse
import datetime as dt
import fnmatch
import hashlib
import html
import json
import os
import re
import subprocess
import sys
import zipfile

HEMMELIGHETSMONSTRE = [
    ("privat nøkkel", re.compile(r"-----BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY-----")),
    ("AWS-tilgangsnøkkel", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("GitHub-token", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{36,}\b")),
    ("Slack-token", re.compile(r"\bxox[abpr]-[A-Za-z0-9-]{10,}")),
    ("passord/nøkkel i tilordning", re.compile(r"(?i)\b\w*(passord|password|passwd|secret|api[_-]?key|token)\w*\s*[:=]\s*['\"]?[^\s'\"]{6,}")),
]
ALLTID_UTELATT = [".git/*", "*.pyc", "__pycache__/*", ".env", "*.zip"]


def les_kontrakt(sti):
    k = json.load(open(sti, encoding="utf-8"))
    for f in ("navn", "versjon", "pakrevde_filer", "oppstart", "kontroller", "neste_vedlikehold"):
        if f not in k:
            raise ValueError(f"kontrakten mangler feltet «{f}»")
    return k


def alle_filer(rot, utelat):
    ut = []
    for mappe, undermapper, filer in os.walk(rot):
        undermapper[:] = sorted(d for d in undermapper if d not in (".git", "__pycache__"))
        for f in sorted(filer):
            rel = os.path.relpath(os.path.join(mappe, f), rot).replace(os.sep, "/")
            if not any(fnmatch.fnmatch(rel, m) for m in utelat + ALLTID_UTELATT):
                ut.append(rel)
    return ut


def sha256(sti):
    h = hashlib.sha256()
    with open(sti, "rb") as f:
        for b in iter(lambda: f.read(65536), b""):
            h.update(b)
    return h.hexdigest()


def skann_hemmeligheter(rot, filer):
    funn = []
    for rel in filer:
        try:
            tekst = open(os.path.join(rot, rel), encoding="utf-8").read()
        except (UnicodeDecodeError, OSError):
            continue
        for nr, linje in enumerate(tekst.splitlines(), start=1):
            for navn, m in HEMMELIGHETSMONSTRE:
                if m.search(linje):
                    funn.append({"fil": rel, "linje": nr, "type": navn})  # verdien lagres aldri
    return funn


def kontroller(rot, kontrakt, kjor):
    res = []
    for k in kontrakt["kontroller"]:
        r = {"navn": k["navn"], "kommando": k["kommando"], "forventet_exit": k.get("forventet_exit", 0)}
        if not kjor:
            r.update(status="ikke kjørt", merknad="kjør med --kjor-kontroller")
        else:
            try:
                p = subprocess.run(k["kommando"], shell=True, cwd=rot, capture_output=True, text=True, timeout=k.get("timeout_sek", 60))
                r.update(exit=p.returncode, status="bestått" if p.returncode == r["forventet_exit"] else "feilet", utdata=(p.stdout + p.stderr)[-1500:])
            except subprocess.TimeoutExpired:
                r.update(status="feilet", merknad="tidsavbrudd")
        res.append(r)
    return res


def vurder(rot, kontrakt, kjor=False):
    utelat = kontrakt.get("utelat", [])
    filer = alle_filer(rot, utelat)
    mangler = []
    for p in kontrakt["pakrevde_filer"]:
        if not any(fnmatch.fnmatch(f, p["monster"]) for f in filer):
            mangler.append({"monster": p["monster"], "beskrivelse": p.get("beskrivelse", ""), "obligatorisk": p.get("obligatorisk", True)})
    hem = skann_hemmeligheter(rot, filer)
    kon = kontroller(rot, kontrakt, kjor)
    blokkerer = [f"mangler obligatorisk fil: {m['monster']} ({m['beskrivelse']})" for m in mangler if m["obligatorisk"]]
    blokkerer += [f"mulig hemmelighet: {h['fil']}:{h['linje']} ({h['type']})" for h in hem]
    blokkerer += [f"kontroll feilet: {k['navn']}" for k in kon if k["status"] == "feilet"]
    # Godkjenning krever at kontrollene faktisk er kjørt og bestått
    blokkerer += [f"kontroll ikke kjørt: {k['navn']}" for k in kon if k["status"] == "ikke kjørt"]
    manifest = [{"fil": f, "sha256": sha256(os.path.join(rot, f)), "bytes": os.path.getsize(os.path.join(rot, f))} for f in filer]
    return {"navn": kontrakt["navn"], "versjon": kontrakt["versjon"], "tid": dt.datetime.now().isoformat(timespec="seconds"),
            "godkjent": not blokkerer, "blokkerer": blokkerer, "manglende_filer": mangler, "mulige_hemmeligheter": hem,
            "kontroller": kon, "oppstart": kontrakt["oppstart"], "kjente_mangler": kontrakt.get("kjente_mangler", []),
            "neste_vedlikehold": kontrakt["neste_vedlikehold"], "manifest": manifest,
            "grenser": ["Kontrollen sjekker bare filmønstre, sjekksummer, mønstre for hemmeligheter og eksitkoder for kommandoene i kontrakten.",
                        "Den vurderer ikke kodekvalitet, sikkerhet eller om dokumentasjonen er korrekt.",
                        "Hemmelighetsskanningen er mønsterbasert og kan både gå glipp av hemmeligheter og gi falske treff."]}


def html_rapport(r):
    e = html.escape
    li = lambda xs: "".join(f"<li>{e(str(x))}</li>" for x in xs) or "<li>ingen</li>"
    return f"""<!doctype html><html lang="nb"><head><meta charset="utf-8"><title>Overlevering {e(r['navn'])} {e(r['versjon'])}</title>
<style>body{{font-family:system-ui,sans-serif;max-width:900px;margin:20px auto;padding:0 16px}}.ok{{color:#2e7d32}}.feil{{color:#b3261e}}table{{border-collapse:collapse;width:100%;font-size:13px}}td,th{{border-bottom:1px solid #ddd;padding:4px;text-align:left}}code{{font-size:12px}}</style></head><body>
<h1>Overlevering: {e(r['navn'])} {e(r['versjon'])}</h1><p>Kontrollert {e(r['tid'])}</p>
<h2 class="{'ok' if r['godkjent'] else 'feil'}">{'GODKJENT – pakke generert' if r['godkjent'] else 'IKKE GODKJENT – ingen pakke generert'}</h2>
<h3>Blokkerer</h3><ul>{li(r['blokkerer'])}</ul>
<h3>Oppstart</h3><ul>{''.join(f'<li><code>{e(x)}</code></li>' for x in r['oppstart'])}</ul>
<h3>Kontroller</h3><table><tr><th>Navn</th><th>Kommando</th><th>Status</th></tr>{''.join(f"<tr><td>{e(k['navn'])}</td><td><code>{e(k['kommando'])}</code></td><td>{e(k['status'])}</td></tr>" for k in r['kontroller'])}</table>
<h3>Mulige hemmeligheter (verdier vises ikke)</h3><ul>{li(f"{h['fil']}:{h['linje']} – {h['type']}" for h in r['mulige_hemmeligheter'])}</ul>
<h3>Kjente mangler</h3><ul>{li(r['kjente_mangler'])}</ul><h3>Neste vedlikeholdshandling</h3><p>{e(r['neste_vedlikehold'])}</p>
<h3>Manifest ({len(r['manifest'])} filer)</h3><table><tr><th>Fil</th><th>Bytes</th><th>sha256</th></tr>{''.join(f"<tr><td>{e(m['fil'])}</td><td>{m['bytes']}</td><td><code>{m['sha256']}</code></td></tr>" for m in r['manifest'])}</table>
<h3>Grenser for kontrollen</h3><ul>{li(r['grenser'])}</ul></body></html>"""


def lag_pakke(rot, r, ut):
    sti = os.path.join(ut, f"{r['navn']}_{r['versjon']}.zip")
    with zipfile.ZipFile(sti, "w", zipfile.ZIP_DEFLATED) as z:
        for m in r["manifest"]:
            z.write(os.path.join(rot, m["fil"]), f"leveranse/{m['fil']}")
        z.writestr("manifest.json", json.dumps({k: r[k] for k in ("navn", "versjon", "tid", "manifest", "oppstart", "kontroller", "kjente_mangler", "neste_vedlikehold", "grenser")}, ensure_ascii=False, indent=2))
        z.writestr("rapport.html", html_rapport(r))
    return sti


def main(argv=None):
    a = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    a.add_argument("prosjekt")
    a.add_argument("--kontrakt")
    a.add_argument("--ut", default="ut")
    a.add_argument("--kjor-kontroller", action="store_true")
    arg = a.parse_args(argv)
    kontrakt = les_kontrakt(arg.kontrakt or os.path.join(arg.prosjekt, "leveranse.json"))
    r = vurder(arg.prosjekt, kontrakt, arg.kjor_kontroller)
    os.makedirs(arg.ut, exist_ok=True)
    open(os.path.join(arg.ut, "rapport.html"), "w", encoding="utf-8").write(html_rapport(r))
    json.dump(r, open(os.path.join(arg.ut, "rapport.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    if r["godkjent"]:
        print("GODKJENT:", lag_pakke(arg.prosjekt, r, arg.ut))
        return 0
    print("IKKE GODKJENT – ingen pakke:")
    for b in r["blokkerer"]:
        print("  -", b)
    return 2


if __name__ == "__main__":
    sys.exit(main())
