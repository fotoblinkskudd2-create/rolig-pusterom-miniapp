// Kartleggingsmodell. Gevinst beregnes per AKTIVITET (ikke per prosess), slik at en aktivitet
// som inngår i flere prosesser bare telles én gang. Prosessvisning fordeler aktivitetens gevinst likt
// mellom prosessene den inngår i, så summen over prosesser = total.
export function valider(k) {
    const f = [];
    const ider = new Set(k.aktiviteter.map(a => a.id));
    for (const a of k.aktiviteter) {
        if (!(a.volumPerMnd >= 0))
            f.push(`${a.id}: volum må være ≥ 0`);
        if (!(a.minutterPerStk >= 0))
            f.push(`${a.id}: tidsbruk må være ≥ 0`);
        if (!(a.feilrate >= 0 && a.feilrate <= 1))
            f.push(`${a.id}: feilrate må være mellom 0 og 1`);
    }
    for (const p of k.prosesser)
        for (const id of p.aktiviteter)
            if (!ider.has(id))
                f.push(`${p.id}: ukjent aktivitet ${id}`);
    for (const s of k.scenarier)
        if (!(s.tidsreduksjon >= 0 && s.tidsreduksjon <= 1 && s.feilreduksjon >= 0 && s.feilreduksjon <= 1))
            f.push(`scenario ${s.navn}: reduksjon må være 0–1`);
    return f;
}
export function beregn(k) {
    const f = valider(k);
    if (f.length)
        throw new Error(f.join("; "));
    return k.scenarier.map(s => {
        const akt = k.aktiviteter.map(a => {
            const prosesser = k.prosesser.filter(p => p.aktiviteter.includes(a.id));
            // Timesats: snitt av prosessene aktiviteten inngår i (eksplisitt regel; like satser i demo)
            const sats = prosesser.length ? prosesser.reduce((x, p) => x + p.timesats, 0) / prosesser.length : 0;
            const faktor = k.datatilgangsfaktor[a.datatilgang];
            const timerUtforelse = a.volumPerMnd * a.minutterPerStk / 60;
            const timerFeil = a.volumPerMnd * a.feilrate * a.minutterPerFeil / 60;
            const spart = (timerUtforelse * s.tidsreduksjon + timerFeil * s.feilreduksjon) * faktor;
            return { id: a.id, navn: a.navn, prosesser: prosesser.map(p => p.id), timerIDag: timerUtforelse + timerFeil, spartTimer: spart, spartKr: spart * sats, faktor };
        });
        const prosesser = k.prosesser.map(p => {
            let t = 0, kr = 0;
            for (const a of akt)
                if (a.prosesser.includes(p.id)) {
                    t += a.spartTimer / a.prosesser.length;
                    kr += a.spartKr / a.prosesser.length;
                }
            return { id: p.id, navn: p.navn, spartTimer: t, spartKr: kr };
        });
        return { scenario: s.navn, aktiviteter: akt, prosesser,
            totalTimerIDag: akt.reduce((x, a) => x + a.timerIDag, 0),
            totalSpartTimer: akt.reduce((x, a) => x + a.spartTimer, 0), totalSpartKr: akt.reduce((x, a) => x + a.spartKr, 0),
            status: k.malt ? "målt" : "hypotese" };
    });
}
/** Naiv prosessvis summering (det modellen IKKE gjør) – brukes i kontroll for å vise dobbelttelling. */
export function naivProsessum(k, s) {
    const r = beregn(k)[s];
    return k.prosesser.reduce((x, p) => x + r.aktiviteter.filter(a => p.aktiviteter.includes(a.id)).reduce((y, a) => y + a.spartTimer, 0), 0);
}
export function lagPilot(k, prosessId, varighetUker = 4) {
    const p = k.prosesser.find(x => x.id === prosessId);
    if (!p)
        throw new Error("ukjent prosess " + prosessId);
    const r = beregn(k);
    const verdi = (n) => r.find(x => x.scenario === n).prosesser.find(x => x.id === prosessId).spartTimer;
    const akt = k.aktiviteter.filter(a => p.aktiviteter.includes(a.id));
    const baseline = r[0].aktiviteter.filter(a => p.aktiviteter.includes(a.id)).reduce((x, a) => x + a.timerIDag / a.prosesser.length, 0);
    return {
        prosessId, varighetUker, baselineTimerPerMnd: baseline,
        maling: [
            `Uke 1–2 før endring: registrer start/slutt per utførelse for ${akt.map(a => a.navn).join(", ")} (minutter, antall, feil).`,
            `Uke 3–${varighetUker + 2} med endring: samme registrering med samme skjema og samme personer.`,
            "Rapporter median minutter per utførelse, antall feil per 100 og volum separat; volumendring holdes adskilt fra tidsendring.",
        ],
        forventetOutput: `Målt tidsbruk per utførelse før/etter for prosessen «${p.navn}», og en oppdatert gevinstberegning der hypotesen erstattes av målte verdier.`,
        stoppkriterium: `Stopp piloten hvis feilraten øker med mer enn 2 prosentpoeng, hvis median tid per utførelse ikke er redusert etter ${varighetUker} uker, eller hvis datatilgangen viser seg å kreve manuell overføring.`,
        hypoteseSpartTimer: { lav: verdi("lav"), middels: verdi("middels"), høy: verdi("høy") },
    };
}
export function scenarioCsv(k) {
    const r = beregn(k);
    const linjer = ["scenario;status;aktivitet;prosesser;timer_i_dag_per_mnd;spart_timer_per_mnd;spart_kr_per_mnd"];
    for (const s of r)
        for (const a of s.aktiviteter)
            linjer.push([s.scenario, s.status, a.navn, a.prosesser.join("+"), a.timerIDag.toFixed(2), a.spartTimer.toFixed(2), a.spartKr.toFixed(0)].join(";"));
    for (const s of r)
        linjer.push([s.scenario, s.status, "TOTAL (unike aktiviteter)", "", s.totalTimerIDag.toFixed(2), s.totalSpartTimer.toFixed(2), s.totalSpartKr.toFixed(0)].join(";"));
    return linjer.join("\n") + "\n";
}
