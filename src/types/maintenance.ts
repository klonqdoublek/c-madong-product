import type { Database, MaintenanceStatus, TechnicianSpecialty } from "@/lib/supabase/types";

// Row types from Supabase
export type MaintenanceRequest = Database["public"]["Tables"]["maintenance_requests"]["Row"];
export type Technician = Database["public"]["Tables"]["technicians"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// AI Vision fields not yet in generated Supabase types (Phase 4.5 columns)
interface AiVisionFields {
  ai_provider: string | null;
  ai_confidence: number | null;
  template_id: string | null;
  damage_details: string | null;
}

// Ticket with joined relations (for list/detail views)
export interface MaintenanceTicketWithRelations extends MaintenanceRequest, Partial<AiVisionFields> {
  requester?: Pick<Profile, "id" | "full_name_th" | "full_name_en" | "avatar_url" | "room_id" | "building_id"> | null;
  technician?: Pick<Technician, "id" | "display_name" | "specialty"> | null;
  building_name?: string | null;
  room_number?: string | null;
}

// Kanban column definition
export interface KanbanColumn {
  id: MaintenanceStatus;
  labelKey: string;
  color: string;
  bgColor: string;
}

// Filters for list/kanban views
export interface TicketFilters {
  search: string;
  status: MaintenanceStatus | "all";
  category: string | "all";
  building: string | "all";
}

// Valid status transitions
export const STATUS_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  pending: ["acknowledged", "cancelled"],
  acknowledged: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// Re-exports for convenience
export type { MaintenanceStatus, TechnicianSpecialty };
