import { Writable } from "node:stream";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { buildApp, type AppContext } from "../src/app.js";
import { testConfig, type Config } from "../src/config.js";
import { createDb, type Db } from "../src/db.js";
import { migrate } from "../src/migrate.js";
import { MockProvider, type MockOptions } from "../src/model/mock.js";
import type { ModelProvider } from "../src/model/provider.js";

let sharedDb: Db | null = null;
let migrated = false;

export async function getDb(): Promise<Db> {
  sharedDb ??= createDb(testConfig().DATABASE_URL);
  if (!migrated) {
    await migrate(sharedDb);
    migrated = true;
  }
  return sharedDb;
}

export async function resetDb(db: Db) {
  await db.query(
    "TRUNCATE users, refresh_tokens, access_tokens, conversations, messages, conversation_summaries, memories, action_cards, usage_daily CASCADE",
  );
}

export interface TestServer {
  url: string;
  ctx: AppContext;
  db: Db;
  mock: MockProvider;
  cfg: Config;
  logs: string[];
  close: () => Promise<void>;
}

export async function startServer(
  opts: { mock?: MockOptions; provider?: ModelProvider; cfg?: Partial<Record<keyof Config, string>> } = {},
): Promise<TestServer> {
  const db = await getDb();
  await resetDb(db);
  const cfg = testConfig({ LOG_LEVEL: "info", ...opts.cfg });
  const mock = new MockProvider(opts.mock ?? {});
  const logs: string[] = [];
  const logStream = new Writable({
    write(chunk, _enc, cb) {
      logs.push(chunk.toString());
      cb();
    },
  });
  const { app, ctx } = await buildApp({ cfg, db, provider: opts.provider ?? mock, logStream });
  await app.listen({ port: 0, host: "127.0.0.1" });
  const port = (app.server.address() as AddressInfo).port;
  return {
    url: `http://127.0.0.1:${port}`,
    ctx,
    db,
    mock,
    cfg,
    logs,
    close: async () => {
      await app.close();
    },
  };
}

export class Client {
  constructor(
    public readonly base: string,
    public token = "",
    public refreshToken = "",
    public userId = "",
  ) {}

  static async anonymous(base: string): Promise<Client> {
    const res = await fetch(`${base}/v1/auth/anonymous`, { method: "POST" });
    if (res.status !== 201) throw new Error(`anon failed ${res.status}`);
    const j = (await res.json()) as { accessToken: string; refreshToken: string; userId: string };
    return new Client(base, j.accessToken, j.refreshToken, j.userId);
  }

  async req(method: string, path: string, body?: unknown): Promise<{ status: number; json: any }> {
    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: {
        ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
        ...(body !== undefined ? { "content-type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = text;
    }
    return { status: res.status, json };
  }

  async newConversation(topic = "parforhold", extra: Record<string, unknown> = {}): Promise<string> {
    const r = await this.req("POST", "/v1/conversations", { topic, ...extra });
    if (r.status !== 201) throw new Error(`conv failed ${r.status} ${JSON.stringify(r.json)}`);
    return r.json.id;
  }

  /** Sender en melding og leser hele SSE-strømmen. */
  async send(
    conversationId: string,
    content: string,
    opts: { kind?: string; clientMessageId?: string; correctsMessageId?: string; signal?: AbortSignal; onEvent?: (e: SseEvent) => void } = {},
  ): Promise<{ status: number; events: SseEvent[]; json?: any }> {
    const res = await fetch(`${this.base}/v1/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { authorization: `Bearer ${this.token}`, "content-type": "application/json" },
      body: JSON.stringify({
        clientMessageId: opts.clientMessageId ?? randomUUID(),
        kind: opts.kind ?? "message",
        content,
        ...(opts.correctsMessageId ? { correctsMessageId: opts.correctsMessageId } : {}),
      }),
      signal: opts.signal,
    });
    if (!res.headers.get("content-type")?.includes("text/event-stream")) {
      return { status: res.status, events: [], json: await res.json() };
    }
    const events: SseEvent[] = [];
    const reader = res.body!.getReader();
    const dec = new TextDecoder();
    let buf = "";
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          const block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          const ev = parseSse(block);
          if (ev) {
            events.push(ev);
            opts.onEvent?.(ev);
          }
        }
      }
    } catch (err) {
      if (!opts.signal?.aborted) throw err;
    }
    return { status: res.status, events };
  }
}

export interface SseEvent {
  event: string;
  data: any;
}

function parseSse(block: string): SseEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of block.split("\n")) {
    if (line.startsWith(":")) continue;
    if (line.startsWith("event: ")) event = line.slice(7);
    else if (line.startsWith("data: ")) data.push(line.slice(6));
  }
  if (!data.length) return null;
  return { event, data: JSON.parse(data.join("\n")) };
}

export const doneMessage = (events: SseEvent[]) => events.find((e) => e.event === "done")?.data.message;
export const text = (events: SseEvent[]) =>
  events.filter((e) => e.event === "delta").map((e) => e.data.text).join("");

export async function waitFor<T>(fn: () => Promise<T | null | undefined | false>, ms = 5000): Promise<T> {
  const end = Date.now() + ms;
  for (;;) {
    const v = await fn();
    if (v) return v as T;
    if (Date.now() > end) throw new Error("waitFor timeout");
    await new Promise((r) => setTimeout(r, 50));
  }
}
