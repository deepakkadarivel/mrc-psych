export interface Source {
  file: string;
  page: number;
  questionNumber?: number;
}

export interface NoteBlock {
  id: string;
  topic: string;
  heading: string;
  text: string;
  source: Source;
}

export interface Question {
  id: string;
  topic: string;
  format: "SBA" | "EMI";
  stem: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  reference?: string;
  source: Source;
}

export type CategoryColor = "teal" | "orange" | "red" | "gray" | "blue" | "purple";

export interface ParagraphBlock {
  type: "paragraph";
  text: string;
  source: Source;
}

export interface TableBlock {
  type: "table";
  title?: string;
  category?: { label: string; color: CategoryColor };
  columns: string[];
  rows: string[][];
  sources: Source[];
  highYield?: boolean;
}

export interface ComparisonBlock {
  type: "comparison";
  title: string;
  columns: string[];
  rows: string[][];
  sources: Source[];
}

export interface MnemonicBlock {
  type: "mnemonic";
  forTopic: string;
  mnemonic: string;
  expansion: string[];
  sourced: boolean;
  source?: Source;
}

export interface TrapBlock {
  type: "trap";
  text: string;
  format: "SBA" | "EMI" | "Both";
  source: Source;
}

export interface TrapListBlock {
  type: "trap-list";
  title: string;
  items: Array<{ text: string; source: Source }>;
}

export interface GapBlock {
  type: "gap";
  subtopic: string;
  note: string;
}

export type Block =
  | ParagraphBlock
  | TableBlock
  | ComparisonBlock
  | MnemonicBlock
  | TrapBlock
  | TrapListBlock
  | GapBlock;

export interface ConciseBullet {
  text: string;
  source: Source;
}

// A compact label/value pair for facts that are naturally "metric -> number" (a prevalence rate,
// an NNT, a ratio) rather than a sentence — e.g. "1-year prevalence" / "5.3%". Kept separate from
// ConciseBullet rather than trying to auto-detect this shape from bullet text: whether a fact
// reads better as a row or a sentence is an editorial call made when the concise content is
// written, not a pattern to infer mechanically.
export interface ConciseFact {
  label: string;
  value: string;
  source: Source;
}

// The "Concise Guide" tab's per-section content: a handful of exam-focused bullets, each
// compressed from (and citing the exact same source as) one of this section's own `blocks` —
// never independently sourced. `highlightBlockIndices` points back into this same `Section`'s
// `blocks` array to resurface already-concise blocks (tables/mnemonics/traps) verbatim instead of
// duplicating them as prose.
export interface ConciseSection {
  bullets: ConciseBullet[];
  facts?: ConciseFact[];
  highlightBlockIndices?: number[];
}

export interface Section {
  id: string;
  title: string;
  intro?: string;
  blocks: Block[];
  concise?: ConciseSection;
}

export interface StudyGuide {
  topic: string;
  sections: Section[];
}

export interface TopicManifestEntry {
  id: string;
  title: string;
  area: "clinical" | "research-and-stats";
  bookFiles: string[];
  questionBankFiles: string[];
  gap?: string;
}

export interface Manifest {
  examDate: string;
  topics: TopicManifestEntry[];
}

// A claim that can't carry a {file,page} Source back into resources/paper-b/ — either it's an
// external web source (cited by `url`, genuinely fetched, not fabricated) or general exam-prep
// knowledge with no single citable source at all. Same discipline as MnemonicBlock's
// `sourced: false`: never presented as if it were a corpus-verified fact.
export interface ExternalNote {
  text: string;
  url?: string;
}

export interface RecurringTrap {
  text: string;
  source: Source;
}

export interface ExamTrendTopicSignal {
  topicId: string;
  topicTitle: string;
  questionBankCount: number;
  highYieldTableCount: number;
  recurringTraps: RecurringTrap[];
}

// One page per official RCPsych Paper B syllabus section (see the mark-weighted breakdown the
// user supplied, cross-checked against resources/paper-b/exam-syllabic/). `questionBankCount`/
// `highYieldTableCount`/`recurringTraps` are computed directly from this app's own already-cited
// content/questions and content/study-guides — real counts and verbatim traps, not new claims.
export interface ExamTrendSection {
  id: string;
  syllabusNumber: string;
  title: string;
  weightPercent: number;
  weightMarks: number;
  syllabusSource: Source;
  mappedTopics: string[];
  totalQuestionBankCount: number;
  topicSignals: ExamTrendTopicSignal[];
}

export interface ExamTrendsData {
  weightSource: ExternalNote;
  externalStrategyNotes: ExternalNote[];
  sections: ExamTrendSection[];
}
