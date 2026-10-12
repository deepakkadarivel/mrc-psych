import fs from "node:fs";
import path from "node:path";
import { AREAS, type AreaId } from "../../lib/paper-a-areas";

/**
 * Paper A source map. Everything here is derived from the actual folder/file names under
 * `resources/paper-a/` — which section PDF pairs with which question bank is decided by the file
 * names matching (e.g. "ADVERSE DRUG EFFECTS.pdf" <-> "Adverse effects Attempt review.pdf"), never
 * by guessing what a bank "covers". Anything without a name match is its own quiz set.
 */

export const PAPER_A_ROOT = path.join(process.cwd(), "resources/paper-a");
export const PAPER_A_CONTENT = path.join(process.cwd(), "content/paper-a");

/** User-supplied: first given as 2024-04-07 (already past), corrected by the user to 2027-04-07 on 2026-10-12. */
export const PAPER_A_EXAM_DATE = "2027-04-07";

const HY = "High yields";

export { AREAS };

export interface TopicDef {
  id: string;
  title: string;
  area: AreaId;
  section: string; // file name inside SECTIONS_DIR
  banks: string[]; // paths relative to resources/paper-a
  /** Section PDFs laid out in two text columns need reading-order extraction, not -layout. */
  twoColumn?: boolean;
  gap?: string;
}

export const TOPICS: TopicDef[] = [
  { id: "pa-classification", title: "Classification", area: "assessment", section: "CLASSIFICATION.pdf",
    banks: [`${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /Classification Attempt review.pdf`] },
  { id: "pa-clinical-examination", title: "Clinical Examination", area: "assessment", section: "CLINICAL EXAMINATION.pdf",
    banks: [`${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /Clinical Examination Attempt review.pdf`] },
  { id: "pa-descriptive-psychopathology", title: "Descriptive Psychopathology", area: "assessment", section: "DESCRIPTIVE PSYCHOPATHOLOGY.pdf",
    banks: [`${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /5) Descriptive Psychopathology Attempt review.pdf`] },
  { id: "pa-dynamic-psychopathology", title: "Dynamic Psychopathology", area: "assessment", section: "DYNAMIC PSYCHOPATHOLOGY.pdf",
    banks: [`${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /6) Dynamic Psychopathology Attempt review.pdf`] },
  { id: "pa-rating-scales", title: "Rating Scales", area: "assessment", section: "RATING SCALES.pdf",
    banks: [`${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /Rating Scales Attempt review.pdf`] },
  { id: "pa-syndromes", title: "Syndromes", area: "assessment", section: "SYNDROMES.pdf", twoColumn: true, banks: [],
    gap: "No question bank for this section in resources/paper-a/." },
  { id: "pa-applied-neurosciences", title: "Applied Neurosciences", area: "neuroscience", section: "APPLIED NEUROSCIENCES.pdf",
    banks: [`${HY}/NUEROSCIENCES/Applied Neurosciences Attempt review.pdf`] },
  { id: "pa-neuroanatomy", title: "Neuroanatomy", area: "neuroscience", section: "NEUROANATOMY.pdf",
    banks: [`${HY}/NUEROSCIENCES/Neuroanatomy Attempt review.pdf`] },
  { id: "pa-neurochemistry", title: "Neurochemistry", area: "neuroscience", section: "NEUROCHEMISTRY.pdf",
    banks: [`${HY}/NUEROSCIENCES/Neurochemistry Attempt review.pdf`] },
  { id: "pa-neuropathology", title: "Neuropathology", area: "neuroscience", section: "NEUROPATHOLOGY.pdf",
    banks: [`${HY}/NUEROSCIENCES/Neuropathology Attempt review.pdf`] },
  { id: "pa-neurophysiology", title: "Neurophysiology", area: "neuroscience", section: "NEUROPHYSIOLOGY.pdf",
    banks: [`${HY}/NUEROSCIENCES/Neurophysiology Attempt review.pdf`] },
  { id: "pa-basic-pharmacology", title: "Basic Pharmacology", area: "pharmacology", section: "BASIC PHARMACOLOGY.pdf",
    banks: [`${HY}/PHARMACOLOGY /Basic Pharmacology Attempt review.pdf`] },
  { id: "pa-pharmacokinetics", title: "Pharmacokinetics", area: "pharmacology", section: "PHARMACOKINETICS.pdf",
    banks: [`${HY}/PHARMACOLOGY /Pharmacokinetics Attempt review.pdf`] },
  { id: "pa-pharmacodynamics", title: "Pharmacodynamics", area: "pharmacology", section: "PHARMACODYNAMICS.pdf",
    banks: [`${HY}/PHARMACOLOGY /Pharmadynamics Attempt review (1).pdf`] },
  { id: "pa-adverse-drug-effects", title: "Adverse Drug Effects", area: "pharmacology", section: "ADVERSE DRUG EFFECTS.pdf",
    banks: [`${HY}/PHARMACOLOGY /Adverse effects Attempt review.pdf`] },
  { id: "pa-basic-psychology", title: "Basic Psychology", area: "psychology", section: "BASIC PSYCHOLOGY.pdf",
    banks: [`${HY}/PSYCHOLOGY/7) Basic Psychology Attempt review.pdf`] },
  { id: "pa-social-psychology", title: "Social Psychology", area: "psychology", section: "SOCIAL PSYCHOLOGY.pdf",
    banks: [`${HY}/PSYCHOLOGY/8) Social Psychology Attempt review.pdf`] },
  { id: "pa-sociocultural-psychiatry", title: "Sociocultural Psychiatry", area: "psychology", section: "SOCIOCULTURAL PSYCHIATRY.pdf",
    banks: [`${HY}/PSYCHOLOGY/9) Sociocultural Psychiatry Attempt review.pdf`] },
  { id: "pa-human-development", title: "Human Development", area: "psychology", section: "HUMAN DEVELOPMENT.pdf", banks: [],
    gap: "No standalone question bank; see the \"EMIs Development\" quiz set." },
  { id: "pa-molecular-genetics", title: "Molecular Genetics", area: "genetics", section: "MOLECULAR GENETICS.pdf",
    banks: [`${HY}/GENETICS /Molecular Genetics Attempt review.pdf`] },
];

