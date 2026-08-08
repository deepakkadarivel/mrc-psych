import { Badge } from "@/components/ui/badge";
import type { Source } from "@/lib/types";

export function CitationBadge({
  source,
  onClick,
  className,
}: {
  source: Source;
  onClick: (source: Source) => void;
  className?: string;
}) {
  const label = source.questionNumber
    ? `${source.file.split("/").pop()} Q${source.questionNumber}`
    : `${source.file.split("/").pop()} p.${source.page}`;
  return (
    <button onClick={() => onClick(source)} type="button">
      {/* Literal colors, not the `outline` variant's theme tokens — this sits inside the
          always-light study-guide "paper" as well as the theme-aware app chrome, and must stay
          a quiet, legible marginal reference mark (like a footnote) in both. */}
      <Badge
        variant="outline"
        className={`cursor-pointer border-[#D9D9D9] bg-white whitespace-nowrap text-[11px] text-[#6B7280] hover:bg-[#F1F1F1] ${className ?? ""}`}
      >
        {label}
      </Badge>
    </button>
  );
}
