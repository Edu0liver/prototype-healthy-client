"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme, type ThemeMode } from "@/lib/theme/ThemeProvider";

const ORDER: ThemeMode[] = ["light", "dark", "system"];
const ICON = { light: Sun, dark: Moon, system: Monitor } as const;
const LABEL = { light: "Tema claro", dark: "Tema escuro", system: "Tema do sistema" } as const;

// Cycles light → dark → system. Icon reflects the current mode.
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const Icon = ICON[mode];
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
  return (
    <button
      onClick={() => setMode(next)}
      title={LABEL[mode]}
      aria-label={`${LABEL[mode]} (clique para mudar)`}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    >
      <Icon size={18} />
    </button>
  );
}
