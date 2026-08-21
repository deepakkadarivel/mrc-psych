import { test, expect } from "@playwright/test";
import { supabaseAdmin, getTestUserId } from "./supabase-test-helpers";

const QUIZ_ID = "adult-psychiatry";

// Regression coverage for the quiz-progress bug: answering questions, leaving the quiz, and
// coming back used to restart from question 1 with no way to revisit earlier answers.
// Quiz progress is Supabase-backed (see lib/quiz-progress-store.ts), so — unlike the old
// localStorage version — resetting between tests means deleting the signed-in test user's real
// row for this quiz, not clearing browser storage.
test.describe("quiz progress persistence and navigation", () => {
  test.beforeEach(async ({ page }) => {
    await supabaseAdmin.from("quiz_progress").delete().eq("user_id", getTestUserId()).eq("quiz_id", QUIZ_ID);
    await page.goto(`/quiz/${QUIZ_ID}`);
  });

  // Every answer/nav change fires a fire-and-forget saveQuizProgress() write (see quiz-view.tsx) —
  // a real Supabase network round-trip now, not a synchronous localStorage write. Leaving one
  // in flight when a test ends can land after the *next* test's beforeEach delete and reintroduce
  // a row it just cleared, so every test settles network activity before finishing.
  test.afterEach(async ({ page }) => {
    await page.waitForLoadState("networkidle");
  });

  test("answering, revealing, and moving to question 2 persists across a reload", async ({ page }) => {
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await expect(page.getByText(/^Correct$|^Incorrect$/)).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("button", { name: "Go to question 2", exact: true })).toHaveClass(/ring-2/);

    // Wait for that navigation's save to actually land before reloading, or the reload can win
    // the race and come back with the pre-save (empty) progress row.
    await page.waitForLoadState("networkidle");
    await page.reload();
    await expect(page.getByRole("button", { name: "Go to question 2", exact: true })).toHaveClass(/ring-2/);
  });

  test("going back to a previously answered question keeps its selection and reveal state", async ({ page }) => {
    const firstOptionLabel = await page.locator("label").first().innerText();
    await page.getByRole("radio").first().click();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await page.getByRole("button", { name: "Next", exact: true }).click();

    await page.getByRole("button", { name: "Prev", exact: true }).click();
    await expect(page.getByRole("button", { name: "Go to question 1", exact: true })).toHaveClass(/ring-2/);
    await expect(page.getByRole("radio", { checked: true })).toBeVisible();
    await expect(page.locator("label").filter({ hasText: firstOptionLabel }).first()).toContainText(firstOptionLabel);
    await expect(page.getByText(/^Correct$|^Incorrect$/)).toBeVisible();
  });

  test("the question palette jumps directly to a question", async ({ page }) => {
    await page.getByRole("button", { name: "Go to question 5", exact: true }).click();
    await expect(page.getByRole("button", { name: "Go to question 5", exact: true })).toHaveClass(/ring-2/);
  });
});
