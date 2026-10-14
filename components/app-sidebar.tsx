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
import { AuthStatus } from "@/components/auth-status";
import { type PaperAAreaGroup, PaperASidebarNav } from "@/components/paper-a-sidebar-nav";
import { PaperSidebarBody, PaperSwitcher } from "@/components/paper-switch";
import { getManifest, getStatMcqTopics } from "@/lib/content";
import { getPaperAManifest } from "@/lib/content-paper-a";
import { AREAS } from "@/lib/paper-a-areas";

export function AppSidebar() {
  const manifest = getManifest();
  const clinical = manifest.topics.filter((t) => t.area === "clinical");
  const researchAndStats = manifest.topics.filter((t) => t.area === "research-and-stats");
  const statMcqTopics = getStatMcqTopics();

  const paperA = getPaperAManifest();
  const areaGroups: PaperAAreaGroup[] = Object.entries(AREAS).map(([id, label]) => ({
    label,
    topics: paperA.topics.filter((t) => t.area === id),
  }));

  const paperBBody = (
    <>
      <TopicSidebarSearch clinical={clinical} researchAndStats={researchAndStats} />
      <SidebarGroup>
        <SidebarGroupLabel>Exam Trends</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/exam-trends" />}>Exam Trend Analysis</SidebarMenuButton>
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
              <SidebarMenuButton render={<Link href="/quiz/mock" />}>Mock exams</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/recalls" />}>Past paper recalls</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/tracker" />}>Performance tracker</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      <SidebarGroup>
        <SidebarGroupLabel>References</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/references" />}>Video links</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );

  const paperABody = (
    <>
      <PaperASidebarNav areas={areaGroups} />
      <SidebarGroup>
        <SidebarGroupLabel>Practice</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/paper-a/quiz" />}>Quizzes &amp; question sets</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/paper-a/fresh" />}>Fresh questions</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/paper-a/mock" />}>Mock exams</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/paper-a/exam-trends" />}>Exam trends</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/paper-a/recalls" />}>Recalls</SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link href="/tracker" />}>Performance tracker</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <PaperSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <PaperSidebarBody paperA={paperABody} paperB={paperBBody} />
      </SidebarContent>
      <AuthStatus />
    </Sidebar>
  );
}
