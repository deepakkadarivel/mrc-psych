import { cleanBookText } from "./pdf-text";

export interface RawNoteBlock {
  heading: string;
  text: string;
  page: number;
}

/**
 * Numbered lines (e.g. "1. Major Depressive Disorder", "4. Emergency treatment:") are the
 * one reliably consistent structural signal in books/ — but numbered BODY LISTS ("4. Level 1:
 * Citalopram was given (n = 3671...)", "13. Switch to a class outside SSRIs was not different
 * from...") match the same "digit. Capital..." shape and must NOT become headings, or every
 * numbered clinical list fragments the notes into junk sections.
 *
 * Verified against resources/paper-b/books/7-1-adult-psychiatry-1.pdf (see the session that
 * built this: real headings are short noun phrases / questions with no digits, "(", or em-dash
 * — "2. Bipolar Disorder", "4. Emergency treatment:", "1. Do drugs work?" — while body-list
 * items are longer, contain stats/parens, or read as full sentences). The heuristic below is
 * a word-count + punctuation filter tuned to that real distinction, not a guess.
 */
const HEADING_CANDIDATE_RE = /^(\d{1,2})\.\s+([A-Z].*)$/;
const DISQUALIFYING_CHARS = /[(0-9%–]/; // stats, parens, em-dash, digits inside the title itself

function splitHeadingTitle(rest: string): { title: string; remainder: string } | null {
  // Prefer splitting at the first ":" or "?" within a short prefix — that prefix is the label,
  // whatever follows (if anything) is the first line of body content under it.
  const cutMatch = rest.match(/^(.{2,70}?[:?])(\s+(.*))?$/);
  const candidateTitle = cutMatch ? cutMatch[1] : rest;
  const words = candidateTitle.replace(/[:?]$/, "").trim().split(/\s+/);
  if (words.length > 8) return null;
  if (DISQUALIFYING_CHARS.test(candidateTitle)) return null;
  if (cutMatch) {
    return { title: cutMatch[1], remainder: (cutMatch[3] ?? "").trim() };
  }
  // No ":"/"?" found at all — only accept as a heading if the WHOLE line is short enough.
  if (words.length > 6) return null;
  if (rest.length > 60) return null;
  return { title: rest, remainder: "" };
}

export function segmentBookIntoNotes(pages: string[], fallbackHeading: string): RawNoteBlock[] {
  const blocks: RawNoteBlock[] = [];
  let currentHeading = fallbackHeading;
  let currentPage = 1;
  let currentLines: string[] = [];

  function flush() {
    const text = currentLines.join(" ").replace(/ {2,}/g, " ").trim();
    if (text) blocks.push({ heading: currentHeading, text, page: currentPage });
    currentLines = [];
  }

  pages.forEach((rawPage, idx) => {
    const pageNum = idx + 1;
    const cleaned = cleanBookText(rawPage);
    for (const rawLine of cleaned.split("\n")) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;
      const candidate = trimmed.match(HEADING_CANDIDATE_RE);
      const split = candidate ? splitHeadingTitle(candidate[2]) : null;
      if (candidate && split) {
        flush();
        currentHeading = `${candidate[1]}. ${split.title.replace(/:$/, "")}`;
        currentPage = pageNum;
        if (split.remainder) currentLines.push(split.remainder);
        continue;
      }
      currentLines.push(trimmed);
    }
  });
  flush();

  // A "heading" immediately followed by very little text before the next heading is almost
  // always a criteria/checklist item that slipped past the filter above (e.g. ICD-10
  // dependence-syndrome criteria numbered 1-7, each just a few words) rather than a real
  // section — real sections in this corpus always carry substantial explanatory prose.
  // Demote it: fold it into the previous block as inline text instead of its own heading.
  const MIN_WORDS_FOR_OWN_HEADING = 15;
  const merged: RawNoteBlock[] = [];
  for (const b of blocks) {
    const words = b.text.split(/\s+/).filter(Boolean).length;
    if (merged.length > 0 && words < MIN_WORDS_FOR_OWN_HEADING) {
      const prev = merged[merged.length - 1];
      prev.text = `${prev.text} ${b.heading}: ${b.text}`.replace(/ {2,}/g, " ").trim();
    } else {
      merged.push({ ...b });
    }
  }
  return merged;
}
