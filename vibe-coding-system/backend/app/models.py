from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(str, Enum):
    terapeut = "terapeut"
    fagansvarlig = "fagansvarlig"
    admin = "admin"
    personvernombud = "personvernombud"
    sluttbruker = "sluttbruker"


Priority = Literal["P0", "P1", "P2", "P3"]
ConsentPurpose = Literal["behandling_observasjon", "ml_klassifisering", "forskning_anonymisert"]


class TriggerSignals(BaseModel):
    patterns: list[str] = []
    semantic_examples: list[str] = []


class Action(BaseModel):
    audience: Literal["fagperson", "sluttbruker"]
    type: str
    text: str


class Composition(BaseModel):
    amplified_by: list[str] = []
    note: str = ""


class VibeCodeIn(BaseModel):
    id: str = Field(pattern=r"^VC-\d{3}$")
    slug: str = Field(pattern=r"^[a-z0-9-]+$")
    name: str = Field(min_length=2, max_length=80)
    definition: str = Field(min_length=10)
    category: str
    priority: Priority
    trigger_signals: TriggerSignals
    counter_examples: list[str] = []
    recommended_actions: list[Action] = []
    related_codes: list[str] = []
    composition: Composition = Composition()
    safeguards: list[str] = []
    escalation: str | None = None


class VibeCode(VibeCodeIn):
    version: int = 1
    status: Literal["draft", "active", "deprecated"] = "active"
    created_at: datetime = Field(default_factory=utcnow)
    created_by: str = "seed"
    change_note: str = ""


class VibeCodeUpdate(BaseModel):
    """En oppdatering lager alltid en ny, uforanderlig versjon."""

    definition: str | None = None
    priority: Priority | None = None
    trigger_signals: TriggerSignals | None = None
    counter_examples: list[str] | None = None
    recommended_actions: list[Action] | None = None
    status: Literal["draft", "active", "deprecated"] | None = None
    change_note: str = Field(min_length=3)


class Consent(BaseModel):
    purpose: ConsentPurpose
    granted_at: datetime = Field(default_factory=utcnow)
    withdrawn_at: datetime | None = None
    text_version: str = "samtykke-v1"

    @property
    def active(self) -> bool:
        return self.withdrawn_at is None


class ContactIn(BaseModel):
    display_name: str = Field(min_length=1, max_length=120)
    consents: list[ConsentPurpose] = []


class Contact(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    pseudonym: str
    display_name: str
    owner_ids: list[str]
    consents: list[Consent] = []
    created_at: datetime = Field(default_factory=utcnow)

    def has_consent(self, purpose: str) -> bool:
        return any(c.purpose == purpose and c.active for c in self.consents)


class ObservationIn(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source: Literal["samtale", "innsjekk", "notat", "import"] = "notat"
    observed_at: datetime | None = None
    attributes: dict = Field(default_factory=dict, description="Fleksible felt, lagres som JSONB")


class CodeSuggestion(BaseModel):
    code_id: str
    code_version: int
    score: float
    rule_score: float
    semantic_score: float
    matched_signals: list[str]
    negated_signals: list[str]
    escalate: bool
    status: Literal["foreslatt", "bekreftet", "avvist"] = "foreslatt"


class Observation(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    contact_id: UUID
    text: str
    source: str
    observed_at: datetime
    attributes: dict
    created_by: str
    suggestions: list[CodeSuggestion] = []
    classified: bool
    embedding_model: str | None = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=2, max_length=1000)
    top_k: int = Field(default=5, ge=1, le=50)


class SearchHit(BaseModel):
    code_id: str
    name: str
    score: float
    semantic_score: float
    rule_score: float


class Recommendation(BaseModel):
    code_id: str
    name: str
    priority: Priority
    weight: float
    evidence_count: int
    escalate: bool
    amplified_by: list[str]
    note: str
    actions: list[Action]


class AuditEvent(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    at: datetime = Field(default_factory=utcnow)
    actor: str
    role: Role
    action: str
    resource: str
    outcome: Literal["ok", "denied", "error"] = "ok"
    detail: dict = Field(default_factory=dict)
