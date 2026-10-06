// Serialisering av databaserader til API-format (camelCase).

export interface DbMessage {
  id: string;
  conversation_id: string;
  seq: number;
  role: "user" | "assistant";
  kind: string;
  content: string;
  status: string;
  incomplete_reason: string | null;
  error_code: string | null;
  client_message_id: string | null;
  reply_to: string | null;
  corrected_at: Date | null;
  safety_level: string | null;
  generated_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export const messageView = (m: DbMessage) => ({
  id: m.id,
  conversationId: m.conversation_id,
  seq: m.seq,
  role: m.role,
  kind: m.kind,
  content: m.content,
  status: m.status,
  incompleteReason: m.incomplete_reason,
  errorCode: m.error_code,
  clientMessageId: m.client_message_id,
  replyTo: m.reply_to,
  correctedAt: m.corrected_at?.toISOString() ?? null,
  safetyLevel: m.safety_level,
  generatedBy: m.generated_by,
  createdAt: m.created_at.toISOString(),
  updatedAt: m.updated_at.toISOString(),
});

export interface DbConversation {
  id: string;
  user_id: string;
  topic: string;
  title: string | null;
  tone: "mild" | "torr" | "skarp";
  dark_humor: boolean;
  persisted: boolean;
  expires_at: Date | null;
  safety_level: "none" | "uncertain" | "concern" | "acute";
  next_seq: number;
  closed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const conversationView = (c: DbConversation) => ({
  id: c.id,
  topic: c.topic,
  title: c.title,
  tone: c.tone,
  darkHumor: c.dark_humor,
  persisted: c.persisted,
  expiresAt: c.expires_at?.toISOString() ?? null,
  safetyLevel: c.safety_level,
  closedAt: c.closed_at?.toISOString() ?? null,
  createdAt: c.created_at.toISOString(),
  updatedAt: c.updated_at.toISOString(),
});
