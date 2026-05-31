import type { Page, Route } from "@playwright/test";

// Browser-level API mocking. The app talks to same-origin Next route handlers
// (/api/auth/* and /api/v1/*), so page.route() intercepts every backend-bound
// call before it reaches the server — the Go backend is never touched.

export const E2E_USER = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@acme.com",
  name: "Admin Acme",
  role: "admin",
  status: "active",
} as const;

function json(route: Route, status: number, body: unknown, headers?: Record<string, string>) {
  return route.fulfill({
    status,
    contentType: "application/json",
    headers,
    body: JSON.stringify(body),
  });
}

// Public branding lookup fired by ThemeProvider on every page. Routed on all
// tests so it never falls through to the (absent) backend.
export async function mockBranding(page: Page) {
  await page.route("**/api/v1/branding/host**", (route) =>
    json(route, 200, {
      company_id: E2E_USER.id,
      logo_url: "",
      favicon_url: "",
      primary_color: "#4f46e5",
      secondary_color: "#6366f1",
      email_sender_name: "",
    }),
  );
}

// Successful login: returns the user AND sets the access cookie via Set-Cookie
// so the edge middleware lets the dashboard render after redirect.
export async function mockLoginSuccess(page: Page) {
  await page.route("**/api/auth/login", (route) =>
    json(
      route,
      200,
      { user: E2E_USER },
      { "set-cookie": "lumia_access=e2e-token; Path=/; SameSite=Lax" },
    ),
  );
}

// Failed login: backend-style error envelope, no cookie.
export async function mockLoginError(
  page: Page,
  status = 401,
  message = "invalid credentials",
) {
  await page.route("**/api/auth/login", (route) =>
    json(route, status, { error: "Unauthorized", message, code: "unauthorized" }),
  );
}

// Everything the dashboard shell fetches once authenticated, so it renders
// cleanly without a backend.
export async function mockAuthedSession(page: Page) {
  await page.route("**/api/v1/auth/me", (route) => json(route, 200, E2E_USER));
  await page.route("**/api/realtime-token", (route) =>
    json(route, 200, { token: "e2e-token" }),
  );
  await page.route("**/api/v1/channels", (route) =>
    json(route, 200, { channels: [] }),
  );
  await page.route("**/api/v1/agents", (route) =>
    json(route, 200, { agents: [] }),
  );
  await page.route("**/api/v1/knowledge-bases", (route) =>
    json(route, 200, { knowledge_bases: [] }),
  );
  await page.route("**/api/v1/conversations**", (route) =>
    json(route, 200, { conversations: [] }),
  );
}
