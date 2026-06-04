"use client";

import { Plus, Radio } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { useChannels, useCreateChannel } from "@/lib/hooks/useChannels";
import type { ChannelType } from "@/types/enums";

export default function ChannelsPage() {
  const { data, isLoading, isError, refetch } = useChannels();
  const create = useCreateChannel();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ChannelType>("whatsapp");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ type, name, number });
      toast.success("Canal criado");
      setOpen(false);
      setName("");
      setNumber("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  return (
    <div>
      <PageHeader
        title="Canais"
        description="Ligações WhatsApp e Instagram do seu atendimento."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Novo canal
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Radio size={32} />}
          title="Sem canais"
          description="Crie um canal e ligue o seu número WhatsApp."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Novo canal
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((ch) => (
            <Link key={ch.id} href={`/dashboard/channels/${ch.id}`}>
              <Card className="transition hover:shadow-md">
                <CardBody>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {ch.name || ch.external_account_id || "Canal"}
                    </span>
                    <Badge tone={statusTone(ch.status)}>{ch.status}</Badge>
                  </div>
                  <p className="text-sm capitalize text-slate-500">{ch.type}</p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} title="Novo canal">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Tipo">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as ChannelType)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
            </Select>
          </Field>
          <Field label="Nome">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Atendimento principal"
            />
          </Field>
          <Field
            label="Número (E.164)"
            hint="Opcional. Ex.: 5511999999999"
          >
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="5511999999999"
            />
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
