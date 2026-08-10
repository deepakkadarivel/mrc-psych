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

function checkSources(
  sources: Source[],
  label: string,
  sets: { pageKeys: Set<string>; questionKeys: Set<string> },
  invalid: string[]
) {
  for (const s of sources) {
    if (!isValid(s, sets)) invalid.push(`${label}: ${JSON.stringify(s)}`);
  }
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

  for (const section of guide.sections) {
    for (const block of section.blocks) {
      switch (block.type) {
        case "paragraph":
          checkSources([block.source], `[${section.title}] paragraph`, sets, invalid);
          break;
        case "table":
          checkSources(block.sources, `[${section.title}] table[${block.title ?? block.category?.label ?? ""}]`, sets, invalid);
          break;
        case "comparison":
          checkSources(block.sources, `[${section.title}] comparison[${block.title}]`, sets, invalid);
          break;
        case "mnemonic":
          if (block.sourced && block.source) {
            checkSources([block.source], `[${section.title}] mnemonic[${block.forTopic}]`, sets, invalid);
          }
          break;
        case "trap":
          checkSources([block.source], `[${section.title}] trap[${block.text.slice(0, 40)}...]`, sets, invalid);
          break;
        case "trap-list":
          for (const item of block.items) {
            checkSources([item.source], `[${section.title}] trap-list[${item.text.slice(0, 40)}...]`, sets, invalid);
          }
          break;
        case "gap":
          if (block.source) {
            checkSources([block.source], `[${section.title}] gap[${block.subtopic.slice(0, 40)}...]`, sets, invalid);
          }
          break;
      }
    }

    if (section.concise) {
      for (const bullet of section.concise.bullets) {
        checkSources([bullet.source], `[${section.title}] concise[${bullet.text.slice(0, 40)}...]`, sets, invalid);
      }
      for (const fact of section.concise.facts ?? []) {
        checkSources([fact.source], `[${section.title}] concise-fact[${fact.label}]`, sets, invalid);
      }
      for (const idx of section.concise.highlightBlockIndices ?? []) {
        if (idx < 0 || idx >= section.blocks.length) {
          invalid.push(`[${section.title}] concise.highlightBlockIndices: index ${idx} out of range (0-${section.blocks.length - 1})`);
        }
      }
    }
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
