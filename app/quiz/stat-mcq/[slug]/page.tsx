import { notFound } from "next/navigation";
import { QuizView } from "@/components/quiz-view";
import { getStatMcqQuestions, getStatMcqTopics } from "@/lib/content";

export function generateStaticParams() {
  return getStatMcqTopics().map((t) => ({ slug: t.slug }));
}

export default async function StatMcqTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getStatMcqTopics().find((t) => t.slug === slug);
  if (!topic) notFound();

  const questions = getStatMcqQuestions(slug);
  if (questions.length === 0) notFound();

  return (
    <QuizView
      topicId={`stat-mcq-${slug}`}
      topicTitle={topic.title}
      questions={questions}
      backHref="/quiz/stat-mcq"
    />
  );
}
