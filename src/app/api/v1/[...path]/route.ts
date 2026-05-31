import { NextRequest } from "next/server";

import { proxyToBackend } from "@/lib/server/backend";

// Generic authenticated proxy: every browser call to /api/v1/* is forwarded to
// the Go backend's /api/v1/* with the Bearer token injected from the httpOnly
// cookie. Refresh-on-401 is handled inside proxyToBackend. This covers every
// resource endpoint (agents, channels, conversations, GET /auth/me, ...).

export const dynamic = "force-dynamic";

type Ctx = { params: { path: string[] } };

function handler(req: NextRequest, { params }: Ctx) {
  return proxyToBackend(req, params.path);
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
};
