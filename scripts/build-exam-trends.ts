import fs from "node:fs";
import path from "node:path";
import manifest from "../content/manifest.json";
import type { ExamTrendSection, ExamTrendsData, ExamTrendTopicSignal, Question, StudyGuide } from "@/lib/types";

// Syllabus sections 6-14 of resources/paper-b/exam-syllabic/exams-syllabic-curriculum-mrcpsych-
// february-2021.pdf, one per official RCPsych Paper B blueprint category. Page numbers verified
// by grepping the actual extracted PDF text for each heading (see session notes) — not guessed.
// mappedTopics matches this repo's own manifest.json topic ids, which were themselves named after
// this same syllabus numbering (books/7-1-..., 7-2-..., 7-3-..., 7-4-... = syllabus section 7's
// four subtopics; 14 = "RESEARCH METHODS, STATISTICS, CRITICAL REVIEW AND EVIDENCE-BASED
// PRACTICE... published as a separate syllabus", covering all four research-and-stats topics).
// Percent/marks match the breakdown the user supplied, cross-checked against an independent public
// source (edubros.org's MRCPsych Paper B guide) via web search — see weightSource below.
const SECTIONS: Array<{
  id: string;
  syllabusNumber: string;
  title: string;
  weightPercent: number;
  weightMarks: number;
  syllabusPage: number;
  mappedTopics: string[];
}> = [
  {
    id: "organisation-of-services",
    syllabusNumber: "6",
    title: "Organisation and Delivery of Psychiatric Services",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 13,
    mappedTopics: ["psychiatric-services"],
  },
  {
    id: "general-adult-psychiatry",
    syllabusNumber: "7",
    title: "General Adult Psychiatry",
    weightPercent: 20,
    weightMarks: 30,
    syllabusPage: 14,
    mappedTopics: ["adult-psychiatry", "perinatal-psychiatry", "liaison-psychiatry", "emergency-psychiatry"],
  },
  {
    id: "old-age-psychiatry",
    syllabusNumber: "8",
    title: "Old Age Psychiatry",
    weightPercent: 9,
    weightMarks: 14,
    syllabusPage: 16,
    mappedTopics: ["old-age-psychiatry"],
  },
  {
    id: "psychotherapy",
    syllabusNumber: "9",
    title: "Psychotherapy",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 18,
    mappedTopics: ["psychotherapy"],
  },
  {
    id: "child-and-adolescent-psychiatry",
    syllabusNumber: "10",
    title: "Child and Adolescent Psychiatry",
    weightPercent: 9,
    weightMarks: 14,
    syllabusPage: 20,
    mappedTopics: ["child-psychiatry"],
  },
  {
    id: "substance-misuse-addictions",
    syllabusNumber: "11",
    title: "Substance Misuse / Addictions",
    weightPercent: 6.5,
    weightMarks: 10,
    syllabusPage: 22,
    mappedTopics: ["addiction-psychiatry"],
  },
  {
    id: "forensic-psychiatry",
    syllabusNumber: "12",
    title: "Forensic Psychiatry",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 22,
    mappedTopics: ["forensic-psychiatry"],
  },
  {
    id: "learning-disability",
    syllabusNumber: "13",
    title: "Psychiatry of Learning Disability",
    weightPercent: 5.5,
    weightMarks: 8,
    syllabusPage: 23,
    mappedTopics: ["learning-disability"],
  },
  {
    id: "critical-review",
    syllabusNumber: "14",
    title: "Critical Review",
    weightPercent: 33.5,
    weightMarks: 50,
    syllabusPage: 24,
    mappedTopics: ["research-methods", "evidence-based-medicine", "statistics", "epidemiology"],
  },
];

