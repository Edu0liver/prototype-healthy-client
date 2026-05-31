import type {
  Agent,
  AgentsList,
  CreateAgentRequest,
  KnowledgeBase,
  KnowledgeBasesList,
  UpdateAgentRequest,
} from "@/types/api";

import { api } from "./client";

export const agentService = {
  list: () => api.get<AgentsList>("/agents").then((r) => r.agents),
  get: (id: string) => api.get<Agent>(`/agents/${id}`),
  create: (body: CreateAgentRequest) => api.post<Agent>("/agents", body),
  update: (id: string, body: UpdateAgentRequest) =>
    api.put<Agent>(`/agents/${id}`, body),
  remove: (id: string) => api.del<void>(`/agents/${id}`),

  // N:M link to knowledge bases.
  listKnowledgeBases: (agentId: string) =>
    api
      .get<KnowledgeBasesList>(`/agents/${agentId}/knowledge-bases`)
      .then((r) => r.knowledge_bases),
  link: (agentId: string, kbId: string) =>
    api.post<KnowledgeBase>(`/agents/${agentId}/knowledge-bases/${kbId}`),
  unlink: (agentId: string, kbId: string) =>
    api.del<void>(`/agents/${agentId}/knowledge-bases/${kbId}`),
};
