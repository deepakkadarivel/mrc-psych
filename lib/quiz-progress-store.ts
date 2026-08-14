export interface QuizAnswer {
  selected: string | null;
  revealed: boolean;
  /** Self-assessed correctness for EMI questions (no extractable option list to check against). */
  wasRight: boolean | null;
}

export interface QuizProgress {
  index: number;
  answers: QuizAnswer[];
}

const keyFor = (quizId: string) => `mrcpsych-quiz-progress-${quizId}`;

function freshProgress(questionCount: number): QuizProgress {
  return {
    index: 0,
    answers: Array.from({ length: questionCount }, () => ({ selected: null, revealed: false, wasRight: null })),
  };
}

/** questionCount guards against stale progress from a previous version of this quiz's content. */
export function loadQuizProgress(quizId: string, questionCount: number): QuizProgress {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(keyFor(quizId));
      if (raw) {
        const parsed = JSON.parse(raw) as QuizProgress;
        if (parsed.answers?.length === questionCount) return parsed;
      }
    } catch {
      // fall through to a fresh progress below
    }
  }
  return freshProgress(questionCount);
}

export function saveQuizProgress(quizId: string, progress: QuizProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(keyFor(quizId), JSON.stringify(progress));
}

export function clearQuizProgress(quizId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(keyFor(quizId));
}
