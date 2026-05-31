"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext } from "react";

import { authService } from "@/lib/api/auth";
import { qk } from "@/lib/hooks/keys";
import type { User } from "@/types/api";
import type { Role } from "@/types/enums";

interface AuthValue {
  user: User | null;
  loading: boolean;
  isRole: (...roles: Role[]) => boolean;
  logout: () => Promise<void>;
  refresh: () => void;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: qk.me,
    queryFn: authService.me,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    qc.clear();
    router.replace("/login");
  }, [qc, router]);

  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: qk.me });
  }, [qc]);

  const user = data ?? null;
  const value: AuthValue = {
    user,
    loading: isLoading,
    isRole: (...roles) => (user ? roles.includes(user.role) : false),
    logout,
    refresh,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
