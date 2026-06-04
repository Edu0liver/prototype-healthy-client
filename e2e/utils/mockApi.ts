import type { BrowserContext, Page, Route } from "@playwright/test";

// Stateful in-browser fake of the backend. A single page.route("**/api/**")
// dispatches every same-origin call the app makes (Next route handlers +
// /api/v1 proxy) against an in-memory store, so creates/edits are reflected on
// subsequent reads — letting E2E traverse the whole app without a real backend.

export const E2E_USER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "admin@acme.com",
  name: "Admin Acme",
  role: "admin",
  status: "active",
} as const;

type Json = Record<string, unknown>;

function makeStore() {
  return {
    company: {
      id: "c0000000-0000-0000-0000-000000000000",
      name: "Acme",
      slug: "acme",
      status: "active",
      plan: "pro",
      created_at: new Date().toISOString(),
    },
    branding: {
      company_id: "c0000000-0000-0000-0000-000000000000",
      logo_url: "",
      favicon_url: "",
      primary_color: "#4f46e5",
      secondary_color: "#6366f1",
      email_sender_name: "Acme",
    },
    domains: [
      {
        id: "d1",
        domain: "painel.acme.com",
        is_primary: true,
        verified_at: new Date().toISOString(),
      },
    ] as Json[],
    users: [{ ...E2E_USER }] as Json[],
    agents: [
      {
        id: "a1",
        name: "Assistente Vendas",
        system_prompt: "Você ajuda clientes.",
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_output_tokens: 1024,
        handover_enabled: true,
        handover_keywords: ["humano"],
        status: "active",
      },
    ] as Json[],
    channels: [
      {
        id: "ch1",
        type: "whatsapp",
        name: "Atendimento",
        status: "connected",
        external_account_id: "5511999999999",
        instance_name: "acme-ch1",
        active_agent_id: "a1",
      },
      {
        id: "ch2",
        type: "whatsapp",
        name: "Suporte",
        status: "disconnected",
        external_account_id: "5511888888888",
        instance_name: "acme-ch2",
        active_agent_id: null,
      },
    ] as Json[],
    kbs: [
      {
        id: "kb1",
        name: "Base FAQ",
        description: "Perguntas frequentes",
        embedding_model: "text-embedding-3-small",
        chunk_size: 800,
        chunk_overlap: 100,
      },
    ] as Json[],
    docs: {
      kb1: [
        {
          id: "doc1",
          filename: "faq.pdf",
          source_type: "file",
          status: "indexed",
          token_count: 320,
          created_at: new Date().toISOString(),
        },
      ],
    } as Record<string, Json[]>,
    agentKbs: { a1: ["kb1"] } as Record<string, string[]>,
    automations: [
      {
        id: "au1",
        channel_id: "ch1",
        agent_id: "a1",
        is_active: true,
        fallback_message: "Já volto.",
        debounce_seconds: 5,
      },
    ] as Json[],
    conversations: [
      {
        id: "cv1",
        channel_id: "ch1",
        contact_id: "ct-aaaaaaaa",
        agent_id: "a1",
        state: "ai",
        assigned_user_id: null,
        last_message_at: new Date().toISOString(),
        opened_at: new Date().toISOString(),
        closed_at: null,
      },
      {
        id: "cv2",
        channel_id: "ch1",
        contact_id: "ct-bbbbbbbb",
        agent_id: "a1",
        state: "human",
        assigned_user_id: E2E_USER.id,
        last_message_at: new Date().toISOString(),
        opened_at: new Date().toISOString(),
        closed_at: null,
      },
    ] as Json[],
    messages: {
      cv1: [
        {
          id: "m1",
          direction: "inbound",
          sender_type: "contact",
          content: "Olá, quero saber preços",
          status: "received",
          created_at: new Date().toISOString(),
        },
        {
          id: "m2",
          direction: "outbound",
          sender_type: "ai",
          content: "Claro! Temos vários planos.",
          status: "sent",
          created_at: new Date().toISOString(),
        },
      ],
      cv2: [
        {
          id: "m3",
          direction: "inbound",
          sender_type: "contact",
          content: "Quero falar com humano",
          status: "received",
          created_at: new Date().toISOString(),
        },
      ],
    } as Record<string, Json[]>,
    subscription: {
      plan_code: "pro",
      plan_name: "Pro",
      status: "active",
      billing_cycle: "monthly",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
      cancel_at_period_end: false,
      price_cents: 29900,
      currency: "BRL",
    } as Json,
    usage: {
      period_start: new Date().toISOString(),
      period_end: new Date(Date.now() + 30 * 864e5).toISOString(),
      items: [
        { kind: "ai_message", used: 42, quota: 10000, unlimited: false },
        { kind: "llm_tokens", used: 1500, quota: 10000000, unlimited: false },
        { kind: "audio_minutes", used: 3, quota: 600, unlimited: false },
        { kind: "storage_mb", used: 12, quota: 2000, unlimited: false },
      ],
    } as Json,
    plans: [
      { code: "starter", name: "Starter", price_cents: 1499, currency: "BRL", quota_ai_messages: 1000, quota_tokens: 2000000, quota_audio_minutes: 60, quota_storage_mb: 200, max_channels: 1, max_agents: 2, max_kb: 3, max_seats: 2, purchasable: true },
      { code: "pro", name: "Pro", price_cents: 9990, currency: "BRL", quota_ai_messages: 10000, quota_tokens: 20000000, quota_audio_minutes: 600, quota_storage_mb: 2000, max_channels: 5, max_agents: 10, max_kb: 20, max_seats: 10, purchasable: true },
      { code: "enterprise", name: "Enterprise", price_cents: 0, currency: "BRL", quota_ai_messages: 0, quota_tokens: 0, quota_audio_minutes: 0, quota_storage_mb: 0, max_channels: 0, max_agents: 0, max_kb: 0, max_seats: 0, purchasable: false },
    ] as Json[],
  };
}

