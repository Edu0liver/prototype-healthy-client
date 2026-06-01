import { authedTest as test, expect } from "./fixtures";

test.describe("Agents", () => {
  test("lists agents", async ({ page }) => {
    await page.goto("/agents");
    await expect(page.getByRole("heading", { name: "Agentes" })).toBeVisible();
    await expect(page.getByText("Assistente Vendas")).toBeVisible();
  });

  test("creates an agent", async ({ page }) => {
    await page.goto("/agents");
    await page.getByRole("button", { name: /novo agente/i }).click();
    await page.getByPlaceholder("Assistente de vendas").fill("Bot Suporte");
    await page
      .getByPlaceholder("Você é um assistente prestável que…")
      .fill("Você ajuda no suporte técnico.");
    await page.getByRole("button", { name: "Criar" }).click();

    await expect(page.getByText("Bot Suporte")).toBeVisible();
  });

  test("edits an agent and shows linked knowledge base", async ({ page }) => {
    await page.goto("/agents/a1");
    await expect(page.getByRole("heading", { name: "Assistente Vendas" })).toBeVisible();

    // Knowledge base link (seeded: a1 ↔ kb1) renders checked.
    const kbCheckbox = page.getByRole("checkbox", { name: /Base FAQ/i });
    await expect(kbCheckbox).toBeChecked();

    await page.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByText("Agente atualizado")).toBeVisible();
  });
});
