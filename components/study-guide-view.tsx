"use client";

import {
  AlertTriangle,
  BookOpenText,
  HelpCircle,
  Lightbulb,
  NotebookText,
  Table2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { CATEGORY_COLOR_CLASSES, COMPARISON_TABLE_COLORS, DEFAULT_TABLE_COLORS } from "@/lib/category-colors";
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

// Every tab's content sits inside this "paper" wrapper — fixed white/light regardless of the
// app's theme, narrow max-width so line length stays readable even when the PDF panel is
// hidden and the notes column spans a wide viewport. No shadow/card — the print-document feel
// comes from typography and color fidelity to the reference, not from faking page depth.
function Paper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[820px] bg-white px-6 py-8 text-[#1A1A1A] md:px-10">
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="border-b-2 border-[#1B3A5C] pb-2 text-xl font-bold text-[#1B3A5C] md:text-[26px]">
      {children}
    </h2>
  );
}

function ParagraphBlockView({ block, onCite }: { block: ParagraphBlock; onCite: Cite }) {
  return (
    <li className="flex items-start gap-3 marker:text-[#1B3A5C]">
      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#1B3A5C]" />
      <p className="flex-1 text-[15px] leading-7">
        <RichText text={block.text} />
      </p>
      <CitationBadge source={block.source} onClick={onCite} className="mt-1 shrink-0" />
    </li>
  );
}

