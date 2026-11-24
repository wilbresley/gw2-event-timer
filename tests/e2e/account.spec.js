import { expect, test } from "@playwright/test";
import {
  account,
  character,
  items,
  itemstats,
  professions,
  specializations,
  tokeninfo,
  worlds
} from "../fixtures/api.mjs";

const API = "https://api.guildwars2.com";

test.use({ viewport: { width: 1280, height: 900 } });

test("account loads Characters with equipment only and starts the timers", async ({ page }) => {
  const errors = [];
  const pageErrors = [];
  const requests = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("request", (request) => {
    if (request.url().startsWith(API)) {
      requests.push({ url: request.url(), headers: request.headers() });
    }
  });

  await page.route(API + "/**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const path = requestUrl.pathname;
    const json = (body) => route.fulfill({
      status: 200,
      contentType: "application/json",
      headers: { "access-control-allow-origin": "*" },
      body: JSON.stringify(body)
    });

    if (path === "/v2/build") return json({ id: 210545 });
    if (path === "/v2/tokeninfo") return json(tokeninfo);
    if (path === "/v2/account") return json(account);
    if (path === "/v2/worlds") return json(worlds);
    if (path === "/v2/characters") return json([character]);
    if (path === "/v2/professions") return json(professions);
    if (path === "/v2/items") return json(items);
    if (path === "/v2/itemstats") return json(itemstats);
    if (path === "/v2/specializations") return json(specializations);
    if (path === "/v2/currencies") return json([{ id: 63, name: "Coin", icon: "" }]);
    if (path === "/v2/account/wvw") return json({});
    if (path === "/v2/pvp/stats") return json({});
    if (path === "/v2/mastery/points") return json(null);
    if (path === "/v2/pvp/games") return json([]);
    if (path === "/v2/skins") return json([]);
    if (path.startsWith("/v2/commerce/")) return json([]);
    if (path.startsWith("/v2/account/")) return json([]);
    if (path === "/v2/raids" || path.startsWith("/v2/raids/") || path === "/v2/dungeons") return json([]);
    return json([]);
  });

  await page.goto("/");
  await page.locator("#account").click();
  const form = page.locator("#account-view.acct-gate");
  await expect(form).toBeVisible();
  await form.locator('input.search').fill("test-key");
  await form.locator("button.tool", { hasText: "Save key" }).click();

  await expect(page.locator("#account-view .acct-nav")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#version-line")).toContainText("Version 1.1.2");

  expect(requests.some((request) => request.url.includes("access_token=test-key"))).toBe(true);
  expect(
    requests.every((request) => !Object.keys(request.headers).some((key) => key.toLowerCase() === "authorization"))
  ).toBe(true);

  await page.locator("#account-view .acct-nav button").filter({ hasText: "Characters" }).click();
  await expect(page.locator(".equip-board")).toBeVisible();
  await expect(page.locator("h3.acct-cat", { hasText: "Equipment templates" })).toBeVisible();
  await expect(page.getByText("Necromancer 80 · Ritualist").first()).toBeVisible();
  await expect(page.getByText("Build templates")).toHaveCount(0);
  await expect(page.locator(".acct-trait, .skill-board, .acct-skill")).toHaveCount(0);

  await page.locator("#account-view .acct-nav button").filter({ hasText: "Unlocks" }).click();
  await expect(page.locator("#account-view .acct-body")).toBeVisible();
  await expect(page.getByText("Skins").first()).toBeVisible();

  const refreshAll = page.locator("[data-refresh-all]");
  await expect(refreshAll).toBeEnabled();
  await refreshAll.click();
  await expect(refreshAll).toBeDisabled();
  const first = await refreshAll.textContent();
  await page.waitForTimeout(1600);
  const second = await refreshAll.textContent();
  expect(second).not.toBe(first);

  expect(errors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
