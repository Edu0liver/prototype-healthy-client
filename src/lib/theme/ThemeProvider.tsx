"use client";

import { useEffect } from "react";

import { tenantService } from "@/lib/api/tenant";

// Applies the tenant's white-label theme at runtime (RF-WL-01). Uses the public
// host→branding lookup so it works on auth pages and for every role (the
// authenticated /branding endpoint is admin-only). Failures are ignored —
// defaults from globals.css / tailwind.config remain in effect.
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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let cancelled = false;
    const host = window.location.host;
    tenantService
      .getBrandingByHost(host)
      .then((b) => {
        if (cancelled) return;
        applyVars(b.primary_color, b.secondary_color);
        if (b.favicon_url) {
          let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
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

  return <>{children}</>;
}
