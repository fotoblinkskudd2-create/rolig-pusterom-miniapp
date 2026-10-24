// Prosjektmargin (samme definisjoner som oppdrag 6): refusjon inngår verken i inntekt eller kostnad.
export function beregn(input) {
  return input.prosjekter.map(p => {
    const direkte = p.kostnader.filter(k => k.type !== "refusjon").reduce((s, k) => s + k.belop, 0);
    const refusjon = p.kostnader.filter(k => k.type === "refusjon").reduce((s, k) => s + k.belop, 0);
    const db = p.pris - direkte;
    const eff = p.timer > 0 ? db / p.timer : null;
    const varsler = [];
    if (eff !== null && eff < input.minTimeinntekt) varsler.push(`effektiv timeinntekt ${Math.round(eff)} kr/t under ${input.minTimeinntekt}`);
    if (p.estimertTimer && p.timer > p.estimertTimer) varsler.push(`${Math.round((p.timer / p.estimertTimer - 1) * 100)} % over timeestimat`);
    return { ...p, direkte, refusjon, db, eff, varsler };
  });
}
