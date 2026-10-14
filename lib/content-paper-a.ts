import fs from "node:fs";
import path from "node:path";
import manifestJson from "@/content/paper-a/manifest.json";
import type {
  NoteBlock,
  PaperAManifest,
  PaperAQuizSet,
  PaperATrendsData,
  Question,
  RecallCluster,
  RecallsFile,
  StudyGuide,
  TopicManifestEntry,
} from "@/lib/types";

// Paper A content lives under content/paper-a/ with ids prefixed "pa-" (see PaperAManifest), so
// nothing here can collide with Paper B's lib/content.ts accessors, URLs or storage keys.
const manifest = manifestJson as PaperAManifest;
const DIR = path.join(process.cwd(), "content/paper-a");

export const PAPER_A_BASE = "/paper-a";

export function getPaperAManifest(): PaperAManifest {
  return manifest;
}

export function getPaperATopic(id: string): TopicManifestEntry | undefined {
  return manifest.topics.find((t) => t.id === id);
}

export function getPaperAQuizSet(id: string): PaperAQuizSet | undefined {
  return manifest.quizSets.find((s) => s.id === id);
}

function readJson<T>(rel: string): T | null {
  const full = path.join(DIR, rel);
  return fs.existsSync(full) ? (JSON.parse(fs.readFileSync(full, "utf-8")) as T) : null;
}

export function getPaperANotes(topicId: string): NoteBlock[] {
  return readJson<NoteBlock[]>(`notes/${topicId}.json`) ?? [];
}

/** Questions for either a topic bank (`pa-classification`) or a standalone set (`pa-mock-1-3`). */
export function getPaperAQuestions(id: string): Question[] {
  return readJson<Question[]>(`questions/${id}.json`) ?? [];
}

export function getPaperARecalls(): RecallsFile {
  return readJson<RecallsFile>("recalls.json") ?? { sittings: [], points: [] };
}

export function getPaperARecallClusters(): RecallCluster[] {
  return readJson<{ clusters: RecallCluster[] }>("recall-clusters.json")?.clusters ?? [];
}

export function getPaperATrends(): PaperATrendsData | null {
  return readJson<PaperATrendsData>("exam-trends.json");
}

export function getPaperAStudyGuide(topicId: string): StudyGuide | null {
  return readJson<StudyGuide>(`study-guides/${topicId}.json`);
}

/** Every id that has a question file — topic banks with questions plus all standalone sets. */
export function getPaperAQuizIds(): Array<{ id: string; title: string; kind: "topic" | "set" }> {
  const topics = manifest.topics
    .filter((t) => t.questionBankFiles.length > 0)
    .map((t) => ({ id: t.id, title: t.title, kind: "topic" as const }));
  const sets = manifest.quizSets.map((s) => ({ id: s.id, title: s.title, kind: "set" as const }));
  return [...topics, ...sets];
}
