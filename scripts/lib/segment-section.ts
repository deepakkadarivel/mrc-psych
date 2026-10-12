import { execFileSync } from "node:child_process";

export interface RawSectionBlock {
  heading: string;
  text: string;
  page: number;
  /** >=2 source lines have a wide gap with real text on both sides: a side-by-side layout whose
   *  cells may read out of order. Flagged, not fixed — see CLAUDE.md "Paper A notes". */
  multiColumn?: boolean;
}

/**
 * Paper A "Sections" notes → page-bounded NoteBlocks.
 *
 * Differences from Paper B's `segmentBookIntoNotes` (which is tuned to the SPMM `books/` PDFs):
 *  - No `cleanBookText`. Paper B's books have a corrupted font that maps space/hyphen to `!`/`?`;
 *    Paper A's section PDFs extract cleanly, so applying that substitution here would *introduce*
 *    corruption (genuine `?` and `"` characters would be rewritten).
 *  - Blocks never cross a page boundary. A heading-section that runs onto the next page becomes a
 *    second block under the same heading. CLAUDE.md's one rule is that every fact cites the page it
 *    is actually on, and a block spanning pages could only cite its first one.
 *  - Headings are standalone short lines shaped like "5. Synthesis of DNA, RNA & Protein" or
 *    "C. Distribution:"; sections without such headings fall back to the topic title.
 *  - Table-ish rows (cells separated by 3+ spaces in `pdftotext -layout`) are kept as their own
 *    lines with " | " between cells, instead of being flattened into one run of words.
 */

// Footer + cover-page boilerplate (copyright notice) — neither is study content.
const FOOTER_RE = /^\s*©\s*SPMM Course\b.*$|We claim copyright for our own text|rights to Images\/Figures with CC-BY-SA/;
const HEADING_RE = /^(?:\d{1,2}|[A-Z])\.\s+[A-Z][^|]{1,70}$/;

function isHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!HEADING_RE.test(t)) return false;
  if (/[.;,]$/.test(t) && !/^\d{1,2}\.\s/.test(t)) return false; // sentence-like
  if (t.replace(/^(\d{1,2}|[A-Z])\.\s+/, "").split(/\s+/).length > 10) return false;
  if (/\s{3,}/.test(line.trim())) return false; // a table row, not a heading
  return true;
}

/**
 * Side-by-side text boxes and comparison tables often have only a 2-space gutter in `-layout`
 * output, so they'd otherwise be joined into one run of prose that reads left-then-right on every
 * line ("...Bipolar affective disorder (BPAD) A specifier 'with anxious distress'..."). The right
 * column always starts at the same character offset on consecutive lines, so a gap whose *end*
 * offset repeats on >=3 nearby lines is a column boundary. Both sides must be >=3 words, which
 * excludes bullets and numbering ("•  text") that share the same constant-offset shape.
 */
function splitAtRivers(lines: string[]): string[][] {
  const gapEnds = lines.map((l) => {
    const ends: number[] = [];
    for (const m of l.matchAll(/\S( {2,})(?=\S)/g)) ends.push(m.index! + 1 + m[1].length);
    return ends;
  });
  return lines.map((line, i) => {
    const cuts: number[] = [];
    for (const e of gapEnds[i]) {
      let support = 0;
      for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) if (gapEnds[j].includes(e)) support++;
      const left = line.slice(0, e).trim();
      const right = line.slice(e).trim();
      if (support >= 3 && left.split(/\s+/).length >= 3 && right.split(/\s+/).length >= 3) cuts.push(e);
    }
    if (!cuts.length) return [line.trim()];
    const cells: string[] = [];
    let prev = 0;
    for (const e of cuts) {
      cells.push(line.slice(prev, e).trim());
      prev = e;
    }
    cells.push(line.slice(prev).trim());
    return cells;
  });
}

function renderLines(lines: string[]): string {
  const paras: string[] = [];
  let prose: string[] = [];
  const flush = () => {
    if (prose.length) paras.push(prose.join(" ").replace(/ {2,}/g, " ").trim());
    prose = [];
  };
  const split = splitAtRivers(lines.map((l) => l.replace(/\s+$/, "")));
  lines.forEach((raw, i) => {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      flush();
      return;
    }
    if (split[i].length > 1) {
      flush();
      paras.push(split[i].join(" | "));
    } else if (/\S\s{3,}\S/.test(line.trim())) {
      flush();
      paras.push(line.trim().split(/\s{3,}/).join(" | "));
    } else {
      prose.push(line.trim());
    }
  });
  flush();
  return paras.join("\n").trim();
}

/** Multi-column pages (SYNDROMES.pdf: two text columns) need reading order, not `-layout`. */
export function extractPdfPagesReadingOrder(absPath: string): string[] {
  const raw = execFileSync("pdftotext", [absPath, "-"], { maxBuffer: 1024 * 1024 * 200 }).toString("utf-8");
  const pages = raw.split("\f");
  if (pages[pages.length - 1].trim() === "") pages.pop();
  return pages;
}

export function segmentSection(pages: string[], fallbackHeading: string, maxWords = 330): RawSectionBlock[] {
  const blocks: RawSectionBlock[] = [];
  let heading = fallbackHeading;

  pages.forEach((rawPage, idx) => {
    const page = idx + 1;
    const lines = rawPage.split("\n").filter((l) => !FOOTER_RE.test(l));
    let current: string[] = [];
    const flush = () => {
      const text = renderLines(current);
      // Flag only blocks where a wide-gap (side-by-side) row coexists with prose lines that still
      // carry double-spaced words — the signature of a floating text box whose lines got joined into
      // the wrong paragraph. Plain tables (all rows split into cells) are not flagged.
      const wide = current.filter((l) => /\S+(?:\s+\S+){2,}\s{8,}\S+/.test(l.trim())).length;
      const doubleSpaced = current.filter((l) =>
        l.trim().split(/\s{3,}/).some((cell) => (cell.match(/\S[ \u00a0]{2}\S/g) ?? []).length >= 2)
      ).length;
      const wideGaps = wide >= 2 && doubleSpaced >= 1 ? 2 : 0;
      current = [];
      if (!text) return;
      blocks.push({ heading, text, page, ...(wideGaps >= 2 ? { multiColumn: true } : {}) });
    };
    for (const line of lines) {
      if (isHeadingLine(line)) {
        flush();
        heading = line.trim().replace(/:$/, "");
        continue;
      }
      current.push(line);
    }
    flush();
  });

  // Fold tiny leftovers into the previous block on the same page, and split very long blocks at
  // paragraph boundaries so one "note" stays a readable size. Neither move changes any text.
  const merged: RawSectionBlock[] = [];
  for (const b of blocks) {
    const words = b.text.split(/\s+/).length;
    const prev = merged[merged.length - 1];
    if (prev && prev.page === b.page && prev.heading === b.heading && words < 25) {
      prev.text += "\n" + b.text;
      if (b.multiColumn) prev.multiColumn = true;
    } else merged.push({ ...b });
  }
  const out: RawSectionBlock[] = [];
  for (const b of merged) {
    if (b.text.split(/\s+/).length <= maxWords) {
      out.push(b);
      continue;
    }
    let chunk: string[] = [];
    let count = 0;
    for (const para of b.text.split("\n")) {
      const w = para.split(/\s+/).length;
      if (count + w > maxWords && chunk.length) {
        out.push({ ...b, text: chunk.join("\n") });
        chunk = [];
        count = 0;
      }
      chunk.push(para);
      count += w;
    }
    if (chunk.length) out.push({ ...b, text: chunk.join("\n") });
  }
  return out;
}
