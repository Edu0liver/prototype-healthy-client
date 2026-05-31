"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversationService } from "@/lib/api/conversations";
import { handoverService } from "@/lib/api/handover";
import type { ConversationFilter, ReplyRequest } from "@/types/api";

import { qk } from "./keys";

export function useConversations(filter?: ConversationFilter) {
  return useQuery({
    queryKey: qk.conversations(filter),
    queryFn: () => conversationService.list(filter),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: qk.conversation(id),
    queryFn: () => conversationService.get(id),
    enabled: Boolean(id),
  });
}

export function useMessages(id: string) {
  return useQuery({
    queryKey: qk.messages(id),
    queryFn: () => conversationService.messages(id),
    enabled: Boolean(id),
  });
}

function useHandoverAction(
  conversationId: string,
  action: (id: string) => Promise<void>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => action(conversationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.conversation(conversationId) });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useTakeHandover(id: string) {
  return useHandoverAction(id, handoverService.take);
}
export function useReturnHandover(id: string) {
  return useHandoverAction(id, handoverService.return);
}
export function useCloseHandover(id: string) {
  return useHandoverAction(id, handoverService.close);
}

export function useReplyHandover(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReplyRequest) => handoverService.reply(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.messages(id) }),
  });
}
