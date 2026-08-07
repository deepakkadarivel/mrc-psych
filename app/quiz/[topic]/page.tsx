import { notFound } from "next/navigation";
import { QuizView } from "@/components/quiz-view";
import { getManifest, getTopic, getTopicQuestions } from "@/lib/content";

export function generateStaticParams() {
  return getManifest().topics.map((t) => ({ topic: t.id }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: topicId } = await params;
  const topic = getTopic(topicId);
  if (!topic) notFound();

  const questions = getTopicQuestions(topicId);
  if (questions.length === 0) notFound();

  return <QuizView topicId={topic.id} topicTitle={topic.title} questions={questions} />;
}
