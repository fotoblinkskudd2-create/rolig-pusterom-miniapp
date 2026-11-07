"""Tester for kunstfabrikk. Kjør: python -m pytest -q (fra kunstfabrikk/)."""
from __future__ import annotations

import json
from datetime import date, datetime
from pathlib import Path
from types import SimpleNamespace

import pytest

from kunstfabrikk import antislop, fokus, kjeder, llm, mj, satire, serie, tekst
from kunstfabrikk.tekstverktoy import nokkelord, setninger, slug

EKS = Path(__file__).resolve().parent.parent / "eksempler"
NYHET = (EKS / "nyhet.txt").read_text(encoding="utf-8")
BASE = "black and white spray stencil on wet Bergen concrete, one red accent"


@pytest.fixture(autouse=True)
def ingen_nokkel(monkeypatch):
    """Standard: ingen Claude. Tester som trenger LLM, mocker det eksplisitt."""
    monkeypatch.setattr(llm, "tilgjengelig", lambda: False)


# ---------- antislop ----------

def test_antislop_finner_tekst_og_prompt_slop():
    assert "la oss dykke" in antislop.treff("La oss dykke ned i dette 🚀 #kunst")
    assert {"emoji", "hashtag"} <= set(antislop.treff("bra 🚀 #kunst"))
    assert antislop.treff("Jeg står ved veggen. Regnet renner.") == []
    assert {"8k", "masterpiece"} <= set(antislop.treff("cat, 8k, masterpiece", prompt=True))


def test_rens_prompt_fjerner_kvalitetsord_men_beholder_motiv():
    ren = antislop.rens_prompt("stencil of a rat, 8k, masterpiece, trending on artstation, wet concrete")
    assert ren == "stencil of a rat, wet concrete"
    assert antislop.treff(ren, prompt=True) == []


# ---------- tekstverktøy ----------

def test_nokkelord_hopper_over_generiske_nyhetsord():
    ord_ = nokkelord(NYHET, 3)
    assert ord_[0] == "varmestua"
    assert "kommunen" not in ord_ and "bergen" not in ord_


def test_setninger_og_slug():
    assert setninger("Hei der. Dette er to. Og tre!") == ["Hei der.", "Dette er to.", "Og tre!"]
    assert slug("Kommunen stenger varmestua i Bergen!") == "kommunen-stenger-varmestua-i-bergen"


# ---------- mj ----------

def test_seed_er_deterministisk_og_i_gyldig_omraade():
    a, b = mj.seed_fra("x"), mj.seed_fra("x")
    assert a == b and 0 <= a <= 4294967295
    assert mj.seed_fra("x") != mj.seed_fra("y")


def test_parametre_med_sref_og_seed():
    p = mj.MJParametre(seed=42, sref="https://cdn.example/x.png", sw=300)
    t = p.som_tekst()
    assert "--sref https://cdn.example/x.png" in t and "--sw 300" in t and "--seed 42" in t
    assert "--style raw" in t and "--v 7" in t


def test_score_bilde_returnerer_tall(tmp_path):
    stier = mj.simuler_bilder(tmp_path, 2, seed=1)
    s = mj.score_bilde(stier[0])
    assert 0.0 <= s["score"] <= 1.0


# ---------- oppgave 1: serie ----------

def test_serie_fase1_uten_bilder(tmp_path):
    r = serie.kjor(NYHET, BASE, tmp_path, offline=True)
    assert r["fase"] == 1
    assert "--seed" in r["imagine"] and "--sref" not in r["imagine"]
    assert Path(r["fil"]).exists()


def test_serie_fase2_simulert_gir_6_laaste_varianter(tmp_path):
    r = serie.kjor(NYHET, BASE, tmp_path, simuler=True, sref="https://cdn.example/beste.png", offline=True)
    assert r["fase"] == 2
    assert len(r["varianter"]) == 6
    for v in r["varianter"]:
        assert f"--seed {r['seed']}" in v
        assert "--sref https://cdn.example/beste.png" in v
        assert antislop.treff(v, prompt=True) == []
    pakke = Path(r["pakke"])
    assert (pakke / "pakke.md").exists() and (pakke / "pakke.json").exists()
    assert (pakke / r["valgt_bilde"]).exists()
    assert r["caption"] and r["suno"].startswith("[")


