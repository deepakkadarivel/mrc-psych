const NUMBER_RE = /\b\d+(?:\.\d+)?(?:\s?(?:[-–—]|to)\s?\d+(?:\.\d+)?)?\s?(?:%|mg|mcg|g|ml|mmol\/L|ng\/mL|years?|weeks?|months?|days?|hours?)?\b/g;

// Highlights standalone numbers/percentages/doses/durations in plain (non-emphasized) text —
// this is the mechanical half of emphasis; bold/italic markdown markup in the source text is
// the hand-judged half (see CLAUDE.md "Study guide emphasis markup").
function highlightNumbers(text: string, keyPrefix: string) {
  const parts = text.split(NUMBER_RE);
  const matches = text.match(NUMBER_RE) ?? [];
  const nodes: React.ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) nodes.push(part);
    if (matches[i] && /\d/.test(matches[i])) {
      nodes.push(
        <span key={`${keyPrefix}-n${i}`} className="font-medium text-primary tabular-nums">
          {matches[i]}
        </span>
      );
    }
  });
  return nodes;
}

const EMPHASIS_RE = /\*\*(.+?)\*\*|\*(.+?)\*/g;

/** Renders `**bold**` / `*italic*` markdown-lite markup, auto-highlighting numbers/doses in the
 * remaining plain text. Deliberately minimal — no nested emphasis, no lists/links — this is for
 * short study-guide bullets/cells, not general markdown. */
export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  EMPHASIS_RE.lastIndex = 0;
  while ((match = EMPHASIS_RE.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(...highlightNumbers(text.slice(lastIndex, match.index), `t${key}`));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`b${key++}`} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <em key={`i${key++}`} className="text-foreground/90 italic">
          {match[2]}
        </em>
      );
    }
    lastIndex = EMPHASIS_RE.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(...highlightNumbers(text.slice(lastIndex), `t${key}`));
  }
  // A single wrapping element, not a Fragment — a Fragment's children get flattened directly
  // into whatever parent renders <RichText/>, so if that parent is `display:flex`/`grid`, each
  // word-chunk becomes its own flex/grid item instead of flowing as one block of inline text.
  // This bit the Notes accordion badly (see CLAUDE.md "RichText must not return a Fragment").
  return <span>{nodes}</span>;
}
