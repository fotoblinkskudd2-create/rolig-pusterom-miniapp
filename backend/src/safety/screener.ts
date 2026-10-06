import type { SafetyCategory, SafetyLevel } from "../model/provider.js";

/**
 * Lokal, deterministisk første vurdering av faresignaler i norsk tekst.
 *
 * Dette er IKKE en feilfri fareoppdager. Den ser etter mønstre og justerer for
 * kontekst (benektelse, sitat/medier, tredjeperson, fortid, faste uttrykk og
 * umiddelbarhet). Resultatet kombineres med en modellbasert vurdering i
 * assess.ts, og systeminstruksen ber modellen selv være oppmerksom.
 *
 * Utdata inneholder bare mønster-ID-er, aldri brukerens tekst.
 */

export interface ScreenResult {
  level: SafetyLevel;
  categories: SafetyCategory[];
  signals: string[];
}

interface Rule {
  id: string;
  category: SafetyCategory;
  re: RegExp;
  /** Grunnnivå før kontekstjustering. */
  base: Exclude<SafetyLevel, "none">;
}

const W = "[a-zæøå]+";

// JavaScripts \b regner æ, ø og å som ikke-bokstaver. Vi bytter til en
// Unicode-bevisst ordgrense og \w til \p{L}.
const UB = "(?:(?<![\\p{L}\\p{N}])(?=[\\p{L}\\p{N}])|(?<=[\\p{L}\\p{N}])(?![\\p{L}\\p{N}]))";
function U(re: RegExp | string): RegExp {
  const src = typeof re === "string" ? re : re.source;
  return new RegExp(src.replaceAll("\\b", UB).replaceAll("\\w", "\\p{L}"), "u");
}
const PARTNER = "(?:han|hun|partneren|kjæresten|mannen|kona|samboeren|eksen|faren|moren|pappa|mamma)(?: min| mi| mitt)?";
const HIT_VERBS = "(?:slår|slo|har slått|dytter|dyttet|kveler|kvelte|sparker|sparket|lugger|lugget|klyper|kløp|truer|truet|voldtok|voldtar)";

const RAW_RULES: Rule[] = [
  // Selvskading / selvmord, førsteperson
  { id: "sh_take_life", category: "self_harm", base: "concern", re: /\bta(?:r)? livet (?:av meg|mitt)\b/ },
  { id: "sh_kill_self", category: "self_harm", base: "concern", re: /\b(?:drepe|dreper) meg selv\b/ },
  { id: "sh_suicide", category: "self_harm", base: "concern", re: /\bselvmord\w*|\bsuicid\w*/ },
  { id: "sh_want_die", category: "self_harm", base: "concern", re: /\b(?:vil|ønsker å|har lyst til å|skulle ønske jeg kunne) (?:bare )?(?:dø|slutte å leve|ikke våkne)\b/ },
  { id: "sh_not_live", category: "self_harm", base: "concern", re: /\b(?:orker|vil|klarer) ikke (?:å )?leve\b|\bingen vits (?:i )?å leve\b|\bikke verdt å leve\b/ },
  { id: "sh_selfinjury", category: "self_harm", base: "concern", re: /\b(?:kutte|kutter|kuttet|skade|skader|skadet) meg selv\b|\bselvskad\w*/ },
  { id: "sh_end_it", category: "self_harm", base: "concern", re: /\bavslutte (?:det hele|livet|alt)\b|\bgjøre slutt på (?:meg selv|livet)\b/ },
  { id: "sh_overdose", category: "self_harm", base: "concern", re: /\boverdose\b|\btatt? alle pillene\b/ },
  { id: "sh_hang", category: "self_harm", base: "concern", re: /\bhenge meg\b/ },
  { id: "sh_better_gone", category: "self_harm", base: "uncertain", re: /\b(?:alle|de|verden) (?:hadde hatt det|har det) bedre uten meg\b|\bforsvinne for (?:alltid|godt)\b/ },
  { id: "sh_cant_take", category: "self_harm", base: "uncertain", re: /\borker ikke mer\b|\bklarer ikke mer\b/ },

  // Vold mot brukeren / tvang
  { id: "vv_partner_hits", category: "violence_victim", base: "concern",
    re: new RegExp(`\\b${PARTNER} (?:${W} )?${HIT_VERBS}\\b`) },
  // Norsk V2-ordstilling: «I går slo han meg», «Da truet samboeren meg».
  { id: "vv_partner_hits_v2", category: "violence_victim", base: "concern",
    re: new RegExp(`\\b${HIT_VERBS} ${PARTNER} (?:meg|oss|ungene|barna)\\b`) },
  { id: "vv_was_hit", category: "violence_victim", base: "concern", re: /\bjeg (?:ble|blir|har blitt) (?:slått|kvalt|kvelt|truet|voldtatt|banket|dyttet|sparket|tvunget)\b/ },
  { id: "vv_afraid_of", category: "violence_victim", base: "concern", re: /\b(?:redd|livredd|skremt) for (?:ham|henne|han|hun|partneren|mannen|kona|samboeren|eksen|kjæresten)\b/ },
  { id: "vv_threat_kill", category: "violence_victim", base: "concern", re: /\btru(?:er|et|a) med å (?:drepe|skade|slå|ta) (?:meg|ungene|barna)\b/ },
  { id: "vv_quoted_threat", category: "violence_victim", base: "concern", re: /\b(?:jeg|vi) (?:dreper|skal drepe|kommer til å drepe|skal skade) (?:deg|dere)\b/ },
  { id: "co_control", category: "coercion", base: "concern", re: /\b(?:låser meg inne|låste meg inne|tar (?:fra meg )?telefonen min|får ikke lov til å (?:gå ut|møte|treffe)|kontrollerer (?:alt|pengene mine|hvem jeg)|tvinger meg)\b/ },

  // Vold mot andre
  { id: "vo_kill_other", category: "violence_to_others", base: "concern",
    re: /\bjeg (?:skal|kommer til å|har lyst til å|vil|kunne(?:ha)?) (?:drepe|drept|skade|skadet|slå|slått|knivstikke) (?:ham|henne|han|hun|dem|noen|sjefen|naboen|partneren|mannen|kona)\b/ },

  // Akutt medisinsk
  { id: "med_took_pills", category: "acute_medical", base: "concern", re: /\b(?:har tatt|tok) (?:mange|alle|en haug med) (?:piller|tabletter)\b/ },
  { id: "med_cant_breathe", category: "acute_medical", base: "concern", re: /\bfår ikke puste\b|\bbrystsmerter\b/ },

  // Mindreårig i fare
  { id: "minor_child_hit", category: "minor_at_risk", base: "concern", re: /\b(?:slår|slo|truer) (?:barna|ungene|sønnen min|datteren min|barnet)\b/ },
];

