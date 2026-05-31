import type { RealtimeEvent } from "@/types/api";

// Opens the realtime WebSocket. Because the JWT lives in an httpOnly cookie,
// we first fetch a short-lived ticket from /api/realtime-token, then connect to
// the backend /ws?token=. Reconnects with backoff on drop.

const WS_BASE =
  process.env.NEXT_PUBLIC_WS_URL ??
  (typeof window !== "undefined"
    ? window.location.origin.replace(/^http/, "ws")
    : "ws://localhost:8080");

export interface RealtimeHandle {
  close: () => void;
}

export function connectRealtime(
  onEvent: (ev: RealtimeEvent) => void,
  onStatus?: (s: "open" | "closed" | "error") => void,
): RealtimeHandle {
  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  async function open() {
    if (closed) return;
    try {
      const res = await fetch("/api/realtime-token", {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("no ticket");
      const { token } = (await res.json()) as { token: string };

      socket = new WebSocket(`${WS_BASE}/api/v1/ws?token=${token}`);

      socket.onopen = () => {
        attempt = 0;
        onStatus?.("open");
      };
      socket.onmessage = (e) => {
        try {
          onEvent(JSON.parse(e.data) as RealtimeEvent);
        } catch {
          /* ignore malformed frames */
        }
      };
      socket.onerror = () => onStatus?.("error");
      socket.onclose = () => {
        onStatus?.("closed");
        scheduleRetry();
      };
    } catch {
      scheduleRetry();
    }
  }

  function scheduleRetry() {
    if (closed) return;
    attempt += 1;
    const delay = Math.min(1000 * 2 ** attempt, 15000);
    retryTimer = setTimeout(open, delay);
  }

  open();

  return {
    close() {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    },
  };
}
