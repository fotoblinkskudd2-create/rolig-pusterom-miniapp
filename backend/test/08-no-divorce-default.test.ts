import { afterEach, describe, expect, it } from "vitest";
import { SYSTEM_PROMPT } from "../src/conversation/prompt.js";
import { screen } from "../src/safety/screener.js";
import { Client, startServer, type TestServer } from "./helpers.js";

let s: TestServer;
afterEach(async () => s?.close());

// Modellens faktiske atferd testes i evals/ (kategori «samliv»). Her testes
// de deterministiske forutsetningene: instruksen, og at vanlig frustrasjon
// ikke utløser sikkerhetsmodus eller noen fast «gå fra ham»-tekst.
describe("8. Vanlig samlivsfrustrasjon gir ikke automatisk skilsmisseordre", () => {
  const ordinary = [
    "Han legger aldri inn oppvasken, og jeg er så lei av å mase.",
    "Vi krangler om hvem som skal hente i barnehagen.",
    "Hun er på telefonen hele kvelden og jeg føler meg usynlig.",
    "Vi har ikke hatt sex på tre måneder.",
  ];

  it("systeminstruksen forbyr skilsmisse som standard og legger beslutningen hos brukeren", () => {
    expect(SYSTEM_PROMPT).toContain("Ikke anbefal skilsmisse som standard");
    expect(SYSTEM_PROMPT).toContain("beslutningen tilhører brukeren");
  });

  for (const t of ordinary) {
    it(`ingen sikkerhetsmodus: ${t}`, () => expect(screen(t).level).toBe("none"));
  }

  it("vanlig frustrasjon sendes til modellen med parforhold-instruks, uten sikkerhetsmodus", async () => {
    s = await startServer({ mock: { reply: () => ["Hva har du sagt til ham om det?"] }, cfg: { SAFETY_MODEL_CHECK: "off" } });
    const c = await Client.anonymous(s.url);
    const conv = await c.newConversation("parforhold");
    const r = await c.send(conv, ordinary[0]!);
    expect(r.events.some((e) => e.event === "safety")).toBe(false);
    const req = s.mock.chatRequests.at(-1)!;
    expect(req.systemDynamic).toContain("Inngang: parforhold");
    expect(req.systemDynamic).not.toContain("SIKKERHETSMODUS");
    expect(req.systemStable).toBe(SYSTEM_PROMPT);
  });
});
