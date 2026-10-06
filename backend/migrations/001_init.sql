-- Antipsykologen: første skjema.
-- Prinsipp: samtaletekst lagres bare i messages.content, memories.content,
-- action_cards og conversation_summaries.data. Alt annet er metadata.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apple_sub        text UNIQUE,
  tone             text NOT NULL DEFAULT 'torr' CHECK (tone IN ('mild', 'torr', 'skarp')),
  dark_humor       boolean NOT NULL DEFAULT false,
  history_enabled  boolean NOT NULL DEFAULT false,
  memory_enabled   boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Langlivet enhetsnøkkel (ligger i iOS Keychain). Lagres kun som SHA-256.
CREATE TABLE refresh_tokens (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   bytea NOT NULL UNIQUE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

-- Kortlivet tilgangsnøkkel. Lagres kun som SHA-256.
CREATE TABLE access_tokens (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_id uuid REFERENCES refresh_tokens(id) ON DELETE CASCADE,
  token_hash       bytea NOT NULL UNIQUE,
  expires_at       timestamptz NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX access_tokens_expires_idx ON access_tokens (expires_at);

CREATE TABLE conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic         text NOT NULL CHECK (topic IN ('parforhold', 'arbeid', 'utsettelse', 'annet')),
  title         text,
  tone          text NOT NULL CHECK (tone IN ('mild', 'torr', 'skarp')),
  dark_humor    boolean NOT NULL DEFAULT false,
  -- persisted=false: vises ikke i historikk og slettes automatisk etter expires_at.
  persisted     boolean NOT NULL,
  expires_at    timestamptz,
  -- Høyeste sikkerhetsnivå sett i tråden. Klistrer: humor forblir av.
  safety_level  text NOT NULL DEFAULT 'none' CHECK (safety_level IN ('none', 'uncertain', 'concern', 'acute')),
  next_seq      integer NOT NULL DEFAULT 1,
  closed_at     timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CHECK (persisted OR expires_at IS NOT NULL)
);
CREATE INDEX conversations_user_idx ON conversations (user_id, updated_at DESC);
CREATE INDEX conversations_expiry_idx ON conversations (expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE messages (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id    uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seq                integer NOT NULL,
  role               text NOT NULL CHECK (role IN ('user', 'assistant')),
  -- message | import | correction | tone_milder | tone_sharper | next_step
  kind               text NOT NULL DEFAULT 'message'
                       CHECK (kind IN ('message', 'import', 'correction', 'tone_milder', 'tone_sharper', 'next_step')),
  content            text NOT NULL DEFAULT '',
  status             text NOT NULL CHECK (status IN ('created', 'generating', 'completed', 'cancelled', 'failed')),
  -- Hvorfor et svar er ufullstendig: user_cancelled | client_disconnected | superseded |
  -- timeout | max_tokens | refusal | provider_error | server_restart
  incomplete_reason  text,
  error_code         text,
  client_message_id  uuid,
  content_sha256     bytea,
  reply_to           uuid REFERENCES messages(id) ON DELETE CASCADE,
  -- Satt på assistentsvar som brukeren har sagt bommet («Du har misforstått»).
  corrected_at       timestamptz,
  cancel_requested_at timestamptz,
  generated_by       text,  -- model-id, 'safety_template' eller 'mock'
  prompt_version     text,
  safety_level       text CHECK (safety_level IN ('none', 'uncertain', 'concern', 'acute')),
  safety_categories  text[],
  input_tokens       integer,
  output_tokens      integer,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, seq)
);
CREATE UNIQUE INDEX messages_idempotency_idx
  ON messages (conversation_id, client_message_id) WHERE client_message_id IS NOT NULL;
CREATE INDEX messages_user_recent_idx ON messages (user_id, created_at) WHERE role = 'user';
CREATE INDEX messages_generating_idx ON messages (status) WHERE status IN ('created', 'generating');

CREATE TABLE conversation_summaries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  through_seq      integer NOT NULL,
  data             jsonb NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversation_summaries_idx ON conversation_summaries (conversation_id, through_seq DESC);

-- Langtidsminne. Krever users.memory_enabled. Minner avledet av en samtale
-- forsvinner når samtalen slettes (ON DELETE CASCADE).
CREATE TABLE memories (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content                 text NOT NULL,
  source_conversation_id  uuid REFERENCES conversations(id) ON DELETE CASCADE,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX memories_user_idx ON memories (user_id, created_at);

-- Handlingskort lagres bare når brukeren selv lagrer dem.
CREATE TABLE action_cards (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_id  uuid REFERENCES conversations(id) ON DELETE SET NULL,
  what             text NOT NULL,
  when_text        text NOT NULL,
  done_when        text NOT NULL,
  if_stuck         text NOT NULL,
  status           text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'set_aside')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX action_cards_user_idx ON action_cards (user_id, created_at DESC);

-- Forbruk per bruker per døgn (UTC). Ingen tekst.
CREATE TABLE usage_daily (
  user_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day            date NOT NULL,
  requests       integer NOT NULL DEFAULT 0,
  input_tokens   bigint NOT NULL DEFAULT 0,
  output_tokens  bigint NOT NULL DEFAULT 0,
  cost_micro_usd bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);
