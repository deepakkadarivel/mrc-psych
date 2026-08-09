import fs from "node:fs";
import path from "node:path";
import manifestJson from "@/content/manifest.json";
import examTrendsJson from "@/content/exam-trends.json";
import type { ExamTrendsData, Manifest, NoteBlock, Question, StudyGuide } from "@/lib/types";

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
