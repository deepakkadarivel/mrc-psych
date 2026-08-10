import fs from "node:fs";
import path from "node:path";
import manifestJson from "../content/manifest.json";
import { extractPdfPages } from "./lib/pdf-text";
import { segmentBookIntoNotes } from "./lib/segment-book";
import type { Manifest, NoteBlock } from "@/lib/types";

const manifest = manifestJson as Manifest;

const root = process.cwd();
const resourcesDir = path.join(root, "resources/paper-b");
const outDir = path.join(root, "content/notes");
fs.mkdirSync(outDir, { recursive: true });

const requestedIds = process.argv.slice(2);
const topics = requestedIds.length
  ? manifest.topics.filter((t) => requestedIds.includes(t.id))
  : manifest.topics;

for (const topic of topics) {
  if (topic.bookFiles.length === 0) {
    console.log(`${topic.id}: no book files (gap: ${topic.gap ?? "none noted"}), skipping`);
    continue;
  }
  const notes: NoteBlock[] = [];
  for (const relFile of topic.bookFiles) {
    const abs = path.join(resourcesDir, relFile);
    const pages = extractPdfPages(abs);
    const raw = segmentBookIntoNotes(pages, topic.title);
    raw.forEach((b, i) => {
      notes.push({
        id: `${topic.id}-${path.basename(relFile, ".pdf")}-${i}`,
        topic: topic.id,
        heading: b.heading,
        text: b.text,
        source: { file: `books/${path.basename(relFile)}`, page: b.page },
      });
    });
  }
  const outFile = path.join(outDir, `${topic.id}.json`);
  fs.writeFileSync(outFile, JSON.stringify(notes, null, 2));
  console.log(`${topic.id}: ${notes.length} note blocks -> ${path.relative(root, outFile)}`);
}
