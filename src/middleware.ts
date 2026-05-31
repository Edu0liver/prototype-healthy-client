import { NextRequest, NextResponse } from "next/server";

import { ACCESS_COOKIE } from "@/lib/server/config";

// Route guard. Presence of the access cookie gates the dashboard; its absence
// gates the auth pages. Token *validity* is enforced by the backend on every
// proxied call (with refresh-on-401), so a stale-but-present cookie still lands
// the user inside, where the first API call will refresh or bounce them out.

const AUTH_PATHS = ["/login", "/signup", "/accept-invite"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(ACCESS_COOKIE)?.value);
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    if (hasSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Everything else is protected.
  if (!hasSession) {
    const url = new URL("/login", req.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on all paths except API routes, Next internals and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
