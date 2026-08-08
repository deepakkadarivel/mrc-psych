"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { usePortalSlot } from "@/hooks/use-portal-slot";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_CLASSES, COMPARISON_TABLE_COLORS, DEFAULT_TABLE_COLORS } from "@/lib/category-colors";
import type {
  Block,
  ComparisonBlock,
  GapBlock,
  MnemonicBlock,
  ParagraphBlock,
  Section,
  Source,
  StudyGuide,
  TableBlock,
  TrapBlock,
  TrapListBlock,
} from "@/lib/types";

type Cite = (source: Source) => void;

// Every tab's content sits inside this "paper" wrapper — fixed white/light regardless of the
// app's theme. `[&_strong]/[&_em]` give bold/italic markup (RichText) a consistent accent color
// everywhere it appears (tables, mnemonics, traps, gaps, paragraphs) so emphasis actually reads
// as emphasis, not just a font-weight change on the same black text.
function Paper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[880px] bg-white px-5 py-8 text-[16px] text-[#1A1A1A] md:px-10 md:py-10 [&_em]:font-medium [&_em]:text-[#4A5568] [&_strong]:font-extrabold [&_strong]:text-[#1B3A5C]">
      {children}
    </div>
  );
}

// Deliberately NOT a card — the section itself is just a heading, not a boxed container. Only
// individual blocks (tables, mnemonics, traps, gaps) are cards; wrapping the entire section
// (heading + intro + every block inside it) in one more enclosing card was a genuine over-read
// of "use better cards" and made the whole page read as one giant nested box.
function SectionHeading({ section }: { section: Section }) {
  return (
    <div className="flex items-center gap-2.5 border-b-2 border-[#1B3A5C] pb-2">
      <BookOpenText className="size-5 shrink-0 text-[#1B3A5C]" />
      <h2 className="text-xl font-bold text-[#1B3A5C] md:text-2xl">{section.title}</h2>
    </div>
  );
}

// A numbered enumeration already written inline in the source text — "(1) ... (2) ... (3) ..." —
// reads as one dense run-on bullet. This splits it into a lead-in + sub-bullets PURELY at render
// time: same words, same citation, just different line breaks — no content is added, removed, or
// reworded, so it carries none of the fabrication risk a real rewrite would. Requires markers to
// start at (1) and run strictly sequentially (1,2,3,...) and be 1-2 digits, which is what
// separates a real enumeration from an incidental parenthetical like "Section 5(2)" (not
// sequential from 1) or a citation year "(1998)" (too many digits) — verified against ~20 real
// examples across multiple topics before shipping, not just the one that prompted this.
const ENUM_MARKER_RE = /(?<!\d)\((\d{1,2})\)/g;

function splitEnumeratedClauses(text: string): { lead: string; items: string[] } | null {
  const matches = [...text.matchAll(ENUM_MARKER_RE)];
  if (matches.length < 2) return null;
  for (let i = 0; i < matches.length; i++) {
    if (Number(matches[i][1]) !== i + 1) return null;
  }
  const lead = text.slice(0, matches[0].index).trim();
  const items: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index! + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const item = text
      .slice(start, end)
      .trim()
      .replace(/[,;]?\s*(?:and|or)?\s*$/i, "")
      .trim();
    items.push(item);
  }
  if (items.some((it) => it.length === 0)) return null;
  return { lead, items };
}

