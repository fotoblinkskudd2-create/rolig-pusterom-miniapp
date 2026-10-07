import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest

from grokkjerne import Kjerne
from mrart.benker import BENKER, kjør_alle
from mrart.cli import main
from mrart.data import Datasett, registrer_inngrep, registrer_score
from mrart.metrikk import per_dag_motor, summer
from mrart.rapport import lag_html

NÅ = datetime(2026, 10, 7, 12, 0, tzinfo=timezone.utc)


def kall(dager_siden: float, motor="gransk", run="r1", kost=0.01, ok=True):
    ts = (NÅ - timedelta(days=dager_siden)).isoformat()
    return {"ts": ts, "motor": motor, "rolle": "x", "run_id": run, "tokens_inn": 100, "tokens_ut": 50,
            "latens_ms": 1500, "kostnad_usd": kost, "ok": ok}


def inngrep(dager_siden: float, run="r1"):
    return {"ts": (NÅ - timedelta(days=dager_siden)).isoformat(), "tekst": "rettet", "motor": None, "run_id": run}


def score(run, s, dager_siden=0.1):
    return {"ts": (NÅ - timedelta(days=dager_siden)).isoformat(), "run_id": run, "score": s}


def test_vindu_og_aggregering():
    d = Datasett(kall=[kall(1), kall(1, run="r2", motor="stemmeruter"), kall(20, run="gammel")],
                 inngrep=[inngrep(1), inngrep(1)], scorer=[score("r1", 2), score("r1", 4)])
    uke = summer(per_dag_motor(d, NÅ, 7), 7)
    assert uke.kall == 2 and uke.leveranser == 2
    assert uke.inngrep == 2 and uke.inngrep_per_leveranse == 1.0
    assert uke.scorer == [4]  # siste score vinner
    assert uke.motorer == {"gransk", "stemmeruter"}
    assert summer(per_dag_motor(d, NÅ, 30), 30).kall == 3


def test_inngrep_havner_på_riktig_motor_via_run():
    d = Datasett(kall=[kall(1, motor="stemmeruter", run="s1")], inngrep=[inngrep(1, run="s1")])
    [rad] = per_dag_motor(d, NÅ, 7)
    assert rad.motor == "stemmeruter" and rad.inngrep == 1


def test_vibelaas_for_lite_data():
    [r] = kjør_alle(Datasett(kall=[kall(1)]), NÅ)
    assert r.navn == "VIBE-LÅS" and r.status == "FOR LITE DATA"


def test_vibelaas_låst_når_stabilt():
    k = [kall(dg, run=f"r{dg}") for dg in range(0, 30, 2)]
    i = [inngrep(dg, run=f"r{dg}") for dg in range(0, 30, 2)]
    [r] = kjør_alle(Datasett(kall=k, inngrep=i), NÅ)
    assert r.status == "LÅST"


def test_vibelaas_glir_når_inngrep_øker():
    k = [kall(dg, run=f"r{dg}") for dg in range(0, 30)]
    i = [inngrep(dg, run=f"r{dg}") for dg in range(0, 6) for _ in range(3)]  # tung siste uke
    [r] = kjør_alle(Datasett(kall=k, inngrep=i), NÅ)
    assert r.status == "GLIR" and "inngrep/leveranse" in r.detaljer["glir"]


def test_benker_er_pluggbare():
    assert all(hasattr(b, "navn") and callable(b.vurder) for b in BENKER)


def test_rapport_er_selvstendig_html():
    d = Datasett(kall=[kall(dg, run=f"r{dg}") for dg in range(10)], scorer=[score("r1", 3)])
    html = lag_html(d, NÅ)
    assert html.startswith("<!doctype html>") and "<svg" in html and "VIBE-LÅS" in html
    for ekstern in ("<script src", "<link", "http://", "https://"):
        assert ekstern not in html


def test_score_og_inngrep_valideres(tmp_path):
    with pytest.raises(ValueError):
        registrer_score("r1", 6, mappe=tmp_path)
    with pytest.raises(ValueError):
        registrer_inngrep("   ", mappe=tmp_path)


def test_cli_ende_til_ende(tmp_path, capsys, innst, lag_kjerne):
    """grokkjerne skriver logg → mrart leser den. Hele kjeden, ingen nettverk."""
    innst_her = innst.__class__(**{**innst.__dict__, "loggsti": tmp_path / "kall.jsonl"})
    k = Kjerne(innst_her, klient=lag_kjerne(["a", "b"])[1])
    k.chat("x", motor="gransk", rolle="påstandsjeger", run_id="run-1")
    k.chat("y", motor="gransk", rolle="syntese", run_id="run-1")

    assert main(["--logger", str(tmp_path), "inngrep", "rettet kildefeil", "--run", "run-1"]) == 0
    assert main(["--logger", str(tmp_path), "score", "run-1", "4"]) == 0
    assert main(["--logger", str(tmp_path), "score", "run-1", "9"]) == 2
    capsys.readouterr()

    assert main(["--logger", str(tmp_path), "status"]) == 0
    ut = capsys.readouterr().out.splitlines()
    assert ut[0].startswith("MR ART · 7d: 2 kall") and "1 leveranser" in ut[0]
    assert "Inngrep: 1 (1.0 per leveranse) · snittscore 4.0" in ut[1]
    assert ut[2].startswith("VIBE-LÅS:") and ut[3] == ""
    assert "gransk" in ut[4 + 2]

    rapport = tmp_path / "r.html"
    assert main(["--logger", str(tmp_path), "rapport", "--ut", str(rapport)]) == 0
    assert "<svg" in rapport.read_text(encoding="utf-8")


def test_ødelagt_linje_dreper_ikke(tmp_path):
    (tmp_path / "kall.jsonl").write_text(json.dumps(kall(1)) + "\n{halv linje\n", encoding="utf-8")
    assert len(Datasett.les(tmp_path).kall) == 1
