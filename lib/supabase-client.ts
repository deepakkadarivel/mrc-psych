import { createClient } from "@supabase/supabase-js";

// Plain browser client — no @supabase/ssr — this app has no server (output: 'export'),
// so session lives in localStorage via the default browser storage adapter.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);
