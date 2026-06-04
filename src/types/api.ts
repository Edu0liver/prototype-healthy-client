// TypeScript mirrors of the backend DTOs (internal/modules/*/dto). Field names
// match the JSON tags exactly. Optional fields use `?` where the Go side uses
// `omitempty` on pointers/slices.

import type {
  AgentStatus,
  ChannelStatus,
  ChannelType,
  ConversationState,
  DocumentStatus,
  MessageDirection,
  MessageStatus,
  RealtimeEventType,
  Role,
  SenderType,
  SourceType,
  SubscriptionStatus,
  UsageKind,
  UserStatus,
} from "./enums";

// ---- Shared ----------------------------------------------------------------

export interface ApiError {
  error: string;
  message?: string;
  code?: string;
}

// ---- IAM -------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterAdminRequest {
  company_id: string;
  email: string;
  password: string;
  name?: string;
}

export interface InviteRequest {
  email: string;
  name?: string;
  role: Role;
}

export interface AcceptInviteRequest {
  token: string;
  password: string;
}

// ---- Tenant ----------------------------------------------------------------

export interface CreateCompanyRequest {
  name: string;
  slug: string;
  plan?: string;
  email?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  created_at: string;
}

export interface UpdateBrandingRequest {
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  email_sender_name?: string;
}

export interface Branding {
  company_id: string;
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  email_sender_name: string;
}

export interface AddDomainRequest {
  domain: string;
  is_primary: boolean;
}

export interface Domain {
  id: string;
  domain: string;
  is_primary: boolean;
  verified_at: string | null;
}

// ---- Agent -----------------------------------------------------------------

export interface Agent {
  id: string;
  name: string;
  system_prompt: string;
  model: string;
  temperature: number;
  max_output_tokens: number;
  handover_enabled: boolean;
  handover_keywords: string[] | null;
  status: AgentStatus;
}

export interface CreateAgentRequest {
  name: string;
  system_prompt: string;
  model?: string;
  temperature?: number;
  max_output_tokens?: number;
  handover_enabled?: boolean;
  handover_keywords?: string[];
  status?: AgentStatus;
}

export type UpdateAgentRequest = Partial<CreateAgentRequest>;

// ---- Channel ---------------------------------------------------------------

export interface Channel {
  id: string;
  type: ChannelType;
  name: string;
  status: ChannelStatus;
  external_account_id: string;
  instance_name?: string;
  active_agent_id?: string | null;
}

export interface CreateChannelRequest {
  type: ChannelType;
  name?: string;
  number?: string;
}

export interface ConnectRequest {
  number?: string;
}

export interface ConnectResponse {
  qr_code?: string;
  pairing_code?: string;
  state: string;
}

export interface ConnectionState {
  state: string;
}

// ---- Automation ------------------------------------------------------------

export interface Automation {
  id: string;
  channel_id: string;
  agent_id: string;
  is_active: boolean;
  fallback_message: string;
  debounce_seconds: number;
}

export interface CreateAutomationRequest {
  channel_id: string;
  agent_id: string;
  is_active?: boolean;
  business_hours?: Record<string, unknown>;
  fallback_message?: string;
  debounce_seconds?: number;
}

export interface UpdateAutomationRequest {
  agent_id?: string;
  is_active?: boolean;
  business_hours?: Record<string, unknown>;
  fallback_message?: string;
  debounce_seconds?: number;
}

// ---- Knowledge -------------------------------------------------------------

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  embedding_model: string;
  chunk_size: number;
  chunk_overlap: number;
}

export interface CreateKBRequest {
  name: string;
  description?: string;
  embedding_model?: string;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface UploadTextRequest {
  title?: string;
  content: string;
}

export interface KnowledgeDocument {
  id: string;
  filename: string;
  source_type: SourceType;
  status: DocumentStatus;
  error?: string;
  token_count: number;
  created_at: string;
}

// ---- Conversation ----------------------------------------------------------

export interface Conversation {
  id: string;
  channel_id: string;
  contact_id: string;
  agent_id?: string | null;
  state: ConversationState;
  assigned_user_id?: string | null;
  last_message_at?: string | null;
  opened_at: string;
  closed_at?: string | null;
}

export interface Message {
  id: string;
  direction: MessageDirection;
  sender_type: SenderType;
  content: string;
  media?: Record<string, unknown>;
  external_message_id?: string;
  status: MessageStatus;
  created_at: string;
}

export interface ConversationFilter {
  state?: ConversationState;
  channel_id?: string;
  since?: string;
}

// ---- Handover --------------------------------------------------------------

export interface ReplyRequest {
  content: string;
}

// ---- Realtime --------------------------------------------------------------

export interface RealtimeEvent {
  type: RealtimeEventType;
  conversation_id: string;
  payload?: Record<string, unknown>;
}

// ---- List envelopes (handlers wrap arrays under a named key) ---------------

export interface ListEnvelope<K extends string, T> {
  // helper-only; concrete responses below.
  [key: string]: T[];
}

export type AgentsList = { agents: Agent[] };
export type ChannelsList = { channels: Channel[] };
export type AutomationsList = { automations: Automation[] };
export type ConversationsList = { conversations: Conversation[] };
export type MessagesList = { messages: Message[] };
export type KnowledgeBasesList = { knowledge_bases: KnowledgeBase[] };
export type DocumentsList = { documents: KnowledgeDocument[] };
export type UsersList = { users: User[] };
export type DomainsList = { domains: Domain[] };

// ---- Billing ---------------------------------------------------------------

export interface Subscription {
  plan_code: string;
  plan_name: string;
  status: SubscriptionStatus;
  billing_cycle: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  price_cents: number;
  currency: string;
}

export interface UsageItem {
  kind: UsageKind;
  used: number;
  quota: number; // 0 = unlimited
  unlimited: boolean;
}

export interface UsageResponse {
  period_start: string;
  period_end: string;
  items: UsageItem[];
}

export interface Plan {
  code: string;
  name: string;
  price_cents: number;
  currency: string;
  quota_ai_messages: number;
  quota_tokens: number;
  quota_audio_minutes: number;
  quota_storage_mb: number;
  max_channels: number;
  max_agents: number;
  max_kb: number;
  max_seats: number;
  purchasable: boolean;
}

export type PlansList = { plans: Plan[] };

export interface CheckoutRequest {
  plan_code: string;
}

export interface CheckoutResponse {
  checkout_url: string;
}
