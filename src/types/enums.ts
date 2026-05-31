// Mirrors the string enums used across the Go backend (validator `oneof` tags
// and PRD §3). Kept as const objects + unions for ergonomic, type-safe usage.

export const Role = {
  Admin: "admin",
  Operator: "operator",
  KnowledgeManager: "knowledge_manager",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  Active: "active",
  Invited: "invited",
  Disabled: "disabled",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ChannelType = {
  WhatsApp: "whatsapp",
  Instagram: "instagram",
} as const;
export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const ChannelStatus = {
  Disconnected: "disconnected",
  Connecting: "connecting",
  Connected: "connected",
  Error: "error",
} as const;
export type ChannelStatus = (typeof ChannelStatus)[keyof typeof ChannelStatus];

export const ConnectMethod = {
  QR: "qr",
  Pairing: "pairing",
} as const;
export type ConnectMethod = (typeof ConnectMethod)[keyof typeof ConnectMethod];

export const AgentStatus = {
  Active: "active",
  Draft: "draft",
} as const;
export type AgentStatus = (typeof AgentStatus)[keyof typeof AgentStatus];

export const ConversationState = {
  AI: "ai",
  Human: "human",
  Closed: "closed",
} as const;
export type ConversationState =
  (typeof ConversationState)[keyof typeof ConversationState];

export const MessageDirection = {
  Inbound: "inbound",
  Outbound: "outbound",
} as const;
export type MessageDirection =
  (typeof MessageDirection)[keyof typeof MessageDirection];

export const SenderType = {
  Contact: "contact",
  AI: "ai",
  Human: "human",
} as const;
export type SenderType = (typeof SenderType)[keyof typeof SenderType];

export const MessageStatus = {
  Received: "received",
  Sent: "sent",
  Delivered: "delivered",
  Read: "read",
  Failed: "failed",
} as const;
export type MessageStatus = (typeof MessageStatus)[keyof typeof MessageStatus];

export const DocumentStatus = {
  Pending: "pending",
  Processing: "processing",
  Indexed: "indexed",
  Failed: "failed",
} as const;
export type DocumentStatus =
  (typeof DocumentStatus)[keyof typeof DocumentStatus];

export const SourceType = {
  File: "file",
  Text: "text",
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

// Realtime WS event types (internal/shared/events/events.go).
export const RealtimeEventType = {
  Message: "message",
  State: "state",
} as const;
export type RealtimeEventType =
  (typeof RealtimeEventType)[keyof typeof RealtimeEventType];
