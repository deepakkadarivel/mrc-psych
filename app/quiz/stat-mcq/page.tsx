import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatMcqTopics } from "@/lib/content";

export default function StatMcqPage() {
  const topics = getStatMcqTopics();

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Stats MCQ</h1>
      <p className="text-muted-foreground">
        {topics.length} topic quizzes from{" "}
        <code>resources/paper-b/question_bank/STAT MCQ</code>, built from the same extracted
        questions already used by Statistics, Research Methods, Evidence-Based Medicine and
        Epidemiology (that folder is a duplicate export of those same PDFs, split one-file-per-topic).
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {topics.map((t) => (
          <Link key={t.slug} href={`/quiz/stat-mcq/${t.slug}`}>
            <Card className="transition-colors hover:border-foreground/30">
              <CardHeader>
                <CardTitle className="text-base">{t.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{t.count} questions</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
