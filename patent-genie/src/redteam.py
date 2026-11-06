"""Steg 6: red team. Søker prior art i arXiv, GitHub og (om nøkkel finnes) PatentSearch.

Dette er IKKE juridisk råd. Dommen bygger bare på treffene som faktisk ble hentet.
Regel: uten vellykket patentsøk kan dommen aldri bli GRØNN. Den nedgraderes til GUL.
RØD flyttes til inventions/dode/ med en linje om hva som kan berges.
"""
from __future__ import annotations

import os
import re
from datetime import date
from urllib.parse import quote

import requests

from common import DEAD, INVENTIONS, ROOT, append_log, claude, parse_json

PATENT_API = "https://search.patentsview.org/api/v1/patent/"
SECTION = "\n## RED TEAM"

QUERY_PROMPT = """Lag 3 engelske søkestrenger for å finne eksisterende arbeid som ligner denne ideen.
Bruk korte termer, ikke hele setninger. Svar kun med JSON-liste av strenger.

{brief}"""

JUDGE_PROMPT = """Du gjør en red team-vurdering av en oppfinnelsesbrief. Skriv på norsk, korte setninger.
Dette er IKKE juridisk råd.

BRIEF:
{brief}

TREFF (arXiv / GitHub / patent):
{hits}

PATENTSØK GJORT: {patent_ok}

Gi dom:
- GRØNN: ingen nære treff. Krever at patentsøk er gjort.
- GUL: nære naboer. Foreslå én konkret endring som flytter ideen ut av naboens krav.
- RØD: samme løsning er allerede tatt. Skriv én linje om hva som kan berges.

Svar kun med JSON: {{"dom": "GRØNN|GUL|RØD", "begrunnelse": "...", "endring": "...", "berges": "..."}}"""


def arxiv_hits(q: str) -> list[str]:
    r = requests.get(f"https://export.arxiv.org/api/query?search_query=all:{quote(q)}&max_results=5",
                     timeout=30)
    r.raise_for_status()
    out = []
    for m in re.finditer(r"<entry>.*?<id>(.*?)</id>.*?<title>(.*?)</title>", r.text, re.S):
        out.append(f"arXiv: {' '.join(m.group(2).split())} ({m.group(1).strip()})")
    return out


def github_hits(q: str) -> list[str]:
    headers = {"User-Agent": "patent-genie/0.1", "Accept": "application/vnd.github+json"}
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = requests.get(f"https://api.github.com/search/repositories?q={quote(q)}&per_page=5",
                     headers=headers, timeout=30)
    r.raise_for_status()
    return [f"GitHub: {i['full_name']} — {(i.get('description') or '')[:120]} ({i['html_url']})"
            for i in r.json().get("items", [])]


def patent_hits(q: str, key: str) -> list[str]:
    body = {"q": {"_text_any": {"patent_abstract": q}},
            "f": ["patent_id", "patent_title", "patent_date"], "o": {"size": 5}}
    r = requests.post(PATENT_API, json=body, headers={"X-Api-Key": key}, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f"PatentSearch {r.status_code}")
    return [f"Patent: US{p.get('patent_id')} {p.get('patent_title')} ({p.get('patent_date')})"
            for p in r.json().get("patents") or []]


def clean_brief(text: str) -> str:
    return text.split(SECTION, 1)[0].rstrip() + "\n"


def main() -> dict:
    key = os.getenv("PATENTSVIEW_KEY", "").strip()
    briefs = sorted(p for p in INVENTIONS.glob("*.md") if not p.name.endswith("-laer.md"))
    doms: dict[str, str] = {}
    report = [f"# Red team {date.today().isoformat()}", "",
              "Dette er ikke juridisk råd. Dommer bygger bare på treffene som ble hentet.", ""]

    for path in briefs:
        navn = path.stem
        text = clean_brief(path.read_text(encoding="utf-8"))
        try:
            queries = parse_json(claude(QUERY_PROMPT.format(brief=text[:3000]), max_tokens=300), "[")[:3]
        except Exception as exc:
            queries = [navn]
            print(f"  søkestrenger feilet for {navn}: {exc}")

        notes, hits = [], []
        for q in queries:
            for label, fn in (("arXiv", arxiv_hits), ("GitHub", github_hits)):
                try:
                    hits += fn(q)
                except Exception as exc:
                    notes.append(f"{label} feilet: {exc.__class__.__name__}")
        patent_ok = False
        if key:
            try:
                for q in queries:
                    hits += patent_hits(q, key)
                patent_ok = True
            except Exception as exc:
                notes.append(f"patentsøk feilet: {exc}")
        else:
            notes.append("patentsøk ikke gjort: PATENTSVIEW_KEY mangler (UAVKLART)")

        verdict = parse_json(
            claude(JUDGE_PROMPT.format(brief=text[:4000],
                                       hits="\n".join(hits)[:6000] or "ingen treff",
                                       patent_ok="ja" if patent_ok else "nei"),
                   max_tokens=800),
            "{")
        dom = str(verdict.get("dom", "UAVKLART")).upper()
        if dom == "GRØNN" and not patent_ok:
            dom = "GUL"
            verdict["begrunnelse"] = "Nedgradert fra GRØNN: patentsøk ikke gjort. " + str(verdict.get("begrunnelse", ""))
        doms[navn] = dom

        section = (
            f"{SECTION} ({date.today().isoformat()})\n"
            f"**Dom:** {dom}\n"
            f"**Begrunnelse:** {verdict.get('begrunnelse', '')}\n"
            f"**Endring:** {verdict.get('endring', '—')}\n"
            f"**Berges:** {verdict.get('berges', '—')}\n"
            f"**Søk:** {'; '.join(notes) or 'alle kilder kjørt'}\n\n"
            "**Treff:**\n" + ("\n".join(f"- {h}" for h in hits) or "- ingen") + "\n"
        )
        path.write_text(text + section, encoding="utf-8")
        append_log(navn, "red-team", "arXiv/GitHub" + ("/patent" if patent_ok else ""), dom)

        if dom == "RØD":
            DEAD.mkdir(parents=True, exist_ok=True)
            path.rename(DEAD / path.name)

        report.append(f"- {navn}: **{dom}** — {verdict.get('begrunnelse', '')}")

    (ROOT / "data").mkdir(exist_ok=True)
    (ROOT / "data" / "redteam.md").write_text("\n".join(report) + "\n", encoding="utf-8")
    return {"doms": doms}


if __name__ == "__main__":
    print(main())
