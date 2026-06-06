import { cn } from "@/lib/utils/cn";

const nf = new Intl.NumberFormat("pt-BR");

export function UsageBar({
  label,
  used,
  quota,
  unlimited,
}: {
  label: string;
  used: number;
  quota: number;
  unlimited: boolean;
}) {
  const pct = unlimited || quota <= 0 ? 0 : Math.min((used / quota) * 100, 100);
  const over = !unlimited && quota > 0 && used >= quota;
  const warn = !unlimited && quota > 0 && pct >= 80;

  const barColor = over
    ? "bg-red-500"
    : warn
      ? "bg-amber-500"
      : "bg-brand";

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
        <span className="tabular-nums text-slate-500 dark:text-slate-400">
          {nf.format(used)}
          {unlimited ? (
            <span className="ml-1 text-slate-400 dark:text-slate-500">/ ∞</span>
          ) : (
            <span className="ml-1 text-slate-400 dark:text-slate-500">/ {nf.format(quota)}</span>
          )}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={cn("h-full rounded-full transition-all", unlimited ? "bg-slate-200 dark:bg-slate-600" : barColor)}
          style={{ width: unlimited ? "100%" : `${pct}%` }}
        />
      </div>
    </div>
  );
}
