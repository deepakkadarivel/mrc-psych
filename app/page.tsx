import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuizStatusCard } from "@/components/quiz-status-card";
import { getManifest, getTopicNotes, getTopicQuestions } from "@/lib/content";

function daysUntil(dateStr: string): number {
  const ms = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function Home() {
  const manifest = getManifest();
  const days = daysUntil(manifest.examDate);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">MRCPsych Paper B</h1>
        <p className="text-muted-foreground">
          {days} days until the exam ({manifest.examDate}). Every topic below is built
          from real SPMM source material — click through to notes with citations, or
          jump straight into a quiz.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {manifest.topics.map((topic) => {
          const noteCount = getTopicNotes(topic.id).length;
          const questions = getTopicQuestions(topic.id);
          const ready = noteCount > 0 || questions.length > 0;
          return (
            <Card key={topic.id} className="relative h-full transition-colors hover:border-foreground/30">
              <Link href={`/topics/${topic.id}`} className="absolute inset-0 z-10" aria-label={topic.title} />
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  {topic.title}
                  {!ready && <Badge variant="secondary">Not yet extracted</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {noteCount} note blocks · {questions.length} questions
                {topic.gap && <p className="mt-1 text-amber-600">Gap: {topic.gap}</p>}
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
    </div>
  );
}
