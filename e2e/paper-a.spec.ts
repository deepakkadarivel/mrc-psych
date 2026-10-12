import { test, expect } from "@playwright/test";

// Paper A is a separate route tree (/paper-a/...) with its own content under content/paper-a/;
// these cover what's new about it rather than re-testing the shared quiz/study-guide components
// (e2e/quiz.spec.ts and study-guide.spec.ts do that against Paper B).

test.describe("paper A", () => {
  test("home lists topics and the paper switch moves between papers", async ({ page }) => {
    await page.goto("/paper-a");
    await expect(page.getByRole("heading", { name: "MRCPsych Paper A" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Classification", exact: true }).first()).toBeVisible();

    // The sidebar is collapsed behind a drawer on mobile; the switch itself is covered at desktop width.
    if ((page.viewportSize()?.width ?? 1280) >= 768) {
      await page.getByTestId("paper-switch-b").click();
      await expect(page).toHaveURL(/localhost:\d+\/$/);
      await page.getByTestId("paper-switch-a").click();
      await expect(page).toHaveURL(/\/paper-a$/);
    }
  });

  test("a topic's study guide renders, never scrolls sideways, and its citation opens the real PDF page", async ({ page }) => {
    await page.goto("/paper-a/topics/pa-syndromes");
    const mobile = (page.viewportSize()?.width ?? 1280) < 768;
    if (mobile) await expect(page.getByRole("navigation", { name: "Study guide sections" })).toBeVisible();
    else await expect(page.getByRole("tab", { name: "Full Guide" })).toBeVisible();
    await expect(page.getByText(/Creutzfeldt-Jakob disease/).filter({ visible: true }).first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    // Folder names in resources/paper-a carry stray spaces; the PDF must still load via the
    // sanitized /sources/paper-a/... URL the citation builds.
    const pdfResponse = page.waitForResponse((r) => r.url().includes("/sources/paper-a/") && r.url().endsWith(".pdf"));
    await page.getByRole("button", { name: /p\.\s*\d+/i }).first().click();
    expect((await pdfResponse).status()).toBe(200);
    await expect(page.getByTestId("pdf-section")).toBeVisible();
    await expect(page.locator(".react-pdf__Page canvas").first()).toBeVisible({ timeout: 20_000 });
  });

  test("a PDF in a folder with a trailing space is served", async ({ request }) => {
    const res = await request.get("/sources/paper-a/High yields/GENETICS/Molecular Genetics Attempt review.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("pdf");
  });

  test("a topic quiz and a mock both render a question with options", async ({ page }) => {
    await page.goto("/paper-a/quiz/pa-neurochemistry");
    await expect(page.getByText(/Which of the following neurotransmitters is not correctly matched with its precu/)).toBeVisible();
    await expect(page.getByRole("radio")).toHaveCount(5);

    await page.goto("/paper-a/quiz/pa-mock-1-3");
    await expect(page.getByRole("radio").first()).toBeVisible();
    await page.goto("/paper-a/mock");
    await expect(page.getByText("Test 7").first()).toBeVisible();
  });

  test("no Paper A study guide scrolls sideways", async ({ page }) => {
    test.setTimeout(120_000);
    const topics = [
      "classification", "clinical-examination", "descriptive-psychopathology", "dynamic-psychopathology",
      "rating-scales", "syndromes", "applied-neurosciences", "neuroanatomy", "neurochemistry", "neuropathology",
      "neurophysiology", "basic-pharmacology", "pharmacokinetics", "pharmacodynamics", "adverse-drug-effects",
      "basic-psychology", "social-psychology", "sociocultural-psychiatry", "human-development", "molecular-genetics",
    ];
    for (const t of topics) {
      await page.goto(`/paper-a/topics/pa-${t}`);
      await expect(page.getByTestId("pdf-toggle")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${t} page overflow`).toBeLessThanOrEqual(1);
      const tables = await page.$$eval('[data-slot="table-container"]', (els) => els.map((e) => e.scrollWidth - e.clientWidth));
      for (const o of tables) expect(o, `${t} table overflow`).toBeLessThanOrEqual(1);
    }
  });

  test("every figure image in every Paper A guide loads", async ({ page }) => {
    test.setTimeout(180_000);
    const topics = [
      "classification", "clinical-examination", "descriptive-psychopathology", "dynamic-psychopathology",
      "rating-scales", "syndromes", "applied-neurosciences", "neuroanatomy", "neurochemistry", "neuropathology",
      "neurophysiology", "basic-pharmacology", "pharmacokinetics", "pharmacodynamics", "adverse-drug-effects",
      "basic-psychology", "social-psychology", "sociocultural-psychiatry", "human-development", "molecular-genetics",
    ];
    for (const t of topics) {
      await page.goto(`/paper-a/topics/pa-${t}`);
      await expect(page.getByTestId("pdf-toggle")).toBeVisible();
      // Images are plain <img> tags (no lazy loading): wait for them, then check none is broken.
      await page.waitForLoadState("networkidle");
      const broken = await page.$$eval('img[src^="/diagrams/paper-a/"]', (imgs) =>
        imgs.filter((i) => !(i as HTMLImageElement).complete || (i as HTMLImageElement).naturalWidth === 0).map((i) => i.getAttribute("src"))
      );
      expect(broken, `${t} broken images`).toEqual([]);
    }
  });
});