export interface SetDef {
  id: string;
  title: string;
  group: "emi" | "high-yield" | "practice";
  file: string; // relative to resources/paper-a
}

/** Canonical EMI banks: the "EMIS all chapters" folder. Same-named copies in the topic folders are
 *  checked for question-level duplication and dropped (recorded in skippedFiles). */
const EMI = `${HY}/EMIS all chapters `;
export const SETS: SetDef[] = [
  { id: "pa-emi-classification", title: "EMIs — Classification", group: "emi", file: `${EMI}/EMIs Classification.pdf` },
  { id: "pa-emi-clinical-examination", title: "EMIs — Clinical Examination", group: "emi", file: `${EMI}/EMIs Clinical Examination.pdf` },
  { id: "pa-emi-development", title: "EMIs — Development", group: "emi", file: `${EMI}/EMIs Development Attempt review.pdf` },
  { id: "pa-emi-neuroscience-1", title: "EMIs — Neuroscience Part 1", group: "emi", file: `${EMI}/EMIs Neuroscience Part 1 Attempt review.pdf` },
  { id: "pa-emi-neuroscience-2", title: "EMIs — Neuroscience Part 2", group: "emi", file: `${EMI}/EMIs Neuroscience Part 2 Attempt review.pdf` },
  { id: "pa-emi-pharmacology-1", title: "EMIs — Pharmacology Part 1", group: "emi", file: `${EMI}/EMIs Pharmacology Part 1 Attempt review.pdf` },
  { id: "pa-emi-pharmacology-2", title: "EMIs — Pharmacology Part 2", group: "emi", file: `${EMI}/EMIs Pharmacology Part 2 Attempt review.pdf` },
  { id: "pa-emi-psychology", title: "EMIs — Psychology", group: "emi", file: `${EMI}/EMIs Psychology Attempt review.pdf` },
  { id: "pa-advanced-neuroscience-2018", title: "Advanced Neuroscience (Dec 2018)", group: "high-yield",
    file: `${HY}/NUEROSCIENCES/Advanced Neuroscience NEW December 2018 Attempt review.pdf` },
  { id: "pa-icd11-2021", title: "ICD-11 New Questions (2021)", group: "high-yield",
    file: `${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /NEW ICD-11 New Questions 2021 Attempt review.pdf` },
  // Practice sets. Order matters for question-level dedup: the fuller export of a set comes first,
  // so its "-1"/partial twin only contributes questions the fuller one lacks.
  { id: "pa-practice-2016", title: "Practice Questions 2016 (Set 1) — file a", group: "practice", file: "Practice questions/ Practice Questions 2016 .pdf" },
  { id: "pa-practice-2016-b", title: "Practice Questions 2016 (Set 1) — file b", group: "practice", file: "Practice questions/Practice Questions 2016 -1.pdf" },
  { id: "pa-practice-2017", title: "Practice Questions 2017 (Set 2) — file a", group: "practice", file: "Practice questions/ Practice Questions 2017 .pdf" },
  { id: "pa-practice-2017-b", title: "Practice Questions 2017 (Set 2) — file b", group: "practice", file: "Practice questions/Practice Questions 2017-1.pdf" },
  { id: "pa-practice-2018", title: "Practice Questions 2018 (Set 3) — file a", group: "practice", file: "Practice questions/ Practice Questions 2018 .pdf" },
  { id: "pa-practice-2018-b", title: "Practice Questions 2018 (Set 3) — file b", group: "practice", file: "Practice questions/Practice Questions 2018 -1.pdf" },
  { id: "pa-practice-2019", title: "Practice Questions 2019 (Set 4) — file a", group: "practice", file: "Practice questions/ Practice Questions 2019 .pdf" },
  { id: "pa-practice-2019-b", title: "Practice Questions 2019 (Set 4) — file b", group: "practice", file: "Practice questions/Practice Questions 2019 1.pdf" },
  { id: "pa-practice-2020", title: "Practice Questions 2020 (Set 5) — file a", group: "practice", file: "Practice questions/Practice Questions 2020.pdf" },
  { id: "pa-practice-2020-b", title: "Practice Questions 2020 (Set 5) — file b", group: "practice", file: "Practice questions/Practice Questions 2020 -1.pdf" },
  { id: "pa-practice-2020-21", title: "Practice Questions 2020–2021 (Set 6) — file a", group: "practice", file: "Practice questions/ Practice Questions (2020-2021) .pdf" },
  { id: "pa-practice-2020-21-b", title: "Practice Questions 2020–2021 (Set 6) — file b", group: "practice", file: "Practice questions/Practice Questions .pdf" },
  { id: "pa-practice-2023", title: "Practice Questions 2023", group: "practice", file: "Practice questions/Practice Questions 2023 .pdf" },
  { id: "pa-practice-2024", title: "Practice Questions 2024 (Set 10)", group: "practice", file: "Practice questions/Practice Questions 2024 pdf.pdf" },
];

