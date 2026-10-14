import type { RecallPoint } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2023-07" -> "Jul 2023"; "2025-?" -> "2025 (month not stated)". */
export function sittingLabel(id: string): string {
  const [y, m] = id.split("-");
  const mi = Number(m);
  return mi >= 1 && mi <= 12 ? `${MONTHS[mi - 1]} ${y}` : `${y} (month not stated)`;
}

/** Served by scripts/copy-sources.ts; PDFs open at the cited page. */
export function recallHref(source: RecallPoint["source"]): string {
  const base = `/sources/${source.file.split("/").map(encodeURIComponent).join("/")}`;
  return source.page && source.file.toLowerCase().endsWith(".pdf") ? `${base}#page=${source.page}` : base;
}
