import { test, expect, type Page } from "@playwright/test";

// Representative topics: adult-psychiatry has the richest mix of block types (tables,
// mnemonics, traps, trap-lists, gaps); psychiatric-services is the one flagged in user feedback
// for table overflow / trap density.
const TOPICS = ["adult-psychiatry", "psychiatric-services"];

// Below md (768px) the study-guide tab switcher is the mobile "chart tabs" bottom bar (Full
// Guide/Concise/Quiz + a More sheet for the rest) instead of the header's icon tab row — see
// study-guide-view.tsx's BottomTabBar/MoreSheet. Tests branch on viewport width so the same
// assertions exercise the real control for each project (`chromium` = desktop, `mobile-chrome` =
// Pixel 5, configured in playwright.config.ts).
function isMobileNav(page: Page): boolean {
  return (page.viewportSize()?.width ?? 1280) < 768;
}

const BOTTOM_BAR_TABS = ["Full Guide", "Concise", "Quiz"];

async function switchToTab(page: Page, label: string) {
  if (!isMobileNav(page)) {
    await page.getByRole("tab", { name: new RegExp(label) }).click();
    return;
  }
  if (BOTTOM_BAR_TABS.includes(label)) {
    await page.getByRole("navigation", { name: "Study guide sections" }).getByText(label, { exact: true }).click();
  } else {
    await page.getByRole("navigation", { name: "Study guide sections" }).getByText("More", { exact: true }).click();
    await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
  }
}

for (const topic of TOPICS) {
  test.describe(`study guide: ${topic}`, () => {
    test("page and tables never scroll horizontally", async ({ page }) => {
      await page.goto(`/topics/${topic}`);
      if (isMobileNav(page)) {
        await expect(page.getByRole("navigation", { name: "Study guide sections" })).toBeVisible();
      } else {
        await expect(page.getByRole("tab", { name: "Full Guide" })).toBeVisible();
      }

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

      await switchToTab(page, "Tables");
      await expect(page.locator('[data-slot="table-container"]').first()).toBeVisible();

      await switchToTab(page, "Traps");
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

    test("jump-to-section scrolls the Full Guide to the chosen section", async ({ page }) => {
      await page.goto(`/topics/${topic}`);

      if (!isMobileNav(page)) {
        const select = page.getByLabel("Jump to section");
        const lastOption = select.locator("option").last();
        const [lastValue, lastSectionTitle] = await Promise.all([
          lastOption.getAttribute("value"),
          lastOption.textContent(),
        ]);
        await select.selectOption(lastValue!);
        await expect(page.getByRole("heading", { name: lastSectionTitle!, exact: true })).toBeInViewport();
        return;
      }

      // Mobile: the same jump list lives inside the bottom bar's "More" sheet as a plain button
      // list (see MoreSheet in study-guide-view.tsx) rather than a native <select>.
      await page.getByRole("navigation", { name: "Study guide sections" }).getByText("More", { exact: true }).click();
      const sectionButtons = page.getByTestId("jump-section-list").getByRole("button");
      const lastSectionTitle = await sectionButtons.last().textContent();
      await sectionButtons.last().click();

      await expect(page.getByRole("heading", { name: lastSectionTitle!, exact: true })).toBeInViewport();
    });

    test("clicking a citation opens the PDF drawer", async ({ page }) => {
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
