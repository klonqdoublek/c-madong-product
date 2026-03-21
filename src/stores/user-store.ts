import { create } from "zustand";
import type { Database, UserRole } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface UserState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  isAdmin: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  isAdmin: () => {
    const role = get().profile?.role;
    if (!role) return false;
    // Legacy + RBAC roles that should access admin dashboard
    const adminRoles = [
      "admin", "staff",  // legacy
      "super_admin", "head", "registrar", "finance", "parcel",
      "admin_staff", "service", "activity",
      "technician_head", "technician", "technician_it",
      "committee",
    ];
    return adminRoles.includes(role);
  },
}));
