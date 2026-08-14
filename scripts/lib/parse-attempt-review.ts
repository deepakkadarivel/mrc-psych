import type { Question } from "@/lib/types";
import { stripIconGlyphs } from "./pdf-text";

const PAGE_MARK = " PAGE:";
const HEADER_RE = /^\s*\d{1,2}\/\d{1,2}\/\d{2,4},\s*\d{1,2}:\d{2}(\s*[AP]M)?.*$/;
const FOOTER_RE = /^\s*https:\/\/spmmcourse\.com\/mod\/quiz\/review\.php.*\d+\/\d+\s*$/;
// The course-branding footer on the PDF's last page — with no following "Question N" marker to
// bound it, it otherwise leaks into the final question's correctAnswer (see CLAUDE.md quiz fixes).
const COPYRIGHT_RE = /^\s*©\s*\d{4}\s*SPMM Course Limited.*$/;
const REFUND_RE = /^\s*Refund Policy\s*\|\s*Terms\s*&\s*Conditions\s*$/;
const RIGHT_CLICK_RE = /^\s*Right-click is disabled\s*$/;
// The exam-attempt summary block Moodle prints at the top of each mock exam's export — with no
// preceding "Question N" marker of its own, it leaks into the PREVIOUS exam's last question's
// correctAnswer instead (same unbounded-final-chunk issue as the copyright footer above).
const WEEKDAY_DATE = /(Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday), \d{1,2} \w+ \d{4}/;
const STARTED_ON_RE = new RegExp(`^\\s*Started on ${WEEKDAY_DATE.source}.*$`);
const STATE_RE = /^\s*State Finished\s*$/;
const COMPLETED_ON_RE = new RegExp(`^\\s*Completed on ${WEEKDAY_DATE.source}.*$`);
const TIME_TAKEN_RE = /^\s*Time taken \d.*$/;
const GRADE_SUMMARY_RE = /^\s*Grade [\d.]+ out of [\d.]+.*$/;
const FEEDBACK_RE = /^\s*Feedback You are on the right track\..+$/;

const NOISE_LINE_PATTERNS = [
  HEADER_RE,
  FOOTER_RE,
  COPYRIGHT_RE,
  REFUND_RE,
  RIGHT_CLICK_RE,
  STARTED_ON_RE,
  STATE_RE,
  COMPLETED_ON_RE,
  TIME_TAKEN_RE,
  GRADE_SUMMARY_RE,
  FEEDBACK_RE,
];

function stripHeaderFooter(pageText: string): string {
  const lines = pageText.split("\n");
  return lines.filter((l) => !NOISE_LINE_PATTERNS.some((re) => re.test(l))).join("\n");
}

/**
 * pdftotext sometimes wraps one option's text across two physical lines with no blank-line
 * separator from the next option (confirmed: no reliable indentation/positional difference
 * between a wrapped continuation and a genuine new option in this export format — see CLAUDE.md).
 * The one place we have verified, fully-reconstructed text to check against is `correctAnswer`
 * (already rejoined via joinWrapped from "The correct answer is:"), so when it doesn't match any
 * single option, look for a run of consecutive options that concatenate to it and collapse them.
 */
function mergeSplitOption(options: string[], correctAnswer: string): string[] {
  for (let i = 0; i < options.length; i++) {
    for (let j = i + 1; j < options.length && j <= i + 3; j++) {
      const slice = options.slice(i, j + 1);
      if (slice.join(" ") === correctAnswer || slice.join("") === correctAnswer) {
        return [...options.slice(0, i), correctAnswer, ...options.slice(j + 1)];
      }
    }
  }
  return options;
}

