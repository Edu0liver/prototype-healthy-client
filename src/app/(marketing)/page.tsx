"use client";

import {
  Bot,
  Check,
  Library,
  MessagesSquare,
  Radio,
  Sparkles,
  UserCog,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ErrorState, Loading } from "@/components/ui/states";
import { usePublicPlans } from "@/lib/hooks/useBilling";
import type { Plan } from "@/types/api";

const FEATURES = [
  {
    icon: Bot,
    title: "Agentes de IA com RAG",
    desc: "Respostas fundamentadas na base de conhecimento da sua empresa, sem alucinações.",
  },
  {
    icon: Radio,
    title: "Omnicanal",
    desc: "WhatsApp (Evolution) e Instagram numa só camada de orquestração.",
  },
  {
    icon: UserCog,
    title: "Handover humano",
    desc: "Transição fluida IA ↔ operador; a IA cala-se quando o humano assume.",
  },
  {
    icon: MessagesSquare,
    title: "Tempo real",
    desc: "Conversas e estados em tempo real via WebSocket no painel.",
  },
  {
    icon: Library,
    title: "Base de conhecimento",
    desc: "Upload de PDF/DOCX/texto, chunking e embeddings automáticos (pgvector).",
  },
];

function formatPrice(cents: number, currency: string): string {
  // price 0 = custom/enterprise plan (no Free tier exists).
  if (cents === 0) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    cents / 100,
  );
}

function planCta(plan: Plan): { label: string; href: string } {
  // Custom/enterprise (price 0 or not self-serve purchasable) → talk to sales.
  if (plan.code === "enterprise")
    return { label: "Falar com vendas", href: "mailto:vendas@lumia.app" };
  return { label: "Assinar", href: `/signup?plan=${plan.code}` };
}

function quota(n: number, suffix: string): string {
  return n > 0
    ? `${new Intl.NumberFormat("pt-BR").format(n)} ${suffix}`
    : `${suffix} ilimitado`;
}

export default function LandingPage() {
  const plans = usePublicPlans();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient glow (purely decorative → aria-hidden). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
        >
          <div className="h-[480px] w-[680px] rounded-full bg-gradient-to-tr from-brand/25 via-brand-secondary/15 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-sm font-medium text-brand">
            <Sparkles size={14} />
            Atendimento com IA + RAG, white-label
          </span>
          <h1 className="animate-fade-up mx-auto mt-6 max-w-3xl font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Atendimento automatizado com IA, no seu{" "}
            <span className="bg-gradient-to-r from-brand to-brand-secondary bg-clip-text text-transparent">
              WhatsApp e Instagram
            </span>
          </h1>
          <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            Plataforma multi-tenant white-label: agentes de IA com RAG sobre o
            conhecimento da sua empresa, handover humano e tudo em tempo real.
          </p>
          <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button size="md" className="h-12 w-full px-7 text-base sm:w-auto">
                Ver planos
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="h-12 w-full px-7 text-base sm:w-auto"
              >
                Entrar
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-400">
            A partir de R$ 14,99/mês · sem fidelização
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Tudo o que precisa para atender melhor
            </h2>
            <p className="mt-3 text-slate-600">
              Uma camada de IA sobre os seus canais, pronta a usar.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card
                key={f.title}
                className="group transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >
                <CardBody>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition duration-200 group-hover:bg-brand group-hover:text-brand-fg">
                    <f.icon size={22} />
                  </div>
                  <h3 className="font-display font-semibold text-slate-900">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Planos
          </h2>
          <p className="mt-3 text-slate-600">
            Escolha um plano e comece em minutos. Sem fidelização.
          </p>
        </div>

        {plans.isLoading ? (
          <Loading />
        ) : plans.isError ? (
          <ErrorState onRetry={() => plans.refetch()} />
        ) : (
          <div className="mx-auto grid max-w-4xl grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...(plans.data ?? [])]
              .sort((a, b) => {
                const order: Record<string, number> = {
                  starter: 0,
                  pro: 1,
                  enterprise: 2,
                };
                return (order[a.code] ?? 99) - (order[b.code] ?? 99);
              })
              .map((plan) => {
                const cta = planCta(plan);
                const highlight = plan.code === "pro";
                return (
                  <Card
                    key={plan.code}
                    className={
                      highlight
                        ? "relative border-brand/30 shadow-lg ring-2 ring-brand lg:-my-2 lg:scale-[1.03]"
                        : "transition duration-200 hover:shadow-md"
                    }
                  >
                    {highlight && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-brand-fg shadow-sm">
                        Mais popular
                      </span>
                    )}
                    <CardBody className="flex h-full flex-col p-6">
                      <span className="font-display text-lg font-semibold text-slate-900">
                        {plan.name}
                      </span>
                      <p className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900">
                        {formatPrice(plan.price_cents, plan.currency)}
                        {plan.price_cents > 0 && (
                          <span className="text-sm font-normal text-slate-400">
                            /mês
                          </span>
                        )}
                      </p>
                      <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-600">
                        <li className="flex gap-2.5">
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-brand"
                          />
                          {quota(plan.quota_ai_messages, "mensagens IA")}
                        </li>
                        <li className="flex gap-2.5">
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-brand"
                          />
                          {quota(plan.max_channels, "canais")} ·{" "}
                          {quota(plan.max_agents, "agentes")}
                        </li>
                        <li className="flex gap-2.5">
                          <Check
                            size={16}
                            className="mt-0.5 shrink-0 text-brand"
                          />
                          {quota(plan.max_kb, "bases")} ·{" "}
                          {quota(plan.max_seats, "operadores")}
                        </li>
                      </ul>
                      <Link href={cta.href} className="mt-8">
                        <Button
                          className="h-11 w-full"
                          variant={highlight ? "primary" : "outline"}
                        >
                          {cta.label}
                        </Button>
                      </Link>
                    </CardBody>
                  </Card>
                );
              })}
          </div>
        )}
      </section>
    </div>
  );
}
