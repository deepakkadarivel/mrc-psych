import { notFound } from "next/navigation";
import { QuizView } from "@/components/quiz-view";
import { MOCK_EXAM_COUNT, getMockQuestions } from "@/lib/content";

export function generateStaticParams() {
  return Array.from({ length: MOCK_EXAM_COUNT }, (_, i) => ({ examId: String(i + 1) }));
}

export default async function MockExamPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const examNum = parseInt(examId, 10);
  if (!Number.isInteger(examNum) || examNum < 1 || examNum > MOCK_EXAM_COUNT) notFound();

  const questions = getMockQuestions(examNum);
  if (questions.length === 0) notFound();

  return (
    <QuizView
      topicId={`mock-${examNum}`}
      topicTitle={`Mock Exam ${examNum}`}
      questions={questions}
      backHref="/quiz/mock"
    />
  );
}
