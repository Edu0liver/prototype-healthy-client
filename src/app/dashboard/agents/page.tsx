"use client";

import { Bot, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { useAgents, useCreateAgent } from "@/lib/hooks/useAgents";

export default function AgentsPage() {
  const { data, isLoading, isError, refetch } = useAgents();
  const create = useCreateAgent();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name,
        system_prompt: prompt,
        model,
        status: "active",
      });
      toast.success("Agente criado");
      setOpen(false);
      setName("");
      setPrompt("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  return (
    <div>
      <PageHeader
        title="Agentes"
        description="Personas de IA com prompt, modelo e bases de conhecimento."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo agente
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Bot size={32} />}
          title="Sem agentes"
          description="Crie o seu primeiro agente de IA."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Novo agente
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <Link key={a.id} href={`/dashboard/agents/${a.id}`}>
              <Card className="group h-full transition duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardBody>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition duration-200 group-hover:bg-brand group-hover:text-brand-fg">
                        <Bot size={16} />
                      </span>
                      <span className="truncate font-medium text-slate-900 dark:text-slate-100">
                        {a.name}
                      </span>
                    </div>
                    <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {a.system_prompt}
                  </p>
                  <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">
                    {a.model}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo agente">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Assistente de vendas"
            />
          </Field>
          <Field label="Prompt de sistema">
            <Textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Você é um assistente prestável que…"
            />
          </Field>
          <Field label="Modelo">
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o-mini"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending}>
              Criar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
