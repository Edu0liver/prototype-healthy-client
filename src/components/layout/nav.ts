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
    href: "/",
    label: "Visão geral",
    icon: LayoutDashboard,
    roles: ["admin", "operator", "knowledge_manager"],
  },
  {
    href: "/conversations",
    label: "Conversas",
    icon: MessagesSquare,
    roles: ["admin", "operator"],
  },
  { href: "/channels", label: "Canais", icon: Radio, roles: ["admin"] },
  { href: "/agents", label: "Agentes", icon: Bot, roles: ["admin"] },
  {
    href: "/knowledge",
    label: "Conhecimento",
    icon: Library,
    roles: ["admin", "knowledge_manager"],
  },
  {
    href: "/automations",
    label: "Automações",
    icon: Plug,
    roles: ["admin"],
  },
  {
    href: "/billing",
    label: "Faturação",
    icon: CreditCard,
    roles: ["admin"],
  },
  { href: "/settings", label: "Definições", icon: Settings, roles: ["admin"] },
];
