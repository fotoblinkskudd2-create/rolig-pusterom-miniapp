"""Lokal testserver med styrbar tilstand. Bare for demo og kontroll.
   GET /helse          → svar etter gjeldende modus
   GET /modus/<frisk|treg|feilende|nede>   → bytt modus (nede = lukker tilkoblingen uten svar)
"""
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

TILSTAND = {"modus": "frisk", "treg_sek": 3.0}


class H(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/modus/"):
            TILSTAND["modus"] = self.path.split("/")[2]
            return self._svar(200, b"ok")
        if self.path != "/helse":
            return self._svar(404, b"ukjent")
        m = TILSTAND["modus"]
        if m == "treg":
            time.sleep(TILSTAND["treg_sek"])
            return self._svar(200, b'{"status":"ok"}')
        if m == "feilende":
            return self._svar(503, b'{"status":"database utilgjengelig"}')
        if m == "nede":
            self.connection.close()
            return
        return self._svar(200, b'{"status":"ok"}')

    def _svar(self, kode, kropp):
        self.send_response(kode)
        self.send_header("Content-Length", str(len(kropp)))
        self.end_headers()
        self.wfile.write(kropp)

    def log_message(self, *a):
        pass


def start(port):
    s = ThreadingHTTPServer(("127.0.0.1", port), H)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8917
    print(f"Testserver: http://127.0.0.1:{port}/helse  (modus: /modus/frisk|treg|feilende|nede)")
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
