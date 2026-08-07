import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_EXAM_COUNT, getMockQuestions } from "@/lib/content";

export default function MockExamsPage() {
  const exams = Array.from({ length: MOCK_EXAM_COUNT }, (_, i) => i + 1);

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mock exams</h1>
      <p className="text-muted-foreground">
        13 full-length SPMM mock exams, extracted from{" "}
        <code>resources/paper-b/mocks/SPMM Mocks.pdf</code>. Some explanations may show a small
        readable gap (e.g. &quot;identifi ed&quot;) from a source PDF text-extraction quirk — see
        CLAUDE.md.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {exams.map((n) => {
          const count = getMockQuestions(n).length;
          return (
            <Link key={n} href={`/quiz/mock/${n}`}>
              <Card className="transition-colors hover:border-foreground/30">
                <CardHeader>
                  <CardTitle className="text-base">Mock Exam {n}</CardTitle>
                  <p className="text-sm text-muted-foreground">{count} questions</p>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
