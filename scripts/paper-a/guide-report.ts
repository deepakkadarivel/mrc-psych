import fs from "node:fs";
import path from "node:path";
import type { Question, StudyGuide } from "../../lib/types";

/**
 * Quality report for Paper A study guides: block mix vs the Paper B pattern, and which questions in the topic's
 * pools (own bank + extra pool) no block cites yet. Usage: tsx scripts/paper-a/guide-report.ts <topic-id> [--uncited]
 */
const topic = process.argv[2];
const showUncited = process.argv.includes("--uncited");
const root = path.join(process.cwd(), "content/paper-a");
const read = <T>(rel: string): T | null => (fs.existsSync(path.join(root, rel)) ? JSON.parse(fs.readFileSync(path.join(root, rel), "utf-8")) : null);
const guide = read<StudyGuide>(`study-guides/${topic}.json`)!;
const bank = read<Question[]>(`questions/${topic}.json`) ?? [];
const extra = read<Question[]>(`questions-extra/${topic}.json`) ?? [];

const counts: Record<string, number> = {};
let highYield = 0, tables = 0, trapListItems = 0, invented = 0, mnemonics = 0;
const cited = new Set<string>();
const key = (s: { file: string; page: number; questionNumber?: number }) => `${s.file}|${s.page}|${s.questionNumber ?? ""}`;
const mark = (s?: { file: string; page: number; questionNumber?: number }) => s && s.questionNumber !== undefined && cited.add(key(s));
const fmt: Record<string, number> = {};
for (const sec of guide.sections) {
  for (const b of sec.blocks) {
    counts[b.type] = (counts[b.type] ?? 0) + 1;
    if (b.type === "table") { tables++; if (b.highYield) highYield++; b.sources.forEach(mark); }
    if (b.type === "comparison") b.sources.forEach(mark);
    if (b.type === "trap") { fmt[b.format] = (fmt[b.format] ?? 0) + 1; mark(b.source); }
    if (b.type === "trap-list") b.items.forEach((i) => { trapListItems++; mark(i.source); });
    if (b.type === "mnemonic") { mnemonics++; if (!b.sourced) invented++; mark(b.source); }
    if (b.type === "paragraph" || b.type === "gap") mark(b.source);
  }
  sec.concise?.bullets.forEach((x) => mark(x.source));
}
const pool = [...bank, ...extra];
const uncited = pool.filter((q) => !cited.has(key(q.source)));
const uncitedBank = bank.filter((q) => !cited.has(key(q.source)));
console.log(`${topic}: ${guide.sections.length} sections | blocks ${JSON.stringify(counts)}`);
console.log(`  highYield tables ${highYield}/${tables} | trap formats ${JSON.stringify(fmt)} | trap-list items ${trapListItems} | mnemonics ${mnemonics} (${invented} invented)`);
console.log(`  questions cited: bank ${bank.length - uncitedBank.length}/${bank.length}, extra pool ${extra.length - (uncited.length - uncitedBank.length)}/${extra.length}`);
if (showUncited) for (const q of uncited) console.log(`  UNCITED ${q.id} Q${q.source.questionNumber} p${q.source.page} [${q.format}] ${q.stem.replace(/\s+/g, " ").slice(0, 110)} => ${q.correctAnswer.slice(0, 60)}`);