function TableBlockView({ block, onCite }: { block: TableBlock; onCite: Cite }) {
  const colors = block.category ? CATEGORY_COLOR_CLASSES[block.category.color] : DEFAULT_TABLE_COLORS;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {block.category && (
          <span className={`text-sm font-semibold ${colors.text}`}>{block.category.label}</span>
        )}
        {block.title && <h3 className="font-semibold text-[#1A1A1A]">{block.title}</h3>}
        {block.highYield && (
          <Badge className="border-transparent bg-amber-500 text-white">High-yield</Badge>
        )}
        <div className="flex gap-1">
          {block.sources.map((s, si) => (
            <CitationBadge key={si} source={s} onClick={onCite} />
          ))}
        </div>
      </div>
      <div className={`mt-2 overflow-x-auto rounded-sm border ${colors.border}`}>
        <Table>
          <TableHeader>
            <TableRow className={colors.header}>
              {block.columns.map((c) => (
                <TableHead key={c} className="text-[13px] font-semibold text-white md:text-sm">
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, ri) => (
              <TableRow key={ri} className={ri % 2 === 0 ? colors.rowTint : "bg-white"}>
                {row.map((cell, ci) => (
                  <TableCell key={ci} className="text-[14px] text-[#1A1A1A]">
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
  const colors = COMPARISON_TABLE_COLORS;
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className={`font-semibold ${colors.text}`}>{block.title}</h3>
        <div className="flex gap-1">
          {block.sources.map((s, si) => (
            <CitationBadge key={si} source={s} onClick={onCite} />
          ))}
        </div>
      </div>
      <div className={`mt-2 overflow-x-auto rounded-sm border ${colors.border}`}>
        <Table>
          <TableHeader>
            <TableRow className={colors.header}>
              {block.columns.map((c) => (
                <TableHead key={c} className="text-[13px] font-semibold text-white md:text-sm">
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {block.rows.map((row, ri) => (
              <TableRow key={ri} className={ri % 2 === 0 ? colors.rowTint : "bg-white"}>
                {row.map((cell, ci) => (
                  <TableCell key={ci} className="text-[14px] text-[#1A1A1A]">
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
    <Alert className="border-l-4 border-l-[#7D3C98] bg-[#F1E6F7]">
      <Lightbulb className="text-[#7D3C98]" />
      <AlertTitle className="flex items-center justify-between gap-2">
        <span className="text-[#6C3483]">{block.mnemonic}</span>
        {block.sourced && block.source ? (
          <CitationBadge source={block.source} onClick={onCite} />
        ) : (
          <Badge variant="secondary" className="text-xs">not in source</Badge>
        )}
      </AlertTitle>
      <AlertDescription>
        <p className="text-[#7D3C98]">for: {block.forTopic}</p>
        <ul className="mt-1.5 space-y-0.5 text-[#1A1A1A]">
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
    <div className="rounded-md border-2 border-[#B71C1C] bg-[#FBE3E1] p-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-4 text-[#B71C1C]" />
        <span className="font-bold text-[#7B241C]">EXAM TRAP</span>
        <Badge variant="outline" className="border-[#B71C1C] text-xs text-[#7B241C]">{block.format}</Badge>
        <CitationBadge source={block.source} onClick={onCite} />
      </div>
      <p className="mt-2 text-[14px] leading-6 font-semibold text-[#7B241C]">
        <RichText text={block.text} />
      </p>
    </div>
  );
}

function TrapListBlockView({ block, onCite }: { block: TrapListBlock; onCite: Cite }) {
  return (
    <div>
      <p className="font-bold text-[#C0392B]">⚡ {block.title}</p>
      <ul className="mt-2 space-y-2">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#C0392B]" />
            <span className="flex-1 text-[14px] leading-6 text-[#1A1A1A]">
              <RichText text={item.text} />
            </span>
            <CitationBadge source={item.source} onClick={onCite} className="mt-0.5 shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function GapBlockView({ block }: { block: GapBlock }) {
  return (
    <div className="rounded-sm border-l-4 border-l-rose-600 bg-rose-50 p-4">
      <p className="font-semibold text-rose-900">{block.subtopic}</p>
      <p className="mt-1 text-[14px] leading-6 text-rose-800">
        <RichText text={block.note} />
      </p>
    </div>
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
      <TabsList className="mx-0 shrink-0 overflow-x-auto">
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

      <TabsContent value="full" className="flex-1 overflow-y-auto">
        <Paper>
          <div className="space-y-10">
            {guide.sections.map((section) => (
              <div key={section.id}>
                <SectionHeading>{section.title}</SectionHeading>
                {section.intro && (
                  <p className="mt-3 text-[15px] leading-7">
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
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 overflow-y-auto">
        <Paper>
          <Accordion>
            {guide.sections
              .filter((s) => s.blocks.some((b) => b.type === "paragraph"))
              .map((section) => {
                const paragraphs = section.blocks.filter(
                  (b): b is ParagraphBlock => b.type === "paragraph"
                );
                return (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger>
                      <span className="font-semibold text-[#1B3A5C]">{section.title}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">{paragraphs.length}</Badge>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
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
        </Paper>
      </TabsContent>

      <TabsContent value="tables" className="flex-1 overflow-y-auto">
        <Paper>
          <div className="space-y-8">
            {guide.sections.flatMap((section) =>
              section.blocks
                .filter((b): b is TableBlock | ComparisonBlock => b.type === "table" || b.type === "comparison")
                .map((block, i) => (
                  <div key={`${section.id}-${i}`}>
                    <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
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
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="mnemonics" className="flex-1 overflow-y-auto">
        <Paper>
          <div className="space-y-3">
            {guide.sections.flatMap((section) =>
              section.blocks
                .filter((b): b is MnemonicBlock => b.type === "mnemonic")
                .map((block, i) => <MnemonicBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />)
            )}
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="traps" className="flex-1 overflow-y-auto">
        <Paper>
          <div className="space-y-4">
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
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="gaps" className="flex-1 overflow-y-auto">
        <Paper>
          <div className="space-y-3">
            {guide.sections.flatMap((section) =>
              section.blocks
                .filter((b): b is GapBlock => b.type === "gap")
                .map((block, i) => <GapBlockView key={`${section.id}-${i}`} block={block} />)
            )}
          </div>
        </Paper>
      </TabsContent>
    </Tabs>
  );
}
