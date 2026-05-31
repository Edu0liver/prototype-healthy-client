"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { EmptyState } from "@/components/ui/states";
import type { Role } from "@/types/enums";

// Client-side role gate. The backend enforces RBAC on every call; this just
// avoids rendering a page the user can't use (and the resulting 403 noise).
export function RoleGuard({
  roles,
  children,
}: {
  roles: Role[];
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || !roles.includes(user.role)) {
    return (
      <EmptyState
        title="Sem permissão"
        description="Não tem acesso a esta secção."
      />
    );
  }
  return <>{children}</>;
}