type Store = ReturnType<typeof makeStore>;

const COOKIE = "set-cookie";
const AUTH_COOKIE = "lumia_access=e2e-token; Path=/; SameSite=Lax";

async function body(route: Route): Promise<Json> {
  try {
    return JSON.parse(route.request().postData() || "{}");
  } catch {
    return {};
  }
}

function id(prefix: string) {
  return prefix + Math.random().toString(36).slice(2, 8);
}

// Seeds the auth cookie directly so authenticated specs can deep-link to any
// dashboard page (the edge middleware only checks cookie presence).
export async function seedCookie(context: BrowserContext) {
  await context.addCookies([
    {
      name: "lumia_access",
      value: "e2e-token",
      domain: "localhost",
      path: "/",
    },
  ]);
}

export async function installMockBackend(page: Page) {
  const db: Store = makeStore();

  await page.route("**/api/**", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const method = req.method();
    const J = (status: number, payload: unknown, headers?: Record<string, string>) =>
      route.fulfill({
        status,
        contentType: "application/json",
        headers,
        body: JSON.stringify(payload),
      });

    // ---- Auth / session (Next route handlers) ----
    if (path === "/api/auth/login")
      return J(200, { user: E2E_USER }, { [COOKIE]: AUTH_COOKIE });
    if (path === "/api/auth/signup")
      return J(200, { user: E2E_USER, company: db.company }, { [COOKIE]: AUTH_COOKIE });
    if (path === "/api/auth/accept-invite")
      return J(200, { authenticated: true, user: E2E_USER }, { [COOKIE]: AUTH_COOKIE });
    if (path === "/api/auth/logout")
      return J(200, { ok: true }, { [COOKIE]: "lumia_access=; Path=/; Max-Age=0" });
    if (path === "/api/realtime-token") return J(200, { token: "e2e-token" });

    // ---- /api/v1 proxy ----
    const p = path.replace(/^\/api\/v1/, "");

    if (p === "/auth/me") return J(200, E2E_USER);

    // tenant
    if (p === "/company") return J(200, db.company);
    if (p === "/branding" && method === "GET") return J(200, db.branding);
    if (p === "/branding" && method === "PUT") {
      Object.assign(db.branding, await body(route));
      return J(200, db.branding);
    }
    if (p.startsWith("/branding/host")) return J(200, db.branding);
    if (p === "/domains" && method === "GET") return J(200, { domains: db.domains });
    if (p === "/domains" && method === "POST") {
      const b = await body(route);
      const d = { id: id("d"), verified_at: null, ...b };
      db.domains.push(d);
      return J(201, d);
    }

    // users
    if (p === "/users" && method === "GET") return J(200, { users: db.users });
    if (p === "/users" && method === "POST") {
      const b = await body(route);
      const u = { id: id("u"), status: "invited", ...b };
      db.users.push(u);
      return J(201, u);
    }

    // agents
    if (p === "/agents" && method === "GET") return J(200, { agents: db.agents });
    if (p === "/agents" && method === "POST") {
      const b = await body(route);
      const a = {
        id: id("a"),
        temperature: 0.7,
        max_output_tokens: 1024,
        handover_enabled: false,
        handover_keywords: [],
        status: "active",
        ...b,
      };
      db.agents.push(a);
      return J(201, a);
    }
    let mm = p.match(/^\/agents\/([^/]+)\/knowledge-bases\/([^/]+)$/);
    if (mm) {
      const [, aId, kbId] = mm;
      db.agentKbs[aId] = db.agentKbs[aId] || [];
      if (method === "POST") {
        if (!db.agentKbs[aId].includes(kbId)) db.agentKbs[aId].push(kbId);
        return J(201, {});
      }
      if (method === "DELETE") {
        db.agentKbs[aId] = db.agentKbs[aId].filter((x) => x !== kbId);
        return J(204, {});
      }
    }
    mm = p.match(/^\/agents\/([^/]+)\/knowledge-bases$/);
    if (mm) {
      const linked = db.agentKbs[mm[1]] || [];
      return J(200, {
        knowledge_bases: db.kbs.filter((k) => linked.includes(k.id as string)),
      });
    }
    mm = p.match(/^\/agents\/([^/]+)$/);
    if (mm) {
      const a = db.agents.find((x) => x.id === mm![1]);
      if (method === "GET") return a ? J(200, a) : J(404, { error: "not_found" });
      if (method === "PUT") {
        Object.assign(a as Json, await body(route));
        return J(200, a);
      }
      if (method === "DELETE") {
        db.agents = db.agents.filter((x) => x.id !== mm![1]);
        return J(204, {});
      }
    }

    // channels
    if (p === "/channels" && method === "GET") return J(200, { channels: db.channels });
    if (p === "/channels" && method === "POST") {
      const b = await body(route);
      const c = {
        id: id("ch"),
        status: "disconnected",
        external_account_id: (b.number as string) || "",
        active_agent_id: null,
        ...b,
      };
      db.channels.push(c);
      return J(201, c);
    }
    mm = p.match(/^\/channels\/([^/]+)\/connect$/);
    if (mm) return J(200, { qr_code: "2@FAKEQRPAYLOAD/test", state: "connecting" });
    mm = p.match(/^\/channels\/([^/]+)\/connection-state$/);
    if (mm) return J(200, { state: "open" });
    mm = p.match(/^\/channels\/([^/]+)$/);
    if (mm) {
      const c = db.channels.find((x) => x.id === mm![1]);
      if (method === "GET") return c ? J(200, c) : J(404, { error: "not_found" });
      if (method === "DELETE") {
        db.channels = db.channels.filter((x) => x.id !== mm![1]);
        return J(204, {});
      }
    }

    // knowledge
    if (p === "/knowledge-bases" && method === "GET")
      return J(200, { knowledge_bases: db.kbs });
    if (p === "/knowledge-bases" && method === "POST") {
      const b = await body(route);
      const k = {
        id: id("kb"),
        embedding_model: "text-embedding-3-small",
        chunk_size: 800,
        chunk_overlap: 100,
        ...b,
      };
      db.kbs.push(k);
      db.docs[k.id] = [];
      return J(201, k);
    }
    mm = p.match(/^\/knowledge-bases\/([^/]+)\/documents\/text$/);
    if (mm) {
      const b = await body(route);
      const doc = {
        id: id("doc"),
        filename: (b.title as string) || "Texto",
        source_type: "text",
        status: "indexed",
        token_count: 42,
        created_at: new Date().toISOString(),
      };
      (db.docs[mm[1]] = db.docs[mm[1]] || []).push(doc);
      return J(201, doc);
    }
    mm = p.match(/^\/knowledge-bases\/([^/]+)\/documents$/);
    if (mm) {
      if (method === "GET") return J(200, { documents: db.docs[mm[1]] || [] });
      // file upload (multipart)
      const doc = {
        id: id("doc"),
        filename: "upload.txt",
        source_type: "file",
        status: "pending",
        token_count: 0,
        created_at: new Date().toISOString(),
      };
      (db.docs[mm[1]] = db.docs[mm[1]] || []).push(doc);
      return J(201, doc);
    }
    mm = p.match(/^\/knowledge-bases\/([^/]+)$/);
    if (mm) {
      const k = db.kbs.find((x) => x.id === mm![1]);
      if (method === "GET") return k ? J(200, k) : J(404, { error: "not_found" });
      if (method === "DELETE") {
        db.kbs = db.kbs.filter((x) => x.id !== mm![1]);
        return J(204, {});
      }
    }
    mm = p.match(/^\/documents\/([^/]+)$/);
    if (mm && method === "DELETE") {
      for (const k of Object.keys(db.docs))
        db.docs[k] = db.docs[k].filter((d) => d.id !== mm![1]);
      return J(204, {});
    }

    // automations
    if (p === "/automations" && method === "GET")
      return J(200, { automations: db.automations });
    if (p === "/automations" && method === "POST") {
      const b = await body(route);
      const a = { id: id("au"), is_active: true, fallback_message: "", debounce_seconds: 5, ...b };
      db.automations.push(a);
      return J(201, a);
    }
    mm = p.match(/^\/automations\/([^/]+)$/);
    if (mm) {
      const a = db.automations.find((x) => x.id === mm![1]);
      if (method === "PUT") {
        Object.assign(a as Json, await body(route));
        return J(200, a);
      }
      if (method === "DELETE") {
        db.automations = db.automations.filter((x) => x.id !== mm![1]);
        return J(204, {});
      }
    }

    // conversations + handover
    if (p.startsWith("/conversations") && method === "GET") {
      mm = p.match(/^\/conversations\/([^/]+)\/messages$/);
      if (mm) return J(200, { messages: db.messages[mm[1]] || [] });
      mm = p.match(/^\/conversations\/([^/]+)$/);
      if (mm) {
        const c = db.conversations.find((x) => x.id === mm![1]);
        return c ? J(200, c) : J(404, { error: "not_found" });
      }
      // list (optionally filtered by ?state=)
      const state = url.searchParams.get("state");
      const list = state
        ? db.conversations.filter((c) => c.state === state)
        : db.conversations;
      return J(200, { conversations: list });
    }
    mm = p.match(/^\/conversations\/([^/]+)\/handover\/(take|reply|return|close)$/);
    if (mm) {
      const [, cId, action] = mm;
      const c = db.conversations.find((x) => x.id === cId);
      if (c) {
        if (action === "take") c.state = "human";
        if (action === "return") c.state = "ai";
        if (action === "close") c.state = "closed";
        if (action === "reply") {
          const b = await body(route);
          (db.messages[cId] = db.messages[cId] || []).push({
            id: id("m"),
            direction: "outbound",
            sender_type: "human",
            content: b.content,
            status: "sent",
            created_at: new Date().toISOString(),
          });
        }
        c.last_message_at = new Date().toISOString();
      }
      return J(200, {});
    }

    // billing
    if (p === "/plans") return J(200, { plans: db.plans }); // public catalogue
    if (p === "/billing/subscription") return J(200, db.subscription);
    if (p === "/billing/usage") return J(200, db.usage);
    if (p === "/billing/plans") return J(200, { plans: db.plans });
    if (p === "/billing/checkout" && method === "POST") {
      const b = await body(route);
      // Same-origin URL so the redirect stays inside the app for the E2E run.
      return J(200, {
        checkout_url: `${url.origin}/dashboard/billing?checkout=success&plan=${b.plan_code as string}`,
      });
    }

    // Anything unhandled — fail loudly so missing mocks surface in tests.
    return route.fulfill({
      status: 501,
      contentType: "application/json",
      body: JSON.stringify({ error: "unmocked", path, method }),
    });
  });
}
