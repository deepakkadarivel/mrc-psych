import fs from "node:fs";
import path from "node:path";
import { extractPdfPagesRaw, mergeOrphanLigatures } from "./lib/pdf-text";
import { parseAttemptReview } from "./lib/parse-attempt-review";
import type { Question } from "@/lib/types";

const root = process.cwd();
const outDir = path.join(root, "content/questions");
fs.mkdirSync(outDir, { recursive: true });

function writeExam(examNum: number, questions: Omit<Question, "id" | "topic">[]) {
  const stamped = questions.map((q, i) => ({ ...q, id: `mock-${examNum}-${i}`, topic: "mock" }));
  const outFile = path.join(outDir, `mock-${examNum}.json`);
  fs.writeFileSync(outFile, JSON.stringify(stamped, null, 2));
  console.log(`mock-${examNum}: ${stamped.length} questions -> ${path.relative(root, outFile)}`);
}

// The 13-exam bank: question numbers reset to 1 at the start of each exam.
const bankAbs = path.join(root, "resources/paper-b/mocks/SPMM Mocks.pdf");
const bankPages = extractPdfPagesRaw(bankAbs).map(mergeOrphanLigatures);
const bankRaw = parseAttemptReview(bankPages, "mocks/SPMM Mocks.pdf");

let examIndex = 1;
let lastNumber = 0;
let byExam: Array<Omit<Question, "id" | "topic">[]> = [[]];
for (const q of bankRaw) {
  const num = q.source.questionNumber ?? 0;
  if (num < lastNumber) {
    examIndex++;
    byExam.push([]);
  }
  lastNumber = num;
  byExam[byExam.length - 1].push(q);
}
byExam.forEach((questions, i) => writeExam(i + 1, questions));

// A 14th exam lives as its own file in previous-year-question-source/ (same Attempt-review
// format, confirmed by inspection — not one of the free-form recall docs in that folder).
const exam14Abs = path.join(
  root,
  "resources/paper-b/previous-year-question-source/Paper B Mock Exam 14  _april_2024_).pdf"
);
const exam14Pages = extractPdfPagesRaw(exam14Abs).map(mergeOrphanLigatures);
const exam14Raw = parseAttemptReview(
  exam14Pages,
  "previous-year-question-source/Paper B Mock Exam 14  _april_2024_).pdf"
);
writeExam(14, exam14Raw);