// The citation sits inline, right after the text it supports — not as a flex sibling pinned to
// the far right of the row. Pinning it to the row's end made every bullet look like two columns
// (text on the left, a "reference column" of badges running down the right) instead of one
// flowing line of text with a small reference mark at the end, like a footnote.
function ParagraphBlockView({ block, onCite }: { block: ParagraphBlock; onCite: Cite }) {
  const split = splitEnumeratedClauses(block.text);
  const citation = <CitationBadge source={block.source} onClick={onCite} className="align-middle" />;

  return (
    <li className="flex items-start gap-3">
      <span className="mt-3 size-1.5 shrink-0 rounded-full bg-[#1B3A5C]" />
      <div className="flex-1 text-[16px] leading-7 md:text-[17px] md:leading-8">
        {split ? (
          <>
            {split.lead && (
              <p>
                <RichText text={split.lead} />
              </p>
            )}
            <ul className="mt-1.5 space-y-1">
              {split.items.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-[#1B3A5C]/60">–</span>
                  <span>
                    <RichText text={item} />
                    {i === split.items.length - 1 && <> {citation}</>}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>
            <RichText text={block.text} /> {citation}
          </p>
        )}
      </div>
    </li>
  );
}

// Shared cell/head classes: overrides the shadcn Table primitive's default `whitespace-nowrap`
// (that plus its `overflow-x-auto` container is what forced every wide table to scroll
// horizontally instead of wrapping text within its column). `table-fixed` on <Table> makes
// column widths respect the container instead of growing to fit unwrapped content.
const TABLE_HEAD_CLASS =
  "h-auto whitespace-normal break-words px-3 py-2.5 align-top text-[13px] font-bold text-white md:text-[14px]";
const TABLE_CELL_CLASS =
  "whitespace-normal break-words px-3 py-2.5 align-top text-[14px] leading-6 text-[#1A1A1A] md:text-[15px]";

function TableBlockView({ block, onCite }: { block: TableBlock; onCite: Cite }) {
  const colors = block.category ? CATEGORY_COLOR_CLASSES[block.category.color] : DEFAULT_TABLE_COLORS;
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        {block.category && (
          <span className={`text-sm font-bold uppercase tracking-wide ${colors.text}`}>
            {block.category.label}
          </span>
        )}
        {block.title && <h3 className="text-base font-semibold text-[#1A1A1A]">{block.title}</h3>}
        {block.highYield && (
          <Badge className="border-transparent bg-amber-500 text-white">High-yield</Badge>
        )}
      </div>
      <div className={`mt-2 overflow-hidden rounded-xl border shadow-sm ${colors.border}`}>
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className={colors.header}>
                {block.columns.map((c) => (
                  <TableHead key={c} className={TABLE_HEAD_CLASS}>
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, ri) => (
                <TableRow key={ri} className={ri % 2 === 0 ? colors.rowTint : "bg-white"}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className={TABLE_CELL_CLASS}>
                      <RichText text={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {block.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#D9D9D9] bg-[#FAFAFA] px-3 py-2">
            {block.sources.map((s, si) => (
              <CitationBadge key={si} source={s} onClick={onCite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonBlockView({ block, onCite }: { block: ComparisonBlock; onCite: Cite }) {
  const colors = COMPARISON_TABLE_COLORS;
  return (
    <div>
      <h3 className={`text-sm font-bold uppercase tracking-wide ${colors.text}`}>{block.title}</h3>
      <div className={`mt-2 overflow-hidden rounded-xl border shadow-sm ${colors.border}`}>
        <div className="overflow-x-auto">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow className={colors.header}>
                {block.columns.map((c) => (
                  <TableHead key={c} className={TABLE_HEAD_CLASS}>
                    {c}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row, ri) => (
                <TableRow key={ri} className={ri % 2 === 0 ? colors.rowTint : "bg-white"}>
                  {row.map((cell, ci) => (
                    <TableCell key={ci} className={TABLE_CELL_CLASS}>
                      <RichText text={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {block.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#D9D9D9] bg-[#FAFAFA] px-3 py-2">
            {block.sources.map((s, si) => (
              <CitationBadge key={si} source={s} onClick={onCite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MnemonicBlockView({ block, onCite }: { block: MnemonicBlock; onCite: Cite }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#7D3C98] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#7D3C98] px-4 py-2.5">
        <span className="flex items-center gap-2 text-base font-bold text-white">
          <Lightbulb className="size-4 shrink-0" />
          {block.mnemonic}
        </span>
        {block.sourced && block.source ? (
          <CitationBadge
            source={block.source}
            onClick={onCite}
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          />
        ) : (
          <Badge className="border-white/40 bg-white/10 text-xs text-white">Mnemonic — not in source</Badge>
        )}
      </div>
      <div className="bg-[#F1E6F7] px-4 py-3.5">
        <p className="text-[13px] font-bold tracking-wide text-[#7D3C98] uppercase">For: {block.forTopic}</p>
        <ul className="mt-2 space-y-1.5">
          {block.expansion.map((e, ei) => (
            <li key={ei} className="text-[15px] leading-7 text-[#1A1A1A] md:text-[16px]">
              <span className="font-bold text-[#7D3C98]">–</span> <RichText text={e} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function TrapBlockView({ block, onCite }: { block: TrapBlock; onCite: Cite }) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-[#B71C1C] shadow-sm">
      <div className="flex items-center gap-2 bg-[#B71C1C] px-4 py-2.5">
        <AlertTriangle className="size-4 shrink-0 text-white" />
        <span className="text-sm font-bold tracking-wide text-white">EXAM TRAP</span>
        <Badge className="border-white/40 bg-white/10 text-xs text-white">{block.format}</Badge>
      </div>
      <div className="bg-[#FBE3E1] px-4 py-3.5">
        <p className="text-[15px] leading-7 font-semibold text-[#7B241C] md:text-[16px]">
          <RichText text={block.text} />
        </p>
      </div>
      <div className="flex items-center justify-end border-t border-[#B71C1C]/25 bg-[#FBE3E1] px-4 py-1.5">
        <CitationBadge
          source={block.source}
          onClick={onCite}
          className="border-[#B71C1C]/30 bg-white text-[#7B241C] hover:bg-[#FBE3E1]"
        />
      </div>
    </div>
  );
}

// Deliberately NOT a bordered/backgrounded box — verified against every page of the reference
// that "MCQ Traps — Remember These!" lists render as a plain heading + bullet list with no box
// at all. Visual weight instead comes from a bigger heading, an icon, and a colored rule.
function TrapListBlockView({ block, onCite }: { block: TrapListBlock; onCite: Cite }) {
  return (
    <div>
      <div className="flex items-center gap-2 border-b-2 border-[#C0392B] pb-2">
        <Zap className="size-4 shrink-0 text-[#C0392B]" />
        <p className="text-base font-bold text-[#C0392B]">{block.title}</p>
      </div>
      <ul className="mt-3 space-y-3">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#C0392B]" />
            <span className="flex-1 text-[15px] leading-7 text-[#1A1A1A] md:text-[16px]">
              <RichText text={item.text} />{" "}
              <CitationBadge source={item.source} onClick={onCite} className="align-middle" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GapBlockView({ block }: { block: GapBlock }) {
  return (
    <div className="overflow-hidden rounded-xl border border-rose-300 shadow-sm">
      <div className="flex items-center gap-2 bg-rose-600 px-4 py-2.5">
        <HelpCircle className="size-4 shrink-0 text-white" />
        <span className="text-sm font-bold text-white">{block.subtopic}</span>
      </div>
      <div className="bg-rose-50 px-4 py-3.5">
        <p className="text-[15px] leading-7 text-rose-900 md:text-[16px]">
          <RichText text={block.note} />
        </p>
      </div>
    </div>
  );
}

// A left panel listing every section (like the app's own AppSidebar listing every topic) with the
// selected section's notes shown centered in the middle — replaces an earlier accordion-of-
// sections design. The nav is deliberately NOT inside <Paper>: it's navigation chrome, not study
// content that's meant to look like a printed page, so it follows the app's normal (theme-aware)
// styling. On md+ it's a genuinely independent-scrolling pane via ResizablePanelGroup (plain CSS
// `sticky` doesn't reliably hold here — Base UI's Tabs.Panel wraps content in an animated,
// transformed element, which changes what a `position: sticky` descendant sticks relative to;
// bounded-height resizable panes sidestep that entirely, and the user can drag to resize besides).
function NotesTabView({ guide, onCite }: { guide: StudyGuide; onCite: Cite }) {
  const sections = guide.sections.filter((s) => s.blocks.some((b) => b.type === "paragraph"));
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const active = sections.find((s) => s.id === activeId) ?? sections[0];
  const paragraphs = active
    ? active.blocks.filter((b): b is ParagraphBlock => b.type === "paragraph")
    : [];

  const navItems = (
    <ul className="flex gap-1.5 overflow-x-auto p-3 md:flex-col md:overflow-visible">
      {sections.map((s) => (
        <li key={s.id} className="shrink-0 md:shrink">
          <button
            type="button"
            onClick={() => setActiveId(s.id)}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-left text-sm font-medium whitespace-nowrap transition-colors md:whitespace-normal",
              s.id === active?.id
                ? "bg-muted font-semibold text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {s.title}
          </button>
        </li>
      ))}
    </ul>
  );

  const detail = active && (
    <>
      <h2 className="text-xl font-bold text-[#1B3A5C] md:text-2xl">{active.title}</h2>
      <ul className="mt-4 space-y-4">
        {paragraphs.map((b, i) => (
          <ParagraphBlockView key={i} block={b} onCite={onCite} />
        ))}
      </ul>
    </>
  );

  return (
    <>
      {/* Mobile: a plain stacked layout — dragging a resize handle doesn't translate to touch,
          so this stays the simple pill-row-then-content flow the rest of the app uses below md. */}
      <div className="md:hidden">
        <nav className="border-b">{navItems}</nav>
        <Paper>{detail}</Paper>
      </div>

      {/* Desktop: resizable, independently-scrolling nav + detail panes. Height is pinned to the
          measured consolidated-header height (94px, two rows — see app/layout.tsx), not an
          arbitrary vh guess, so the panel fills the actual available viewport with no leftover
          gap at the bottom. Can't use h-full here: topic-view.tsx's whole ancestor chain is
          deliberately unbounded/flowing (see "Layout height must be bounded"), so there's no
          bounded parent for h-full to resolve against without reintroducing that chain for every
          sibling tab too. */}
      <div className="hidden md:block md:h-[calc(100vh-94px)]">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize="26" minSize="18" maxSize="40">
            <nav className="h-full overflow-y-auto border-r">{navItems}</nav>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="74" minSize="40">
            <div className="h-full overflow-y-auto">
              <Paper>{detail}</Paper>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
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

  // This tab list renders in the root layout's sticky header (to the right of the outer
  // Study-Guide/Source-Notes tabs from topic-view.tsx), not inline here — see CLAUDE.md
  // "Consolidated sticky header". The <Tabs> root itself stays right here so its context still
  // wraps both the portaled list and the TabsContent panels below.
  const tabsRightSlot = usePortalSlot("page-header-tabs-right");

  return (
    <Tabs defaultValue="full" className="w-full">
      {tabsRightSlot &&
        createPortal(
          <TabsList className="mx-0 overflow-x-auto">
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
          </TabsList>,
          tabsRightSlot
        )}

      <TabsContent value="full">
        <Paper>
          <div className="space-y-10">
            {guide.sections.map((section) => (
              <div key={section.id}>
                <SectionHeading section={section} />
                <div className="mt-4 space-y-6">
                  {section.intro && (
                    <p className="text-[16px] leading-7 md:text-[17px] md:leading-8">
                      <RichText text={section.intro} />
                    </p>
                  )}
                  {section.blocks.map((block, i) => (
                    <BlockView key={i} block={block} onCite={onCite} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="notes">
        <NotesTabView guide={guide} onCite={onCite} />
      </TabsContent>

      <TabsContent value="tables">
        <Paper>
          <div className="space-y-8">
            {guide.sections.flatMap((section) =>
              section.blocks
                .filter((b): b is TableBlock | ComparisonBlock => b.type === "table" || b.type === "comparison")
                .map((block, i) => (
                  <div key={`${section.id}-${i}`}>
                    <p className="text-xs font-bold tracking-wide text-[#6B7280] uppercase">
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

      <TabsContent value="mnemonics">
        <Paper>
          <div className="space-y-4">
            {guide.sections.flatMap((section) =>
              section.blocks
                .filter((b): b is MnemonicBlock => b.type === "mnemonic")
                .map((block, i) => <MnemonicBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />)
            )}
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="traps">
        <Paper>
          <div className="space-y-5">
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

      <TabsContent value="gaps">
        <Paper>
          <div className="space-y-4">
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
