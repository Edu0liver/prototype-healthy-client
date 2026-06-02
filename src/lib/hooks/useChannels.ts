"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { channelService } from "@/lib/api/channels";
import type { Channel, ConnectRequest, CreateChannelRequest } from "@/types/api";

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

// Polls the live Evolution connection state every 5s while `enabled` (i.e. while
// the channel is still connecting). The endpoint syncs the DB; once it reports
// "connected" we write the new status straight into the channel cache so the UI
// flips and `enabled` turns false, which stops the interval. This avoids webhook
// dependence AND avoids invalidating the poll's own query (which would cascade
// into an unbounded refetch loop). Independent of webhook delivery.
export function useConnectionStatePolling(id: string, enabled: boolean) {
  const qc = useQueryClient();
  return useQuery({
    queryKey: qk.channelState(id),
    queryFn: async () => {
      const res = await channelService.connectionState(id);
      if (res.state === "connected") {
        // setQueryData: no network, no invalidation cascade. Flipping status to
        // "connected" makes `enabled` false on the next render, stopping polling.
        qc.setQueryData<Channel>(qk.channel(id), (old) =>
          old ? { ...old, status: "connected" } : old,
        );
        // Mark only the list query stale (exact: avoids matching channel/state keys).
        qc.invalidateQueries({ queryKey: qk.channels, exact: true });
      }
      return res;
    },
    enabled: Boolean(id) && enabled,
    refetchInterval: enabled ? 5000 : false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useDisconnectChannel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => channelService.disconnect(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.channels }),
  });
}
