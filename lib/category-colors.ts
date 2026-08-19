import type { CategoryColor } from "@/lib/types";

// Retuned onto this app's own "clinical chart" palette (see app/globals.css's design-system
// comment) rather than the original reference-PDF-extracted hexes — the user explicitly brought
// the study content's visual identity into scope for the mobile-first redesign, superseding the
// earlier "match the reference exactly" constraint. `teal` is now the same clinical-teal used
// for success/progress states elsewhere in the app (one teal, not two near-identical ones); row
// tints are warmed toward the app's parchment undertone instead of cool computed pastels; `red`
// and `purple` were already exactly this app's alert-red/recall-violet, unchanged. Still
// deliberately theme-invariant (no dark: variants) — dark mode isn't wired up anywhere in this
// app, so there's one cohesive palette to maintain, not a light/dark pair.
export const CATEGORY_COLOR_CLASSES: Record<
  CategoryColor,
  { header: string; rowTint: string; border: string; text: string }
> = {
  teal: {
    header: "bg-[#1F7A6C] text-white",
    rowTint: "bg-[#E9F3F0]",
    border: "border-[#1F7A6C]",
    text: "text-[#1F7A6C]",
  },
  orange: {
    header: "bg-[#C9600A] text-white",
    rowTint: "bg-[#FBEADA]",
    border: "border-[#C9600A]",
    text: "text-[#C9600A]",
  },
  red: {
    header: "bg-[#B71C1C] text-white",
    rowTint: "bg-[#FBE3E1]",
    border: "border-[#B71C1C]",
    text: "text-[#B71C1C]",
  },
  gray: {
    header: "bg-[#5B6472] text-white",
    rowTint: "bg-[#F3F1EC]",
    border: "border-[#9A9587]",
    text: "text-[#5B6472]",
  },
  blue: {
    header: "bg-[#2E6FA8] text-white",
    rowTint: "bg-[#E9F0F6]",
    border: "border-[#2E6FA8]",
    text: "text-[#2E6FA8]",
  },
  purple: {
    header: "bg-[#7D3C98] text-white",
    rowTint: "bg-[#F1E6F7]",
    border: "border-[#7D3C98]",
    text: "text-[#7D3C98]",
  },
};

// Every table in the reference has a colored header — there's no neutral/plain table. Tables
// without an explicit category fall back to this navy (this app's chart-navy brand anchor).
export const DEFAULT_TABLE_COLORS = {
  header: "bg-[#1B3A5C] text-white",
  rowTint: "bg-[#EAF0F5]",
  border: "border-[#1B3A5C]",
  text: "text-[#1B3A5C]",
};

// Comparison ("X vs Y") tables reuse the gray family.
export const COMPARISON_TABLE_COLORS = CATEGORY_COLOR_CLASSES.gray;

export const DOC_NAVY = "#1B3A5C";
export const DOC_BODY_TEXT = "#101826";
export const DOC_BORDER = "#E4E1D9";