/** Topic-folder copies of EMI banks that also live in "EMIS all chapters" (md5 differs, content is
 *  checked at question level), and an exact byte-for-byte duplicate. */
export const DUPLICATE_CANDIDATES: Array<{ file: string; of: string }> = [
  { file: `${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /EMIs Classification.pdf`, of: "pa-emi-classification" },
  { file: `${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /EMIs Clinical Examination.pdf`, of: "pa-emi-clinical-examination" },
  { file: `${HY}/NUEROSCIENCES/EMIs Neuroscience Part 1 Attempt review.pdf`, of: "pa-emi-neuroscience-1" },
  { file: `${HY}/NUEROSCIENCES/EMIs Neuroscience Part 2 Attempt review.pdf`, of: "pa-emi-neuroscience-2" },
  { file: `${HY}/PHARMACOLOGY /EMIs Pharmacology Part 1 Attempt review.pdf`, of: "pa-emi-pharmacology-1" },
  { file: `${HY}/PHARMACOLOGY /EMIs Pharmacology Part 2 Attempt review.pdf`, of: "pa-emi-pharmacology-2" },
  { file: `${HY}/PSYCHOLOGY/EMIs Psychology Attempt review.pdf`, of: "pa-emi-psychology" },
  { file: `${HY}/CLASSIFICATION AND CLINICAL EXAMINATION /Rating Scales Attempt review(0).pdf`, of: "pa-rating-scales" },
];

export interface MockDef {
  id: string;
  title: string;
  file: string;
}
export const MOCKS: MockDef[] = [
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => ({
    id: `pa-mock-1-${n}`,
    title: `Paper A Mock (1) — Test ${n}`,
    file: n === 7 ? "Paper A mocks/Paper A(1) Test 7 .pdf" : `Paper A mocks/Paper A(1) Test ${n}.pdf`,
  })),
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    id: `pa-mock-2-${n}`,
    title: `Paper A Mock (2) — Test ${n}`,
    file: `Paper A mocks/Paper A(2) Test ${n}.pdf`,
  })),
];

/** Files deliberately not parsed, each with the reason shown in the manifest. */
export const SKIPPED: Array<{ file: string; reason: string }> = [
  {
    file: "Practice questions/ Practice Questions combined.pdf",
    reason:
      "Image-only scan (104 pages, no text layer) and no OCR tool available.",
  },
  {
    file: "Practice questions/Fresh Questions for June 2016.pdf",
    reason:
      "A forum-style recall post (EMI themes with answer keys typed inline), not the Moodle attempt-review format — same treatment as Paper B's recall files: not parsed into Question[].",
  },
];

/** Public/citation path: "paper-a/" + each segment trimmed (several folders/files carry stray leading
 *  or trailing spaces that make URLs fragile). `Source.file` always uses this form. */
export function sourcePath(rel: string): string {
  return "paper-a/" + rel.split("/").map((s) => s.trim().replace(/\s+/g, " ")).join("/");
}

/** Map a sanitized `paper-a/...` source path back to the real file under resources/. */
export function realPathForSource(source: string): string | null {
  const wanted = source.replace(/^paper-a\//, "");
  const walk = (dir: string, relSan: string): string | null => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const san = (relSan ? relSan + "/" : "") + e.name.trim().replace(/\s+/g, " ");
      if (e.isDirectory()) {
        if (wanted.startsWith(san + "/")) return walk(path.join(dir, e.name), san);
      } else if (san === wanted) return path.join(dir, e.name);
    }
    return null;
  };
  return walk(PAPER_A_ROOT, "");
}
