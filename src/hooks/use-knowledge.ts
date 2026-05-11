"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Query Keys
// ============================================================================

const KEYS = {
  folders: ["knowledge-folders"] as const,
  tags: ["knowledge-tags"] as const,
  documents: (filters?: Record<string, string | null>) =>
    ["knowledge-documents", filters] as const,
  document: (id: string) => ["knowledge-document", id] as const,
};

// ============================================================================
// Types
// ============================================================================

export interface KnowledgeFolder {
  id: string;
  name: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface FolderTreeNode extends KnowledgeFolder {
  children: FolderTreeNode[];
  fileCount?: number;
}

export interface DocumentTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  source: string | null;
  metadata: Record<string, unknown>;
  status: string;
  filename: string | null;
  file_path: string | null;
  content_type: string | null;
  created_by: string | null;
  folder_id: string | null;
  version: string;
  version_number: number;
  is_current: boolean;
  parent_document_id: string | null;
  created_at: string;
  updated_at: string;
  ai_applied_at: string | null;
  tags: { id: string; name: string; color: string }[];
}

export interface KnowledgeDocumentDetail extends KnowledgeDocument {
  creator: {
    id: string;
    full_name_th: string;
    full_name_en: string | null;
    avatar_url: string | null;
  } | null;
  ai_suggestion?: Record<string, unknown> | null;
}

// ============================================================================
// Folder Hooks
// ============================================================================

function buildFolderTree(folders: KnowledgeFolder[]): FolderTreeNode[] {
  const map = new Map<string, FolderTreeNode>();
  const roots: FolderTreeNode[] = [];

  for (const f of folders) {
    map.set(f.id, { ...f, children: [] });
  }

  for (const f of folders) {
    const node = map.get(f.id)!;
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export function useKnowledgeFolders() {
  return useQuery({
    queryKey: KEYS.folders,
    queryFn: async () => {
      const res = await fetch("/api/admin/knowledge/folders");
      if (!res.ok) throw new Error("Failed to fetch folders");
      const { folders } = await res.json();
      return folders as KnowledgeFolder[];
    },
  });
}

export function useFolderTree() {
  const { data: folders, ...rest } = useKnowledgeFolders();
  return {
    ...rest,
    data: folders ? buildFolderTree(folders) : [],
    flatFolders: folders ?? [],
  };
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      parentId?: string | null;
      description?: string | null;
    }) => {
      const res = await fetch("/api/admin/knowledge/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      parentId?: string | null;
      description?: string | null;
      sortOrder?: number;
    }) => {
      const res = await fetch(`/api/admin/knowledge/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update folder");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/knowledge/folders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.folders });
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
  });
}

// ============================================================================
// Tag Hooks
// ============================================================================

export function useDocumentTags() {
  return useQuery({
    queryKey: KEYS.tags,
    queryFn: async () => {
      const res = await fetch("/api/admin/knowledge/tags");
      if (!res.ok) throw new Error("Failed to fetch tags");
      const { tags } = await res.json();
      return tags as DocumentTag[];
    },
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; color?: string }) => {
      const res = await fetch("/api/admin/knowledge/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create tag");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.tags });
    },
  });
}

export function useUpdateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      name?: string;
      color?: string;
    }) => {
      const res = await fetch(`/api/admin/knowledge/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update tag");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.tags });
    },
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/knowledge/tags/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete tag");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.tags });
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
  });
}

// ============================================================================
// Document Hooks
// ============================================================================

export function useKnowledgeDocuments(filters?: {
  folderId?: string | null;
  tagId?: string | null;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}) {
  const params: Record<string, string | null> = {
    folderId: filters?.folderId ?? null,
    tagId: filters?.tagId ?? null,
    search: filters?.search || null,
    status: filters?.status || null,
    sortBy: filters?.sortBy || null,
    sortOrder: filters?.sortOrder || null,
  };

  return useQuery({
    queryKey: KEYS.documents(params),
    queryFn: async () => {
      const sp = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) sp.set(k, v);
      });
      const res = await fetch(`/api/admin/knowledge/documents?${sp.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      const { documents } = await res.json();
      return documents as KnowledgeDocument[];
    },
  });
}

export function useKnowledgeDocument(id: string | null) {
  return useQuery({
    queryKey: KEYS.document(id ?? ""),
    enabled: !!id,
    queryFn: async () => {
      const res = await fetch(`/api/admin/knowledge/documents/${id}`);
      if (!res.ok) throw new Error("Failed to fetch document");
      const { document } = await res.json();
      return document as KnowledgeDocumentDetail;
    },
  });
}

export function useUploadKnowledgeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      file: File;
      folderId?: string | null;
      tagIds?: string[];
    }) => {
      const formData = new FormData();
      formData.append("file", input.file);
      if (input.folderId) formData.append("folderId", input.folderId);
      if (input.tagIds?.length) formData.append("tagIds", input.tagIds.join(","));

      const res = await fetch("/api/admin/knowledge/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      folderId?: string | null;
      version?: string;
      tagIds?: string[];
    }) => {
      const res = await fetch(`/api/admin/knowledge/documents/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update document");
      return res.json();
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
      qc.invalidateQueries({ queryKey: KEYS.document(vars.id) });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/knowledge/documents/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete document");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
    },
  });
}

