import { e2e } from "../felles/e2e.mjs";
const HER = new URL(".", import.meta.url).pathname;
await e2e("008 Kundeoppstart", HER, { server: ["python3", "app.py", "--demo", "--data", HER + "resultat/e2e_data", "--port", "8708"], url: "http://127.0.0.1:8708/", port: 8708 },
  async ({ page, sjekk, url }) => {
    const varsler = []; page.on("dialog", d => { varsler.push(d.message()); d.accept(); });
    await page.goto(url); await page.waitForSelector("#blokkerer");
    sjekk("to mangler blokkerer", (await page.locator("#blokkerer li").count()) === 2);
    await page.click("#ferdigstill"); await page.waitForTimeout(300);
    sjekk("ferdigstilling avvises med melding", varsler.some(v => v.includes("kan ikke ferdigstille")));
    await page.setInputFiles('[data-fil="D4"]', HER + "resultat/testfiler/kontakter.docx"); await page.waitForTimeout(300);
    sjekk("feil filtype gir avvisning i UI", varsler.some(v => v.includes(".docx")));
    await page.setInputFiles('[data-fil="D4"]', HER + "resultat/testfiler/kontakter.pdf");
    await page.waitForSelector('[data-godkjenn="D4"]'); await page.click('[data-godkjenn="D4"]');
    await page.setInputFiles('[data-fil="D6"]', HER + "resultat/testfiler/samsvar.pdf");
    await page.waitForSelector('[data-godkjenn="D6"]'); await page.click('[data-godkjenn="D6"]');
    await page.waitForFunction(() => !document.querySelector("#blokkerer"));
    await page.click("#ferdigstill");
    await page.waitForSelector("#pakke");
    sjekk("sak ferdigstilt", (await page.innerText("#sakstatus")) === "ferdigstilt");
    const r = await page.request.get(url + "api/saker/KS-2026-014/overlevering.zip");
    sjekk("overleveringspakke lastes ned", r.ok() && (await r.body()).slice(0, 2).toString() === "PK");
    await page.screenshot({ path: HER + "resultat/skjermbilde.png", fullPage: true });
  });
