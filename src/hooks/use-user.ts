"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/providers/supabase-provider";
import { useUserStore } from "@/stores/user-store";

export function useUser() {
  const supabase = useSupabase();
  const { setProfile, setLoading } = useUserStore();

  const { data: user, isLoading: authLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    setProfile(profile ?? null);
    setLoading(authLoading || profileLoading);
  }, [profile, authLoading, profileLoading, setProfile, setLoading]);

  return {
    user,
    profile,
    isLoading: authLoading || profileLoading,
    isAuthenticated: !!user,
  };
}
