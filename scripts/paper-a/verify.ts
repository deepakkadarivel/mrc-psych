import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PAPER_A_CONTENT, TOPICS, realPathForSource } from "./config";
import { extractPdfPages } from "../lib/pdf-text";
import { extractPdfPagesReadingOrder } from "../lib/segment-section";
import type { NoteBlock, PaperAManifest, Question } from "../../lib/types";

/**
 * Mechanical checks over content/paper-a/ (same spirit as scripts/verify-question-answers.ts and
 * verify-study-guide-citations.ts for Paper B):
 *  - every Source.file resolves to a real PDF and every cited page exists in it
 *  - each question file's count equals the PDF's own count of "Question N" headers / Theme blocks,
 *    numbers run 1..N with no gap, no empty stems, every SBA correctAnswer is one of its options
 * A clean run does NOT prove the text is right — spot-check against the PDF page too.
 */
const manifest: PaperAManifest = JSON.parse(fs.readFileSync(path.join(PAPER_A_CONTENT, "manifest.json"), "utf-8"));
const problems: string[] = [];
const pageCounts = new Map<string, number>();

function pagesOf(source: string): number | null {
  if (pageCounts.has(source)) return pageCounts.get(source)!;
  const real = realPathForSource(source);
  if (!real) return null;
  const out = execFileSync("pdfinfo", [real], { stdio: ["ignore", "pipe", "ignore"] }).toString();
  const n = parseInt(out.match(/Pages:\s+(\d+)/)?.[1] ?? "0", 10);
  pageCounts.set(source, n);
  return n;
}

function independentCount(source: string): number {
  const real = realPathForSource(source)!;
  const text = execFileSync("pdftotext", ["-layout", real, "-"], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString();
  // Moodle prints exactly one status block per question ("Marked out of 1.00" / "Mark 1.00 out of 3.00").
  // Counted rather than the "Question N" labels: some PDFs lose a label from the text layer entirely, and
  // others contain the literal words "Question 1" inside an explanation.
  return (text.match(/Marked out of|^\s*Mark [\d.]+ out of/gm) ?? []).length;
}

function checkSource(label: string, s: { file: string; page: number }) {
  const n = pagesOf(s.file);
  if (n === null) problems.push(`${label}: source file not found: ${s.file}`);
  else if (s.page < 1 || s.page > n) problems.push(`${label}: page ${s.page} outside ${s.file} (${n} pages)`);
}

// Page citations for notes are checked against the PDF text itself: the start and end of every block's
// text must occur (ignoring whitespace/punctuation/table separators) on the page it cites.
const normText = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "");
const pageTextCache = new Map<string, string[]>();
function normPages(source: string, twoColumn: boolean): string[] {
  const key = source + twoColumn;
  if (!pageTextCache.has(key)) {
    const real = realPathForSource(source)!;
    pageTextCache.set(key, (twoColumn ? extractPdfPagesReadingOrder(real) : extractPdfPages(real)).map(normText));
  }
  return pageTextCache.get(key)!;
}

let notesChecked = 0;
let sideBySide = 0;
let questionsChecked = 0;
for (const t of manifest.topics) {
  const notes: NoteBlock[] = JSON.parse(fs.readFileSync(path.join(PAPER_A_CONTENT, "notes", `${t.id}.json`), "utf-8"));
  if (notes.length === 0) problems.push(`${t.id}: no note blocks`);
  for (const n of notes) {
    notesChecked++;
    checkSource(`${t.id}/${n.id}`, n.source);
    if (!n.text.trim()) problems.push(`${t.id}/${n.id}: empty note text`);
    const pageText = normPages(n.source.file, TOPICS.find((d) => d.id === t.id)?.twoColumn ?? false)[n.source.page - 1] ?? "";
    // Table / multi-column rows are stored as "cell | cell"; check the first cell of the first line and
    // the last cell of the last line, since a row's cells can interleave with a neighbouring column.
    const lines = n.text.split("\n");
    const first = normText(lines[0].split(" | ")[0]);
    const lastCells = lines[lines.length - 1].split(" | ");
    const last = normText(lastCells[lastCells.length - 1]);
    const probe = (t: string, end: boolean) => (t.length < 12 ? true : pageText.includes(end ? t.slice(-30) : t.slice(0, 30)));
    // A first/last row with two long cells is a side-by-side text box, whose cells can interleave
    // across rows (see CLAUDE.md "Paper A notes"): not machine-checkable, counted and reported.
    const wide = (ln: string) => ln.split(" | ").filter((c) => c.split(/\s+/).length >= 7).length >= 2;
    if (n.multiColumn || wide(lines[0]) || wide(lines[lines.length - 1])) {
      sideBySide++;
      continue;
    }
    if (!probe(first, false) || !probe(last, true))
      problems.push(`${t.id}/${n.id}: text start/end not found on cited page ${n.source.page}`);
  }
}

const questionIds = [
  ...manifest.topics.filter((t) => t.questionBankFiles.length).map((t) => ({ id: t.id, files: t.questionBankFiles })),
  ...manifest.quizSets.map((s) => ({ id: s.id, files: [s.file] })),
];
for (const { id, files } of questionIds) {
  const qs: Question[] = JSON.parse(fs.readFileSync(path.join(PAPER_A_CONTENT, "questions", `${id}.json`), "utf-8"));
  qs.forEach((q) => {
    questionsChecked++;
    checkSource(`${id}/${q.id}`, q.source);
    if (!q.stem) problems.push(`${id}/${q.id}: empty stem`);
    if (q.format === "SBA" && q.options.length < 2) problems.push(`${id}/${q.id}: SBA with ${q.options.length} options`);
    if (q.format === "SBA" && q.correctAnswer && !q.options.includes(q.correctAnswer))
      problems.push(`${id}/${q.id}: correctAnswer not among options`);
  });
  // Count + numbering against the PDF itself, only where nothing was deduped away.
  const set = manifest.quizSets.find((s) => s.id === id);
  if (!set || set.duplicatesSkipped === 0) {
    const expected = files.reduce((sum, f) => sum + independentCount(f), 0);
    if (expected !== qs.length) problems.push(`${id}: ${qs.length} questions vs ${expected} per-question status blocks ("Marked out of") in the PDF(s)`);
  }
  if (files.length === 1) {
    const nums = qs.map((q) => q.source.questionNumber ?? 0);
    nums.forEach((n, i) => {
      if (i > 0 && n !== nums[i - 1] + 1 && !(set && set.duplicatesSkipped > 0)) problems.push(`${id}: numbering jumps ${nums[i - 1]} -> ${n}`);
    });
  }
}

console.log(`${sideBySide} note blocks sit on side-by-side layouts (page citation not machine-checked for those; the UI flags them).`);
console.log(`Checked ${notesChecked} note blocks and ${questionsChecked} questions across ${questionIds.length} quizzes.`);
if (problems.length) {
  console.log(`${problems.length} problem(s):`);
  problems.forEach((p) => console.log(" - " + p));
  process.exitCode = 1;
} else console.log("All checks passed.");
