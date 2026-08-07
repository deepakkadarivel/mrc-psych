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
