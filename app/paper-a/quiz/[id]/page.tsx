import { notFound } from "next/navigation";
import { QuizView } from "@/components/quiz-view";
import { getPaperAQuestions, getPaperAQuizIds, getPaperAQuizSet, getPaperATopic } from "@/lib/content-paper-a";

export function generateStaticParams() {
  return getPaperAQuizIds().map((q) => ({ id: q.id }));
}

export default async function PaperAQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = getPaperATopic(id);
  const set = getPaperAQuizSet(id);
  const title = topic?.title ?? set?.title;
  if (!title) notFound();
  const questions = getPaperAQuestions(id);
  if (questions.length === 0) notFound();

  const backHref = topic ? `/paper-a/topics/${id}` : set?.group === "mock" ? "/paper-a/mock" : set?.group === "fresh" ? "/paper-a/fresh" : "/paper-a/quiz";
  // `id` ("pa-...") is what the tracker logs as the session's topic, which keeps Paper A apart from B.
  return <QuizView topicId={id} topicTitle={title} questions={questions} backHref={backHref} />;
}
