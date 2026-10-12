import { buildLines, extractWordPages, type Line, type Word, type WordPage } from "./pdf-words";

/**
 * Turns a Paper A Moodle "Attempt review" PDF into per-page text that `parseAttemptReview`
 * (written for Paper B's layout) can consume: a bare `Question N` line before each question,
 * followed by the stem column's text only. Two layout families exist in Paper A:
 *
 *  - "gutter": `Question N / Not answered / Marked out of 1.00 / Flag question` sits in a left
 *    column beside the stem (question_bank-style files, mocks, most practice sets).
 *  - "stacked": the status block sits above the stem, like Paper B (a couple of practice sets).
 *
 * Words are split on position, never guessed from text, so gutter noise can't leak into stems
 * and mock page headers/footers (which `-layout` splices into body text) are removed cleanly.
 */

const NOISE_LINE = [
  /^\d{1,2}\/\d{1,2}\/\d{2,4}(,\s*\d{1,2}:\d{2})?\b/, // "6/21/2018 Paper A(1) Test 1" / "04/11/2024, 21:51 ..." page headers
  /spmmcourse\.com\/mod\/quiz\/review\.php/, // footer URL (+ optional "[24/07/2022 8:52 PM]" / "2/58")
  /: Attempt review\s*$/, // page-top quiz title
  /^Flag(\s+question)?$/,
  /^question$/, // wrapped "Flag question" fragment (capital-Q "Question" is the 2024 marker)
  /^Not answered$/,
  /^(Answered|Correct|Incorrect|Partially correct)$/,
  /^Marked out of/,
  /^Mark [\d.]+ out of [\d.]+$/,
  /^Finish review$/,
  /^(PREVIOUS |NEXT )?ACTIVITY\b/,
  /^Jump( to\.\.\.)?( to\.\.\.)?$/,
  /^©\s*\d{4}\s*SPMM Course/,
  /^Refund Policy/,
  /^Right-click is disabled/,
];

/** Same visual row: vertical centres within 6pt (the big "Question N" digits sit a few pt off the label). */
function sameRow(a: Word, b: Word): boolean {
  return Math.abs((a.y0 + a.y1) / 2 - (b.y0 + b.y1) / 2) < 6;
}

function isNoise(text: string): boolean {
  const t = text.trim();
  return NOISE_LINE.some((re) => re.test(t));
}

function detectGutter(pages: WordPage[]): number {
  const gutters: number[] = [];
  for (const page of pages) {
    for (const w of page.words) {
      if (w.t !== "Question") continue;
      const num = page.words.find(
        (n) => /^\d+$/.test(n.t) && sameRow(n, w) && n.x0 > w.x1 && n.x0 - w.x1 < 12
      );
      if (!num) continue;
      // Words on the same row to the right of the number, separated by a real column gap.
      const right = page.words.filter((r) => sameRow(r, w) && r.x0 > num.x1 + 15);
      if (right.length) gutters.push(Math.min(...right.map((r) => r.x0)) - 4);
    }
  }
  if (gutters.length < 3) return 0;
  gutters.sort((a, b) => a - b);
  return gutters[Math.floor(gutters.length / 2)];
}

function stripChoosePlaceholders(words: Word[]): Word[] {
  // The Moodle EMI dropdown renders as a literal "Choose..." placeholder — no information.
  return words.filter((w) => w.t !== "Choose...");
}

