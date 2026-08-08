const EMPHASIS_RE = /\*\*(.+?)\*\*|\*(.+?)\*/g;

/** Renders `**bold**` / `*italic*` markdown-lite markup. Deliberately minimal — no nested
 * emphasis, no lists/links, no inline number/percentage highlighting (the reference document
 * this app's study-guide styling matches never colors inline numbers — emphasis comes only from
 * color-blocking in tables/boxes) — this is for short study-guide bullets/cells, not general
 * markdown. */
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
        <strong key={`b${key++}`} className="font-semibold">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <em key={`i${key++}`} className="italic">
          {match[2]}
        </em>
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
