import type { ReplyRequest } from "@/types/api";

import { api } from "./client";

// Operator controls for a conversation (RF-HO-01..04). The backend mutates the
// Redis conv:state and persists messages; the panel reflects changes via WS.
export const handoverService = {
  take: (conversationId: string) =>
    api.post<void>(`/conversations/${conversationId}/handover/take`),
  reply: (conversationId: string, body: ReplyRequest) =>
    api.post<void>(`/conversations/${conversationId}/handover/reply`, body),
  return: (conversationId: string) =>
    api.post<void>(`/conversations/${conversationId}/handover/return`),
  close: (conversationId: string) =>
    api.post<void>(`/conversations/${conversationId}/handover/close`),
};
