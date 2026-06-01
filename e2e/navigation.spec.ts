import { authedTest as test, expect } from "./fixtures";

// Walks the entire authenticated app via the sidebar, asserting each page
// mounts, then logs out. This is the "traverse the whole app" smoke path.
const PAGES: [string, string][] = [
  ["Conversas", "/conversations"],
  ["Canais", "/channels"],
  ["Agentes", "/agents"],
  ["Conhecimento", "/knowledge"],
  ["Automações", "/automations"],
  ["Definições", "/settings"],
];

test("navigates every section from the sidebar and logs out", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Olá, Admin Acme", { exact: false })).toBeVisible();

  // Scope link clicks to the sidebar — the overview also has stat cards linking
  // to the same routes (e.g. "Conversas"), which would be ambiguous otherwise.
  const sidebar = page.locator("aside");
  for (const [label, path] of PAGES) {
    await sidebar.getByRole("link", { name: label }).click();
    await expect(page).toHaveURL(`http://localhost:3000${path}`);
    await expect(page.getByRole("heading", { name: label })).toBeVisible();
  }

  // Logout (Topbar button, accessible name from title="Sair").
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("unauthenticated deep-link redirects to login", async ({ browser }) => {
  // Fresh context with NO cookie — middleware must bounce to /login.
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto("/agents");
  await expect(page).toHaveURL(/\/login/);
  await ctx.close();
});
