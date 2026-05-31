import type {
  Automation,
  AutomationsList,
  CreateAutomationRequest,
  UpdateAutomationRequest,
} from "@/types/api";

import { api } from "./client";

export const automationService = {
  list: () =>
    api.get<AutomationsList>("/automations").then((r) => r.automations),
  get: (id: string) => api.get<Automation>(`/automations/${id}`),
  create: (body: CreateAutomationRequest) =>
    api.post<Automation>("/automations", body),
  update: (id: string, body: UpdateAutomationRequest) =>
    api.put<Automation>(`/automations/${id}`, body),
  remove: (id: string) => api.del<void>(`/automations/${id}`),
};
