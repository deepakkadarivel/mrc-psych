import fs from "node:fs";
import path from "node:path";
import type { StudyGuide } from "@/lib/types";
import { emphasize } from "./lib/emphasize";

const root = process.cwd();
// `--paper-a` processes content/paper-a/study-guides/ instead of Paper B's; optional topic ids after it
// (or alone) restrict the run — needed for emphasize(), which is NOT idempotent (never re-run on a guide
// that has already been through it).
const args = process.argv.slice(2);
const paperA = args.includes("--paper-a");
const onlyTopics = args.filter((a) => !a.startsWith("--"));
const guidesDir = path.join(root, paperA ? "content/paper-a/study-guides" : "content/study-guides");

const files = fs
  .readdirSync(guidesDir)
  .filter((f) => f.endsWith(".json") && (onlyTopics.length === 0 || onlyTopics.includes(f.replace(/\.json$/, ""))));
for (const file of files) {
  const full = path.join(guidesDir, file);
  const guide = JSON.parse(fs.readFileSync(full, "utf-8")) as StudyGuide;

  for (const section of guide.sections) {
    for (const block of section.blocks) {
      switch (block.type) {
        case "paragraph":
          block.text = emphasize(block.text);
          break;
        case "table":
        case "comparison":
          block.rows = block.rows.map((row) => row.map((cell) => emphasize(cell)));
          break;
        case "mnemonic":
          block.expansion = block.expansion.map((e) => emphasize(e));
          break;
        case "trap":
          block.text = emphasize(block.text);
          break;
        case "trap-list":
          for (const item of block.items) item.text = emphasize(item.text);
          break;
        case "gap":
          block.note = emphasize(block.note);
          break;
      }
    }
  }

  fs.writeFileSync(full, JSON.stringify(guide, null, 2));
  console.log(`${file}: emphasized`);
}
