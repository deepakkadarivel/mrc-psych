import Link from "next/link";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaperAManifest, getPaperAQuestions } from "@/lib/content-paper-a";

const GROUPS = [
  { key: "emi", label: "EMI banks" },
  { key: "high-yield", label: "Other high-yield banks" },
  { key: "practice", label: "Practice question sets" },
] as const;

export default function PaperAQuizIndex() {
  const { quizSets } = getPaperAManifest();
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">Paper A question sets</h1>
        <p className="text-sm text-muted-foreground">
          Standalone banks exported from the course: EMI banks, dated practice sets, and a couple of extra
          high-yield banks. Topic-matched banks live on each topic page.
        </p>
      </div>
      {GROUPS.map((g) => {
        const sets = quizSets.filter((s) => s.group === g.key);
        if (sets.length === 0) return null;
        return (
          <section key={g.key} className="space-y-2">
            <h2 className="font-medium">{g.label}</h2>
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
                      {s.duplicatesSkipped > 0 && ` (${s.duplicatesSkipped} repeats of earlier sets omitted)`}
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
          </section>
        );
      })}
    </div>
  );
}
