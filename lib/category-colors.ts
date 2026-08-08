import type { CategoryColor } from "@/lib/types";

// Literal hex values extracted directly from the reference PDFs
// (resources/paper-b/study-format-design-reference/), not Tailwind's stock palette — chosen for
// visual fidelity to the actual reference design, not app-theme consistency. Deliberately
// theme-invariant (no dark: variants) since the study content always renders on a fixed light
// "paper" background regardless of the app's light/dark theme — see CLAUDE.md.
export const CATEGORY_COLOR_CLASSES: Record<
  CategoryColor,
  { header: string; rowTint: string; border: string; text: string }
> = {
  teal: {
    header: "bg-[#1F7A7A] text-white",
    rowTint: "bg-[#E3F3F1]",
    border: "border-[#1F7A7A]",
    text: "text-[#1F7A7A]",
  },
  orange: {
    header: "bg-[#D35400] text-white",
    rowTint: "bg-[#FDECDC]",
    border: "border-[#D35400]",
    text: "text-[#D35400]",
  },
  red: {
    header: "bg-[#B71C1C] text-white",
    rowTint: "bg-[#FBE3E1]",
    border: "border-[#B71C1C]",
    text: "text-[#B71C1C]",
  },
  gray: {
    header: "bg-[#595959] text-white",
    rowTint: "bg-[#F1F1F1]",
    border: "border-[#9E9E9E]",
    text: "text-[#595959]",
  },
  blue: {
    header: "bg-[#2E75B6] text-white",
    rowTint: "bg-[#E7F0F9]",
    border: "border-[#2E75B6]",
    text: "text-[#2E75B6]",
  },
  purple: {
    header: "bg-[#7D3C98] text-white",
    rowTint: "bg-[#F1E6F7]",
    border: "border-[#7D3C98]",
    text: "text-[#7D3C98]",
  },
};

// Every table in the reference has a colored header — there's no neutral/plain table. Tables
// without an explicit category fall back to this navy, matching the reference's own default.
export const DEFAULT_TABLE_COLORS = {
  header: "bg-[#1B3A5C] text-white",
  rowTint: "bg-[#EAF0F5]",
  border: "border-[#1B3A5C]",
  text: "text-[#1B3A5C]",
};

// Comparison ("X vs Y") tables reuse the gray family — matches the reference exactly.
export const COMPARISON_TABLE_COLORS = CATEGORY_COLOR_CLASSES.gray;

export const DOC_NAVY = "#1B3A5C";
export const DOC_BODY_TEXT = "#1A1A1A";
export const DOC_BORDER = "#D9D9D9";
