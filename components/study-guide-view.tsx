"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  BookOpenText,
  Download,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Lightbulb,
  ListChecks,
  MoreHorizontal,
  NotebookText,
  Table2,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CitationBadge } from "@/components/citation-badge";
import { QuizView } from "@/components/quiz-view";
import { RichText } from "@/components/rich-text";
import { usePortalSlot } from "@/hooks/use-portal-slot";
import { useTabParam } from "@/hooks/use-tab-param";
import { cn } from "@/lib/utils";
import { CATEGORY_COLOR_CLASSES, COMPARISON_TABLE_COLORS, DEFAULT_TABLE_COLORS } from "@/lib/category-colors";
import type {
  Block,
  ComparisonBlock,
  ConciseBullet,
  ConciseFact,
  GapBlock,
  ImageBlock,
  MnemonicBlock,
  ParagraphBlock,
  Question,
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
    <div className="mx-auto max-w-[880px] bg-[#FAF8F4] px-4 py-6 text-[15px] leading-[1.65] text-[#101826] md:px-10 md:py-10 md:text-[16px] md:leading-[1.7] [&_em]:font-medium [&_em]:text-[#5B6472] [&_strong]:font-extrabold [&_strong]:text-[#1B3A5C]">
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
      <h2 className="font-serif text-lg font-bold text-[#1B3A5C] md:text-2xl">{section.title}</h2>
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
  "whitespace-normal break-words px-3 py-2.5 align-top text-[14px] leading-6 text-[#101826] md:text-[15px]";

// Below `sm` (640px), a table-fixed grid forces every column to the same cramped width
// regardless of content — fine for 2 short columns, unreadable for 3-4. Below `sm` this renders
// each row as its own stacked card instead: a 2-column table (by far the most common shape in
// this content — "Term | Definition" style) reads as a bold term + its definition below, no
// labels needed; anything wider shows each column's own header as a small label above its value,
// since with 3+ groups the column meaning isn't self-evident from position alone. `sm:` and up
// renders the exact same real `<table>` this app always has — no data or column order changes,
// only how narrow viewports lay it out.
function DataTableGrid({
  columns,
  rows,
  colors,
}: {
  columns: string[];
  rows: string[][];
  colors: { header: string; rowTint: string; border: string; text: string };
}) {
  return (
    <>
      <div className="divide-y divide-[#E4E1D9] sm:hidden" data-testid="table-mobile-view">
        {rows.map((row, ri) => (
          <div key={ri} className={cn("px-3 py-3", ri % 2 === 0 ? colors.rowTint : "bg-[#FAF8F4]")}>
            {columns.length === 2 ? (
              <>
                <p className="text-[14.5px] font-bold text-[#101826]">
                  <RichText text={row[0]} />
                </p>
                <p className="mt-1 text-[13.5px] leading-6 text-[#101826]">
                  <RichText text={row[1]} />
                </p>
              </>
            ) : (
              <div className="space-y-1.5">
                {row.map((cell, ci) => (
                  <div key={ci}>
                    <p className="text-[10.5px] font-semibold tracking-wide text-[#5B6472] uppercase">{columns[ci]}</p>
                    <p className="text-[13.5px] leading-6 text-[#101826]">
                      <RichText text={cell} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className={colors.header}>
              {columns.map((c) => (
                <TableHead key={c} className={TABLE_HEAD_CLASS}>
                  {c}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, ri) => (
              <TableRow key={ri} className={ri % 2 === 0 ? colors.rowTint : "bg-[#FAF8F4]"}>
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
    </>
  );
}

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
        {block.title && <h3 className="text-base font-semibold text-[#101826]">{block.title}</h3>}
        {block.highYield && (
          <Badge className="border-transparent bg-[#F2A93B] text-white">High-yield</Badge>
        )}
      </div>
      <div className={`mt-2 overflow-hidden rounded-lg border shadow-sm ${colors.border}`}>
        <DataTableGrid columns={block.columns} rows={block.rows} colors={colors} />
        {block.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E4E1D9] bg-[#F3F1EC] px-3 py-2">
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
      <div className={`mt-2 overflow-hidden rounded-lg border shadow-sm ${colors.border}`}>
        <DataTableGrid columns={block.columns} rows={block.rows} colors={colors} />
        {block.sources.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#E4E1D9] bg-[#F3F1EC] px-3 py-2">
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
    <div className="overflow-hidden rounded-lg border border-[#7D3C98] shadow-sm">
      {/* Mobile-first stack: a long mnemonic phrase used to compete with the citation/badge in one
          `justify-between` row, and when it wrapped, `flex-wrap` left the badge stranded alone on
          its own line at the start edge instead of staying tidy next to the title. Stacking by
          default and only going side-by-side at sm: (where there's room) is deliberate, not
          incidental wrap behavior. */}
      <div className="flex flex-col items-start gap-2 bg-[#7D3C98] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
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
            <li key={ei} className="text-[15px] leading-7 text-[#101826] md:text-[16px]">
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
    <div className="overflow-hidden rounded-lg border-2 border-[#B71C1C] shadow-sm">
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
          className="border-[#B71C1C]/30 bg-[#FAF8F4] text-[#7B241C] hover:bg-[#FBE3E1]"
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
            <span className="flex-1 text-[15px] leading-7 text-[#101826] md:text-[16px]">
              <RichText text={item.text} />{" "}
              <CitationBadge source={item.source} onClick={onCite} className="align-middle" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageBlockView({ block, onCite }: { block: ImageBlock; onCite: Cite }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#1B3A5C]/30 shadow-sm">
      <div className="flex items-center gap-2 bg-[#1B3A5C] px-4 py-2.5">
        <ImageIcon className="size-4 shrink-0 text-white" />
        <span className="text-sm font-bold text-white">Figure</span>
      </div>
      <div className="bg-[#FAF8F4] p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- static export, images.unoptimized */}
        <img src={block.src} alt={block.caption} className="mx-auto max-w-full" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#1B3A5C]/15 bg-[#F5F7FA] px-4 py-2">
        <p className="text-[13px] leading-5 text-[#101826]/80 md:text-[14px]">{block.caption}</p>
        <CitationBadge source={block.source} onClick={onCite} className="shrink-0" />
      </div>
    </div>
  );
}

function GapBlockView({ block, onCite }: { block: GapBlock; onCite: Cite }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#C2607D] shadow-sm">
      <div className="flex items-center gap-2 bg-[#9C3E5C] px-4 py-2.5">
        <HelpCircle className="size-4 shrink-0 text-white" />
        <span className="text-sm font-bold text-white">{block.subtopic}</span>
      </div>
      <div className="bg-[#FBEEF1] px-4 py-3.5">
        <p className="text-[15px] leading-7 text-[#7A2F45] md:text-[16px]">
          <RichText text={block.note} />
          {block.source && (
            <>
              {" "}
              <CitationBadge source={block.source} onClick={onCite} className="align-middle" />
            </>
          )}
        </p>
      </div>
    </div>
  );
}

// Shared scaffold for a left panel listing sections (like the app's own AppSidebar listing every
// topic) with the selected section's content shown centered in the middle — used by both the
// Notes tab and the Concise Guide tab so they stay visually/behaviourally in sync automatically.
// The nav is deliberately NOT inside <Paper>: it's navigation chrome, not study content that's
// meant to look like a printed page, so it follows the app's normal (theme-aware) styling. On md+
// it's a genuinely independent-scrolling pane via ResizablePanelGroup (plain CSS `sticky` doesn't
// reliably hold here — Base UI's Tabs.Panel wraps content in an animated, transformed element,
// which changes what a `position: sticky` descendant sticks relative to; bounded-height resizable
// panes sidestep that entirely, and the user can drag to resize besides).
function SectionListDetail({
  sections,
  activeId,
  onSelect,
  renderDetail,
}: {
  sections: Section[];
  activeId: string | undefined;
  onSelect: (id: string) => void;
  renderDetail: (section: Section) => React.ReactNode;
}) {
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  const navItems = (
    <ul className="flex gap-1.5 overflow-x-auto p-3 md:flex-col md:overflow-visible">
      {sections.map((s) => (
        <li key={s.id} className="shrink-0 md:shrink">
          <button
            type="button"
            onClick={() => onSelect(s.id)}
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

  const detail = active && renderDetail(active);

  return (
    <>
      {/* Mobile: a plain stacked layout — dragging a resize handle doesn't translate to touch,
          so this stays the simple pill-row-then-content flow the rest of the app uses below md. */}
      <div className="md:hidden">
        <nav className="border-b">{navItems}</nav>
        <Paper>{detail}</Paper>
      </div>

      {/* Desktop: resizable, independently-scrolling nav + detail panes. Height is pinned to the
          measured consolidated header height (49px — a single row now that the tab list lives in
          the title row via #topic-tabs-anchor, not the old two-row header; see app/layout.tsx and
          CLAUDE.md "Consolidated sticky header"), not an arbitrary vh guess, so the panel fills
          the actual available viewport with no leftover gap at the bottom. Can't use h-full here:
          topic-view.tsx's whole ancestor chain is deliberately unbounded/flowing (see "Layout
          height must be bounded"), so there's no bounded parent for h-full to resolve against
          without reintroducing that chain for every sibling tab too. */}
      <div className="hidden md:block md:h-[calc(100vh-49px)]">
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

function NotesTabView({ guide, onCite }: { guide: StudyGuide; onCite: Cite }) {
  const sections = guide.sections.filter((s) => s.blocks.some((b) => b.type === "paragraph"));
  const [activeId, setActiveId] = useState(sections[0]?.id);

  return (
    <SectionListDetail
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
      renderDetail={(section) => {
        const paragraphs = section.blocks.filter((b): b is ParagraphBlock => b.type === "paragraph");
        return (
          <>
            <h2 className="font-serif text-lg font-bold text-[#1B3A5C] md:text-2xl">{section.title}</h2>
            <ul className="mt-4 space-y-4">
              {paragraphs.map((b, i) => (
                <ParagraphBlockView key={i} block={b} onCite={onCite} />
              ))}
            </ul>
          </>
        );
      }}
    />
  );
}

// Deliberately NOT a boxed card — a numbered marker plus slightly heavier text weight is enough
// to read as "distinct fact to memorize" without every single bullet becoming its own bordered
// box; a whole list of individually-boxed one-liners was busier than the "quick to read" goal
// this tab exists for. `bullet.text` is a compression of (never independent of) the exact block
// `bullet.source` points at — see lib/types.ts's `ConciseBullet` and CLAUDE.md.
function ConciseBulletView({ bullet, index, onCite }: { bullet: ConciseBullet; index: number; onCite: Cite }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#1B3A5C] text-[11px] font-bold text-white">
        {index + 1}
      </span>
      <p className="flex-1 text-[16px] font-medium leading-7 text-[#101826] md:text-[17px] md:leading-8">
        <RichText text={bullet.text} />{" "}
        <CitationBadge source={bullet.source} onClick={onCite} className="align-middle" />
      </p>
    </li>
  );
}

// A compact label/value list for facts that are naturally "metric -> number" rather than a
// sentence (a prevalence rate, an NNT) — a tighter scan pattern than a numbered sentence for
// facts that are just a number to memorize. Not a bordered table: just a label/value row with a
// hairline divider between rows, since a full table header/footer would be heavier chrome than
// this content needs. See ConciseFact in lib/types.ts for why this is a distinct authored shape
// rather than something auto-detected from bullet text.
function ConciseFactList({ facts, onCite }: { facts: ConciseFact[]; onCite: Cite }) {
  return (
    <dl className="divide-y divide-[#E4E1D9] rounded-md border border-[#E4E1D9]">
      {facts.map((fact, i) => (
        <div key={i} className="flex items-baseline justify-between gap-4 px-3 py-2">
          <dt className="text-[15px] text-[#5B6472]">{fact.label}</dt>
          <dd className="flex items-baseline gap-1.5 text-right text-[16px] font-semibold text-[#1B3A5C]">
            <RichText text={fact.value} />
            <CitationBadge source={fact.source} onClick={onCite} className="align-middle" />
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Exam-focused compression of the Full Guide, one section at a time — same left-panel/detail
// pattern as Notes (the user asked for this explicitly: "build the concise tab topic wise similar
// to how we have designed the notes"). Bullets are compressed exam-critical facts (see
// ConciseBulletView); `highlightBlockIndices` resurfaces this section's own already-concise
// tables/mnemonics/traps verbatim via the shared BlockView dispatcher, rather than duplicating
// them as prose — same objects the Full Guide renders, so this can't drift out of alignment with
// it. Sections without a `concise` entry yet are simply not listed (rolling out topic by topic,
// not all-or-nothing); if a topic has none at all, show a heads-up instead of an empty panel.
function ConciseTabView({ guide, onCite }: { guide: StudyGuide; onCite: Cite }) {
  const sections = guide.sections.filter((s) => s.concise);
  const [activeId, setActiveId] = useState(sections[0]?.id);

  if (sections.length === 0) {
    return (
      <Paper>
        <p className="text-center text-muted-foreground">
          Concise guide not yet available for this topic.
        </p>
      </Paper>
    );
  }

  return (
    <SectionListDetail
      sections={sections}
      activeId={activeId}
      onSelect={setActiveId}
      renderDetail={(section) => {
        const concise = section.concise!;
        return (
          <>
            <h2 className="font-serif text-lg font-bold text-[#1B3A5C] md:text-2xl">{section.title}</h2>
            {(concise.facts ?? []).length > 0 && (
              <div className="mt-4">
                <ConciseFactList facts={concise.facts!} onCite={onCite} />
              </div>
            )}
            {concise.bullets.length > 0 && (
              <ul className="mt-4 space-y-3.5">
                {concise.bullets.map((b, i) => (
                  <ConciseBulletView key={i} bullet={b} index={i} onCite={onCite} />
                ))}
              </ul>
            )}
            {(concise.highlightBlockIndices ?? []).length > 0 && (
              <div className="mt-6 space-y-6">
                {concise.highlightBlockIndices!.map((idx) => (
                  <BlockView key={idx} block={section.blocks[idx]} onCite={onCite} />
                ))}
              </div>
            )}
          </>
        );
      }}
    />
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
    case "image":
      return <ImageBlockView block={block} onCite={onCite} />;
    case "gap":
      return <GapBlockView block={block} onCite={onCite} />;
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

// Icon-only tab, matching the drawer-toggle icon's own pattern (topic-view.tsx): the label (and
// count, where relevant) shows in a Tooltip on hover instead of always-visible text, so the
// header row's tab list reads as a compact row of icons rather than 8 spelled-out labels. The
// icon is still the same accessible <TabsTrigger> (aria-label carries the name for screen readers
// and for Playwright's role-based selectors), just with no visible text child.
function IconTabTrigger({
  value,
  icon,
  label,
  disabled,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <TabsTrigger value={value} disabled={disabled} aria-label={label}>
            {icon}
          </TabsTrigger>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

const TAB_VALUES = ["full", "concise", "notes", "tables", "mnemonics", "traps", "gaps", "quiz"] as const;

const TAB_LABELS: Record<(typeof TAB_VALUES)[number], string> = {
  full: "Full Guide",
  concise: "Concise Guide",
  notes: "Notes",
  tables: "Tables",
  mnemonics: "Mnemonics",
  traps: "Traps",
  gaps: "Gaps",
  quiz: "Quiz",
};

// Restricts a StudyGuide down to only the sections/blocks a given tab actually renders, so the
// downloaded JSON matches what's on screen instead of always being the whole guide. Every tab
// besides "full"/"quiz" is just a block-type filter over the same `guide` object every tab
// already renders from (see NotesTabView/ConciseTabView above) — there's no separate per-tab data
// source to keep in sync.
function blocksByType(guide: StudyGuide, ...types: Block["type"][]) {
  return {
    topic: guide.topic,
    sections: guide.sections
      .map((s) => ({ id: s.id, title: s.title, blocks: s.blocks.filter((b) => types.includes(b.type)) }))
      .filter((s) => s.blocks.length > 0),
  };
}

function buildTabExport(tab: string, guide: StudyGuide, questions: Question[]): unknown {
  switch (tab) {
    case "full":
      return guide;
    case "concise":
      return {
        topic: guide.topic,
        sections: guide.sections
          .filter((s) => s.concise)
          .map((s) => ({ id: s.id, title: s.title, concise: s.concise })),
      };
    case "notes":
      return blocksByType(guide, "paragraph");
    case "tables":
      return blocksByType(guide, "table", "comparison");
    case "mnemonics":
      return blocksByType(guide, "mnemonic");
    case "traps":
      return blocksByType(guide, "trap", "trap-list");
    case "gaps":
      return blocksByType(guide, "gap");
    case "quiz":
      return questions;
    default:
      return guide;
  }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function DownloadTabButton({
  tab,
  guide,
  questions,
  topicId,
}: {
  tab: string;
  guide: StudyGuide;
  questions: Question[];
  topicId: string;
}) {
  const label = TAB_LABELS[tab as (typeof TAB_VALUES)[number]] ?? "Full Guide";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            aria-label={`Download ${label} JSON`}
            data-testid="download-tab-json"
            onClick={() => downloadJson(`${topicId}-${tab}.json`, buildTabExport(tab, guide, questions))}
          >
            <Download />
          </Button>
        }
      />
      <TooltipContent>Download {label} JSON</TooltipContent>
    </Tooltip>
  );
}

// The "chart tabs" bottom bar — mobile's replacement for the icon tab row that lives in the
// header on md+ (see topic-view.tsx's `#topic-tabs-anchor`, hidden below md). Styled after a
// patient chart's colored index-tab dividers: a color flag along the top edge of each tab,
// matching the accent that section already carries elsewhere (chart-navy/clinical-teal/amber).
// Rendered as a SIBLING of <Tabs> in StudyGuideView's return, never inside a TabsContent — Base
// UI's Tabs.Panel wraps its content in an animated/transformed element, which breaks
// position:fixed/sticky descendants the same way it broke a plain sticky nav once before (see
// the Notes-tab history above). `color` is genuinely per-instance, not expressible as a static
// Tailwind class, hence the inline style here rather than a class name.
function ChartTab({
  active,
  color,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  color: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active}
      className="relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground"
      style={{ color: active ? color : undefined }}
    >
      <span
        className="absolute inset-x-3 top-0 h-1 rounded-b-full"
        style={{ backgroundColor: color, opacity: active ? 1 : 0 }}
      />
      {icon}
      {label}
    </button>
  );
}

function BottomTabBar({
  tab,
  onSelect,
  hasQuiz,
  moreActive,
  onMore,
}: {
  tab: string;
  onSelect: (v: string) => void;
  hasQuiz: boolean;
  moreActive: boolean;
  onMore: () => void;
}) {
  return (
    <nav
      aria-label="Study guide sections"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-[#E4E1D9] bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ChartTab
        active={tab === "full"}
        color="#1B3A5C"
        icon={<BookOpenText className="size-5" />}
        label="Full Guide"
        onClick={() => onSelect("full")}
      />
      <ChartTab
        active={tab === "concise"}
        color="#1F7A6C"
        icon={<ListChecks className="size-5" />}
        label="Concise"
        onClick={() => onSelect("concise")}
      />
      {hasQuiz && (
        <ChartTab
          active={tab === "quiz"}
          color="#F2A93B"
          icon={<GraduationCap className="size-5" />}
          label="Quiz"
          onClick={() => onSelect("quiz")}
        />
      )}
      <ChartTab
        active={moreActive}
        color="#5B6472"
        icon={<MoreHorizontal className="size-5" />}
        label="More"
        onClick={onMore}
      />
    </nav>
  );
}

function MoreRow({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium",
        active ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted"
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  );
}

// Mobile's home for everything that doesn't fit the 4-slot bottom bar: the remaining tabs
// (Notes/Tables/Mnemonics/Traps/Gaps), the download-this-tab action, and — only on Full Guide —
// a clickable section list. That last one intentionally isn't the same `<select>` the desktop
// header uses (see the header portal above): once there's a full-height sheet with room for a
// real list, a row of buttons matching this sheet's own list style reads more consistently than
// nesting a native dropdown inside it. The desktop `<select>` stays as-is — it already works and
// only ever renders at md+.
function MoreSheet({
  open,
  onOpenChange,
  guide,
  tab,
  onSelectTab,
  counts,
  onDownload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guide: StudyGuide;
  tab: string;
  onSelectTab: (v: string) => void;
  counts: { tableCount: number; mnemonicCount: number; trapCount: number; gapCount: number };
  onDownload: () => void;
}) {
  function selectAndClose(v: string) {
    onSelectTab(v);
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] gap-0 overflow-y-auto rounded-t-2xl">
        <SheetTitle className="px-4 pt-4 font-serif text-base">More views</SheetTitle>
        <div className="flex flex-col gap-0.5 p-2">
          <MoreRow
            icon={<NotebookText className="size-4" />}
            label="Notes"
            active={tab === "notes"}
            onClick={() => selectAndClose("notes")}
          />
          <MoreRow
            icon={<Table2 className="size-4" />}
            label={`Tables (${counts.tableCount})`}
            active={tab === "tables"}
            onClick={() => selectAndClose("tables")}
          />
          <MoreRow
            icon={<Lightbulb className="size-4" />}
            label={`Mnemonics (${counts.mnemonicCount})`}
            active={tab === "mnemonics"}
            onClick={() => selectAndClose("mnemonics")}
          />
          <MoreRow
            icon={<AlertTriangle className="size-4" />}
            label={`Traps (${counts.trapCount})`}
            active={tab === "traps"}
            onClick={() => selectAndClose("traps")}
          />
          <MoreRow
            icon={<HelpCircle className="size-4" />}
            label={`Gaps (${counts.gapCount})`}
            active={tab === "gaps"}
            onClick={() => selectAndClose("gaps")}
          />
        </div>

        {tab === "full" && guide.sections.length > 0 && (
          <>
            <p className="border-t px-4 py-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Jump to section
            </p>
            <div className="flex flex-col gap-0.5 px-2 pb-2" data-testid="jump-section-list">
              {guide.sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    onOpenChange(false);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="border-t p-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onDownload();
              onOpenChange(false);
            }}
          >
            <Download className="size-4" />
            Download {TAB_LABELS[tab as (typeof TAB_VALUES)[number]] ?? "Full Guide"} JSON
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StudyGuideView({
  guide,
  onCite,
  questions,
  topicId,
  topicTitle,
}: {
  guide: StudyGuide;
  onCite: (source: Source) => void;
  questions: Question[];
  topicId: string;
  topicTitle: string;
}) {
  const tableCount = countBlocks(guide, "table", "comparison");
  const mnemonicCount = countBlocks(guide, "mnemonic");
  const trapCount = countBlocks(guide, "trap", "trap-list");
  const gapCount = countBlocks(guide, "gap");

  // This tab list renders into `#topic-tabs-anchor`, a div topic-view.tsx puts in its own header
  // portal right between the page title and the source-drawer toggle icon, not inline here — see
  // CLAUDE.md "Consolidated sticky header". The <Tabs> root itself stays right here so its
  // context still wraps both the portaled list and the TabsContent panels below.
  const tabsAnchorSlot = usePortalSlot("topic-tabs-anchor");

  // ?tab= so refreshing, deep-linking, or sharing a link on any tab (Quiz included) lands back
  // on that same tab instead of always resetting to Full Guide — see hooks/use-tab-param.ts.
  const validTabs = TAB_VALUES.filter((v) => v !== "quiz" || questions.length > 0);
  const [tab, setTab] = useTabParam(validTabs, "full");
  const [moreOpen, setMoreOpen] = useState(false);

  // The bottom bar's own tabs (full/concise/quiz) — everything else (notes/tables/mnemonics/
  // traps/gaps) lives behind "More" and counts as that tab being "active" for the bar's own
  // highlight state.
  const moreTabs = ["notes", "tables", "mnemonics", "traps", "gaps"];

  return (
    <>
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      {tabsAnchorSlot &&
        createPortal(
          <>
            {/* Full Guide is one long continuous scroll of every section — the only tab without
                its own per-section nav (Notes/Concise already have SectionListDetail's left-panel
                list). A native <select> lives in the sticky header rather than inside the
                TabsContent panel: Base UI's Tabs.Panel wraps content in an animated/transformed
                element, which already broke a plain `sticky` nav once before (see the Notes-tab
                history above) — putting the jump control in the header sidesteps that bug
                entirely, since the header is a real, always-sticky element outside any tab panel.
                A native select (not a custom dropdown) needs no new component, opens the OS's own
                picker on mobile, and there's no shadcn Select/DropdownMenu in this project yet to
                reach for instead. */}
            {tab === "full" && (
              <select
                aria-label="Jump to section"
                defaultValue=""
                onChange={(e) => {
                  document.getElementById(e.target.value)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="h-7 max-w-24 shrink truncate rounded-md border bg-background px-1.5 text-xs sm:max-w-40"
              >
                <option value="" disabled>
                  Jump to section…
                </option>
                {guide.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            )}
            <DownloadTabButton tab={tab} guide={guide} questions={questions} topicId={topicId} />
            <TabsList className="mx-0 overflow-x-auto">
              <IconTabTrigger value="full" icon={<BookOpenText className="size-4" />} label="Full Guide" />
              <IconTabTrigger value="concise" icon={<ListChecks className="size-4" />} label="Concise Guide" />
              <IconTabTrigger value="notes" icon={<NotebookText className="size-4" />} label="Notes" />
              <IconTabTrigger value="tables" icon={<Table2 className="size-4" />} label={`Tables (${tableCount})`} />
              <IconTabTrigger
                value="mnemonics"
                icon={<Lightbulb className="size-4" />}
                label={`Mnemonics (${mnemonicCount})`}
              />
              <IconTabTrigger value="traps" icon={<AlertTriangle className="size-4" />} label={`Traps (${trapCount})`} />
              <IconTabTrigger value="gaps" icon={<HelpCircle className="size-4" />} label={`Gaps (${gapCount})`} />
              <IconTabTrigger
                value="quiz"
                icon={<GraduationCap className="size-4" />}
                label={`Quiz (${questions.length})`}
                disabled={questions.length === 0}
              />
            </TabsList>
          </>,
          tabsAnchorSlot
        )}

      <TabsContent value="full">
        <Paper>
          <div className="space-y-10">
            {guide.sections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-16">
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

      <TabsContent value="concise">
        <ConciseTabView guide={guide} onCite={onCite} />
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
                    <p className="text-xs font-bold tracking-wide text-[#5B6472] uppercase">
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
                .map((block, i) => <GapBlockView key={`${section.id}-${i}`} block={block} onCite={onCite} />)
            )}
          </div>
        </Paper>
      </TabsContent>

      <TabsContent value="quiz">
        {questions.length > 0 && (
          <QuizView topicId={topicId} topicTitle={topicTitle} questions={questions} />
        )}
      </TabsContent>
    </Tabs>

    <BottomTabBar
      tab={tab}
      onSelect={setTab}
      hasQuiz={questions.length > 0}
      moreActive={moreTabs.includes(tab)}
      onMore={() => setMoreOpen(true)}
    />
    <MoreSheet
      open={moreOpen}
      onOpenChange={setMoreOpen}
      guide={guide}
      tab={tab}
      onSelectTab={setTab}
      counts={{ tableCount, mnemonicCount, trapCount, gapCount }}
      onDownload={() => downloadJson(`${topicId}-${tab}.json`, buildTabExport(tab, guide, questions))}
    />
    </>
  );
}
