"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { automationService } from "@/lib/api/automations";
import type {
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from "@/types/api";

import { qk } from "./keys";

export function useAutomations() {
  return useQuery({
    queryKey: qk.automations,
    queryFn: automationService.list,
  });
}

export function useCreateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAutomationRequest) =>
      automationService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.automations }),
  });
}

export function useUpdateAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: UpdateAutomationRequest;
    }) => automationService.update(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.automations }),
  });
}

export function useDeleteAutomation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.automations }),
  });
}
