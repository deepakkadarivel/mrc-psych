import fs from "node:fs";
import path from "node:path";
import type { StudyGuide } from "@/lib/types";
import { highlightKeyFacts } from "./lib/emphasize";

// Separate from scripts/emphasize-study-guides.ts on purpose — see the comment on
// highlightKeyFacts() in scripts/lib/emphasize.ts for why re-running the full emphasize()
// pipeline against already-processed content would corrupt existing bold markup.

const root = process.cwd();
const guidesDir = path.join(root, "content/study-guides");

const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const full = path.join(guidesDir, file);
  const guide = JSON.parse(fs.readFileSync(full, "utf-8")) as StudyGuide;

  for (const section of guide.sections) {
    for (const block of section.blocks) {
      switch (block.type) {
        case "paragraph":
          block.text = highlightKeyFacts(block.text);
          break;
        case "table":
        case "comparison":
          block.rows = block.rows.map((row) => row.map((cell) => highlightKeyFacts(cell)));
          break;
        case "mnemonic":
          block.expansion = block.expansion.map((e) => highlightKeyFacts(e));
          break;
        case "trap":
          block.text = highlightKeyFacts(block.text);
          break;
        case "trap-list":
          for (const item of block.items) item.text = highlightKeyFacts(item.text);
          break;
        case "gap":
          block.note = highlightKeyFacts(block.note);
          break;
      }
    }
  }

  fs.writeFileSync(full, JSON.stringify(guide, null, 2));
  console.log(`${file}: highlighted`);
}
