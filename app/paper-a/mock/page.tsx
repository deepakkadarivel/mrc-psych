import Link from "next/link";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaperAManifest, getPaperAQuestions } from "@/lib/content-paper-a";

export default function PaperAMockIndex() {
  const mocks = getPaperAManifest().quizSets.filter((s) => s.group === "mock");
  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <h1 className="font-serif text-xl font-semibold sm:text-2xl">Paper A mock exams</h1>
      <p className="text-sm text-muted-foreground">
        {mocks.length} mock tests from <code>resources/paper-a/Paper A mocks/</code>. Each question keeps the
        course&apos;s own label (e.g. &ldquo;MoK Classification 004&rdquo;) where the export printed one.
      </p>
      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {mocks.map((m) => {
          const questions = getPaperAQuestions(m.id);
          return (
            <Card key={m.id} size="sm" className="relative h-full transition-colors hover:border-foreground/30">
              <Link href={`/paper-a/quiz/${m.id}`} className="absolute inset-0 z-10" aria-label={m.title} />
              <CardHeader>
                <CardTitle className="text-base">{m.title.replace("Paper A ", "")}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {m.questionCount} questions
                <QuizStatusCard
                  quizId={m.id}
                  quizTitle={m.title}
                  total={questions.length}
                  questions={questions.map((q) => ({ id: q.id, stem: q.stem }))}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
