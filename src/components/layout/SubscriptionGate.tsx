"use client";

import { CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Loading } from "@/components/ui/states";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSubscription } from "@/lib/hooks/useBilling";

const ACTIVE = new Set(["active", "trialing"]);

// SubscriptionGate blocks the dashboard when the tenant has no valid plan
// (missing, expired, past_due, canceled or suspended). The billing area itself
// stays reachable so an admin can pay. Mirrors the backend's
// middleware.RequireActiveSubscription / fail-closed quota checks.
export function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isRole } = useAuth();
  const { data, isLoading } = useSubscription();

  // Always let the billing pages through (status + checkout live there).
  if (pathname.startsWith("/dashboard/billing")) return <>{children}</>;
  if (isLoading) return <Loading />;

  if (data && ACTIVE.has(data.status)) return <>{children}</>;

  // Blocked: no valid subscription.
  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardBody className="space-y-3 py-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CreditCard size={24} />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Assinatura inativa
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            A sua assinatura está ausente, expirada ou pendente de pagamento.
            Regularize para continuar a usar a plataforma.
          </p>
          {isRole("admin") ? (
            <Link href="/dashboard/billing" className="inline-block">
              <Button>Ver planos e pagar</Button>
            </Link>
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Contacte o administrador da conta.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
