import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MRCPsych Paper B",
  description: "Revision, quizzes, and tracker for MRCPsych Paper B, built from SPMM source material.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <TooltipProvider>
          <SidebarProvider className="h-full">
            <AppSidebar />
            <main className="flex h-full flex-1 min-w-0 flex-col overflow-hidden">
              {/* Page-specific header content (title, action buttons, tab lists) is portaled in
                  here by client components like `topic-view.tsx`/`study-guide-view.tsx` — see
                  CLAUDE.md "Consolidated sticky header". These slot divs render empty (zero
                  visual footprint, no padding of their own) on pages that don't portal into
                  them. */}
              <div className="sticky top-0 z-20 flex shrink-0 flex-col bg-background">
                <div className="flex items-center gap-2 border-b p-2">
                  <SidebarTrigger />
                  <div id="page-header-slot" className="flex min-w-0 flex-1 items-center justify-between gap-2" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div id="page-header-tabs-left" className="flex min-w-0 items-center gap-2" />
                  <div id="page-header-tabs-right" className="flex min-w-0 items-center gap-2 overflow-x-auto" />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
