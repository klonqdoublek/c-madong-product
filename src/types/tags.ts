import type { Database } from "@/lib/supabase/types";

export type Tag = Database["public"]["Tables"]["tags"]["Row"];
export type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
export type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export const TAG_COLORS = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
] as const;
