import { authedTest as test, expect } from "./fixtures";

test.describe("Billing", () => {
  test("shows subscription, usage and plan catalogue", async ({ page }) => {
    await page.goto("/dashboard/billing");

    await expect(page.getByRole("heading", { name: "Faturação" })).toBeVisible();

    // Subscription summary (seeded: Pro / active).
    await expect(page.getByText("Ativa")).toBeVisible();

    // Usage bars (exact: the plan cards also mention "mensagens IA").
    await expect(page.getByText("Mensagens IA", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Armazenamento (MB)", { exact: true }),
    ).toBeVisible();

    // Plan catalogue + current-plan flag.
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByRole("button", { name: "Plano atual" })).toBeVisible();
  });

  test("starts checkout and redirects to the gateway URL", async ({ page }) => {
    await page.goto("/dashboard/billing");

    // Subscribe to the Starter plan (purchasable, not current).
    const starterCard = page
      .locator("div")
      .filter({ hasText: /^Starter/ })
      .first();
    await starterCard.getByRole("button", { name: "Assinar" }).click();

    // useCheckout redirects window.location to the (mocked, same-origin) URL.
    await page.waitForURL(/checkout=success&plan=starter/);
    expect(page.url()).toContain("plan=starter");
  });

  test("blocks the dashboard when the subscription is inactive", async ({
    page,
  }) => {
    // No valid subscription → the SubscriptionGate locks operational pages.
    await page.route("**/api/v1/billing/subscription", (route) =>
      route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ error: "not_found" }),
      }),
    );
    await page.goto("/dashboard/agents");
    await expect(page.getByText("Assinatura inativa")).toBeVisible();
    // The agents UI must not render behind the gate.
    await expect(
      page.getByRole("heading", { name: "Agentes" }),
    ).toHaveCount(0);
  });
});
