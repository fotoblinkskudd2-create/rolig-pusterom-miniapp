"""Psykologiet Vibe Coding System: API (MVP-skisse).

Kjør:  uvicorn app.main:app --reload   (fra backend/)
Docs:  http://localhost:8000/docs
"""
from __future__ import annotations

import math
import re
from datetime import timedelta
from uuid import UUID

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from .classifier import HybridClassifier
from .embeddings import HashingEmbedder, cosine
from .models import (
    AuditEvent,
    CodeSuggestion,
    Consent,
    Contact,
    ContactIn,
    Observation,
    ObservationIn,
    Recommendation,
    Role,
    SearchHit,
    SearchRequest,
    VibeCode,
    VibeCodeIn,
    VibeCodeUpdate,
    utcnow,
)
from .security import Principal, current_principal, require
from .store import InMemoryStore

app = FastAPI(title="Psykologiet Vibe Coding System", version="0.1.0")
store = InMemoryStore()
store.seed()
embedder = HashingEmbedder()
classifier = HybridClassifier(embedder)

PRIORITY_WEIGHT = {"P0": 10.0, "P1": 3.0, "P2": 2.0, "P3": 1.0}
HALF_LIFE_DAYS = 14


# ---------- Feil som RFC 9457 problem+json ----------

def _problem(status_code: int, title: str, detail=None) -> JSONResponse:
    body = {"type": f"https://vibe.example/problems/{status_code}", "title": title, "status": status_code}
    if detail is not None:
        body["detail"] = detail
    return JSONResponse(body, status_code=status_code, media_type="application/problem+json")


@app.exception_handler(HTTPException)
async def http_problem(_: Request, exc: HTTPException):
    return _problem(exc.status_code, str(exc.detail))


@app.exception_handler(RequestValidationError)
async def validation_problem(_: Request, exc: RequestValidationError):
    errors = [{"loc": list(e["loc"]), "msg": e["msg"]} for e in exc.errors()]
    return _problem(422, "Ugyldig forespørsel", errors)


# ---------- Hjelpere ----------

def audit(p: Principal, action: str, resource: str, outcome="ok", **detail):
    store.append_audit(AuditEvent(actor=p.user_id, role=p.role, action=action, resource=resource, outcome=outcome, detail=detail))


def load_contact(contact_id: UUID, p: Principal) -> Contact:
    contact = store.contacts.get(contact_id)
    if contact is None or p.user_id not in contact.owner_ids:
        # Samme svar for "finnes ikke" og "ikke din": lekker ikke eksistens.
        audit(p, "contact.read", f"contact/{contact_id}", outcome="denied")
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Kontakt ikke funnet")
    return contact


def _compile_or_422(code: VibeCode):
    try:
        classifier.prototype_vectors(code)
    except re.error as e:
        raise HTTPException(422, f"Ugyldig regex i trigger_signals.patterns: {e}")


# ---------- VibeCode CRUD ----------

@app.get("/v1/vibe-codes", response_model=list[VibeCode])
def list_codes(_: Principal = Depends(current_principal)):
    return store.current_codes()


@app.get("/v1/vibe-codes/{code_id}", response_model=VibeCode)
def get_code(code_id: str, version: int | None = None, _: Principal = Depends(current_principal)):
    code = store.code(code_id, version)
    if code is None:
        raise HTTPException(404, "Vibe Code ikke funnet")
    return code


@app.get("/v1/vibe-codes/{code_id}/versions", response_model=list[VibeCode])
def code_versions(code_id: str, _: Principal = Depends(current_principal)):
    if code_id not in store.vibe_codes:
        raise HTTPException(404, "Vibe Code ikke funnet")
    return store.vibe_codes[code_id]


@app.post("/v1/vibe-codes", response_model=VibeCode, status_code=201)
def create_code(body: VibeCodeIn, p: Principal = Depends(require(Role.fagansvarlig))):
    with store.transaction():
        if body.id in store.vibe_codes:
            raise HTTPException(409, f"{body.id} finnes allerede. Bruk PUT for ny versjon.")
        unknown = [c for c in body.related_codes + body.composition.amplified_by if c not in store.vibe_codes]
        if unknown:
            raise HTTPException(422, f"Ukjente relaterte koder: {', '.join(unknown)}")
        code = VibeCode(**body.model_dump(), status="draft", created_by=p.user_id, change_note="opprettet")
        _compile_or_422(code)  # validerer regex og bygger prototyper før commit
        store.vibe_codes[code.id] = [code]
    audit(p, "vibe_code.create", f"vibe_code/{code.id}@1")
    return code


