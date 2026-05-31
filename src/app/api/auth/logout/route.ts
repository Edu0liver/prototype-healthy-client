import { NextResponse } from "next/server";

import { clearSession } from "@/lib/server/session";

export const dynamic = "force-dynamic";

// POST /api/auth/logout — clears the auth cookies.
export async function POST() {
  clearSession();
  return NextResponse.json({ ok: true });
}
