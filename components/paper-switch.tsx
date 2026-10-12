"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** `/paper-a/...` is Paper A; everything else (including `/`, `/topics/...`) is Paper B. */
export function isPaperAPath(pathname: string | null): boolean {
  return pathname === "/paper-a" || (pathname?.startsWith("/paper-a/") ?? false);
}

/** Sidebar header: the app title plus a Paper B / Paper A switch. Paper B's URLs are unchanged. */
export function PaperSwitcher() {
  const onA = isPaperAPath(usePathname());
  const pill = (active: boolean) =>
    cn(
      "flex-1 rounded-md px-2 py-1 text-center text-sm font-medium transition-colors",
      active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent"
    );
  return (
    <div className="space-y-1.5 px-2 py-1.5">
      <Link href={onA ? "/paper-a" : "/"} className="block font-serif text-base font-semibold text-sidebar-primary">
        MRCPsych {onA ? "Paper A" : "Paper B"}
      </Link>
      <nav aria-label="Paper" className="flex gap-1 rounded-lg bg-sidebar-accent/40 p-0.5">
        <Link href="/" className={pill(!onA)} aria-current={!onA ? "page" : undefined} data-testid="paper-switch-b">
          Paper B
        </Link>
        <Link href="/paper-a" className={pill(onA)} aria-current={onA ? "page" : undefined} data-testid="paper-switch-a">
          Paper A
        </Link>
      </nav>
    </div>
  );
}

/** Both sidebar bodies are rendered server-side (they read the corpus off disk) and passed in as
 *  props; this just picks one by route, so the switch needs no page reload and no fs on the client. */
export function PaperSidebarBody({ paperA, paperB }: { paperA: React.ReactNode; paperB: React.ReactNode }) {
  return <>{isPaperAPath(usePathname()) ? paperA : paperB}</>;
}
