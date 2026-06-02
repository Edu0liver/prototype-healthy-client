"use client";

import { useEffect, useState } from "react";

import { useRealtimeCtx } from "@/lib/realtime/RealtimeContext";

// Listens for qr_update realtime events scoped to a specific channel.
// Reuses the shared WS connection from RealtimeProvider (no extra socket).
export function useChannelQR(channelId: string) {
  const [qr, setQr] = useState<string | null>(null);
  const { subscribe } = useRealtimeCtx();

  useEffect(() => {
    return subscribe((ev) => {
      if (ev.type === "qr_update" && ev.payload?.["channel_id"] === channelId) {
        const code = ev.payload["qr_code"] as string | undefined;
        if (code) setQr(code);
      }
    });
  }, [channelId, subscribe]);

  return { qr, setQr, clearQr: () => setQr(null) };
}
