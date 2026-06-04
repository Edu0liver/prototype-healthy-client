import type { ConversationFilter } from "@/types/api";

// Centralized TanStack Query keys for cache consistency / invalidation.
export const qk = {
  me: ["me"] as const,
  company: ["company"] as const,
  branding: ["branding"] as const,
  domains: ["domains"] as const,
  users: ["users"] as const,
  agents: ["agents"] as const,
  agent: (id: string) => ["agents", id] as const,
  agentKbs: (id: string) => ["agents", id, "knowledge-bases"] as const,
  channels: ["channels"] as const,
  channel: (id: string) => ["channels", id] as const,
  channelState: (id: string) => ["channels", id, "state"] as const,
  automations: ["automations"] as const,
  knowledgeBases: ["knowledge-bases"] as const,
  knowledgeBase: (id: string) => ["knowledge-bases", id] as const,
  documents: (kbId: string) => ["knowledge-bases", kbId, "documents"] as const,
  conversations: (f?: ConversationFilter) =>
    ["conversations", f ?? {}] as const,
  conversation: (id: string) => ["conversations", id] as const,
  messages: (id: string) => ["conversations", id, "messages"] as const,
  subscription: ["billing", "subscription"] as const,
  usage: ["billing", "usage"] as const,
  plans: ["billing", "plans"] as const,
  publicPlans: ["billing", "plans", "public"] as const,
};
