"use client";

import { Bot, Library, MessagesSquare, Radio } from "lucide-react";
import Link from "next/link";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge, statusTone } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/AuthContext";
import { useAgents } from "@/lib/hooks/useAgents";
import { useChannels } from "@/lib/hooks/useChannels";
import { useConversations } from "@/lib/hooks/useConversations";
import { useKnowledgeBases } from "@/lib/hooks/useKnowledge";

function Stat({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition hover:shadow-md">
        <CardBody className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/10 text-brand">
            {icon}
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function OverviewPage() {
  const { user, isRole } = useAuth();
  const channels = useChannels();
  const agents = useAgents();
  const kbs = useKnowledgeBases();
  const convs = useConversations();

  const human = convs.data?.filter((c) => c.state === "human").length ?? 0;

  return (
    <div>
      <PageHeader
        title={`Olá, ${user?.name || "bem-vindo"} 👋`}
        description="Resumo da operação do seu atendimento."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isRole("admin") && (
          <>
            <Stat
              icon={<Radio size={20} />}
              label="Canais"
              value={channels.data?.length ?? "—"}
              href="/channels"
            />
            <Stat
              icon={<Bot size={20} />}
              label="Agentes"
              value={agents.data?.length ?? "—"}
              href="/agents"
            />
            <Stat
              icon={<Library size={20} />}
              label="Bases de conhecimento"
              value={kbs.data?.length ?? "—"}
              href="/knowledge"
            />
          </>
        )}
        <Stat
          icon={<MessagesSquare size={20} />}
          label="Conversas"
          value={convs.data?.length ?? "—"}
          href="/conversations"
        />
      </div>

      {(isRole("admin") || isRole("operator")) && (
        <Card className="mt-6">
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Conversas a aguardar atendimento humano
                </p>
                <p className="text-sm text-slate-500">
                  Transferidas pela IA para um operador.
                </p>
              </div>
              <Badge tone={human > 0 ? statusTone("human") : "neutral"}>
                {human} em espera
              </Badge>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
