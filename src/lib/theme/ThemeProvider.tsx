"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { tenantService } from "@/lib/api/tenant";

// ---- White-label brand colors ---------------------------------------------
// Converts "#4f46e5" → "79 70 229" (RGB channel triplet for the CSS var).
function hexToTriplet(hex?: string): string | null {
  if (!hex) return null;
  const m = hex.replace("#", "").trim();
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  if (full.length !== 6) return null;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return null;
  return `${r} ${g} ${b}`;
}

function applyVars(primary?: string, secondary?: string) {
  const root = document.documentElement;
  const p = hexToTriplet(primary);
  const s = hexToTriplet(secondary);
  if (p) root.style.setProperty("--brand-primary", p);
  if (s) root.style.setProperty("--brand-secondary", s);
}

// ---- Color scheme (light / dark / system) ----------------------------------
export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "lumia-theme";

interface ThemeCtx {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
}

const Ctx = createContext<ThemeCtx | null>(null);

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function applyScheme(mode: ThemeMode): boolean {
  const dark = mode === "dark" || (mode === "system" && systemPrefersDark());
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  return dark;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [isDark, setIsDark] = useState(false);

  // Initialise from storage (the no-flash head script already set the class).
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "system";
    setModeState(stored);
    setIsDark(applyScheme(stored));
  }, []);

  // Re-apply when mode changes; follow the OS while in "system".
  useEffect(() => {
    setIsDark(applyScheme(mode));
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setIsDark(applyScheme("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mode]);

  // White-label branding (host → colors), independent of the color scheme.
  useEffect(() => {
    let cancelled = false;
    tenantService
      .getBrandingByHost(window.location.host)
      .then((b) => {
        if (cancelled) return;
        applyVars(b.primary_color, b.secondary_color);
        if (b.favicon_url) {
          let link =
            document.querySelector<HTMLLinkElement>("link[rel~='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = b.favicon_url;
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (m: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  };

  const value = useMemo(() => ({ mode, setMode, isDark }), [mode, isDark]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
