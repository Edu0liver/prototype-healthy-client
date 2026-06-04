# Painel (Frontend)

Painel web **white-label** do SaaS de atendimento automatizado por IA. Consome a API Go (`prototype-healthy`) e dá ao tenant a gestão de agentes, canais, RAG, conversas/handover, faturação e logs em tempo real.

> Repositório **separado** do backend. Pressupõe a API a correr (ver §Pré-requisitos).

## Stack

- **Next.js 14 (App Router)** · **React 18** · **TypeScript**
- **Tailwind CSS** (UI própria, sem MUI)
- **TanStack Query** (estado de servidor: cache, invalidação, mutations)
- **lucide-react** (ícones) · **qrcode.react** (QR de canais)
- **Sem axios** — `fetch` nativo via route handlers do Next
- **Testes:** Jest + Testing Library + **MSW** (unit/integração) · **Playwright** (e2e)

## Arquitetura

```txt
Browser ──fetch same-origin──▶ Next Route Handlers ──Bearer(cookie)──▶ Go API (/api/v1)
   │  (nunca vê o token)         /api/auth/*  /api/v1/[...path]
   ▼
React (App Router) ── TanStack Query ── hooks (lib/hooks) ── services (lib/api) ── client.ts
```

- **Token nunca toca o browser.** O login guarda o JWT em **cookie httpOnly** (server-side). O browser faz chamadas *same-origin* aos route handlers do Next, que injetam o `Bearer` e fazem proxy para a API Go (com **refresh-on-401**).
- **Proxy genérico:** `src/app/api/v1/[...path]/route.ts` reencaminha qualquer `/api/v1/*` para o backend. Endpoints novos do backend funcionam sem código extra de proxy.
- **App Router groups:** `(auth)` (login/signup/convite, públicas) e `(dashboard)` (privadas, com Sidebar/Topbar).
- **Middleware** (`src/middleware.ts`): gateia rotas pela presença do cookie (dashboard exige sessão; páginas de auth redirecionam se já logado). A *validade* do token é garantida pelo backend a cada chamada.

## Estrutura de pastas

```txt
src/
├── app/
│   ├── api/                      # Route handlers (servidor)
│   │   ├── auth/{login,signup,logout,accept-invite}/route.ts   # set/clear cookie httpOnly
│   │   ├── realtime-token/route.ts                              # token efémero p/ WebSocket
│   │   └── v1/[...path]/route.ts                                # proxy autenticado → API Go
│   ├── (auth)/{login,signup,accept-invite}/                     # páginas públicas
│   ├── (dashboard)/                                             # páginas privadas
│   │   ├── layout.tsx            # Sidebar + Topbar + RealtimeProvider
│   │   ├── page.tsx              # Visão geral
│   │   ├── agents/ channels/ knowledge/ automations/
│   │   ├── conversations/ billing/ settings/
│   ├── layout.tsx · providers.tsx · globals.css
├── components/
│   ├── ui/        # primitivos: button, card, badge, dialog, field, states, toast
│   ├── layout/    # Sidebar, Topbar, PageHeader, RoleGuard, nav.ts
│   └── feature/   # blocos de domínio: MessageBubble, QrConnect, UsageBar
├── lib/
│   ├── api/       # 1 service por domínio (agents.ts, billing.ts, …) + client.ts (fetch wrapper)
│   ├── hooks/     # 1 hook-set por domínio (useAgents, useBilling, …) + keys.ts (query keys)
│   ├── auth/      # AuthContext (user/isAuthenticated/login/logout)
│   ├── realtime/  # RealtimeContext (WebSocket via Redis Pub/Sub do backend)
│   ├── server/    # backend.ts (proxy+refresh), session.ts (cookies), config.ts
│   └── utils/     # cn (classes), format (datas/números)
├── types/         # api.ts (espelha DTOs do backend) · enums.ts (espelha oneof/PRD)
└── middleware.ts  # guard de rotas por cookie
```

## Camadas (como o dado flui)

`page.tsx` → **hook** (`lib/hooks/useX`) → **service** (`lib/api/x.ts`) → **client** (`lib/api/client.ts` → `fetch /api/v1/...`) → **proxy** (route handler) → **API Go**.

- **`lib/api/client.ts`** — `api.get/post/put/del/upload`; normaliza erros (`ApiClientError` com `status`/`code`); num `401` redireciona para `/login`.
- **`lib/api/<dominio>.ts`** — funções tipadas por endpoint (ex.: `billingService.getUsage()`).
- **`lib/hooks/use<Dominio>.ts`** — `useQuery`/`useMutation` + invalidação via `keys.ts`.
- **`components/ui`** — primitivos reutilizáveis; **`components/feature`** — blocos de domínio.

## Páginas (dashboard)

| Rota | Descrição | Role |
| --- | --- | --- |
| `/` | Visão geral | todos |
| `/conversations` | Conversas, histórico, handover (take/reply/return/close) | admin, operator |
| `/channels` | Canais WhatsApp/Instagram; ligar via QR/pairing; estado | admin |
| `/agents` | CRUD de agentes; ligar bases RAG (N:M) | admin |
| `/knowledge` | Bases RAG; upload de ficheiros/texto; estado de indexação | admin, knowledge_manager |
| `/automations` | Binding canal↔agente (1 agente por canal) | admin |
| `/billing` | Subscrição, consumo (uso vs quota), planos + checkout Stripe | admin |
| `/settings` | White-label (branding, domínios), utilizadores | admin |

Visibilidade por papel vive em `src/components/layout/nav.ts`.

