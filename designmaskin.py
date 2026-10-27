#!/usr/bin/env python3
"""Designmaskinen: idé inn -> komplett designpakke ut.

Starter Claude Code uten interaksjon (headless) med skillen /design, som gjør research,
markedsanalyse, modell, optimalisering, robusthet, CAD, tegning, testplan og rapport
i produkter/<slug>/.

  python3 designmaskin.py "en kopp som holder kaffen varm i 3 timer uten strøm"
  python3 designmaskin.py "..." --modell <modell-id> --tørr      # vis kommandoen uten å kjøre
  python3 designmaskin.py --web                                 # nettside på http://127.0.0.1:8765

Krever: Claude Code (`claude` på PATH, innlogget), Python 3.8+, numpy; openscad og
node + playwright for CAD- og tegningsbilder.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ROT = os.path.dirname(os.path.abspath(__file__))
PRODUKTER = os.path.join(ROT, "produkter")

VERKTOY = [
    "Read", "Write", "Edit", "Glob", "Grep", "WebSearch", "WebFetch", "Skill", "TodoWrite",
    "Bash(python3:*)", "Bash(openscad:*)", "Bash(xvfb-run:*)", "Bash(node:*)",
    "Bash(mkdir:*)", "Bash(ls:*)", "Bash(cp:*)", "Bash(cat:*)", "Bash(head:*)",
]


def slug(ide):
    s = ide.lower()
    for a, b in (("æ", "ae"), ("ø", "o"), ("å", "a"), ("é", "e"), ("ü", "u")):
        s = s.replace(a, b)
    ord_ = [w for w in re.split(r"[^a-z0-9]+", s) if w and w not in
            {"en", "et", "ei", "a", "an", "the", "som", "for", "med", "og", "til", "som", "av", "i", "pa", "uten"}]
    ut = []
    for w in ord_:                       # hele ord, maks 40 tegn
        if len("_".join(ut + [w])) > 40:
            break
        ut.append(w)
    return "_".join(ut) or f"produkt_{int(time.time())}"


def kommando(ide, mappe, modell=None):
    prompt = (f"/design {ide}\n\n"
              f"(Kjøres automatisk av designmaskin.py uten bruker. Bruk produktmappen produkter/{mappe}/. "
              "Ikke still spørsmål – gjør og dokumenter antakelser. Fullfør alle steg i skillen.)")
    k = ["claude", "-p", prompt, "--output-format", "stream-json", "--verbose",
         "--permission-mode", "acceptEdits", "--allowedTools", ",".join(VERKTOY)]
    if modell:
        k += ["--model", modell]
    return k


def _kort(x, n=160):
    x = " ".join(str(x).split())
    return x if len(x) <= n else x[: n - 1] + "…"


def beskriv_hendelse(obj):
    """Gjør én stream-json-linje om til lesbare fremdriftslinjer."""
    linjer = []
    t = obj.get("type")
    if t == "assistant":
        for b in (obj.get("message") or {}).get("content") or []:
            if b.get("type") == "text" and b.get("text", "").strip():
                linjer.append("💬 " + _kort(b["text"]))
            elif b.get("type") == "tool_use":
                inn = b.get("input") or {}
                hint = inn.get("file_path") or inn.get("command") or inn.get("query") or inn.get("url") or inn.get("pattern") or ""
                linjer.append(f"🔧 {b.get('name')} {_kort(hint, 120)}")
    elif t == "result":
        kost = obj.get("total_cost_usd")
        tid = obj.get("duration_ms")
        linjer.append("✅ Ferdig" if not obj.get("is_error") else "❌ Feilet")
        if tid:
            linjer.append(f"   tid {tid / 60000:.1f} min" + (f", kost ${kost:.2f}" if kost is not None else ""))
        if obj.get("result"):
            linjer.append(obj["result"])
    return linjer


def skriv_status(mappe, **felt):
    fil = os.path.join(PRODUKTER, mappe, "status.json")
    gammel = {}
    if os.path.exists(fil):
        try:
            gammel = json.load(open(fil))
        except ValueError:
            pass
    gammel.update(felt)
    with open(fil, "w") as f:
        json.dump(gammel, f, ensure_ascii=False, indent=2)


def kjor(ide, modell=None, skriv=print):
    mappe = slug(ide)
    os.makedirs(os.path.join(PRODUKTER, mappe), exist_ok=True)
    skriv_status(mappe, ide=ide, status="kjører", start=time.strftime("%Y-%m-%d %H:%M:%S"))
    fremdrift = open(os.path.join(PRODUKTER, mappe, "fremdrift.txt"), "a", buffering=1)
    logg = open(os.path.join(PRODUKTER, mappe, "logg.jsonl"), "a", buffering=1)

    def ut(linje):
        fremdrift.write(linje + "\n")
        skriv(linje)

    ut(f"▶ Designmaskinen starter: {ide}  ->  produkter/{mappe}/")
    try:
        p = subprocess.Popen(kommando(ide, mappe, modell), cwd=ROT, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT, text=True, bufsize=1)
    except FileNotFoundError:
        ut("❌ Fant ikke `claude`. Installer Claude Code og logg inn: https://code.claude.com")
        skriv_status(mappe, status="feilet", feil="claude mangler")
        return mappe, 1
    resultat = {}
    for rå in p.stdout:
        logg.write(rå)
        try:
            obj = json.loads(rå)
        except ValueError:
            if rå.strip():
                ut("   " + _kort(rå))
            continue
        if obj.get("type") == "result":
            resultat = obj
        for linje in beskriv_hendelse(obj):
            ut(linje)
    kode = p.wait()
    ok = kode == 0 and not resultat.get("is_error")
    skriv_status(mappe, status="ferdig" if ok else "feilet", slutt=time.strftime("%Y-%m-%d %H:%M:%S"),
                 kost_usd=resultat.get("total_cost_usd"), returkode=kode)
    fremdrift.close()
    logg.close()
    return mappe, 0 if ok else 1


# ---------------------------------------------------------------- nettside

CSS = """
:root{--bg:#f7f6f2;--fg:#1d1d1b;--mut:#6b6a66;--kort:#fff;--kant:#e2e0d9;--aks:#1f6fb2}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--fg:#ecebe6;--mut:#a3a29c;--kort:#21211f;--kant:#34332f;--aks:#6aa8e0}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px}h1{font-size:1.6rem;margin:.2em 0}h2{font-size:1.15rem;margin-top:1.6em}
a{color:var(--aks)}.mut{color:var(--mut)}.kort{background:var(--kort);border:1px solid var(--kant);border-radius:12px;padding:16px;margin:12px 0}
textarea{width:100%;min-height:90px;font:inherit;padding:10px;border-radius:8px;border:1px solid var(--kant);background:var(--bg);color:var(--fg)}
button{font:inherit;padding:10px 18px;border-radius:8px;border:0;background:var(--aks);color:#fff;cursor:pointer;margin-top:8px}
pre{white-space:pre-wrap;word-break:break-word;background:var(--bg);border:1px solid var(--kant);border-radius:8px;padding:12px;font-size:13px;max-height:520px;overflow:auto}
table{border-collapse:collapse;width:100%}td,th{text-align:left;padding:6px 8px;border-bottom:1px solid var(--kant)}
.merke{display:inline-block;padding:2px 8px;border-radius:99px;font-size:12px;border:1px solid var(--kant)}
.bilder{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}.bilder img{width:100%;border-radius:8px;border:1px solid var(--kant);background:#fff}
"""


def side(tittel, kropp, oppdater=False):
    meta = '<meta http-equiv="refresh" content="5">' if oppdater else ""
    return (f'<!doctype html><html lang="no"><head><meta charset="utf-8"><meta name="viewport" '
            f'content="width=device-width,initial-scale=1">{meta}<title>{html.escape(tittel)}</title>'
            f"<style>{CSS}</style></head><body><main>{kropp}</main></body></html>")


def status_for(mappe):
    fil = os.path.join(PRODUKTER, mappe, "status.json")
    if os.path.exists(fil):
        try:
            return json.load(open(fil))
        except ValueError:
            pass
    ferdig = any(os.path.exists(os.path.join(PRODUKTER, mappe, f)) for f in ("RAPPORT.md", "SPESIFIKASJON.md"))
    return {"status": "ferdig" if ferdig else "–"}


def trygg_sti(mappe, fil):
    """Returner absolutt sti bare hvis den ligger inne i produkter/<mappe>/."""
    base = os.path.realpath(os.path.join(PRODUKTER, mappe))
    sti = os.path.realpath(os.path.join(base, fil))
    if not base.startswith(os.path.realpath(PRODUKTER) + os.sep) or not sti.startswith(base + os.sep):
        return None
    return sti if os.path.isfile(sti) else None


def forside():
    rader = []
    for m in sorted(os.listdir(PRODUKTER)):
        if m.startswith((".", "_")) or not os.path.isdir(os.path.join(PRODUKTER, m)):
            continue
        st = status_for(m)
        rader.append(f'<tr><td><a href="/p/{urllib.parse.quote(m)}">{html.escape(m)}</a></td>'
                     f'<td class="mut">{html.escape(st.get("ide", ""))}</td>'
                     f'<td><span class="merke">{html.escape(st.get("status", ""))}</span></td></tr>')
    return side("Designmaskinen", f"""
<h1>Designmaskinen</h1><p class="mut">Skriv en idé. Maskinen gjør research, markedsanalyse, modell,
optimalisering, CAD, tegning, testplan og rapport. Tar typisk 20–60 minutter.</p>
<div class="kort"><form method="post" action="/start">
<label for="ide"><b>Idé</b></label>
<textarea id="ide" name="ide" required placeholder="F.eks.: en sykkellås under 500 g som tåler 3 minutter med baufil"></textarea>
<button type="submit">Start design</button></form></div>
<h2>Produkter</h2><div class="kort"><table><tr><th>Mappe</th><th>Idé</th><th>Status</th></tr>{''.join(rader)}</table></div>""")


def produktside(mappe):
    d = os.path.join(PRODUKTER, mappe)
    if not os.path.isdir(d):
        return None
    st = status_for(mappe)
    filer = sorted(f for f in os.listdir(d) if os.path.isfile(os.path.join(d, f)) and f != "logg.jsonl")
    bilder = "".join(f'<a href="/f/{mappe}/{f}"><img src="/f/{mappe}/{f}" alt="{f}"></a>' for f in filer if f.endswith(".png"))
    lenker = " · ".join(f'<a href="/f/{mappe}/{urllib.parse.quote(f)}">{html.escape(f)}</a>' for f in filer)
    rapport = os.path.join(d, "RAPPORT.md")
    if not os.path.exists(rapport):
        rapport = os.path.join(d, "SPESIFIKASJON.md")
    fremdrift = os.path.join(d, "fremdrift.txt")
    deler = [f'<p><a href="/">← alle produkter</a></p><h1>{html.escape(mappe)}</h1>',
             f'<p class="mut">{html.escape(st.get("ide", ""))}</p>',
             f'<p><span class="merke">{html.escape(st.get("status", ""))}</span> '
             f'<span class="mut">{html.escape(str(st.get("start", "")))}'
             f'{" → " + html.escape(str(st.get("slutt"))) if st.get("slutt") else ""}</span></p>']
    if bilder:
        deler.append(f'<h2>Bilder</h2><div class="bilder">{bilder}</div>')
    if os.path.exists(rapport):
        deler.append(f'<h2>{os.path.basename(rapport)[:-3].capitalize()}</h2><pre>{html.escape(open(rapport).read())}</pre>')
    if os.path.exists(fremdrift):
        hale = open(fremdrift).read().splitlines()[-60:]
        deler.append(f'<h2>Fremdrift</h2><pre>{html.escape(chr(10).join(hale))}</pre>')
    deler.append(f'<h2>Filer</h2><p>{lenker or "–"}</p>')
    return side(mappe, "".join(deler), oppdater=st.get("status") == "kjører")


TYPER = {".png": "image/png", ".svg": "image/svg+xml", ".md": "text/plain; charset=utf-8",
         ".py": "text/plain; charset=utf-8", ".scad": "text/plain; charset=utf-8", ".csv": "text/plain; charset=utf-8",
         ".json": "application/json", ".txt": "text/plain; charset=utf-8", ".stl": "model/stl"}


class Handler(BaseHTTPRequestHandler):
    def _svar(self, kode, innhold, typ="text/html; charset=utf-8"):
        data = innhold.encode() if isinstance(innhold, str) else innhold
        self.send_response(kode)
        self.send_header("Content-Type", typ)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        sti = urllib.parse.unquote(urllib.parse.urlparse(self.path).path)
        if sti == "/":
            return self._svar(200, forside())
        m = re.fullmatch(r"/p/([\w-]+)", sti)
        if m:
            s = produktside(m.group(1))
            return self._svar(200, s) if s else self._svar(404, "Finnes ikke")
        m = re.fullmatch(r"/f/([\w-]+)/(.+)", sti)
        if m:
            fil = trygg_sti(m.group(1), m.group(2))
            if fil:
                typ = TYPER.get(os.path.splitext(fil)[1], "application/octet-stream")
                return self._svar(200, open(fil, "rb").read(), typ)
        self._svar(404, "Finnes ikke")

    def do_POST(self):
        if self.path != "/start":
            return self._svar(404, "Finnes ikke")
        n = int(self.headers.get("Content-Length") or 0)
        felt = urllib.parse.parse_qs(self.rfile.read(n).decode())
        ide = (felt.get("ide") or [""])[0].strip()
        if not ide:
            return self._svar(400, "Mangler idé")
        mappe = slug(ide)
        threading.Thread(target=kjor, args=(ide, self.server.modell, lambda _: None), daemon=True).start()
        self.send_response(303)
        self.send_header("Location", f"/p/{mappe}")
        self.end_headers()

    def log_message(self, *a):
        pass


def web(port, vert, modell):
    srv = ThreadingHTTPServer((vert, port), Handler)
    srv.modell = modell
    print(f"Designmaskinen kjører på http://{vert}:{port}  (Ctrl+C for å stoppe)")
    srv.serve_forever()


def main():
    p = argparse.ArgumentParser(description="Designmaskinen: idé inn, designpakke ut.")
    p.add_argument("ide", nargs="?", help="produktidéen, i anførselstegn")
    p.add_argument("--modell", help="Claude-modell (standard: Claude Codes standardmodell)")
    p.add_argument("--tørr", action="store_true", help="vis kommandoen uten å kjøre")
    p.add_argument("--web", action="store_true", help="start nettsiden")
    p.add_argument("--port", type=int, default=8765)
    p.add_argument("--vert", default="127.0.0.1", help="bind-adresse (127.0.0.1 = bare denne maskinen)")
    a = p.parse_args()
    if a.web:
        return web(a.port, a.vert, a.modell)
    if not a.ide:
        p.error("skriv en idé, eller bruk --web")
    if a.tørr:
        print(json.dumps(kommando(a.ide, slug(a.ide), a.modell), ensure_ascii=False, indent=1))
        print("Produktmappe: produkter/" + slug(a.ide))
        return 0
    mappe, kode = kjor(a.ide, a.modell)
    print(f"\nResultat: produkter/{mappe}/RAPPORT.md")
    return kode


if __name__ == "__main__":
    sys.exit(main() or 0)