const RULES: Rule[] = RAW_RULES.map((r) => ({ ...r, re: U(r.re) }));

// Faste uttrykk som ellers ville gitt falske treff.
const IDIOMS: RegExp[] = [
  /\b(?:dør|døde|døden) av (?:latter|kjedsomhet|skam|flauhet)\b/,
  /\b(?:dette|det|jobben|møtet|mandager?) (?:dreper|tar livet av) meg\b/,
  /\bdrep meg (?:nå|ass)\b/,
  /\bselvmordsoppdrag\b/,
].map(U);

const IMMEDIACY = U(/\b(?:i kveld|i natt|nå|akkurat nå|snart|i dag|om litt|straks|med en gang)\b/);
const MEANS = U(/\b(?:piller|tabletter|kniv|tau|bru|bro|broen|brua|våpen|pistol|gevær|hagle|tog(?:skinnene)?)\b/);
const PLAN = U(/\b(?:har bestemt meg|har planlagt|har en plan|har skrevet (?:et )?(?:avskjedsbrev|brev)|har samlet|sagt farvel)\b/);
const CURRENT_DANGER = U(/\b(?:står utenfor|er her nå|er på vei hit|banker på døra|har låst meg inne|holder meg fast)\b/);
const NEGATION = U(/\b(?:ikke|aldri|ingen|ikkje|heller ikke|null)\b/);
const MEDIA = U(/\b(?:film(?:en)?|serie(?:n)?|sang(?:en)?|bok(?:a|en)?|roman(?:en)?|episode(?:n)?|replikk(?:en)?|sitat(?:et)?|låt(?:en)?|podkast(?:en)?|dikt(?:et)?|spill(?:et)?|novelle(?:n)?)\b/);
const REPORTED = U(/\b(?:han|hun|de|partneren|mannen|kona|samboeren|eksen|sjefen) (?:sa|sier|skrev|skriver|ropte|sendte|truet)\b/);
const THIRD_PERSON_SH = U(/\b(?:venn(?:en|inna|innen)?|søster(?:en)?|bror(?:en)?|kollega(?:en)?|partneren|mannen|kona|samboeren|sønnen|datteren|moren|faren|mamma|pappa|han|hun) (?:min |mitt |mi )?(?:snakker om|har snakket om|vil|prøvde|har prøvd|truer med) (?:å )?(?:ta livet sitt|dø|selvmord|skade seg selv)\b/);
const PAST = U(/\b(?:for \d+ år siden|da jeg var|som ung|som tenåring|tidligere|for lenge siden|i fjor|en gang)\b/);
const HYPERBOLE = U(/\bkunne (?:ha )?drept\b|\bkunne (?:ha )?kvelt\b/);

const ORDER: SafetyLevel[] = ["none", "uncertain", "concern", "acute"];
export const maxLevel = (a: SafetyLevel, b: SafetyLevel): SafetyLevel =>
  ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b;