def test_serie_manuelt_valg_og_samme_innhold_i_fase2(tmp_path):
    r1 = serie.kjor(NYHET, BASE, tmp_path, offline=True)
    r2 = serie.kjor(NYHET, BASE, tmp_path, simuler=True, velg=2, offline=True)
    assert r2["valg_grunn"].startswith("manuelt")
    assert r2["imagine_start"] == r1["imagine"]  # fase 2 gjenbruker fase 1-innhold
    with pytest.raises(SystemExit):
        serie.kjor(NYHET, BASE, tmp_path, simuler=True, velg=9, offline=True)


# ---------- oppgave 2: satire ----------

def test_del_nyheter():
    deler = satire.del_nyheter((EKS / "nyheter.txt").read_text(encoding="utf-8"))
    assert len(deler) == 3


def test_satire_offline_gir_2_prompts_3_captions(tmp_path):
    nyheter = satire.del_nyheter((EKS / "nyheter.txt").read_text(encoding="utf-8"))
    r = satire.kjor(nyheter, tmp_path, offline=True)
    assert r["antall"] == 3
    for sak in r["saker"]:
        assert len(sak["mj_prompts"]) == 2 and len(sak["captions"]) == 3
        assert sak["slop_treff"] == []
    data = json.loads(Path(r["json"]).read_text(encoding="utf-8"))
    assert data["saker"][0]["nyhet"].startswith("Strømstøtten")


def test_satire_llm_sti_renser_slop(tmp_path, monkeypatch):
    monkeypatch.setattr(llm, "tilgjengelig", lambda: True)
    monkeypatch.setattr(llm, "json_svar", lambda s, b, m=8000: {
        "kjerne": "x",
        "mj_prompts": ["stencil rat, 8k, masterpiece --ar 4:5", "stencil door --ar 4:5"],
        "captions": ["En 🚀", "To #tag", "Tre"],
    })
    r = satire.kjor(["Noe skjedde i dag."], tmp_path)
    sak = r["saker"][0]
    assert sak["modus"].startswith("claude:")
    assert "8k" not in sak["mj_prompts"][0] and "🚀" not in sak["captions"][0] and "#tag" not in sak["captions"][1]


# ---------- oppgave 3: skill-kjeder ----------

def test_alle_skills_er_gyldige():
    navn = {d["navn"] for d in kjeder.liste()}
    assert navn == {"innholds-produsent", "multi-media-bygger", "prompt-kjede-ekspert", "raa-kunst-bombe", "forsknings-assistent"}


def test_validering_stopper_ukjente_referanser():
    with pytest.raises(ValueError):
        kjeder.valider({"navn": "x", "beskrivelse": "x", "rolle": "x", "input": {"a": "a"},
                        "steg": [{"id": "s1", "instruks": "{steg.s2}", "output": {"k": "v"}}]})
    with pytest.raises(ValueError):
        kjeder.valider({"navn": "x", "beskrivelse": "x", "rolle": "x", "input": {"a": "a"},
                        "steg": [{"id": "s1", "instruks": "{input.b}", "output": {"k": "v"}}]})


def test_eksport_har_alle_steg_og_fyller_input():
    md = kjeder.eksporter("raa-kunst-bombe", {"overflate": "NAV-vegg"})
    assert md.count("## Steg") == 3
    assert "NAV-vegg" in md and "[NYHET:" in md
    assert "[svaret fra steg 'metaforer' over]" in md


def test_kjede_uten_nokkel_gir_tydelig_feil(tmp_path):
    with pytest.raises(SystemExit, match="--eksporter"):
        kjeder.kjor("raa-kunst-bombe", {"nyhet": "x", "overflate": "y"}, tmp_path)


def test_kjede_kjorer_steg_i_rekkefolge_med_mock(tmp_path, monkeypatch):
    monkeypatch.setattr(llm, "tilgjengelig", lambda: True)
    sett_prompts = []

    def falsk(system, bruker, m=8000):
        sett_prompts.append(bruker)
        if "hykleriet" in bruker:
            return {"sier": "vi bryr oss", "gjoer": "stenger", "hvem_betaler": "de som fryser"}
        if "tre helt ulike" in bruker:
            return {"metaforer": [{"bilde": "termostat med lås", "hvorfor_det_svir": "x"}]}
        return {"valgt": "termostat", "hvorfor": "x", "mj_prompt": "p", "veggtekst": "VARME ER ET VEDTAK", "caption": "c"}

    monkeypatch.setattr(llm, "json_svar", falsk)
    r = kjeder.kjor("raa-kunst-bombe", {"nyhet": NYHET, "overflate": "bussholdeplass"}, tmp_path)
    assert r["sluttresultat"]["veggtekst"] == "VARME ER ET VEDTAK"
    assert "vi bryr oss" in sett_prompts[1]          # steg 2 fikk output fra steg 1
    assert "termostat med lås" in sett_prompts[2]    # steg 3 fikk output fra steg 2
    assert Path(r["fil"]).exists()


