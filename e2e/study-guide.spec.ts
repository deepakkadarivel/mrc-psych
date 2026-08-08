import { test, expect } from "@playwright/test";

// Representative topics: adult-psychiatry has the richest mix of block types (tables,
// mnemonics, traps, trap-lists, gaps); psychiatric-services is the one flagged in user feedback
// for table overflow / trap density.
const TOPICS = ["adult-psychiatry", "psychiatric-services"];

for (const topic of TOPICS) {
  test.describe(`study guide: ${topic}`, () => {
    test("page and tables never scroll horizontally", async ({ page }) => {
      await page.goto(`/topics/${topic}`);
      await expect(page.getByRole("tab", { name: "Full Guide" })).toBeVisible();

      const pageOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(pageOverflow).toBeLessThanOrEqual(1);

      // Each table's own scroll container (components/ui/table.tsx's `data-slot="table-container"`)
      // should never actually need to scroll — table-fixed + whitespace-normal at the call site
      // is what prevents the "tables scrolling to the right" regression.
      const tableOverflows = await page.$$eval('[data-slot="table-container"]', (containers) =>
        containers.map((el) => el.scrollWidth - el.clientWidth)
      );
      expect(tableOverflows.length).toBeGreaterThan(0);
      for (const overflow of tableOverflows) {
        expect(overflow).toBeLessThanOrEqual(1);
      }
    });

    test("inner study-guide tabs switch content", async ({ page }) => {
      await page.goto(`/topics/${topic}`);

      await page.getByRole("tab", { name: /Tables/ }).click();
      await expect(page.locator('[data-slot="table-container"]').first()).toBeVisible();

      await page.getByRole("tab", { name: /Traps/ }).click();
      await expect(page.getByText("EXAM TRAP").first()).toBeVisible();
    });

    test("PDF section is hidden by default and opens via the header toggle", async ({ page }) => {
      await page.goto(`/topics/${topic}`);
      await expect(page.getByTestId("pdf-section")).toHaveCount(0);

      await page.getByTestId("pdf-toggle").click();
      await expect(page.getByTestId("pdf-section")).toBeVisible();

      await page.getByTestId("pdf-toggle").click();
      await expect(page.getByTestId("pdf-section")).toHaveCount(0);
    });

    test("clicking a citation opens the PDF section and scrolls it into view", async ({ page }) => {
      await page.goto(`/topics/${topic}`);
      await expect(page.getByTestId("pdf-section")).toHaveCount(0);

      const citation = page.locator("button").filter({ hasText: /p\.\d+/ }).first();
      await citation.scrollIntoViewIfNeeded();
      await citation.click();

      const pdfSection = page.getByTestId("pdf-section");
      await expect(pdfSection).toBeVisible();
      await expect(pdfSection).toBeInViewport();
    });
  });
}
