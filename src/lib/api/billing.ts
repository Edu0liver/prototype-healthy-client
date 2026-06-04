import type {
  CheckoutRequest,
  CheckoutResponse,
  Plan,
  PlansList,
  Subscription,
  UsageResponse,
} from "@/types/api";

import { api } from "./client";

export const billingService = {
  getSubscription: () => api.get<Subscription>("/billing/subscription"),
  getUsage: () => api.get<UsageResponse>("/billing/usage"),
  listPlans: () => api.get<PlansList>("/billing/plans").then((r) => r.plans),
  checkout: (body: CheckoutRequest) =>
    api.post<CheckoutResponse>("/billing/checkout", body),
};

export type { Plan };
