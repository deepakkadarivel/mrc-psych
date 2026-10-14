import { getPaperARecalls } from "@/lib/content-paper-a";
import { recallHref, sittingLabel } from "@/lib/recalls-format";

export default function PaperARecallsPage() {
  const { points, sittings } = getPaperARecalls();
  const files = new Map<string, number>();
  points.forEach((p) => files.set(p.source.file, (files.get(p.source.file) ?? 0) + 1));
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">Paper A recalls</h1>
        <p className="text-sm text-muted-foreground">
          Student-compiled recalls of real Paper A sittings: terse hints and points, not question banks. Each point is
          extracted as written and tagged to a topic page (&quot;Seen in recalls&quot;); the analysis is on the{" "}
          <a href="/paper-a/exam-trends" className="underline">exam trends</a> page.
        </p>
      </div>
      <section className="space-y-2">
        <h2 className="font-medium">Sittings</h2>
        <ul className="text-sm">
          {sittings.map((s) => (
            <li key={s}>
              {sittingLabel(s)} — {points.filter((p) => p.sitting === s).length} points
            </li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="font-medium">Source files</h2>
        <ul className="space-y-1 text-sm" data-testid="recall-files">
          {[...files.entries()].map(([file, n]) => (
            <li key={file}>
              <a href={recallHref({ file })} target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
                {file.split("/").pop()}
              </a>{" "}
              <span className="text-muted-foreground">({n} points credited to this file)</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
