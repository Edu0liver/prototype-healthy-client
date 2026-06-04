"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthContext";
import { cn } from "@/lib/utils/cn";

import { NAV } from "./nav";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV.filter((i) => (user ? i.roles.includes(user.role) : false));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-fg">
          L
        </div>
        <span className="font-semibold text-slate-900">Lumia</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
