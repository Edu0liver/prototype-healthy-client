"use client";

import { useEffect, useState } from "react";

import { connectRealtime } from "@/lib/api/ws";

// Listens for qr_update realtime events scoped to a specific channel.
// Returns the latest QR code string; clears automatically on unmount.
export function useChannelQR(channelId: string) {
  const [qr, setQr] = useState<string | null>(null);

  useEffect(() => {
    const handle = connectRealtime((ev) => {
      if (
        ev.type === "qr_update" &&
        ev.payload?.["channel_id"] === channelId
      ) {
        const code = ev.payload["qr_code"] as string | undefined;
        if (code) setQr(code);
      }
    });
    return () => handle.close();
  }, [channelId]);

  return { qr, setQr, clearQr: () => setQr(null) };
}
