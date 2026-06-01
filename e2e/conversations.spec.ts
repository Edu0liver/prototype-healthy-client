import { authedTest as test, expect } from "./fixtures";

test.describe("Conversations", () => {
  test("lists conversations and filters by state", async ({ page }) => {
    await page.goto("/conversations");
    await expect(page.getByRole("heading", { name: "Conversas" })).toBeVisible();
    await expect(page.getByText("ct-aaaaa")).toBeVisible(); // ai conversation
    await expect(page.getByText("ct-bbbbb")).toBeVisible(); // human conversation

    // Filter to "human" — the ai-only conversation drops out.
    await page.locator("select").first().selectOption("human");
    await expect(page.getByText("ct-bbbbb")).toBeVisible();
    await expect(page.getByText("ct-aaaaa")).toHaveCount(0);
  });

  test("handover: take, reply and close a conversation", async ({ page }) => {
    await page.goto("/conversations/cv1");
    await expect(page.getByText("Olá, quero saber preços")).toBeVisible();

    // AI state: composer disabled, "Assumir" available.
    const composer = page.getByPlaceholder("Assuma a conversa para responder");
    await expect(composer).toBeDisabled();
    await page.getByRole("button", { name: /assumir/i }).click();

    // Now human: reply.
    const input = page.getByPlaceholder("Escreva uma resposta…");
    await expect(input).toBeEnabled();
    await input.fill("Posso ajudar, sim!");
    await page.getByRole("button", { name: /enviar/i }).click();
    await expect(page.getByText("Posso ajudar, sim!")).toBeVisible();

    // Close.
    await page.getByRole("button", { name: /fechar/i }).click();
    await expect(page.getByText("closed")).toBeVisible();
  });
});
