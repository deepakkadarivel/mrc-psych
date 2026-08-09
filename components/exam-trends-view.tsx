"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/utils";
import type {
  ExamTrendsData,
  ExamTrendSection,
  ExamTrendTopicSignal,
  PriorityAnalysis,
  PriorityDomain,
  PriorityFact,
  Source,
} from "@/lib/types";

const PdfViewer = dynamic(() => import("@/components/pdf-viewer").then((m) => m.PdfViewer), {
  ssr: false,
});

// A single nested nav (reusing the app's own sidebar sub-menu primitives — SidebarMenuSub/
// SidebarMenuSubButton — rather than a second side-by-side column) + a detail pane, resizable and
// independently-scrolling on desktop (md:h-[calc(100vh-49px)], 49px = the measured consolidated
// header height, see CLAUDE.md), a plain flowing nav + detail on mobile. Three top-level branches:
// Overview, "Priority & Recall Analysis" (the two user-supplied recall documents' own ~12-domain
// taxonomy), and the 9 official syllabus sections — each of the latter two expands
// (accordion-style, one open at a time) to reveal nested items; picking a branch auto-picks its
// first nested item so the detail pane always has something to show.
export function ExamTrendsView({ data }: { data: ExamTrendsData }) {
  const [activeSectionId, setActiveSectionId] = useState<string>("overview");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);
  const [activeDomainId, setActiveDomainId] = useState<string | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<Source | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);

  const activeSection = data.sections.find((s) => s.id === activeSectionId);
  const activeDomain = data.priorityAnalysis.domains.find((d) => d.id === activeDomainId);

  function handleCite(source: Source) {
    setActiveSource(source);
    setPdfOpen(true);
  }

  function openSection(id: string) {
    setExpandedSectionId(id);
    setActiveSectionId(id);
    const section = data.sections.find((s) => s.id === id);
    setActiveTopicId(section?.topicSignals[0]?.topicId ?? null);
  }

  function toggleSection(id: string) {
    if (expandedSectionId === id) {
      setExpandedSectionId(null);
    } else {
      openSection(id);
    }
  }

  function openPriority() {
    setExpandedSectionId("priority");
    setActiveSectionId("priority");
    setActiveDomainId(data.priorityAnalysis.domains[0]?.id ?? null);
  }

  function togglePriority() {
    if (expandedSectionId === "priority") {
      setExpandedSectionId(null);
    } else {
      openPriority();
    }
  }

  function selectOverview() {
    setExpandedSectionId(null);
    setActiveSectionId("overview");
    setActiveTopicId(null);
  }

  function selectTopic(sectionId: string, topicId: string) {
    setActiveSectionId(sectionId);
    setActiveTopicId(topicId);
  }

  function selectDomain(domainId: string) {
    setActiveSectionId("priority");
    setActiveDomainId(domainId);
  }

  const nav = (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton isActive={activeSectionId === "overview"} onClick={selectOverview}>
          Overview
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton isActive={activeSectionId === "priority"} onClick={togglePriority}>
          <span className="min-w-0 flex-1 truncate">Priority &amp; Recall Analysis</span>
          <ChevronRight
            className={cn("size-4 shrink-0 transition-transform", expandedSectionId === "priority" && "rotate-90")}
          />
        </SidebarMenuButton>
        {expandedSectionId === "priority" && (
          <SidebarMenuSub>
            {data.priorityAnalysis.domains.map((d) => (
              <SidebarMenuSubItem key={d.id}>
                <SidebarMenuSubButton
                  render={<button type="button" />}
                  isActive={activeDomainId === d.id}
                  onClick={() => selectDomain(d.id)}
                  className="w-full"
                >
                  <span className="min-w-0 flex-1 truncate">{d.title}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{d.percentOfPaper}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>

      {data.sections.map((s) => (
        <SidebarMenuItem key={s.id}>
          <SidebarMenuButton isActive={activeSectionId === s.id} onClick={() => toggleSection(s.id)}>
            <span className="min-w-0 flex-1 truncate">
              {s.syllabusNumber}. {s.title}
            </span>
            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{s.weightPercent}%</span>
            <ChevronRight
              className={cn("size-4 shrink-0 transition-transform", expandedSectionId === s.id && "rotate-90")}
            />
          </SidebarMenuButton>
          {expandedSectionId === s.id && (
            <SidebarMenuSub>
              {s.topicSignals.map((signal) => (
                <SidebarMenuSubItem key={signal.topicId}>
                  <SidebarMenuSubButton
                    render={<button type="button" />}
                    isActive={activeTopicId === signal.topicId}
                    onClick={() => selectTopic(s.id, signal.topicId)}
                    className="w-full"
                  >
                    <span className="min-w-0 flex-1 truncate">{signal.topicTitle}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {signal.questionBankCount}
                    </span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  const detail =
    activeSectionId === "overview" ? (
      <OverviewDetail data={data} onSelectSection={openSection} onSelectPriority={openPriority} />
    ) : activeSectionId === "priority" ? (
      <PriorityBranchDetail
        priorityAnalysis={data.priorityAnalysis}
        domain={activeDomain ?? data.priorityAnalysis.domains[0]}
        onCite={handleCite}
      />
    ) : (
      <TopicDetail
        section={activeSection!}
        signal={
          activeSection!.topicSignals.find((t) => t.topicId === activeTopicId) ?? activeSection!.topicSignals[0]
        }
        onCite={handleCite}
      />
    );

  return (
    <>
      <div className="md:hidden">
        <div className="max-h-64 overflow-y-auto border-b">
          <h1 className="px-3 pt-3 text-lg font-semibold">Exam Trend Analysis</h1>
          <nav className="p-2">{nav}</nav>
        </div>
        <div className="p-4">{detail}</div>
      </div>

      <div className="hidden md:block md:h-[calc(100vh-49px)]">
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel defaultSize="27" minSize="20" maxSize="42">
            <div className="h-full overflow-y-auto border-r">
              <h1 className="px-3 pt-3 text-sm font-semibold">Exam Trend Analysis</h1>
              <nav className="p-2">{nav}</nav>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="73" minSize="45">
            <div className="h-full overflow-y-auto p-4">{detail}</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Sheet open={pdfOpen} onOpenChange={setPdfOpen}>
        <SheetContent side="right" className="w-full gap-0 pt-[49px] data-[side=right]:sm:max-w-2xl">
          <SheetTitle className="sr-only">Source</SheetTitle>
          <PdfViewer source={activeSource} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function OverviewDetail({
  data,
  onSelectSection,
  onSelectPriority,
}: {
  data: ExamTrendsData;
  onSelectSection: (id: string) => void;
  onSelectPriority: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Two complementary lenses: the official RCPsych syllabus weighting below (curriculum
          structure), and the &quot;Priority &amp; Recall Analysis&quot; branch in the nav (actual
          recurrence across real past recall papers) — plus this app&apos;s own question-bank
          counts and the recurring examiner traps already flagged in each topic&apos;s study
          guide.
        </p>
      </div>

      <button type="button" onClick={onSelectPriority} className="block w-full text-left">
        <Card className="border-primary/30 bg-primary/5 transition-colors hover:bg-primary/10">
          <CardContent className="space-y-1">
            <CardTitle className="text-base">Priority &amp; Recall Analysis →</CardTitle>
            <p className="text-sm text-muted-foreground">
              Which topics to concentrate on, what keeps repeating, and what to expect —
              extracted from two recall-based analysis documents the user compiled and supplied,
              cited page-by-page.
            </p>
          </CardContent>
        </Card>
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Syllabus weighting — external source</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            The %/marks weighting below comes from the public RCPsych blueprint, not a page in
            this app&apos;s corpus — treat it as context, not cited fact.
          </p>
          <p>
            <a
              href={data.weightSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm underline hover:no-underline"
            >
              {data.weightSource.text} <ExternalLink className="size-3.5" />
            </a>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {data.sections.map((s) => (
          <button key={s.id} type="button" onClick={() => onSelectSection(s.id)} className="block w-full text-left">
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-medium">
                    {s.syllabusNumber}. {s.title}
                  </h3>
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {s.weightPercent}% · {s.weightMarks} marks
                  </span>
                </div>
                <Progress value={s.weightPercent} max={33.5} />
                <p className="text-xs text-muted-foreground">
                  {s.totalQuestionBankCount} question-bank questions across {s.mappedTopics.length}{" "}
                  app topic{s.mappedTopics.length > 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function PriorityFactList({ facts, onCite }: { facts: PriorityFact[]; onCite: (source: Source) => void }) {
  return (
    <ul className="space-y-3 text-sm">
      {facts.map((f, i) => (
        <li key={i}>
          <RichText text={f.text} />{" "}
          <CitationBadge source={f.source} onClick={onCite} className="align-middle" />
        </li>
      ))}
    </ul>
  );
}

// Persistent framing (intro + golden rules) for the whole Priority & Recall Analysis branch,
// with the selected domain's detail below it — so the golden rules stay visible as a reminder
// regardless of which of the 12 domains is currently open.
function PriorityBranchDetail({
  priorityAnalysis,
  domain,
  onCite,
}: {
  priorityAnalysis: PriorityAnalysis;
  domain: PriorityDomain;
  onCite: (source: Source) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Priority &amp; Recall Analysis</h2>
        <p className="mt-2 text-sm text-muted-foreground">{priorityAnalysis.intro}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Golden rules</CardTitle>
        </CardHeader>
        <CardContent>
          <PriorityFactList facts={priorityAnalysis.goldenRules} onCite={onCite} />
        </CardContent>
      </Card>

      <div className="border-t pt-6">
        <PriorityDomainDetail domain={domain} onCite={onCite} />
      </div>
    </div>
  );
}

// Not a Card, same reasoning as TopicDetail — main-content pane of the nav's second drill-down
// branch (Priority & Recall Analysis -> domain -> this).
function PriorityDomainDetail({
  domain,
  onCite,
}: {
  domain: PriorityDomain;
  onCite: (source: Source) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Badge>{domain.tier}</Badge>
          <h2 className="text-xl font-bold">{domain.title}</h2>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>{domain.percentOfPaper} of paper</span>
          <span>·</span>
          <span>{domain.percentRevisionTime} of revision time</span>
          <span>·</span>
          <span>{domain.effortReward}</span>
          {domain.tierSources.map((s, i) => (
            <CitationBadge key={i} source={s} onClick={onCite} />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Repeated facts (flagged as recurring by the source documents)
        </p>
        <div className="mt-2">
          <PriorityFactList facts={domain.repeatedFacts} onCite={onCite} />
        </div>
      </div>

      {domain.expectedNote && (
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Expected going forward</p>
          <p className="mt-2 text-sm">
            <RichText text={domain.expectedNote.text} />{" "}
            <CitationBadge source={domain.expectedNote.source} onClick={onCite} className="align-middle" />
          </p>
        </div>
      )}
    </div>
  );
}

// Deliberately not a Card — this is the main-content pane of a 3-level drill-down (syllabus
// section -> mapped topic -> this), so it reads as page content, not another nested box.
function TopicDetail({
  section,
  signal,
  onCite,
}: {
  section: ExamTrendSection;
  signal: ExamTrendTopicSignal;
  onCite: (source: Source) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          {section.syllabusNumber}. {section.title}
        </p>
        <div className="mt-1 flex items-center gap-3">
          <Badge variant="secondary">
            {section.weightPercent}% · {section.weightMarks} marks
          </Badge>
          <CitationBadge source={section.syllabusSource} onClick={onCite} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">
            <Link href={`/topics/${signal.topicId}`} className="hover:underline">
              {signal.topicTitle}
            </Link>
          </h2>
          <span className="shrink-0 text-sm text-muted-foreground">
            {signal.questionBankCount} questions · {signal.highYieldTableCount} high-yield tables
          </span>
        </div>

        {signal.recurringTraps.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No examiner traps flagged yet in this topic&apos;s study guide.
          </p>
        ) : (
          <>
            <p className="mt-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Recurring examiner traps (from this topic&apos;s own study guide)
            </p>
            <ul className="mt-2 space-y-3 text-sm">
              {signal.recurringTraps.map((trap, i) => (
                <li key={i}>
                  <RichText text={trap.text} />{" "}
                  <CitationBadge source={trap.source} onClick={onCite} className="align-middle" />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
