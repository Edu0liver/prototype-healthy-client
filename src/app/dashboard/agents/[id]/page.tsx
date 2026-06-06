"use client";

import { ArrowLeft, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useAgent,
  useAgentKnowledgeBases,
  useDeleteAgent,
  useLinkKnowledgeBase,
  useUpdateAgent,
} from "@/lib/hooks/useAgents";
import { useKnowledgeBases } from "@/lib/hooks/useKnowledge";
import type { UpdateAgentRequest } from "@/types/api";

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();

  const { data: agent, isLoading, isError, refetch } = useAgent(id);
  const update = useUpdateAgent(id);
  const remove = useDeleteAgent();

  const allKbs = useKnowledgeBases();
  const linkedKbs = useAgentKnowledgeBases(id);
  const link = useLinkKnowledgeBase(id);

  const [form, setForm] = useState<UpdateAgentRequest>({});

  useEffect(() => {
    if (agent) {
      setForm({
        name: agent.name,
        system_prompt: agent.system_prompt,
        model: agent.model,
        temperature: agent.temperature,
        max_output_tokens: agent.max_output_tokens,
        handover_enabled: agent.handover_enabled,
        handover_keywords: agent.handover_keywords ?? [],
        status: agent.status,
      });
    }
  }, [agent]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync(form);
      toast.success("Agente atualizado");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  async function del() {
    if (!confirm("Eliminar este agente?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Agente eliminado");
      router.push("/dashboard/agents");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  if (isLoading) return <Loading />;
  if (isError || !agent) return <ErrorState onRetry={() => refetch()} />;

  const linkedIds = new Set(linkedKbs.data?.map((k) => k.id));

  return (
    <div>
      <Link
        href="/dashboard/agents"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Agentes
      </Link>
      <PageHeader
        title={agent.name}
        action={
          <Button variant="danger" onClick={del} loading={remove.isPending}>
            <Trash2 size={16} /> Eliminar
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={save} className="space-y-4">
              <Field label="Nome">
                <Input
                  value={form.name ?? ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field
                label="Prompt de sistema"
                hint="Editável em produção — aplica-se às próximas mensagens."
              >
                <Textarea
                  className="min-h-[160px]"
                  value={form.system_prompt ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, system_prompt: e.target.value })
                  }
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Modelo">
                  <Input
                    value={form.model ?? ""}
                    onChange={(e) => setForm({ ...form, model: e.target.value })}
                  />
                </Field>
                <Field label="Estado">
                  <Select
                    value={form.status ?? "active"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as "active" | "draft",
                      })
                    }
                  >
                    <option value="active">Ativo</option>
                    <option value="draft">Rascunho</option>
                  </Select>
                </Field>
                <Field label="Temperatura (0–2)">
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={2}
                    value={form.temperature ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, temperature: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label="Máx. tokens de saída">
                  <Input
                    type="number"
                    min={1}
                    value={form.max_output_tokens ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_output_tokens: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Palavras-gatilho de handover (separadas por vírgula)">
                <Input
                  value={(form.handover_keywords ?? []).join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      handover_keywords: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.handover_enabled ?? false}
                  onChange={(e) =>
                    setForm({ ...form, handover_enabled: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-slate-300 accent-brand"
                />
                Permitir transferência para humano (handover)
              </label>
              <div className="flex justify-end">
                <Button type="submit" loading={update.isPending}>
                  Guardar
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bases de conhecimento</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2">
            {allKbs.isLoading ? (
              <Loading label="A carregar bases…" />
            ) : !allKbs.data || allKbs.data.length === 0 ? (
              <p className="text-sm text-slate-500">
                Sem bases. Crie em Conhecimento.
              </p>
            ) : (
              allKbs.data.map((kb) => {
                const linked = linkedIds.has(kb.id);
                return (
                  <button
                    key={kb.id}
                    type="button"
                    disabled={link.isPending}
                    onClick={() => link.mutate({ kbId: kb.id, link: !linked })}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition disabled:opacity-60 ${
                      linked
                        ? "border-brand/30 bg-brand/5 text-slate-900"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="truncate">{kb.name}</span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition ${
                        linked
                          ? "bg-brand text-brand-fg"
                          : "border border-slate-300 bg-white"
                      }`}
                    >
                      {linked && <Check size={13} />}
                    </span>
                  </button>
                );
              })
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
