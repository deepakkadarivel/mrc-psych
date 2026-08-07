"use client";

import { AlertTriangle, HelpCircle, Lightbulb, NotebookText, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { TableChart, getChartData } from "@/components/table-chart";
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
      <TabsList className="mx-0 shrink-0">
        <TabsTrigger value="notes" className="gap-1.5">
          <NotebookText className="size-4" /> Notes
        </TabsTrigger>
        <TabsTrigger value="tables" className="gap-1.5">
          <Table2 className="size-4" /> Tables ({guide.tables.length})
        </TabsTrigger>
        <TabsTrigger value="mnemonics" className="gap-1.5">
          <Lightbulb className="size-4" /> Mnemonics ({guide.mnemonics.length})
        </TabsTrigger>
        <TabsTrigger value="traps" className="gap-1.5">
          <AlertTriangle className="size-4" /> Traps ({guide.examinerTraps.length})
        </TabsTrigger>
        <TabsTrigger value="gaps" className="gap-1.5">
          <HelpCircle className="size-4" /> Gaps ({guide.gaps.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="flex-1 overflow-y-auto">
        <Accordion className="px-1">
          {guide.condensedNotes.map((group) => (
            <AccordionItem key={group.heading} value={group.heading}>
              <AccordionTrigger className="px-3">
                <span className="font-medium">{group.heading}</span>
                <Badge variant="secondary" className="ml-2 text-xs">{group.bullets.length}</Badge>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-4">
                <ul className="space-y-4">
                  {group.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <p className="flex-1 text-[0.9rem] leading-7 text-foreground/90">
                        <span className="mr-1.5 text-primary">▸</span>
                        <RichText text={b.text} />
                      </p>
                      <CitationBadge source={b.source} onClick={onCite} className="mt-1 shrink-0" />
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </TabsContent>

      <TabsContent value="tables" className="flex-1 overflow-y-auto p-4 space-y-8">
        {guide.tables.map((t, i) => {
          const chart = getChartData(t.columns, t.rows);
          return (
            <div key={i}>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{t.title}</h3>
                {t.highYield && (
                  <Badge className="border-transparent bg-amber-500 text-white dark:bg-amber-600">
                    High-yield
                  </Badge>
                )}
                <div className="flex gap-1">
                  {t.sources.map((s, si) => (
                    <CitationBadge key={si} source={s} onClick={onCite} />
                  ))}
                </div>
              </div>
              {chart && (
                <div className="mt-3 rounded-md border p-3">
                  <TableChart data={chart.data} seriesNames={chart.seriesNames} />
                </div>
              )}
              <div className="mt-3 overflow-x-auto rounded-md border">
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
                          <TableCell key={ci} className="text-sm">
                            <RichText text={cell} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </TabsContent>

      <TabsContent value="mnemonics" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.mnemonics.map((m, i) => (
          <Alert key={i} className="border-l-4 border-l-violet-500 bg-violet-50/60 dark:bg-violet-950/30">
            <Lightbulb className="text-violet-600 dark:text-violet-400" />
            <AlertTitle className="flex items-center justify-between gap-2">
              <span className="text-violet-950 dark:text-violet-100">{m.mnemonic}</span>
              {m.sourced && m.source ? (
                <CitationBadge source={m.source} onClick={onCite} />
              ) : (
                <Badge variant="secondary" className="text-xs">not in source</Badge>
              )}
            </AlertTitle>
            <AlertDescription>
              <p className="text-violet-800 dark:text-violet-300">for: {m.forTopic}</p>
              <ul className="mt-1.5 space-y-0.5">
                {m.expansion.map((e, ei) => (
                  <li key={ei}>– <RichText text={e} /></li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        ))}
      </TabsContent>

      <TabsContent value="traps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.examinerTraps.map((t, i) => (
          <Alert key={i} className="border-l-4 border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/30">
            <AlertTriangle className="text-amber-600 dark:text-amber-400" />
            <AlertTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{t.format}</Badge>
              <CitationBadge source={t.source} onClick={onCite} />
            </AlertTitle>
            <AlertDescription className="text-amber-900 dark:text-amber-200">
              <RichText text={t.text} />
            </AlertDescription>
          </Alert>
        ))}
      </TabsContent>

      <TabsContent value="gaps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.gaps.map((g, i) => (
          <Alert key={i} className="border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30">
            <HelpCircle className="text-rose-600 dark:text-rose-400" />
            <AlertTitle className="text-rose-950 dark:text-rose-100">{g.subtopic}</AlertTitle>
            <AlertDescription className="text-rose-800 dark:text-rose-300">
              <RichText text={g.note} />
            </AlertDescription>
          </Alert>
        ))}
      </TabsContent>
    </Tabs>
  );
}
