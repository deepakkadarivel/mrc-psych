import { loadQuizProgress } from "./quiz-progress-store";
import { trackerStore, type TrackerEntry } from "./tracker-store";

export interface QuizStatus {
  answered: number;
  total: number;
  remaining: number;
  attempts: TrackerEntry[]; // newest first
}

// Supabase-backed, so call from a client component after mount (see quiz-status-card.tsx).
// Every page is gated behind sign-in by components/app-shell.tsx, so a signed-in user is
// guaranteed here.
export async function getQuizStatus(quizId: string, total: number): Promise<QuizStatus> {
  const progress = await loadQuizProgress(quizId, total);
  // selected covers SBA questions, wasRight covers EMI self-assessment — an answer only ever
  // populates one of the two, so this works without knowing each question's format here.
  const answered = progress.answers.filter((a) => a.selected !== null || a.wasRight !== null).length;
  const attempts = (await trackerStore.getEntries())
    .filter((e) => e.topic === quizId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { answered, total, remaining: total - answered, attempts };
}
