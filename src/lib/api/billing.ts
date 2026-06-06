import type {
  CheckoutRequest,
  CheckoutResponse,
  Plan,
  PlansList,
  PortalResponse,
  Subscription,
  UsageResponse,
} from "@/types/api";

import { api } from "./client";

export const billingService = {
  getSubscription: () => api.get<Subscription>("/billing/subscription"),
  getUsage: () => api.get<UsageResponse>("/billing/usage"),
  listPlans: () => api.get<PlansList>("/billing/plans").then((r) => r.plans),
  // Public catalogue (no auth) used by the marketing landing pricing.
  listPublicPlans: () => api.get<PlansList>("/plans").then((r) => r.plans),
  checkout: (body: CheckoutRequest) =>
    api.post<CheckoutResponse>("/billing/checkout", body),
  portal: () => api.post<PortalResponse>("/billing/portal", {}),
};

export type { Plan };
