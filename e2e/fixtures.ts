import { test as base, expect } from "@playwright/test";

import { E2E_USER, installMockBackend, seedCookie } from "./utils/mockApi";

// `test` — mock backend installed, no session. Use for auth flows (login/signup)
// that drive authentication themselves.
export const test = base.extend({
  page: async ({ page }, use) => {
    await installMockBackend(page);
    await use(page);
  },
});

// `authedTest` — mock backend + a seeded auth cookie, so specs can deep-link
// straight into any dashboard page past the edge middleware.
export const authedTest = base.extend({
  context: async ({ context }, use) => {
    await seedCookie(context);
    await use(context);
  },
  page: async ({ page }, use) => {
    await installMockBackend(page);
    await use(page);
  },
});

export { expect, E2E_USER };
