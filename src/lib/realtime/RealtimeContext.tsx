"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { connectRealtime } from "@/lib/api/ws";
import type { RealtimeEvent } from "@/types/api";

type EventCb = (ev: RealtimeEvent) => void;

interface RealtimeCtxValue {
  subscribe: (cb: EventCb) => () => void;
  status: "open" | "closed" | "error";
}

const RealtimeCtx = createContext<RealtimeCtxValue | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"open" | "closed" | "error">("closed");
  const listeners = useRef<Set<EventCb>>(new Set());

  useEffect(() => {
    const handle = connectRealtime(
      (ev) => listeners.current.forEach((cb) => cb(ev)),
      setStatus,
    );
    return () => handle.close();
  }, []);

  const subscribe = useCallback((cb: EventCb) => {
    listeners.current.add(cb);
    return () => {
      listeners.current.delete(cb);
    };
  }, []);

  return (
    <RealtimeCtx.Provider value={{ subscribe, status }}>
      {children}
    </RealtimeCtx.Provider>
  );
}

export function useRealtimeCtx(): RealtimeCtxValue {
  const v = useContext(RealtimeCtx);
  if (!v) throw new Error("useRealtimeCtx must be inside RealtimeProvider");
  return v;
}
