"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { channelService } from "@/lib/api/channels";
import type { ConnectRequest, CreateChannelRequest } from "@/types/api";

import { qk } from "./keys";

export function useChannels() {
  return useQuery({ queryKey: qk.channels, queryFn: channelService.list });
}

export function useChannel(id: string, options?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: qk.channel(id),
    queryFn: () => channelService.get(id),
    enabled: Boolean(id),
    refetchInterval: options?.refetchInterval,
  });
}

export function useCreateChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateChannelRequest) => channelService.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.channels }),
  });
}

export function useConnectChannel(id: string) {
  return useMutation({
    mutationFn: (body: ConnectRequest) => channelService.connect(id, body),
  });
}

export function useDisconnectChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelService.disconnect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.channels }),
  });
}
