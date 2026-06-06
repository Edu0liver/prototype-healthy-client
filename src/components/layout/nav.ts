import {
  Bot,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  MessagesSquare,
  Plug,
  Radio,
  Settings,
  Library,
  Users,
} from "lucide-react";

import type { Role } from "@/types/enums";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[]; // which roles may see this entry
}

// Role visibility follows RF-USR-02: admins manage everything; operators handle
// conversations; knowledge managers handle RAG.
export const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    roles: ["admin", "operator", "knowledge_manager"],
  },
  {
    href: "/dashboard/conversations",
    label: "Conversas",
    icon: MessagesSquare,
    roles: ["admin", "operator"],
  },
  { href: "/dashboard/channels", label: "Canais", icon: Radio, roles: ["admin"] },
  { href: "/dashboard/agents", label: "Agentes", icon: Bot, roles: ["admin"] },
  {
    href: "/dashboard/knowledge",
    label: "Conhecimento",
    icon: Library,
    roles: ["admin", "knowledge_manager"],
  },
  {
    href: "/dashboard/automations",
    label: "Automações",
    icon: Plug,
    roles: ["admin"],
  },
  {
    href: "/dashboard/users",
    label: "Utilizadores",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/dashboard/billing",
    label: "Faturação",
    icon: CreditCard,
    roles: ["admin"],
  },
  {
    href: "/dashboard/settings",
    label: "Definições",
    icon: Settings,
    roles: ["admin"],
  },
];