@app.put("/v1/vibe-codes/{code_id}", response_model=VibeCode)
def update_code(code_id: str, body: VibeCodeUpdate, p: Principal = Depends(require(Role.fagansvarlig))):
    with store.transaction():
        current = store.code(code_id)
        if current is None:
            raise HTTPException(404, "Vibe Code ikke funnet")
        if current.priority == "P0" and body.status == "deprecated":
            raise HTTPException(422, "P0-koder kan ikke fases ut uten erstatning")
        changes = body.model_dump(exclude_none=True)
        new = current.model_copy(update={**changes, "version": current.version + 1, "created_at": utcnow(), "created_by": p.user_id})
        new = VibeCode.model_validate(new.model_dump())
        _compile_or_422(new)
        store.vibe_codes[code_id].append(new)
    audit(p, "vibe_code.version", f"vibe_code/{code_id}@{new.version}", note=body.change_note)
    return new


# ---------- Semantisk søk ----------

@app.post("/v1/search/semantic", response_model=list[SearchHit])
def semantic_search(body: SearchRequest, _: Principal = Depends(current_principal)):
    qvec = embedder.embed([body.query])[0]
    codes = [c for c in store.current_codes() if c.status == "active"]
    rule_hits = {h.code_id: h for h in classifier.classify(body.query, codes, qvec)}
    hits = []
    for code in codes:
        sem = max(cosine(qvec, v) for v in classifier.prototype_vectors(code))
        rule = rule_hits[code.id].rule_score if code.id in rule_hits else 0.0
        # Re-rank: semantisk kandidat-score, løftet av eksplisitte regeltreff.
        hits.append(SearchHit(code_id=code.id, name=code.name, score=round(0.7 * sem + 0.3 * rule, 4), semantic_score=round(sem, 4), rule_score=rule))
    hits.sort(key=lambda h: -h.score)
    return hits[: body.top_k]


# ---------- Kontakter, samtykke, observasjoner ----------

@app.post("/v1/contacts", response_model=Contact, status_code=201)
def create_contact(body: ContactIn, p: Principal = Depends(require(Role.terapeut))):
    with store.transaction():
        contact = Contact(pseudonym="", display_name=body.display_name, owner_ids=[p.user_id], consents=[Consent(purpose=c) for c in set(body.consents)])
        contact.pseudonym = f"K-{contact.id.hex[:6].upper()}"
        store.contacts[contact.id] = contact
        store.observations[contact.id] = []
    audit(p, "contact.create", f"contact/{contact.id}", consents=sorted(set(body.consents)))
    return contact


@app.delete("/v1/contacts/{contact_id}/consents/{purpose}", response_model=Contact)
def withdraw_consent(contact_id: UUID, purpose: str, p: Principal = Depends(require(Role.terapeut))):
    with store.transaction():
        contact = load_contact(contact_id, p)
        active = [c for c in contact.consents if c.purpose == purpose and c.active]
        if not active:
            raise HTTPException(404, "Ingen aktivt samtykke for dette formålet")
        for c in active:
            c.withdrawn_at = utcnow()
        if purpose == "ml_klassifisering":
            # Tilbaketrukket ML-samtykke: slett vektorer, behold menneskeskrevne notater.
            for obs in store.observations[contact_id]:
                store.vectors.pop(obs.id, None)
                obs.embedding_model = None
    audit(p, "consent.withdraw", f"contact/{contact_id}", purpose=purpose)
    return contact


