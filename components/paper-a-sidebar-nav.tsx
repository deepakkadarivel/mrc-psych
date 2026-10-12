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

export interface PaperAAreaGroup {
  label: string;
  topics: TopicManifestEntry[];
}

/** Paper A topics grouped by the source folders' own areas, with the same filter box as Paper B. */
export function PaperASidebarNav({ areas }: { areas: PaperAAreaGroup[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = areas
    .map((a) => ({ ...a, topics: q ? a.topics.filter((t) => t.title.toLowerCase().includes(q)) : a.topics }))
    .filter((a) => a.topics.length > 0);

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
      {filtered.map((area) => (
        <SidebarGroup key={area.label}>
          <SidebarGroupLabel>{area.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {area.topics.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton render={<Link href={`/paper-a/topics/${topic.id}`} />}>{topic.title}</SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
      {q.length > 0 && filtered.length === 0 && (
        <p className="px-4 py-2 text-xs text-muted-foreground">No topics match &quot;{query}&quot;.</p>
      )}
    </>
  );
}
