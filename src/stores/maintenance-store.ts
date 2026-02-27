"use client";

import { create } from "zustand";
import type { MaintenanceStatus } from "@/lib/supabase/types";
import type { TicketFilters } from "@/types/maintenance";

type ViewMode = "list" | "kanban";

interface MaintenanceState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: TicketFilters;
  setFilter: <K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) => void;
  resetFilters: () => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
}

const DEFAULT_FILTERS: TicketFilters = {
  search: "",
  status: "all",
  category: "all",
  building: "all",
};

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  viewMode: "kanban",
  setViewMode: (mode) => set({ viewMode: mode }),
  filters: { ...DEFAULT_FILTERS },
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
  selectedTicketId: null,
  setSelectedTicketId: (id) => set({ selectedTicketId: id }),
}));
