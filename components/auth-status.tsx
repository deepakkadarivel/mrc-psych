"use client";

import { LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarFooter } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth-context";

export function AuthStatus() {
  const { user, loading, signOut } = useAuth();
  if (loading || !user) return null;

  return (
    <SidebarFooter>
      <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-muted-foreground">
        <span className="truncate">{user.email}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => signOut()} aria-label="Sign out">
          <LogOutIcon />
        </Button>
      </div>
    </SidebarFooter>
  );
}
