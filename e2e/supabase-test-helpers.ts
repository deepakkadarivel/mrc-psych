import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { SESSION_INFO_PATH } from "./global-setup";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { persistSession: false } }
);

export function getTestUserId(): string {
  return JSON.parse(fs.readFileSync(SESSION_INFO_PATH, "utf-8")).userId;
}
