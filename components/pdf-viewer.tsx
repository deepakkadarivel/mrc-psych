"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { Source } from "@/lib/types";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/**
 * Renders via react-pdf/pdf.js instead of a plain <iframe src="...#page=N">. An iframe has to
 * fully reload the document on every src change (visible flicker even for a same-file page
 * change) — react-pdf keeps the file loaded and only re-renders the requested page as long as
 * `file` (the URL string) stays the same, which it does for same-file page navigation.
 */
export function PdfViewer({ source }: { source: Source | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!source) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Click a citation on the left to open its source page here.
      </div>
    );
  }

  const fileUrl = `/sources/${source.file.split("/").map(encodeURIComponent).join("/")}`;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto bg-muted/30">
      <Document
        key={fileUrl}
        file={fileUrl}
        loading={<div className="p-6 text-sm text-muted-foreground">Loading PDF…</div>}
        error={<div className="p-6 text-sm text-destructive">Couldn&apos;t load {fileUrl}</div>}
      >
        <Page
          pageNumber={source.page}
          width={width}
          loading={<div className="p-6 text-sm text-muted-foreground">Loading page…</div>}
        />
      </Document>
    </div>
  );
}
