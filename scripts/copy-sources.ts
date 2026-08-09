import fs from "node:fs";
import path from "node:path";
import manifest from "../content/manifest.json";

const root = process.cwd();
const resourcesDir = path.join(root, "resources/paper-b");
const publicDir = path.join(root, "public/sources");

const requestedIds = process.argv.slice(2);
const topics = requestedIds.length
  ? manifest.topics.filter((t) => requestedIds.includes(t.id))
  : manifest.topics;

for (const topic of topics) {
  for (const rel of [...topic.bookFiles, ...topic.questionBankFiles]) {
    const src = path.join(resourcesDir, rel);
    const dest = path.join(publicDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  console.log(`${topic.id}: copied ${topic.bookFiles.length + topic.questionBankFiles.length} source PDFs`);
}

// Mocks + past-paper recalls aren't per-topic — copy them whenever running the full set
// (no specific topic ids requested), same as a fresh `pnpm build` would need.
if (requestedIds.length === 0) {
  const extra = [
    "mocks/SPMM Mocks.pdf",
    ...manifest.pastPaperRecalls.files,
    "previous-year-question-source/Paper B Mock Exam 14  _april_2024_).pdf",
    "exam-syllabic/exams-syllabic-curriculum-mrcpsych-february-2021.pdf",
  ];
  for (const rel of extra) {
    const src = path.join(resourcesDir, rel);
    const dest = path.join(publicDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  console.log(`mocks & recalls: copied ${extra.length} source files`);
}
