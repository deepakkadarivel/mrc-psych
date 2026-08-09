import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getExamTrends } from "@/lib/content";

export default function ExamTrendsPage() {
  const { weightSource, externalStrategyNotes, sections } = getExamTrends();

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Exam Trend Analysis</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mark-weighted breakdown of the official RCPsych Paper B syllabus, paired with real
          counts from this app&apos;s own question-bank corpus and the recurring examiner traps
          already flagged in each topic&apos;s study guide — not a fresh guess, a summary of what
          this app already knows.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">External analysis — not from a resources/paper-b/ source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            The %/marks weighting below and the notes here come from the public RCPsych blueprint
            and exam-prep sources, not a page in this app&apos;s corpus — treat them as context,
            not cited fact.
          </p>
          <p>
            <a
              href={weightSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm underline hover:no-underline"
            >
              {weightSource.text} <ExternalLink className="size-3.5" />
            </a>
          </p>
          <ul className="list-disc space-y-2 pl-5">
            {externalStrategyNotes.map((note, i) => (
              <li key={i}>
                {note.text}{" "}
                {note.url && (
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground underline hover:no-underline"
                  >
                    source <ExternalLink className="size-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {sections.map((s) => (
          <Link key={s.id} href={`/exam-trends/${s.id}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-medium">
                    {s.syllabusNumber}. {s.title}
                  </h2>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {s.weightPercent}% · {s.weightMarks} marks
                  </span>
                </div>
                <Progress value={s.weightPercent} max={33.5} />
                <p className="text-xs text-muted-foreground">
                  {s.totalQuestionBankCount} question-bank questions across {s.mappedTopics.length}{" "}
                  app topic{s.mappedTopics.length > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
