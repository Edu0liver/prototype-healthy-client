import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/lib/auth/AuthContext";

// Renders a component inside the app's runtime providers (Query + Toast + Auth)
// with a throwaway QueryClient (retries off, no cache leakage between tests).
//
// NOTE: AuthProvider calls next/navigation's useRouter, so test files using
// this helper must mock "next/navigation".
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
