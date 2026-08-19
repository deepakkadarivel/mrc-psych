"use client";

import { useState } from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { TopicManifestEntry } from "@/lib/types";

// The manifest is read from disk at build time in the server-component parent (AppSidebar) — a
// static-export app can't call fs from a "use client" component (works during the SSR-like build
// pass, breaks on client-side hydration where fs doesn't exist). This component just receives the
// already-fetched topic lists and owns the interactive filtering — a real mobile win since
// scrolling ~18 topic names in a phone-width drawer is slow, for the cost of one native input.
function TopicGroup({ label, topics }: { label: string; topics: TopicManifestEntry[] }) {
  if (topics.length === 0) return null;
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {topics.map((topic) => (
            <SidebarMenuItem key={topic.id}>
              <SidebarMenuButton render={<Link href={`/topics/${topic.id}`} />}>{topic.title}</SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function TopicSidebarSearch({
  clinical,
  researchAndStats,
}: {
  clinical: TopicManifestEntry[];
  researchAndStats: TopicManifestEntry[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filteredClinical = q ? clinical.filter((t) => t.title.toLowerCase().includes(q)) : clinical;
  const filteredResearch = q ? researchAndStats.filter((t) => t.title.toLowerCase().includes(q)) : researchAndStats;
  const noResults = q.length > 0 && filteredClinical.length === 0 && filteredResearch.length === 0;

  return (
    <>
      <div className="relative px-2 pb-1">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-4.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter topics…"
          aria-label="Filter topics"
          className="h-8 pl-7 text-sm"
        />
      </div>
      <TopicGroup label="Clinical topics" topics={filteredClinical} />
      <TopicGroup label="Research & statistics" topics={filteredResearch} />
      {noResults && <p className="px-4 py-2 text-xs text-muted-foreground">No topics match &quot;{query}&quot;.</p>}
    </>
  );
}
