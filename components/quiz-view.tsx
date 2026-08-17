"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon, PanelRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});
import type { Question } from "@/lib/types";
import { trackerStore } from "@/lib/tracker-store";
import {
  clearQuizProgress,
  loadQuizProgress,
  saveQuizProgress,
  type QuizAnswer,
  type QuizProgress,
} from "@/lib/quiz-progress-store";

function freshAnswers(count: number): QuizAnswer[] {
  return Array.from({ length: count }, () => ({ selected: null, revealed: false, wasRight: null }));
}

function isCorrect(q: Question, a: QuizAnswer): boolean {
  // Graded only at finish time now — an SBA question counts as correct/incorrect purely from
  // the final selection, not from whether it was ever "revealed" mid-quiz (see CLAUDE.md quiz
  // section: no correct/incorrect marking is shown until Finish).
  return q.options.length > 0 ? a.selected === q.correctAnswer : a.wasRight === true;
}

function isAnswered(q: Question, a: QuizAnswer): boolean {
  return q.options.length > 0 ? a.selected !== null : a.wasRight !== null;
}

export function QuizView({
  topicId,
  topicTitle,
  questions,
  backHref,
}: {
  topicId: string;
  topicTitle: string;
  questions: Question[];
  backHref?: string;
}) {
  const [progress, setProgress] = useState<QuizProgress>(() => ({ index: 0, answers: freshAnswers(questions.length) }));
  const [loaded, setLoaded] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  // Resume saved progress client-side only, after the deterministic first paint, to avoid a
  // hydration mismatch against the static-exported HTML (see CLAUDE.md's usePortalSlot note for
  // the same pattern elsewhere in this app).
  useEffect(() => {
    setProgress(loadQuizProgress(topicId, questions.length));
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId]);

  useEffect(() => {
    if (loaded) saveQuizProgress(topicId, progress);
  }, [topicId, progress, loaded]);

  const q = questions[progress.index];
  const answer = progress.answers[progress.index];
  const isSba = q.options.length > 0;

  function updateAnswer(patch: Partial<QuizAnswer>) {
    setProgress((p) => ({
      ...p,
      answers: p.answers.map((a, i) => (i === p.index ? { ...a, ...patch } : a)),
    }));
  }

  function goTo(index: number) {
    setPdfOpen(false);
    setProgress((p) => ({ ...p, index: Math.max(0, Math.min(questions.length - 1, index)) }));
  }

  function finish() {
    const correctCount = progress.answers.filter((a, i) => isCorrect(questions[i], a)).length;
    const missedQuestionIds = questions.filter((qq, i) => !isCorrect(qq, progress.answers[i])).map((qq) => qq.id);
    trackerStore.addEntry({
      id: `${topicId}-${Date.now()}`,
      date: new Date().toISOString(),
      topic: topicId,
      score: correctCount,
      total: questions.length,
      missedQuestionIds,
    });
    clearQuizProgress(topicId);
    setFinalScore(correctCount);
    setFinished(true);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Done</h1>
        <p className="text-lg">
          {finalScore} / {questions.length} correct
        </p>
        <Button render={<Link href={backHref ?? `/topics/${topicId}`} />} nativeButton={false}>
          Back to {topicTitle}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6 space-y-4">
        <Progress value={((progress.index + 1) / questions.length) * 100} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {progress.index + 1} / {questions.length}
          </span>
          <Badge variant="outline">{q.format}</Badge>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {questions.map((qq, i) => {
            const a = progress.answers[i];
            const answered = isAnswered(qq, a);
            return (
              <button
                key={qq.id}
                onClick={() => goTo(i)}
                aria-label={`Go to question ${i + 1}`}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md border text-xs",
                  i === progress.index && "ring-2 ring-primary",
                  answered ? "bg-muted font-medium" : "text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <p className="whitespace-pre-line text-base">{q.stem}</p>

        {isSba ? (
          // Always enabled — no correct/incorrect marking happens until Finish, so there's
          // nothing to "lock in" mid-quiz. Selection is free to change right up to Finish.
          //
          // key={loaded}: Base UI's RadioGroup decides controlled-vs-uncontrolled from its very
          // first render. Before saved progress loads, `value` is undefined, so the group locks
          // into "uncontrolled" and then ignores the resume effect's later value push — the
          // radio's data-checked attribute never updates on its own, only after a real click
          // re-syncs it (confirmed via the DOM: aria-checked stays correct, data-checked doesn't
          // update, until interacted with). Remounting once `loaded` flips true gives the group a
          // fresh first render with the correct value already in place.
          <RadioGroup key={String(loaded)} value={answer.selected ?? undefined} onValueChange={(v) => updateAnswer({ selected: v })}>
            {q.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <RadioGroupItem value={opt} />
                {opt}
              </label>
            ))}
          </RadioGroup>
        ) : !answer.revealed ? (
          <>
            <p className="text-xs text-muted-foreground">
              This EMI question&apos;s option list wasn&apos;t recoverable from the source PDF
              (see CLAUDE.md) — reveal the answer, then self-assess.
            </p>
            <Button onClick={() => updateAnswer({ revealed: true })}>Reveal answer</Button>
          </>
        ) : (
          <div className="space-y-2 rounded-md border p-3">
            <p className="text-sm font-medium">Correct answer: {q.correctAnswer || "(not extractable from source — see explanation)"}</p>
            {q.explanation && (
              <p className="text-sm">
                <RichText text={q.explanation} />
              </p>
            )}
            {q.reference && <p className="text-xs text-muted-foreground">Ref: {q.reference}</p>}
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setPdfOpen(true)}>
                <Badge variant="outline" className="cursor-pointer gap-1 text-xs">
                  <PanelRightIcon className="size-3" />
                  Source: {q.source.file.split("/").pop()} p.{q.source.page}
                </Badge>
              </button>
              <Button
                size="sm"
                variant={answer.wasRight === false ? "destructive" : "outline"}
                onClick={() => updateAnswer({ wasRight: false })}
              >
                I got it wrong
              </Button>
              <Button size="sm" variant={answer.wasRight === true ? "default" : "outline"} onClick={() => updateAnswer({ wasRight: true })}>
                I got it right
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={progress.index === 0} onClick={() => goTo(progress.index - 1)}>
            <ChevronLeftIcon className="size-4" />
            Prev
          </Button>
          <Button size="sm" variant="secondary" onClick={finish}>
            Finish quiz
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={progress.index === questions.length - 1}
            onClick={() => goTo(progress.index + 1)}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent
          side="right"
          className="w-full data-[side=right]:sm:max-w-2xl"
        >
          <SheetTitle className="sr-only">Source PDF</SheetTitle>
          <PdfViewer source={answer.revealed ? q.source : null} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
