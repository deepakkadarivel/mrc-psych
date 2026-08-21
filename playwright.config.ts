import { defineConfig, devices } from "@playwright/test";

// playwright.config.ts runs as plain Node, unlike the Next app (which loads .env.local itself) —
// e2e/global-setup.ts and e2e/supabase-test-helpers.ts need SUPABASE_SECRET_KEY et al. in
// process.env before they run.
process.loadEnvFile(".env.local");

// 3001 matches this project's conventional standing dev-server port (see CLAUDE.md on not
// casually killing/restarting it) — `next dev` refuses to start a second instance in the same
// directory on a different port, so pointing here lets Playwright reuse an already-running
// server instead of erroring out.
const PORT = 3001;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  // The quiz-progress tests below sign in as one fixed real Supabase user and mutate that
  // user's real quiz_progress/tracker_entries rows — running both projects (chromium,
  // mobile-chrome) at once would race on the same backend rows. A per-worker isolated test user
  // would fix that properly, but for a single-developer app's small e2e suite, serializing the
  // whole run is the simpler trade: slower total runtime, zero flakiness, no extra auth plumbing.
  workers: 1,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
    storageState: "./e2e/.auth/state.json",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Runs the same suite at a real mobile viewport — this app is mobile-first, so "no horizontal
    // scroll" / drawer / tab assertions need to hold there too, not just on desktop.
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `pnpm run predev && next dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
