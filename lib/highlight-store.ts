import { supabase } from "@/lib/supabase-client";

export interface Highlight {
  id: string;
  anchorId: string;
  start: number;
  end: number;
  color: string;
  snippet: string;
}

interface HighlightRow {
  id: string;
  anchor_id: string;
  start_offset: number;
  end_offset: number;
  color: string;
  snippet: string;
}

const fromRow = (r: HighlightRow): Highlight => ({
  id: r.id,
  anchorId: r.anchor_id,
  start: r.start_offset,
  end: r.end_offset,
  color: r.color,
  snippet: r.snippet,
});

/** Callers are gated behind sign-in by components/app-shell.tsx, same as tracker-store/
 * quiz-progress-store. One row per highlighted span; no update — a changed/overlapping
 * highlight is a delete + insert (see lib/highlight-context.tsx), so no update RLS policy exists. */
export const highlightStore = {
  async getAll(): Promise<Highlight[]> {
    const { data, error } = await supabase
      .from("highlights")
      .select("id, anchor_id, start_offset, end_offset, color, snippet");
    if (error) throw error;
    return (data as HighlightRow[]).map(fromRow);
  },

  async add(h: Omit<Highlight, "id">): Promise<string> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Not signed in");
    const { data, error } = await supabase
      .from("highlights")
      .insert({
        user_id: userId,
        anchor_id: h.anchorId,
        start_offset: h.start,
        end_offset: h.end,
        color: h.color,
        snippet: h.snippet,
      })
      .select("id")
      .single();
    if (error) throw error;
    return (data as { id: string }).id;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("highlights").delete().eq("id", id);
    if (error) throw error;
  },
};
