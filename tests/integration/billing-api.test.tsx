import { http, HttpResponse } from "msw";

import { billingService } from "@/lib/api/billing";
import { ApiClientError } from "@/lib/api/client";
import { server } from "../mocks/server";

describe("billingService route calls", () => {
  it("GET /billing/subscription", async () => {
    let hit = "";
    server.use(
      http.get("/api/v1/billing/subscription", ({ request }) => {
        hit = new URL(request.url).pathname;
        return HttpResponse.json({ plan_code: "pro", status: "active" });
      }),
    );
    const sub = await billingService.getSubscription();
    expect(hit).toBe("/api/v1/billing/subscription");
    expect(sub.plan_code).toBe("pro");
  });

  it("GET /billing/usage", async () => {
    server.use(
      http.get("/api/v1/billing/usage", () =>
        HttpResponse.json({ period_start: "", period_end: "", items: [] }),
      ),
    );
    const usage = await billingService.getUsage();
    expect(Array.isArray(usage.items)).toBe(true);
  });

  it("GET /billing/plans unwraps the plans array", async () => {
    server.use(
      http.get("/api/v1/billing/plans", () =>
        HttpResponse.json({ plans: [{ code: "free" }, { code: "pro" }] }),
      ),
    );
    const plans = await billingService.listPlans();
    expect(plans).toHaveLength(2);
    expect(plans[1].code).toBe("pro");
  });

  it("POST /billing/checkout sends plan_code and returns the url", async () => {
    let body: unknown = null;
    server.use(
      http.post("/api/v1/billing/checkout", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ checkout_url: "https://checkout.stripe.com/x" });
      }),
    );
    const res = await billingService.checkout({ plan_code: "starter" });
    expect(body).toEqual({ plan_code: "starter" });
    expect(res.checkout_url).toContain("checkout.stripe.com");
  });

  it("propagates a 503 (gateway disabled) as ApiClientError", async () => {
    server.use(
      http.post("/api/v1/billing/checkout", () =>
        HttpResponse.json(
          { error: "stripe_disabled", code: "stripe_disabled", message: "off" },
          { status: 503 },
        ),
      ),
    );
    await expect(billingService.checkout({ plan_code: "pro" })).rejects.toBeInstanceOf(
      ApiClientError,
    );
  });
});
