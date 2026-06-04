"use client";

import { MessagesSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useChannels } from "@/lib/hooks/useChannels";
import { useConversations } from "@/lib/hooks/useConversations";
import { relativeTime } from "@/lib/utils/format";
import type { ConversationState } from "@/types/enums";

export default function ConversationsPage() {
  const [state, setState] = useState<ConversationState | "">("");
  const [channelId, setChannelId] = useState("");
  const channels = useChannels();

  const { data, isLoading, isError, refetch } = useConversations({
    state: state || undefined,
    channel_id: channelId || undefined,
  });

  return (
    <div>
      <PageHeader
        title="Conversas"
        description="Histórico e atendimento em tempo real (RF-LOG)."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <Select
          className="w-44"
          value={state}
          onChange={(e) => setState(e.target.value as ConversationState | "")}
        >
          <option value="">Todos os estados</option>
          <option value="ai">IA</option>
          <option value="human">Humano</option>
          <option value="closed">Fechada</option>
        </Select>
        <Select
          className="w-56"
          value={channelId}
          onChange={(e) => setChannelId(e.target.value)}
        >
          <option value="">Todos os canais</option>
          {channels.data?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name || c.id.slice(0, 8)}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<MessagesSquare size={32} />}
          title="Sem conversas"
          description="As conversas aparecem aqui assim que chegarem mensagens."
        />
      ) : (
        <Card>
          <div className="divide-y divide-slate-100">
            {data.map((c) => (
              <Link key={c.id} href={`/dashboard/conversations/${c.id}`}>
                <div className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <Badge tone={statusTone(c.state)}>{c.state}</Badge>
                    <span className="font-mono text-sm text-slate-700">
                      {c.contact_id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {relativeTime(c.last_message_at ?? c.opened_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
