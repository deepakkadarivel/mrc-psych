import { supabase } from "@/lib/supabase-client";

export interface TrackerEntry {
  id: string;
  date: string; // ISO
  topic: string;
  score: number;
  total: number;
  /** ids of questions answered wrong, so weak areas can be derived from real attempts. */
  missedQuestionIds: string[];
}

interface TrackerRow {
  id: string;
  date: string;
  topic: string;
  score: number;
  total: number;
  missed_question_ids: string[];
}

const fromRow = (r: TrackerRow): TrackerEntry => ({
  id: r.id,
  date: r.date,
  topic: r.topic,
  score: r.score,
  total: r.total,
  missedQuestionIds: r.missed_question_ids,
});

/** Callers are gated behind sign-in by components/app-shell.tsx. */
export const trackerStore = {
  async getEntries(): Promise<TrackerEntry[]> {
    const { data, error } = await supabase
      .from("tracker_entries")
      .select("id, date, topic, score, total, missed_question_ids")
      .order("date", { ascending: true });
    if (error) throw error;
    return (data as TrackerRow[]).map(fromRow);
  },

  async addEntry(entry: TrackerEntry): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) throw new Error("Not signed in");
    const { error } = await supabase.from("tracker_entries").insert({
      id: entry.id,
      user_id: userId,
      date: entry.date,
      topic: entry.topic,
      score: entry.score,
      total: entry.total,
      missed_question_ids: entry.missedQuestionIds,
    });
    if (error) throw error;
  },
};
