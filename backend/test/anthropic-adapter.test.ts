import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { testConfig } from "../src/config.js";
import { AnthropicProvider } from "../src/model/anthropic.js";

// Tester adapteren og den ekte SDK-en mot en lokal falsk server som sender
// Anthropic-formatert SSE. Dette er IKKE en test mot den faktiske leverandøren.
let server: http.Server | null = null;
afterEach(() => new Promise<void>((r) => (server ? server.close(() => r()) : r())));

function sse(events: [string, unknown][], delayMs = 0) {
  return async (_req: http.IncomingMessage, res: http.ServerResponse, bodies: unknown[], body: unknown) => {
    bodies.push(body);
    res.writeHead(200, { "content-type": "text/event-stream" });
    for (const [ev, data] of events) {
      if (res.destroyed) return;
      res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);
      if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    }
    res.end();
  };
}

async function fake(handler: ReturnType<typeof sse>) {
  const bodies: any[] = [];
  const headers: http.IncomingHttpHeaders[] = [];
  server = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (d) => (raw += d));
    req.on("end", () => {
      headers.push(req.headers);
      void handler(req, res, bodies, JSON.parse(raw));
    });
  });
  await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
  return { url: `http://127.0.0.1:${(server!.address() as AddressInfo).port}`, bodies, headers };
}

const stream = (texts: string[], stop = "end_turn"): [string, unknown][] => [
  ["message_start", { type: "message_start", message: { id: "msg_1", type: "message", role: "assistant", model: "claude-opus-5-5", content: [], stop_reason: null, usage: { input_tokens: 50, output_tokens: 0 } } }],
  ["content_block_start", { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } }],
  ...texts.map((t): [string, unknown] => ["content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: t } }]),
  ["content_block_stop", { type: "content_block_stop", index: 0 }],
  ["message_delta", { type: "message_delta", delta: { stop_reason: stop }, usage: { output_tokens: 12 } }],
  ["message_stop", { type: "message_stop" }],
];

describe("Anthropic-adapter (falsk lokal server)", () => {
  it("sender riktig forespørsel og strømmer tekst", async () => {
    const f = await fake(sse(stream(["Du har ", "forklart det."])));
    const p = new AnthropicProvider(testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-test-dummy", ANTHROPIC_BASE_URL: f.url }));
    const got: string[] = [];
    const res = await p.streamChat(
      { systemStable: "STABIL", systemDynamic: "DYNAMISK", messages: [{ role: "user", content: "Hei" }], signal: new AbortController().signal },
      (t) => got.push(t),
    );
    expect(got).toEqual(["Du har ", "forklart det."]);
    expect(res).toMatchObject({ stop: "end_turn", inputTokens: 50, outputTokens: 12 });
    const body = f.bodies[0];
    expect(body.model).toBe("claude-opus-5-5");
    expect(body.stream).toBe(true);
    expect(body.fallbacks).toBe("default");
    expect(body.output_config).toEqual({ effort: "low" });
    expect(body.system[0]).toMatchObject({ text: "STABIL", cache_control: { type: "ephemeral" } });
    expect(body.system[1].text).toBe("DYNAMISK");
    expect(body.thinking).toBeUndefined();
    expect(f.headers[0]!["anthropic-beta"]).toContain("server-side-fallback-2026-07-01");
    expect(f.headers[0]!["x-api-key"]).toBe("sk-test-dummy");
  });

  it("refusal og max_tokens kartlegges", async () => {
    const f = await fake(sse(stream(["x"], "refusal")));
    const p = new AnthropicProvider(testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: f.url }));
    const r = await p.streamChat({ systemStable: "", systemDynamic: "", messages: [{ role: "user", content: "x" }], signal: new AbortController().signal }, () => {});
    expect(r.stop).toBe("refusal");
  });

  it("avbrytelse stopper strømmen og gir ProviderError(aborted)", async () => {
    const f = await fake(sse(stream(Array.from({ length: 50 }, (_, i) => `${i} `)), 30));
    const p = new AnthropicProvider(testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: f.url }));
    const ac = new AbortController();
    const got: string[] = [];
    await expect(
      p.streamChat({ systemStable: "", systemDynamic: "", messages: [{ role: "user", content: "x" }], signal: ac.signal }, (t) => {
        got.push(t);
        if (got.length === 3) ac.abort();
      }),
    ).rejects.toMatchObject({ kind: "aborted" });
    expect(got.length).toBeLessThan(10);
  });

  it("HTTP-feil kartlegges til forståelige kategorier", async () => {
    server = http.createServer((_req, res) => {
      res.writeHead(429, { "content-type": "application/json" });
      res.end(JSON.stringify({ type: "error", error: { type: "rate_limit_error", message: "slow down" } }));
    });
    await new Promise<void>((r) => server!.listen(0, "127.0.0.1", r));
    const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    const p = new AnthropicProvider(testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: url }));
    await expect(
      p.streamChat({ systemStable: "", systemDynamic: "", messages: [{ role: "user", content: "x" }], signal: new AbortController().signal }, () => {}),
    ).rejects.toMatchObject({ kind: "rate_limited" });
  });

  it("MODEL_FALLBACKS=off sender ikke fallback-parametre", async () => {
    const f = await fake(sse(stream(["ok"])));
    const p = new AnthropicProvider(testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "k", ANTHROPIC_BASE_URL: f.url, MODEL_FALLBACKS: "off" }));
    await p.streamChat({ systemStable: "", systemDynamic: "", messages: [{ role: "user", content: "x" }], signal: new AbortController().signal }, () => {});
    expect(f.bodies[0].fallbacks).toBeUndefined();
  });

  it("tomme verdier fra .env.example tolkes som ikke satt", () => {
    const cfg = testConfig({ ANTHROPIC_BASE_URL: "", APPLE_BUNDLE_ID: "" });
    expect(cfg.ANTHROPIC_BASE_URL).toBeUndefined();
    expect(cfg.APPLE_BUNDLE_ID).toBeUndefined();
    expect(() => testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "" })).toThrow(/ANTHROPIC_API_KEY mangler/);
  });

  it("konfigurasjon nekter oppstart uten nøkkel, og mock i produksjon", () => {
    expect(() => testConfig({ MODEL_PROVIDER: "anthropic", ANTHROPIC_API_KEY: undefined as unknown as string })).toThrow(/ANTHROPIC_API_KEY mangler/);
    expect(() => testConfig({ NODE_ENV: "production" })).toThrow(/ikke tillatt i produksjon/);
  });
});
