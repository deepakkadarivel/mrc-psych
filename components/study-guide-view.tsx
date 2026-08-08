"use client";

import {
  AlertTriangle,
  BookOpenText,
  HelpCircle,
  Lightbulb,
  NotebookText,
  Table2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { TableChart, getChartData } from "@/components/table-chart";
import { CATEGORY_COLOR_CLASSES } from "@/lib/category-colors";
import type {
  Block,
  ComparisonBlock,
  GapBlock,
  MnemonicBlock,
  ParagraphBlock,
  Source,
  StudyGuide,
  TableBlock,
  TrapBlock,
  TrapListBlock,
} from "@/lib/types";

type Cite = (source: Source) => void;

function ParagraphBlockView({ block, onCite }: { block: ParagraphBlock; onCite: Cite }) {
  return (
    <li className="flex items-start gap-3">
      <p className="flex-1 text-[0.9rem] leading-7 text-foreground/90">
        <span className="mr-1.5 text-primary">▸</span>
        <RichText text={block.text} />
      </p>
      <CitationBadge source={block.source} onClick={onCite} className="mt-1 shrink-0" />
    </li>
  );
}

function TableBlockView({ block, onCite }: { block: TableBlock; onCite: Cite }) {
  const chart = getChartData(block.columns, block.rows);
  const colors = block.category ? CATEGORY_COLOR_CLASSES[block.category.color] : null;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {block.category && (
          <span className={`text-sm font-semibold ${colors!.label}`}>{block.category.label}</span>
        )}
        {block.title && <h3 className="font-medium">{block.title}</h3>}
        {block.highYield && (
          <Badge className="border-transparent bg-amber-500 text-white dark:bg-amber-600">
            High-yield
          </Badge>
        )}
        <div className="flex gap-1">
          {block.sources.map((s, si) => (
            <CitationBadge key={si} source={s} onClick={onCite} />
          ))}
        </div>
      </div>
      {chart && (
        <div className="mt-3 rounded-md border p-3">
          <TableChart data={chart.data} seriesNames={chart.seriesNames} />
        </div>
      )}
      <div className={`mt-3 overflow-x-auto rounded-md border ${colors ? colors.border : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className={colors ? colors.header : undefined}>
              {block.columns.map((c) => (
                <TableHead key={c} className={colors ? "text-inherit" : undefined}>
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, ri) => (
              <TableRow key={ri} className={colors ? colors.rowTint : undefined}>
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
}

function ComparisonBlockView({ block, onCite }: { block: ComparisonBlock; onCite: Cite }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-medium">{block.title}</h3>
        <div className="flex gap-1">
          {block.sources.map((s, si) => (
            <CitationBadge key={si} source={s} onClick={onCite} />
          ))}
        </div>
      </div>
      <div className="mt-3 overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              {block.columns.map((c) => (
                <TableHead key={c}>{c}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, ri) => (
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
}

function MnemonicBlockView({ block, onCite }: { block: MnemonicBlock; onCite: Cite }) {
  return (
    <Alert className="border-l-4 border-l-violet-500 bg-violet-50/60 dark:bg-violet-950/30">
      <Lightbulb className="text-violet-600 dark:text-violet-400" />
      <AlertTitle className="flex items-center justify-between gap-2">
        <span className="text-violet-950 dark:text-violet-100">{block.mnemonic}</span>
        {block.sourced && block.source ? (
          <CitationBadge source={block.source} onClick={onCite} />
        ) : (
          <Badge variant="secondary" className="text-xs">not in source</Badge>
        )}
      </AlertTitle>
      <AlertDescription>
        <p className="text-violet-800 dark:text-violet-300">for: {block.forTopic}</p>
        <ul className="mt-1.5 space-y-0.5">
          {block.expansion.map((e, ei) => (
            <li key={ei}>– <RichText text={e} /></li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function TrapBlockView({ block, onCite }: { block: TrapBlock; onCite: Cite }) {
  return (
    <Alert className="border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-950/30">
      <AlertTriangle className="text-red-600 dark:text-red-400" />
      <AlertTitle className="flex items-center gap-2">
        <span className="text-red-950 dark:text-red-100">⚠️ Exam trap</span>
        <Badge variant="outline" className="text-xs">{block.format}</Badge>
        <CitationBadge source={block.source} onClick={onCite} />
      </AlertTitle>
      <AlertDescription className="text-red-900 dark:text-red-200">
        <RichText text={block.text} />
      </AlertDescription>
    </Alert>
  );
}

function TrapListBlockView({ block, onCite }: { block: TrapListBlock; onCite: Cite }) {
  return (
    <Alert className="border-l-4 border-l-red-500 bg-red-50/60 dark:bg-red-950/30">
      <Zap className="text-red-600 dark:text-red-400" />
      <AlertTitle className="text-red-950 dark:text-red-100">⚡ {block.title}</AlertTitle>
      <AlertDescription>
        <ul className="mt-1.5 space-y-1.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-red-900 dark:text-red-200">
              <span className="flex-1">– <RichText text={item.text} /></span>
              <CitationBadge source={item.source} onClick={onCite} className="mt-0.5 shrink-0" />
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function GapBlockView({ block }: { block: GapBlock }) {
  return (
    <Alert className="border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/30">
      <HelpCircle className="text-rose-600 dark:text-rose-400" />
      <AlertTitle className="text-rose-950 dark:text-rose-100">{block.subtopic}</AlertTitle>
      <AlertDescription className="text-rose-800 dark:text-rose-300">
        <RichText text={block.note} />
      </AlertDescription>
    </Alert>
  );
}

function BlockView({ block, onCite }: { block: Block; onCite: Cite }) {
  switch (block.type) {
    case "paragraph":
      return (
        <ul>
          <ParagraphBlockView block={block} onCite={onCite} />
        </ul>
      );
    case "table":
      return <TableBlockView block={block} onCite={onCite} />;
    case "comparison":
      return <ComparisonBlockView block={block} onCite={onCite} />;
    case "mnemonic":
      return <MnemonicBlockView block={block} onCite={onCite} />;
    case "trap":
      return <TrapBlockView block={block} onCite={onCite} />;
    case "trap-list":
      return <TrapListBlockView block={block} onCite={onCite} />;
    case "gap":
      return <GapBlockView block={block} />;
  }
}

function countBlocks(guide: StudyGuide, ...types: Block["type"][]): number {
  let n = 0;
  for (const section of guide.sections) {
    for (const block of section.blocks) {
      if (types.includes(block.type)) {
        n += block.type === "trap-list" ? (block as TrapListBlock).items.length : 1;
      }
    }
  }
  return n;
}

export function StudyGuideView({
  guide,
  onCite,
}: {
  guide: StudyGuide;
  onCite: (source: Source) => void;
}) {
  const tableCount = countBlocks(guide, "table", "comparison");
  const mnemonicCount = countBlocks(guide, "mnemonic");
  const trapCount = countBlocks(guide, "trap", "trap-list");
  const gapCount = countBlocks(guide, "gap");

  return (
    <Tabs defaultValue="full" className="h-full flex flex-col">
      <TabsList className="mx-0 shrink-0">
        <TabsTrigger value="full" className="gap-1.5">
          <BookOpenText className="size-4" /> Full Guide
        </TabsTrigger>
        <TabsTrigger value="notes" className="gap-1.5">
          <NotebookText className="size-4" /> Notes
        </TabsTrigger>
        <TabsTrigger value="tables" className="gap-1.5">
          <Table2 className="size-4" /> Tables ({tableCount})
        </TabsTrigger>
        <TabsTrigger value="mnemonics" className="gap-1.5">
          <Lightbulb className="size-4" /> Mnemonics ({mnemonicCount})
        </TabsTrigger>
        <TabsTrigger value="traps" className="gap-1.5">
          <AlertTriangle className="size-4" /> Traps ({trapCount})
        </TabsTrigger>
        <TabsTrigger value="gaps" className="gap-1.5">
          <HelpCircle className="size-4" /> Gaps ({gapCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="full" className="flex-1 overflow-y-auto p-4 space-y-10">
        {guide.sections.map((section) => (
          <div key={section.id}>
            <h2 className="text-lg font-semibold border-b pb-2">{section.title}</h2>
            {section.intro && (
              <p className="mt-3 text-sm leading-7 text-foreground/90">
                <RichText text={section.intro} />
              </p>
            )}
            <div className="mt-4 space-y-5">
              {section.blocks.map((block, i) => (
                <BlockView key={i} block={block} onCite={onCite} />
              ))}
            </div>
          </div>
        ))}
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-y-auto">
        <Accordion className="px-1">
          {guide.sections
            .filter((s) => s.blocks.some((b) => b.type === "paragraph"))
            .map((section) => {
              const paragraphs = section.blocks.filter(
                (b): b is ParagraphBlock => b.type === "paragraph"
              );
              return (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="px-3">
                    <span className="font-medium">{section.title}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">{paragraphs.length}</Badge>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4">
                    <ul className="space-y-4">
                      {paragraphs.map((b, i) => (
                        <ParagraphBlockView key={i} block={b} onCite={onCite} />
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
        </Accordion>
      </TabsContent>

      <TabsContent value="tables" className="flex-1 overflow-y-auto p-4 space-y-8">
        {guide.sections.flatMap((section) =>
          section.blocks
            .filter((b): b is TableBlock | ComparisonBlock => b.type === "table" || b.type === "comparison")
            .map((block, i) => (
              <div key={`${section.id}-${i}`}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {section.title}
                </p>
                <div className="mt-1.5">
                  {block.type === "table" ? (
                    <TableBlockView block={block} onCite={onCite} />
                  ) : (
                    <ComparisonBlockView block={block} onCite={onCite} />
                  )}
                </div>
              </div>
            ))
        )}
      </TabsContent>

      <TabsContent value="mnemonics" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.sections.flatMap((section) =>
          section.blocks
            .filter((b): b is MnemonicBlock => b.type === "mnemonic")
            .map((block, i) => <MnemonicBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />)
        )}
      </TabsContent>

      <TabsContent value="traps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.sections.flatMap((section) =>
          section.blocks
            .filter((b): b is TrapBlock | TrapListBlock => b.type === "trap" || b.type === "trap-list")
            .map((block, i) =>
              block.type === "trap" ? (
                <TrapBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />
              ) : (
                <TrapListBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />
              )
            )
        )}
      </TabsContent>

      <TabsContent value="gaps" className="flex-1 overflow-y-auto p-4 space-y-3">
        {guide.sections.flatMap((section) =>
          section.blocks
            .filter((b): b is GapBlock => b.type === "gap")
            .map((block, i) => <GapBlockView key={`${section.id}-${i}`} block={block} />)
        )}
      </TabsContent>
    </Tabs>
  );
}