export function useBulkDocumentAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      action: "move" | "delete" | "tag" | "reprocess";
      documentIds: string[];
      folderId?: string | null;
      tagIds?: string[];
    }) => {
      const res = await fetch("/api/admin/knowledge/documents/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Bulk action failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
      qc.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useDocumentQuery() {
  return useMutation({
    mutationFn: async (input: { question: string; documentId?: string }) => {
      const res = await fetch("/api/admin/knowledge/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Query failed");
      return res.json() as Promise<{
        answer: string;
        sources: { content: string; similarity: number }[];
      }>;
    },
  });
}

// ============================================================================
// AI Suggestion Hooks (Phase: AI-assisted upload + versioning)
// ============================================================================

export interface AISuggestion {
  suggestedFilename: string;
  suggestedFolderId: string | null;
  suggestedNewFolder: { name: string } | null;
  suggestedTagIds: string[];
  suggestedNewTags: string[];
  summary: string;
  confidence: number;
}

export interface VersionMatch {
  parentId: string;
  parentTitle: string;
  parentVersion: number;
  matchType: "filename" | "content";
  confidence: number;
}

export interface AnalyzeResult {
  documentId: string;
  filename: string | null;
  suggestion: AISuggestion | null;
  versionMatch: VersionMatch | null;
}

export function useAnalyzeDocument() {
  return useMutation({
    mutationFn: async (input: { documentId: string }) => {
      const res = await fetch("/api/admin/knowledge/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Analyze failed");
      return res.json() as Promise<AnalyzeResult>;
    },
  });
}

export interface ApplySuggestionInput {
  documentId: string;
  accepted: {
    filename?: string;
    folderId?: string | null;
    newFolderName?: string;
    newFolderParentId?: string | null;
    tagIds?: string[];
    newTagNames?: string[];
    versionOf?: string;
  };
  suggestionSnapshot?: Record<string, unknown>;
}

export function useApplySuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ApplySuggestionInput) => {
      const res = await fetch("/api/admin/knowledge/apply-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Apply failed");
      }
      return res.json() as Promise<{
        document: KnowledgeDocument;
        versionNumber: number;
        parentDocumentId: string | null;
      }>;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["knowledge-documents"] });
      qc.invalidateQueries({ queryKey: KEYS.folders });
      qc.invalidateQueries({ queryKey: KEYS.tags });
      qc.invalidateQueries({ queryKey: KEYS.document(vars.documentId) });
    },
  });
}

export interface FeedbackInput {
  documentId: string;
  rating: "up" | "down";
  comment?: string;
  suggestionSnapshot?: Record<string, unknown>;
  acceptedFields?: string[];
}

export function useAISuggestionFeedback() {
  return useMutation({
    mutationFn: async (input: FeedbackInput) => {
      const res = await fetch("/api/admin/knowledge/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Feedback failed");
      return res.json();
    },
  });
}

export interface DocumentVersion {
  id: string;
  title: string;
  filename: string | null;
  version_number: number;
  is_current: boolean;
  created_at: string;
  created_by: string | null;
  parent_document_id: string | null;
  creator: { full_name_th: string | null; avatar_url: string | null } | null;
}

export interface AIFeedbackStats {
  windowDays: number;
  total: number;
  ups: number;
  downs: number;
  upPct: number;
  fieldCounts: Record<string, number>;
  recentComments: Array<{
    id: string;
    rating: "up" | "down";
    comment: string;
    createdAt: string;
    documentId: string;
    documentTitle: string;
  }>;
}

export function useAIFeedbackStats() {
  return useQuery({
    queryKey: ["ai-feedback-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/ai-feedback-stats");
      if (!res.ok) throw new Error("Failed to fetch feedback stats");
      return res.json() as Promise<AIFeedbackStats>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocumentVersions(documentId: string | null) {
  return useQuery({
    queryKey: ["knowledge-document-versions", documentId ?? ""],
    enabled: !!documentId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/knowledge/documents/${documentId}/versions`);
      if (!res.ok) throw new Error("Failed to fetch versions");
      return res.json() as Promise<{ rootId: string; versions: DocumentVersion[] }>;
    },
  });
}
