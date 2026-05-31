import type {
  Conversation,
  ConversationFilter,
  ConversationsList,
  Message,
  MessagesList,
} from "@/types/api";

import { api } from "./client";

function toQuery(f?: ConversationFilter): string {
  if (!f) return "";
  const p = new URLSearchParams();
  if (f.state) p.set("state", f.state);
  if (f.channel_id) p.set("channel_id", f.channel_id);
  if (f.since) p.set("since", f.since);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const conversationService = {
  list: (filter?: ConversationFilter) =>
    api
      .get<ConversationsList>(`/conversations${toQuery(filter)}`)
      .then((r) => r.conversations),
  get: (id: string) => api.get<Conversation>(`/conversations/${id}`),
  messages: (id: string) =>
    api
      .get<MessagesList>(`/conversations/${id}/messages`)
      .then((r) => r.messages),
};
