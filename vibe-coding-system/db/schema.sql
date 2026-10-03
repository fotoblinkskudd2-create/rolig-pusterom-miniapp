-- Psykologiet Vibe Coding System: Postgres 16 + pgvector
-- Migrasjon V001__init.sql (Flyway/Alembic-kompatibel navngiving)
-- Prinsipper: uforanderlige kodeversjoner, pseudonymisering, RLS per behandler,
-- feltkryptering av fritekst, append-only audit.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE SCHEMA IF NOT EXISTS vibe;
SET search_path = vibe, public;

-- ---------- Typer ----------
CREATE TYPE user_role       AS ENUM ('terapeut','fagansvarlig','admin','personvernombud','sluttbruker');
CREATE TYPE code_priority   AS ENUM ('P0','P1','P2','P3');
CREATE TYPE code_status     AS ENUM ('draft','active','deprecated');
CREATE TYPE consent_purpose AS ENUM ('behandling_observasjon','ml_klassifisering','forskning_anonymisert');
CREATE TYPE suggestion_status AS ENUM ('foreslatt','bekreftet','avvist');
CREATE TYPE obs_source      AS ENUM ('samtale','innsjekk','notat','import');

-- ---------- Brukerprofil ----------
CREATE TABLE user_profile (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    oidc_subject  text NOT NULL UNIQUE,              -- sub-claim fra IdP
    display_name  text NOT NULL,
    role          user_role NOT NULL,
    org_unit      text,
    locale        text NOT NULL DEFAULT 'nb-NO',
    preferences   jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at    timestamptz NOT NULL DEFAULT now(),
    deactivated_at timestamptz
);

-- ---------- Taksonomi ----------
CREATE TABLE taxonomy_release (
    version     text PRIMARY KEY,                    -- f.eks. '2026.10.0' (CalVer)
    released_at timestamptz NOT NULL DEFAULT now(),
    released_by uuid REFERENCES user_profile(id),
    notes       text
);

CREATE TABLE label (                                -- etiketter: kategori, tema, målgruppe
    id        smallserial PRIMARY KEY,
    kind      text NOT NULL CHECK (kind IN ('kategori','tema','malgruppe','intervensjonstype')),
    slug      text NOT NULL,
    name      text NOT NULL,
    parent_id smallint REFERENCES label(id),
    UNIQUE (kind, slug)
);

