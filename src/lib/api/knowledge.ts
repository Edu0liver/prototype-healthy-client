import type {
  CreateKBRequest,
  DocumentsList,
  KnowledgeBase,
  KnowledgeBasesList,
  KnowledgeDocument,
  UploadTextRequest,
} from "@/types/api";

import { api } from "./client";

export const knowledgeService = {
  listBases: () =>
    api.get<KnowledgeBasesList>("/knowledge-bases").then((r) => r.knowledge_bases),
  getBase: (id: string) => api.get<KnowledgeBase>(`/knowledge-bases/${id}`),
  createBase: (body: CreateKBRequest) =>
    api.post<KnowledgeBase>("/knowledge-bases", body),
  removeBase: (id: string) => api.del<void>(`/knowledge-bases/${id}`),

  listDocuments: (kbId: string) =>
    api
      .get<DocumentsList>(`/knowledge-bases/${kbId}/documents`)
      .then((r) => r.documents),
  uploadFile: (kbId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.upload<KnowledgeDocument>(
      `/knowledge-bases/${kbId}/documents`,
      form,
    );
  },
  uploadText: (kbId: string, body: UploadTextRequest) =>
    api.post<KnowledgeDocument>(
      `/knowledge-bases/${kbId}/documents/text`,
      body,
    ),
  removeDocument: (docId: string) => api.del<void>(`/documents/${docId}`),
};
