import { defineConfig, devices } from "@playwright/test";

// E2E config. Tests live in ./e2e and run against the Next dev server, which
// Playwright boots automatically. The browser-level page.route() interception
// in the specs isolates the frontend from the Go backend entirely.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 1 local retry absorbs Firefox's headless-GL flakiness in sandboxed envs.
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? "github" : "list",
  timeout: 45_000,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // WebKit needs extra system libs (libicu/libxml2/libflite) installed via
  // `sudo npx playwright install-deps webkit`. Set SKIP_WEBKIT=1 to run only
  // Chromium + Firefox where those libs are unavailable.
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    ...(process.env.SKIP_WEBKIT
      ? []
      : [{ name: "webkit", use: { ...devices["Desktop Safari"] } }]),
  ],

  // Production build (build once, then start) — routes are precompiled, so
  // there's no on-demand dev compilation thrashing under parallel load (which
  // caused setup/navigation timeouts). Override with PW_DEV=1 for the dev server.
  webServer: {
    command: process.env.PW_DEV ? "npm run dev" : "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
