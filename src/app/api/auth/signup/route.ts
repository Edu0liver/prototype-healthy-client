import { NextRequest, NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend";
import { setSession } from "@/lib/server/session";
import type { Company, TokenResponse } from "@/types/api";

export const dynamic = "force-dynamic";

interface SignupBody {
  company_name: string;
  slug: string;
  plan?: string;
  email: string;
  password: string;
  name?: string;
}

// POST /api/auth/signup — bootstraps a new tenant: creates the company, the
// first admin user, then logs in. Three backend calls orchestrated server-side
// so the browser performs a single request and ends up authenticated.
export async function POST(req: NextRequest) {
  const b = (await req.json()) as SignupBody;

  // 1. Create company (public endpoint).
  const companyRes = await backendFetch("/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: b.company_name,
      slug: b.slug,
      plan: b.plan,
      email: b.email,
    }),
  });
  const companyData = await companyRes.json();
  if (!companyRes.ok) {
    return NextResponse.json(companyData, { status: companyRes.status });
  }
  const company = companyData as Company;

  // 2. Register the first admin for that company.
  const regRes = await backendFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id: company.id,
      email: b.email,
      password: b.password,
      name: b.name,
    }),
  });
  if (!regRes.ok) {
    return NextResponse.json(await regRes.json(), { status: regRes.status });
  }

  // 3. Log in to obtain tokens.
  const loginRes = await backendFetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: b.email, password: b.password }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    return NextResponse.json(loginData, { status: loginRes.status });
  }

  const tokens = loginData as TokenResponse;
  setSession(tokens.access_token, tokens.refresh_token);
  return NextResponse.json({ user: tokens.user, company });
}
