import { execFileSync } from "node:child_process";
import fs from "node:fs";

/**
 * Position-aware extraction for the Paper A PDFs (`pdftotext -bbox`, one entry per word with
 * coordinates), used instead of `-layout` text because Paper A's Moodle exports put the
 * "Question N / Not answered / Marked out of" gutter in a left column *beside* the stem, so
 * `-layout` interleaves gutter and stem on the same physical lines, and the mocks' page
 * header/footer is spliced into body text. With coordinates we can split the gutter column
 * off cleanly and rebuild lines ourselves.
 *
 * It also repairs the ligature loss seen in these PDFs: the fi/ff/fl glyph is simply absent
 * from the text layer ("classi ed", "Korsako syndrome"), leaving a measurable gap inside the
 * word. See `repairLigatureGaps`.
 */

export interface Word {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  t: string;
}
export interface WordPage {
  width: number;
  height: number;
  words: Word[];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function extractWordPages(absPath: string): WordPage[] {
  const xml = execFileSync("pdftotext", ["-bbox", absPath, "-"], {
    maxBuffer: 1024 * 1024 * 400,
    stdio: ["ignore", "pipe", "ignore"], // pdftotext prints harmless "Bad block header" warnings
  }).toString("utf-8");
  const pages: WordPage[] = [];
  const pageRe = /<page width="([\d.]+)" height="([\d.]+)">([\s\S]*?)<\/page>/g;
  const wordRe = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  for (const pm of xml.matchAll(pageRe)) {
    const words: Word[] = [];
    for (const wm of pm[3].matchAll(wordRe)) {
      const t = decodeEntities(wm[5]).replace(/[-]/g, "");
      if (!t.trim()) continue; // icon-font glyphs (correct/incorrect ticks) extract as PUA/empty
      words.push({ x0: +wm[1], y0: +wm[2], x1: +wm[3], y1: +wm[4], t });
    }
    pages.push({ width: +pm[1], height: +pm[2], words });
  }
  return pages;
}

export interface Line {
  y0: number;
  y1: number;
  x0: number;
  words: Word[];
  text: string;
}

let dictionary: Set<string> | null = null;
function loadDictionary(): Set<string> {
  if (!dictionary) {
    const raw = fs.existsSync("/usr/share/dict/words") ? fs.readFileSync("/usr/share/dict/words", "utf-8") : "";
    dictionary = new Set(raw.split("\n").map((s) => s.trim().toLowerCase()));
  }
  return dictionary;
}

/** /usr/share/dict/words has no inflected forms ("defining", "differentiates"), so also accept a
 *  word whose common-suffix-stripped base is in the list. Used only to *confirm* a ligature guess. */
function isWord(w: string): boolean {
  const d = loadDictionary();
  const lw = w.toLowerCase();
  if (d.has(lw)) return true;
  const bases: string[] = [];
  const strip = (suf: string, ...add: string[]) => {
    if (lw.endsWith(suf) && lw.length - suf.length >= 3) for (const a of add) bases.push(lw.slice(0, -suf.length) + a);
  };
  strip("s", "");
  strip("es", "", "e");
  strip("ies", "y");
  strip("ed", "", "e");
  strip("ied", "y");
  strip("d", "");
  strip("ing", "", "e");
  strip("ly", "");
  strip("er", "", "e");
  strip("ers", "", "e");
  strip("ation", "e", "");
  strip("ations", "e", "");
  return bases.some((b) => d.has(b));
}

const LIGATURES = ["fi", "ff", "fl", "ffi", "ffl"];

/** Counts for reporting how many ligature gaps were closed vs. left as a plain space. */
export const ligatureStats = { resolved: 0, unresolved: 0 };
/** Every repair made, as the resulting token — lets a reviewer audit for wrong guesses. */
export const ligatureLog = new Map<string, number>();
const logRepair = (t: string) => ligatureLog.set(t, (ligatureLog.get(t) ?? 0) + 1);

/**
 * The fi/ff/fl glyph is missing from these PDFs' text layer, leaving a gap where it should be:
 *   mid-word   "classi" _ "ed"      gap ~ 1 ligature width (~2x a normal word space)
 *   word-start "sodium" _ "ows"     gap ~ ligature + normal space (~3-4x)  -> "flows"
 *   word-end   "sta" _ "compared"   same ~3-4x gap                          -> "staff"
 * A gap is only closed when exactly one ligature candidate yields a dictionary word AND (for the
 * edge cases) the bare fragment is not itself a word, so we never guess among alternatives —
 * unresolved gaps stay as a plain space (readable, not wrong).
 */
function repairLigatureGaps(words: Word[]): string {
  if (words.length === 0) return "";
  const gaps = words.slice(1).map((w, i) => w.x0 - words[i].x1);
  const sorted = [...gaps].sort((a, b) => a - b);
  // Typical inter-word gap for this line (lower quantile, robust to a few wide gaps).
  const typical = sorted.length ? Math.max(sorted[Math.floor(sorted.length * 0.4)], 1) : 3;
  let out = words[0].t;
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const cur = words[i];
    const gap = gaps[i - 1];
    const left = prev.t.match(/([A-Za-z]+)$/);
    const right = cur.t.match(/^([A-Za-z]+)/);
    let handled = false;
    if (gap > typical * 1.8 && gap <= typical * 3.2 && gap < 9 && left && right && /^[a-z]/.test(right[1])) {
      const hits = LIGATURES.filter((lg) => isWord(left[1] + lg + right[1]));
      if (hits.length === 1) {
        out += hits[0] + cur.t;
        logRepair(left[1] + hits[0] + right[1]);
        ligatureStats.resolved++;
        handled = true;
      } else ligatureStats.unresolved++;
    } else if (gap > typical * 3.2 && gap < typical * 5.5 && (left || right)) {
      // "ffi"/"ffl" are wide glyphs, so a *mid-word* gap can land in the edge range too ("a"+"ffi"+
      // "nity" = affinity, not "a finity"): a mid-word reading wins whenever one exists.
      const midHits = left && right && /^[a-z]/.test(right[1]) ? LIGATURES.filter((lg) => isWord(left[1] + lg + right[1])) : [];
      if (midHits.length === 1) {
        out += midHits[0] + cur.t;
        logRepair(left![1] + midHits[0] + right![1]);
        ligatureStats.resolved++;
        continue;
      }
      const endHits = left && !isWord(left[1]) ? LIGATURES.filter((lg) => isWord(left[1] + lg)) : [];
      const startHits = right && /^[a-z]/.test(right[1]) && !isWord(right[1]) ? LIGATURES.filter((lg) => isWord(lg + right[1])) : [];
      if (endHits.length + startHits.length === 1) {
        if (endHits.length) {
          out += endHits[0] + " " + cur.t;
          logRepair(left![1] + endHits[0] + " (end)");
        } else {
          out += " " + startHits[0] + cur.t;
          logRepair(startHits[0] + right![1] + " (start)");
        }
        ligatureStats.resolved++;
        handled = true;
      }
    }
    if (!handled) out += " " + cur.t;
  }
  return out;
}

export function buildLines(words: Word[], tolerance = 3): Line[] {
  const sorted = [...words].sort((a, b) => a.y0 + a.y1 - (b.y0 + b.y1));
  const rows: Word[][] = [];
  let rowCenter = -1e9;
  for (const w of sorted) {
    const c = (w.y0 + w.y1) / 2;
    if (rows.length && Math.abs(c - rowCenter) <= tolerance) {
      const row = rows[rows.length - 1];
      row.push(w);
      rowCenter = (rowCenter * (row.length - 1) + c) / row.length;
    } else {
      rows.push([w]);
      rowCenter = c;
    }
  }
  return rows.map((r) => {
    r.sort((a, b) => a.x0 - b.x0);
    return {
      y0: Math.min(...r.map((w) => w.y0)),
      y1: Math.max(...r.map((w) => w.y1)),
      x0: r[0].x0,
      words: r,
      text: repairLigatureGaps(r),
    };
  });
}
