import { e2e } from "../felles/e2e.mjs";
import { spawn } from "node:child_process";
const HER = new URL(".", import.meta.url).pathname;
const ts = spawn("python3", ["testserver.py", "8917"], { cwd: HER, stdio: "ignore" });
process.on("exit", () => ts.kill());
await new Promise(r => setTimeout(r, 800));
const modus = m => fetch("http://127.0.0.1:8917/modus/" + m);
try {
  await e2e("017 Driftsvakt", HER, { server: ["python3", "app.py", "--db", HER + "resultat/e2e.db", "--port", "8717"], url: "http://127.0.0.1:8717/", port: 8717 },
    async ({ page, sjekk, url }) => {
      await page.goto(url); await page.waitForSelector("#utfall");
      sjekk("frisk server vises som ok", (await page.innerText("#utfall")) === "ok");
      await modus("feilende"); await page.click("#runde"); await page.click("#runde");
      await page.waitForFunction(() => document.body.innerText.includes("Åpen hendelse"));
      sjekk("to feil i UI åpner hendelse", true);
      await modus("frisk"); await page.click("#runde");
      await page.waitForFunction(() => document.body.innerText.includes("Ingen åpen hendelse"));
      sjekk("gjenoppretting lukker hendelsen i UI", true);
      await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
    });
} finally { ts.kill(); }
