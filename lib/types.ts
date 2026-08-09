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

// A fact cited to one of the two user-supplied recall-analysis PDFs
// (resources/paper-b/exam-syllabic/MRCPsych_Paper_B_Trend_Analysis.pdf /
// MRCPsych_Strategy_Guide.pdf) — real {file,page} citations, same discipline as every other
// Source in this app, just a different corpus than books/question_bank.
export interface PriorityFact {
  text: string;
  source: Source;
}

// One of the ~12 broad domains both recall-analysis documents independently converge on (their
// own taxonomy — cuts across this app's 15 book-topics and the syllabus's 9 official sections,
// since it's organised by how often each domain actually recurs across real past recall papers,
// not by curriculum structure). `repeatedFacts` are the specific facts/traps the source itself
// flags as recurring ("every session", "CONSISTENT", "frequently tested", "exam favourite") —
// picked, not paraphrased-then-forgotten-where-from; each keeps its own page citation.
export interface PriorityDomain {
  id: string;
  title: string;
  tier: string;
  percentOfPaper: string;
  percentRevisionTime: string;
  effortReward: string;
  tierSources: Source[];
  repeatedFacts: PriorityFact[];
  expectedNote?: PriorityFact;
}

export interface PriorityAnalysis {
  intro: string;
  goldenRules: PriorityFact[];
  domains: PriorityDomain[];
}

// A point grounded in exactly one of two ways: `source` when it's traceable to a real
// {file,page[,questionNumber]} in resources/paper-b/ (a mock-exam question, a recall-file page),
// or `url` when it's genuinely external (a web source). Never both omitted — every point here
// must be attributable to something real, not house knowledge asserted as if it were sourced.
export interface CitedPoint {
  text: string;
  source?: Source;
  url?: string;
}

export interface IndependentTopicGroup {
  topic: string;
  points: CitedPoint[];
}

// This app's OWN independent trend analysis — built by mechanically counting term frequency
// across the already-parsed, already-cited mock-exam corpus (content/questions/mock-*.json, 1578
// real questions) and by reading this app's own previous-year recall files
// (resources/paper-b/previous-year-question-source/), rather than citing the two user-supplied
// analysis PDFs (see PriorityAnalysis above). A handful of `url`-cited points supplement this
// with current external commentary where a web search turned up something genuinely new.
export interface IndependentAnalysis {
  methodology: string;
  repeatedTopics: CitedPoint[];
  concentrationTopics: CitedPoint[];
  expectedTopics: CitedPoint[];
  topicGroups: IndependentTopicGroup[];
}

export interface ExamTrendsData {
  weightSource: ExternalNote;
  priorityAnalysis: PriorityAnalysis;
  independentAnalysis: IndependentAnalysis;
  sections: ExamTrendSection[];
}
