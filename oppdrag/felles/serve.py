"""Statisk server for oppdrag uten backend. Server hele oppdrag/-mappen slik at
relative importer til ../felles virker.  python3 ../felles/serve.py 8002
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

SimpleHTTPRequestHandler.extensions_map.update({".js": "text/javascript", ".mjs": "text/javascript",
                                                ".webmanifest": "application/manifest+json"})
ROT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8000))
mappe = os.path.basename(os.getcwd())


class H(SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


print(f"Lokal demo: http://127.0.0.1:{port}/{mappe}/")
ThreadingHTTPServer(("127.0.0.1", port), partial(H, directory=ROT)).serve_forever()
