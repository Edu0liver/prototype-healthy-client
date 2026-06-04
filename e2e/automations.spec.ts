import { authedTest as test, expect } from "./fixtures";

test.describe("Automations", () => {
  test("lists existing automations", async ({ page }) => {
    await page.goto("/dashboard/automations");
    await expect(page.getByRole("heading", { name: "Automações" })).toBeVisible();
    await expect(page.getByText("Assistente Vendas")).toBeVisible();
    await expect(page.getByText("Ativa", { exact: true })).toBeVisible();
  });

  test("creates an automation binding a channel to an agent", async ({ page }) => {
    await page.goto("/dashboard/automations");
    await page.getByRole("button", { name: /nova automação/i }).click();

    const selects = page.locator("select");
    await selects.nth(0).selectOption({ label: "Suporte" });
    await selects.nth(1).selectOption({ label: "Assistente Vendas" });
    await page.getByRole("button", { name: "Criar" }).click();

    await expect(page.getByText(/Suporte/)).toBeVisible();
  });
});
