"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { agentService } from "@/lib/api/agents";
import type { CreateAgentRequest, UpdateAgentRequest } from "@/types/api";

import { qk } from "./keys";

export function useAgents() {
  return useQuery({ queryKey: qk.agents, queryFn: agentService.list });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: qk.agent(id),
    queryFn: () => agentService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAgentRequest) => agentService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agents }),
  });
}

export function useUpdateAgent(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateAgentRequest) => agentService.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.agents });
      qc.invalidateQueries({ queryKey: qk.agent(id) });
    },
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => agentService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.agents }),
  });
}

export function useAgentKnowledgeBases(agentId: string) {
  return useQuery({
    queryKey: qk.agentKbs(agentId),
    queryFn: () => agentService.listKnowledgeBases(agentId),
    enabled: Boolean(agentId),
  });
}

export function useLinkKnowledgeBase(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ kbId, link }: { kbId: string; link: boolean }) => {
      if (link) await agentService.link(agentId, kbId);
      else await agentService.unlink(agentId, kbId);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.agentKbs(agentId) }),
  });
}
