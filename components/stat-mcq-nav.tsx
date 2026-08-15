"use client";

import Link from "next/link";
import { ChevronDownIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { StatMcqTopic } from "@/lib/content";

export function StatMcqNav({ topics }: { topics: StatMcqTopic[] }) {
  return (
    <SidebarMenu>
      <Collapsible defaultOpen={false}>
        <SidebarMenuItem>
          <CollapsibleTrigger render={<SidebarMenuButton className="group/stat-mcq-trigger" />}>
            {`Topics (${topics.length})`}
            <ChevronDownIcon className="ml-auto size-4 shrink-0 transition-transform group-data-[panel-open]/stat-mcq-trigger:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton render={<Link href="/quiz/stat-mcq" />}>
                  All topics
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              {topics.map((t) => (
                <SidebarMenuSubItem key={t.slug}>
                  <SidebarMenuSubButton render={<Link href={`/quiz/stat-mcq/${t.slug}`} />}>
                    {t.title}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  );
}
