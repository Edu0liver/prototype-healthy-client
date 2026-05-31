"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { knowledgeService } from "@/lib/api/knowledge";
import type { CreateKBRequest, UploadTextRequest } from "@/types/api";

import { qk } from "./keys";

export function useKnowledgeBases() {
  return useQuery({
    queryKey: qk.knowledgeBases,
    queryFn: knowledgeService.listBases,
  });
}

export function useKnowledgeBase(id: string) {
  return useQuery({
    queryKey: qk.knowledgeBase(id),
    queryFn: () => knowledgeService.getBase(id),
    enabled: Boolean(id),
  });
}

export function useCreateKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateKBRequest) => knowledgeService.createBase(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.knowledgeBases }),
  });
}

export function useDeleteKnowledgeBase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => knowledgeService.removeBase(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.knowledgeBases }),
  });
}

export function useDocuments(kbId: string, poll = false) {
  return useQuery({
    queryKey: qk.documents(kbId),
    queryFn: () => knowledgeService.listDocuments(kbId),
    enabled: Boolean(kbId),
    // Poll while indexing is in progress so status transitions surface live.
    refetchInterval: poll ? 4000 : false,
  });
}

export function useUploadFile(kbId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => knowledgeService.uploadFile(kbId, file),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.documents(kbId) }),
  });
}

export function useUploadText(kbId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UploadTextRequest) =>
      knowledgeService.uploadText(kbId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.documents(kbId) }),
  });
}

export function useDeleteDocument(kbId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId: string) => knowledgeService.removeDocument(docId),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.documents(kbId) }),
  });
}
