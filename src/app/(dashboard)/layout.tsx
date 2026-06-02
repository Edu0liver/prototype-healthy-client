"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Loading } from "@/components/ui/states";
import { useAuth } from "@/lib/auth/AuthContext";
import { RealtimeProvider } from "@/lib/realtime/RealtimeContext";
import { useRealtime } from "@/lib/hooks/useRealtime";

function DashboardInner({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RealtimeProvider>
      <DashboardInner>{children}</DashboardInner>
    </RealtimeProvider>
  );
}
