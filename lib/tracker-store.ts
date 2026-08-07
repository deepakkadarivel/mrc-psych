export interface TrackerEntry {
  id: string;
  date: string; // ISO
  topic: string;
  score: number;
  total: number;
  /** ids of questions answered wrong, so weak areas can be derived from real attempts. */
  missedQuestionIds: string[];
}

export interface TrackerStore {
  addEntry(entry: TrackerEntry): void;
  getEntries(): TrackerEntry[];
}

const STORAGE_KEY = "mrcpsych-tracker-entries";

/** localStorage now; swap for a SupabaseTrackerStore behind this same interface once
 * credentials are provided — see CLAUDE.md. Don't build the Supabase side speculatively. */
class LocalTrackerStore implements TrackerStore {
  getEntries(): TrackerEntry[] {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    } catch {
      return [];
    }
  }

  addEntry(entry: TrackerEntry): void {
    const entries = this.getEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
}

export const trackerStore: TrackerStore = new LocalTrackerStore();
