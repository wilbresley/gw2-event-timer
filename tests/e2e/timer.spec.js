import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 800 } });

test("timer, filters, favorites, sound and responsive menu", async ({ page }) => {
  const errors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto("/");
  await expect(page.locator("#version-line")).toContainText("Version 1.1.2");
  await expect(page.locator("#clock")).toHaveText(/^\d{2}:\d{2}/);
  const cards = page.locator("article.card");
  await expect(cards.first()).toBeVisible();
  expect(await cards.count()).toBeGreaterThan(0);

  await page.locator("article.card [data-tip]").first().hover();
  await expect(page.locator("#tip")).toBeVisible({ timeout: 3000 });

  const mainChip = page.locator('#filters .chip[data-cat="main"]');
  const bossChip = page.locator('#filters .chip[data-cat="boss"]');
  await expect(mainChip).toHaveAttribute("aria-pressed", "true");
  await mainChip.click();
  await bossChip.click();
  await expect(bossChip).toHaveAttribute("aria-pressed", "true");
  await expect(cards.first()).toBeVisible();
  const tagTexts = await page.locator("article.card .tag").allTextContents();
  expect(tagTexts.some((text) => text.trim() === "Boss")).toBeTruthy();

  await bossChip.click();
  await mainChip.click();
  await expect(mainChip).toHaveAttribute("aria-pressed", "true");

  const firstCard = cards.first();
  const eventId = await firstCard.getAttribute("data-id");
  const star = firstCard.locator(".star");
  await star.click();
  await expect(star).toHaveAttribute("aria-pressed", "true");

  await page.reload();
  await page.locator('#queues [data-toggle="fav"]').click();
  await expect(page.locator('article.card[data-id="' + eventId + '"]')).toBeVisible();

  await page.locator("#sound").click();
  await expect(page.locator("#sound-panel")).toBeVisible();
  const toggle = page.locator("#sound-toggle");
  const before = await toggle.getAttribute("aria-pressed");
  await toggle.click();
  await expect(toggle).not.toHaveAttribute("aria-pressed", before);
  const soon = page.locator("#sound-soon");
  const soonBefore = await soon.textContent();
  await soon.click();
  await expect(soon).not.toHaveText(soonBefore);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#menu").click();
  await expect(page.locator("#sheet")).toBeVisible();
  await expect(page.locator("#sheet-body #account")).toBeVisible();
  await expect(page.locator("#sheet-body #filters")).toBeVisible();
  await page.locator("#sheet-close").click();
  await expect(page.locator("#sheet")).toBeHidden();

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator(".tools #account")).toBeVisible();
  expect(errors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
