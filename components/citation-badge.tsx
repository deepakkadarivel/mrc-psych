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
          a quiet, legible marginal reference mark (like a footnote) in both. Monospace marks it
          as reference data, not prose — matches every citation/figure across the app. */}
      <Badge
        variant="outline"
        className={`cursor-pointer border-[#E4E1D9] bg-white font-mono whitespace-nowrap text-[10.5px] text-[#5B6472] hover:bg-[#F3F1EC] ${className ?? ""}`}
      >
        {label}
      </Badge>
    </button>
  );
}
