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
              <div className="sticky top-0 z-10 flex shrink-0 items-center gap-2 border-b bg-background p-2">
                <SidebarTrigger />
              </div>
              <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
          </SidebarProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
