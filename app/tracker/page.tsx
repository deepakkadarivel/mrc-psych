"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trackerStore, type TrackerEntry } from "@/lib/tracker-store";

export default function TrackerPage() {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);

  useEffect(() => {
    setEntries(trackerStore.getEntries());
  }, []);

  const byTopic = new Map<string, { attempts: number; lastTwoPct: number[] }>();
  for (const e of entries) {
    const pct = (e.score / e.total) * 100;
    const cur = byTopic.get(e.topic) ?? { attempts: 0, lastTwoPct: [] };
    cur.attempts += 1;
    cur.lastTwoPct = [...cur.lastTwoPct, pct].slice(-2);
    byTopic.set(e.topic, cur);
  }
  const weakTopics = [...byTopic.entries()]
    .filter(([, v]) => !(v.lastTwoPct.length === 2 && v.lastTwoPct.every((p) => p > 75)))
    .map(([topic, v]) => ({ topic, ...v }));

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-semibold">Performance tracker</h1>

      {entries.length === 0 ? (
        <p className="text-muted-foreground">No quiz sessions logged yet — take a topic quiz to start tracking.</p>
      ) : (
        <>
          <div>
            <h2 className="mb-2 font-medium">Weak areas</h2>
            {weakTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                None — every attempted topic has scored &gt;75% twice in a row.
              </p>
            ) : (
              <ul className="list-disc pl-5 text-sm">
                {weakTopics.map((w) => (
                  <li key={w.topic}>
                    {w.topic} {w.attempts >= 3 && <span className="font-semibold text-red-600">🔴 Priority (3+ sessions)</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h2 className="mb-2 font-medium">Session history</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...entries].reverse().map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{new Date(e.date).toLocaleDateString()}</TableCell>
                    <TableCell>{e.topic}</TableCell>
                    <TableCell>
                      {e.score}/{e.total}
                    </TableCell>
                    <TableCell>{Math.round((e.score / e.total) * 100)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
