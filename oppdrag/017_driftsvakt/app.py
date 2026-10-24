"""Start: python3 testserver.py &   python3 app.py   →  http://127.0.0.1:8017/
Måler endepunktene i konfig.json hvert intervall_sek sekund i en bakgrunnstråd."""
import argparse
import os
import sys
import threading
import time

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HER, ".."))
import vakt as V  # noqa: E402
from felles.web import App  # noqa: E402


def lag_app(db, konfig):
    app = App(os.path.join(HER, "ui"), {"/felles/": os.path.join(HER, "..", "felles", "web")})

    @app.rute("GET", "/api/status")
    def st(req):
        return {"endepunkter": V.status(db, konfig), "vedlikehold": konfig.get("vedlikehold", []),
                "hendelser": [dict(r) for r in db.execute("SELECT * FROM hendelse ORDER BY id DESC")],
                "malinger": [dict(r) for r in db.execute("SELECT * FROM maling ORDER BY id DESC LIMIT 50")]}

    @app.rute("POST", "/api/runde")
    def runde(req):
        return V.kjor_runde(db, konfig)
    return app


if __name__ == "__main__":
    a = argparse.ArgumentParser()
    a.add_argument("--konfig", default=os.path.join(HER, "konfig.json"))
    a.add_argument("--db", default=os.path.join(HER, "driftsvakt.db"))
    a.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8017)))
    arg = a.parse_args()
    konfig = V.les_konfig(arg.konfig)
    db = V.koble(arg.db)
    app = lag_app(db, konfig)

    def loop():
        while True:
            with app.laas:
                V.kjor_runde(db, konfig)
            time.sleep(konfig["intervall_sek"])
    threading.Thread(target=loop, daemon=True).start()
    app.start(arg.port)
