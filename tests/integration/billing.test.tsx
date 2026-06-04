import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import BillingPage from "@/app/(dashboard)/billing/page";
import { server } from "../mocks/server";
import { renderWithProviders } from "../utils/renderWithProviders";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: jest.fn(), push: jest.fn() }),
  useSearchParams: () => ({ get: () => null }),
  usePathname: () => "/billing",
}));

const subscription = {
  plan_code: "pro",
  plan_name: "Pro",
  status: "active",
  billing_cycle: "monthly",
  current_period_start: "2026-06-01T00:00:00Z",
  current_period_end: "2026-07-01T00:00:00Z",
  cancel_at_period_end: false,
  price_cents: 29900,
  currency: "BRL",
};

const usage = {
  period_start: "2026-06-01T00:00:00Z",
  period_end: "2026-07-01T00:00:00Z",
  items: [
    { kind: "ai_message", used: 42, quota: 100, unlimited: false },
    { kind: "llm_tokens", used: 0, quota: 0, unlimited: true },
  ],
};

const plans = {
  plans: [
    { code: "free", name: "Free", price_cents: 0, currency: "BRL", quota_ai_messages: 100, quota_tokens: 50000, quota_audio_minutes: 10, quota_storage_mb: 50, max_channels: 1, max_agents: 1, max_kb: 1, max_seats: 1, purchasable: false },
    { code: "pro", name: "Pro", price_cents: 29900, currency: "BRL", quota_ai_messages: 10000, quota_tokens: 10000000, quota_audio_minutes: 600, quota_storage_mb: 2000, max_channels: 5, max_agents: 10, max_kb: 20, max_seats: 10, purchasable: true },
  ],
};

describe("Billing page", () => {
  beforeEach(() => window.history.pushState({}, "", "/billing"));

  it("renders subscription, usage and plans", async () => {
    server.use(
      http.get("/api/v1/billing/subscription", () => HttpResponse.json(subscription)),
      http.get("/api/v1/billing/usage", () => HttpResponse.json(usage)),
      http.get("/api/v1/billing/plans", () => HttpResponse.json(plans)),
    );

    renderWithProviders(<BillingPage />);

    // Subscription summary (status label is unique; "Pro" also appears in the
    // plan grid, so assert there is at least one occurrence).
    await waitFor(() => expect(screen.getByText("Ativa")).toBeInTheDocument());
    expect(screen.getAllByText("Pro").length).toBeGreaterThan(0);

    // Usage bar labels + a value.
    expect(screen.getByText("Mensagens IA")).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();

    // Plan cards: current plan is flagged.
    await waitFor(() => expect(screen.getByText("Free")).toBeInTheDocument());
    expect(screen.getByText("Plano atual")).toBeInTheDocument();
  });

  it("shows an empty state when the tenant has no subscription (404)", async () => {
    server.use(
      http.get("/api/v1/billing/subscription", () =>
        HttpResponse.json({ error: "not_found", message: "subscription not found" }, { status: 404 }),
      ),
      http.get("/api/v1/billing/usage", () => HttpResponse.json(usage)),
      http.get("/api/v1/billing/plans", () => HttpResponse.json(plans)),
    );

    renderWithProviders(<BillingPage />);

    await waitFor(() =>
      expect(screen.getByText("Sem subscrição ativa")).toBeInTheDocument(),
    );
  });
});