# ---------- oppgave 4: fokus ----------

def test_fokus_prioriterer_frist_og_standstill():
    prosjekter = fokus.les_prosjekter(
        "Rolig | prio=3 | sist=2026-11-06\n"
        "Bok | prio=2 | frist=2026-11-05 | type=skriving\n"
        "Serie | prio=1 | sist=2026-10-01 | type=kunst | lag varianter\n"
    )
    rangert = fokus.prioriter(prosjekter, date(2026, 11, 7))
    assert [p.navn for p in rangert][:2] == ["Serie", "Bok"]
    assert rangert[0].neste == "lag varianter"


def test_fokus_plan_har_4_blokker_med_tider_og_kriterier(tmp_path):
    r = fokus.kjor((EKS / "prosjekter.txt").read_text(encoding="utf-8"), tmp_path,
                   nyheter=NYHET, start="18:00", idag=date(2026, 11, 7), offline=True)
    plan = r["plan"]
    assert len(plan) == 4
    assert [b["fra"] for b in plan] == ["18:00", "19:00", "20:00", "21:00"]
    assert all(b["prompt"] and b["suksesskriterium"] for b in plan)
    assert plan[0]["prosjekt"] == "Bergen stencil-serie"


def test_fokus_med_ett_prosjekt_fyller_alle_blokker():
    p = fokus.les_prosjekter("Eneste | prio=1")
    plan = fokus.lag_plan(p, datetime(2026, 11, 7, 9, 0))
    assert len(plan) == 4 and {b["prosjekt"] for b in plan} == {"Eneste"}


# ---------- oppgave 5: tekst ----------

def test_tekst_finner_kapitler_fra_overskrifter_og_harde_setninger(tmp_path, monkeypatch):
    def ikke_kall(*a, **k):
        raise AssertionError("tekst skal ikke kalle Claude uten --llm")
    monkeypatch.setattr(llm, "json_svar", ikke_kall)
    r = tekst.kjor((EKS / "raatekst.txt").read_text(encoding="utf-8"), tmp_path)
    assert r["modus"] == "lokal"
    assert [k["tittel"] for k in r["kapitler"]] == ["KAPITTEL EN", "KAPITTEL TO", "KAPITTEL TRE"]
    assert len(r["hardeste"]) == 10
    topp = " ".join(h["setning"] for h in r["hardeste"][:5])
    assert "løgnen" in topp or "aldri" in topp
    assert r["synopsis"]
    assert len(list(Path(r["kapittelmappe"]).glob("*.md"))) == 3


def test_tekst_uten_overskrifter_deler_paa_lengde():
    raa = "\n\n".join(f"Avsnitt {i}. " + "Jeg husker svik og løgn. " * 40 for i in range(6))
    kap = tekst.finn_kapitler(raa, maal_antall=3)
    assert len(kap) == 3 and all(k["kilde"] == "lengde" for k in kap)


# ---------- llm-laget ----------

def test_trekk_ut_json_taaler_kodeblokk_og_stoy():
    assert llm.trekk_ut_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert llm.trekk_ut_json('Her er svaret: {"a": 2} takk') == {"a": 2}
    with pytest.raises(ValueError):
        llm.trekk_ut_json("ingen json her")


def _falsk_klient(svar):
    return SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(create=lambda **kw: svar)))


def test_llm_avslag_gir_tydelig_feil(monkeypatch):
    svar = SimpleNamespace(stop_reason="refusal", stop_details=SimpleNamespace(category="general_harms"), content=[])
    monkeypatch.setattr(llm, "_klient", lambda: _falsk_klient(svar))
    with pytest.raises(llm.LLMFeil, match="avslo"):
        llm.tekst("s", "u")


def test_llm_sender_modell_effort_og_fallback(monkeypatch):
    mottatt = {}

    def create(**kw):
        mottatt.update(kw)
        return SimpleNamespace(stop_reason="end_turn", stop_details=None,
                               content=[SimpleNamespace(type="text", text='{"ok": true}')])

    monkeypatch.setattr(llm, "_klient", lambda: SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(create=create))))
    assert llm.json_svar("s", "u") == {"ok": True}
    assert mottatt["model"] == llm.MODELL
    assert mottatt["fallbacks"] == "default"
    assert mottatt["betas"] == ["server-side-fallback-2026-07-01"]
    assert mottatt["output_config"] == {"effort": llm.EFFORT}
