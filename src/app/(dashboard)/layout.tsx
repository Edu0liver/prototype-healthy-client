"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Loading } from "@/components/ui/states";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRealtime } from "@/lib/hooks/useRealtime";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, user } = useAuth();
  const { status } = useRealtime();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar realtimeOpen={status === "open"} />
        <main className="flex-1 overflow-y-auto p-6">
          {loading && !user ? <Loading /> : children}
        </main>
      </div>
    </div>
  );
}
