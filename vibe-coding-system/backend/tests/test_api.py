import json
from pathlib import Path

from fastapi.testclient import TestClient

from app.classifier import HybridClassifier
from app.embeddings import HashingEmbedder
from app.main import app, store

client = TestClient(app)
T = {"Authorization": "Bearer dev-terapeut-ola"}
T2 = {"Authorization": "Bearer dev-terapeut-kari"}
FAG = {"Authorization": "Bearer dev-fagansvarlig-ane"}
DPO = {"Authorization": "Bearer dev-personvernombud-per"}
ADMIN = {"Authorization": "Bearer dev-admin-sys"}
GOLDEN = Path(__file__).resolve().parents[2] / "data" / "golden_set.jsonl"


def new_contact(consents=("behandling_observasjon", "ml_klassifisering"), headers=T):
    r = client.post("/v1/contacts", json={"display_name": "Test Person", "consents": list(consents)}, headers=headers)
    assert r.status_code == 201
    return r.json()


def test_auth_required():
    r = client.get("/v1/vibe-codes")
    assert r.status_code == 401
    assert r.headers["content-type"].startswith("application/problem+json")


def test_seeded_codes():
    r = client.get("/v1/vibe-codes", headers=T)
    assert r.status_code == 200
    ids = {c["id"] for c in r.json()}
    assert {"VC-001", "VC-012"} <= ids and len(ids) == 12


def test_only_fagansvarlig_can_create_and_versioning():
    body = {
        "id": "VC-099", "slug": "test-kode", "name": "Testkode", "definition": "En kode kun for test av API-et.",
        "category": "test", "priority": "P3", "trigger_signals": {"patterns": ["\\btestord\\b"], "semantic_examples": ["dette er en test"]},
        "related_codes": ["VC-001"],
    }
    assert client.post("/v1/vibe-codes", json=body, headers=T).status_code == 403
    r = client.post("/v1/vibe-codes", json=body, headers=FAG)
    assert r.status_code == 201 and r.json()["status"] == "draft" and r.json()["version"] == 1
    assert client.post("/v1/vibe-codes", json=body, headers=FAG).status_code == 409

    r = client.put("/v1/vibe-codes/VC-099", json={"status": "active", "change_note": "godkjent i fagråd"}, headers=FAG)
    assert r.json()["version"] == 2 and r.json()["status"] == "active"
    versions = client.get("/v1/vibe-codes/VC-099/versions", headers=T).json()
    assert [v["version"] for v in versions] == [1, 2]


def test_invalid_regex_is_rejected_and_rolled_back():
    body = {"id": "VC-098", "slug": "brutt", "name": "Brutt", "definition": "Har ugyldig regex i mønster.",
            "category": "test", "priority": "P3", "trigger_signals": {"patterns": ["(uavsluttet"]}}
    r = client.post("/v1/vibe-codes", json=body, headers=FAG)
    assert r.status_code == 422 and "regex" in r.json()["title"]
    assert "VC-098" not in store.vibe_codes


def test_semantic_search_ranks_relevant_code_first():
    r = client.post("/v1/search/semantic", json={"query": "inkasso og gjeld holder meg våken", "top_k": 3}, headers=T)
    assert r.status_code == 200
    assert r.json()[0]["code_id"] == "VC-008"


def test_observation_requires_consent():
    c = new_contact(consents=())
    r = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "Alt er kaos"}, headers=T)
    assert r.status_code == 403


def test_other_therapist_cannot_see_contact():
    c = new_contact()
    r = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "hei"}, headers=T2)
    assert r.status_code == 404


def test_observation_classifies_and_recommends():
    c = new_contact()
    r = client.post(f"/v1/contacts/{c['id']}/observations",
                    json={"text": "Gjelden vokser og jeg skammer meg, tør ikke åpne inkassobrevet", "attributes": {"humør": 2}}, headers=T)
    assert r.status_code == 201
    codes = {s["code_id"] for s in r.json()["suggestions"]}
    assert {"VC-008", "VC-006"} <= codes

    recs = client.get(f"/v1/contacts/{c['id']}/recommendations", headers=T).json()
    vc008 = next(x for x in recs if x["code_id"] == "VC-008")
    assert vc008["amplified_by"] == ["VC-006"] and vc008["actions"]


def test_crisis_always_escalates_even_without_ml_consent():
    c = new_contact(consents=("behandling_observasjon",))
    r = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "Jeg orker ikke å leve sånn lenger"}, headers=T)
    body = r.json()
    assert body["classified"] is False and body["embedding_model"] is None
    assert body["suggestions"][0]["code_id"] == "VC-012" and body["suggestions"][0]["escalate"]
    recs = client.get(f"/v1/contacts/{c['id']}/recommendations", headers=T).json()
    assert recs[0]["code_id"] == "VC-012" and recs[0]["escalate"]


def test_negation_suppresses_non_crisis_codes():
    c = new_contact()
    r = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "Jeg er ikke overveldet i dag"}, headers=T)
    assert "VC-001" not in {s["code_id"] for s in r.json()["suggestions"]}


def test_review_rejected_suggestion_drops_from_recommendations():
    c = new_contact()
    obs = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "Fikk panikk og hjertebank på bussen"}, headers=T).json()
    r = client.patch(f"/v1/observations/{obs['id']}/suggestions/VC-004", params={"decision": "avvist"}, headers=T)
    assert r.status_code == 200
    recs = client.get(f"/v1/contacts/{c['id']}/recommendations", headers=T).json()
    assert "VC-004" not in {x["code_id"] for x in recs}


def test_withdraw_ml_consent_deletes_vectors():
    c = new_contact()
    obs = client.post(f"/v1/contacts/{c['id']}/observations", json={"text": "Sov ingenting i natt"}, headers=T).json()
    assert obs["id"] in {str(k) for k in store.vectors}
    client.delete(f"/v1/contacts/{c['id']}/consents/ml_klassifisering", headers=T)
    assert obs["id"] not in {str(k) for k in store.vectors}


def test_audit_log_access_and_redaction():
    new_contact()
    assert client.get("/v1/audit-logs", headers=T).status_code == 403
    dpo = client.get("/v1/audit-logs", headers=DPO).json()
    admin = client.get("/v1/audit-logs", headers=ADMIN).json()
    assert dpo and admin
    assert all(e["detail"] == {} for e in admin)


# ---------- ML-regresjon mot gullsett ----------

def _golden_metrics():
    clf = HybridClassifier(HashingEmbedder())
    codes = store.current_codes()
    rows = [json.loads(line) for line in GOLDEN.read_text(encoding="utf-8").splitlines() if line.strip()]
    tp = fp = fn = 0
    crisis_tp = crisis_fn = 0
    for row in rows:
        pred = {h.code_id for h in clf.classify(row["text"], codes) if not h.code_id.startswith("VC-09")}
        gold = set(row["labels"])
        tp += len(pred & gold)
        fp += len(pred - gold)
        fn += len(gold - pred)
        if "VC-012" in gold:
            crisis_tp += "VC-012" in pred
            crisis_fn += "VC-012" not in pred
    precision = tp / (tp + fp) if tp + fp else 0
    recall = tp / (tp + fn) if tp + fn else 0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0
    return precision, recall, f1, crisis_tp / (crisis_tp + crisis_fn)


def test_golden_set_regression():
    precision, recall, f1, crisis_recall = _golden_metrics()
    print(f"precision={precision:.2f} recall={recall:.2f} f1={f1:.2f} crisis_recall={crisis_recall:.2f}")
    assert crisis_recall == 1.0, "Krise-recall skal alltid være 1.0"
    assert f1 >= 0.75
