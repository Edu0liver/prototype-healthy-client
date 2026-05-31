"use client";

import { Plug, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { useAgents } from "@/lib/hooks/useAgents";
import {
  useAutomations,
  useCreateAutomation,
  useDeleteAutomation,
  useUpdateAutomation,
} from "@/lib/hooks/useAutomations";
import { useChannels } from "@/lib/hooks/useChannels";

export default function AutomationsPage() {
  const { data, isLoading, isError, refetch } = useAutomations();
  const channels = useChannels();
  const agents = useAgents();
  const create = useCreateAutomation();
  const update = useUpdateAutomation();
  const remove = useDeleteAutomation();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [fallback, setFallback] = useState("");
  const [debounce, setDebounce] = useState(5);

  const channelName = (id: string) =>
    channels.data?.find((c) => c.id === id)?.name || id.slice(0, 8);
  const agentName = (id: string) =>
    agents.data?.find((a) => a.id === id)?.name || id.slice(0, 8);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({
        channel_id: channelId,
        agent_id: agentId,
        is_active: true,
        fallback_message: fallback,
        debounce_seconds: debounce,
      });
      toast.success("Automação criada");
      setOpen(false);
    } catch (err) {
      // The partial unique index rejects a second active automation per channel.
      toast.error(
        err instanceof ApiClientError
          ? err.message
          : "Erro (já existe automação ativa neste canal?)",
      );
    }
  }

  return (
    <div>
      <PageHeader
        title="Automações"
        description="Ligam um canal a um agente. Um agente ativo por canal."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Nova automação
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Plug size={32} />}
          title="Sem automações"
          description="Ligue um canal a um agente para começar a atender."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Nova automação
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {data.map((a) => (
            <Card key={a.id}>
              <CardBody className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Badge tone={a.is_active ? "green" : "neutral"}>
                    {a.is_active ? "Ativa" : "Inativa"}
                  </Badge>
                  <span className="text-sm">
                    <strong>{channelName(a.channel_id)}</strong>
                    {" → "}
                    {agentName(a.agent_id)}
                  </span>
                  <span className="text-xs text-slate-400">
                    debounce {a.debounce_seconds}s
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update.mutate({
                        id: a.id,
                        body: { is_active: !a.is_active },
                      })
                    }
                  >
                    {a.is_active ? "Desativar" : "Ativar"}
                  </Button>
                  <button
                    onClick={() => remove.mutate(a.id)}
                    className="text-slate-400 hover:text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Nova automação">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Canal">
            <Select
              required
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {channels.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id.slice(0, 8)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Agente">
            <Select
              required
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              <option value="">Selecione…</option>
              {agents.data?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mensagem de fallback" hint="Usada se a IA falhar.">
            <Textarea
              value={fallback}
              onChange={(e) => setFallback(e.target.value)}
            />
          </Field>
          <Field label="Debounce (segundos)" hint="0–60. Agrega mensagens em rajada.">
            <Input
              type="number"
              min={0}
              max={60}
              value={debounce}
              onChange={(e) => setDebounce(Number(e.target.value))}
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
