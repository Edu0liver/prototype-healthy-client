"use client";

import { Library, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useCreateKnowledgeBase,
  useKnowledgeBases,
} from "@/lib/hooks/useKnowledge";

export default function KnowledgePage() {
  const { data, isLoading, isError, refetch } = useKnowledgeBases();
  const create = useCreateKnowledgeBase();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await create.mutateAsync({ name, description });
      toast.success("Base criada");
      setOpen(false);
      setName("");
      setDescription("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  return (
    <div>
      <PageHeader
        title="Conhecimento"
        description="Bases RAG que fundamentam as respostas dos agentes."
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Nova base
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Library size={32} />}
          title="Sem bases de conhecimento"
          description="Crie uma base e carregue documentos para o RAG."
          action={
            <Button onClick={() => setOpen(true)}>
              <Plus size={16} /> Nova base
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((kb) => (
            <Link key={kb.id} href={`/dashboard/knowledge/${kb.id}`}>
              <Card className="group h-full transition duration-200 hover:-translate-y-1 hover:shadow-md">
                <CardBody>
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand transition duration-200 group-hover:bg-brand group-hover:text-brand-fg">
                      <Library size={16} />
                    </span>
                    <p className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {kb.name}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                    {kb.description || "Sem descrição"}
                  </p>
                  <p className="mt-2 font-mono text-xs text-slate-400 dark:text-slate-500">
                    {kb.embedding_model || "text-embedding-3-small"}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nova base de conhecimento"
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nome">
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Descrição">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
