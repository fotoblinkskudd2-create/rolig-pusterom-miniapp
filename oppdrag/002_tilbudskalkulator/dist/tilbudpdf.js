import { Pdf } from "../../felles/web/pdf.js";
import { beregn, kroner, linjepriser } from "./kalkyle.js";
export function tilbudPdf(t) {
    const r = beregn(t);
    const pdf = new Pdf({ tittel: `Tilbud ${t.id} v${t.versjon}` });
    let s = pdf.side();
    s.tekst(20, 22, `Tilbud ${t.id} – versjon ${t.versjon}`, { str: 16, font: "fet" });
    s.tekst(20, 30, t.tittel, { str: 11 });
    s.tekst(20, 40, `Kunde: ${t.kunde.navn}`).tekst(20, 45, t.kunde.adresse).tekst(20, 50, `Kontakt: ${t.kunde.kontakt}`);
    s.tekst(130, 40, `Dato: ${t.opprettet}`).tekst(130, 45, `Prisgrunnlag: ${t.pris.id} (${t.pris.dato})`).tekst(130, 50, `Gyldig i ${t.gyldigDager} dager`);
    let y = 62;
    const priser = linjepriser(r);
    s.tekst(20, y, "Post", { font: "fet" }).tekst(140, y, "Mengde", { font: "fet", hoyre: true }).tekst(190, y, "Pris eks. avgift", { font: "fet", hoyre: true });
    s.linje(20, y + 2, 190, y + 2);
    y += 8;
    for (const [i, l] of r.linjer.entries()) {
        if (y > 260) {
            s = pdf.side();
            y = 20;
        }
        s.tekst(20, y, l.beskrivelse.slice(0, 48));
        s.tekst(140, y, `${l.mengde} ${l.enhet}`, { font: "mono", hoyre: true });
        s.tekst(190, y, kroner(priser[i]), { font: "mono", hoyre: true });
        y += 6;
    }
    s.linje(20, y - 2, 190, y - 2);
    y += 4;
    const sum = (navn, ore, fet = false) => { s.tekst(110, y, navn, { font: fet ? "fet" : "normal" }); s.tekst(190, y, kroner(ore), { font: "mono", hoyre: true }); y += 6; };
    sum("Sum eks. " + t.avgift.navn, r.salgEksAvgiftOre);
    sum(`${t.avgift.navn} ${t.avgift.prosent} %`, r.avgiftOre);
    sum("Totalt å betale", r.totalOre, true);
    y += 6;
    s.tekst(20, y, `Beløp i NOK. Linjepris inkluderer materialer, ${r.timer} arbeidstimer og påslag fordelt etter kost.`, { str: 8 });
    s.tekst(20, y + 5, "Demonstrasjonstilbud med oppdiktede satser. Ikke sendt.", { str: 8 });
    return pdf.bytes();
}
