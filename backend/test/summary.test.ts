import { afterEach, describe, expect, it } from "vitest";
import { Client, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

describe("lange tråder sammendras strukturert", () => {
  it("sammendrag lages over budsjett, gamle meldinger byttes ut, siste beholdes", async () => {
    s = await startServer({
      mock: {
        reply: () => ["Kort svar."],
        summary: () => ({
          userFacts: ["Brukeren har en hund"],
          goals: ["Trene mer"],
          agreedActions: ["Gå tur tirsdag"],
          corrections: [],
          openQuestions: ["Hvem passer hunden?"],
          hypotheses: ["Brukeren unngår treningssenteret av skam"],
        }),
      },
      cfg: { CONTEXT_BUDGET_TOKENS: "200", CONTEXT_KEEP_RECENT_MESSAGES: "4", RATE_LIMIT_MESSAGES_PER_MINUTE: "100" },
    });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("utsettelse");
    for (let i = 0; i < 8; i++) await c.send(conv, `Melding nummer ${i}: ` + "bla ".repeat(60));
    const sum = s.mock.structuredRequests.filter((r) => r.kind === "summary");
    expect(sum.length).toBeGreaterThan(0);
    // Sammendragsinput skiller bruker og assistent, så hypoteser ikke blir fakta.
    expect(sum[0]!.req.user).toContain("BRUKER:");
    expect(sum[0]!.req.user).toContain("ANTIPSYKOLOGEN:");
    const last = s.mock.chatRequests.at(-1)!;
    expect(last.systemDynamic).toContain("<sammendrag>");
    expect(last.systemDynamic).toContain("USIKRE hypoteser");
    expect(last.systemDynamic).toMatch(/USIKRE hypoteser[^\n]*:\n- Brukeren unngår treningssenteret av skam/);
    expect(last.messages.some((m) => m.content.includes("Melding nummer 0"))).toBe(false);
    expect(last.messages.at(-1)!.content).toContain("Melding nummer 7");
    expect(last.messages[0]!.role).toBe("user");
  });
});
