"""SLUSEN — liten CRM som håndhever SANNHETSMOTOREN.

Tre B2B-forpliktelser (LOI eller betalt) før ett øre på tooling. Regelen
håndheves i `sett_prosjektstatus()` og `krev_tooling()`, ikke i en prompt.

Ingenting sendes herfra. Grok skriver utkast til slusen/utkast/, du sender selv
og flytter kontakten til "sendt".

Data: slusen/data/slusen.json (eller SLUSEN_DATA). Gitignored: repoet er
offentlig, og kontaktlister hører ikke hjemme på GitHub.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
from pathlib import Path

import grokkjerne
from kontroll import kontrollert

MAPPE = Path(__file__).resolve().parent

PROSJEKTER = ["VARDE", "ZIP", "KLARSYN", "PANICGUARD", "ISHUD", "NaturFlyr", "Hornat",
              "eldreboks", "Svart Boks"]
KONTAKTSTATUS = ["kald", "sendt", "svar", "møte", "LOI", "betalt"]
PROSJEKTSTATUS = ["idé", "validering", "tooling", "pause", "død"]
FORPLIKTET = {"LOI", "betalt"}
KRAV_FORPLIKTELSER = 3
SVARSTATUS = {"svar", "møte", "LOI", "betalt"}

# Grov sjanse for at neste handling gir svar/fremdrift. Heuristikk, ikke statistikk.
GRUNNSJANSE = {"kald": 0.08, "sendt": 0.15, "svar": 0.55, "møte": 0.65, "LOI": 0.50, "betalt": 0.30}

_ALIAS = {"mote": "møte", "loi": "LOI", "ide": "idé", "dod": "død"}


class SannhetsBrudd(RuntimeError):
    """Forsøk på å bruke penger/tid på tooling før markedet har sagt ja."""


def normaliser_status(status: str, gyldige: list[str]) -> str:
    s = _ALIAS.get(status.lower(), status)
    treff = next((g for g in gyldige if g.lower() == s.lower()), None)
    if treff is None:
        raise ValueError(f"Ukjent status {status!r}. Gyldige: {', '.join(gyldige)}")
    return treff


def finn_prosjekt(navn: str) -> str:
    treff = next((p for p in PROSJEKTER if p.lower() == navn.lower()), None)
    if treff is None:
        raise ValueError(f"Ukjent prosjekt {navn!r}. Prosjekter: {', '.join(PROSJEKTER)}")
    return treff


def i_dag() -> dt.date:
    fast = os.environ.get("SLUSEN_IDAG")
    return dt.date.fromisoformat(fast) if fast else dt.date.today()


def _nå() -> str:
    fast = os.environ.get("SLUSEN_IDAG")
    return f"{fast}T12:00:00" if fast else dt.datetime.now().isoformat(timespec="seconds")


# ── Lagring ────────────────────────────────────────────────────────────

class Slusen:
    def __init__(self, sti: str | Path | None = None, utkast: str | Path | None = None):
        self.sti = Path(sti or os.environ.get("SLUSEN_DATA", MAPPE / "data" / "slusen.json"))
        self.utkastmappe = Path(utkast or os.environ.get("SLUSEN_UTKAST", MAPPE / "utkast"))
        self.data = self._last()

    def _last(self) -> dict:
        if self.sti.exists():
            data = json.loads(self.sti.read_text(encoding="utf-8"))
        else:
            data = {"prosjekter": {}, "kontakter": [], "logg": [], "neste_id": 1}
        for p in PROSJEKTER:
            data["prosjekter"].setdefault(p, {"status": "validering", "beskrivelse": "", "malkunder": []})
        return data

    def lagre(self) -> None:
        self.sti.parent.mkdir(parents=True, exist_ok=True)
        tmp = self.sti.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.data, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(self.sti)

    def _logg(self, type_: str, **felt) -> None:
        self.data["logg"].append({"tid": _nå(), "type": type_, **felt})

    # ── Prosjekter ──
    def prosjekt(self, navn: str) -> dict:
        return self.data["prosjekter"][finn_prosjekt(navn)]

    def forpliktelser(self, prosjekt: str) -> int:
        p = finn_prosjekt(prosjekt)
        return sum(k["prosjekt"] == p and k["status"] in FORPLIKTET for k in self.data["kontakter"])

    def krev_tooling(self, prosjekt: str) -> None:
        """Kall denne før all tooling-kode/innkjøp. Kaster SannhetsBrudd."""
        n = self.forpliktelser(prosjekt)
        if n < KRAV_FORPLIKTELSER:
            raise SannhetsBrudd(
                f"{finn_prosjekt(prosjekt)}: {n}/{KRAV_FORPLIKTELSER} kontakter på LOI eller betalt. "
                f"Ingen tooling. Gå og selg.")

    def sett_prosjektstatus(self, prosjekt: str, status: str) -> None:
        p = finn_prosjekt(prosjekt)
        status = normaliser_status(status, PROSJEKTSTATUS)
        if status == "tooling":
            self.krev_tooling(p)
        fra = self.data["prosjekter"][p]["status"]
        self.data["prosjekter"][p]["status"] = status
        self._logg("prosjektstatus", prosjekt=p, fra=fra, til=status)

    def beskriv(self, prosjekt: str, tekst: str) -> None:
        self.prosjekt(prosjekt)["beskrivelse"] = tekst

    def legg_til_malkunde(self, prosjekt: str, segment: str) -> None:
        mk = self.prosjekt(prosjekt)["malkunder"]
        if segment not in mk:
            mk.append(segment)

    # ── Kontakter ──
    def kontakt(self, kid: int) -> dict:
        k = next((k for k in self.data["kontakter"] if k["id"] == kid), None)
        if k is None:
            raise ValueError(f"Ingen kontakt med id {kid}")
        return k

    def ny_kontakt(self, prosjekt: str, navn: str, *, org: str = "", epost: str = "",
                   handling: str = "", dato: str | None = None, varm: bool = False) -> dict:
        k = {
            "id": self.data["neste_id"], "prosjekt": finn_prosjekt(prosjekt), "navn": navn,
            "org": org, "epost": epost, "status": "kald", "varm": varm,
            "neste_handling": handling or "Skriv første e-post (slusen utkast {id})",
            "neste_dato": dato or i_dag().isoformat(), "sist_endret": _nå(),
        }
        k["neste_handling"] = k["neste_handling"].replace("{id}", str(k["id"]))
        self.data["neste_id"] += 1
        self.data["kontakter"].append(k)
        self._logg("ny_kontakt", prosjekt=k["prosjekt"], kontakt=k["id"])
        return k

    def flytt(self, kid: int, status: str, *, handling: str | None = None,
              dato: str | None = None) -> dict:
        k = self.kontakt(kid)
        status = normaliser_status(status, KONTAKTSTATUS)
        fra = k["status"]
        k["status"] = status
        k["sist_endret"] = _nå()
        if handling is not None:
            k["neste_handling"] = handling
        elif status == "sendt":
            k["neste_handling"] = "Purr hvis ingen svar"
            dato = dato or (i_dag() + dt.timedelta(days=5)).isoformat()
        if dato:
            k["neste_dato"] = dato
        self._logg("kontaktstatus", prosjekt=k["prosjekt"], kontakt=kid, fra=fra, til=status)
        return k

    # ── I dag ──
    def idag(self, maks: int = 3) -> list[dict]:
        """Maks `maks` handlinger, høyest estimert sjanse for svar først."""
        idag = i_dag()
        kandidater = []
        for k in self.data["kontakter"]:
            if self.data["prosjekter"][k["prosjekt"]]["status"] in ("død", "pause"):
                continue
            if not k.get("neste_handling"):
                continue
            frist = dt.date.fromisoformat(k["neste_dato"]) if k.get("neste_dato") else idag
            if frist > idag:
                continue
            sjanse = GRUNNSJANSE[k["status"]]
            if k.get("varm"):
                sjanse *= 1.8
            if k["status"] == "sendt":
                dager = (idag - dt.datetime.fromisoformat(k["sist_endret"]).date()).days
                sjanse *= 0.4 if dager < 3 else (1.3 if dager <= 10 else 0.8)
            over = (idag - frist).days
            sjanse *= 1 + min(over, 6) * 0.05  # forfalt = vondere å utsette
            kandidater.append({"sjanse": min(sjanse, 0.95), "kontakt": k, "forfalt_dager": over,
                               "handling": k["neste_handling"],
                               "hvem": f"#{k['id']} {k['navn']}" + (f" ({k['org']})" if k["org"] else ""),
                               "prosjekt": k["prosjekt"]})

        # Prosjekter i validering uten tre kontakter: finn flere. Lav sjanse, men fyller hull.
        for p, info in self.data["prosjekter"].items():
            if info["status"] != "validering":
                continue
            antall = sum(k["prosjekt"] == p for k in self.data["kontakter"])
            if antall < KRAV_FORPLIKTELSER:
                kandidater.append({"sjanse": 0.03, "kontakt": None, "forfalt_dager": 0, "prosjekt": p,
                                   "hvem": "—", "handling": f"Finn {KRAV_FORPLIKTELSER - antall} navngitte "
                                   f"målkunder (slusen hypoteser {p!r})"})

        kandidater.sort(key=lambda c: (-c["sjanse"], -c["forfalt_dager"]))
        return kandidater[:maks]

    # ── Rapport ──
    def rapport(self, dager: int = 7, mappe: str | Path | None = None) -> dict:
        slutt = i_dag()
        start = slutt - dt.timedelta(days=dager - 1)

        def i_vindu(h: dict) -> bool:
            return start <= dt.datetime.fromisoformat(h["tid"]).date() <= slutt

        vindu = [h for h in self.data["logg"] if i_vindu(h)]
        utkast = sum(h["type"] in ("utkast", "hypoteser") for h in vindu)
        filer = _tell_filer(Path(mappe), start) if mappe else 0
        sendt = sum(h["type"] == "kontaktstatus" and h["til"] == "sendt" for h in vindu)
        svar = sum(h["type"] == "kontaktstatus" and h["til"] in SVARSTATUS
                   and h["fra"] in ("kald", "sendt") for h in vindu)

        siste_sendt = max((h["tid"] for h in self.data["logg"]
                           if h["type"] == "kontaktstatus" and h["til"] == "sendt"), default=None)
        dager_siden = (slutt - dt.datetime.fromisoformat(siste_sendt).date()).days if siste_sendt else None

        return {
            "fra": start.isoformat(), "til": slutt.isoformat(),
            "produsert": utkast + filer, "utkast": utkast, "filer": filer,
            "sendt": sendt, "svar": svar, "dager_siden_sendt": dager_siden,
            "forpliktelser": {p: self.forpliktelser(p) for p in PROSJEKTER},
        }

    # ── Grok-utkast (lagres, sendes aldri) ──
    def _skriv_utkast(self, navn: str, tekst: str) -> Path:
        self.utkastmappe.mkdir(parents=True, exist_ok=True)
        sti = self.utkastmappe / f"{i_dag().isoformat()}-{_slug(navn)}.md"
        n = 2
        while sti.exists():
            sti = self.utkastmappe / f"{i_dag().isoformat()}-{_slug(navn)}-{n}.md"
            n += 1
        sti.write_text(tekst, encoding="utf-8")
        return sti

    def hypoteser(self, prosjekt: str) -> Path:
        p = finn_prosjekt(prosjekt)
        tekst = _generer_hypoteser(p, self.data["prosjekter"][p])
        sti = self._skriv_utkast(f"{p}-hypoteser", tekst)
        self._logg("hypoteser", prosjekt=p, fil=str(sti))
        return sti

    def utkast(self, kid: int) -> Path:
        k = self.kontakt(kid)
        tekst = _generer_epost(k, self.data["prosjekter"][k["prosjekt"]])
        sti = self._skriv_utkast(f"{k['prosjekt']}-{k['id']}-{k['navn']}", tekst)
        self._logg("utkast", prosjekt=k["prosjekt"], kontakt=kid, fil=str(sti))
        return sti


def _slug(s: str) -> str:
    s = s.lower().replace("æ", "ae").replace("ø", "o").replace("å", "a")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]


def _tell_filer(mappe: Path, siden: dt.date) -> int:
    grense = dt.datetime.combine(siden, dt.time()).timestamp()
    return sum(1 for f in mappe.rglob("*")
               if f.is_file() and ".git" not in f.parts and f.stat().st_mtime >= grense)


# ── Generatorer, alle bak portvakten ───────────────────────────────────

SYSTEM_SELGER = (
    "Du skriver korte, ærlige B2B-henvendelser på norsk for en solo-utvikler. "
    "Maks 120 ord. Én konkret forespørsel (15 min samtale eller pilot). Ingen hype, "
    "ingen helsepåstander, ingen løfter om resultater. Første linje: 'Merke: UTKAST – ikke sendt'. "
    "Andre linje: 'Emne: ...'."
)


@kontrollert(spor="slusen", ved_rett="fiks")
def _generer_epost(kontakt: dict, prosjekt: dict) -> str:
    beskrivelse = prosjekt.get("beskrivelse") or "(mangler beskrivelse — kjør: slusen prosjekt beskriv)"
    if grokkjerne.tilgjengelig():
        try:
            return grokkjerne.spor(
                f"Prosjekt: {kontakt['prosjekt']}\nHva det er: {beskrivelse}\n"
                f"Målkunder: {', '.join(prosjekt.get('malkunder') or []) or 'ukjent'}\n"
                f"Mottaker: {kontakt['navn']}, {kontakt.get('org') or 'ukjent org'}\n"
                f"Status: {kontakt['status']}. Skriv neste e-post.", SYSTEM_SELGER, temperatur=0.5)
        except grokkjerne.GrokUtilgjengelig:
            pass
    fornavn = kontakt["navn"].split()[0]
    return (
        "Merke: UTKAST – ikke sendt (offline-mal, ingen Grok)\n"
        f"Emne: 15 minutter om {kontakt['prosjekt']}?\n"
        f"Til: {kontakt.get('epost') or '[e-post mangler]'}\n\n"
        f"Hei {fornavn},\n\n"
        f"Jeg bygger {kontakt['prosjekt']}: {beskrivelse}\n\n"
        "Jeg leter etter tre virksomheter som vil teste en tidlig versjon "
        "og si rett ut hva som ikke virker.\n"
        "Har du 15 minutter neste uke?\n\n"
        "Hilsen\n[navn]\n"
    )


@kontrollert(spor="slusen", ved_rett="fiks")
def _generer_hypoteser(navn: str, prosjekt: dict) -> str:
    beskrivelse = prosjekt.get("beskrivelse")
    if beskrivelse and grokkjerne.tilgjengelig():
        try:
            return grokkjerne.spor(
                f"Prosjekt {navn}: {beskrivelse}\nKjente målkunder: {prosjekt.get('malkunder')}\n"
                "Lag 5 kundesegment-hypoteser for B2B i Norge. For hver: hvem betaler, hvorfor nå, "
                "hvordan finne 10 navngitte virksomheter (offentlige kilder), første setning i e-post. "
                "Merk alt som HYPOTESE. Første linje: 'Merke: UTKAST – hypoteser, ikke verifisert'.",
                SYSTEM_SELGER, temperatur=0.7)
        except grokkjerne.GrokUtilgjengelig:
            pass
    segmenter = prosjekt.get("malkunder") or ["[segment 1]", "[segment 2]", "[segment 3]"]
    blokker = "\n".join(
        f"## {s}\n- Hvem betaler:\n- Hvorfor nå:\n- Finn 10 navn her:\n- Første setning:\n"
        for s in segmenter)
    return (f"Merke: UTKAST – hypoteser, ikke verifisert (offline-mal)\n# {navn} — kundehypoteser\n\n"
            f"Beskrivelse: {beskrivelse or '[mangler — slusen prosjekt beskriv ' + navn + ' \"...\"]'}\n\n"
            + blokker)
