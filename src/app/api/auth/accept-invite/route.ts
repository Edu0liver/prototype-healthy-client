import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { setSession } from "@/lib/server/session";
import type { AcceptInviteRequest, TokenResponse } from "@/types/api";

export const dynamic = "force-dynamic";

// POST /api/auth/accept-invite — sets the invited user's password. If the
// backend returns tokens, we log the user straight in; otherwise the client
// redirects to /login.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as AcceptInviteRequest;

  const res = await backendFetch("/auth/accept-invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const tokens = data as Partial<TokenResponse>;
  if (tokens.access_token && tokens.refresh_token) {
    setSession(tokens.access_token, tokens.refresh_token);
    return NextResponse.json({ user: tokens.user, authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}
