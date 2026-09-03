"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CitationBadge } from "@/components/citation-badge";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/utils";
import type { MindMapNode, Source, StudyGuide } from "@/lib/types";

type Cite = (source: Source) => void;

// Purely a rotating visual accent so adjacent top-level branches read as distinct at a glance in
// a long scrolling outline — this is NOT the same thing as TableBlock's `category.color`, which
// encodes a claim ("this fact belongs to this group") the source text must actually state. Here
// the color assignment carries no meaning beyond "branch #3 vs branch #4", so cycling through a
// fixed palette by index needs no source grounding. Set as a CSS custom property on each
// top-level <li> (see `--tree-accent` below) rather than threaded through as a React prop —
// custom properties cascade to every descendant DOM node regardless of component boundaries, so
// nested groups/lines under a branch pick up its color for free.
const BRANCH_ACCENTS = [
  "#2E6FA8", // blue
  "#1F7A6C", // teal
  "#C9600A", // orange
  "#7D3C98", // purple
  "#B71C1C", // red
  "#5B6472", // gray
];

// The connecting vertical line lives on the <ul> (child-list) element, not on each <li> — a
// <ul>'s rendered height is exactly the sum of its <li> children, so the trunk naturally starts
// at the top of the first child and ends at the bottom of the last with no "stop the line before
// the last child" height math needed (the classic bug with putting the line on every <li>
// instead). Each <li> only draws its own short horizontal branch line reaching from that trunk
// to its own content, independent of whether it's first, middle, or last.
// Colors are given directly as `var(--tree-accent,#D8D3C7)` rather than combined with a Tailwind
// opacity modifier (e.g. `/60`) — Tailwind can't decompose a `var()` expression's channels at
// build time, so an opacity modifier on top of it isn't guaranteed to compile the way a plain hex
// arbitrary value would. `#D8D3C7` (this app's parchment-adjacent border tone) is already a muted
// fallback, and the six BRANCH_ACCENTS are muted-enough tones on their own not to need dimming.
const TREE_UL_CLASS = "ml-2 space-y-0.5 border-l border-[var(--tree-accent,#D8D3C7)] pl-4";
const TREE_LI_CLASS =
  "relative py-0.5 before:absolute before:left-[-1rem] before:top-3 before:h-0 before:w-4 before:border-t before:border-[var(--tree-accent,#D8D3C7)] before:content-['']";

// A single global on/off switch, not per-topic — the user wants "hide references" to stick the
// same way across every topic's Mind Map, not be re-toggled per topic. Plain localStorage (no
// Supabase) is deliberate: this is a per-browser display preference, not user data worth syncing
// across devices, unlike quiz progress/tracker entries.
const HIDE_REFERENCES_KEY = "mrcpsych-mindmap-hide-references";

function loadHideReferences(): boolean {
  try {
    return localStorage.getItem(HIDE_REFERENCES_KEY) === "1";
  } catch {
    return false;
  }
}

function saveHideReferences(hidden: boolean) {
  try {
    if (hidden) localStorage.setItem(HIDE_REFERENCES_KEY, "1");
    else localStorage.removeItem(HIDE_REFERENCES_KEY);
  } catch {
    // localStorage can throw (private browsing, disabled site data) — the toggle still works for
    // the current page load, it just won't survive a refresh.
  }
}

function childPath(parentPath: string, index: number) {
  return `${parentPath}.${index}`;
}

function collectPaths(nodes: MindMapNode[], parentPath: string, acc: string[]) {
  nodes.forEach((n, i) => {
    const path = childPath(parentPath, i);
    if (n.children?.length) {
      acc.push(path);
      collectPaths(n.children, path, acc);
    }
  });
}

