"""Steg 1: hent G06N-patenter fra PatentsView (PatentSearch API).

Krever PATENTSVIEW_KEY i .env. Uten nøkkel stopper steget med tydelig feil.
Ingen data dikteres opp. Ved feil skrives ingen fil.

UAVKLART: feltnavnene under er ikke verifisert mot dokumentasjonen ennå.
Sjekk dem mot https://search.patentsview.org før første ekte kjøring.
"""
from __future__ import annotations

import datetime as dt
import sys

import requests

from common import RAW, require_env, save_json

API = "https://search.patentsview.org/api/v1/patent/"
FIELDS = [
    "patent_id",
    "patent_title",
    "patent_abstract",
    "patent_date",
    "patent_num_times_cited_by_us_patents",
    "application.filing_date",
    "assignees.assignee_organization",
    "assignees.assignee_individual_name_first",
    "assignees.assignee_individual_name_last",
    "cpc_current.cpc_subclass_id",
    "claims.claim_sequence",
    "claims.claim_text",
]


def query(clauses: list[dict], size: int, sort_field: str) -> dict:
    return {
        "q": {"_and": [{"_eq": {"cpc_current.cpc_subclass_id": "G06N"}}] + clauses},
        "f": FIELDS,
        "o": {"size": size},
        "s": [{sort_field: "desc"}],
    }


def post(body: dict, key: str) -> list[dict]:
    r = requests.post(API, json=body, headers={"X-Api-Key": key}, timeout=60)
    if r.status_code != 200:
        raise RuntimeError(f"PatentSearch svarte {r.status_code}: {r.text[:300]}")
    patents = r.json().get("patents") or []
    if not patents:
        raise RuntimeError("PatentSearch ga 0 treff. Sjekk feltnavn og filter.")
    return patents


def normalize(p: dict, bucket: str) -> dict:
    claims = [c for c in p.get("claims") or [] if c.get("claim_sequence") == 1]
    first = claims[0].get("claim_text") if claims else None
    assignees = p.get("assignees") or []
    orgs = [a["assignee_organization"] for a in assignees if a.get("assignee_organization")]
    people = [
        " ".join(x for x in (a.get("assignee_individual_name_first"),
                             a.get("assignee_individual_name_last")) if x)
        for a in assignees
    ]
    innehaver = "; ".join(orgs or [x for x in people if x]) or "ukjent"
    cpc = sorted({c["cpc_subclass_id"] for c in p.get("cpc_current") or []
                  if c.get("cpc_subclass_id")})
    return {
        "nummer": p.get("patent_id"),
        "tittel": p.get("patent_title"),
        "sammendrag": p.get("patent_abstract"),
        "forste_krav": first,
        "innlevert": (p.get("application") or {}).get("filing_date"),
        "innehaver": innehaver,
        "cpc": cpc,
        "siteringer": p.get("patent_num_times_cited_by_us_patents"),
        "innvilget": p.get("patent_date"),
        "botte": bucket,
    }


def main(size: int = 50) -> dict:
    key = require_env("PATENTSVIEW_KEY")
    two_years_ago = (dt.date.today() - dt.timedelta(days=730)).isoformat()

    gullgruva_raw = post(
        query(
            [
                {"_gte": {"application.filing_date": "1995-01-01"}},
                {"_lte": {"application.filing_date": "2006-12-31"}},
            ],
            size,
            "patent_num_times_cited_by_us_patents",
        ),
        key,
    )
    fronten_raw = post(
        query([{"_gte": {"patent_date": two_years_ago}}], size, "patent_date"),
        key,
    )

    gullgruva = [normalize(p, "A") for p in gullgruva_raw]
    fronten = [normalize(p, "B") for p in fronten_raw]
    save_json(RAW / "gullgruva.json", gullgruva)
    save_json(RAW / "fronten.json", fronten)
    return {"gullgruva": len(gullgruva), "fronten": len(fronten)}


if __name__ == "__main__":
    try:
        print(main())
    except Exception as exc:  # tydelig feil, ingen dikting
        print(f"FEIL: {exc}", file=sys.stderr)
        sys.exit(1)
