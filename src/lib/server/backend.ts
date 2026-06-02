import { NextRequest, NextResponse } from "next/server";

import type { TokenResponse } from "@/types/api";

import { API_BASE } from "./config";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setSession,
} from "./session";

// Low-level call to the Go backend. `path` starts with "/" (e.g. "/auth/login").
export async function backendFetch(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

// Attempts to refresh the access token using the refresh cookie. On success
// the new tokens are written to cookies and the access token is returned.
async function tryRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await backendFetch("/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    clearSession();
    return null;
  }
  const data = (await res.json()) as TokenResponse;
  setSession(data.access_token, data.refresh_token);
  return data.access_token;
}

// Builds a NextResponse mirroring an upstream backend Response (status, body,
// content-type). Used by the generic proxy route.
async function mirror(res: Response): Promise<NextResponse> {
  // HTTP spec (and Node.js 18+) forbids a body on null-body status codes.
  if (res.status === 204 || res.status === 304 || res.status === 101 || res.status === 103) {
    return new NextResponse(null, { status: res.status });
  }
  const contentType = res.headers.get("content-type") ?? "";
  const buf = await res.arrayBuffer();
  const out = new NextResponse(buf, { status: res.status });
  if (contentType) out.headers.set("content-type", contentType);
  return out;
}

// Proxies an incoming browser request to the backend, injecting the Bearer
// token from the cookie and transparently refreshing on a 401 (one retry).
export async function proxyToBackend(
  req: NextRequest,
  pathSegments: string[],
): Promise<NextResponse> {
  const path = "/" + pathSegments.join("/");
  const search = req.nextUrl.search; // preserves query (?state=, ?host=, ...)
  const target = `${path}${search}`;

  // Read body once (handles JSON and multipart uploads alike).
  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const access = getAccessToken();

  const doFetch = (token?: string) =>
    backendFetch(
      target,
      { method, body, headers: new Headers(headers) },
      token,
    );

  let res = await doFetch(access);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doFetch(refreshed);
    } else {
      // Refresh failed/absent — surface 401 so the client redirects to login.
      const out = NextResponse.json(
        { error: "unauthorized", message: "session expired" },
        { status: 401 },
      );
      return out;
    }
  }

  return mirror(res);
}
