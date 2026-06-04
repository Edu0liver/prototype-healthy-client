import { test, expect } from "./fixtures";

// Public landing (no auth cookie). Uses the base `test` fixture so the mock
// backend is installed but no session is seeded.
test.describe("Landing", () => {
  test("renders hero and public pricing", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Atendimento automatizado com IA/ }),
    ).toBeVisible();

    // Pricing from the public /plans endpoint.
    await expect(page.getByRole("heading", { name: "Planos" })).toBeVisible();
    await expect(page.getByText("Starter")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
  });

  test("funnel B: choosing a paid plan deep-links to signup with the plan", async ({
    page,
  }) => {
    await page.goto("/");

    const starter = page
      .locator("div")
      .filter({ hasText: /^Starter/ })
      .first();
    await starter.getByRole("link", { name: "Assinar" }).click();

    await page.waitForURL(/\/signup\?plan=starter/);
    expect(page.url()).toContain("plan=starter");
  });
});
