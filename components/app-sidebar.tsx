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
import { getManifest, getStatMcqTopics } from "@/lib/content";

export function AppSidebar() {
  const manifest = getManifest();
  const clinical = manifest.topics.filter((t) => t.area === "clinical");
  const researchAndStats = manifest.topics.filter((t) => t.area === "research-and-stats");
  const statMcqTopics = getStatMcqTopics();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="px-2 py-1.5 text-sm font-semibold">
          MRCPsych Paper B
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Clinical topics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clinical.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton render={<Link href={`/topics/${topic.id}`} />}>
                    {topic.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Research &amp; statistics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {researchAndStats.map((topic) => (
                <SidebarMenuItem key={topic.id}>
                  <SidebarMenuButton render={<Link href={`/topics/${topic.id}`} />}>
                    {topic.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
