"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { authService } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthContext";

function AcceptInviteForm() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const { refresh } = useAuth();

  const [token, setToken] = useState(params.get("token") ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.acceptInvite({ token, password });
      toast.success("Convite aceite!");
      if (res.authenticated) {
        refresh();
        router.replace("/");
      } else {
        router.replace("/login");
      }
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : "Token inválido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardBody>
        <h2 className="mb-4 text-lg font-semibold">Aceitar convite</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Token do convite">
            <Input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </Field>
          <Field label="Defina a palavra-passe" hint="Mínimo 8 caracteres.">
            <Input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading} className="w-full">
            Ativar conta
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteForm />
    </Suspense>
  );
}
