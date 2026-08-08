const EMPHASIS_RE = /\*\*(.+?)\*\*|\*(.+?)\*|==(.+?)==/g;

/** Renders `**bold**` / `*italic*` / `==highlight==` markdown-lite markup. Deliberately minimal —
 * no nested emphasis, no lists/links — this is for short study-guide bullets/cells, not general
 * markdown. `==highlight==` is a mechanical addition (see `scripts/lib/emphasize.ts`) reserved for
 * specific critical facts (percentages, ratios) — it's a deliberate reintroduction of *bounded*
 * inline highlighting after an earlier decision to drop broad number-highlighting; don't widen
 * its source pass without re-checking CLAUDE.md's "Study guide emphasis markup" section. */
export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  EMPHASIS_RE.lastIndex = 0;
  while ((match = EMPHASIS_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // No explicit color — inherits from the parent so this reads correctly both inside the
      // theme-aware app chrome (Source Notes tab) and inside the always-light "paper" study-guide
      // content, which fixes text to #1A1A1A regardless of app theme.
      nodes.push(
        <strong key={`b${key++}`} className="font-extrabold">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <em key={`i${key++}`} className="font-medium italic">
          {match[2]}
        </em>
      );
    } else if (match[3] !== undefined) {
      // Literal hex, not a theme token — a highlighter-pen look that must render the same inside
      // the always-light "paper" content regardless of app theme (see Paper's own literal-hex
      // palette rationale in CLAUDE.md).
      nodes.push(
        <mark key={`h${key++}`} className="rounded-sm bg-[#FEF3C7] px-0.5 font-semibold text-[#78350F]">
          {match[3]}
        </mark>
      );
    }
    lastIndex = EMPHASIS_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  // A single wrapping element, not a Fragment — a Fragment's children get flattened directly
  // into whatever parent renders <RichText/>, so if that parent is `display:flex`/`grid`, each
  // word-chunk becomes its own flex/grid item instead of flowing as one block of inline text.
  // This bit the Notes accordion badly (see CLAUDE.md "RichText must not return a Fragment").
  return <span>{nodes}</span>;
}
