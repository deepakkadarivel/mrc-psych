// User-chosen highlighter colors. Deliberately distinct hues from the mechanical `==...==`
// percentage/ratio highlight RichText already renders (`bg-[#FEF3C7]`, amber) so a user's own
// highlight is never visually confused with that auto-generated one — see CLAUDE.md "Study guide
// emphasis markup". Each entry pairs a light background with a dark, readable foreground so text
// stays legible regardless of which color is picked, matching the literal-hex convention already
// used by lib/category-colors.ts for this app's always-light "paper" content.
export interface HighlightColor {
  name: string;
  bg: string;
  text: string;
}

export const HIGHLIGHT_COLORS: HighlightColor[] = [
  { name: "yellow", bg: "#FDE68A", text: "#78350F" },
  { name: "green", bg: "#BBF7D0", text: "#14532D" },
  { name: "blue", bg: "#BFDBFE", text: "#1E3A8A" },
  { name: "pink", bg: "#FBCFE8", text: "#831843" },
  { name: "orange", bg: "#FED7AA", text: "#7C2D12" },
];

export const DEFAULT_HIGHLIGHT_COLOR = HIGHLIGHT_COLORS[0].bg;

export function highlightTextColor(bg: string): string {
  return HIGHLIGHT_COLORS.find((c) => c.bg === bg)?.text ?? "#1A1A1A";
}