// Generic, clearly-external exam-strategy notes gathered via web search (see session notes) —
// not derived from anything in resources/paper-b/, so no {file,page} Source. Kept few and generic
// rather than inventing per-section specifics an internet search can't actually substantiate.
const EXTERNAL_STRATEGY_NOTES: ExamTrendsData["externalStrategyNotes"] = [
  {
    text: "Paper B is ~150 questions in a roughly 2:1 mix of MCQs to EMIs, and is commonly described as split about evenly between clinical psychiatry and statistics/critical appraisal in terms of study effort, even though critical review alone is 33.5% of marks.",
    url: "https://passmrcpsych.com/the-mrcpsych-paper-b-a-comprehensive-guide/",
  },
  {
    text: "Clinical questions lean heavily on NICE guideline stepwise-management knowledge (e.g. first/second-line drug choice sequences for mood, psychotic and anxiety disorders) rather than obscure facts.",
    url: "https://edubros.org/mrcpsych-paper-b-complete-guide/",
  },
  {
    text: "Past-paper recalls are widely cited by successful candidates as the best signal for which exact topics repeat year to year — cross-check this app's own recurring-trap lists below against resources/paper-b/previous-year-question-source/ (see the Recalls page) for the most current signal.",
    url: "https://mindrecalls.com/paper-b-study-pattern/",
  },
];

const root = process.cwd();
const CONTENT_DIR = path.join(root, "content");

function readJsonIfExists<T>(relPath: string): T | null {
  const full = path.join(CONTENT_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
}

function buildTopicSignal(topicId: string): ExamTrendTopicSignal {
  const topic = manifest.topics.find((t) => t.id === topicId);
  if (!topic) throw new Error(`Unknown topic id in SECTIONS mapping: ${topicId}`);

  const questions = readJsonIfExists<Question[]>(`questions/${topicId}.json`) ?? [];
  const guide = readJsonIfExists<StudyGuide>(`study-guides/${topicId}.json`);

  let highYieldTableCount = 0;
  const recurringTraps: ExamTrendTopicSignal["recurringTraps"] = [];
  for (const section of guide?.sections ?? []) {
    for (const block of section.blocks) {
      if (block.type === "table" && block.highYield) highYieldTableCount++;
      if (block.type === "trap") recurringTraps.push({ text: block.text, source: block.source });
      if (block.type === "trap-list") {
        for (const item of block.items) recurringTraps.push({ text: item.text, source: item.source });
      }
    }
  }

  return {
    topicId,
    topicTitle: topic.title,
    questionBankCount: questions.length,
    highYieldTableCount,
    // Cap at 6 per topic — this is a study-cram list, not a dump of everything already
    // available in full on the topic's own study guide page.
    recurringTraps: recurringTraps.slice(0, 6),
  };
}

const sections: ExamTrendSection[] = SECTIONS.map((s) => {
  const topicSignals = s.mappedTopics.map(buildTopicSignal);
  return {
    id: s.id,
    syllabusNumber: s.syllabusNumber,
    title: s.title,
    weightPercent: s.weightPercent,
    weightMarks: s.weightMarks,
    syllabusSource: {
      file: "exam-syllabic/exams-syllabic-curriculum-mrcpsych-february-2021.pdf",
      page: s.syllabusPage,
    },
    mappedTopics: s.mappedTopics,
    totalQuestionBankCount: topicSignals.reduce((sum, t) => sum + t.questionBankCount, 0),
    topicSignals,
  };
});

const data: ExamTrendsData = {
  weightSource: {
    text: "Mark/percentage breakdown per syllabus section, per the RCPsych Paper B blueprint (confirmed against an independent published guide, not just the syllabus PDF, which does not itself print a marks table).",
    url: "https://edubros.org/mrcpsych-paper-b-complete-guide/",
  },
  externalStrategyNotes: EXTERNAL_STRATEGY_NOTES,
  sections,
};

const outPath = path.join(CONTENT_DIR, "exam-trends.json");
fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + "\n");
console.log(`Wrote ${sections.length} sections to ${outPath}`);
for (const s of sections) {
  console.log(`  ${s.syllabusNumber}. ${s.title}: ${s.totalQuestionBankCount} questions across ${s.mappedTopics.length} topic(s)`);
}
