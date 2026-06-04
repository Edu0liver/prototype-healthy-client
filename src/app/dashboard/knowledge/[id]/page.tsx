"use client";

import { ArrowLeft, FileText, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useDeleteDocument,
  useDeleteKnowledgeBase,
  useDocuments,
  useKnowledgeBase,
  useUploadFile,
  useUploadText,
} from "@/lib/hooks/useKnowledge";
import { formatDateTime } from "@/lib/utils/format";

export default function KnowledgeBaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const kb = useKnowledgeBase(id);
  const docs = useDocuments(id, true); // poll for indexing status
  const uploadFile = useUploadFile(id);
  const uploadText = useUploadText(id);
  const removeDoc = useDeleteDocument(id);
  const removeKb = useDeleteKnowledgeBase();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile.mutateAsync(file);
      toast.success("Ficheiro enviado — a indexar.");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onText(e: React.FormEvent) {
    e.preventDefault();
    try {
      await uploadText.mutateAsync({ title, content });
      toast.success("Texto enviado — a indexar.");
      setTitle("");
      setContent("");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  async function delKb() {
    if (!confirm("Eliminar esta base e todos os documentos?")) return;
    try {
      await removeKb.mutateAsync(id);
      toast.success("Base eliminada");
      router.push("/dashboard/knowledge");
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Erro");
    }
  }

  if (kb.isLoading) return <Loading />;
  if (kb.isError || !kb.data)
    return <ErrorState onRetry={() => kb.refetch()} />;

  return (
    <div>
      <Link
        href="/dashboard/knowledge"
        className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Conhecimento
      </Link>
      <PageHeader
        title={kb.data.name}
        description={kb.data.description}
        action={
          <Button variant="danger" onClick={delKb} loading={removeKb.isPending}>
            <Trash2 size={16} /> Eliminar base
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Carregar ficheiro</CardTitle>
            </CardHeader>
            <CardBody>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,.md,.html"
                onChange={onFile}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileRef.current?.click()}
                loading={uploadFile.isPending}
              >
                <Upload size={16} /> Escolher ficheiro
              </Button>
              <p className="mt-2 text-xs text-slate-500">
                PDF, DOCX, TXT, MD, HTML.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Colar texto</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={onText} className="space-y-3">
                <Field label="Título">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field label="Conteúdo">
                  <Textarea
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </Field>
                <Button
                  type="submit"
                  className="w-full"
                  loading={uploadText.isPending}
                >
                  Indexar texto
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardBody>
            {docs.isLoading ? (
              <Loading />
            ) : !docs.data || docs.data.length === 0 ? (
              <EmptyState
                icon={<FileText size={28} />}
                title="Sem documentos"
                description="Carregue ficheiros ou cole texto para indexar."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {docs.data.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {d.filename || "Texto"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(d.created_at)} ·{" "}
                        {d.token_count > 0 ? `${d.token_count} tokens` : "—"}
                      </p>
                      {d.error && (
                        <p className="text-xs text-red-600">{d.error}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusTone(d.status)}>{d.status}</Badge>
                      <button
                        onClick={() => removeDoc.mutate(d.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