## Modelo de autenticação (passo a passo)

1. **Login** (`/login`) → `POST /api/auth/login` (route handler) → backend devolve `access`+`refresh` → handler grava ambos em **cookies httpOnly** (`setSession`).
2. **Middleware** deixa entrar no `(dashboard)` porque o cookie existe.
3. **AuthContext** chama `GET /api/v1/auth/me` (via proxy) para obter o utilizador.
4. Toda chamada de domínio passa pelo proxy `[...path]`, que injeta o `Bearer` do cookie. Num `401`, `backend.ts` tenta **refresh** e repete; se falhar, limpa a sessão.
5. **Logout** → `POST /api/auth/logout` limpa os cookies.

---

## Pré-requisitos

- Node.js 18+ (ou 20+) e `npm`
- **Backend a correr** (`prototype-healthy`) — ver README do backend (`make up-db` + `make migrate-up` + `make run`, em `http://localhost:8080`).

## Rodando localmente

```bash
# 1. Variáveis de ambiente
cp .env.local.example .env.local 2>/dev/null || true
#   BACKEND_API_URL   — alvo do proxy server-side (ex.: http://localhost:8080)
#   NEXT_PUBLIC_WS_URL — WebSocket do backend p/ realtime (ex.: ws://localhost:8080)

# 2. Dependências
npm install

# 3. Servidor de desenvolvimento (porta 3000)
npm run dev
```

Abre `http://localhost:3000`. Cria o tenant pelo backend (`make seed` → `admin@demo.com` / `demodemo`) ou pela página `/signup`, e faz login.

## Fluxo da aplicação (ponta a ponta)

Pressupõe backend + frontend de pé e um tenant com login.

1. **Entrar** — `/login` com email/senha → redirecionado para a Visão geral.
2. **Criar agente** — `/agents` → *Novo agente*: nome, prompt de sistema, modelo, temperatura, handover.
3. **Base de conhecimento (RAG)** — `/knowledge` → *Nova base* → abrir a base → upload de ficheiro/texto (indexação assíncrona; estado `pending→indexed`). Em `/agents/:id`, ligar a base ao agente (N:M).
4. **Canal + automação** — `/channels` → *Novo canal* WhatsApp → *Ligar* (QR/pairing via `QrConnect`). Em `/automations`, vincular **um** agente ao canal.
5. **Conversa + handover** — quando chega mensagem (ou simulada pelo webhook do backend), aparece em `/conversations`. Abrir a conversa: histórico em tempo real; operador pode *assumir → responder → devolver → fechar*. Em estado `human` a IA não responde.
6. **Tempo real** — o `RealtimeProvider` abre o WebSocket (`/api/realtime-token` → `NEXT_PUBLIC_WS_URL`); novas mensagens/estados chegam sem refresh.
7. **Faturação** — `/billing`: card da subscrição (estado), consumo do período por dimensão (`UsageBar`: uso vs quota, ∞ quando ilimitado) e catálogo de planos com **checkout** (redirect para a sessão Stripe).
8. **White-label / utilizadores** — `/settings`: branding (logo/cores/domínios) e convites de utilizadores por papel.

---

## Testes

```bash
npm test            # Jest: unit (componentes) + integração (páginas/serviços) com MSW
npm run test:watch  # Jest watch
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (next lint)
npm run e2e         # Playwright (sobe a app e percorre os fluxos com backend mockado)
npm run e2e:ui      # Playwright em modo UI
```

- **Unit/integração** (`tests/`): `renderWithProviders` (Query+Toast+Auth) + **MSW** (`tests/mocks/handlers.ts`) intercetando `/api/*`. Ex.: `tests/components/UsageBar.test.tsx`, `tests/integration/billing*.test.tsx`.
- **E2E** (`e2e/`): backend totalmente **mockado** em `e2e/utils/mockApi.ts` (store em memória), `fixtures.ts` (`authedTest` injeta cookie). 1 spec por domínio (`agents.spec.ts`, `billing.spec.ts`, …).

## Build / Deploy

```bash
npm run build && npm run start   # build de produção + serve (porta 3000)
```

Em produção define `BACKEND_API_URL` (interno, server-side) e `NEXT_PUBLIC_WS_URL` (público). O token nunca é exposto ao browser (cookies httpOnly + proxy).

---

## Guia: adicionar um módulo novo

Segue o padrão de um módulo existente (ex.: `agents`/`billing`). Para um domínio `<x>`:

1. **Tipos** — em `src/types/api.ts` (espelha o DTO do backend) e enums em `src/types/enums.ts`.
2. **Service** — `src/lib/api/<x>.ts`: funções por endpoint usando `api` de `client.ts`.
3. **Query keys** — adiciona entradas em `src/lib/hooks/keys.ts`.
4. **Hooks** — `src/lib/hooks/use<X>.ts`: `useQuery`/`useMutation` + invalidação.
5. **Página** — `src/app/(dashboard)/<x>/page.tsx` reutilizando `PageHeader`, `Card`, `Button`, `states` (`Loading/EmptyState/ErrorState`), `useToast`.
6. **Componentes** — primitivos em `components/ui`; blocos de domínio em `components/feature`.
7. **Navegação** — entrada em `src/components/layout/nav.ts` (com `roles`).
8. **Testes** — componente (Jest), chamadas de rota (Jest+MSW), página (integração) e e2e (Playwright + mock em `e2e/utils/mockApi.ts`).

> Regra: o browser só fala com `/api/*` (same-origin). Nunca chamar o backend diretamente nem manusear tokens no cliente.
