"use client";

import { LogOut, Wifi, WifiOff } from "lucide-react";

import { useAuth } from "@/lib/auth/AuthContext";
import { initials } from "@/lib/utils/format";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  operator: "Operador",
  knowledge_manager: "Gestor de conhecimento",
};

export function Topbar({ realtimeOpen }: { realtimeOpen: boolean }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        {realtimeOpen ? (
          <>
            <Wifi size={14} className="text-green-500" /> Tempo real ligado
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-slate-400" /> A reconectar…
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {user?.name || user?.email}
          </p>
          <p className="text-xs text-slate-500">
            {user ? roleLabels[user.role] ?? user.role : ""}
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-fg">
          {initials(user?.name || user?.email)}
        </div>
        <button
          onClick={() => logout()}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
