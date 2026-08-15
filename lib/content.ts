import fs from "node:fs";
import path from "node:path";
import manifestJson from "@/content/manifest.json";
import examTrendsJson from "@/content/exam-trends.json";
import referencesJson from "@/content/references.json";
import type {
  ExamTrendsData,
  Manifest,
  NoteBlock,
  Question,
  ReferenceFile,
  StudyGuide,
} from "@/lib/types";

const manifest = manifestJson as Manifest;
const CONTENT_DIR = path.join(process.cwd(), "content");

export function getManifest(): Manifest {
  return manifest;
}

export function getTopic(topicId: string) {
  return manifest.topics.find((t) => t.id === topicId);
}

function readJsonIfExists<T>(relPath: string): T | null {
  const full = path.join(CONTENT_DIR, relPath);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8")) as T;
}

export function getTopicNotes(topicId: string): NoteBlock[] {
  return readJsonIfExists<NoteBlock[]>(`notes/${topicId}.json`) ?? [];
}

export function getTopicQuestions(topicId: string): Question[] {
  return readJsonIfExists<Question[]>(`questions/${topicId}.json`) ?? [];
}

export function getStudyGuide(topicId: string): StudyGuide | null {
  return readJsonIfExists<StudyGuide>(`study-guides/${topicId}.json`);
}

export const MOCK_EXAM_COUNT = 14;

export function getMockQuestions(examId: number): Question[] {
  return readJsonIfExists<Question[]>(`questions/mock-${examId}.json`) ?? [];
}

export function getExamTrends(): ExamTrendsData {
  return examTrendsJson as ExamTrendsData;
}

export function getReferences(): ReferenceFile[] {
  return referencesJson as ReferenceFile[];
}

// "Stats MCQ" reuses questions already extracted under statistics/research-methods/
// evidence-based-medicine/epidemiology (see manifest.json's supplementaryQuestionBankFiles
// note: question_bank/STAT MCQ/* is a byte-for-byte duplicate export of those same PDFs,
// just split one-file-per-topic instead of grouped). No separate parsing needed — group the
// existing questions by their source file's stem, which matches a STAT MCQ filename 1:1.
const STAT_MCQ_SOURCE_TOPICS = [
  "statistics",
  "research-methods",
  "evidence-based-medicine",
  "epidemiology",
] as const;

function sourceStem(file: string): string {
  return path
    .basename(file, ".pdf")
    .replace(/_ Attempt review$/i, "")
    .trim();
}

function slugify(stem: string): string {
  return stem
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface StatMcqTopic {
  slug: string;
  title: string;
  count: number;
}

function statMcqGroups(): Map<string, { title: string; questions: Question[] }> {
  const groups = new Map<string, { title: string; questions: Question[] }>();
  for (const topicId of STAT_MCQ_SOURCE_TOPICS) {
    for (const q of getTopicQuestions(topicId)) {
      const stem = sourceStem(q.source.file);
      const slug = slugify(stem);
      const group = groups.get(slug) ?? { title: stem, questions: [] };
      group.questions.push(q);
      groups.set(slug, group);
    }
  }
  return groups;
}

export function getStatMcqTopics(): StatMcqTopic[] {
  return [...statMcqGroups().entries()]
    .map(([slug, { title, questions }]) => ({ slug, title, count: questions.length }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function getStatMcqQuestions(slug: string): Question[] {
  return statMcqGroups().get(slug)?.questions ?? [];
}
