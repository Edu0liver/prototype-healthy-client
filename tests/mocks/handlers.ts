import { http, HttpResponse } from "msw";

import type { TokenResponse, User } from "@/types/api";

// Reusable fixtures.
export const mockUser: User = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "admin@acme.com",
  name: "Admin Acme",
  role: "admin",
  status: "active",
};

export const mockLoginResponse: Pick<TokenResponse, "token_type"> & {
  user: User;
} = {
  token_type: "bearer",
  user: mockUser,
};

// Base handlers — the happy path. Individual tests override these with
// server.use(...) to exercise error scenarios.
export const handlers = [
  // Auth login route handler (Next side returns { user } and sets cookies).
  http.post("/api/auth/login", () =>
    HttpResponse.json({ user: mockUser }, { status: 200 }),
  ),

  // Current user — default to "no session" (401) so AuthProvider stays logged
  // out unless a test opts in.
  http.get("/api/v1/auth/me", () =>
    HttpResponse.json(
      { error: "unauthorized", message: "session expired" },
      { status: 401 },
    ),
  ),

  // Agents list (bonus — for dashboard tests).
  http.get("/api/v1/agents", () => HttpResponse.json({ agents: [] })),
];
