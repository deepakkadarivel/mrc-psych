import fs from "node:fs";
import path from "node:path";
import type { Question } from "@/lib/types";

const root = process.cwd();
const questionsDir = path.join(root, "content/questions");

let checked = 0;
const mismatches: string[] = [];

for (const file of fs.readdirSync(questionsDir)) {
  const questions: Question[] = JSON.parse(fs.readFileSync(path.join(questionsDir, file), "utf-8"));
  for (const q of questions) {
    if (q.options.length === 0 || !q.correctAnswer) continue;
    checked++;
    if (!q.options.includes(q.correctAnswer)) {
      mismatches.push(`${file} | ${q.id} | correctAnswer not in options: ${JSON.stringify(q.correctAnswer)}`);
    }
  }
}

console.log(`Checked ${checked} SBA questions with an extractable correct answer.`);
if (mismatches.length > 0) {
  console.log(`${mismatches.length} question(s) where correctAnswer doesn't exactly match an option`);
  console.log(
    "(the quiz UI grades by exact string match, so these will always be marked incorrect regardless of the user's pick):"
  );
  mismatches.forEach((m) => console.log(" - " + m));
  process.exitCode = 1;
} else {
  console.log("All correctAnswer values exactly match one of their question's options.");
}
