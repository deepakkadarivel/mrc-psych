"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AlertTriangle, PanelBottomClose, PanelBottomOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CitationBadge } from "@/components/citation-badge";
import { StudyGuideView } from "@/components/study-guide-view";
import { RichText } from "@/components/rich-text";
import { usePortalSlot } from "@/hooks/use-portal-slot";
import type { NoteBlock, Source, StudyGuide, TopicManifestEntry } from "@/lib/types";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});

export function TopicView({
  topic,
  notes,
  studyGuide,
  questionCount,
}: {
  topic: TopicManifestEntry;
  notes: NoteBlock[];
  studyGuide: StudyGuide | null;
  questionCount: number;
}) {
  const [index, setIndex] = useState(0);
  const [activeSource, setActiveSource] = useState<Source | null>(notes[0]?.source ?? null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const pdfSectionRef = useRef<HTMLDivElement>(null);
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

  // The reference PDF section renders BELOW the content in a single column (not a side panel) —
  // citing a source opens it and scrolls it into view, since it may be off-screen below a long
  // study guide.
  function handleCite(source: Source) {
    setActiveSource(source);
    setPdfOpen(true);
  }

  // Only scroll on the false -> true transition (the section just mounted) — not on every
  // activeSource change, or paging through Source Notes while the PDF section is already open
  // would yank the scroll position on every click.
  useEffect(() => {
    if (pdfOpen) {
      pdfSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pdfOpen]);

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
                      variant="outline"
                      size="icon"
                      onClick={() => setPdfOpen((v) => !v)}
                      data-testid="pdf-toggle"
                    >
                      {pdfOpen ? <PanelBottomClose className="size-4" /> : <PanelBottomOpen className="size-4" />}
                    </Button>
                  }
                />
                <TooltipContent>Source PDF</TooltipContent>
              </Tooltip>
              {questionCount > 0 && (
                <Button render={<Link href={`/quiz/${topic.id}`} />} nativeButton={false} size="sm">
                  Take quiz ({questionCount})
                </Button>
              )}
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
            <StudyGuideView guide={studyGuide} onCite={handleCite} />
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

      {pdfOpen && (
        <div ref={pdfSectionRef} className="border-t" data-testid="pdf-section">
          <div className="flex items-center justify-between p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Source PDF</h3>
            <Button variant="ghost" size="sm" onClick={() => setPdfOpen(false)}>
              Close
            </Button>
          </div>
          <div className="h-[85vh]">
            <PdfViewer source={activeSource} />
          </div>
        </div>
      )}
    </div>
  );
}
