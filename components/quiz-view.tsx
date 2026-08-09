"use client";

import { useState } from "react";
import Link from "next/link";
import { PanelRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { RichText } from "@/components/rich-text";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});
import type { Question } from "@/lib/types";
import { trackerStore } from "@/lib/tracker-store";

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
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const q = questions[index];
  const isSba = q.options.length > 0;
  const gotItRight = isSba ? selected === q.correctAnswer : null;

  function next(wasRight: boolean) {
    if (wasRight) setCorrectCount((c) => c + 1);
    else setMissed((m) => [...m, q.id]);

    if (index + 1 >= questions.length) {
      trackerStore.addEntry({
        id: `${topicId}-${Date.now()}`,
        date: new Date().toISOString(),
        topic: topicId,
        score: wasRight ? correctCount + 1 : correctCount,
        total: questions.length,
        missedQuestionIds: wasRight ? missed : [...missed, q.id],
      });
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
    setPdfOpen(false);
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Done</h1>
        <p className="text-lg">
          {correctCount} / {questions.length} correct
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
        <Progress value={((index + 1) / questions.length) * 100} />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {index + 1} / {questions.length}
          </span>
          <Badge variant="outline">{q.format}</Badge>
        </div>

        <p className="whitespace-pre-line text-base">{q.stem}</p>

        {isSba ? (
          <RadioGroup value={selected ?? undefined} onValueChange={setSelected} disabled={revealed}>
            {q.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 rounded-md border p-2 text-sm">
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

        {!revealed ? (
          <Button disabled={isSba && !selected} onClick={() => setRevealed(true)}>
            Reveal answer
          </Button>
        ) : (
          <div className="space-y-2 rounded-md border p-3">
            {isSba && (
              <Badge variant={gotItRight ? "default" : "destructive"}>
                {gotItRight ? "Correct" : "Incorrect"}
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
              {isSba ? (
                <Button size="sm" onClick={() => next(!!gotItRight)}>
                  Next
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="outline" onClick={() => next(false)}>
                    I got it wrong
                  </Button>
                  <Button size="sm" onClick={() => next(true)}>
                    I got it right
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent
          side="right"
          className="w-full data-[side=right]:sm:max-w-2xl"
        >
          <SheetTitle className="sr-only">Source PDF</SheetTitle>
          <PdfViewer source={revealed ? q.source : null} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
