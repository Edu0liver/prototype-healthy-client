import { authedTest as test, expect } from "./fixtures";

test.describe("Settings", () => {
  test("branding tab saves", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Definições" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Branding atualizado")).toBeVisible();
  });

  test("domains tab lists and adds a domain", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "Domínios" }).click();
    await expect(page.getByText("painel.acme.com")).toBeVisible();

    await page.getByPlaceholder("painel.empresa.com").fill("novo.acme.com");
    await page.getByRole("button", { name: "Adicionar" }).click();
    await expect(page.getByText("novo.acme.com")).toBeVisible();
  });

  test("users tab lists and invites a user", async ({ page }) => {
    await page.goto("/settings");
    await page.getByRole("button", { name: "Utilizadores" }).click();
    await expect(page.getByText("admin@acme.com")).toBeVisible();

    await page.locator('input[type="email"]').fill("novo@acme.com");
    await page.getByRole("button", { name: "Convidar" }).click();
    await expect(page.getByText("Convite enviado")).toBeVisible();
  });
});
