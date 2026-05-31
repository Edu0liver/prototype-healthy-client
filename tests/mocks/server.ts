import { setupServer } from "msw/node";

import { handlers } from "./handlers";

// Node-side MSW server shared across the suite (started in jest.setup.ts).
export const server = setupServer(...handlers);
