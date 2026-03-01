import type { Database } from "@/lib/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Building = Database["public"]["Tables"]["buildings"]["Row"];
export type Room = Database["public"]["Tables"]["rooms"]["Row"];
export type Bed = Database["public"]["Tables"]["beds"]["Row"];

export interface StudentWithRelations extends Profile {
  building?: Pick<Building, "id" | "name_th" | "name_en"> | null;
  room?: Pick<Room, "id" | "room_number" | "floor"> | null;
  bed?: Pick<Bed, "id" | "bed_label"> | null;
}

export interface StudentFilters {
  search: string;
  tag: string | "all";
  building: string | "all";
  status: string | "all";
}
