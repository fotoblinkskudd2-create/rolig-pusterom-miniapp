const DAG = 864e5;
const tilDato = (s) => { const d = Date.parse(s + "T00:00:00Z"); if (isNaN(d))
    throw new Error("ugyldig dato " + s); return d; };
const iso = (t) => new Date(t).toISOString().slice(0, 10);
export function valider(m) {
    const f = [];
    if (new Date(tilDato(m.startdato)).getUTCDay() !== 1)
        f.push("startdato må være en mandag");
    if (!Number.isInteger(m.inngaaendeSaldo))
        f.push("inngående saldo må være hele kroner");
    const ider = new Set();
    for (const p of m.poster) {
        if (ider.has(p.id))
            f.push("duplisert post-id " + p.id);
        ider.add(p.id);
        if (!Number.isInteger(p.belop))
            f.push(`${p.id}: beløp må være hele kroner`);
        if (isNaN(Date.parse(p.dato)))
            f.push(`${p.id}: ugyldig dato`);
    }
    return f;
}
export function ukeNr(m, dato) {
    const n = Math.floor((tilDato(dato) - tilDato(m.startdato)) / (7 * DAG)) + 1;
    return n >= 1 && n <= m.uker ? n : null;
}
export function beregn(m) {
    const f = valider(m);
    if (f.length)
        throw new Error(f.join("; "));
    const s0 = tilDato(m.startdato);
    const uker = [];
    let saldo = m.inngaaendeSaldo;
    const utenfor = m.poster.filter(p => ukeNr(m, p.dato) === null);
    for (let n = 1; n <= m.uker; n++) {
        const ps = m.poster.filter(p => ukeNr(m, p.dato) === n);
        const sum = (inn, s) => ps.filter(p => (p.belop > 0) === inn && p.sikkerhet === s).reduce((x, p) => x + Math.abs(p.belop), 0);
        const u = { nr: n, fra: iso(s0 + (n - 1) * 7 * DAG), til: iso(s0 + (n * 7 - 1) * DAG), inngaaende: saldo,
            innRegistrert: sum(true, "registrert"), innAntatt: sum(true, "antatt"), utRegistrert: sum(false, "registrert"), utAntatt: sum(false, "antatt"),
            netto: 0, utgaaende: 0, negativ: false, poster: ps.map(p => p.id) };
        u.netto = u.innRegistrert + u.innAntatt - u.utRegistrert - u.utAntatt;
        u.utgaaende = u.inngaaende + u.netto;
        u.negativ = u.utgaaende < 0;
        saldo = u.utgaaende;
        uker.push(u);
    }
    const iHorisont = m.poster.filter(p => ukeNr(m, p.dato) !== null);
    const sumPoster = iHorisont.reduce((x, p) => x + p.belop, 0);
    const laveste = uker.reduce((a, u) => u.utgaaende < a.saldo ? { saldo: u.utgaaende, uke: u.nr } : a, { saldo: m.inngaaendeSaldo, uke: 0 });
    const avstemt = uker.every((u, i) => (i === 0 ? u.inngaaende === m.inngaaendeSaldo : u.inngaaende === uker[i - 1].utgaaende)) && saldo === m.inngaaendeSaldo + sumPoster;
    return { uker, laveste, utenforHorisont: utenfor, sumPoster, sluttsaldo: saldo, avstemt };
}
/** Flytter én post et antall uker (eller til ny dato). Totalbeløpet i modellen er uendret. */
export function flytt(m, id, antallUker) {
    const n = JSON.parse(JSON.stringify(m));
    const p = n.poster.find(x => x.id === id);
    if (!p)
        throw new Error("ukjent post " + id);
    p.dato = iso(tilDato(p.dato) + antallUker * 7 * DAG);
    return n;
}
export function scenario(m, navn, endringer) {
    let n = JSON.parse(JSON.stringify(m));
    n.navn = navn;
    for (const f of endringer.flytt || [])
        n = flytt(n, f.id, f.uker);
    n.poster.push(...(endringer.leggTil || []).map(p => ({ ...p })));
    n.forutsetninger = [...n.forutsetninger, ...(endringer.forutsetninger || [])];
    return n;
}
export function sammenlign(a, b) {
    const ra = beregn(a), rb = beregn(b);
    return ra.uker.map((u, i) => ({ uke: u.nr, a: u.utgaaende, b: rb.uker[i].utgaaende, diff: rb.uker[i].utgaaende - u.utgaaende }));
}
export function csv(m) {
    const r = beregn(m);
    return ["uke;fra;til;inngaaende;inn_registrert;inn_antatt;ut_registrert;ut_antatt;netto;utgaaende;negativ",
        ...r.uker.map(u => [u.nr, u.fra, u.til, u.inngaaende, u.innRegistrert, u.innAntatt, u.utRegistrert, u.utAntatt, u.netto, u.utgaaende, u.negativ ? "JA" : ""].join(";"))].join("\n") + "\n";
}
