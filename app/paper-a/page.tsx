import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { AREAS } from "@/lib/paper-a-areas";
import { getPaperAManifest, getPaperANotes, getPaperAQuestions } from "@/lib/content-paper-a";

function examLine(examDate: string | null): string {
  if (!examDate) return "No exam date set.";
  const days = Math.ceil((new Date(examDate).getTime() - Date.now()) / 86_400_000);
  const pretty = new Date(examDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return days >= 0 ? `${days} days until the exam (${pretty}).` : `Exam date on file: ${pretty} (already passed).`;
}

export default function PaperAHome() {
  const manifest = getPaperAManifest();
  const sets = manifest.quizSets;
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">MRCPsych Paper A</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {examLine(manifest.examDate)} Every topic is built from the SPMM Paper A section notes and question
          banks in <code>resources/paper-a/</code> — notes keep their source page, quizzes come straight from the
          course exports.
        </p>
      </div>

      {Object.entries(AREAS).map(([areaId, label]) => {
        const topics = manifest.topics.filter((t) => t.area === areaId);
        return (
          <section key={areaId} className="space-y-2">
            <h2 className="font-medium">{label}</h2>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
              {topics.map((topic) => {
                const noteCount = getPaperANotes(topic.id).length;
                const questions = getPaperAQuestions(topic.id);
                return (
                  <Card key={topic.id} size="sm" className="relative h-full transition-colors hover:border-foreground/30">
                    <Link href={`/paper-a/topics/${topic.id}`} className="absolute inset-0 z-10" aria-label={topic.title} />
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-base">
                        {topic.title}
                        {noteCount === 0 && questions.length === 0 && <Badge variant="secondary">Not yet extracted</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      {noteCount} note blocks · {questions.length} questions
                      {topic.gap && <p className="mt-1 text-[#9C3E5C]">Gap: {topic.gap}</p>}
                      {questions.length > 0 && (
                        <QuizStatusCard
                          quizId={topic.id}
                          quizTitle={topic.title}
                          total={questions.length}
                          questions={questions.map((q) => ({ id: q.id, stem: q.stem }))}
                        />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        );
      })}

      <section className="space-y-2">
        <h2 className="font-medium">More practice</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Link href="/paper-a/quiz">
            <Card size="sm" className="transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-base">Question sets</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {sets.filter((s) => s.group !== "mock").length} EMI / practice sets
                </p>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/paper-a/mock">
            <Card size="sm" className="transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-base">Mock exams</CardTitle>
                <p className="text-sm text-muted-foreground">{sets.filter((s) => s.group === "mock").length} mocks</p>
              </CardHeader>
            </Card>
          </Link>
          <Link href="/tracker">
            <Card size="sm" className="transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-base">Performance tracker</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </section>

      {manifest.skippedFiles.length > 0 && (
        <details className="text-sm text-muted-foreground">
          <summary className="cursor-pointer">Source files not turned into questions ({manifest.skippedFiles.length})</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {manifest.skippedFiles.map((s) => (
              <li key={s.file}>
                <code>{s.file}</code> — {s.reason}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
