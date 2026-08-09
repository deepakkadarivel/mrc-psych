"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AlertTriangle, PanelRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CitationBadge } from "@/components/citation-badge";
import { StudyGuideView } from "@/components/study-guide-view";
import { RichText } from "@/components/rich-text";
import { usePortalSlot } from "@/hooks/use-portal-slot";
import type { NoteBlock, Question, Source, StudyGuide, TopicManifestEntry } from "@/lib/types";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});

export function TopicView({
  topic,
  notes,
  studyGuide,
  questions,
}: {
  topic: TopicManifestEntry;
  notes: NoteBlock[];
  studyGuide: StudyGuide | null;
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [activeSource, setActiveSource] = useState<Source | null>(notes[0]?.source ?? null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const note = notes[index];

  // The title/action-buttons and the outer Study-Guide/Source-Notes tab list render into slots
  // owned by the root layout's single sticky header (app/layout.tsx) instead of a separate
  // header bar inside this page — see CLAUDE.md "Consolidated sticky header".
  const titleSlot = usePortalSlot("page-header-slot");
  const tabsLeftSlot = usePortalSlot("page-header-tabs-left");

  function goToNote(i: number) {
    setIndex(i);
    setActiveSource(notes[i]?.source ?? null);
  }

  // The reference PDF opens as a right-side drawer over the content (not a permanent side
  // column, not a below-content section requiring a scroll) — citing a source just opens it.
  function handleCite(source: Source) {
    setActiveSource(source);
    setPdfOpen(true);
  }

  return (
    <div>
      {titleSlot &&
        createPortal(
          <>
            <h1 className="truncate text-lg font-semibold">{topic.title}</h1>
            <div className="flex shrink-0 items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setPdfOpen((v) => !v)}
                      data-testid="pdf-toggle"
                    >
                      <PanelRightIcon />
                    </Button>
                  }
                />
                <TooltipContent>Source PDF</TooltipContent>
              </Tooltip>
            </div>
          </>,
          titleSlot
        )}

      {topic.gap && (
        <Alert className="m-4 border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30">
          <AlertTriangle className="text-rose-600 dark:text-rose-400" />
          <AlertTitle className="text-rose-950 dark:text-rose-100">Gap flagged</AlertTitle>
          <AlertDescription className="text-rose-800 dark:text-rose-300">{topic.gap}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue={studyGuide ? "guide" : "source"} className="w-full">
        {tabsLeftSlot &&
          createPortal(
            <TabsList className="mx-0">
              <TabsTrigger value="guide" disabled={!studyGuide}>Study Guide</TabsTrigger>
              <TabsTrigger value="source">Source Notes</TabsTrigger>
            </TabsList>,
            tabsLeftSlot
          )}

        <TabsContent value="guide">
          {studyGuide ? (
            <StudyGuideView
              guide={studyGuide}
              onCite={handleCite}
              questions={questions}
              topicId={topic.id}
              topicTitle={topic.title}
            />
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No study guide for this topic yet.
            </div>
          )}
        </TabsContent>

        <TabsContent value="source">
          {notes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Notes for this topic haven&apos;t been extracted from the source PDFs yet.
            </div>
          ) : (
            <>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{note.heading}</h2>
                  <CitationBadge source={note.source} onClick={handleCite} />
                </div>
                <p className="mt-3 text-sm leading-relaxed">
                  <RichText text={note.text} />
                </p>
              </div>
              <div className="flex items-center justify-between border-t p-3">
                <Button variant="outline" size="sm" disabled={index === 0} onClick={() => goToNote(index - 1)}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {index + 1} / {notes.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === notes.length - 1}
                  onClick={() => goToNote(index + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent
          side="right"
          className="w-full data-[side=right]:sm:max-w-2xl"
          data-testid="pdf-section"
        >
          <SheetTitle className="sr-only">Source PDF</SheetTitle>
          <PdfViewer source={activeSource} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
