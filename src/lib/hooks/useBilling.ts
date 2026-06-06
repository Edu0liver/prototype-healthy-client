"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { billingService } from "@/lib/api/billing";
import type { CheckoutRequest } from "@/types/api";

import { qk } from "./keys";

export function useSubscription() {
  return useQuery({
    queryKey: qk.subscription,
    queryFn: billingService.getSubscription,
    // 404 (no subscription yet) is an expected state, not a retryable error.
    retry: false,
  });
}

export function useUsage() {
  return useQuery({ queryKey: qk.usage, queryFn: billingService.getUsage });
}

export function usePlans() {
  return useQuery({ queryKey: qk.plans, queryFn: billingService.listPlans });
}

// usePublicPlans powers the marketing landing pricing (no auth required).
export function usePublicPlans() {
  return useQuery({
    queryKey: qk.publicPlans,
    queryFn: billingService.listPublicPlans,
  });
}

// useCheckout starts a Stripe Checkout Session and redirects the browser to the
// hosted payment page on success.
export function useCheckout() {
  return useMutation({
    mutationFn: (body: CheckoutRequest) => billingService.checkout(body),
    onSuccess: (res) => {
      if (res.checkout_url) window.location.href = res.checkout_url;
    },
  });
}

// usePortal opens the Stripe Billing Portal (upgrade/downgrade/cancel/invoices).
export function usePortal() {
  return useMutation({
    mutationFn: () => billingService.portal(),
    onSuccess: (res) => {
      if (res.portal_url) window.location.href = res.portal_url;
    },
  });
}
