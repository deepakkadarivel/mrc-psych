import { defineConfig, devices } from "@playwright/test";

// 3001 matches this project's conventional standing dev-server port (see CLAUDE.md on not
// casually killing/restarting it) — `next dev` refuses to start a second instance in the same
// directory on a different port, so pointing here lets Playwright reuse an already-running
// server instead of erroring out.
const PORT = 3001;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
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