@app.post("/v1/contacts/{contact_id}/observations", response_model=Observation, status_code=201)
def add_observation(contact_id: UUID, body: ObservationIn, p: Principal = Depends(require(Role.terapeut))):
    with store.transaction():
        contact = load_contact(contact_id, p)
        if not contact.has_consent("behandling_observasjon"):
            audit(p, "observation.create", f"contact/{contact_id}", outcome="denied", reason="mangler samtykke")
            raise HTTPException(403, "Kontakten har ikke gitt samtykke til lagring av observasjoner")

        suggestions, vec, model_id = [], None, None
        ml_ok = contact.has_consent("ml_klassifisering")
        if ml_ok:
            vec = embedder.embed([body.text])[0]
            model_id = embedder.model_id
            hits = classifier.classify(body.text, store.current_codes(), vec)
            suggestions = [CodeSuggestion(**h.__dict__) for h in hits]
        else:
            # Uten ML-samtykke kjøres kun krise-reglene: sikkerhet går foran, men ingen vektor lagres.
            p0 = [c for c in store.current_codes() if c.priority == "P0"]
            suggestions = [CodeSuggestion(**h.__dict__) for h in classifier.classify(body.text, p0) if h.escalate]

        obs = Observation(
            contact_id=contact_id, text=body.text, source=body.source, observed_at=body.observed_at or utcnow(),
            attributes=body.attributes, created_by=p.user_id, suggestions=suggestions, classified=ml_ok, embedding_model=model_id,
        )
        store.observations[contact_id].append(obs)
        if vec is not None:
            store.vectors[obs.id] = vec
    audit(p, "observation.create", f"observation/{obs.id}", codes=[s.code_id for s in suggestions], escalate=any(s.escalate for s in suggestions))
    return obs


@app.patch("/v1/observations/{observation_id}/suggestions/{code_id}", response_model=Observation)
def review_suggestion(observation_id: UUID, code_id: str, decision: str, p: Principal = Depends(require(Role.terapeut))):
    if decision not in ("bekreftet", "avvist"):
        raise HTTPException(422, "decision må være 'bekreftet' eller 'avvist'")
    with store.transaction():
        for cid, observations in store.observations.items():
            for obs in observations:
                if obs.id == observation_id:
                    load_contact(cid, p)
                    for s in obs.suggestions:
                        if s.code_id == code_id:
                            s.status = decision
                            audit(p, "suggestion.review", f"observation/{obs.id}", code=code_id, decision=decision)
                            return obs
                    raise HTTPException(404, "Forslaget finnes ikke på observasjonen")
    raise HTTPException(404, "Observasjon ikke funnet")


@app.get("/v1/contacts/{contact_id}/recommendations", response_model=list[Recommendation])
def recommendations(contact_id: UUID, days: int = 30, p: Principal = Depends(require(Role.terapeut))):
    contact = load_contact(contact_id, p)
    since = utcnow() - timedelta(days=days)
    weights: dict[str, float] = {}
    evidence: dict[str, int] = {}
    escalate: set[str] = set()
    for obs in store.observations[contact.id]:
        if obs.observed_at < since:
            continue
        age = (utcnow() - obs.observed_at).total_seconds() / 86400
        decay = math.pow(0.5, age / HALF_LIFE_DAYS)
        for s in obs.suggestions:
            if s.status == "avvist":
                continue
            boost = 1.5 if s.status == "bekreftet" else 1.0
            weights[s.code_id] = weights.get(s.code_id, 0.0) + s.score * decay * boost
            evidence[s.code_id] = evidence.get(s.code_id, 0) + 1
            if s.escalate:
                escalate.add(s.code_id)

    present = set(weights)
    out = []
    for code_id, w in weights.items():
        code = store.code(code_id)
        amplifiers = [a for a in code.composition.amplified_by if a in present]
        if amplifiers:
            w *= 1.25
        out.append(Recommendation(
            code_id=code.id, name=code.name, priority=code.priority, weight=round(w * PRIORITY_WEIGHT[code.priority], 3),
            evidence_count=evidence[code_id], escalate=code_id in escalate, amplified_by=amplifiers,
            note=code.composition.note if amplifiers else "", actions=[a for a in code.recommended_actions if a.audience == "fagperson"],
        ))
    out.sort(key=lambda r: (not r.escalate, -r.weight))
    audit(p, "recommendations.read", f"contact/{contact_id}", codes=[r.code_id for r in out])
    return out


# ---------- Audit ----------

@app.get("/v1/audit-logs", response_model=list[AuditEvent])
def audit_logs(resource_prefix: str | None = None, limit: int = 100, p: Principal = Depends(require(Role.personvernombud, Role.admin))):
    events = [e for e in store.audit if not resource_prefix or e.resource.startswith(resource_prefix)]
    if p.role == Role.admin:
        # Admin ser hvem/hva/når, men ikke klinisk innhold i detaljfeltet.
        events = [e.model_copy(update={"detail": {}}) for e in events]
    return events[-limit:][::-1]


@app.get("/healthz")
def healthz():
    return {"status": "ok", "codes": len(store.vibe_codes), "embedding_model": embedder.model_id}
