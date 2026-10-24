import io
import json
import os
import shutil
import sys
import tempfile
import zipfile
from contextlib import redirect_stdout

HER = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HER)
sys.path.insert(0, os.path.join(HER, ".."))
import overlever as O  # noqa: E402
from felles.kontroll import kjor  # noqa: E402

HEMMELIGE_VERDIER = ["demo-ikke-ekte-1234567890", "hemmelig-testverdi"]


def kjor_cli(args):
    buf = io.StringIO()
    with redirect_stdout(buf):
        kode = O.main(args)
    return kode, buf.getvalue()


def kontroll(k):
    res = os.path.join(HER, "resultat")
    shutil.rmtree(res, ignore_errors=True)
    tmp = tempfile.mkdtemp()
    komplett = os.path.join(tmp, "komplett")
    shutil.copytree(os.path.join(HER, "eksempler", "komplett"), komplett)
    kode, ut = kjor_cli([komplett, "--ut", os.path.join(res, "komplett"), "--kjor-kontroller"])
    k.lik("komplett prosjekt med kjørte kontroller: GODKJENT (exit 0)", kode, 0)
    zipsti = os.path.join(res, "komplett", "fakturaimport_1.2.0.zip")
    k.sjekk("godkjent pakke er generert", os.path.exists(zipsti))
    z = zipfile.ZipFile(zipsti)
    man = json.loads(z.read("manifest.json"))
    k.sjekk("manifest har sha256 som stemmer med filene i pakken",
            all(O.hashlib.sha256(z.read("leveranse/" + m["fil"])).hexdigest() == m["sha256"] for m in man["manifest"]), len(man["manifest"]))
    k.sjekk("manifest har kjente mangler og neste vedlikeholdshandling", man["kjente_mangler"] and "2027-01-04" in man["neste_vedlikehold"])
    k.lik("kontrollen ble kjørt og bestått", [x["status"] for x in man["kontroller"]], ["bestått"])
    # Uten --kjor-kontroller
    kode, _ = kjor_cli([komplett, "--ut", os.path.join(tmp, "uten")])
    k.lik("uten kjørte kontroller blir pakken ikke godkjent", kode, 2)
    # Endret fil → endret hash
    f1 = {m["fil"]: m["sha256"] for m in man["manifest"]}
    with open(os.path.join(komplett, "src", "importer.py"), "a", encoding="utf-8") as f:
        f.write("\n# endring\n")
    r2 = O.vurder(komplett, O.les_kontrakt(os.path.join(komplett, "leveranse.json")))
    f2 = {m["fil"]: m["sha256"] for m in r2["manifest"]}
    k.lik("endret fil får endret hash, andre filer uendret", [f for f in f1 if f1[f] != f2[f]], ["src/importer.py"])
    # Mangelfull
    kode, ut = kjor_cli([os.path.join(HER, "eksempler", "mangelfull"), "--ut", os.path.join(res, "mangelfull"), "--kjor-kontroller"])
    k.lik("mangelfullt prosjekt: IKKE GODKJENT (exit 2)", kode, 2)
    k.sjekk("ingen pakke for mangelfullt prosjekt", not any(f.endswith(".zip") for f in os.listdir(os.path.join(res, "mangelfull"))))
    r = json.load(open(os.path.join(res, "mangelfull", "rapport.json"), encoding="utf-8"))
    k.lik("manglende obligatoriske filer blokkerer", sorted(m["monster"] for m in r["manglende_filer"]), ["LISENS*", "tests/test_*.py"])
    k.lik("to mulige hemmeligheter flagges med fil og linje", [(h["fil"], h["linje"]) for h in r["mulige_hemmeligheter"]], [("src/rute.py", 2), ("src/rute.py", 3)])
    alt = ut + open(os.path.join(res, "mangelfull", "rapport.html"), encoding="utf-8").read() + json.dumps(r)
    k.sjekk("hemmelige verdier skrives ikke i utskrift, HTML eller JSON", not any(v in alt for v in HEMMELIGE_VERDIER))
    k.sjekk("kontroll som feiler (testmappe mangler) blokkerer", "kontroll feilet: enhetstester" in r["blokkerer"], r["kontroller"][0].get("exit"))
    k.sjekk("rapporten beskriver grensene for kontrollen", len(r["grenser"]) == 3)
    k.kaster("kontrakt uten påkrevde felt avvises", lambda: O.les_kontrakt(os.path.join(HER, "kontraktformat.md")), Exception)


kjor("019 Overleveringspakke", HER, kontroll)
