"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PanelRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { usePortalSlot } from "@/hooks/use-portal-slot";
import type { ExamTrendSection, Source } from "@/lib/types";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});

// Mirrors topic-view.tsx's drawer pattern (right-side Sheet, opened by a citation click or the
// header toggle) but with a single Source tab — this page has no per-page "Source Notes" of its
// own to page through.
export function ExamTrendSectionView({ section }: { section: ExamTrendSection }) {
  const [activeSource, setActiveSource] = useState<Source | null>(section.syllabusSource);
  const [pdfOpen, setPdfOpen] = useState(false);
  const titleSlot = usePortalSlot("page-header-slot");

  function handleCite(source: Source) {
    setActiveSource(source);
    setPdfOpen(true);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      {titleSlot &&
        createPortal(
          <>
            <h1 className="min-w-0 shrink truncate text-lg font-semibold">
              {section.syllabusNumber}. {section.title}
            </h1>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setPdfOpen((v) => !v)}
                    data-testid="pdf-toggle"
                    className="shrink-0"
                  >
                    <PanelRightIcon />
                  </Button>
                }
              />
              <TooltipContent>Source</TooltipContent>
            </Tooltip>
          </>,
          titleSlot
        )}

      <div className="flex items-center gap-3">
        <Badge variant="secondary">
          {section.weightPercent}% · {section.weightMarks} marks
        </Badge>
        <CitationBadge source={section.syllabusSource} onClick={handleCite} />
        <Link href="/exam-trends" className="text-sm text-muted-foreground underline hover:no-underline">
          ← All sections
        </Link>
      </div>

      {section.topicSignals.map((signal) => (
        <Card key={signal.topicId}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <Link href={`/topics/${signal.topicId}`} className="hover:underline">
                {signal.topicTitle}
              </Link>
              <span className="text-sm font-normal text-muted-foreground">
                {signal.questionBankCount} questions · {signal.highYieldTableCount} high-yield tables
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signal.recurringTraps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No examiner traps flagged yet in this topic&apos;s study guide.
              </p>
            ) : (
              <>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Recurring examiner traps (from this topic&apos;s own study guide)
                </p>
                <ul className="space-y-2 text-sm">
                  {signal.recurringTraps.map((trap, i) => (
                    <li key={i}>
                      <RichText text={trap.text} />{" "}
                      <CitationBadge source={trap.source} onClick={handleCite} className="align-middle" />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      ))}

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent side="right" className="w-full gap-0 pt-[49px] data-[side=right]:sm:max-w-2xl">
          <SheetTitle className="sr-only">Source</SheetTitle>
          <PdfViewer source={activeSource} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
