"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});
import type { NoteBlock, TopicManifestEntry } from "@/lib/types";

export function TopicView({
  topic,
  notes,
  questionCount,
}: {
  topic: TopicManifestEntry;
  notes: NoteBlock[];
  questionCount: number;
}) {
  const [index, setIndex] = useState(0);
  const note = notes[index];

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      <ResizablePanel defaultSize={55} minSize={30}>
        <div className="flex h-full flex-col">
          <div className="shrink-0 space-y-3 border-b p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{topic.title}</h1>
              {questionCount > 0 && (
                <Button render={<Link href={`/quiz/${topic.id}`} />} nativeButton={false}>
                  Take quiz ({questionCount})
                </Button>
              )}
            </div>
            {topic.gap && (
              <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                <strong>Gap flagged:</strong> {topic.gap}
              </div>
            )}
          </div>

          {notes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Notes for this topic haven&apos;t been extracted from the source PDFs yet.
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">{note.heading}</h2>
                  <Badge variant="outline" className="whitespace-nowrap text-xs">
                    {note.source.file.split("/").pop()} p.{note.source.page}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed">{note.text}</p>
              </div>
              <div className="flex shrink-0 items-center justify-between border-t p-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => setIndex((i) => i - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {index + 1} / {notes.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === notes.length - 1}
                  onClick={() => setIndex((i) => i + 1)}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={25}>
        <PdfViewer source={note?.source ?? null} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
