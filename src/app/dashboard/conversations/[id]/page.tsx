"use client";

import {
  ArrowLeft,
  CheckCircle,
  MessagesSquare,
  Send,
  UserCheck,
  Undo2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { MessageBubble } from "@/components/feature/MessageBubble";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import {
  useCloseHandover,
  useConversation,
  useMessages,
  useReplyHandover,
  useReturnHandover,
  useTakeHandover,
} from "@/lib/hooks/useConversations";

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const conv = useConversation(id);
  const messages = useMessages(id);
  const take = useTakeHandover(id);
  const ret = useReturnHandover(id);
  const close = useCloseHandover(id);
  const reply = useReplyHandover(id);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages (realtime invalidation refetches the list).
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data?.length]);

  const state = conv.data?.state;
  const isHuman = state === "human";

  function err(e: unknown) {
    toast.error(e instanceof ApiClientError ? e.message : "Erro");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await reply.mutateAsync({ content: text });
      setText("");
    } catch (e) {
      err(e);
    }
  }

  if (conv.isLoading) return <Loading />;
  if (conv.isError || !conv.data)
    return <ErrorState onRetry={() => conv.refetch()} />;

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      <Link
        href="/dashboard/conversations"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
      >
        <ArrowLeft size={16} /> Conversas
      </Link>
      <PageHeader
        title={`Contacto ${conv.data.contact_id.slice(0, 8)}`}
        description={undefined}
        action={
          <div className="flex items-center gap-2">
            <Badge tone={statusTone(conv.data.state)}>{conv.data.state}</Badge>
            {state === "ai" && (
              <Button size="sm" onClick={() => take.mutate()} loading={take.isPending}>
                <UserCheck size={16} /> Assumir
              </Button>
            )}
            {isHuman && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ret.mutate()}
                  loading={ret.isPending}
                >
                  <Undo2 size={16} /> Devolver à IA
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => close.mutate()}
                  loading={close.isPending}
                >
                  <CheckCircle size={16} /> Fechar
                </Button>
              </>
            )}
          </div>
        }
      />

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-800/40 p-4">
          {messages.isLoading ? (
            <Loading />
          ) : messages.data && messages.data.length > 0 ? (
            messages.data.map((m) => <MessageBubble key={m.id} msg={m} />)
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-slate-400 dark:text-slate-500">
              <MessagesSquare size={28} />
              <p className="text-sm">Sem mensagens nesta conversa.</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={send}
          className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!isHuman}
            placeholder={
              isHuman
                ? "Escreva uma resposta…"
                : "Assuma a conversa para responder"
            }
            className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800"
          />
          <Button type="submit" disabled={!isHuman} loading={reply.isPending}>
            <Send size={16} /> Enviar
          </Button>
        </form>
      </Card>
    </div>
  );
}
