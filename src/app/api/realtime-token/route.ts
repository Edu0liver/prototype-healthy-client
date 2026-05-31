import { NextResponse } from "next/server";

import { getAccessToken } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// GET /api/realtime-token — mints a short-lived ticket for the WebSocket
// handshake. The backend /ws endpoint takes the JWT as a query param (browsers
// cannot set headers on WS). Since the token is httpOnly, the browser asks the
// server for it here just before opening the socket. Exposure is momentary and
// only at connect time.
export async function GET() {
  const token = getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ token });
}
