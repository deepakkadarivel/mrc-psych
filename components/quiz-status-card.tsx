"use client";

import { useEffect, useState } from "react";
import { CheckIcon, HistoryIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getQuizStatus, type QuizStatus } from "@/lib/quiz-status";

interface QuestionSummary {
  id: string;
  stem: string;
}

function AttemptRow({ attempt, questions }: { attempt: QuizStatus["attempts"][number]; questions: QuestionSummary[] }) {
  const [expanded, setExpanded] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const missed = new Set(attempt.missedQuestionIds);
  const wrong = questions.filter((q) => missed.has(q.id));
  const correct = questions.filter((q) => !missed.has(q.id));

  return (
    <div className="rounded-md border">
      <button
        className="flex w-full items-center justify-between p-3 text-left text-sm"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-muted-foreground">{new Date(attempt.date).toLocaleString()}</span>
        <span className="font-medium">
          {attempt.score}/{attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%)
        </span>
      </button>
      {expanded && (
        <div className="space-y-3 border-t p-3">
          {wrong.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-700">Incorrect ({wrong.length})</p>
              {wrong.map((q) => (
                <div key={q.id} className="flex items-start gap-2 text-xs">
                  <XIcon className="mt-0.5 size-3 shrink-0 text-red-600" />
                  <span>{q.stem}</span>
                </div>
              ))}
            </div>
          )}
          {correct.length > 0 && (
            <div className="space-y-1">
              <button
                className="text-xs font-medium text-green-700 underline-offset-2 hover:underline"
                onClick={() => setShowCorrect((v) => !v)}
              >
                {showCorrect ? "Hide" : "Show"} correct ({correct.length})
              </button>
              {showCorrect &&
                correct.map((q) => (
                  <div key={q.id} className="flex items-start gap-2 text-xs">
                    <CheckIcon className="mt-0.5 size-3 shrink-0 text-green-600" />
                    <span className="text-muted-foreground">{q.stem}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function QuizStatusCard({
  quizId,
  quizTitle,
  total,
  questions,
}: {
  quizId: string;
  quizTitle: string;
  total: number;
  questions: QuestionSummary[];
}) {
  const [status, setStatus] = useState<QuizStatus>({ answered: 0, total, remaining: total, attempts: [] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setStatus(getQuizStatus(quizId, total));
  }, [quizId, total]);

  const hasAttempts = status.attempts.length > 0;
  const label =
    status.answered > 0
      ? status.remaining > 0
        ? `${status.answered}/${total} answered · ${status.remaining} remaining`
        : `All ${total} answered — resume to finish`
      : hasAttempts
        ? `Last attempt: ${status.attempts[0].score}/${status.attempts[0].total}`
        : "Not started";

  return (
    <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
      <span>{label}</span>
      {hasAttempts && (
        <>
          <Button
            variant="outline"
            size="xs"
            className="relative z-20"
            onClick={() => setOpen(true)}
          >
            <HistoryIcon />
            {status.attempts.length} attempt{status.attempts.length !== 1 ? "s" : ""}
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>{quizTitle} — attempt history</SheetTitle>
              </SheetHeader>
              <div className="space-y-2 px-4 pb-6">
                {status.attempts.map((a) => (
                  <AttemptRow key={a.id} attempt={a} questions={questions} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
