"use client";

import { CreditCard } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { UsageBar } from "@/components/feature/UsageBar";
import { ApiClientError } from "@/lib/api/client";
import {
  useCheckout,
  usePlans,
  useSubscription,
  useUsage,
} from "@/lib/hooks/useBilling";
import type { Plan, Subscription, UsageItem } from "@/types/api";

const STATUS: Record<
  string,
  { tone: "green" | "blue" | "amber" | "red" | "neutral"; label: string }
> = {
  active: { tone: "green", label: "Ativa" },
  trialing: { tone: "blue", label: "Período de teste" },
  past_due: { tone: "amber", label: "Pagamento pendente" },
  suspended: { tone: "red", label: "Suspensa" },
  canceled: { tone: "neutral", label: "Cancelada" },
};

const KIND_LABEL: Record<string, string> = {
  ai_message: "Mensagens IA",
  llm_tokens: "Tokens LLM",
  audio_minutes: "Minutos de áudio",
  storage_mb: "Armazenamento (MB)",
};

function formatPrice(cents: number, currency: string): string {
  if (cents === 0) return "Sob consulta";
  return (
    new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
      cents / 100,
    ) + "/mês"
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

export default function BillingPage() {
  const sub = useSubscription();
  const usage = useUsage();
  const plans = usePlans();
  const checkout = useCheckout();
  const toast = useToast();

  const noSubscription =
    sub.isError && sub.error instanceof ApiClientError && sub.error.status === 404;

  async function subscribe(planCode: string) {
    try {
      await checkout.mutateAsync({ plan_code: planCode });
      // On success the hook redirects to Stripe; nothing else to do.
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro ao iniciar checkout");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturação"
        description="Plano, consumo do período e gestão da subscrição."
      />

      {/* Subscription summary */}
      {sub.isLoading ? (
        <Loading />
      ) : noSubscription ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<CreditCard size={32} />}
              title="Sem subscrição ativa"
              description="Escolha um plano abaixo para ativar a subscrição."
            />
          </CardBody>
        </Card>
      ) : sub.isError ? (
        <ErrorState onRetry={() => sub.refetch()} />
      ) : sub.data ? (
        <SubscriptionCard data={sub.data} />
      ) : null}

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Consumo do período</CardTitle>
        </CardHeader>
        <CardBody>
          {usage.isLoading ? (
            <Loading />
          ) : usage.isError ? (
            <ErrorState onRetry={() => usage.refetch()} />
          ) : usage.data && usage.data.items.length > 0 ? (
            <div className="space-y-4">
              {usage.data.items.map((item: UsageItem) => (
                <UsageBar
                  key={item.kind}
                  label={KIND_LABEL[item.kind] ?? item.kind}
                  used={item.used}
                  quota={item.quota}
                  unlimited={item.unlimited}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Sem consumo no período.</p>
          )}
        </CardBody>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Planos</h2>
        {plans.isLoading ? (
          <Loading />
        ) : plans.isError ? (
          <ErrorState onRetry={() => plans.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(plans.data ?? []).map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                current={sub.data?.plan_code === plan.code}
                pending={checkout.isPending}
                onSubscribe={() => subscribe(plan.code)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SubscriptionCard({ data }: { data: Subscription }) {
  const s = STATUS[data.status] ?? { tone: "neutral" as const, label: data.status };
  return (
    <Card>
      <CardBody className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">
              {data.plan_name}
            </span>
            <Badge tone={s.tone}>{s.label}</Badge>
            {data.cancel_at_period_end && (
              <Badge tone="amber">Cancela no fim do período</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {formatPrice(data.price_cents, data.currency)} · período{" "}
            {formatDate(data.current_period_start)} →{" "}
            {formatDate(data.current_period_end)}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function PlanCard({
  plan,
  current,
  pending,
  onSubscribe,
}: {
  plan: Plan;
  current: boolean;
  pending: boolean;
  onSubscribe: () => void;
}) {
  return (
    <Card className={current ? "ring-2 ring-brand" : undefined}>
      <CardBody className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">{plan.name}</span>
          {current && <Badge tone="green">Atual</Badge>}
        </div>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {formatPrice(plan.price_cents, plan.currency)}
        </p>
        <ul className="mt-3 flex-1 space-y-1 text-xs text-slate-500">
          <li>{plan.quota_ai_messages || "∞"} mensagens IA</li>
          <li>{plan.max_channels || "∞"} canais · {plan.max_agents || "∞"} agentes</li>
          <li>{plan.max_kb || "∞"} bases · {plan.max_seats || "∞"} operadores</li>
        </ul>
        <Button
          className="mt-4 w-full"
          variant={current ? "secondary" : "primary"}
          disabled={current || !plan.purchasable || pending}
          onClick={onSubscribe}
        >
          {current ? "Plano atual" : plan.purchasable ? "Assinar" : "Indisponível"}
        </Button>
      </CardBody>
    </Card>
  );
}
