"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

const LOGIN_PATH = "/login";

/** Route-aware auth gate: /login renders bare (no sidebar/chrome); every other route redirects
 * to /login when signed out instead of showing the app shell behind an inline sign-in prompt.
 *
 * `sidebar` is passed in as already-rendered JSX from the server-component root layout, rather
 * than imported and rendered directly here — AppSidebar (lib/content.ts) reads the corpus JSON
 * off disk via node:fs, which only works in a server component. Importing it straight into this
 * "use client" file would pull that whole server-only module graph into the client bundle
 * (confirmed: Turbopack fails outright with "chunking context does not support external
 * modules (request: node:fs)"), not just bloat it. */
export function AppShell({ children, sidebar }: { children: React.ReactNode; sidebar: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLoginPage = pathname === LOGIN_PATH;

  useEffect(() => {
    if (loading) return;
    if (!user && !isLoginPage) router.replace(LOGIN_PATH);
    if (user && isLoginPage) router.replace("/");
  }, [user, loading, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;
  if (loading || !user) return null;

  return (
    <SidebarProvider className="h-full">
      {sidebar}
      <main className="flex h-full flex-1 min-w-0 flex-col overflow-hidden">
        {/* Page-specific header content (title, tab list, action buttons) is portaled in
            here by client components like `topic-view.tsx` — see CLAUDE.md "Consolidated
            sticky header". A single row: components portal further sub-anchors of their own
            into `page-header-slot` (e.g. topic-view.tsx's `#topic-tabs-anchor`) to place
            content precisely within it. z-[60] (above shadcn Sheet/Dialog's z-50) keeps the
            header — and its drawer-toggle button — clickable above an open right-side PDF
            drawer instead of the drawer's own content intercepting clicks meant for the
            button that opened it. */}
        <div className="sticky top-0 z-[60] flex shrink-0 flex-col bg-background">
          <div className="flex items-center gap-2 border-b p-2">
            <SidebarTrigger />
            <div id="page-header-slot" className="flex min-w-0 flex-1 items-center justify-between gap-2" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </SidebarProvider>
  );
}
