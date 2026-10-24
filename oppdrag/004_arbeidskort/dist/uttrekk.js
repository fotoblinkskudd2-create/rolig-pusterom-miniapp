const SITATMARKOR = [/^>/m, /^(Den|On) .{4,160}\b(skrev|wrote)\b.{0,120}:\s*$/m, /^-{2,}\s*(Opprinnelig melding|Original Message|Videresendt melding|Forwarded message)\s*-{2,}/im, /^Fra: .+\n(Sendt|Dato|Date): /m];
export function finnSitatStart(t) {
    let min = t.length;
    for (const r of SITATMARKOR) {
        const m = r.exec(t);
        if (m && m.index < min)
            min = m.index;
    }
    return min;
}
const UKEDAGER = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
const iso = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
const gyldig = (y, m, d) => { const x = new Date(Date.UTC(y, m - 1, d)); return x.getUTCMonth() === m - 1 && x.getUTCDate() === d ? x : null; };
export function finnDatoer(t, start, slutt, ref) {
    const del = t.slice(start, slutt);
    const ut = [];
    const legg = (m, f) => ut.push({ ...f, kilde: "tekst", span: [start + m.index, start + m.index + m[0].length] });
    let m;
    const r1 = /\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/g;
    while ((m = r1.exec(del))) {
        const d = +m[1], mn = +m[2];
        let y = m[3] ? +m[3] : null;
        if (y !== null && y < 100)
            y += 2000;
        const år = y ?? (ref ? ref.getUTCFullYear() : null);
        if (m[0].includes("/") && d <= 12 && mn <= 12 && d !== mn) {
            const a = år ? gyldig(år, mn, d) : null, b = år ? gyldig(år, d, mn) : null;
            legg(m, { verdi: a ? iso(a) : "", sikkerhet: "tvetydig", merknad: `«${m[0]}» kan være ${d}. ${MND[mn - 1]} eller ${mn}. ${MND[d - 1]}; norsk dag/måned antatt${y === null ? ", år fra e-postens dato" : ""}` });
            continue;
        }
        if (år === null) {
            legg(m, { verdi: "", sikkerhet: "usikker", merknad: `«${m[0]}» mangler år og e-posten har ingen dato` });
            continue;
        }
        const x = gyldig(år, mn, d);
        if (!x) {
            legg(m, { verdi: "", sikkerhet: "usikker", merknad: `«${m[0]}» er ikke en gyldig dato` });
            continue;
        }
        legg(m, { verdi: iso(x), sikkerhet: y === null ? "utledet" : "sikker", merknad: y === null ? "år hentet fra e-postens dato" : undefined });
    }
    const r2 = new RegExp(`\\b(\\d{1,2})\\.\\s*(${MND.join("|")})(?:\\s+(\\d{4}))?`, "gi");
    while ((m = r2.exec(del))) {
        const y = m[3] ? +m[3] : ref ? ref.getUTCFullYear() : null;
        const x = y ? gyldig(y, MND.indexOf(m[2].toLowerCase()) + 1, +m[1]) : null;
        legg(m, { verdi: x ? iso(x) : "", sikkerhet: m[3] ? "sikker" : x ? "utledet" : "usikker", merknad: m[3] ? undefined : "år hentet fra e-postens dato" });
    }
    const r3 = new RegExp(`\\b(innen|før|til|på|neste)\\s+(${UKEDAGER.join("|")})\\b`, "gi");
    while ((m = r3.exec(del))) {
        if (!ref) {
            legg(m, { verdi: "", sikkerhet: "usikker", merknad: "relativ dato uten referansedato" });
            continue;
        }
        const mål = UKEDAGER.indexOf(m[2].toLowerCase());
        let dager = (mål - ref.getUTCDay() + 7) % 7 || 7;
        const x = new Date(ref.getTime() + dager * 864e5);
        legg(m, { verdi: iso(x), sikkerhet: "tvetydig", merknad: `relativ («${m[0]}») regnet fra e-postens dato ${iso(ref)}; kan bety denne eller neste uke` });
    }
    return ut.sort((a, b) => a.span[0] - b.span[0]);
}
function forste(t, r, start, slutt) {
    const m = r.exec(t.slice(start, slutt));
    return m ? [m[1] ?? m[0], [start + m.index + (m[1] ? m[0].indexOf(m[1]) : 0), start + m.index + (m[1] ? m[0].indexOf(m[1]) + m[1].length : m[0].length)]] : null;
}
const INSTRUKS = /\b(ignorer|ignore|glem)\b.{0,40}\b(instruks|instruksjoner|instructions|regler)\b|\b(send|videresend)\b.{0,30}\b(e-?post|mail|sms)\b.{0,30}\btil\b|\b(slett|delete|kjør|execute|run)\b.{0,20}\b(alle|kommando|command|script|fil)/i;
export function lagKort(id, kilde, epost) {
    const t = epost.tekst;
    const ny = finnSitatStart(t);
    const ref = epost.dato ? new Date(Date.parse(epost.dato)) : null;
    const refGyldig = ref && !isNaN(ref.getTime()) ? ref : null;
    const felt = {};
    const e = forste(t, /[\w.+-]+@[\w-]+(\.[\w-]+)+/, 0, ny);
    if (e)
        felt.epost = { verdi: e[0], kilde: "tekst", span: e[1], sikkerhet: "sikker" };
    else if (epost.fra) {
        const fm = epost.fra.match(/[\w.+-]+@[\w-]+(\.[\w-]+)+/);
        if (fm)
            felt.epost = { verdi: fm[0], kilde: "hode", sikkerhet: "sikker", merknad: "fra e-posthodet (From)" };
    }
    const tlf = forste(t, /(?:\+47\s?)?\b(\d{3}\s?\d{2}\s?\d{3}|\d{2}\s\d{2}\s\d{2}\s\d{2}|\d{8})\b/, 0, ny);
    if (tlf)
        felt.telefon = { verdi: tlf[0].replace(/\s/g, ""), kilde: "tekst", span: tlf[1], sikkerhet: "sikker" };
    const navn = forste(t, /(?:hilsen|mvh|vennlig hilsen|med vennlig hilsen)[,!]?\s*\n\s*([A-ZÆØÅ][\wæøåÆØÅ-]+(?: [A-ZÆØÅ][\wæøåÆØÅ-]+){0,3})/i, 0, ny);
    if (navn)
        felt.navn = { verdi: navn[0].trim(), kilde: "tekst", span: navn[1], sikkerhet: "sikker" };
    else if (epost.fra) {
        const n = epost.fra.replace(/<.*>/, "").replace(/"/g, "").trim();
        if (n && !n.includes("@"))
            felt.navn = { verdi: n, kilde: "hode", sikkerhet: "usikker", merknad: "visningsnavn i From-feltet" };
    }
    // Unicode-bevisste ordgrenser: \b virker ikke rundt æøå i JavaScript.
    const jobb = forste(t, /([^.\n!?]*(?<!\p{L})(trenger|ønsker|vil ha|lurer på om|kan dere|bytte|skifte|reparere|montere|installere|legge|male)(?!\p{L})[^.\n!?]*[.!?]?)/iu, 0, ny);
    if (jobb)
        felt.jobb = { verdi: jobb[0].trim(), kilde: "tekst", span: [jobb[1][0] + (jobb[0].length - jobb[0].trimStart().length), jobb[1][1]], sikkerhet: "usikker", merknad: "første setning som beskriver et ønske – kontroller" };
    const sted = forste(t, /([A-ZÆØÅ][\wæøå]*(?:veien|vegen|gata|gate|vei|veg|plass|bakken|stien)\s+\d+[A-Za-z]?(?:,?\s*\d{4}\s+[A-ZÆØÅ][\wæøå]+)?)/, 0, ny)
        ?? forste(t, /\b(\d{4}\s+[A-ZÆØÅ][\wæøå]+)\b/, 0, ny);
    if (sted)
        felt.sted = { verdi: sted[0], kilde: "tekst", span: sted[1], sikkerhet: /\d{4}/.test(sted[0]) ? "sikker" : "usikker" };
    const datoer = finnDatoer(t, 0, ny, refGyldig);
    const fristOrd = datoer.find(d => /innen|før|frist|senest|til/i.test(t.slice(Math.max(0, d.span[0] - 25), d.span[0]))) ?? datoer[0];
    if (fristOrd)
        felt.frist = fristOrd;
    const vedlegg = (epost.vedlegg || []).map((v) => ({ filnavn: `${v.filnavn} (${v.type}, ${v.bytes} B)`, kilde: "vedlegg" }));
    const vr = /[\p{L}\p{N}_-]+\.(jpe?g|png|heic|pdf|docx?)(?!\p{L})/giu;
    let m;
    while ((m = vr.exec(t.slice(0, ny))))
        if (!vedlegg.some(v => v.filnavn.startsWith(m[0])))
            vedlegg.push({ filnavn: m[0] + " (nevnt i tekst)", kilde: "tekst", span: [m.index, m.index + m[0].length] });
    const advarsler = [];
    if (ny < t.length)
        advarsler.push(`sitert historikk fra tegn ${ny} er vist, men ikke brukt i uttrekket`);
    if (INSTRUKS.test(t))
        advarsler.push("teksten inneholder instruksjonslignende formuleringer; de er behandlet som vanlig tekst og har ikke utløst noe");
    if (datoer.length > 1 && new Set(datoer.map(d => d.verdi)).size > 1)
        advarsler.push(`flere datoer i henvendelsen (${datoer.map(d => t.slice(d.span[0], d.span[1])).join(", ")}) – kontroller frist`);
    for (const f of Object.values(felt))
        if (f && (f.sikkerhet === "tvetydig" || f.sikkerhet === "usikker") && f.merknad)
            advarsler.push(f.merknad);
    const kort = { id, kilde, mottatt: refGyldig ? refGyldig.toISOString() : "", tekst: t, nyDelSlutt: ny, felt, fristKandidater: datoer, vedlegg, mangler: [], advarsler, status: "utkast", rettelser: [] };
    kort.mangler = mangler(kort);
    return kort;
}
export function mangler(k) {
    const m = [];
    if (!k.felt.navn?.verdi)
        m.push("navn");
    if (!k.felt.epost?.verdi && !k.felt.telefon?.verdi)
        m.push("kontaktinformasjon (e-post eller telefon)");
    if (!k.felt.jobb?.verdi)
        m.push("beskrivelse av ønsket jobb");
    if (!k.felt.sted?.verdi)
        m.push("sted/adresse");
    if (!k.felt.frist?.verdi)
        m.push("frist/ønsket tidspunkt");
    return m;
}
export function rett(k, navn, verdi, tid) {
    const n = JSON.parse(JSON.stringify(k));
    n.rettelser.push({ felt: navn, fra: k.felt[navn]?.verdi ?? null, til: verdi, tid });
    n.felt[navn] = { verdi, kilde: "bruker", sikkerhet: "sikker", merknad: "rettet av bruker" };
    n.mangler = mangler(n);
    n.status = "utkast";
    return n;
}
export function godkjenn(k) {
    if (!k.felt.jobb?.verdi || (!k.felt.epost?.verdi && !k.felt.telefon?.verdi))
        throw new Error("kan ikke godkjenne uten jobbeskrivelse og minst én kontaktvei");
    return { ...JSON.parse(JSON.stringify(k)), status: "godkjent" };
}
export function eksport(k) {
    if (k.status !== "godkjent")
        throw new Error("bare godkjente kort eksporteres");
    const felt = Object.fromEntries(Object.entries(k.felt).map(([n, f]) => [n, { verdi: f.verdi, kilde: f.kilde, sikkerhet: f.sikkerhet, kildetekst: f.span ? k.tekst.slice(f.span[0], f.span[1]) : null, merknad: f.merknad ?? null }]));
    return { format: "arbeidskort/v1", id: k.id, kilde: k.kilde, mottatt: k.mottatt, status: k.status, felt, vedlegg: k.vedlegg.map(v => v.filnavn), mangler: k.mangler, advarsler: k.advarsler, rettelser: k.rettelser };
}
