"use client";

import { Users } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { EmptyState, ErrorState, Loading } from "@/components/ui/states";
import { useToast } from "@/components/ui/toast";
import { ApiClientError } from "@/lib/api/client";
import { useInviteUser, useUsers } from "@/lib/hooks/useTenant";
import type { Role } from "@/types/enums";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  operator: "Operador",
  knowledge_manager: "Gestor de conhecimento",
};

const STATUS_BADGE: Record<
  string,
  { tone: "green" | "amber" | "neutral"; label: string }
> = {
  active: { tone: "green", label: "Ativo" },
  invited: { tone: "amber", label: "Convidado" },
  disabled: { tone: "neutral", label: "Desativado" },
};

export default function UsersPage() {
  const { data, isLoading, isError, refetch } = useUsers();
  const invite = useInviteUser();
  const toast = useToast();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("operator");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await invite.mutateAsync({ email, name, role });
      toast.success("Convite enviado para " + email);
      setOpen(false);
      setEmail("");
      setName("");
      setRole("operator");
    } catch (err) {
      toast.error(
        err instanceof ApiClientError ? err.message : "Erro ao enviar convite",
      );
    }
  }

  return (
    <RoleGuard roles={["admin"]}>
      <PageHeader
        title="Utilizadores"
        description="Convide e gira os membros da equipa."
        action={
          <Button onClick={() => setOpen(true)}>
            <Users size={16} /> Convidar
          </Button>
        }
      />

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="Sem utilizadores"
          description="Convide o primeiro membro da equipa."
          action={
            <Button onClick={() => setOpen(true)}>
              <Users size={16} /> Convidar
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Utilizador</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((u) => {
                const status = STATUS_BADGE[u.status] ?? {
                  tone: "neutral" as const,
                  label: u.status,
                };
                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {u.name || "—"}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone="neutral">
                        {ROLE_LABEL[u.role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Convidar utilizador"
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
              />
            </Field>
            <Field label="Nome">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="João Silva"
              />
            </Field>
          </div>
          <Field label="Papel">
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="operator">Operador</option>
              <option value="knowledge_manager">Gestor de conhecimento</option>
              <option value="admin">Administrador</option>
            </Select>
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={invite.isPending}>
              Enviar convite
            </Button>
          </div>
        </form>
      </Dialog>
    </RoleGuard>
  );
}
