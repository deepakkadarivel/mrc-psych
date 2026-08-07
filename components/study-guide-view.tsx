"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CitationBadge } from "@/components/citation-badge";
import type { Source, StudyGuide } from "@/lib/types";

export function StudyGuideView({
  guide,
  onCite,
}: {
  guide: StudyGuide;
  onCite: (source: Source) => void;
}) {
  return (
    <Tabs defaultValue="notes" className="h-full flex flex-col">
      <TabsList className="shrink-0">
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="tables">Tables ({guide.tables.length})</TabsTrigger>
        <TabsTrigger value="mnemonics">Mnemonics ({guide.mnemonics.length})</TabsTrigger>
        <TabsTrigger value="traps">Traps ({guide.examinerTraps.length})</TabsTrigger>
        <TabsTrigger value="gaps">Gaps ({guide.gaps.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 space-y-5">
        {guide.condensedNotes.map((group) => (
          <div key={group.heading}>
            <h3 className="font-medium">{group.heading}</h3>
            <ul className="mt-2 space-y-2">
              {group.bullets.map((b, i) => (
                <li key={i} className="flex items-start justify-between gap-2 text-sm leading-relaxed">
                  <span>• {b.text}</span>
                  <CitationBadge source={b.source} onClick={onCite} className="shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="tables" className="flex-1 overflow-y-auto p-4 space-y-6">
        {guide.tables.map((t, i) => (
          <div key={i}>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{t.title}</h3>
              {t.highYield && <Badge className="bg-amber-500 text-white">High-yield</Badge>}
              <div className="flex gap-1">
                {t.sources.map((s, si) => (
                  <CitationBadge key={si} source={s} onClick={onCite} />
                ))}
              </div>
            </div>
            <div className="mt-2 overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {t.columns.map((c) => (
                      <TableHead key={c}>{c}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {t.rows.map((row, ri) => (
                    <TableRow key={ri}>
                      {row.map((cell, ci) => (
                        <TableCell key={ci} className="text-sm">{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="mnemonics" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.mnemonics.map((m, i) => (
          <div key={i} className="rounded-md border border-violet-300 bg-violet-50 p-3 dark:border-violet-800 dark:bg-violet-950/40">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-violet-900 dark:text-violet-200">{m.mnemonic}</span>
              {m.sourced && m.source ? (
                <CitationBadge source={m.source} onClick={onCite} />
              ) : (
                <Badge variant="secondary" className="text-xs">not in source</Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-violet-800 dark:text-violet-300">for: {m.forTopic}</p>
            <ul className="mt-2 space-y-0.5 text-sm">
              {m.expansion.map((e, ei) => (
                <li key={ei}>– {e}</li>
              ))}
            </ul>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="traps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.examinerTraps.map((t, i) => (
          <div key={i} className="rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/40">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-amber-900 dark:text-amber-200">{t.text}</p>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="outline" className="text-xs">{t.format}</Badge>
                <CitationBadge source={t.source} onClick={onCite} />
              </div>
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="gaps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.gaps.map((g, i) => (
          <div key={i} className="rounded-md border border-rose-300 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/40">
            <p className="font-medium text-rose-900 dark:text-rose-200">{g.subtopic}</p>
            <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">{g.note}</p>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
