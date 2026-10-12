import fs from "node:fs";
import path from "node:path";
import { extractPdfPages } from "../lib/pdf-text";
import { attemptReviewPages } from "../lib/paper-a-attempt-pages";
import { parseAttemptReview } from "../lib/parse-attempt-review";
import { ligatureLog, ligatureStats } from "../lib/pdf-words";
import { extractPdfPagesReadingOrder, segmentSection } from "../lib/segment-section";
import {
  AREAS,
  DUPLICATE_CANDIDATES,
  MOCKS,
  PAPER_A_CONTENT,
  PAPER_A_EXAM_DATE,
  PAPER_A_ROOT,
  SETS,
  SKIPPED,
  TOPICS,
  sourcePath,
} from "./config";
import type { NoteBlock, PaperAManifest, PaperAQuizSet, Question, TopicManifestEntry } from "../../lib/types";

const only = new Set(process.argv.slice(2));
const want = (id: string) => only.size === 0 || only.has(id);

const dirs = { notes: "notes", questions: "questions" };
for (const d of Object.values(dirs)) fs.mkdirSync(path.join(PAPER_A_CONTENT, d), { recursive: true });
const write = (rel: string, data: unknown) => fs.writeFileSync(path.join(PAPER_A_CONTENT, rel), JSON.stringify(data, null, 2));

type RawQ = Omit<Question, "id" | "topic">;