-- Stabil identitet for en kode
CREATE TABLE vibe_code (
    id          text PRIMARY KEY CHECK (id ~ '^VC-[0-9]{3}$'),
    slug        text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
    current_version int NOT NULL DEFAULT 1,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Uforanderlige versjoner. UPDATE/DELETE blokkeres av trigger.
CREATE TABLE vibe_code_version (
    code_id          text NOT NULL REFERENCES vibe_code(id),
    version          int  NOT NULL CHECK (version > 0),
    taxonomy_version text REFERENCES taxonomy_release(version),
    name             text NOT NULL,
    definition       text NOT NULL,
    category         text NOT NULL,
    priority         code_priority NOT NULL,
    status           code_status NOT NULL DEFAULT 'draft',
    trigger_signals  jsonb NOT NULL,     -- {"patterns":[...],"semantic_examples":[...]}
    counter_examples jsonb NOT NULL DEFAULT '[]',
    recommended_actions jsonb NOT NULL DEFAULT '[]',
    composition      jsonb NOT NULL DEFAULT '{}',
    safeguards       jsonb NOT NULL DEFAULT '[]',
    escalation       text,
    change_note      text NOT NULL,
    created_by       uuid REFERENCES user_profile(id),
    created_at       timestamptz NOT NULL DEFAULT now(),
    approved_by      uuid REFERENCES user_profile(id),  -- firøyeprinsipp før 'active'
    PRIMARY KEY (code_id, version),
    CHECK (status <> 'active' OR approved_by IS NOT NULL),
    CHECK (approved_by IS NULL OR approved_by IS DISTINCT FROM created_by)
);
CREATE INDEX vcv_active_idx ON vibe_code_version (code_id) WHERE status = 'active';
CREATE INDEX vcv_signals_gin ON vibe_code_version USING gin (trigger_signals jsonb_path_ops);

CREATE TABLE vibe_code_relation (
    from_code text NOT NULL REFERENCES vibe_code(id),
    to_code   text NOT NULL REFERENCES vibe_code(id),
    kind      text NOT NULL CHECK (kind IN ('relatert','forsterkes_av','erstatter')),
    PRIMARY KEY (from_code, to_code, kind),
    CHECK (from_code <> to_code)
);

CREATE TABLE vibe_code_label (
    code_id  text NOT NULL REFERENCES vibe_code(id),
    label_id smallint NOT NULL REFERENCES label(id),
    PRIMARY KEY (code_id, label_id)
);

-- Prototype-vektorer per kodeversjon og modell (én rad per semantisk eksempel)
CREATE TABLE code_prototype_embedding (
    code_id    text NOT NULL,
    version    int  NOT NULL,
    model_id   text NOT NULL,
    example_ix int  NOT NULL,
    embedding  vector(1024) NOT NULL,
    PRIMARY KEY (code_id, version, model_id, example_ix),
    FOREIGN KEY (code_id, version) REFERENCES vibe_code_version(code_id, version)
);
CREATE INDEX cpe_hnsw ON code_prototype_embedding USING hnsw (embedding vector_cosine_ops);

-- ---------- Kontaktkunnskapsbase ----------
-- Direkte identifikatorer ligger kun her, kryptert. Resten av skjemaet bruker contact.id.
CREATE TABLE contact (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pseudonym      text NOT NULL UNIQUE,                    -- 'K-7F3A21', vises i UI
    name_enc       bytea NOT NULL,                          -- envelope-kryptert (KMS-DEK)
    birth_year     smallint CHECK (birth_year BETWEEN 1900 AND 2100), -- minimert: ikke full dato
    external_ref_hash bytea,                                -- HMAC av EPJ-/CRM-id, for idempotent import
    attributes     jsonb NOT NULL DEFAULT '{}'::jsonb,      -- fleksible, ikke-sensitive felter
    created_at     timestamptz NOT NULL DEFAULT now(),
    deleted_at     timestamptz,                             -- myk sletting -> hard sletting etter frist
    UNIQUE (external_ref_hash)
);

CREATE TABLE contact_assignment (                         -- hvem har tjenstlig behov
    contact_id uuid NOT NULL REFERENCES contact(id),
    user_id    uuid NOT NULL REFERENCES user_profile(id),
    reason     text NOT NULL,
    valid_from timestamptz NOT NULL DEFAULT now(),
    valid_to   timestamptz,
    PRIMARY KEY (contact_id, user_id, valid_from)
);
CREATE INDEX ca_user_idx ON contact_assignment (user_id) WHERE valid_to IS NULL;

CREATE TABLE consent (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id   uuid NOT NULL REFERENCES contact(id),
    purpose      consent_purpose NOT NULL,
    text_version text NOT NULL,                           -- hvilken samtykketekst ble vist
    granted_at   timestamptz NOT NULL DEFAULT now(),
    withdrawn_at timestamptz,
    channel      text NOT NULL CHECK (channel IN ('app','papir','muntlig_dokumentert')),
    recorded_by  uuid REFERENCES user_profile(id)
);
CREATE UNIQUE INDEX consent_one_active ON consent (contact_id, purpose) WHERE withdrawn_at IS NULL;

CREATE TABLE interaction (                                 -- en samtale/time/innsjekk
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id  uuid NOT NULL REFERENCES contact(id),
    user_id     uuid REFERENCES user_profile(id),
    kind        text NOT NULL CHECK (kind IN ('time','telefon','chat','innsjekk','gruppe')),
    started_at  timestamptz NOT NULL,
    ended_at    timestamptz,
    attributes  jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX interaction_contact_time ON interaction (contact_id, started_at DESC);

CREATE TABLE observation (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id     uuid NOT NULL REFERENCES contact(id),
    interaction_id uuid REFERENCES interaction(id),
    source         obs_source NOT NULL,
    text_enc       bytea NOT NULL,                         -- fritekst, envelope-kryptert
    text_lang      text NOT NULL DEFAULT 'nb',
    observed_at    timestamptz NOT NULL,
    attributes     jsonb NOT NULL DEFAULT '{}'::jsonb,     -- heterogene felt: skalaer, skjema-svar
    schema_ref     text,                                   -- f.eks. 'innsjekk.v2' for attributes
    created_by     uuid REFERENCES user_profile(id),
    created_at     timestamptz NOT NULL DEFAULT now(),
    classified     boolean NOT NULL DEFAULT false
);
CREATE INDEX obs_contact_time ON observation (contact_id, observed_at DESC);
CREATE INDEX obs_attr_gin ON observation USING gin (attributes jsonb_path_ops);

-- Vektorer separat: kan slettes ved tilbaketrukket ML-samtykke uten å røre journalen.
CREATE TABLE observation_embedding (
    observation_id uuid NOT NULL REFERENCES observation(id) ON DELETE CASCADE,
    model_id       text NOT NULL,
    embedding      vector(1024) NOT NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (observation_id, model_id)
);
CREATE INDEX oe_hnsw ON observation_embedding USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

CREATE TABLE code_suggestion (
    observation_id uuid NOT NULL REFERENCES observation(id) ON DELETE CASCADE,
    code_id        text NOT NULL,
    code_version   int  NOT NULL,
    score          real NOT NULL CHECK (score BETWEEN 0 AND 1),
    rule_score     real NOT NULL,
    semantic_score real NOT NULL,
    matched_signals jsonb NOT NULL DEFAULT '[]',
    escalate       boolean NOT NULL DEFAULT false,
    status         suggestion_status NOT NULL DEFAULT 'foreslatt',
    classifier_version text NOT NULL,                     -- f.eks. 'hybrid-1.3+bge-m3'
    reviewed_by    uuid REFERENCES user_profile(id),
    reviewed_at    timestamptz,
    PRIMARY KEY (observation_id, code_id),
    FOREIGN KEY (code_id, code_version) REFERENCES vibe_code_version(code_id, version)
);
CREATE INDEX cs_escalate_open ON code_suggestion (observation_id) WHERE escalate AND status = 'foreslatt';

-- ---------- Annotasjon (treningsdata) ----------
CREATE TABLE annotation (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sample_id      uuid NOT NULL,           -- peker til anonymisert kopi i forskningsskjema, ikke observation
    annotator_id   uuid NOT NULL REFERENCES user_profile(id),
    labels         text[] NOT NULL,
    spans          jsonb NOT NULL DEFAULT '[]',
    confidence     smallint CHECK (confidence BETWEEN 1 AND 5),
    guideline_version text NOT NULL,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (sample_id, annotator_id)
);

-- ---------- Audit (append-only, partisjonert per måned) ----------
CREATE TABLE audit_event (
    id        bigserial,
    at        timestamptz NOT NULL DEFAULT now(),
    actor_id  uuid,
    role      user_role,
    action    text NOT NULL,
    resource  text NOT NULL,
    outcome   text NOT NULL CHECK (outcome IN ('ok','denied','error')),
    purpose   text,
    ip_hash   bytea,
    detail    jsonb NOT NULL DEFAULT '{}'::jsonb,
    prev_hash bytea,                         -- hash-kjede for manipulasjonsdeteksjon
    PRIMARY KEY (id, at)
) PARTITION BY RANGE (at);
CREATE TABLE audit_event_2026_10 PARTITION OF audit_event FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE INDEX audit_resource_idx ON audit_event (resource, at DESC);

-- ---------- Uforanderlighet ----------
CREATE FUNCTION forbid_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION '% er append-only', TG_TABLE_NAME;
END $$;

CREATE TRIGGER vcv_immutable BEFORE UPDATE OR DELETE ON vibe_code_version
    FOR EACH ROW WHEN (current_setting('app.allow_migration', true) IS DISTINCT FROM 'on')
    EXECUTE FUNCTION forbid_mutation();
CREATE TRIGGER audit_immutable BEFORE UPDATE OR DELETE ON audit_event
    FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

-- ---------- Radnivå-sikkerhet ----------
-- Appen setter per transaksjon: SET LOCAL app.user_id = '<uuid>'; SET LOCAL app.role = 'terapeut';
ALTER TABLE contact     ENABLE ROW LEVEL SECURITY;
ALTER TABLE observation ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent     ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION app_user() RETURNS uuid LANGUAGE sql STABLE AS
$$ SELECT nullif(current_setting('app.user_id', true), '')::uuid $$;

CREATE FUNCTION is_assigned(c uuid) RETURNS boolean LANGUAGE sql STABLE AS $$
    SELECT EXISTS (SELECT 1 FROM vibe.contact_assignment a
                   WHERE a.contact_id = c AND a.user_id = vibe.app_user()
                     AND a.valid_from <= now() AND (a.valid_to IS NULL OR a.valid_to > now()))
$$;

CREATE POLICY contact_assigned ON contact     USING (deleted_at IS NULL AND is_assigned(id));
CREATE POLICY obs_assigned     ON observation USING (is_assigned(contact_id));
CREATE POLICY consent_assigned ON consent     USING (is_assigned(contact_id));

-- Applikasjonsrolle uten BYPASSRLS
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'vibe_app') THEN
        CREATE ROLE vibe_app LOGIN;
    END IF;
END $$;
GRANT USAGE ON SCHEMA vibe TO vibe_app;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA vibe TO vibe_app;
REVOKE UPDATE, DELETE ON audit_event, vibe_code_version FROM vibe_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA vibe TO vibe_app;

-- ---------- Nyttige visninger ----------
CREATE VIEW active_vibe_code AS
SELECT v.* FROM vibe_code c
JOIN vibe_code_version v ON v.code_id = c.id AND v.version = c.current_version
WHERE v.status = 'active';

COMMIT;

-- ---------- Eksempel: semantisk kandidatsøk (top-k mot prototyper) ----------
-- SET LOCAL hnsw.ef_search = 40;
-- SELECT code_id, version, 1 - (embedding <=> $1) AS cos
-- FROM vibe.code_prototype_embedding
-- WHERE model_id = $2
-- ORDER BY embedding <=> $1
-- LIMIT 20;
