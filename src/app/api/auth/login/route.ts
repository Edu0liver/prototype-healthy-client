import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { setSession } from "@/lib/server/session";
import type { LoginRequest, TokenResponse } from "@/types/api";

export const dynamic = "force-dynamic";

// POST /api/auth/login — exchanges credentials for httpOnly cookies. The tokens
// never reach the browser; only the user object is returned.
export async function POST(req: NextRequest) {
  const body = (await req.json()) as LoginRequest;

  const res = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json(data, { status: res.status });
  }

  const tokens = data as TokenResponse;
  setSession(tokens.access_token, tokens.refresh_token);
  return NextResponse.json({ user: tokens.user });
}
