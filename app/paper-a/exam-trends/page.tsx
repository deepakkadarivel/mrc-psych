import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPaperATrends } from "@/lib/content-paper-a";
import { sittingLabel } from "@/lib/recalls-format";

const TOP_CLUSTERS = 40;

export default function PaperATrendsPage() {
  const t = getPaperATrends();
  if (!t) return <div className="p-6 text-sm text-muted-foreground">No analysis built yet.</div>;
  const maxTopic = Math.max(...t.topics.map((x) => x.recallPoints));
  const real = t.topics.filter((x) => x.id !== "pa-other");
  const byRepeats = [...real].sort((a, b) => b.repeatedFacts - a.repeatedFacts).slice(0, 5);
  const thinBank = real.filter((x) => x.recallPercent >= 4 && x.bankQuestions < 60);
  const topicTitle = (id: string) => t.topics.find((x) => x.id === id)?.title ?? id;

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6" data-testid="paper-a-trends">
      <div className="space-y-2">
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">Paper A exam trends</h1>
        <p className="text-sm text-muted-foreground">
          Counted from {t.totals.points} recall points across {t.totals.sittings} sittings in {t.totals.files} student recall
          files (<Link href="/paper-a/recalls" className="underline">source files</Link>). Recalls are memory, not the paper:
          treat a count as a signal of what gets asked, not an exact frequency. Every number below is a count over those
          points; interpretation lines are marked.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-medium">Official blueprint vs what recalls show</h2>
        <p className="text-sm text-muted-foreground">
          Paper A: {t.blueprint.format.split(" Pass-mark")[0]} Weighting per the{" "}
          <a href={t.blueprint.source} target="_blank" rel="noopener noreferrer" className="underline">
            RCPsych exams page
          </a>{" "}
          ({t.blueprint.reliability}). Which topics belong to which area is this app&apos;s own mapping, not official.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" data-testid="trends-areas">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="py-1 pr-2">Area</th>
                <th className="py-1 pr-2">Official</th>
                <th className="py-1 pr-2">Recall share</th>
                <th className="py-1">Recall points</th>
              </tr>
            </thead>
            <tbody>
              {t.areas.map((a) => (
                <tr key={a.id} className="border-b align-top">
                  <td className="py-1.5 pr-2 font-medium">{a.title}</td>
                  <td className="py-1.5 pr-2">{a.officialPercent}% ({a.officialQuestions} Qs)</td>
                  <td className="py-1.5 pr-2">
                    {a.recallPercent}%{" "}
                    <span className={a.recallPercent - a.officialPercent >= 0 ? "text-[#2E7D5B]" : "text-[#9C3E5C]"}>
                      ({a.recallPercent - a.officialPercent >= 0 ? "+" : ""}
                      {(a.recallPercent - a.officialPercent).toFixed(1)} pts)
                    </span>
                  </td>
                  <td className="py-1.5">{a.recallPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Interpretation: recall share is skewed by what students remember and note down, so a gap against the official split
          (for example heavy recall of mechanism-of-action items) shows where students <em>notice</em> questions, not
          necessarily where marks are.
        </p>
      </section>

      <section className="space-y-3" data-testid="trends-concentrate">
        <h2 className="font-medium">Where to concentrate</h2>
        <p className="text-sm text-muted-foreground">
          Interpretation from the counts below, not an official list. Check your own weak areas on the{" "}
          <Link href="/tracker" className="underline">performance tracker</Link>.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>
            Most repeated facts across sittings:{" "}
            {byRepeats.map((x, i) => (
              <span key={x.id}>
                {i > 0 && ", "}
                <Link href={`/paper-a/topics/${x.id}`} className="underline">{x.title}</Link> ({x.repeatedFacts})
              </span>
            ))}
            .
          </li>
          {thinBank.length > 0 && (
            <li>
              Often recalled but with a small topic question bank (under 60 questions):{" "}
              {thinBank.map((x, i) => (
                <span key={x.id}>
                  {i > 0 && ", "}
                  <Link href={`/paper-a/topics/${x.id}`} className="underline">{x.title}</Link> ({x.recallPoints} recall points, {x.bankQuestions} bank Qs)
                </span>
              ))}
              . Use the mocks and EMI sets for extra practice there.
            </li>
          )}
          <li>
            Every topic appears in several sittings, so none can be skipped; recall counts show emphasis, not what
            is safe to leave out.
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Recall volume by topic</h2>
        <ul className="space-y-1.5" data-testid="trends-topics">
          {t.topics.map((x) => (
            <li key={x.id} className="text-sm">
              <div className="flex items-baseline justify-between gap-2">
                {x.id === "pa-other" ? (
                  <span>{x.title}</span>
                ) : (
                  <Link href={`/paper-a/topics/${x.id}`} className="underline hover:no-underline">
                    {x.title}
                  </Link>
                )}
                <span className="text-xs text-muted-foreground">
                  {x.recallPoints} points · {x.recallPercent}% · in {x.sittingsSeen}/{t.totals.sittings} sittings ·{" "}
                  {x.repeatedFacts} repeated facts · {x.bankQuestions} bank Qs
                </span>
              </div>
              <div className="h-1.5 rounded bg-muted">
                <div className="h-1.5 rounded bg-primary" style={{ width: `${(x.recallPoints / maxTopic) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Facts that came back in several sittings</h2>
        <p className="text-sm text-muted-foreground">
          Points grouped when they test the same specific fact in different sittings (grouping was done by reading the
          points; only clear matches are included). Top {Math.min(TOP_CLUSTERS, t.clusters.length)} of {t.clusters.length}, most
          sittings first. Answers are as the recall files state them.
        </p>
        <ul className="space-y-2" data-testid="trends-clusters">
          {t.clusters.slice(0, TOP_CLUSTERS).map((c) => (
            <li key={c.ids[0]} className="rounded-md border p-2 text-sm">
              <p className="font-medium">
                {c.label} <span className="text-muted-foreground">· {c.sittings.length} sittings</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <Link href={`/paper-a/topics/${c.topic}`} className="underline">
                  {topicTitle(c.topic)}
                </Link>{" "}
                · {c.sittings.map(sittingLabel).join(", ")}
              </p>
              {c.answers.length > 0 && <p className="text-xs">Recalled answer: {c.answers.join(" / ")}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">Points per sitting</h2>
        <div className="flex flex-wrap gap-2">
          {t.sittings.map((s) => (
            <Badge key={s.id} variant="secondary">
              {sittingLabel(s.id)}: {s.points}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-medium">From the web</h2>
        <p className="text-sm text-muted-foreground">
          External commentary, quoted as found — not verified against this app&apos;s sources and low reliability unless stated.
        </p>
        <ul className="space-y-2">
          {t.external.map((e) => (
            <li key={e.claim} className="text-sm">
              {e.claim}{" "}
              <a href={e.url} target="_blank" rel="noopener noreferrer" className="text-xs underline">
                source
              </a>{" "}
              <span className="text-xs text-muted-foreground">({e.reliability})</span>
            </li>
          ))}
        </ul>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">Not found</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5">
              {t.notFound.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
