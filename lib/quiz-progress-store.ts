import { supabase } from "@/lib/supabase-client";

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

function freshProgress(questionCount: number): QuizProgress {
  return {
    index: 0,
    answers: Array.from({ length: questionCount }, () => ({ selected: null, revealed: false, wasRight: null })),
  };
}

/** Callers are gated behind sign-in by components/app-shell.tsx. */
export async function loadQuizProgress(quizId: string, questionCount: number): Promise<QuizProgress> {
  const { data, error } = await supabase
    .from("quiz_progress")
    .select("index, answers")
    .eq("quiz_id", quizId)
    .maybeSingle();
  if (error) throw error;
  if (data && (data.answers as QuizAnswer[]).length === questionCount) {
    return { index: data.index, answers: data.answers as QuizAnswer[] };
  }
  return freshProgress(questionCount);
}

export async function saveQuizProgress(quizId: string, progress: QuizProgress): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Not signed in");
  const { error } = await supabase
    .from("quiz_progress")
    .upsert({ user_id: userId, quiz_id: quizId, index: progress.index, answers: progress.answers });
  if (error) throw error;
}

export async function clearQuizProgress(quizId: string): Promise<void> {
  const { error } = await supabase.from("quiz_progress").delete().eq("quiz_id", quizId);
  if (error) throw error;
}
