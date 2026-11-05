"""Steg 3: juridisk status for patenter med GULLGRAD >= 7.

Kilde i kode: Google Patents (HTML). Ingen gjetting.
- 'Expired - Lifetime'   -> utløpt
- 'Expired - Fee Related' -> bortfalt
- alt annet              -> UAVKLART
EPO og Patentstyret er ikke koblet på ennå. Familiesjekk er ikke gjort.
Utløp beregnes som 20 år fra innlevering: BEREGNET, PTA og terminalavkrysning ikke sjekket.
"""
from __future__ import annotations

import datetime as dt
import re

import requests

from common import DISSECTED, gullgrad, today

GP_URL = "https://patents.google.com/patent/US{nr}"


def google_status(nr: str) -> tuple[str, str]:
    try:
        r = requests.get(GP_URL.format(nr=nr), timeout=30,
                         headers={"User-Agent": "patent-genie/0.1"})
    except requests.RequestException as exc:
        return "UAVKLART", f"Google Patents nåes ikke ({exc.__class__.__name__})"
    if r.status_code != 200:
        return "UAVKLART", f"Google Patents svarte {r.status_code}"
    if "Expired - Lifetime" in r.text:
        return "utløpt", "Google Patents: Expired - Lifetime"
    if "Expired - Fee Related" in r.text:
        return "bortfalt", "Google Patents: Expired - Fee Related"
    return "UAVKLART", "Google Patents: status ikke entydig"


def expiry_from(filed: str) -> str:
    y, m, d = (int(x) for x in filed.split("-"))
    try:
        return dt.date(y + 20, m, d).isoformat()
    except ValueError:  # 29. februar
        return dt.date(y + 20, m, 28).isoformat()


def main() -> dict:
    checked = {"utløpt": 0, "bortfalt": 0, "UAVKLART": 0}
    for path in sorted(DISSECTED.glob("*.md")):
        text = path.read_text(encoding="utf-8")
        g = gullgrad(text)
        if g is None or g < 7:
            continue
        nr = path.stem
        status, kilde = google_status(nr)
        m = re.search(r"\*\*Innlevert:\*\*\s*(\d{4}-\d{2}-\d{2})", text)
        utlop = f"Utløp beregnet {expiry_from(m.group(1))} (BEREGNET, 20 år fra innlevering)" if m else "Utløp: UAVKLART (innleveringsdato mangler)"
        line = (
            f"**Juridisk status:** {status} — {kilde} ({today()}). {utlop}. "
            "Familie: UAVKLART (ikke sjekket)."
        )
        new = re.sub(r"^\*\*Juridisk status:\*\*.*$", line, text, count=1, flags=re.M)
        path.write_text(new, encoding="utf-8")
        checked[status] = checked.get(status, 0) + 1
    return {"sjekket": sum(checked.values()), **checked}


if __name__ == "__main__":
    print(main())
