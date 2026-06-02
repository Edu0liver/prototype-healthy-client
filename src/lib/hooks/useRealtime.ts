"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useRealtimeCtx } from "@/lib/realtime/RealtimeContext";
import type { RealtimeEvent } from "@/types/api";

import { qk } from "./keys";

// Subscribes to the shared realtime stream and invalidates queries on events
// (RF-LOG-01, RF-CH-04). Requires RealtimeProvider in the tree.
export function useRealtime() {
  const qc = useQueryClient();
  const { subscribe, status } = useRealtimeCtx();
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
    return subscribe((ev) => cb.current?.(ev));
  }, [subscribe]);

  return { status };
}