function parseFile(rel: string): RawQ[] {
  const abs = path.join(PAPER_A_ROOT, rel);
  const raw = parseAttemptReview(attemptReviewPages(abs), sourcePath(rel), { optionsEndAtBlankLine: true });
  return raw.map((q) => {
    // Mocks print the course's own label ("MoK Classification 004") as the first line of the stem.
    const m = q.stem.match(/^(MoK\s+(?:[A-Za-z&'/-]+\s+)+?\d{1,3})\s+(?=\S)/);
    return m ? { ...q, stem: q.stem.slice(m[0].length), tag: m[1] } : q;
  });
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const keyOf = (q: RawQ) => norm(q.stem).slice(0, 300) + "|" + norm(q.correctAnswer).slice(0, 120);

function sanity(label: string, qs: RawQ[]): string[] {
  const issues: string[] = [];
  const nums = qs.map((q) => q.source.questionNumber ?? 0);
  nums.forEach((n, i) => {
    if (i > 0 && n !== nums[i - 1] + 1) issues.push(`numbering ${nums[i - 1]}->${n}`);
  });
  if (qs.some((q) => !q.stem)) issues.push(`${qs.filter((q) => !q.stem).length} empty stems`);
  const sbaBad = qs.filter((q) => q.format === "SBA" && q.correctAnswer && !q.options.includes(q.correctAnswer)).length;
  if (sbaBad) issues.push(`${sbaBad} SBA with correctAnswer not in options`);
  return issues.map((i) => `${label}: ${i}`);
}

const warnings: string[] = [];
const quizSets: PaperAQuizSet[] = [];
const skippedFiles: PaperAManifest["skippedFiles"] = [...SKIPPED.map((s) => ({ file: sourcePath(s.file), reason: s.reason }))];
const topics: TopicManifestEntry[] = [];

// ---- 1. Topics: section notes + topic question banks ----
for (const t of TOPICS) {
  const sectionRel = `MRCPSYCH PAPER A SECTIONS/${t.section}`;
  topics.push({
    id: t.id,
    title: t.title,
    area: t.area,
    bookFiles: [sourcePath(sectionRel)],
    questionBankFiles: t.banks.map(sourcePath),
    ...(t.gap ? { gap: t.gap } : {}),
  });
  if (!want(t.id)) continue;

  const abs = path.join(PAPER_A_ROOT, sectionRel);
  const pages = t.twoColumn ? extractPdfPagesReadingOrder(abs) : extractPdfPages(abs);
  const blocks = segmentSection(pages, t.title);
  const notes: NoteBlock[] = blocks.map((b, i) => ({
    id: `${t.id}-${i}`,
    topic: t.id,
    heading: b.heading,
    text: b.text,
    source: { file: sourcePath(sectionRel), page: b.page },
    ...(b.multiColumn ? { multiColumn: true } : {}),
  }));
  write(`notes/${t.id}.json`, notes);

  let qCount = 0;
  if (t.banks.length) {
    const qs: Question[] = [];
    const seen = new Set<string>();
    for (const rel of t.banks) {
      const raw = parseFile(rel);
      warnings.push(...sanity(t.id, raw));
      for (const q of raw) {
        const k = keyOf(q);
        if (seen.has(k)) continue; // a bank repeating its own question verbatim
        seen.add(k);
        qs.push({ ...q, id: `${t.id}-${qs.length}`, topic: t.id });
      }
    }
    write(`questions/${t.id}.json`, qs);
    qCount = qs.length;
  }
  console.log(`${t.id}: ${pages.length}pp -> ${notes.length} note blocks, ${qCount} questions`);
}

// ---- 2. Standalone quiz sets (EMI banks, high-yield extras, practice sets) with question-level dedup ----
const keptKeys = new Map<string, Set<string>>(); // group -> keys already kept
for (const s of SETS) {
  const raw = parseFile(s.file);
  warnings.push(...sanity(s.id, raw));
  const seen = keptKeys.get(s.group) ?? new Set<string>();
  keptKeys.set(s.group, seen);
  const kept: RawQ[] = [];
  let dupes = 0;
  for (const q of raw) {
    const k = keyOf(q);
    if (seen.has(k)) dupes++;
    else {
      seen.add(k);
      kept.push(q);
    }
  }
  if (kept.length === 0) {
    skippedFiles.push({ file: sourcePath(s.file), reason: `Every one of its ${raw.length} questions already appears in an earlier-kept file.` });
    console.log(`${s.id}: all ${raw.length} questions duplicate earlier files — dropped`);
    continue;
  }
  quizSets.push({ id: s.id, title: s.title, group: s.group, file: sourcePath(s.file), questionCount: kept.length, duplicatesSkipped: dupes });
  if (want(s.id)) {
    write(`questions/${s.id}.json`, kept.map((q, i) => ({ ...q, id: `${s.id}-${i}`, topic: s.id })));
    console.log(`${s.id}: ${kept.length} questions (${dupes} duplicates skipped)`);
  }
}

// ---- 3. Verify the topic-folder EMI copies really are duplicates before skipping them ----
const canonicalKeys = new Map<string, Set<string>>();
for (const s of SETS) {
  const p = path.join(PAPER_A_CONTENT, "questions", `${s.id}.json`);
  if (fs.existsSync(p)) canonicalKeys.set(s.id, new Set((JSON.parse(fs.readFileSync(p, "utf-8")) as RawQ[]).map(keyOf)));
}
for (const d of DUPLICATE_CANDIDATES) {
  const raw = parseFile(d.file);
  const topic = TOPICS.find((t) => t.id === d.of);
  let known: Set<string> | undefined = canonicalKeys.get(d.of);
  if (topic) {
    const p = path.join(PAPER_A_CONTENT, "questions", `${topic.id}.json`);
    if (fs.existsSync(p)) known = new Set((JSON.parse(fs.readFileSync(p, "utf-8")) as RawQ[]).map(keyOf));
  }
  const missing = known ? raw.filter((q) => !known!.has(keyOf(q))).length : raw.length;
  if (missing === 0) skippedFiles.push({ file: sourcePath(d.file), reason: `Duplicate: all ${raw.length} questions already in ${d.of}.` });
  else {
    warnings.push(`${d.file}: ${missing}/${raw.length} questions NOT in ${d.of} — not skipped as duplicate, needs a decision`);
  }
}

// ---- 4. Mocks ----
for (const m of MOCKS) {
  const raw = parseFile(m.file);
  warnings.push(...sanity(m.id, raw));
  quizSets.push({ id: m.id, title: m.title, group: "mock", file: sourcePath(m.file), questionCount: raw.length, duplicatesSkipped: 0 });
  if (want(m.id)) {
    write(`questions/${m.id}.json`, raw.map((q, i) => ({ ...q, id: `${m.id}-${i}`, topic: m.id })));
    console.log(`${m.id}: ${raw.length} questions`);
  }
}

if (only.size === 0) {
  const manifest: PaperAManifest = { paper: "A", examDate: PAPER_A_EXAM_DATE, topics, quizSets, skippedFiles };
  write("manifest.json", manifest);
}

console.log(`\nligature gaps repaired: ${ligatureStats.resolved}, left as space (ambiguous/no dictionary hit): ${ligatureStats.unresolved}`);
if (process.env.LIG_AUDIT) console.log([...ligatureLog.entries()].sort().map(([t, n]) => `${t}×${n}`).join("  "));
console.log(`areas: ${Object.values(AREAS).join(" | ")}`);
if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  warnings.forEach((w) => console.log(" - " + w));
}