// One row of the tree, used uniformly at every depth (including the 26-ish top-level branches) —
// a single recursive component rather than a separate "branch card" wrapper, since a genuine
// connector-line tree (as opposed to the earlier card-grid layout) has no visual seam between a
// top-level branch and a nested group. Every leaf still goes through the same CitationBadge ->
// onCite jump-to-PDF interaction as every other block type in this app, which a rendered diagram
// (Mermaid, a positioned-node canvas) can't offer without bespoke per-node hit-testing.
function MindMapTreeNode({
  node,
  path,
  openPaths,
  onToggle,
  onCite,
  hideReferences,
  style,
}: {
  node: MindMapNode;
  path: string;
  openPaths: Set<string>;
  onToggle: (path: string) => void;
  onCite: Cite;
  hideReferences: boolean;
  style?: React.CSSProperties;
}) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isOpen = openPaths.has(path);

  if (!hasChildren) {
    return (
      <li className={TREE_LI_CLASS} style={style}>
        <span className="text-[14px] leading-6 text-[#101826] md:text-[15px]">
          <RichText text={node.label} />
          {node.source && !hideReferences && (
            <>
              {" "}
              <CitationBadge source={node.source} onClick={onCite} className="align-middle" />
            </>
          )}
        </span>
      </li>
    );
  }

  return (
    <li className={TREE_LI_CLASS} style={style}>
      <button
        type="button"
        onClick={() => onToggle(path)}
        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-[14px] font-semibold text-[var(--tree-accent,#1B3A5C)] hover:bg-black/[0.04] md:text-[15px]"
      >
        {isOpen ? (
          <ChevronDown className="size-3.5 shrink-0" />
        ) : (
          <ChevronRight className="size-3.5 shrink-0" />
        )}
        <RichText text={node.label} />
        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
          {node.children!.length}
        </span>
      </button>
      {isOpen && (
        <ul className={TREE_UL_CLASS}>
          {node.children!.map((child, i) => (
            <MindMapTreeNode
              key={i}
              node={child}
              path={childPath(path, i)}
              openPaths={openPaths}
              onToggle={onToggle}
              onCite={onCite}
              hideReferences={hideReferences}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// One tree per TOPIC (not per section, unlike Notes/Concise) — a mind map is conventionally a
// single overview artifact for a subject, and the user's own phrasing ("mind maps for those
// topics") is plural over topics. Rendered as a single continuous connector-line outline (styled
// after a Mermaid/org-chart tree) rather than the card-grid this tab shipped with initially —
// every branch collapsed by default keeps a 25+-section topic compact on first paint, and
// Expand/Collapse All still work the same as before.
export function MindMapView({
  guide,
  topicTitle,
  onCite,
}: {
  guide: StudyGuide;
  topicTitle: string;
  onCite: Cite;
}) {
  const branches = guide.mindMap ?? [];
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());

  // Read after first paint, not in the useState initializer — this app is statically exported
  // (output: 'export'), so a value read from localStorage during the initial render would mismatch
  // the prerendered HTML (same reasoning as quiz progress in lib/quiz-progress-store.ts).
  const [hideReferences, setHideReferences] = useState(false);
  useEffect(() => {
    setHideReferences(loadHideReferences());
  }, []);

  function toggleHideReferences() {
    setHideReferences((prev) => {
      const next = !prev;
      saveHideReferences(next);
      return next;
    });
  }

  if (branches.length === 0) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-10 text-center text-muted-foreground md:px-10">
        Mind map not yet available for this topic.
      </div>
    );
  }

  function toggle(path: string) {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }

  function expandAll() {
    const acc: string[] = [];
    branches.forEach((b, i) => {
      acc.push(String(i));
      if (b.children?.length) collectPaths(b.children, String(i), acc);
    });
    setOpenPaths(new Set(acc));
  }

  function collapseAll() {
    setOpenPaths(new Set());
  }

  return (
    <div className="mx-auto max-w-[880px] px-4 py-6 md:px-10 md:py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 rounded-full border-2 border-[#1B3A5C] bg-[#EAF0F5] px-5 py-2.5">
          <Network className="size-5 shrink-0 text-[#1B3A5C]" />
          <h2 className="font-serif text-lg font-bold text-[#1B3A5C] md:text-xl">{topicTitle}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll} data-testid="mindmap-expand-all">
            Expand all
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll} data-testid="mindmap-collapse-all">
            Collapse all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleHideReferences}
            data-testid="mindmap-toggle-references"
          >
            {hideReferences ? (
              <>
                <Eye className="size-3.5" /> Show references
              </>
            ) : (
              <>
                <EyeOff className="size-3.5" /> Hide references
              </>
            )}
          </Button>
        </div>
      </div>

      <ul className={cn(TREE_UL_CLASS, "mt-6")} data-testid="mindmap-branches">
        {branches.map((branch, i) => (
          <MindMapTreeNode
            key={i}
            node={branch}
            path={String(i)}
            openPaths={openPaths}
            onToggle={toggle}
            onCite={onCite}
            hideReferences={hideReferences}
            style={{ "--tree-accent": BRANCH_ACCENTS[i % BRANCH_ACCENTS.length] } as React.CSSProperties}
          />
        ))}
      </ul>
    </div>
  );
}
