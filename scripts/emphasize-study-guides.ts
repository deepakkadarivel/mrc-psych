import fs from "node:fs";
import path from "node:path";
import type { StudyGuide } from "@/lib/types";
import { emphasize } from "./lib/emphasize";

const root = process.cwd();
const guidesDir = path.join(root, "content/study-guides");

const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const full = path.join(guidesDir, file);
  const guide = JSON.parse(fs.readFileSync(full, "utf-8")) as StudyGuide;

  for (const group of guide.condensedNotes) {
    for (const b of group.bullets) b.text = emphasize(b.text);
  }
  for (const t of guide.tables) {
    t.rows = t.rows.map((row) => row.map((cell) => emphasize(cell)));
  }
  for (const mn of guide.mnemonics) {
    mn.expansion = mn.expansion.map((e) => emphasize(e));
  }
  for (const trap of guide.examinerTraps) trap.text = emphasize(trap.text);
  for (const gap of guide.gaps) gap.note = emphasize(gap.note);

  fs.writeFileSync(full, JSON.stringify(guide, null, 2));
  console.log(`${file}: emphasized`);
}
