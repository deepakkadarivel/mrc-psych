import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { StatMcqNav } from "@/components/stat-mcq-nav";
import { TopicSidebarSearch } from "@/components/topic-sidebar-search";
import { getManifest, getStatMcqTopics } from "@/lib/content";

export function AppSidebar() {
  const manifest = getManifest();
  const clinical = manifest.topics.filter((t) => t.area === "clinical");
  const researchAndStats = manifest.topics.filter((t) => t.area === "research-and-stats");
  const statMcqTopics = getStatMcqTopics();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="px-2 py-1.5 font-serif text-base font-semibold text-sidebar-primary">
          MRCPsych Paper B
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <TopicSidebarSearch clinical={clinical} researchAndStats={researchAndStats} />
        <SidebarGroup>
          <SidebarGroupLabel>Exam Trends</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/exam-trends" />}>
                  Exam Trend Analysis
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Stats MCQ</SidebarGroupLabel>
          <SidebarGroupContent>
            <StatMcqNav topics={statMcqTopics} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Practice</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/quiz/mock" />}>
                  Mock exams
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/recalls" />}>
                  Past paper recalls
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/tracker" />}>
                  Performance tracker
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>References</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/references" />}>
                  Video links
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
