import { Bot, User, UserCog } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { formatTime } from "@/lib/utils/format";
import type { Message } from "@/types/api";

// Renders one message. Contact messages align left; AI/human (outbound) right.
export function MessageBubble({ msg }: { msg: Message }) {
  const fromContact = msg.sender_type === "contact";
  const Icon =
    msg.sender_type === "ai" ? Bot : msg.sender_type === "human" ? UserCog : User;

  return (
    <div
      className={cn("flex gap-2", fromContact ? "justify-start" : "justify-end")}
    >
      {fromContact && (
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          <Icon size={15} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
          fromContact
            ? "rounded-tl-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm"
            : msg.sender_type === "ai"
              ? "rounded-tr-sm bg-blue-600 text-white"
              : "rounded-tr-sm bg-brand text-brand-fg",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        <p
          className={cn(
            "mt-1 text-right text-[10px]",
            fromContact ? "text-slate-400 dark:text-slate-500" : "text-white/70",
          )}
        >
          {formatTime(msg.created_at)}
          {!fromContact && msg.status ? ` · ${msg.status}` : ""}
        </p>
      </div>
    </div>
  );
}
