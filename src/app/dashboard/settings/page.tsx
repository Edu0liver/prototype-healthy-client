"use client";

import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useAddDomain,
  useBranding,
  useDomains,
  useUpdateBranding,
} from "@/lib/hooks/useTenant";

type Tab = "branding" | "domains";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("branding");

  return (
    <RoleGuard roles={["admin"]}>
      <PageHeader
        title="Definições"
        description="White-label e domínios."
      />
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {(
          [
            ["branding", "Branding"],
            ["domains", "Domínios"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={
              tab === key
                ? "border-b-2 border-brand px-4 py-2 text-sm font-medium text-brand"
                : "px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-800"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "branding" && <BrandingTab />}
      {tab === "domains" && <DomainsTab />}
    </RoleGuard>
  );
}

function BrandingTab() {
  const { data, isLoading } = useBranding();
  const update = useUpdateBranding();
  const toast = useToast();
  const [form, setForm] = useState({
    logo_url: "",
    favicon_url: "",
    primary_color: "",
    secondary_color: "",
    email_sender_name: "",
  });

  useEffect(() => {
    if (data)
      setForm({
        logo_url: data.logo_url ?? "",
        favicon_url: data.favicon_url ?? "",
        primary_color: data.primary_color ?? "",
        secondary_color: data.secondary_color ?? "",
        email_sender_name: data.email_sender_name ?? "",
      });
  }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync(form);
      toast.success("Branding atualizado");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  if (isLoading) return <Loading />;

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Identidade visual</CardTitle>
      </CardHeader>
      <CardBody>
        <form onSubmit={save} className="space-y-4">
          <Field label="URL do logótipo">
            <Input
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://…/logo.png"
            />
          </Field>
          <Field label="URL do favicon">
            <Input
              value={form.favicon_url}
              onChange={(e) =>
                setForm({ ...form, favicon_url: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cor primária (hex)">
              <div className="flex gap-2">
                <Input
                  value={form.primary_color}
                  onChange={(e) =>
                    setForm({ ...form, primary_color: e.target.value })
                  }
                  placeholder="#4f46e5"
                />
                <input
                  type="color"
                  value={form.primary_color || "#4f46e5"}
                  onChange={(e) =>
                    setForm({ ...form, primary_color: e.target.value })
                  }
                  className="h-10 w-12 rounded border border-slate-300"
                />
              </div>
            </Field>
            <Field label="Cor secundária (hex)">
              <div className="flex gap-2">
                <Input
                  value={form.secondary_color}
                  onChange={(e) =>
                    setForm({ ...form, secondary_color: e.target.value })
                  }
                  placeholder="#6366f1"
                />
                <input
                  type="color"
                  value={form.secondary_color || "#6366f1"}
                  onChange={(e) =>
                    setForm({ ...form, secondary_color: e.target.value })
                  }
                  className="h-10 w-12 rounded border border-slate-300"
                />
              </div>
            </Field>
          </div>
          <Field label="Nome do remetente de e-mail">
            <Input
              value={form.email_sender_name}
              onChange={(e) =>
                setForm({ ...form, email_sender_name: e.target.value })
              }
            />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" loading={update.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function DomainsTab() {
  const { data, isLoading } = useDomains();
  const add = useAddDomain();
  const toast = useToast();
  const [domain, setDomain] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await add.mutateAsync({ domain, is_primary: isPrimary });
      toast.success("Domínio adicionado");
      setDomain("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar domínio</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={submit} className="flex items-end gap-3">
            <div className="flex-1">
              <Field label="Domínio">
                <Input
                  required
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="painel.empresa.com"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
              />
              Principal
            </label>
            <Button type="submit" loading={add.isPending} className="mb-0.5">
              Adicionar
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Domínios</CardTitle>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Loading />
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-slate-500">Sem domínios.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm">{d.domain}</span>
                  <div className="flex items-center gap-2">
                    {d.is_primary && <Badge tone="blue">Principal</Badge>}
                    <Badge tone={d.verified_at ? "green" : "amber"}>
                      {d.verified_at ? "Verificado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
