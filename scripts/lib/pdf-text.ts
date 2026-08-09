import { execFileSync } from "node:child_process";

/**
 * Extracts a PDF's text, one string per page, using `pdftotext -layout`.
 * Pages are split on the form-feed character pdftotext inserts between pages,
 * so every downstream block can cite an exact page number.
 */
export function extractPdfPages(absPath: string): string[] {
  const raw = execFileSync("pdftotext", ["-layout", absPath, "-"], {
    maxBuffer: 1024 * 1024 * 200,
  }).toString("utf-8");
  // pdftotext emits a trailing \f after the last page too — drop the empty tail.
  const pages = raw.split("\f");
  if (pages[pages.length - 1].trim() === "") pages.pop();
  return pages;
}

/**
 * `mocks/` and `previous-year-question-source/` PDFs have a different bug: `pdftotext -layout`
 * emits ligature glyphs (fi/ff/fl/ffi/ffl) at the wrong X position entirely — e.g. "identi ed"
 * with a stray "fi" landing dozens of columns away on the next visual line. `-raw` mode (content-
 * stream order instead of by position) keeps the ligature immediately adjacent to where it
 * belongs — same page, right after the line it broke — just still on its own line instead of
 * inline. Confirmed on resources/paper-b/mocks/SPMM Mocks.pdf.
 */
export function extractPdfPagesRaw(absPath: string): string[] {
  const raw = execFileSync("pdftotext", ["-raw", absPath, "-"], {
    maxBuffer: 1024 * 1024 * 200,
  }).toString("utf-8");
  const pages = raw.split("\f");
  if (pages[pages.length - 1].trim() === "") pages.pop();
  return pages;
}

const ORPHAN_LIGATURES = new Set(["fi", "ff", "fl", "ffi", "ffl"]);

/**
 * Glues an orphan ligature line onto the end of the previous line (no space) — fixes
 * "sta" + "ff" -> "staff". Deliberately does NOT also try to glue the line after the
 * ligature (would fix "identi"+"fi"+"ed" -> "identified", but "sta"+"ff"+"compared" would
 * wrongly become "staffcompared" — there's no reliable way to tell "this is a word suffix"
 * apart from "this is the next real word" without a dictionary). So some words still come
 * out as e.g. "identifi ed" instead of "identified" — readable, not silently wrong. Don't
 * try to close that gap with more regex guessing; it needs an actual word list to do safely.
 */
export function mergeOrphanLigatures(pageText: string): string {
  const lines = pageText.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (ORPHAN_LIGATURES.has(trimmed) && out.length > 0) {
      out[out.length - 1] = out[out.length - 1] + trimmed;
    } else {
      out.push(line);
    }
  }
  return out.join("\n");
}

/**
 * Fixes font-encoding corruption confirmed in the SPMM `books/` PDFs: this specific
 * font subset maps the space glyph to literal `"` or `!`, and the hyphen glyph to `?`.
 * Verified against resources/paper-b/books/7-1-adult-psychiatry-1.pdf: genuine apostrophes
 * render fine as `'`/`'`, and no genuine `!`/`?`/mid-word `"` occur anywhere in that file —
 * so this is a safe global substitution for this corpus, not a heuristic guess.
 *
 * ponytail: this is tuned to the one font family seen across books/. If a future book PDF
 * uses a different embedded font, re-verify with the same grep-for-genuine-usage check
 * (see the extraction session notes) before trusting this cleanup on it blindly.
 */
export function cleanBookText(text: string): string {
  return text
    .replace(/["!]/g, " ")
    .replace(/(?<=[A-Za-z0-9%)])\?(?=[A-Za-z0-9])/g, "-")
    .replace(/ {2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

/**
 * Moodle's "Attempt review" PDF export renders small icon-font glyphs (correct/incorrect
 * marks, flags) inline with the text; pdftotext extracts them as literal Private Use Area
 * codepoints (U+E000-U+F8FF) with no visible glyph in a normal font. Confirmed present in
 * question_bank/, mocks/, and the Attempt-review-format previous-year file, scattered across
 * stem/options/correctAnswer/explanation/reference. Invisible, but real characters — they
 * silently broke exact-string option/correctAnswer matching in the quiz UI (an option's text
 * no longer equalled `correctAnswer` because of a trailing icon codepoint the option carried
 * and the answer line didn't). This corpus never legitimately uses PUA codepoints, so a
 * blanket strip is safe.
 */
export function stripIconGlyphs(text: string): string {
  return text.replace(/[\uE000-\uF8FF]/g, "");
}

/**
 * KNOWN UNSOLVED LIMITATION (do not silently "fix" this with more regexes):
 * bold/heading text in books/ appears to use a second, different custom font
 * encoding than body text. Confirmed example (7-1-adult-psychiatry-1.pdf, page 36):
 * raw "9.!TreatmentTresistant!schizophrenia:!" for what is almost certainly
 * "9. Treatment-Resistant schizophrenia:" — the hyphen is dropped entirely and
 * a letter is substituted (R -> T), not just space/hyphen corruption.
 * cleanBookText does NOT attempt to correct this — headings must be spot-checked
 * against the source PDF page by a human before being trusted, especially any
 * heading containing what looks like a mis-spelled or run-together word.
 */
