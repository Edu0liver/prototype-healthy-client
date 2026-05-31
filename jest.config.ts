import type { Config } from "jest";
import nextJest from "next/jest.js";

// next/jest wires up the Next.js compiler (SWC), CSS/asset mocks and .env so
// tests run with the same transforms as the app. Official App Router setup.
const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  // polyfills load BEFORE the test framework (needs fetch/Request for MSW v2).
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/tests/**/*.test.{ts,tsx}"],
  // MSW v2 ships browser + node exports; force the node/default condition so
  // jsdom tests use the correct interceptor.
  testEnvironmentOptions: {
    customExportConditions: [""],
    url: "http://localhost:3000",
  },
};

// MSW v2 and its dependencies are ESM-only. next/jest hard-codes
// transformIgnorePatterns (skipping node_modules), so we override it after the
// fact to let SWC transform the MSW dependency subtree.
const ESM_DEPS = [
  "msw",
  "@mswjs",
  "@open-draft",
  "@bundled-es-modules",
  "rettime",
  "outvariant",
  "strict-event-emitter",
  "headers-polyfill",
  "is-node-process",
  "until-async",
  "tough-cookie",
  "graphql",
].join("|");

export default async (): Promise<Config> => {
  const base = await createJestConfig(config)();
  base.transformIgnorePatterns = [
    `/node_modules/(?!.pnpm)(?!(${ESM_DEPS})/)`,
    "^.+\\.module\\.(css|sass|scss)$",
  ];
  return base;
};
