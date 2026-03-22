import { create } from "zustand";

export type KnowledgeView = "folder" | "file-detail" | "playground";
export type SidebarMode = "folders" | "files";
export type SortBy = "date" | "name";
export type SortOrder = "asc" | "desc";

interface KnowledgeState {
  view: KnowledgeView;
  selectedFolderId: string | null;
  selectedFileId: string | null;
  selectedFileIds: string[];
  sidebarMode: SidebarMode;
  searchQuery: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  filterStatus: string;
  filterTagId: string | null;
  expandedFolders: Set<string>;
  nestedSidebarCollapsed: boolean;

  setView: (view: KnowledgeView) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedFileId: (id: string | null) => void;
  setSelectedFileIds: (ids: string[]) => void;
  toggleFileSelection: (id: string) => void;
  toggleSelectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setSidebarMode: (mode: SidebarMode) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: SortBy) => void;
  toggleSortOrder: () => void;
  setFilterStatus: (status: string) => void;
  setFilterTagId: (tagId: string | null) => void;
  toggleFolder: (id: string) => void;
  toggleNestedSidebar: () => void;
  openFile: (id: string) => void;
  goBack: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set, get) => ({
  view: "folder",
  selectedFolderId: null,
  selectedFileId: null,
  selectedFileIds: [],
  sidebarMode: "folders",
  searchQuery: "",
  sortBy: "date",
  sortOrder: "desc",
  filterStatus: "all",
  filterTagId: null,
  expandedFolders: new Set<string>(),
  nestedSidebarCollapsed: false,

  setView: (view) => set({ view }),
  setSelectedFolderId: (id) =>
    set({ selectedFolderId: id, selectedFileIds: [], view: "folder" }),
  setSelectedFileId: (id) => set({ selectedFileId: id }),
  setSelectedFileIds: (ids) => set({ selectedFileIds: ids }),

  toggleFileSelection: (id) =>
    set((s) => {
      const newSet = new Set(s.selectedFileIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { selectedFileIds: Array.from(newSet) };
    }),

  toggleSelectAll: (ids) =>
    set((s) => {
      const allSelected = ids.every((id) => s.selectedFileIds.includes(id));
      return { selectedFileIds: allSelected ? [] : ids };
    }),

  clearSelection: () => set({ selectedFileIds: [] }),

  setSidebarMode: (mode) => set({ sidebarMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  toggleSortOrder: () =>
    set((s) => ({ sortOrder: s.sortOrder === "asc" ? "desc" : "asc" })),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterTagId: (tagId) => set({ filterTagId: tagId }),

  toggleNestedSidebar: () =>
    set((s) => ({ nestedSidebarCollapsed: !s.nestedSidebarCollapsed })),

  toggleFolder: (id) =>
    set((s) => {
      const next = new Set(s.expandedFolders);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedFolders: next };
    }),

  openFile: (id) =>
    set({
      selectedFileId: id,
      view: "file-detail",
      sidebarMode: "files",
    }),

  goBack: () => {
    const s = get();
    if (s.view === "file-detail") {
      set({ view: "folder", selectedFileId: null, sidebarMode: "folders" });
    }
  },
}));
