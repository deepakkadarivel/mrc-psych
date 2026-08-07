import fs from "node:fs";
import path from "node:path";
import type { NoteBlock, Question, Source, StudyGuide } from "@/lib/types";

const root = process.cwd();
const guidesDir = path.join(root, "content/study-guides");

function loadJson<T>(file: string): T | null {
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

function buildValidSets(topic: string) {
  const notes = loadJson<NoteBlock[]>(path.join(root, `content/notes/${topic}.json`)) ?? [];
  const questions = loadJson<Question[]>(path.join(root, `content/questions/${topic}.json`)) ?? [];
  const pageKeys = new Set<string>();
  const questionKeys = new Set<string>();
  for (const n of notes) pageKeys.add(`${n.source.file}|${n.source.page}`);
  for (const q of questions) {
    pageKeys.add(`${q.source.file}|${q.source.page}`);
    questionKeys.add(`${q.source.file}|${q.source.page}|${q.source.questionNumber}`);
  }
  return { pageKeys, questionKeys };
}

function isValid(source: Source, sets: { pageKeys: Set<string>; questionKeys: Set<string> }): boolean {
  if (source.questionNumber !== undefined) {
    return sets.questionKeys.has(`${source.file}|${source.page}|${source.questionNumber}`);
  }
  return sets.pageKeys.has(`${source.file}|${source.page}`);
}

const files = fs.existsSync(guidesDir)
  ? fs.readdirSync(guidesDir).filter((f) => f.endsWith(".json"))
  : [];

let totalInvalid = 0;
for (const file of files) {
  const topic = path.basename(file, ".json");
  const guide = loadJson<StudyGuide>(path.join(guidesDir, file));
  if (!guide) continue;
  const sets = buildValidSets(topic);
  const invalid: string[] = [];

  for (const group of guide.condensedNotes) {
    for (const b of group.bullets) {
      if (!isValid(b.source, sets)) invalid.push(`condensedNotes[${group.heading}]: ${JSON.stringify(b.source)}`);
    }
  }
  for (const t of guide.tables) {
    for (const s of t.sources) {
      if (!isValid(s, sets)) invalid.push(`table[${t.title}]: ${JSON.stringify(s)}`);
    }
  }
  for (const m of guide.mnemonics) {
    if (m.sourced && m.source && !isValid(m.source, sets)) {
      invalid.push(`mnemonic[${m.forTopic}]: ${JSON.stringify(m.source)}`);
    }
  }
  for (const t of guide.examinerTraps) {
    if (!isValid(t.source, sets)) invalid.push(`trap[${t.text.slice(0, 40)}...]: ${JSON.stringify(t.source)}`);
  }

  if (invalid.length) {
    totalInvalid += invalid.length;
    console.log(`\n${topic}: ${invalid.length} INVALID citation(s)`);
    invalid.forEach((i) => console.log("  " + i));
  } else {
    console.log(`${topic}: OK`);
  }
}

if (totalInvalid > 0) {
  console.log(`\n${totalInvalid} invalid citations total — fix before trusting these guides.`);
  process.exit(1);
} else {
  console.log("\nAll citations verified against source notes/questions.");
}
