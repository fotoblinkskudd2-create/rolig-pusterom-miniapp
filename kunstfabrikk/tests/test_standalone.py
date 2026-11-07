"""Tester for de selvstendige scriptene i standalone/ (kun standardbibliotek)."""
from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
from datetime import datetime
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
NYHET = (ROT / "eksempler" / "nyhet.txt").read_text(encoding="utf-8")


def _last(navn):
    spec = importlib.util.spec_from_file_location(navn, ROT / "standalone" / f"{navn}.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


pipeline = _last("anti_slop_pipeline")
agent = _last("news_satire_agent")
fokusplan = _last("fokusplan")


def test_pipeline_struktur_og_laast_seed(tmp_path):
    ut = tmp_path / "output.json"
    assert pipeline.main(["stencil on wet concrete, 8k, masterpiece", NYHET, "--ut", str(ut)]) == 0
    d = json.loads(ut.read_text(encoding="utf-8"))
    assert {"base", "variants", "captions", "suno_line"} <= d.keys()
    assert len(d["bilder"]) == 4 and len(d["variants"]) == 6 and len(d["captions"]) == 3
    seed = d["valgt"]["seed"]
    for v in d["variants"]:
        assert f"--seed {seed}" in v and "--sref [SREF_URL]" in v and f"--v {pipeline.MJ_VERSJON}" in v
        assert "8k" not in v and "masterpiece" not in v
    assert (tmp_path / "captions.txt").read_text(encoding="utf-8").count("\n\n") >= 3


def test_pipeline_er_deterministisk():
    a = pipeline.lag_pakke("base", NYHET, seed=7)
    b = pipeline.lag_pakke("base", NYHET, seed=7)
    assert a == b


def test_agent_gir_kun_json_med_2_prompts_og_3_captions():
    r = subprocess.run([sys.executable, "-S", str(ROT / "standalone" / "news_satire_agent.py"), "--tekst", NYHET],
                       capture_output=True, text=True, check=True)
    d = json.loads(r.stdout)  # feiler hvis det er noe annet enn JSON i output
    assert set(d) == {"prompts", "captions"}
    assert len(d["prompts"]) == 2 and len(d["captions"]) == 3
    for p in d["prompts"]:
        assert "--ar" in p and "--raw" in p and "--stylize" in p and "--v 8.2" in p
        assert len(p.split()) >= 50
    assert all(c.count(".") <= 3 for c in d["captions"])


def test_agent_les_fil(tmp_path):
    f = tmp_path / "n.txt"
    f.write_text("Test nyhet om bompenger.", encoding="utf-8")
    assert agent.les_fil(str(f)).startswith("Test")


def test_fokusplan_kunst_og_agent_forst():
    prosjekter = ["Svare skatteetaten", "Familie-bok kapittel 2", "Mail-agent i Python", "Bergen stencil-serie"]
    rader = fokusplan.plan(prosjekter, datetime(2026, 11, 7, 18, 0))
    assert [r["oppgave"] for r in rader][:2] == ["Bergen stencil-serie", "Mail-agent i Python"]
    assert [r["tid"] for r in rader] == ["18:00–18:50", "19:00–19:50", "20:00–20:50", "21:00–21:50"]
    md = fokusplan.markdown(rader)
    assert md.startswith("| Tid | Oppgave | Prompt (copy-paste) | Suksesskriterium |")
    assert md.count("\n|") == 5  # header-skille + 4 rader


def test_fokusplan_escaper_pipe():
    rader = fokusplan.plan(["Kunst | serie"], datetime(2026, 11, 7, 9, 0))
    assert "Kunst \\| serie" in fokusplan.markdown(rader)
