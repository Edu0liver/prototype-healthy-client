/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NOTE: we deliberately do NOT use rewrites() to proxy /api/v1/* to the
  // backend. Auth uses httpOnly cookies, so all backend traffic flows through
  // Next.js route handlers under /api/* (see src/app/api), which read the
  // cookie server-side and inject the Bearer token. The browser never holds
  // a token. The Go backend origin (BACKEND_API_URL) stays server-only.
};

export default nextConfig;
