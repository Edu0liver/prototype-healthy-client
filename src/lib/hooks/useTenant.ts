"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tenantService } from "@/lib/api/tenant";
import { userService } from "@/lib/api/users";
import type {
  AddDomainRequest,
  InviteRequest,
  UpdateBrandingRequest,
} from "@/types/api";

import { qk } from "./keys";

export function useCompany() {
  return useQuery({ queryKey: qk.company, queryFn: tenantService.getCompany });
}

export function useBranding() {
  return useQuery({
    queryKey: qk.branding,
    queryFn: tenantService.getBranding,
  });
}

export function useUpdateBranding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateBrandingRequest) =>
      tenantService.updateBranding(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.branding }),
  });
}

export function useDomains() {
  return useQuery({ queryKey: qk.domains, queryFn: tenantService.listDomains });
}

export function useAddDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddDomainRequest) => tenantService.addDomain(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.domains }),
  });
}

export function useUsers() {
  return useQuery({ queryKey: qk.users, queryFn: userService.list });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InviteRequest) => userService.invite(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.users }),
  });
}