export function attemptReviewPages(absPath: string): string[] {
  const pages = extractWordPages(absPath);
  const G = detectGutter(pages);
  // Radio-indent state persists across pages: a question's options can run onto the next page.
  let selectX: number | null = null;
  // 2024 set: unnumbered "Question" headers, "Theme:/Lead-in:" EMIs whose item rows carry the
  // attempt's chosen answer in a right-hand column, and a standalone ":" row before the real answers.
  const hasTheme = pages.some((pg) => pg.words.some((w) => w.t === "Theme:"));
  let seq = 0;
  let inTheme = false;
  let explanationInserted = false;
  let lastWasItem = false;
  return pages.map((page, pageIdx) => {
    // Page header/footer noise is removed before the gutter split, and by baseline (y0), not by
    // row grouping: the mocks' header ("6/21/2018 ... Paper A(1) Test 3") sits within a few pt of
    // the first body line on some pages, so a row-based approach merges the two and splices header
    // words into the stem. Header/footer words all share one exact y0 with an anchor token (a date,
    // the review URL, or the "Attempt review" page title), so that identifies them without touching
    // neighbouring body text. The footer URL also wraps across several words that straddle the
    // gutter, which is the other reason this must run on the full-width word set.
    const anchorY: number[] = [];
    page.words.forEach((w, i) => {
      const next = page.words[i + 1];
      if (
        /^\d{1,2}\/\d{1,2}\/\d{2,4},?$/.test(w.t) ||
        /spmmcourse\.com/.test(w.t) ||
        (w.t === "Attempt" && next?.t === "review") ||
        /^©$/.test(w.t)
      )
        anchorY.push(w.y0);
    });
    const noiseWords = new Set<Word>();
    for (const w of page.words) if (anchorY.some((y) => Math.abs(y - w.y0) < 0.08)) noiseWords.add(w);
    const words = stripChoosePlaceholders(page.words.filter((w) => !noiseWords.has(w)));
    let body = words;
    // y = top of the question-number digits; a stem/tag line may start a few pt above it.
    const markers: Array<{ y: number; text: string }> = [];
    if (G > 0) {
      const left = words.filter((w) => w.x1 <= G + 1 || w.x0 < G - 2);
      body = words.filter((w) => !left.includes(w));
      // The question number is a big integer token in the gutter. Keyed off the number alone, not
      // the "Question" label before it: on some pages the label word is missing from the PDF's
      // text layer entirely (confirmed: Descriptive Psychopathology p.35, "Question 73").
      for (const w of left) {
        if (/^\d{1,3}$/.test(w.t)) markers.push({ y: w.y0, text: `Question ${w.t}` });
      }
    }
    const lines: Line[] = buildLines(body).filter((l) => !isNoise(l.text));
    const out: string[] = [];
    const pending = [...markers].sort((a, b) => a.y - b.y);
    let prev: Line | null = null;
    for (let line of lines) {
      while (pending.length && pending[0].y <= (line.y0 + line.y1) / 2 + 6) {
        out.push("", pending.shift()!.text, "");
        selectX = null;
        prev = null;
      }
      if (/^Question \d+$/.test(line.text.trim())) {
        selectX = null; // stacked-layout question header
        prev = null;
      }
      if (hasTheme) {
        const t = line.text.trim();
        if (t === "Question") {
          out.push("", `Question ${++seq}`, "");
          selectX = null;
          inTheme = false;
          explanationInserted = false;
          prev = null;
          continue;
        }
        if (/^Theme:/.test(t)) inTheme = true;
        if (inTheme) {
          const isItem = /^\d+\.\s/.test(t);
          if (isItem) {
            // Drop the attempt's chosen answer: it's a separate text object in the right-hand
            // column whose baseline differs slightly from the item text's (all item words share
            // one exact y0), so it can't be told apart by gap width alone.
            // Not every row differs in baseline, so also cut at the first wide gap (normal word
            // gap is ~3pt, a missing-ligature gap ~6.5pt; the answer column starts >9pt away).
            const y0 = line.words[0].y0;
            let keep = line.words.filter((w) => Math.abs(w.y0 - y0) < 0.25);
            const gapAt = keep.findIndex((w, i) => i > 0 && w.x0 - keep[i - 1].x1 > 9);
            if (gapAt > 0) keep = keep.slice(0, gapAt);
            if (keep.length < line.words.length)
              line = { ...line, words: keep, text: keep.map((w) => w.t).join(" ") };
          } else if (/^(Lead-in:|Theme:)/.test(t) === false && lastWasItem && !explanationInserted) {
            out.push("", "Explanation:");
            explanationInserted = true;
          }
          lastWasItem = isItem;
          if (t === ":") {
            out.push("", "The correct answer is:");
            prev = line;
            continue;
          }
        }
      }
      // Option lines are the run of radio-indented lines right after "Select one:" (the same
      // indent holds for wrapped option text). Exports without an "Explanation:"/"Your answer"
      // label have nothing else to mark where the options end, so close the run with a blank
      // line and keep it free of blank lines internally (spacing between options varies).
      const isOption = selectX !== null && line.x0 >= selectX + 8;
      if (selectX !== null && !isOption && !/^Select one:/.test(line.text)) {
        selectX = null;
        out.push("");
      } else if (!isOption && prev && line.y0 - prev.y1 > 0.55 * (prev.y1 - prev.y0)) {
        out.push("");
      }
      out.push(line.text);
      if (/^Select one:/.test(line.text.trim())) selectX = line.x0;
      prev = line;
    }
    for (const m of pending) out.push("", m.text, "");
    if (pageIdx === pages.length - 1) {
      // Final page: nav-link leftovers ("Applied Neurosciences" = next activity, "Jump to...")
      // follow the last answer, or make up the whole page when the answer ended on the one before.
      const ai = out.map((l) => l.startsWith("The correct answer is:")).lastIndexOf(true);
      if (ai !== -1) {
        let end = ai + 1;
        while (end < out.length && out[end] !== "") end++;
        out.length = end;
      } else if (out.join(" ").split(/\s+/).filter(Boolean).length <= 12) {
        out.length = 0;
      }
    }
    return out.join("\n");
  });
}
