"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { highlightStore, type Highlight } from "@/lib/highlight-store";
import { DEFAULT_HIGHLIGHT_COLOR } from "@/lib/highlight-colors";

// Scopes an RichText's local `highlightId` (e.g. "sectionId:3" or "question:q12:explanation")
// into a globally-unique anchor ("topic:adult-psychiatry:sectionId:3") without threading a
// topicId/quizId prop through every intermediate block-view component — confirmed necessary
// because Section ids collide across topics (e.g. "coverage-gaps" appears in 12 different study
// guides). Each page-level view (topic-view.tsx, the mock-quiz page, exam-trends page, ...) sets
// this once near its root; RichText reads it via useHighlightScope(). No provider = no scope =
// highlighting silently disabled for that RichText, never a crash.
const HighlightScopeContext = createContext<string | undefined>(undefined);

export function HighlightScopeProvider({ scope, children }: { scope: string; children: React.ReactNode }) {
  return <HighlightScopeContext.Provider value={scope}>{children}</HighlightScopeContext.Provider>;
}

export function useHighlightScope(): string | undefined {
  return useContext(HighlightScopeContext);
}

interface HighlightState {
  ready: boolean;
  mode: boolean;
  setMode: (v: boolean) => void;
  color: string;
  setColor: (v: string) => void;
  getRanges: (anchorId: string) => Highlight[];
  addHighlight: (anchorId: string, start: number, end: number, snippet: string) => void;
  removeHighlight: (anchorId: string, highlightId: string) => void;
}

const HighlightContext = createContext<HighlightState | null>(null);

const COLOR_KEY = "mrcpsych-highlight-color";

export function HighlightProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [byAnchor, setByAnchor] = useState<Map<string, Highlight[]>>(new Map());
  const [ready, setReady] = useState(false);
  const [mode, setModeState] = useState(false);
  const [color, setColorState] = useState(DEFAULT_HIGHLIGHT_COLOR);

  // UI-only preferences (is the highlighter "pen" currently active, which color is loaded) —
  // fine to keep in localStorage rather than Supabase, unlike the highlights themselves: this is
  // per-device tool state, not exam content that needs to follow the user across devices.
  useEffect(() => {
    try {
      const savedColor = localStorage.getItem(COLOR_KEY);
      if (savedColor) setColorState(savedColor);
    } catch {
      // localStorage unavailable (private mode etc.) — fall back to defaults silently.
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setByAnchor(new Map());
      setReady(false);
      return;
    }
    let cancelled = false;
    highlightStore
      .getAll()
      .then((all) => {
        if (cancelled) return;
        const map = new Map<string, Highlight[]>();
        for (const h of all) {
          const list = map.get(h.anchorId) ?? [];
          list.push(h);
          map.set(h.anchorId, list);
        }
        setByAnchor(map);
        setReady(true);
      })
      .catch((err) => {
        console.error("Failed to load highlights", err);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setMode = useCallback((v: boolean) => {
    setModeState(v);
  }, []);

  const setColor = useCallback((v: string) => {
    setColorState(v);
    try {
      localStorage.setItem(COLOR_KEY, v);
    } catch {
      // ignore
    }
  }, []);

  const getRanges = useCallback((anchorId: string) => byAnchor.get(anchorId) ?? [], [byAnchor]);

  // A new highlight replaces any existing highlight it overlaps at all (simplest, predictable
  // policy — like re-dragging a highlighter pen over already-marked text: the new stroke wins for
  // that whole span, rather than surgically trimming the old range to the non-overlapping part).
  //
  // All side effects (the Supabase calls) happen in this function's own body, never inside a
  // setState updater — React can invoke an updater function twice in dev (Strict Mode's purity
  // check), and a network call made from inside one fired twice for every single highlight,
  // producing two identical DB rows per selection (confirmed via a live Supabase check: one
  // addHighlight call, two inserted rows ~90ms apart). The updaters below only ever compute a new
  // Map from their input, nothing else.
  const addHighlight = useCallback(
    (anchorId: string, start: number, end: number, snippet: string) => {
      if (!user || end <= start) return;
      const existing = byAnchor.get(anchorId) ?? [];
      const overlapping = existing.filter((h) => h.start < end && h.end > start);
      const kept = existing.filter((h) => !(h.start < end && h.end > start));
      const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic: Highlight = { id: tempId, anchorId, start, end, color, snippet };
      setByAnchor((prev) => {
        const next = new Map(prev);
        next.set(anchorId, [...kept, optimistic].sort((a, b) => a.start - b.start));
        return next;
      });
      for (const h of overlapping) highlightStore.remove(h.id).catch((err) => console.error(err));
      highlightStore
        .add({ anchorId, start, end, color, snippet })
        .then((realId) => {
          setByAnchor((cur) => {
            const list = cur.get(anchorId);
            if (!list) return cur;
            const updated = list.map((h) => (h.id === tempId ? { ...h, id: realId } : h));
            const copy = new Map(cur);
            copy.set(anchorId, updated);
            return copy;
          });
        })
        .catch((err) => console.error("Failed to save highlight", err));
    },
    [user, color, byAnchor]
  );

  const removeHighlight = useCallback((anchorId: string, highlightId: string) => {
    setByAnchor((prev) => {
      const existing = prev.get(anchorId);
      if (!existing) return prev;
      const next = new Map(prev);
      next.set(
        anchorId,
        existing.filter((h) => h.id !== highlightId)
      );
      return next;
    });
    if (!highlightId.startsWith("pending-")) {
      highlightStore.remove(highlightId).catch((err) => console.error("Failed to delete highlight", err));
    }
  }, []);

  const value = useMemo(
    () => ({ ready, mode, setMode, color, setColor, getRanges, addHighlight, removeHighlight }),
    [ready, mode, setMode, color, setColor, getRanges, addHighlight, removeHighlight]
  );

  return <HighlightContext.Provider value={value}>{children}</HighlightContext.Provider>;
}

export function useHighlights(): HighlightState {
  const ctx = useContext(HighlightContext);
  if (!ctx) throw new Error("useHighlights must be used within HighlightProvider");
  return ctx;
}
