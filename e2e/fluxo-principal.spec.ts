import { expect, test } from "@playwright/test";

import {
  E2E_USER,
  mockAuthedSession,
  mockBranding,
  mockLoginError,
  mockLoginSuccess,
} from "./utils/mockApi";

// Critical flow: Login. Exercises auth submit → cookie → middleware → dashboard
// render, plus the error-feedback path. Each test sets up its own routes, so
// they are fully isolated (no shared state / no real backend).

test.beforeEach(async ({ page }) => {
  // Public theming call fires on every page.
  await mockBranding(page);
  // Default: no session. Success test overrides this (Playwright matches routes
  // LIFO, so the later registration wins).
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "unauthorized", message: "session expired" }),
    }),
  );
});

test.describe("Login", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: /entrar/i }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("voce@empresa.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
  });

  test("success: authenticates and lands on the dashboard", async ({ page }) => {
    await mockLoginSuccess(page);
    await mockAuthedSession(page); // me→200 + dashboard lists, overriding default

    await page.goto("/login");
    await page.getByPlaceholder("voce@empresa.com").fill(E2E_USER.email);
    await page.getByPlaceholder("••••••••").fill("secret123");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Redirected to the dashboard root and the shell renders.
    await expect(page).toHaveURL("http://localhost:3000/");
    await expect(
      page.getByText(`Olá, ${E2E_USER.name}`, { exact: false }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Visão geral" }),
    ).toBeVisible();
  });

  test("error: shows the backend error message on invalid credentials", async ({
    page,
  }) => {
    await mockLoginError(page, 401, "invalid credentials");

    await page.goto("/login");
    await page.getByPlaceholder("voce@empresa.com").fill("admin@acme.com");
    await page.getByPlaceholder("••••••••").fill("wrongpass");
    await page.getByRole("button", { name: /entrar/i }).click();

    // Error toast surfaces; user stays on the login page.
    await expect(page.getByText("invalid credentials")).toBeVisible();
    await expect(page).toHaveURL("http://localhost:3000/login");
  });
});
