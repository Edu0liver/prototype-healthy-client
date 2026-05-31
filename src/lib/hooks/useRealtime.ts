"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { connectRealtime } from "@/lib/api/ws";
import type { RealtimeEvent } from "@/types/api";

import { qk } from "./keys";

// Subscribes to the tenant realtime stream and invalidates the relevant
// queries so the UI reflects new messages and handover state transitions live
// (RF-LOG-01, RF-CH-04). Mounted once near the app root.
export function useRealtime() {
  const qc = useQueryClient();
  const [status, setStatus] = useState<"open" | "closed" | "error">("closed");
  const cb = useRef<(ev: RealtimeEvent) => void>();

  cb.current = (ev: RealtimeEvent) => {
    if (ev.conversation_id) {
      qc.invalidateQueries({ queryKey: qk.messages(ev.conversation_id) });
      qc.invalidateQueries({ queryKey: qk.conversation(ev.conversation_id) });
    }
    qc.invalidateQueries({ queryKey: ["conversations"] });
    if (ev.type === "state") {
      qc.invalidateQueries({ queryKey: qk.channels });
    }
  };

  useEffect(() => {
    const handle = connectRealtime(
      (ev) => cb.current?.(ev),
      (s) => setStatus(s),
    );
    return () => handle.close();
  }, []);

  return { status };
}
