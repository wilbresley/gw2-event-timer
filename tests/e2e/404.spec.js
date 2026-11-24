import { expect, test } from "@playwright/test";

test("missing path is a styled 404 page", async ({ page }) => {
  const response = await page.goto("/caminho-inexistente");
  expect(response && response.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("Page not found");
  await expect(page.locator('a[href="/"]')).toBeVisible();
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).toBe("rgb(12, 15, 20)");
});
