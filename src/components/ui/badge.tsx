import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "green" | "amber" | "red" | "blue" | "violet";

const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  green: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  amber: "bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200",
  red: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

// Maps common backend status strings to a tone + label for consistent display.
export function statusTone(status: string): Tone {
  switch (status) {
    case "connected":
    case "indexed":
    case "active":
    case "delivered":
    case "read":
      return "green";
    case "connecting":
    case "processing":
    case "pending":
    case "sent":
    case "invited":
      return "amber";
    case "error":
    case "failed":
    case "disabled":
      return "red";
    case "human":
      return "violet";
    case "ai":
      return "blue";
    default:
      return "neutral";
  }
}
