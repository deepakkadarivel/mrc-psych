import fs from "node:fs";
import path from "node:path";
import manifest from "../content/manifest.json";
import paperAManifest from "../content/paper-a/manifest.json";
import { PAPER_A_ROOT, SKIPPED, realPathForSource } from "./paper-a/config";

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
    "exam-syllabic/MRCPsych_Paper_B_Trend_Analysis.pdf",
    "exam-syllabic/MRCPsych_Strategy_Guide.pdf",
  ];
  for (const rel of extra) {
    const src = path.join(resourcesDir, rel);
    const dest = path.join(publicDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
  console.log(`mocks & recalls: copied ${extra.length} source files`);
}

// ---- Paper A ----
// Source files live under resources/paper-a/ with stray leading/trailing spaces in some folder and
// file names; they're served from /sources/paper-a/<trimmed path> (the same string Source.file
// carries), so the copy goes through realPathForSource() to map back to the real on-disk name.
if (requestedIds.length === 0) {
  const sources = new Set<string>();
  for (const t of paperAManifest.topics) [...t.bookFiles, ...t.questionBankFiles].forEach((f) => sources.add(f));
  for (const s of paperAManifest.quizSets) sources.add(s.file);
  // Skipped-but-citable files (the image-only scan, the recall post) stay reachable too.
  SKIPPED.forEach((s) => sources.add("paper-a/" + s.file.split("/").map((p) => p.trim().replace(/\s+/g, " ")).join("/")));
  // Student recall files (resources/paper-a/Recalls/) are cited by content/paper-a/recalls.json.
  for (const f of fs.readdirSync(path.join(PAPER_A_ROOT, "Recalls"))) sources.add(`paper-a/Recalls/${f.trim().replace(/\s+/g, " ")}`);
  let copied = 0;
  for (const src of sources) {
    const real = realPathForSource(src);
    if (!real) throw new Error(`Paper A source not found on disk: ${src} (under ${PAPER_A_ROOT})`);
    const dest = path.join(publicDir, src);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(real, dest);
    copied++;
  }
  console.log(`paper-a: copied ${copied} source PDFs`);
}
