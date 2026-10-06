import { afterEach, describe, expect, it } from "vitest";
import { ProviderError } from "../src/model/provider.js";
import { Client, doneMessage, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

// Klientsiden (utkast bevares i appen) testes i ios/AntipsykologenTests.
// Her: serveren bevarer brukerens melding og gir forståelige feil.
describe("10. Nettverksfeil gir forståelig feilmelding og mister ikke brukerens tekst", () => {
  for (const [kind, pattern] of [
    ["network", /Fikk ikke kontakt/],
    ["rate_limited", /overbelastet/],
    ["overloaded", /svarer ikke/],
    ["auth", /feilkonfigurert/],
  ] as const) {
    it(`modellfeil «${kind}» → failed + norsk melding, brukermelding lagret`, async () => {
      s = await startServer({ mock: { failWith: new ProviderError(kind, "x") } });
      const c = await Client.anonymous(s.url);
      const conv = await c.newConversation();
      const r = await c.send(conv, "Dette må ikke forsvinne");
      const err = r.events.find((e) => e.event === "error")!;
      expect(err.data.message).toMatch(pattern);
      expect(err.data.retryable).toBe(true);
      expect(doneMessage(r.events).status).toBe("failed");
      const msgs = (await c.req("GET", `/v1/conversations/${conv}`)).json.messages;
      expect(msgs[0]).toMatchObject({ role: "user", content: "Dette må ikke forsvinne" });
    });
  }

  it("feilet svar tas ikke med i senere kontekst, og nytt forsøk virker", async () => {
    s = await startServer({ mock: { failWith: new ProviderError("network", "x") } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const id = crypto.randomUUID();
    await c.send(conv, "Hei", { clientMessageId: id });
    s.mock.opts = { reply: () => ["Nå virker det."] };
    const retry = await c.send(conv, "Hei", { clientMessageId: id });
    expect(doneMessage(retry.events).status).toBe("completed");
    const turns = s.mock.chatRequests.at(-1)!.messages;
    expect(turns).toEqual([{ role: "user", content: "Hei" }]);
  });

  it("valideringsfeil og grenser er forståelige", async () => {
    s = await startServer({ cfg: { MAX_MESSAGE_CHARS: "20", RATE_LIMIT_MESSAGES_PER_MINUTE: "2" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation();
    const long = await c.send(conv, "x".repeat(21));
    expect(long.status).toBe(413);
    expect(long.json.error.message).toMatch(/for lang. Maks 20 tegn/);
    const empty = await c.send(conv, "   ");
    expect(empty.status).toBe(400);
    await c.send(conv, "en");
    await c.send(conv, "to");
    const third = await c.send(conv, "tre");
    expect(third.status).toBe(429);
    expect(third.json.error.message).toMatch(/Vent et minutt/);
  });

  it("dagskvote og kostnadstak stopper modellkall", async () => {
    s = await startServer({ cfg: { DAILY_TOKEN_LIMIT_PER_USER: "100" } });
    const c = await Client.anonymous(s.url);
    await s.db.query(
      "INSERT INTO usage_daily (user_id, day, input_tokens, output_tokens) VALUES ($1, (now() AT TIME ZONE 'UTC')::date, 90, 20)",
      [c.userId],
    );
    const conv = await c.newConversation();
    const r = await c.send(conv, "Hei");
    expect(r.status).toBe(429);
    expect(r.json.error.code).toBe("daily_limit");
    expect(s.mock.chatRequests).toHaveLength(0);

    await s.db.query("UPDATE usage_daily SET input_tokens = 0, output_tokens = 0, cost_micro_usd = 6000000");
    const r2 = await c.send(conv, "Hei");
    expect(r2.json.error.code).toBe("monthly_limit");
  });

  it("ugyldig JSON gir generell feil uten å speile innholdet", async () => {
    s = await startServer();
    const c = await Client.anonymous(s.url);
    const res = await fetch(`${s.url}/v1/conversations`, {
      method: "POST",
      headers: { authorization: `Bearer ${c.token}`, "content-type": "application/json" },
      body: "{hemmelig tekst",
    });
    expect(res.status).toBe(400);
    expect(await res.text()).not.toContain("hemmelig");
  });
});
