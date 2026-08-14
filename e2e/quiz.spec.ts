import { test, expect } from "@playwright/test";

// Regression coverage for the quiz-progress bug: answering questions, leaving the quiz, and
// coming back used to restart from question 1 with no way to revisit earlier answers.
test.describe("quiz progress persistence and navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/quiz/adult-psychiatry");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("answering, revealing, and moving to question 2 persists across a reload", async ({ page }) => {
    await page.locator("label").first().click();
    await page.getByRole("button", { name: "Reveal answer" }).click();
    await expect(page.getByText(/^Correct$|^Incorrect$/)).toBeVisible();

    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(page.getByRole("button", { name: "Go to question 2", exact: true })).toHaveClass(/ring-2/);

    await page.reload();
    await expect(page.getByRole("button", { name: "Go to question 2", exact: true })).toHaveClass(/ring-2/);
  });

  test("going back to a previously answered question keeps its selection and reveal state", async ({ page }) => {
    const firstOptionLabel = await page.locator("label").first().innerText();
    await page.locator("label").first().click();
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
