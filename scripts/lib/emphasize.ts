// 2+ consecutive uppercase letters/digits (optionally hyphen/asterisk-joined, e.g. DSM-5,
// STAR*D, ICD-11) is a near-zero-false-positive signal for a clinically-loaded abbreviation in
// normal prose — real English sentences don't shout acronym-length runs of capitals by accident.
const ACRONYM_RE = /\b[A-Z][A-Z0-9]{1,}(?:[-*][A-Z0-9]+)*\b/g;

// Drug-formulation suffixes (slow/extended/controlled/immediate-release, long-acting) that only
// ever appear glued to a drug name we already bold (e.g. "bupropion SR") — bolding them as a
// second, separate span right next to the drug name is noise, not emphasis.
const RELEASE_SUFFIXES = new Set(["SR", "XR", "CR", "ER", "IR", "LA", "XL"]);

// A few real irregular-case acronyms confirmed present in the corpus (mixed case by the source's
// own styling, so the all-caps regex above won't catch them).
const IRREGULAR_ACRONYMS = ["CUtLASS", "InterSePT", "MOSPAD-C"];

// Curated, not exhaustive — psychiatric drug names actually likely to appear across these
// topics. Case-insensitive whole-word match; the ORIGINAL casing in the text is preserved.
const DRUG_NAMES = [
  "fluoxetine", "sertraline", "paroxetine", "citalopram", "escitalopram", "fluvoxamine",
  "venlafaxine", "duloxetine", "amitriptyline", "clomipramine", "imipramine", "nortriptyline",
  "dosulepin", "doxepin", "lofepramine", "phenelzine", "tranylcypromine", "moclobemide",
  "isocarboxazid", "mirtazapine", "trazodone", "bupropion", "agomelatine", "vortioxetine",
  "reboxetine", "nefazodone", "haloperidol", "chlorpromazine", "flupentixol", "fluphenazine",
  "zuclopenthixol", "pipotiazine", "sulpiride", "trifluoperazine", "perphenazine", "olanzapine",
  "risperidone", "quetiapine", "aripiprazole", "clozapine", "amisulpride", "paliperidone",
  "ziprasidone", "lurasidone", "cariprazine", "asenapine", "lithium", "valproate",
  "carbamazepine", "lamotrigine", "oxcarbazepine", "diazepam", "lorazepam", "clonazepam",
  "alprazolam", "temazepam", "chlordiazepoxide", "methadone", "buprenorphine", "naltrexone",
  "nalmefene", "disulfiram", "acamprosate", "varenicline", "donepezil", "rivastigmine",
  "galantamine", "memantine", "methylphenidate", "atomoxetine", "lisdexamfetamine",
  "dexamfetamine", "guanfacine", "clonidine", "gabapentin", "pregabalin", "topiramate",
  "vigabatrin", "phenytoin", "propranolol", "atenolol", "ketamine", "esketamine", "hydroxyzine",
  "promethazine", "zopiclone", "zolpidem", "melatonin", "sildenafil", "tadalafil", "modafinil",
  "kava", "hypericum", "d-cycloserine", "tiagabine", "buspirone", "pramipexole", "ropinirole",
  "rotigotine", "levodopa", "nitrazepam", "oxazepam", "clobazam", "mianserin", "divalproex",
  "flumazenil", "naloxone", "acetylcysteine", "thiamine",
];
const DRUG_RE = new RegExp(
  `\\b(${DRUG_NAMES.map((d) => d.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
  "gi"
);

function alreadyBolded(text: string, index: number): boolean {
  const starsBefore = (text.slice(0, index).match(/\*\*/g) ?? []).length;
  return starsBefore % 2 === 1;
}

// Highlight = a separate, narrower signal from bold: reserved for the specific numeric facts a
// student needs to recall exactly (a percentage, a prevalence ratio), not general emphasis. Both
// patterns are unambiguous on their own (a percentage is always a percentage) so this carries
// none of the false-positive risk that made broad inline number-highlighting a bad idea earlier —
// see CLAUDE.md "Study guide emphasis markup" for why this is bounded rather than reintroducing
// that. Percentages: "70%", "12.5%". Ratios: "1 in 5", "1 in 100".
const PERCENT_RE = /\b\d+(?:\.\d+)?\s?%/g;
const RATIO_RE = /\b\d+\s+in\s+\d{1,4}\b/gi;

function alreadyMarked(text: string, index: number): boolean {
  const starsBefore = (text.slice(0, index).match(/\*\*/g) ?? []).length;
  const eqBefore = (text.slice(0, index).match(/==/g) ?? []).length;
  return starsBefore % 2 === 1 || eqBefore % 2 === 1;
}

/**
 * A separate, narrower pass from `emphasize()` — wraps percentages/ratios in `==highlight==`.
 * Deliberately NOT folded into `emphasize()`/called from it: `emphasize()`'s acronym/drug bold
 * pass is not idempotent (re-running it on already-**bolded** text double-wraps into
 * `****OR****` garbage — confirmed empirically before shipping this), so re-running the combined
 * function against the already-emphasized `content/study-guides/*.json` would corrupt existing
 * markup. This pass alone IS idempotent (checks `alreadyMarked` for both `**` and `==`), so it's
 * safe to run standalone against already-processed content — see
 * `scripts/highlight-study-guides.ts`.
 */
export function highlightKeyFacts(text: string): string {
  const spans: Array<{ start: number; end: number }> = [];
  for (const re of [PERCENT_RE, RATIO_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) spans.push({ start: m.index, end: m.index + m[0].length });
  }
  spans.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const s of spans) {
    if (merged.length && s.start < merged[merged.length - 1].end) continue;
    if (alreadyMarked(text, s.start)) continue;
    merged.push(s);
  }
  let result = "";
  let cursor = 0;
  for (const { start, end } of merged) {
    result += text.slice(cursor, start) + "==" + text.slice(start, end) + "==";
    cursor = end;
  }
  result += text.slice(cursor);
  return result;
}

/**
 * Adds ** markdown-bold ** around clinically-loaded abbreviations (acronym-shape: 2+ consecutive
 * uppercase letters/digits) and a curated list of drug names, leaving everything else untouched.
 * This is the mechanical half of the study-guide emphasis pass — see CLAUDE.md.
 */
export function emphasize(text: string): string {
  if (!text) return text;
  let result = "";
  let cursor = 0;

  const spans: Array<{ start: number; end: number }> = [];
  for (const token of IRREGULAR_ACRONYMS) {
    const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) spans.push({ start: m.index, end: m.index + m[0].length });
  }
  let m: RegExpExecArray | null;
  ACRONYM_RE.lastIndex = 0;
  while ((m = ACRONYM_RE.exec(text))) {
    if (RELEASE_SUFFIXES.has(m[0])) continue;
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  spans.sort((a, b) => a.start - b.start);
  const merged: Array<{ start: number; end: number }> = [];
  for (const s of spans) {
    if (merged.length && s.start < merged[merged.length - 1].end) continue;
    merged.push(s);
  }
  for (const { start, end } of merged) {
    result += text.slice(cursor, start) + "**" + text.slice(start, end) + "**";
    cursor = end;
  }
  result += text.slice(cursor);

  DRUG_RE.lastIndex = 0;
  let out = "";
  cursor = 0;
  while ((m = DRUG_RE.exec(result))) {
    if (alreadyBolded(result, m.index)) continue;
    out += result.slice(cursor, m.index) + "**" + m[0] + "**";
    cursor = m.index + m[0].length;
  }
  out += result.slice(cursor);
  return out;
}