export const levelAtLeast = (a: SafetyLevel, b: SafetyLevel) => ORDER.indexOf(a) >= ORDER.indexOf(b);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”„"]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ");
}

/** Deler teksten i setninger slik at kontekstjustering skjer lokalt. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?\n])\s+/).filter((s) => s.trim().length > 0);
}

function insideQuotes(sentence: string, index: number): boolean {
  const before = sentence.slice(0, index);
  const guillemetOpen = (before.match(/«/g) ?? []).length > (before.match(/»/g) ?? []).length;
  const dq = (before.match(/"/g) ?? []).length % 2 === 1;
  return guillemetOpen || dq;
}

function negatedBefore(sentence: string, index: number): boolean {
  // Ser på de nærmeste ordene før treffet (innen samme leddsetning).
  const window = sentence.slice(Math.max(0, index - 40), index);
  const clause = window.split(/[,;:]| men | selv om /).pop() ?? window;
  return NEGATION.test(clause);
}

export function screen(text: string): ScreenResult {
  const norm = normalize(text);
  const signals = new Set<string>();
  const categories = new Set<SafetyCategory>();
  let level: SafetyLevel = "none";

  for (const sentence of sentences(norm)) {
    if (IDIOMS.some((re) => re.test(sentence))) {
      signals.add("idiom");
      // Fortsett: setningen kan inneholde annet enn idiomet.
    }
    const thirdPartySh = THIRD_PERSON_SH.test(sentence);
    if (thirdPartySh) {
      signals.add("third_party_self_harm");
      categories.add("self_harm_other_person");
      level = maxLevel(level, "concern");
    }

    for (const rule of RULES) {
      const m = rule.re.exec(sentence);
      if (!m) continue;
      // Treffet ligger inne i et fast uttrykk («mandager dreper meg»): ignorer.
      const mStart = m.index;
      const mEnd = m.index + m[0].length;
      const inIdiom = IDIOMS.some((re) => {
        const im = re.exec(sentence);
        return im !== null && im.index <= mStart && im.index + im[0].length >= mEnd - 1;
      });
      if (inIdiom) continue;
      if (thirdPartySh && rule.category === "self_harm") continue;

      let l: SafetyLevel = rule.base;
      const tags: string[] = [rule.id];

      const quoted = insideQuotes(sentence, m.index);
      const media = MEDIA.test(sentence);
      const reported = REPORTED.test(sentence);

      if (quoted && rule.id === "vv_quoted_threat") {
        // En sitert trussel rettet mot brukeren er et faresignal, ikke en formildende omstendighet.
        tags.push("quoted_threat");
      } else if (rule.id === "vv_quoted_threat" && !reported) {
        // «jeg dreper deg» uten sitat/rapportering: kan være brukerens egen trussel eller spøk.
        l = "uncertain";
        tags.push("unattributed_threat");
      } else if (quoted || media) {
        l = "uncertain";
        tags.push(media ? "media_reference" : "quoted");
      }

      if (negatedBefore(sentence, m.index) && rule.category !== "violence_victim" && rule.category !== "coercion") {
        // «Jeg har aldri tenkt å ta livet mitt» – ikke full sikkerhetsmodus,
        // men humor av og rolig oppfølging.
        l = "uncertain";
        tags.push("negated");
      }
      if (rule.id === "vo_kill_other" && HYPERBOLE.test(sentence)) {
        l = "uncertain";
        tags.push("hyperbole");
      }
      if (PAST.test(sentence) && l === "concern" && rule.category === "self_harm") {
        tags.push("past");
        // Tidligere forsøk er fortsatt relevant: behold «concern», men ikke akutt.
      } else if (l === "concern") {
        const acuteMarkers =
          (IMMEDIACY.test(sentence) ? 1 : 0) +
          (MEANS.test(sentence) ? 1 : 0) +
          (PLAN.test(sentence) ? 1 : 0) +
          (CURRENT_DANGER.test(sentence) ? 1 : 0);
        if (
          (rule.category === "self_harm" && acuteMarkers >= 1 && (MEANS.test(sentence) || PLAN.test(sentence) || IMMEDIACY.test(sentence))) ||
          (rule.category !== "self_harm" && CURRENT_DANGER.test(sentence)) ||
          rule.category === "acute_medical"
        ) {
          l = "acute";
          tags.push("acute_marker");
        }
      }

      tags.forEach((t) => signals.add(t));
      categories.add(rule.category);
      level = maxLevel(level, l);
    }

    // Akutt fare uten kategori-ord: «han står utenfor døra med kniv».
    if (CURRENT_DANGER.test(sentence) && MEANS.test(sentence) && !insideQuotes(sentence, 0)) {
      signals.add("current_danger_with_means");
      categories.add("violence_victim");
      level = maxLevel(level, "acute");
    }
  }

  return { level, categories: [...categories], signals: [...signals] };
}
