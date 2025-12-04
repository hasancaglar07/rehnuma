import { test, expect } from "@playwright/test";

test.skip(true, "Requires running dev server at http://localhost:3000");

test.describe("Paywall & abonelik akışı", () => {
  test("misafir kullanıcı paywall görür", async ({ page }) => {
    await page.goto("http://localhost:3000/yazi/ilk-yazi");
    await expect(page.getByText("Devamını okumak için abone olun.")).toBeVisible();
  });
});
