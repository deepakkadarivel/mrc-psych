"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CitationBadge } from "@/components/citation-badge";
import { StudyGuideView } from "@/components/study-guide-view";
import { RichText } from "@/components/rich-text";
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
  const note = notes[index];

  function goToNote(i: number) {
    setIndex(i);
    setActiveSource(notes[i]?.source ?? null);
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center justify-between border-b p-4">
            <h1 className="text-xl font-semibold">{topic.title}</h1>
            {questionCount > 0 && (
              <Button render={<Link href={`/quiz/${topic.id}`} />} nativeButton={false}>
                Take quiz ({questionCount})
              </Button>
            )}
          </div>
          {topic.gap && (
            <Alert className="m-4 shrink-0 border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30">
              <AlertTriangle className="text-rose-600 dark:text-rose-400" />
              <AlertTitle className="text-rose-950 dark:text-rose-100">Gap flagged</AlertTitle>
              <AlertDescription className="text-rose-800 dark:text-rose-300">{topic.gap}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={studyGuide ? "guide" : "source"} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="mx-4 mt-3 shrink-0">
              <TabsTrigger value="guide" disabled={!studyGuide}>Study Guide</TabsTrigger>
              <TabsTrigger value="source">Source Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="guide" className="flex-1 min-h-0">
              {studyGuide ? (
                <StudyGuideView guide={studyGuide} onCite={setActiveSource} />
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No study guide for this topic yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="source" className="flex-1 min-h-0 flex flex-col">
              {notes.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Notes for this topic haven&apos;t been extracted from the source PDFs yet.
                </div>
              ) : (
                <>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-medium">{note.heading}</h2>
                      <CitationBadge source={note.source} onClick={setActiveSource} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">
                      <RichText text={note.text} />
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between border-t p-3">
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
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={25}>
        <PdfViewer source={activeSource} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
