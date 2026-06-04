"use client";

import { Bot, Check, Library, MessagesSquare, Radio, UserCog } from "lucide-react";
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
  if (cents === 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(
    cents / 100,
  );
}

function planCta(plan: Plan): { label: string; href: string } {
  if (plan.code === "free") return { label: "Começar grátis", href: "/signup" };
  if (plan.code === "enterprise")
    return { label: "Falar com vendas", href: "mailto:vendas@lumia.app" };
  return { label: "Assinar", href: `/signup?plan=${plan.code}` };
}

function quota(n: number, suffix: string): string {
  return n > 0 ? `${new Intl.NumberFormat("pt-BR").format(n)} ${suffix}` : `${suffix} ilimitado`;
}

export default function LandingPage() {
  const plans = usePublicPlans();

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Atendimento automatizado com IA, no seu WhatsApp e Instagram
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Plataforma multi-tenant white-label: agentes de IA com RAG sobre o
          conhecimento da sua empresa, handover humano e tudo em tempo real.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/signup">
            <Button>Criar conta grátis</Button>
          </Link>
          <Link href="#pricing">
            <Button variant="outline">Ver planos</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-slate-100 bg-slate-50/60 py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title}>
              <CardBody>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.desc}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Planos</h2>
          <p className="mt-2 text-slate-600">
            Escolha um plano e comece em minutos. Sem fidelização.
          </p>
        </div>

        {plans.isLoading ? (
          <Loading />
        ) : plans.isError ? (
          <ErrorState onRetry={() => plans.refetch()} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(plans.data ?? []).map((plan) => {
              const cta = planCta(plan);
              const highlight = plan.code === "pro";
              return (
                <Card
                  key={plan.code}
                  className={highlight ? "ring-2 ring-brand" : undefined}
                >
                  <CardBody className="flex h-full flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-900">
                        {plan.name}
                      </span>
                      {highlight && (
                        <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatPrice(plan.price_cents, plan.currency)}
                      {plan.price_cents > 0 && (
                        <span className="text-sm font-normal text-slate-400">
                          /mês
                        </span>
                      )}
                    </p>
                    <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">
                        <Check size={16} className="mt-0.5 text-brand" />
                        {quota(plan.quota_ai_messages, "mensagens IA")}
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="mt-0.5 text-brand" />
                        {quota(plan.max_channels, "canais")} ·{" "}
                        {quota(plan.max_agents, "agentes")}
                      </li>
                      <li className="flex gap-2">
                        <Check size={16} className="mt-0.5 text-brand" />
                        {quota(plan.max_kb, "bases")} ·{" "}
                        {quota(plan.max_seats, "operadores")}
                      </li>
                    </ul>
                    <Link href={cta.href} className="mt-6">
                      <Button
                        className="w-full"
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
