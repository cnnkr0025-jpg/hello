import { test, expect } from "@playwright/test";

test("dashboard renders demo presets", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await expect(page.getByText("워크플로우 빌더")).toBeVisible();
  await expect(page.getByText("최근 작업")).toBeVisible();
  await page.getByRole("button", { name: /제출/ }).first().click();
});
