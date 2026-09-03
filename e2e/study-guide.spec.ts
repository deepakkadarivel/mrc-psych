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
      // Below sm, tables render as stacked cards (data-testid="table-mobile-view") instead of the
      // real <table> (data-slot="table-container") — see DataTableGrid in study-guide-view.tsx.
      const tableLocator = isMobileNav(page)
        ? page.getByTestId("table-mobile-view")
        : page.locator('[data-slot="table-container"]');
      await expect(tableLocator.first()).toBeVisible();

      await switchToTab(page, "Traps");
      await expect(page.getByText("EXAM TRAP").first()).toBeVisible();

      // Neither representative topic has Mind Map content authored yet (rolling out topic by
      // topic — see old-age-psychiatry's dedicated test below), so this only checks the tab
      // switches and renders its empty-state message rather than staying on the previous tab.
      await switchToTab(page, "Mind Map");
      await expect(page.getByText("Mind map not yet available for this topic.")).toBeVisible();
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

// old-age-psychiatry is one representative topic with authored Mind Map content (all 15 topics
// now have one — see each content/study-guides/*.json's `mindMap` field and CLAUDE.md's "Mind Map
// tab" section). Kept as its own describe block rather than folded into the generic TOPICS loop
// above, since neither of those two topics is used to exercise real Mind Map content there.
test.describe("mind map: old-age-psychiatry", () => {
  test("tree rows expand, show cited facts, and jump to the PDF drawer", async ({ page }) => {
    await page.goto("/topics/old-age-psychiatry");
    await switchToTab(page, "Mind Map");

    // Rendered as a connector-line tree (<ul>/<li>, styled after a Mermaid/org-chart diagram) —
    // see components/mind-map-view.tsx — so branch rows are <li> elements, not cards.
    const branches = page.getByTestId("mindmap-branches");
    await expect(branches).toBeVisible();
    await expect(branches.locator("> li").first()).toBeVisible();

    await page.getByTestId("mindmap-expand-all").click();
    const citation = branches.locator("button").filter({ hasText: /p\.\d+/ }).first();
    await expect(citation).toBeVisible();
    await citation.scrollIntoViewIfNeeded();
    await citation.click();

    const pdfSection = page.getByTestId("pdf-section");
    await expect(pdfSection).toBeVisible();
  });

  test("hide references toggle persists across a reload", async ({ page }) => {
    await page.goto("/topics/old-age-psychiatry");
    await switchToTab(page, "Mind Map");
    await page.getByTestId("mindmap-expand-all").click();

    const branches = page.getByTestId("mindmap-branches");
    const citations = branches.locator("button").filter({ hasText: /p\.\d+/ });
    await expect(citations.first()).toBeVisible();

    const toggle = page.getByTestId("mindmap-toggle-references");
    await expect(toggle).toHaveText(/Hide references/);
    await toggle.click();
    await expect(toggle).toHaveText(/Show references/);
    await expect(citations).toHaveCount(0);

    // Reload and re-expand — the citation-visibility preference itself (localStorage, shared
    // across every topic per CLAUDE.md's "Mind Map tab" note) should survive the reload even
    // though expand/collapse state (plain component state) does not.
    await page.reload();
    await switchToTab(page, "Mind Map");
    await expect(page.getByTestId("mindmap-toggle-references")).toHaveText(/Show references/);
    await page.getByTestId("mindmap-expand-all").click();
    await expect(branches.locator("button").filter({ hasText: /p\.\d+/ })).toHaveCount(0);

    // Restore the default (visible) state so this doesn't leak into other tests/topics that share
    // the same localStorage key within this browser context.
    await page.getByTestId("mindmap-toggle-references").click();
  });
});
