import { authedTest as test, expect } from "./fixtures";

test.describe("Channels", () => {
  test("lists channels with status", async ({ page }) => {
    await page.goto("/channels");
    await expect(page.getByRole("heading", { name: "Canais" })).toBeVisible();
    await expect(page.getByText("Atendimento", { exact: true })).toBeVisible();
    await expect(page.getByText("Suporte", { exact: true })).toBeVisible();
    await expect(page.getByText("connected", { exact: true })).toBeVisible();
  });

  test("creates a new channel via dialog", async ({ page }) => {
    await page.goto("/channels");
    await page.getByRole("button", { name: /novo canal/i }).click();
    await page.getByPlaceholder("Atendimento principal").fill("Vendas WA");
    await page.getByPlaceholder("5511999999999").fill("5511777777777");
    await page.getByRole("button", { name: "Criar" }).click();

    await expect(page.getByText("Vendas WA")).toBeVisible();
  });

  test("connect flow renders a QR code for a disconnected channel", async ({
    page,
  }) => {
    await page.goto("/channels/ch2");
    await expect(page.getByRole("heading", { name: "Suporte" })).toBeVisible();
    await page.getByRole("button", { name: /gerar qr code/i }).click();
    await expect(page.getByText(/a aguardar leitura/i)).toBeVisible();
  });
});
