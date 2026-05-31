// Runs after the test framework is set up (per-file). Wires jest-dom matchers
// and the MSW server lifecycle so every test gets mocked network by default.
import "@testing-library/jest-dom";

import { server } from "./tests/mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
