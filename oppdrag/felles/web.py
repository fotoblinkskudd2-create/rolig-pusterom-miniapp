"""Liten JSON-API- og filserver på standardbiblioteket.

Bruk:
    app = App(statisk_mappe)
    @app.rute("GET", "/api/x")
    def x(req): return {"ok": True}
    app.start(8000)

Lytter kun på 127.0.0.1. Ingen autentisering: lokal demo.
"""
import json
import mimetypes
import os
import re
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("text/javascript", ".mjs")
mimetypes.add_type("application/manifest+json", ".webmanifest")


class Foresporsel:
    def __init__(self, metode, sti, query, kropp, headere, params):
        self.metode = metode
        self.sti = sti
        self.query = {k: v[0] for k, v in query.items()}
        self.raa = kropp
        self.headere = headere
        self.params = params

    def json(self):
        return json.loads(self.raa.decode("utf-8") or "null")


class Svar:
    def __init__(self, kropp, status=200, type_="application/json; charset=utf-8", headere=None):
        self.kropp = kropp
        self.status = status
        self.type = type_
        self.headere = headere or {}


class HttpFeil(Exception):
    def __init__(self, status, melding):
        super().__init__(melding)
        self.status = status
        self.melding = melding


class App:
    def __init__(self, statisk_mappe=None, ekstra_statisk=None):
        self.ruter = []
        self.statisk = statisk_mappe
        self.ekstra = ekstra_statisk or {}
        # Én forespørsel om gangen mot API-et: lokal demo med delt SQLite-tilkobling.
        self.laas = threading.RLock()

    def rute(self, metode, monster):
        regex = re.compile("^" + re.sub(r"\{(\w+)\}", r"(?P<\1>[^/]+)", monster) + "$")

        def dekor(f):
            self.ruter.append((metode, regex, f))
            return f
        return dekor

    def behandle(self, metode, url, kropp=b"", headere=None):
        """Kan kalles direkte fra tester uten nettverk."""
        p = urlparse(url)
        for m, regex, f in self.ruter:
            treff = regex.match(p.path)
            if m == metode and treff:
                req = Foresporsel(metode, p.path, parse_qs(p.query), kropp, headere or {}, treff.groupdict())
                try:
                    with self.laas:
                        res = f(req)
                except HttpFeil as e:
                    return Svar(json.dumps({"feil": e.melding}, ensure_ascii=False).encode(), e.status)
                except Exception as e:
                    traceback.print_exc()
                    return Svar(json.dumps({"feil": f"{type(e).__name__}: {e}"}, ensure_ascii=False).encode(), 500)
                if isinstance(res, Svar):
                    return res
                return Svar(json.dumps(res, ensure_ascii=False, default=str).encode())
        if metode == "GET" and self.statisk:
            return self._fil(p.path)
        return Svar(b'{"feil":"ukjent rute"}', 404)

    def _fil(self, sti):
        for prefiks, mappe in self.ekstra.items():
            if sti.startswith(prefiks):
                return self._les(mappe, sti[len(prefiks):])
        return self._les(self.statisk, sti.lstrip("/") or "index.html")

    @staticmethod
    def _les(mappe, rel):
        rot = os.path.realpath(mappe)
        full = os.path.realpath(os.path.join(rot, rel or "index.html"))
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not full.startswith(rot + os.sep) or not os.path.isfile(full):
            return Svar(b"ikke funnet", 404, "text/plain")
        with open(full, "rb") as f:
            data = f.read()
        return Svar(data, 200, mimetypes.guess_type(full)[0] or "application/octet-stream")

    def start(self, port=8000):
        app = self

        class H(BaseHTTPRequestHandler):
            def _kjor(self, metode):
                lengde = int(self.headers.get("Content-Length") or 0)
                kropp = self.rfile.read(lengde) if lengde else b""
                s = app.behandle(metode, self.path, kropp, dict(self.headers))
                self.send_response(s.status)
                self.send_header("Content-Type", s.type)
                self.send_header("Content-Length", str(len(s.kropp)))
                for k, v in s.headere.items():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(s.kropp)

            def do_GET(self): self._kjor("GET")
            def do_POST(self): self._kjor("POST")
            def do_PUT(self): self._kjor("PUT")
            def do_DELETE(self): self._kjor("DELETE")
            def log_message(self, *a): pass

        print(f"Lokal demo: http://127.0.0.1:{port}/  (Ctrl+C avslutter)")
        ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
