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

export interface Section {
  id: string;
  title: string;
  intro?: string;
  blocks: Block[];
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
