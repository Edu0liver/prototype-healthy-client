import type {
  Channel,
  ChannelsList,
  ConnectRequest,
  ConnectResponse,
  ConnectionState,
  CreateChannelRequest,
} from "@/types/api";

import { api } from "./client";

export const channelService = {
  list: () => api.get<ChannelsList>("/channels").then((r) => r.channels),
  get: (id: string) => api.get<Channel>(`/channels/${id}`),
  create: (body: CreateChannelRequest) => api.post<Channel>("/channels", body),
  connect: (id: string, body: ConnectRequest) =>
    api.post<ConnectResponse>(`/channels/${id}/connect`, body),
  connectionState: (id: string) =>
    api.get<ConnectionState>(`/channels/${id}/connection-state`),
  disconnect: (id: string) => api.del<void>(`/channels/${id}`),
};
