"use client";

import { Highlighter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useHighlights } from "@/lib/highlight-context";
import { HIGHLIGHT_COLORS } from "@/lib/highlight-colors";

/** Global floating control for the text-highlighter, present on every signed-in page (mounted
 * once in app/layout.tsx, inside HighlightProvider) rather than per-page chrome — it needs to
 * work "throughout the application" wherever RichText renders content, not just on one tab. Sits
 * above normal content but below the sticky header (z-[60]) and any open Sheet drawer (z-50), so
 * it never blocks the PDF drawer's own controls. */
export function HighlighterToolbar() {
  const { user } = useAuth();
  const { mode, setMode, color, setColor } = useHighlights();

  if (!user) return null;

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-2">
      {mode && (
        <div className="flex items-center gap-1.5 rounded-full border bg-background/95 p-1.5 shadow-lg backdrop-blur">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.bg}
              type="button"
              aria-label={`Use ${c.name} highlighter`}
              onClick={() => setColor(c.bg)}
              className={cn(
                "size-6 shrink-0 rounded-full border-2 transition-transform",
                color === c.bg ? "scale-110 border-foreground" : "border-transparent"
              )}
              style={{ backgroundColor: c.bg }}
            />
          ))}
        </div>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              onClick={() => setMode(!mode)}
              data-testid="highlighter-toggle"
              className={cn(
                "size-11 rounded-full shadow-lg",
                mode ? "bg-foreground text-background hover:bg-foreground/90" : undefined
              )}
            >
              {mode ? <X /> : <Highlighter />}
            </Button>
          }
        />
        <TooltipContent side="left">{mode ? "Stop highlighting" : "Highlight text"}</TooltipContent>
      </Tooltip>
    </div>
  );
}
