// Server-only configuration. Never imported by client components — these
// values (backend origin, cookie policy) must not reach the browser bundle.

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:8080";

// All domain endpoints live under /api/v1 on the Go backend.
export const API_BASE = `${BACKEND_API_URL}/api/v1`;

export const ACCESS_COOKIE = "lumia_access";
export const REFRESH_COOKIE = "lumia_refresh";

const isProd = process.env.NODE_ENV === "production";

// httpOnly so JS cannot read the token (XSS hardening); lax so top-level
// navigations carry it. secure only in prod (localhost is http).
export function accessCookieOptions(maxAgeSeconds = 60 * 60 * 24) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function refreshCookieOptions(maxAgeSeconds = 60 * 60 * 24 * 30) {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
