"use client";

import {
  Bot,
  Check,
  ChevronDown,
  Library,
  MessagesSquare,
  Plug,
  Radio,
  Sparkles,
  UserCog,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
  {
    icon: Plug,
    title: "White-label",
    desc: "Domínio próprio, cores e logótipo da sua marca em todo o painel.",
  },
];

const STEPS = [
  {
    icon: Plug,
    title: "Conecte o canal",
    desc: "Ligue o WhatsApp ou Instagram via QR code em segundos.",
  },
  {
    icon: Library,
    title: "Alimente o conhecimento",
    desc: "Carregue documentos; a IA indexa e responde com base neles.",
  },
  {
    icon: Zap,
    title: "Deixe a IA atender",
    desc: "Respostas automáticas 24/7, com handover humano quando preciso.",
  },
];

const FAQS = [
  {
    q: "Preciso de cartão de crédito para começar?",
    a: "Sim, a subscrição é ativada via Stripe. Não há fidelização — cancela quando quiser, sem multas.",
  },
  {
    q: "A IA pode falar com um humano quando necessário?",
    a: "Sim. O handover é automático por palavra-chave ou pedido do contacto, e a IA cala-se assim que um operador assume a conversa.",
  },
  {
    q: "Os meus dados ficam isolados de outras empresas?",
    a: "Totalmente. Cada empresa tem isolamento multi-tenant a nível de base de dados (RLS) e de aplicação. Ninguém vê os seus dados.",
  },
  {
    q: "Posso usar a minha própria marca?",
    a: "Sim. A plataforma é white-label: domínio próprio, logótipo e paleta de cores configuráveis.",
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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center"
        >
          <div className="h-[520px] w-[760px] rounded-full bg-gradient-to-tr from-brand/25 via-brand-secondary/15 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="text-center lg:text-left">
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-sm font-medium text-brand">
              <Sparkles size={14} />
              Atendimento com IA + RAG, white-label
            </span>
            <h1 className="animate-fade-up mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Atendimento com IA no seu{" "}
              <span className="bg-gradient-to-r from-brand to-brand-secondary bg-clip-text text-transparent">
                WhatsApp e Instagram
              </span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 lg:mx-0">
              Agentes de IA fundamentados no conhecimento da sua empresa,
              handover humano e tudo em tempo real. Multi-tenant e white-label.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link href="#pricing" className="w-full sm:w-auto">
                <Button className="h-12 w-full px-7 text-base sm:w-auto">
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

          {/* Stylized chat preview (decorative product mock). */}
          <div
            aria-hidden
            className="animate-fade-up relative mx-auto hidden w-full max-w-md lg:block"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Bot size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Agente Lumia
                  </p>
                  <p className="flex items-center gap-1 text-xs text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    online
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2 text-sm text-slate-700">
                  Olá! Qual o prazo de entrega para São Paulo?
                </div>
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand px-3.5 py-2 text-sm text-brand-fg">
                  Para São Paulo capital, o prazo é de 2 a 3 dias úteis. Quer que
                  eu calcule o frete para o seu CEP?
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-3.5 py-2 text-sm text-slate-700">
                  Sim, 01310-100
                </div>
              </div>
            </div>
            <div className="absolute -right-4 -top-4 -z-10 h-24 w-24 rounded-full bg-brand/20 blur-2xl" />
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-slate-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 text-center sm:grid-cols-4">
          {[
            ["24/7", "Atendimento automático"],
            ["2 canais", "WhatsApp + Instagram"],
            ["Tempo real", "WebSocket no painel"],
            ["RLS", "Isolamento multi-tenant"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-bold text-slate-900">
                {stat}
              </p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50/60 py-20">
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

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Comece em 3 passos
          </h2>
          <p className="mt-3 text-slate-600">
            Do canal ligado à IA a atender, em minutos.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-brand-fg shadow-lg shadow-brand/20">
                <s.icon size={24} />
              </div>
              <span className="mt-4 inline-block font-display text-sm font-semibold text-brand">
                Passo {i + 1}
              </span>
              <h3 className="mt-1 font-display text-lg font-semibold text-slate-900">
                {s.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-slate-600">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
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
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-bold text-slate-900">
            Perguntas frequentes
          </h2>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-secondary px-8 py-16 text-center shadow-xl shadow-brand/20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <h2 className="font-display text-3xl font-bold text-brand-fg sm:text-4xl">
            Pronto para automatizar o seu atendimento?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-fg/80">
            Ative um plano em minutos e deixe a IA responder pela sua empresa.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup">
              <Button
                variant="secondary"
                className="h-12 bg-white px-7 text-base text-brand hover:bg-white/90"
              >
                Criar conta
              </Button>
            </Link>
            <Link href="#pricing">
              <Button
                variant="outline"
                className="h-12 border-white/40 bg-transparent px-7 text-base text-brand-fg hover:bg-white/10"
              >
                Ver planos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="font-medium text-slate-900">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
          {a}
        </p>
      )}
    </div>
  );
}
