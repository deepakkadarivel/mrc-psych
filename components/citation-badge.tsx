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
      <Badge variant="outline" className={`cursor-pointer whitespace-nowrap text-xs ${className ?? ""}`}>
        {label}
      </Badge>
    </button>
  );
}
