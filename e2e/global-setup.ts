import fs from "node:fs";
import path from "node:path";
import { chromium, type FullConfig } from "@playwright/test";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

// Fixed e2e test user — reused (not recreated) across runs; its password is (re)set on every
// run so the test suite never depends on what a previous run left behind, and its data is
// wiped below instead.
const TEST_EMAIL = "e2e-test@mrcpsych.local";
const TEST_PASSWORD = "e2e-test-password-not-a-real-account";
export const AUTH_DIR = path.join(__dirname, ".auth");
export const STORAGE_STATE_PATH = path.join(AUTH_DIR, "state.json");
export const SESSION_INFO_PATH = path.join(AUTH_DIR, "session.json");

async function ensureTestUser(admin: SupabaseClient, email: string, password: string): Promise<User> {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (!createError) return created.user;

  // Already exists from a previous run — find it and reset its password to the known value.
  const { data: listData, error: listError } = await admin.auth.admin.listUsers();
  if (listError) throw listError;
  const existing = listData.users.find((u) => u.email === email);
  if (!existing) throw createError;

  const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(existing.id, { password });
  if (updateError) throw updateError;
  return updated.user;
}

// Real backend-authenticated session for e2e — signInWithPassword() against a dedicated,
// disposable test user, so tests exercise the actual Supabase RLS policies rather than a
// mocked one.
export default async function globalSetup(config: FullConfig) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !publishableKey || !secretKey) {
    throw new Error(
      "e2e auth setup needs NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and " +
        "SUPABASE_SECRET_KEY in .env.local (see supabase/schema.sql and CLAUDE.md)."
    );
  }

  const admin = createClient(url, secretKey, { auth: { persistSession: false } });
  const user = await ensureTestUser(admin, TEST_EMAIL, TEST_PASSWORD);

  const anon = createClient(url, publishableKey, { auth: { persistSession: false } });
  const { data: signInData, error: signInError } = await anon.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (signInError) throw signInError;
  const session = signInData.session;
  if (!session) throw new Error("signInWithPassword did not return a session");

  // Clean slate for this fixed test user on every run.
  await admin.from("tracker_entries").delete().eq("user_id", user.id);
  await admin.from("quiz_progress").delete().eq("user_id", user.id);

  const projectRef = new URL(url).hostname.split(".")[0];
  const storageKey = `sb-${projectRef}-auth-token`;

  const baseURL = config.projects[0].use.baseURL as string;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/login`);
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: storageKey, value: JSON.stringify(session) }
  );

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
  fs.writeFileSync(SESSION_INFO_PATH, JSON.stringify({ userId: user.id, email: TEST_EMAIL }));
  await browser.close();
}
