import { Badge } from "@/components/ui/badge";
import { getPaperARecallClusters, getPaperARecalls } from "@/lib/content-paper-a";
import { recallHref, sittingLabel } from "@/lib/recalls-format";
import type { RecallPoint } from "@/lib/types";

function SourceLink({ point }: { point: RecallPoint }) {
  const name = point.source.file.split("/").pop() ?? point.source.file;
  return (
    <a
      href={recallHref(point.source)}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-[10.5px] text-muted-foreground underline hover:no-underline"
    >
      {point.source.page ? `${name} p.${point.source.page}` : name}
    </a>
  );
}

function PointRow({ point }: { point: RecallPoint }) {
  return (
    <li className="space-y-0.5" data-testid="recall-point">
      <p className="text-sm">
        {point.point}
        {point.answer && <span className="font-medium"> → {point.answer}</span>}
        {point.flag && <span className="ml-1 text-xs text-[#9C3E5C]">({point.flag})</span>}
      </p>
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">{sittingLabel(point.sitting)}</Badge>
        <SourceLink point={point} />
      </p>
    </li>
  );
}

/** "Seen in recalls": what students recalled from real Paper A sittings for this topic. Server-rendered. */
export function PaperARecallsPanel({ topicId }: { topicId: string }) {
  const { points } = getPaperARecalls();
  const mine = points.filter((p) => p.topic === topicId);
  if (mine.length === 0) return null;
  const byId = new Map(points.map((p) => [p.id, p]));
  const repeated = getPaperARecallClusters()
    .map((c) => ({ ...c, pts: c.ids.map((i) => byId.get(i)).filter((p): p is RecallPoint => !!p) }))
    .filter((c) => c.pts.length > 0 && c.pts[0].topic === topicId && new Set(c.pts.map((p) => p.sitting)).size >= 2)
    .sort((a, b) => new Set(b.pts.map((p) => p.sitting)).size - new Set(a.pts.map((p) => p.sitting)).size);
  const sittings = [...new Set(mine.map((p) => p.sitting))].sort().reverse();

  return (
    <section className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6" data-testid="topic-recalls">
      <div>
        <h2 className="font-serif text-lg font-semibold">Seen in recalls</h2>
        <p className="text-sm text-muted-foreground">
          {mine.length} points recalled by students across {sittings.length} sittings. Recalls are memory, not the
          paper — answers are as the recall file states them, and doubtful ones are marked.
        </p>
      </div>
      {repeated.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Repeated across sittings ({repeated.length})</h3>
          <ul className="space-y-2">
            {repeated.map((c) => {
              const s = [...new Set(c.pts.map((p) => p.sitting))].sort();
              return (
                <li key={c.ids[0]} className="rounded-md border p-2 text-sm" data-testid="recall-repeat">
                  <p className="font-medium">
                    {c.label} <span className="text-muted-foreground">· {s.length} sittings</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{s.map(sittingLabel).join(", ")}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="space-y-2">
        <h3 className="font-medium">All recalled points</h3>
        {sittings.map((s) => (
          <details key={s} className="rounded-md border p-2">
            <summary className="cursor-pointer text-sm font-medium">
              {sittingLabel(s)} <span className="text-muted-foreground">({mine.filter((p) => p.sitting === s).length})</span>
            </summary>
            <ul className="mt-2 space-y-2">
              {mine.filter((p) => p.sitting === s).map((p) => (
                <PointRow key={p.id} point={p} />
              ))}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}
