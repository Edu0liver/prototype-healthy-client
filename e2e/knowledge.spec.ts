import { authedTest as test, expect } from "./fixtures";

test.describe("Knowledge", () => {
  test("lists knowledge bases", async ({ page }) => {
    await page.goto("/knowledge");
    await expect(page.getByRole("heading", { name: "Conhecimento" })).toBeVisible();
    await expect(page.getByText("Base FAQ")).toBeVisible();
  });

  test("creates a knowledge base", async ({ page }) => {
    await page.goto("/knowledge");
    await page.getByRole("button", { name: /nova base/i }).click();
    await page.locator('input').first().fill("Base Produtos");
    await page.getByRole("button", { name: "Criar" }).click();
    await expect(page.getByText("Base Produtos")).toBeVisible();
  });

  test("shows documents and indexes pasted text", async ({ page }) => {
    await page.goto("/knowledge/kb1");
    await expect(page.getByRole("heading", { name: "Base FAQ" })).toBeVisible();
    await expect(page.getByText("faq.pdf")).toBeVisible();
    await expect(page.getByText("indexed")).toBeVisible();

    // Paste-text card: title input + content textarea.
    await page.locator('input').last().fill("Promoções");
    await page.locator("textarea").fill("Texto promocional para indexar.");
    await page.getByRole("button", { name: /indexar texto/i }).click();

    await expect(page.getByText("Promoções")).toBeVisible();
  });
});
