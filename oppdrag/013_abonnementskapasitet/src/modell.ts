// Kapasitet → abonnementsinntekt. Måned for måned, forventningsverdier (brøkdeler av kunder er tillatt).
// Rekkefølge hver måned: 1) frafall av aktive ved månedsstart, 2) support for gjenværende aktive,
// 3) oppstart av nye kunder innenfor gjenværende timer (resten venter i kø), 4) nye kunder blir aktive fra neste måned.
// Oppstartsinntekt er engangsinntekt og holdes UTENFOR MRR/ARR.

export interface Pakke { navn: string; abonnementPerMnd: number; oppstartspris: number; oppstartTimer: number; supportTimerPerKundeMnd: number }
export interface Scenario {
  navn: string; maneder: number; startKunder: number;
  salgsmalNyePerMnd: number[];      // ønsket salg per måned (antakelse); kortere liste gjentar siste verdi
  frafallPerMnd: number;            // andel av aktive, 0–1 (antakelse)
  kapasitetTimerPerMnd: number[];   // tilgjengelige leveransetimer; kortere liste gjentar siste verdi
  pakker: Pakke[]; antakelser: string[];
}
export interface Maned { mnd: number; aktiveStart: number; frafall: number; aktive: number; onsketNye: number; startetNye: number; ko: number; supportTimer: number; oppstartTimer: number; brukteTimer: number; kapasitet: number; behovTimer: number; overKapasitet: boolean; mrr: number; arr: number; oppstartsinntekt: number }
export interface PakkeResultat { pakke: string; maneder: Maned[]; forsteOverskridelse: number | null; sumAbonnement: number; sumOppstart: number; arrSlutt: number }

const hent = (a: number[], i: number) => a.length ? a[Math.min(i, a.length - 1)] : 0;

export function valider(s: Scenario): string[] {
  const f: string[] = [];
  if (!(s.frafallPerMnd >= 0 && s.frafallPerMnd <= 1)) f.push("frafall må være 0–1");
  if (s.maneder < 1 || s.maneder > 60) f.push("1–60 måneder");
  if (s.salgsmalNyePerMnd.some(x => x < 0) || s.kapasitetTimerPerMnd.some(x => x < 0) || s.startKunder < 0) f.push("negative tall er ikke tillatt");
  for (const p of s.pakker) if ([p.abonnementPerMnd, p.oppstartspris, p.oppstartTimer, p.supportTimerPerKundeMnd].some(x => !(x >= 0))) f.push(`pakke ${p.navn}: ugyldige tall`);
  return f;
}

export function beregnPakke(s: Scenario, p: Pakke): PakkeResultat {
  const f = valider(s); if (f.length) throw new Error(f.join("; "));
  let aktive = s.startKunder, ko = 0, venter = 0; const maneder: Maned[] = [];
  for (let i = 0; i < s.maneder; i++) {
    const aktiveStart = aktive + venter; venter = 0;          // kunder startet forrige måned blir aktive nå
    const frafall = aktiveStart * s.frafallPerMnd;
    aktive = aktiveStart - frafall;
    const kapasitet = hent(s.kapasitetTimerPerMnd, i);
    const supportTimer = aktive * p.supportTimerPerKundeMnd;
    const onsketNye = hent(s.salgsmalNyePerMnd, i);
    const kandidater = ko + onsketNye;
    const igjen = Math.max(0, kapasitet - supportTimer);
    const startetNye = p.oppstartTimer > 0 ? Math.min(kandidater, igjen / p.oppstartTimer) : kandidater;
    ko = kandidater - startetNye; venter = startetNye;
    const oppstartTimer = startetNye * p.oppstartTimer;
    const behovTimer = supportTimer + kandidater * p.oppstartTimer;
    const mrr = aktive * p.abonnementPerMnd;
    maneder.push({ mnd: i + 1, aktiveStart, frafall, aktive, onsketNye, startetNye, ko, supportTimer, oppstartTimer, brukteTimer: supportTimer + oppstartTimer, kapasitet, behovTimer,
      overKapasitet: behovTimer > kapasitet + 1e-9, mrr, arr: mrr * 12, oppstartsinntekt: startetNye * p.oppstartspris });
  }
  const forste = maneder.find(m => m.overKapasitet);
  return { pakke: p.navn, maneder, forsteOverskridelse: forste ? forste.mnd : null,
    sumAbonnement: maneder.reduce((x, m) => x + m.mrr, 0), sumOppstart: maneder.reduce((x, m) => x + m.oppstartsinntekt, 0), arrSlutt: maneder[maneder.length - 1].arr };
}

export const beregn = (s: Scenario) => s.pakker.map(p => beregnPakke(s, p));

/** ARR ved slutt for kombinasjoner av frafall og pris (multiplikator). */
export function sensitivitet(s: Scenario, pakke: string, frafall: number[], prisfaktor: number[]) {
  const p = s.pakker.find(x => x.navn === pakke); if (!p) throw new Error("ukjent pakke");
  return frafall.map(fr => ({ frafall: fr, arr: prisfaktor.map(pf => beregnPakke({ ...s, frafallPerMnd: fr }, { ...p, abonnementPerMnd: p.abonnementPerMnd * pf }).arrSlutt) }));
}
