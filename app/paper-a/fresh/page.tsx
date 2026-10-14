import Link from "next/link";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaperAManifest, getPaperAQuestions } from "@/lib/content-paper-a";

export default function PaperAFreshIndex() {
  const sets = getPaperAManifest().quizSets.filter((s) => s.group === "fresh");
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6" data-testid="fresh-questions">
      <div>
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">Paper A fresh questions</h1>
        <p className="text-sm text-muted-foreground">
          The course&apos;s &quot;Fresh Practice Questions&quot; sets. Finish a set to log it in the{" "}
          <Link href="/tracker" className="underline">
            performance tracker
          </Link>{" "}
          (Paper A filter).
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {sets.map((s) => {
          const questions = getPaperAQuestions(s.id);
          return (
            <Card key={s.id} size="sm" className="relative h-full transition-colors hover:border-foreground/30">
              <Link href={`/paper-a/quiz/${s.id}`} className="absolute inset-0 z-10" aria-label={s.title} />
              <CardHeader>
                <CardTitle className="text-base">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {s.questionCount} questions
                <QuizStatusCard
                  quizId={s.id}
                  quizTitle={s.title}
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
