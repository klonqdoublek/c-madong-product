import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Query Keys
// ============================================================================

const KEYS = {
  folders: ["announcement-folders"] as const,
  tags: ["announcement-tags"] as const,
  announcements: (filters?: any) => ["announcements-organized", filters] as const,
};

// ============================================================================
// Types
// ============================================================================

interface AnnouncementFolder {
  id: string;
  name: string;
  icon: string;
  color: string;
  parent_id: string | null;
  description: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  children?: AnnouncementFolder[];
  announcement_count?: number;
}

interface AnnouncementTag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

interface OrganizedAnnouncement {
  id: string;
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  category: string;
  priority: string;
  folder_id: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  tags?: AnnouncementTag[];
  folder?: AnnouncementFolder;
}

interface CreateFolderData {
  name: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  description?: string;
}

interface UpdateFolderData {
  name?: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder?: number;
}

interface CreateTagData {
  name: string;
  color?: string;
}

interface UpdateTagData {
  name?: string;
  color?: string;
}

interface BulkOperationData {
  action: "move" | "tag" | "archive" | "restore";
  announcementIds: string[];
  folderId?: string | null;
  tagIds?: string[];
}

interface AnnouncementFilters {
  folderId?: string | null | "all";
  tagId?: string;
  search?: string;
  archived?: boolean | null;
}

// ============================================================================
// Folder Hooks
// ============================================================================

export function useAnnouncementFolders() {
  return useQuery({
    queryKey: KEYS.folders,
    queryFn: async () => {
      const response = await fetch("/api/admin/announcements/folders");
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const data = await response.json();
      return data.folders as AnnouncementFolder[];
    },
  });
}

export function useFolderTree() {
  const { data: folders, ...rest } = useAnnouncementFolders();

  // Build tree structure from flat list
  const tree = folders
    ? buildFolderTree(folders)
    : [];

  return {
    ...rest,
    data: tree,
  };
}

export function useCreateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFolderData) => {
      const response = await fetch("/api/admin/announcements/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create folder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
    },
  });
}

export function useUpdateFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFolderData }) => {
      const response = await fetch(`/api/admin/announcements/folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update folder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/announcements/folders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete folder");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
    },
  });
}

// ============================================================================
// Tag Hooks
// ============================================================================

export function useAnnouncementTags() {
  return useQuery({
    queryKey: KEYS.tags,
    queryFn: async () => {
      const response = await fetch("/api/admin/announcements/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      const data = await response.json();
      return data.tags as AnnouncementTag[];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTagData) => {
      const response = await fetch("/api/admin/announcements/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create tag");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.tags });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTagData }) => {
      const response = await fetch(`/api/admin/announcements/tags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update tag");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.tags });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/announcements/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete tag");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.tags });
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
    },
  });
}

// ============================================================================
// Bulk Operation Hooks
// ============================================================================

export function useBulkMove() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { announcementIds: string[]; folderId: string | null }) => {
      const response = await fetch("/api/admin/announcements/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move",
          announcementIds: data.announcementIds,
          folderId: data.folderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to move announcements");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useBulkTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { announcementIds: string[]; tagIds: string[] }) => {
      const response = await fetch("/api/admin/announcements/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tag",
          announcementIds: data.announcementIds,
          tagIds: data.tagIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to tag announcements");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
    },
  });
}

export function useBulkArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementIds: string[]) => {
      const response = await fetch("/api/admin/announcements/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive",
          announcementIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to archive announcements");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

export function useBulkRestore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementIds: string[]) => {
      const response = await fetch("/api/admin/announcements/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restore",
          announcementIds,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to restore announcements");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.announcements() });
      queryClient.invalidateQueries({ queryKey: KEYS.folders });
    },
  });
}

// ============================================================================
// Organized Announcements Query
// ============================================================================

export function useOrganizedAnnouncements(filters?: AnnouncementFilters) {
  return useQuery({
    queryKey: KEYS.announcements(filters),
    queryFn: async () => {
      // Build query params
      const params = new URLSearchParams();

      if (filters?.folderId && filters.folderId !== "all") {
        params.append("folderId", filters.folderId);
      }

      if (filters?.tagId) {
        params.append("tagId", filters.tagId);
      }

      if (filters?.search) {
        params.append("search", filters.search);
      }

      if (filters?.archived !== undefined && filters?.archived !== null) {
        params.append("archived", String(filters.archived));
      }

      const response = await fetch(`/api/admin/announcements?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await response.json();
      return data.announcements as OrganizedAnnouncement[];
    },
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

function buildFolderTree(folders: AnnouncementFolder[]): AnnouncementFolder[] {
  const folderMap = new Map<string, AnnouncementFolder>();
  const rootFolders: AnnouncementFolder[] = [];

  // Initialize map with all folders
  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [] });
  });

  // Build tree structure
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id);
    if (!node) return;

    if (folder.parent_id) {
      const parent = folderMap.get(folder.parent_id);
      if (parent) {
        parent.children!.push(node);
      } else {
        // Parent not found, treat as root
        rootFolders.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  });

  return rootFolders;
}
