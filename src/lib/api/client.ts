// Browser-side HTTP client. All calls are same-origin to Next route handlers
// (/api/auth/* and /api/v1/*), which attach the Bearer token from the httpOnly
// cookie. The browser therefore never handles tokens directly.

import type { ApiError } from "@/types/api";

export class ApiClientError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

const V1 = "/api/v1";

async function parse(res: Response): Promise<unknown> {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function handle<T>(res: Response): Promise<T> {
  const data = await parse(res);
  if (!res.ok) {
    const err = (data ?? {}) as ApiError;
    // A 401 from the proxy means the session is gone/unrefreshable. Only bounce
    // to /login from the protected dashboard area — public pages (landing,
    // /login, /signup) probe /auth/me and expect a 401 when logged out, which
    // must NOT trigger a redirect.
    if (res.status === 401 && typeof window !== "undefined") {
      const here = window.location.pathname;
      if (here.startsWith("/dashboard")) {
        window.location.href = `/login?next=${encodeURIComponent(here)}`;
      }
    }
    throw new ApiClientError(
      err.message || err.error || res.statusText || "Request failed",
      res.status,
      err.code,
    );
  }
  return data as T;
}

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };
}

// Resource calls (proxied to backend /api/v1/*).
export const api = {
  get: <T>(path: string) =>
    fetch(`${V1}${path}`, { credentials: "same-origin" }).then(handle<T>),
  post: <T>(path: string, body?: unknown) =>
    fetch(`${V1}${path}`, jsonInit("POST", body)).then(handle<T>),
  put: <T>(path: string, body?: unknown) =>
    fetch(`${V1}${path}`, jsonInit("PUT", body)).then(handle<T>),
  patch: <T>(path: string, body?: unknown) =>
    fetch(`${V1}${path}`, jsonInit("PATCH", body)).then(handle<T>),
  del: <T>(path: string) =>
    fetch(`${V1}${path}`, { method: "DELETE", credentials: "same-origin" }).then(
      handle<T>,
    ),
  // Multipart upload (FormData sets its own Content-Type boundary).
  upload: <T>(path: string, form: FormData) =>
    fetch(`${V1}${path}`, {
      method: "POST",
      credentials: "same-origin",
      body: form,
    }).then(handle<T>),
};

// Auth/session calls (Next route handlers that set/clear cookies).
export const authApi = {
  post: <T>(path: string, body?: unknown) =>
    fetch(`/api/auth${path}`, jsonInit("POST", body)).then(handle<T>),
};
