"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/lib/api/auth";
import { billingService } from "@/lib/api/billing";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { refresh } = useAuth();

  // Funnel B: a `?plan=<code>` arriving from the landing pricing means the user
  // wants to subscribe immediately after creating the account.
  const plan = params.get("plan");

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  function onCompanyName(v: string) {
    setCompanyName(v);
    if (!slugTouched) setSlug(slugify(v));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signup({
        company_name: companyName,
        slug,
        email,
        password,
        name,
      });
      refresh();

      // Funnel B: jump straight to Stripe checkout for the chosen plan. The
      // signup already set the session cookie, so the proxied call is authed.
      if (plan) {
        try {
          const { checkout_url } = await billingService.checkout({
            plan_code: plan,
          });
          window.location.href = checkout_url;
          return;
        } catch (err) {
          toast.error(
            err instanceof ApiClientError
              ? err.message
              : "Conta criada, mas não foi possível iniciar o checkout.",
          );
          router.replace("/dashboard/billing");
          return;
        }
      }
      router.replace("/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Falha no registo";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <h2 className="mb-1 text-lg font-semibold">Criar empresa</h2>
        {plan && (
          <p className="mb-3 rounded-lg bg-brand/10 px-3 py-2 text-sm text-brand">
            Plano selecionado: <strong className="capitalize">{plan}</strong> — após
            criar a conta segue para o pagamento.
          </p>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Nome da empresa">
            <Input
              required
              value={companyName}
              onChange={(e) => onCompanyName(e.target.value)}
              placeholder="Acme Lda."
            />
          </Field>
          <Field label="Slug" hint="Identificador único (a-z, 0-9, hífen).">
            <Input
              required
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="acme"
            />
          </Field>
          <hr className="border-slate-100" />
          <Field label="O seu nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="E-mail (admin)">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Palavra-passe" hint="Mínimo 8 caracteres.">
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            {plan ? "Criar conta e assinar" : "Criar conta"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
