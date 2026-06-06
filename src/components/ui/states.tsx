import { AlertCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin text-slate-400 dark:text-slate-500", className)} />;
}

export function Loading({ label = "A carregar…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500 dark:text-slate-400">
      <Spinner className="h-4 w-4" />
      {label}
    </div>
  );
}

export function ErrorState({
  message = "Algo correu mal.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500 ring-1 ring-inset ring-red-100">
        <AlertCircle size={22} />
      </div>
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/5"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/70 dark:bg-slate-900/40 px-6 py-14 text-center">
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          {icon}
        </div>
      )}
      <div>
        <p className="font-display font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
