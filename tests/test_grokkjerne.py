import asyncio

import openai
import pytest
from pydantic import BaseModel

from grokkjerne import GrokFeil, Innstillinger, KonfigFeil, Merke, UgyldigJSON
from tests.conftest import api_feil, les_logg


class Delpåstand(BaseModel):
    tekst: str
    merke: Merke


def test_chat_returnerer_tekst_og_logger(lag_kjerne, innst):
    k, falsk, _ = lag_kjerne(["hei"])
    assert k.chat("si hei", motor="gransk", rolle="påstandsjeger", run_id="r1") == "hei"
    assert falsk.kall[0]["model"] == "test-modell"
    [post] = les_logg(innst)
    assert post["motor"] == "gransk" and post["rolle"] == "påstandsjeger" and post["run_id"] == "r1"
    assert post["tokens_inn"] == 10 and post["tokens_ut"] == 5
    assert post["kostnad_usd"] == pytest.approx((10 * 2 + 5 * 10) / 1e6)
    assert post["ok"] is True and len(post["prompt_hash"]) == 16
    for felt in ("ts", "latens_ms"):
        assert felt in post


def test_retry_på_429_og_5xx_med_backoff(lag_kjerne, innst):
    k, _, sovet = lag_kjerne([
        api_feil(openai.RateLimitError, 429),
        api_feil(openai.InternalServerError, 503),
        "endelig",
    ])
    assert k.chat("x") == "endelig"
    assert len(sovet) == 2 and sovet[1] > sovet[0]  # eksponentiell
    assert les_logg(innst)[0]["forsok"] == 3


def test_gir_opp_etter_tre_forsøk(lag_kjerne, innst):
    k, falsk, _ = lag_kjerne([api_feil(openai.RateLimitError, 429)] * 5)
    with pytest.raises(GrokFeil):
        k.chat("x")
    assert len(falsk.kall) == 3
    post = les_logg(innst)[0]
    assert post["ok"] is False and post["forsok"] == 3


def test_ingen_retry_på_400(lag_kjerne):
    k, falsk, sovet = lag_kjerne([api_feil(openai.BadRequestError, 400), "aldri"])
    with pytest.raises(GrokFeil):
        k.chat("x")
    assert len(falsk.kall) == 1 and sovet == []


def test_chat_json_validerer(lag_kjerne):
    k, falsk, _ = lag_kjerne(['```json\n{"tekst": "Jorda er rund", "merke": "DOKUMENTERT"}\n```'])
    svar = k.chat_json("sjekk", Delpåstand)
    assert svar.merke is Merke.DOKUMENTERT
    assert falsk.kall[0]["response_format"] == {"type": "json_object"}
    assert "SKJEMA" in falsk.kall[0]["messages"][0]["content"]


def test_chat_json_spør_på_nytt_ved_ugyldig(lag_kjerne, innst):
    k, falsk, _ = lag_kjerne(["ikke json", '{"tekst": "x", "merke": "SANT"}', '{"tekst": "x", "merke": "HYPOTESE"}'])
    assert k.chat_json("sjekk", Delpåstand).merke is Merke.HYPOTESE
    assert len(falsk.kall) == 3
    assert "Ugyldig" in falsk.kall[2]["messages"][-1]["content"]
    assert len(les_logg(innst)) == 3


def test_chat_json_gir_opp(lag_kjerne):
    k, _, _ = lag_kjerne(["tull"] * 3)
    with pytest.raises(UgyldigJSON):
        k.chat_json("sjekk", Delpåstand)


async def test_async_parallelt(lag_kjerne, innst):
    k, falsk, sovet = lag_kjerne([api_feil(openai.APITimeoutError, 0), "a", "b", "c"], asynk=True)
    svar = await asyncio.gather(*(k.async_chat(f"p{i}", rolle=f"agent{i}") for i in range(3)))
    assert sorted(svar) == ["a", "b", "c"]
    assert len(sovet) == 1 and len(les_logg(innst)) == 3


async def test_async_chat_json(lag_kjerne):
    k, _, _ = lag_kjerne(['{"tekst": "y", "merke": "UAVKLART"}'], asynk=True)
    assert (await k.async_chat_json("x", Delpåstand)).merke is Merke.UAVKLART


def test_merke_er_komplett():
    assert {m.value for m in Merke} == {"DOKUMENTERT", "BEREGNET", "HYPOTESE", "MOTBEVIST", "UAVKLART"}


def test_modell_kun_fra_miljø(monkeypatch, tmp_path):
    monkeypatch.setenv("XAI_API_KEY", "k")
    monkeypatch.delenv("XAI_MODEL", raising=False)
    with pytest.raises(KonfigFeil, match="XAI_MODEL"):
        Innstillinger.fra_miljo(dotenv=tmp_path / "finnes-ikke")
    monkeypatch.setenv("XAI_MODEL", "fra-env")
    assert Innstillinger.fra_miljo(dotenv=None).modell == "fra-env"


def test_dotenv_leses(monkeypatch, tmp_path):
    monkeypatch.delenv("XAI_API_KEY", raising=False)
    monkeypatch.delenv("XAI_MODEL", raising=False)
    (tmp_path / ".env").write_text("XAI_API_KEY=abc\nXAI_MODEL='m1'\n# kommentar\n", encoding="utf-8")
    inn = Innstillinger.fra_miljo(dotenv=tmp_path / ".env")
    assert (inn.api_key, inn.modell) == ("abc", "m1")
