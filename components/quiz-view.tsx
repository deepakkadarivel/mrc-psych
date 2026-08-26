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
  // Scored from the final selection, not from whether "Reveal answer" was ever clicked —
  // revealing mid-quiz is just an on-demand check, not what determines the graded outcome.
  return q.options.length > 0 ? a.selected === q.correctAnswer : a.wasRight === true;
}

function isAnswered(q: Question, a: QuizAnswer): boolean {
  return q.options.length > 0 ? a.selected !== null : a.wasRight !== null;
}

function QuizReview({
  questions,
  answers,
  topicId,
  topicTitle,
  backHref,
  onExit,
}: {
  questions: Question[];
  answers: QuizAnswer[];
  topicId: string;
  topicTitle: string;
  backHref?: string;
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);

  const q = questions[index];
  const a = answers[index];
  const isSba = q.options.length > 0;
  const correct = isCorrect(q, a);
  const answered = isAnswered(q, a);

  function goTo(i: number) {
    setPdfOpen(false);
    setIndex(Math.max(0, Math.min(questions.length - 1, i)));
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 mx-auto max-w-2xl space-y-2 bg-background p-4 pb-3 sm:p-6 sm:pb-3">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-lg font-semibold">Review — {topicTitle}</h1>
          <Button variant="outline" size="sm" onClick={onExit}>
            Back to summary
          </Button>
        </div>

        <Progress value={((index + 1) / questions.length) * 100} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} / {questions.length}
          </span>
          <Badge variant="outline">{q.format}</Badge>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-1">
          {questions.map((qq, i) => {
            const qCorrect = isCorrect(qq, answers[i]);
            return (
              <button
                key={qq.id}
                onClick={() => goTo(i)}
                aria-label={`Go to question ${i + 1}`}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium text-white sm:size-7",
                  i === index && "ring-2 ring-primary ring-offset-1",
                  qCorrect ? "border-[#1F7A6C] bg-[#1F7A6C]" : "border-[#B71C1C] bg-[#B71C1C]"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="whitespace-pre-line text-base">{q.stem}</p>

        {isSba ? (
          <div className="space-y-2">
            {q.options.map((opt) => {
              const isCorrectOpt = opt === q.correctAnswer;
              const isSelected = opt === a.selected;
              return (
                <div
                  key={opt}
                  className={cn(
                    "rounded-md border p-2 text-sm",
                    isCorrectOpt && "border-[#1F7A6C] bg-[#E9F3F0] text-[#123D35]",
                    !isCorrectOpt && isSelected && "border-[#B71C1C] bg-[#FBE3E1] text-[#7B241C]"
                  )}
                >
                  {opt}
                  {isCorrectOpt && (
                    <span className="ml-2 text-xs font-medium text-[#1F7A6C]">(correct answer)</span>
                  )}
                  {!isCorrectOpt && isSelected && (
                    <span className="ml-2 text-xs font-medium text-[#B71C1C]">(your answer)</span>
                  )}
                </div>
              );
            })}
            {!answered && <p className="text-xs text-muted-foreground">You didn&apos;t answer this one.</p>}
          </div>
        ) : (
          <p className="text-sm">
            Your self-assessment:{" "}
            {a.wasRight === null ? "not assessed" : a.wasRight ? "I got it right" : "I got it wrong"}
          </p>
        )}

        <div className="space-y-2 rounded-md border p-3">
          <Badge variant={correct ? "default" : "destructive"}>{correct ? "Correct" : "Incorrect"}</Badge>
          {isSba && (
            <p className="text-sm font-medium">
              Correct answer: {q.correctAnswer || "(not extractable from source — see explanation)"}
            </p>
          )}
          {q.explanation && (
            <p className="text-sm">
              <RichText text={q.explanation} />
            </p>
          )}
          {q.reference && <p className="text-xs text-muted-foreground">Ref: {q.reference}</p>}
          <button onClick={() => setPdfOpen(true)}>
            <Badge variant="outline" className="cursor-pointer gap-1 text-xs">
              <PanelRightIcon className="size-3" />
              Source: {q.source.file.split("/").pop()} p.{q.source.page}
            </Badge>
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={index === 0} onClick={() => goTo(index - 1)}>
            <ChevronLeftIcon className="size-4" />
            Prev
          </Button>
          <Button render={<Link href={backHref ?? `/topics/${topicId}`} />} nativeButton={false} size="sm">
            Back to {topicTitle}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={index === questions.length - 1}
            onClick={() => goTo(index + 1)}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent side="right" className="w-full data-[side=right]:sm:max-w-2xl">
          <SheetTitle className="sr-only">Source PDF</SheetTitle>
          <PdfViewer source={q.source} />
        </SheetContent>
      </Sheet>
    </div>
  );
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
  const [reviewing, setReviewing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);

  // Resume saved progress client-side only, after the deterministic first paint, to avoid a
  // hydration mismatch against the static-exported HTML (see CLAUDE.md's usePortalSlot note for
  // the same pattern elsewhere in this app).
  //
  // `cancelled` guards against React Strict Mode's dev-only double effect invocation (mount →
  // cleanup → remount): both invocations kick off a real loadQuizProgress() fetch, and without
  // this guard whichever one resolves *last* unconditionally wins via setProgress(p), even if
  // that's the stale first invocation resolving after the user already answered a question under
  // the second, real one. Confirmed via a Playwright trace as the actual cause of an intermittent
  // e2e failure: a clicked, visually-checked radio silently reverting because a late duplicate
  // load overwrote the fresh answer with the empty progress it had fetched moments earlier.
  useEffect(() => {
    let cancelled = false;
    loadQuizProgress(topicId, questions.length).then((p) => {
      if (cancelled) return;
      setProgress(p);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
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

  async function finish() {
    setFinishing(true);
    setFinishError(null);
    const correctCount = progress.answers.filter((a, i) => isCorrect(questions[i], a)).length;
    const missedQuestionIds = questions.filter((qq, i) => !isCorrect(qq, progress.answers[i])).map((qq) => qq.id);
    try {
      await trackerStore.addEntry({
        id: `${topicId}-${Date.now()}`,
        date: new Date().toISOString(),
        topic: topicId,
        score: correctCount,
        total: questions.length,
        missedQuestionIds,
      });
      await clearQuizProgress(topicId);
    } catch {
      setFinishing(false);
      setFinishError("Couldn't save this attempt — check your connection and try again.");
      return;
    }
    setFinishing(false);
    setFinalScore(correctCount);
    setFinished(true);
  }

  // Gate interaction until the saved progress fetch resolves — loadQuizProgress is a real
  // network round-trip now (Supabase, not localStorage), so answering during that window would
  // race with it: the fetch's setProgress(freshProgress) below would silently overwrite an
  // answer the user had already picked.
  if (!loaded) {
    return <div className="p-4 text-sm text-muted-foreground sm:p-6">Loading…</div>;
  }

  if (finished) {
    if (reviewing) {
      return (
        <QuizReview
          questions={questions}
          answers={progress.answers}
          topicId={topicId}
          topicTitle={topicTitle}
          backHref={backHref}
          onExit={() => setReviewing(false)}
        />
      );
    }
    return (
      <div className="mx-auto max-w-lg space-y-4 p-4 text-center sm:p-6">
        <h1 className="font-serif text-2xl font-semibold">Done</h1>
        <p className="text-lg">
          {finalScore} / {questions.length} correct
        </p>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setReviewing(true)}>
            Review answers
          </Button>
          <Button render={<Link href={backHref ?? `/topics/${topicId}`} />} nativeButton={false}>
            Back to {topicTitle}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 mx-auto max-w-2xl space-y-2 bg-background p-4 pb-3 sm:p-6 sm:pb-3">
        <Progress value={((progress.index + 1) / questions.length) * 100} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {progress.index + 1} / {questions.length}
          </span>
          <Badge variant="outline">{q.format}</Badge>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:gap-1">
          {questions.map((qq, i) => {
            const a = progress.answers[i];
            const answered = isAnswered(qq, a);
            // Only a revealed question has actually been "checked" against the correct answer —
            // green/red grading only applies once evaluated; a selected-but-not-yet-revealed
            // question stays in the neutral "attempted" state, same as before this change.
            const evaluated = a.revealed;
            const correct = evaluated && isCorrect(qq, a);
            return (
              <button
                key={qq.id}
                onClick={() => goTo(i)}
                aria-label={`Go to question ${i + 1}`}
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium sm:size-7",
                  i === progress.index && "ring-2 ring-primary",
                  evaluated
                    ? correct
                      ? "border-[#1F7A6C] bg-[#1F7A6C] text-white"
                      : "border-[#B71C1C] bg-[#B71C1C] text-white"
                    : answered
                      ? "bg-muted"
                      : "text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
        <p className="whitespace-pre-line text-base">{q.stem}</p>

        {isSba ? (
          // Stays enabled even after reveal — answers are free to change right up to Finish
          // (see quiz-status-card.tsx / lib/quiz-status.ts, which key off the current selection,
          // not whether it was ever locked in).
          //
          // value uses "" rather than undefined for "unanswered": Base UI's RadioGroup decides
          // controlled-vs-uncontrolled from its very first render and logs a console error if
          // that ever flips later ("changing the uncontrolled value state... to be controlled").
          // An unanswered question's first render passed `undefined` (uncontrolled), then the
          // first click passed a real string (controlled) — confirmed via a Playwright trace as
          // the actual cause of an intermittent bug where a clicked-and-visually-checked radio
          // never updated `answer.selected`, leaving "Reveal answer" permanently disabled. "" is
          // never a real option value, so it's controlled from the first render onward and never
          // matches a RadioGroupItem (nothing shows selected), while staying properly reactive.
          <RadioGroup value={answer.selected ?? ""} onValueChange={(v) => updateAnswer({ selected: v })}>
            {q.options.map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-2 rounded-md border p-2 text-sm",
                  answer.revealed && opt === q.correctAnswer && "border-[#1F7A6C] bg-[#E9F3F0] text-[#123D35]"
                )}
              >
                <RadioGroupItem value={opt} />
                {opt}
              </label>
            ))}
          </RadioGroup>
        ) : (
          <p className="text-xs text-muted-foreground">
            This EMI question&apos;s option list wasn&apos;t recoverable from the source PDF
            (see CLAUDE.md) — reveal the answer, then self-assess.
          </p>
        )}

        {!answer.revealed ? (
          <Button disabled={isSba && !answer.selected} onClick={() => updateAnswer({ revealed: true })}>
            Reveal answer
          </Button>
        ) : (
          <div className="space-y-2 rounded-md border p-3">
            {isSba && (
              <Badge variant={answer.selected === q.correctAnswer ? "default" : "destructive"}>
                {answer.selected === q.correctAnswer ? "Correct" : "Incorrect"}
              </Badge>
            )}
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
              {!isSba && (
                <>
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
                </>
              )}
            </div>
          </div>
        )}

        {finishError && <p className="text-sm text-destructive">{finishError}</p>}

        <div className="flex items-center justify-between pt-2">
          <Button variant="outline" size="sm" disabled={progress.index === 0} onClick={() => goTo(progress.index - 1)}>
            <ChevronLeftIcon className="size-4" />
            Prev
          </Button>
          <Button size="sm" variant="secondary" onClick={finish} disabled={finishing}>
            {finishing ? "Saving…" : "Finish quiz"}
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
