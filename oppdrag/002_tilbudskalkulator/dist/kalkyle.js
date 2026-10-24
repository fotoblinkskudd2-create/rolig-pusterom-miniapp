// Tilbudsmotor. Alle beløp regnes i hele øre (heltall) for å unngå flyttallsavvik.
// Avrunding: hver linjes material- og arbeidskost avrundes til nærmeste øre; summer er eksakte summer av linjer.
export function kopi(x) { return JSON.parse(JSON.stringify(x)); }
export function valider(t) {
    const feil = [];
    if (!(t.avgift && Number.isFinite(t.avgift.prosent) && t.avgift.prosent >= 0))
        feil.push("avgiftssats må oppgis eksplisitt (0 eller mer)");
    if (t.prismodell.type === "margin" && (t.prismodell.prosent < 0 || t.prismodell.prosent >= 100))
        feil.push("margin må være fra 0 til under 100 %");
    if (t.prismodell.type === "påslag" && t.prismodell.prosent < 0)
        feil.push("påslag kan ikke være negativt");
    for (const p of t.poster) {
        if (!(p.mengde >= 0))
            feil.push(`${p.id}: mengde må være 0 eller mer`);
        for (const m of p.materialer)
            if (!t.pris.materialer[m.kode])
                feil.push(`${p.id}: ukjent materialkode ${m.kode}`);
    }
    return feil;
}
export function beregn(t) {
    const feil = valider(t);
    if (feil.length)
        throw new Error(feil.join("; "));
    const linjer = t.poster.map(p => {
        const materialdetaljer = p.materialer.map(m => {
            const mat = t.pris.materialer[m.kode];
            const antall = p.mengde * m.perEnhet;
            return { kode: m.kode, navn: mat.navn, antall, enhet: mat.enhet, prisOre: mat.prisOre, sumOre: Math.round(antall * mat.prisOre) };
        });
        const materialOre = materialdetaljer.reduce((s, d) => s + d.sumOre, 0);
        const timer = p.mengde * p.timerPerEnhet;
        const arbeidOre = Math.round(timer * t.pris.timesatsOre);
        return { postId: p.id, beskrivelse: p.beskrivelse, mengde: p.mengde, enhet: p.enhet, materialOre, timer, arbeidOre, kostOre: materialOre + arbeidOre, materialdetaljer };
    });
    const materialOre = linjer.reduce((s, l) => s + l.materialOre, 0);
    const arbeidOre = linjer.reduce((s, l) => s + l.arbeidOre, 0);
    const timer = Math.round(linjer.reduce((s, l) => s + l.timer, 0) * 1e6) / 1e6;
    const kostOre = materialOre + arbeidOre;
    // Påslag regnes på kost: salg = kost × (1 + p). Margin regnes på salg: salg = kost / (1 − m).
    const salgEksAvgiftOre = t.prismodell.type === "påslag"
        ? Math.round(kostOre * (1 + t.prismodell.prosent / 100))
        : Math.round(kostOre / (1 - t.prismodell.prosent / 100));
    const dekningOre = salgEksAvgiftOre - kostOre;
    const avgiftOre = Math.round(salgEksAvgiftOre * t.avgift.prosent / 100);
    return {
        linjer, materialOre, arbeidOre, timer, kostOre, salgEksAvgiftOre, dekningOre,
        marginProsent: salgEksAvgiftOre ? (dekningOre / salgEksAvgiftOre) * 100 : 0,
        paaslagProsent: kostOre ? (dekningOre / kostOre) * 100 : 0,
        avgiftOre, totalOre: salgEksAvgiftOre + avgiftOre, prisversjon: t.pris.id,
    };
}
/** Ny prisversjon: kopi med endrede materialpriser. Gammel versjon endres ikke. */
export function nyPrisversjon(gammel, id, dato, endringer, timesatsOre) {
    const ny = kopi(gammel);
    ny.id = id;
    ny.dato = dato;
    for (const [kode, pris] of Object.entries(endringer)) {
        if (!ny.materialer[kode])
            throw new Error("ukjent materialkode " + kode);
        ny.materialer[kode].prisOre = pris;
    }
    if (timesatsOre !== undefined)
        ny.timesatsOre = timesatsOre;
    return ny;
}
/** Ny versjon av et tilbud. Uten nytt prisgrunnlag beholdes det gamle. */
export function nyVersjon(t, opprettet, pris) {
    const n = kopi(t);
    n.versjon = t.versjon + 1;
    n.opprettet = opprettet;
    if (pris)
        n.pris = kopi(pris);
    return n;
}
/** Fordeler salgspris eks. avgift på linjene proporsjonalt med kost (største rest), så linjesum = total eksakt. */
export function linjepriser(r) {
    if (r.kostOre === 0)
        return r.linjer.map(() => 0);
    const raa = r.linjer.map(l => (l.kostOre * r.salgEksAvgiftOre) / r.kostOre);
    const ned = raa.map(Math.floor);
    let rest = r.salgEksAvgiftOre - ned.reduce((a, b) => a + b, 0);
    const rekkefolge = raa.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    for (const [, i] of rekkefolge) {
        if (rest <= 0)
            break;
        ned[i]++;
        rest--;
    }
    return ned;
}
export function sammenlign(a, b) {
    const ra = beregn(a), rb = beregn(b);
    const felt = [["Materialer", "materialOre"], ["Arbeid", "arbeidOre"], ["Timer", "timer"], ["Kost", "kostOre"], ["Salg eks. avgift", "salgEksAvgiftOre"], ["Dekning", "dekningOre"], ["Avgift", "avgiftOre"], ["Total", "totalOre"]];
    const totaler = felt.map(([navn, k]) => ({ felt: navn, a: ra[k], b: rb[k], diff: rb[k] - ra[k] }));
    const ider = [...new Set([...ra.linjer.map(l => l.postId), ...rb.linjer.map(l => l.postId)])];
    const linjer = ider.map(id => {
        const la = ra.linjer.find(l => l.postId === id), lb = rb.linjer.find(l => l.postId === id);
        return { postId: id, beskrivelse: (lb || la).beskrivelse, kostA: la ? la.kostOre : null, kostB: lb ? lb.kostOre : null };
    });
    const prisendringer = Object.keys(b.pris.materialer).filter(k => a.pris.materialer[k] && a.pris.materialer[k].prisOre !== b.pris.materialer[k].prisOre)
        .map(k => ({ kode: k, a: a.pris.materialer[k].prisOre, b: b.pris.materialer[k].prisOre }));
    return { totaler, linjer, prisendringer, prisversjonA: a.pris.id, prisversjonB: b.pris.id };
}
export function kroner(ore) {
    const neg = ore < 0;
    const a = Math.abs(ore);
    const k = Math.floor(a / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return (neg ? "-" : "") + k + "," + String(a % 100).padStart(2, "0");
}
