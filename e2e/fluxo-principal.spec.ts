import { E2E_USER, expect, test } from "./fixtures";

// Auth entry flow: login (render / success / error) + signup.
test.describe("Login", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /entrar/i })).toBeVisible();
    await expect(page.getByPlaceholder("voce@empresa.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("success: authenticates and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("voce@empresa.com").fill(E2E_USER.email);
    await page.getByPlaceholder("••••••••").fill("secret123");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page).toHaveURL("http://localhost:3000/dashboard");
    await expect(page.getByText(`Olá, ${E2E_USER.name}`, { exact: false })).toBeVisible();
    await expect(page.getByRole("link", { name: "Visão geral" })).toBeVisible();
  });

  test("error: shows the backend error message on invalid credentials", async ({
    page,
  }) => {
    // Override the happy-path login with a 401 (LIFO — last route wins).
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unauthorized", message: "invalid credentials" }),
      }),
    );

    await page.goto("/login");
    await page.getByPlaceholder("voce@empresa.com").fill("admin@acme.com");
    await page.getByPlaceholder("••••••••").fill("wrongpass");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText("invalid credentials")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});

test.describe("Signup", () => {
  test("creates a company and lands authenticated", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: /criar empresa/i })).toBeVisible();

    await page.getByPlaceholder("Acme Lda.").fill("Nova Empresa");
    await page.locator('input[type="email"]').fill("dono@nova.com");
    await page.locator('input[type="password"]').fill("secret12345");
    await page.getByRole("button", { name: /criar conta/i }).click();

    // No plan chosen at signup → lands on billing to pick a plan (no Free tier).
    await expect(page).toHaveURL("http://localhost:3000/dashboard/billing");
  });
});
