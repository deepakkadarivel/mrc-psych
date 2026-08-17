import { loadQuizProgress } from "./quiz-progress-store";
import { trackerStore, type TrackerEntry } from "./tracker-store";

export interface QuizStatus {
  answered: number;
  total: number;
  remaining: number;
  attempts: TrackerEntry[]; // newest first
}

// localStorage-only, so call from a client component after mount — see quiz-view.tsx's own
// "resolve client-side after first paint" note for why (avoids a hydration mismatch).
export function getQuizStatus(quizId: string, total: number): QuizStatus {
  const progress = loadQuizProgress(quizId, total);
  // selected covers SBA questions, wasRight covers EMI self-assessment — an answer only ever
  // populates one of the two, so this works without knowing each question's format here.
  const answered = progress.answers.filter((a) => a.selected !== null || a.wasRight !== null).length;
  const attempts = trackerStore
    .getEntries()
    .filter((e) => e.topic === quizId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { answered, total, remaining: total - answered, attempts };
}
