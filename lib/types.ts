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

export interface StudyGuide {
  topic: string;
  condensedNotes: Array<{
    heading: string;
    bullets: Array<{ text: string; source: Source }>;
  }>;
  tables: Array<{
    title: string;
    columns: string[];
    rows: string[][];
    sources: Source[];
    highYield?: boolean;
  }>;
  mnemonics: Array<{
    forTopic: string;
    mnemonic: string;
    expansion: string[];
    sourced: boolean;
    source?: Source;
  }>;
  examinerTraps: Array<{
    text: string;
    format: "SBA" | "EMI" | "Both";
    source: Source;
  }>;
  gaps: Array<{ subtopic: string; note: string }>;
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
