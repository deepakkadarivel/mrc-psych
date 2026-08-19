import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { getStatMcqQuestions, getStatMcqTopics } from "@/lib/content";

export default function StatMcqPage() {
  const topics = getStatMcqTopics();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 space-y-4">
      <h1 className="font-serif text-xl font-semibold sm:text-2xl">Stats MCQ</h1>
      <p className="text-muted-foreground">
        {topics.length} topic quizzes from{" "}
        <code>resources/paper-b/question_bank/STAT MCQ</code>, built from the same extracted
        questions already used by Statistics, Research Methods, Evidence-Based Medicine and
        Epidemiology (that folder is a duplicate export of those same PDFs, split one-file-per-topic).
      </p>
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {topics.map((t) => {
          const questions = getStatMcqQuestions(t.slug);
          return (
            <Card key={t.slug} size="sm" className="relative transition-colors hover:border-foreground/30">
              <Link
                href={`/quiz/stat-mcq/${t.slug}`}
                className="absolute inset-0 z-10"
                aria-label={t.title}
              />
              <CardHeader>
                <CardTitle className="text-base">{t.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.count} questions</p>
                <QuizStatusCard
                  quizId={`stat-mcq-${t.slug}`}
                  quizTitle={t.title}
                  total={t.count}
                  questions={questions.map((q) => ({ id: q.id, stem: q.stem }))}
                />
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