/** Rejoins pdftotext's mid-paragraph line wraps into single lines, keeping blank-line paragraph breaks. */
function joinWrapped(text: string): string {
  return stripPageMarks(text)
    .split(/\n\s*\n/)
    .map((para) =>
      para
        .split("\n")
        .map((l) => l.trim().replace(/ {2,}/g, " "))
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function stripPageMarks(text: string): string {
  return text.replace(new RegExp(`${PAGE_MARK}\\d+ `, "g"), "");
}

function pageAt(combined: string, index: number): number {
  const marker = combined.lastIndexOf(PAGE_MARK, index);
  if (marker === -1) return 1;
  const end = combined.indexOf(" ", marker + PAGE_MARK.length);
  return parseInt(combined.slice(marker + PAGE_MARK.length, end), 10);
}

/**
 * Parses the Moodle "Attempt review" quiz-export format shared by question_bank/,
 * mocks/, and PDF past-paper recalls. Returns raw parsed questions without topic/id
 * assigned — the caller stamps those, since one parser serves many source files.
 */
export function parseAttemptReview(
  pages: string[],
  sourceFile: string
): Array<Omit<Question, "id" | "topic">> {
  let combined = "";
  pages.forEach((pageText, idx) => {
    combined += `${PAGE_MARK}${idx + 1} \n${stripIconGlyphs(stripHeaderFooter(pageText))}\n`;
  });

  const questionStarts = [...combined.matchAll(/\n\s*Question\s+(\d+)\s*\n/g)];
  const results: Array<Omit<Question, "id" | "topic">> = [];

  for (let i = 0; i < questionStarts.length; i++) {
    const start = questionStarts[i];
    const questionNumber = parseInt(start[1], 10);
    const chunkStart = start.index! + start[0].length;
    const chunkEnd = i + 1 < questionStarts.length ? questionStarts[i + 1].index! : combined.length;
    const chunk = combined.slice(chunkStart, chunkEnd);
    const page = pageAt(combined, start.index!);

    // Drop the "Not answered / Marked out of X.XX" status block that precedes the stem.
    const body = chunk.replace(/^\s*(Not answered|Answered|Correct|Partially correct|Incorrect)?\s*\n?\s*Marked out of [\d.]+\s*\n/, "");

    const selectOneIdx = body.indexOf("Select one:");
    const yourAnswerMatch = body.match(/Your answer is (?:correct|incorrect)\.?/);
    const explanationMatch = body.match(/\n\s*Explanation:\s*\n/);
    const refMatch = body.match(/\n\s*Ref:\s*/);
    const correctAnswerMatch = body.match(/\n\s*The correct answer is:\s*/);

    const stemEnd =
      selectOneIdx !== -1 ? selectOneIdx : yourAnswerMatch?.index ?? explanationMatch?.index ?? body.length;
    const stem = joinWrapped(body.slice(0, stemEnd).replace("Select one:", ""));

    let options: string[] = [];
    let format: "SBA" | "EMI" = "EMI";
    if (selectOneIdx !== -1) {
      format = "SBA";
      const optionsEnd = yourAnswerMatch?.index ?? explanationMatch?.index ?? body.length;
      const optionsBlock = body.slice(selectOneIdx + "Select one:".length, optionsEnd);
      options = optionsBlock
        .split("\n")
        .map((l) => stripPageMarks(l).trim())
        .filter(Boolean);
    }

    // Most files label the explanation with "Explanation:"; some (e.g. the Advanced
    // Statistics bank) omit the label and put the explanation straight after
    // "Your answer is (in)correct." — fall back to that span when there's no label.
    let explanation = "";
    const expStart = explanationMatch
      ? explanationMatch.index! + explanationMatch[0].length
      : yourAnswerMatch
        ? yourAnswerMatch.index! + yourAnswerMatch[0].length
        : undefined;
    if (expStart !== undefined) {
      const expEnd = refMatch?.index ?? correctAnswerMatch?.index ?? body.length;
      explanation = joinWrapped(body.slice(expStart, expEnd));
    }

    let reference: string | undefined;
    if (refMatch) {
      const refEnd = correctAnswerMatch?.index ?? body.length;
      reference = joinWrapped(body.slice(refMatch.index! + refMatch[0].length, refEnd)) || undefined;
    }

    let correctAnswer = "";
    if (correctAnswerMatch) {
      correctAnswer = joinWrapped(body.slice(correctAnswerMatch.index! + correctAnswerMatch[0].length));
    }

    if (format === "SBA" && correctAnswer && !options.includes(correctAnswer)) {
      options = mergeSplitOption(options, correctAnswer);
    }

    results.push({
      format,
      stem,
      options,
      correctAnswer,
      explanation,
      reference,
      source: { file: sourceFile, page, questionNumber },
    });
  }

  return results;
}
