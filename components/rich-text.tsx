"use client";

import { Fragment } from "react";
import { useHighlightScope, useHighlights } from "@/lib/highlight-context";
import { highlightTextColor } from "@/lib/highlight-colors";
import type { Highlight } from "@/lib/highlight-store";

const EMPHASIS_RE = /\*\*(.+?)\*\*|\*(.+?)\*|==(.+?)==/g;

type EmphasisType = "bold" | "italic" | "mark" | "plain";

interface Piece {
  text: string;
  type: EmphasisType;
  start: number; // offset into the fully-stripped plain text, not the raw markdown-lite source
  end: number;
}

/** Strips `**`/`*`/`==` markup, tracking each surviving run's offset into the resulting plain
 * text. These offsets are the coordinate space user-drawn highlight ranges are stored in (see
 * lib/highlight-context.tsx) — they must match exactly what a browser Selection measures against
 * the rendered DOM, which is why parsing and offset-tracking happen in one pass. */
function parseEmphasis(text: string): { pieces: Piece[]; plainText: string } {
  const pieces: Piece[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let plainPos = 0;
  EMPHASIS_RE.lastIndex = 0;
  const push = (t: string, type: EmphasisType) => {
    if (t.length === 0) return;
    pieces.push({ text: t, type, start: plainPos, end: plainPos + t.length });
    plainPos += t.length;
  };
  while ((match = EMPHASIS_RE.exec(text))) {
    if (match.index > lastIndex) push(text.slice(lastIndex, match.index), "plain");
    if (match[1] !== undefined) push(match[1], "bold");
    else if (match[2] !== undefined) push(match[2], "italic");
    else if (match[3] !== undefined) push(match[3], "mark");
    lastIndex = EMPHASIS_RE.lastIndex;
  }
  if (lastIndex < text.length) push(text.slice(lastIndex), "plain");
  return { pieces, plainText: pieces.map((p) => p.text).join("") };
}

/** A stored highlight's {start,end} can drift once content is re-extracted/edited (this app's
 * content JSON does get regenerated and hand-fixed — see CLAUDE.md's citation-fix commits). Never
 * trust the offsets blindly: if the plain text at [start,end) no longer equals the saved
 * `snippet`, try to relocate the snippet by exact text search; only if it's found exactly once
 * (unambiguous) is the highlight kept, otherwise it's silently dropped rather than rendered in
 * the wrong place. */
function reconcileRanges(plainText: string, ranges: Highlight[]): Highlight[] {
  const out: Highlight[] = [];
  for (const h of ranges) {
    if (h.start >= 0 && h.end <= plainText.length && plainText.slice(h.start, h.end) === h.snippet) {
      out.push(h);
      continue;
    }
    const idx = plainText.indexOf(h.snippet);
    if (idx !== -1 && h.snippet.length > 0 && plainText.indexOf(h.snippet, idx + 1) === -1) {
      out.push({ ...h, start: idx, end: idx + h.snippet.length });
    }
  }
  return out;
}

interface Segment {
  text: string;
  hl?: Highlight;
}

/** Cuts one emphasis piece further at any highlight-range boundary that falls inside it, so a
 * user highlight can straddle (or sit fully inside, or fully contain) a bold/italic/mechanical-
 * highlight run without either range system corrupting the other. */
function splitPieceByHighlights(piece: Piece, ranges: Highlight[]): Segment[] {
  const relevant = ranges.filter((r) => r.start < piece.end && r.end > piece.start);
  if (relevant.length === 0) return [{ text: piece.text }];
  const cuts = new Set<number>([piece.start, piece.end]);
  for (const r of relevant) {
    if (r.start > piece.start && r.start < piece.end) cuts.add(r.start);
    if (r.end > piece.start && r.end < piece.end) cuts.add(r.end);
  }
  const sorted = [...cuts].sort((a, b) => a - b);
  const segments: Segment[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const s = sorted[i];
    const e = sorted[i + 1];
    const hl = relevant.find((r) => r.start <= s && r.end >= e);
    segments.push({ text: piece.text.slice(s - piece.start, e - piece.start), hl });
  }
  return segments;
}

/** Renders `**bold**` / `*italic*` / `==highlight==` markdown-lite markup, plus (when `highlightId`
 * is given, and a highlight scope is set above via HighlightScopeProvider) user-drawn highlights:
 * selecting text while the highlighter is active saves a highlight over that span; clicking an
 * existing highlight removes it. Deliberately minimal markdown — no nested emphasis, no
 * lists/links — this is for short study-guide bullets/cells, not general markdown. */
export function RichText({ text, highlightId }: { text: string; highlightId?: string }) {
  const scope = useHighlightScope();
  const { removeHighlight, getRanges } = useHighlights();
  const anchorId = highlightId && scope ? `${scope}:${highlightId}` : undefined;

  const { pieces, plainText } = parseEmphasis(text);
  const rawRanges = anchorId ? getRanges(anchorId) : [];
  const ranges = rawRanges.length ? reconcileRanges(plainText, rawRanges) : [];

  function renderSegments(segments: Segment[]) {
    return segments.map((seg, i) => {
      if (!seg.hl) return <Fragment key={i}>{seg.text}</Fragment>;
      const hlId = seg.hl.id;
      return (
        <mark
          key={i}
          className="cursor-pointer rounded-sm px-0.5"
          style={{ backgroundColor: seg.hl.color, color: highlightTextColor(seg.hl.color) }}
          title="Click to remove highlight"
          onClick={(e) => {
            e.stopPropagation();
            if (anchorId) removeHighlight(anchorId, hlId);
          }}
        >
          {seg.text}
        </mark>
      );
    });
  }

  const nodes = pieces.map((piece, key) => {
    const inner = renderSegments(splitPieceByHighlights(piece, ranges));
    switch (piece.type) {
      case "bold":
        return (
          <strong key={key} className="font-extrabold">
            {inner}
          </strong>
        );
      case "italic":
        return (
          <em key={key} className="font-medium italic">
            {inner}
          </em>
        );
      case "mark":
        // Literal hex, not a theme token — a highlighter-pen look that must render the same
        // inside the always-light "paper" content regardless of app theme.
        return (
          <mark key={key} className="rounded-sm bg-[#FEF3C7] px-0.5 font-semibold text-[#78350F]">
            {inner}
          </mark>
        );
      default:
        return <Fragment key={key}>{inner}</Fragment>;
    }
  });

  // A single wrapping element, not a Fragment — a Fragment's children get flattened directly
  // into whatever parent renders <RichText/>, so if that parent is `display:flex`/`grid`, each
  // word-chunk becomes its own flex/grid item instead of flowing as one block of inline text.
  // This bit the Notes accordion badly (see CLAUDE.md "RichText must not return a Fragment").
  //
  // `data-hl-anchor` is read by a single global pointerup listener in lib/highlight-context.tsx,
  // not handled here per-instance — see that file's comment for why: a per-span `onMouseUp`
  // never fires for a touch/Apple-Pencil-drawn text selection on iPad (there's no mouse drag to
  // release), while `pointerup` is the one event Safari/iPadOS dispatches uniformly for mouse,
  // touch, AND Apple Pencil input.
  return <span data-hl-anchor={anchorId}>{nodes}</span>;
}
