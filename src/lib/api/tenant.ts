import type {
  AddDomainRequest,
  Branding,
  Company,
  Domain,
  DomainsList,
  UpdateBrandingRequest,
} from "@/types/api";

import { api } from "./client";

export const tenantService = {
  getCompany: () => api.get<Company>("/company"),

  getBranding: () => api.get<Branding>("/branding"),
  updateBranding: (body: UpdateBrandingRequest) =>
    api.put<Branding>("/branding", body),

  // Public theme lookup by host (used by the runtime theming layer).
  getBrandingByHost: (host: string) =>
    api.get<Branding>(`/branding/host?host=${encodeURIComponent(host)}`),

  listDomains: () => api.get<DomainsList>("/domains").then((r) => r.domains),
  addDomain: (body: AddDomainRequest) => api.post<Domain>("/domains", body),
};
