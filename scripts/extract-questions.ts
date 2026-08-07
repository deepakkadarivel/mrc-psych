import fs from "node:fs";
import path from "node:path";
import manifest from "../content/manifest.json";
import { extractPdfPages } from "./lib/pdf-text";
import { parseAttemptReview } from "./lib/parse-attempt-review";
import type { Question } from "@/lib/types";

const root = process.cwd();
const resourcesDir = path.join(root, "resources/paper-b");
const outDir = path.join(root, "content/questions");
fs.mkdirSync(outDir, { recursive: true });

const requestedIds = process.argv.slice(2);
const topics = requestedIds.length
  ? manifest.topics.filter((t) => requestedIds.includes(t.id))
  : manifest.topics;

for (const topic of topics) {
  if (topic.questionBankFiles.length === 0) {
    console.log(`${topic.id}: no question bank files, skipping`);
    continue;
  }
  const questions: Question[] = [];
  for (const relFile of topic.questionBankFiles) {
    const abs = path.join(resourcesDir, relFile);
    const pages = extractPdfPages(abs);
    const raw = parseAttemptReview(pages, relFile);
    raw.forEach((q, i) => {
      questions.push({ ...q, id: `${topic.id}-${path.basename(relFile, ".pdf")}-${i}`, topic: topic.id });
    });
  }
  const outFile = path.join(outDir, `${topic.id}.json`);
  fs.writeFileSync(outFile, JSON.stringify(questions, null, 2));
  console.log(`${topic.id}: ${questions.length} questions -> ${path.relative(root, outFile)}`);
}
